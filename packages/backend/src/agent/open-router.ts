import { randomUUID, timingSafeEqual } from 'node:crypto'
import type { IRouter } from 'express'
import { Router } from 'express'
import { getSettings } from '../services/settings-store.js'
import { query, queryOne } from './db.js'
import { decryptSecret } from './security.js'
import type { AgentMode } from './types.js'

const modes = new Set<AgentMode>(['auto', 'general', 'knowledge', 'agent'])
const calls = new Map<string, { minute: number; count: number }>()

export const agentOpenRouter: IRouter = Router()

/** 使用固定时序比较开放 API Token，并执行进程级分钟限流。 */
async function authenticate(req: any, res: any, next: any) {
  const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  const setting = await queryOne<{ value: { encrypted?: string } }>(`SELECT value FROM agent_setting WHERE key='external.apiToken'`)
  const expected = setting?.value?.encrypted ? decryptSecret(setting.value.encrypted) : String(process.env.AGENT_EXTERNAL_API_TOKEN || '')
  const left = Buffer.from(supplied); const right = Buffer.from(expected)
  if (!expected || left.length !== right.length || !timingSafeEqual(left, right)) return void res.status(401).json({ error: { message: 'API Token 无效', type: 'authentication_error' } })
  const minute = Math.floor(Date.now() / 60_000)
  const key = `${req.ip}:${minute}`; const current = calls.get(key)
  const count = current?.minute === minute ? current.count + 1 : 1
  calls.set(key, { minute, count })
  if (calls.size > 10_000) calls.clear()
  if (count > Number(process.env.AGENT_EXTERNAL_RATE_LIMIT || 30)) return void res.status(429).json({ error: { message: '请求过于频繁', type: 'rate_limit_error' } })
  next()
}

agentOpenRouter.use((req, res, next) => { void authenticate(req, res, next).catch((error) => res.status(503).json({ error: { message: error.message, type: 'service_error' } })) })

agentOpenRouter.get('/models', async (_req, res) => {
  const settings = await queryOne<any>(`SELECT value FROM agent_setting WHERE key='model.name'`)
  res.json({ object: 'list', data: [{ id: settings?.value || process.env.AGENT_MODEL || 'bx-agent', object: 'model', owned_by: 'bx-tools' }] })
})

/** 提供 OpenAI Chat Completions 兼容入口，便于企业微信等服务端客户端接入。 */
agentOpenRouter.post('/chat/completions', async (req, res) => {
  const messages: Array<{ role?: string; content?: unknown }> = Array.isArray(req.body?.messages) ? req.body.messages : []
  const latest = [...messages].reverse().find((item) => item?.role === 'user')
  const question = typeof latest?.content === 'string' ? latest.content.trim() : ''
  if (!question || question.length > 32_000) return void res.status(400).json({ error: { message: '缺少有效用户消息或内容过长', type: 'invalid_request_error' } })

  const mode = modes.has(req.body?.mode) ? req.body.mode as AgentMode : 'auto'
  const configuredModes = await queryOne<{ value: string }>(`SELECT value FROM agent_setting WHERE key='external.allowedModes'`)
  const allowedModes = new Set(String(configuredModes?.value || 'auto,general,knowledge,agent').split(',').map((item) => item.trim()))
  if (!allowedModes.has(mode)) return void res.status(403).json({ error: { message: '该 Agent 模式未对开放 API 启用', type: 'permission_error' } })

  const runId = randomUUID()
  const userId = String(req.headers['x-bx-user-id'] || req.body?.user || '').trim()
  if (!userId) return void res.status(400).json({ error: { message: '缺少 X-BX-User-Id', type: 'invalid_request_error' } })
  const servers = await query<any>(`SELECT name,title,url,encrypted_token AS "encryptedToken",tool_allowlist AS "toolAllowlist",timeout_seconds AS "timeoutSeconds"
    FROM agent_mcp_server WHERE enabled=true AND status='available' ORDER BY name`)
  const ai = await getSettings(['ai.baseUrl', 'ai.chatApiKey', 'ai.sharedApiKey'])
  const settingRows = await query<{ key: string; value: any }>(`SELECT key,value FROM agent_setting`)
  const settings = Object.fromEntries(settingRows.map((item) => [item.key, item.value]))
  if (settings['search.tavilyKey']?.encrypted) settings['search.tavilyKey'] = decryptSecret(settings['search.tavilyKey'].encrypted)
  const controller = new AbortController()
  res.on('close', () => { if (!res.writableEnded) controller.abort() })
  await query(`INSERT INTO agent_audit_log(user_id,action,target,detail) VALUES($1,'agent.open_api.run',$2,$3)`, [userId, runId, JSON.stringify({ mode })])

  try {
    const runtime = await fetch(`${process.env.AGENT_SERVICE_URL || 'http://agent-service:8200'}/agent/stream`, {
      method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runId, conversationId: `open-api:${runId}`, question, mode,
        user: { id: userId, name: String(req.headers['x-bx-user-name'] || userId), roles: [] },
        history: messages.slice(0, -1).filter((item) => item.role === 'user' || item.role === 'assistant').map((item) => ({ role: item.role, content: String(item.content || '') })).slice(-20),
        attachments: [], settings,
        mcpServers: servers.map((server) => ({ ...server, token: decryptSecret(server.encryptedToken), encryptedToken: undefined })),
        gateway: { baseURL: ai['ai.baseUrl'], apiKey: ai['ai.chatApiKey'] || ai['ai.sharedApiKey'], model: settings['model.name'] || process.env.AGENT_MODEL || '' },
      }),
    })
    if (!runtime.ok || !runtime.body) throw new Error(`Agent Runtime 不可用: ${runtime.status}`)
    if (req.body?.stream === true) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8'); res.setHeader('Cache-Control', 'no-cache, no-transform'); res.flushHeaders()
    }
    const reader = runtime.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let answer = ''; let usage: any = undefined
    while (true) {
      const { done, value } = await reader.read(); if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n'); buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        const event = JSON.parse(line)
        if (event.type === 'error') throw new Error(event.message || 'Agent 执行失败')
        if (event.type === 'context_usage') usage = event.usage
        if (event.type !== 'delta') continue
        answer += event.content || ''
        if (req.body?.stream === true) res.write(`data: ${JSON.stringify({ id: runId, object: 'chat.completion.chunk', choices: [{ index: 0, delta: { content: event.content || '' }, finish_reason: null }] })}\n\n`)
      }
    }
    if (req.body?.stream === true) {
      res.write(`data: ${JSON.stringify({ id: runId, object: 'chat.completion.chunk', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }], usage })}\n\n`)
      res.write('data: [DONE]\n\n'); return void res.end()
    }
    res.json({ id: runId, object: 'chat.completion', model: settings['model.name'] || 'bx-agent', choices: [{ index: 0, message: { role: 'assistant', content: answer }, finish_reason: 'stop' }], usage })
  } catch (error) {
    if (res.headersSent) { res.write(`data: ${JSON.stringify({ error: { message: (error as Error).message, type: 'agent_error' } })}\n\n`); return void res.end() }
    res.status(502).json({ error: { message: (error as Error).message, type: 'agent_error' } })
  }
})
