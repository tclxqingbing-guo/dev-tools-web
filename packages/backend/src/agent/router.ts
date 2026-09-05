import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { IRouter, Response } from 'express'
import { Router } from 'express'
import multer from 'multer'
import { getSettings } from '../services/settings-store.js'
import { query, queryOne } from './db.js'
import { probeMcp } from './mcp.js'
import { assertAllowedServiceUrl, decryptSecret, encryptSecret, requireAdmin, requireAuth } from './security.js'
import type { AgentMode, AuthenticatedRequest } from './types.js'

const dataRoot = path.resolve(process.env.AGENT_DATA_DIR || '/app/data/agent')
const attachmentRoot = path.join(dataRoot, 'attachments')
const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, callback) => {
      await fs.mkdir(attachmentRoot, { recursive: true })
      callback(null, attachmentRoot)
    },
    filename: (_req, file, callback) => callback(null, `${randomUUID()}${path.extname(file.originalname).slice(0, 12)}`),
  }),
  limits: { fileSize: Number(process.env.AGENT_MAX_UPLOAD_MB || 50) * 1024 * 1024, files: 10 },
})

const activeRuns = new Map<string, AbortController>()
const modes = new Set<AgentMode>(['auto', 'general', 'knowledge', 'agent'])

export const agentRouter: IRouter = Router()
export const agentAdminRouter: IRouter = Router()
agentRouter.use(requireAuth)
agentAdminRouter.use(requireAdmin)

function user(req: AuthenticatedRequest) { return req.agentUser! }
function parseLimit(value: unknown, fallback = 30, max = 100): number {
  return Math.min(max, Math.max(1, Number(value) || fallback))
}
function sendSse(res: Response, event: unknown): void { res.write(`data: ${JSON.stringify(event)}\n\n`) }

agentRouter.get('/capabilities', async (req: AuthenticatedRequest, res) => {
  const servers = await query<any>(`SELECT name,title,status,latency_ms,last_error AS "lastError","tools" FROM agent_mcp_server WHERE enabled=true ORDER BY name`)
  res.json({
    user: user(req), modes: [...modes], streamEvents: [
      'message_started', 'progress', 'tool_started', 'tool_finished', 'tool_failed', 'source',
      'context_usage', 'delta', 'artifact', 'done', 'error', 'heartbeat',
    ],
    coreTools: ['web.search', 'web.read', 'document.read', 'document.compare', 'sandbox.execute'],
    mcpServers: servers,
  })
})

agentRouter.get('/conversations', async (req: AuthenticatedRequest, res) => {
  const rows = await query(`SELECT id,title,mode,created_at AS "createdAt",updated_at AS "updatedAt"
    FROM agent_conversation WHERE user_id=$1 ORDER BY updated_at DESC LIMIT $2`, [user(req).id, parseLimit(req.query.limit)])
  res.json(rows)
})

agentRouter.post('/conversations', async (req: AuthenticatedRequest, res) => {
  const mode = modes.has(req.body?.mode) ? req.body.mode : 'auto'
  const row = await queryOne(`INSERT INTO agent_conversation(user_id,title,mode) VALUES($1,$2,$3)
    RETURNING id,title,mode,created_at AS "createdAt",updated_at AS "updatedAt"`, [user(req).id, String(req.body?.title || '新会话').slice(0, 80), mode])
  res.status(201).json(row)
})

agentRouter.get('/conversations/:id', async (req: AuthenticatedRequest, res) => {
  const conversation = await queryOne<any>(`SELECT id,title,mode,created_at AS "createdAt",updated_at AS "updatedAt"
    FROM agent_conversation WHERE id=$1 AND user_id=$2`, [req.params.id, user(req).id])
  if (!conversation) return void res.status(404).json({ detail: '会话不存在' })
  conversation.messages = await query(`SELECT id,role,content,status,run_id AS "runId",sources,trace,usage,created_at AS "createdAt"
    FROM agent_message WHERE conversation_id=$1 ORDER BY created_at`, [req.params.id])
  conversation.attachments = await query(`SELECT id,filename,mime_type AS "mimeType",size_bytes AS "sizeBytes",status,error,created_at AS "createdAt"
    FROM agent_attachment WHERE conversation_id=$1 AND user_id=$2 ORDER BY created_at`, [req.params.id, user(req).id])
  res.json(conversation)
})

agentRouter.patch('/conversations/:id', async (req: AuthenticatedRequest, res) => {
  const mode = modes.has(req.body?.mode) ? req.body.mode : null
  const row = await queryOne(`UPDATE agent_conversation SET title=COALESCE($3,title),mode=COALESCE($4,mode),updated_at=now()
    WHERE id=$1 AND user_id=$2 RETURNING id,title,mode,updated_at AS "updatedAt"`, [req.params.id, user(req).id, req.body?.title ? String(req.body.title).slice(0, 80) : null, mode])
  if (!row) return void res.status(404).json({ detail: '会话不存在' })
  res.json(row)
})

agentRouter.delete('/conversations/:id', async (req: AuthenticatedRequest, res) => {
  const files = await query<{ storage_path: string; parsed_text_path?: string }>(`SELECT storage_path,parsed_text_path FROM agent_attachment
    WHERE conversation_id=$1 AND user_id=$2`, [req.params.id, user(req).id])
  const result = await query(`DELETE FROM agent_conversation WHERE id=$1 AND user_id=$2 RETURNING id`, [req.params.id, user(req).id])
  if (!result.length) return void res.status(404).json({ detail: '会话不存在' })
  await Promise.all(files.flatMap((item) => [item.storage_path, item.parsed_text_path].filter(Boolean).map((file) => fs.rm(file!, { force: true }))))
  res.status(204).end()
})

agentRouter.post('/attachments', upload.array('files', 10), async (req: AuthenticatedRequest, res) => {
  const conversationId = String(req.body?.conversationId || '')
  const owner = await queryOne(`SELECT id FROM agent_conversation WHERE id=$1 AND user_id=$2`, [conversationId, user(req).id])
  const files = (req.files || []) as Express.Multer.File[]
  if (!owner) {
    await Promise.all(files.map((file) => fs.rm(file.path, { force: true })))
    return void res.status(404).json({ detail: '会话不存在' })
  }
  const saved = []
  for (const file of files) {
    saved.push(await queryOne(`INSERT INTO agent_attachment(user_id,conversation_id,filename,mime_type,size_bytes,storage_path)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING id,filename,mime_type AS "mimeType",size_bytes AS "sizeBytes",status`,
      [user(req).id, conversationId, path.basename(file.originalname).slice(0, 200), file.mimetype, file.size, file.path]))
  }
  res.status(201).json(saved)
})

agentRouter.delete('/attachments/:id', async (req: AuthenticatedRequest, res) => {
  const item = await queryOne<{ storage_path: string; parsed_text_path?: string }>(`DELETE FROM agent_attachment WHERE id=$1 AND user_id=$2
    RETURNING storage_path,parsed_text_path`, [req.params.id, user(req).id])
  if (!item) return void res.status(404).json({ detail: '附件不存在' })
  await Promise.all([item.storage_path, item.parsed_text_path].filter(Boolean).map((file) => fs.rm(file!, { force: true })))
  res.status(204).end()
})

agentRouter.get('/attachments/:id', async (req: AuthenticatedRequest, res) => {
  const item = await queryOne<{ storage_path: string; filename: string; mime_type: string }>(`SELECT storage_path,filename,mime_type FROM agent_attachment
    WHERE id=$1 AND user_id=$2`, [req.params.id, user(req).id])
  if (!item) return void res.status(404).json({ detail: '附件不存在' })
  try { await fs.access(item.storage_path) } catch { return void res.status(410).json({ detail: '附件文件已被清理' }) }
  res.setHeader('Content-Type', item.mime_type || 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(item.filename)}`)
  createReadStream(item.storage_path).pipe(res)
})

agentRouter.post('/conversations/:id/messages/stream', async (req: AuthenticatedRequest, res) => {
  const conversation = await queryOne<any>(`SELECT id,title,mode FROM agent_conversation WHERE id=$1 AND user_id=$2`, [req.params.id, user(req).id])
  if (!conversation) return void res.status(404).json({ detail: '会话不存在' })
  const question = String(req.body?.message || '').trim()
  if (!question) return void res.status(400).json({ detail: '消息不能为空' })
  const mode: AgentMode = modes.has(req.body?.mode) ? req.body.mode : conversation.mode
  const runId = randomUUID()
  const userMessage = await queryOne<any>(`INSERT INTO agent_message(conversation_id,role,content,run_id) VALUES($1,'user',$2,$3) RETURNING id`, [conversation.id, question, runId])
  const assistant = await queryOne<any>(`INSERT INTO agent_message(conversation_id,role,content,status,run_id) VALUES($1,'assistant','','streaming',$2) RETURNING id`, [conversation.id, runId])
  await query(`INSERT INTO agent_run(run_id,conversation_id,user_id,mode) VALUES($1,$2,$3,$4)`, [runId, conversation.id, user(req).id, mode])
  await query(`UPDATE agent_conversation SET updated_at=now(),title=CASE WHEN title='新会话' THEN left($2,20) ELSE title END WHERE id=$1`, [conversation.id, question])

  res.status(200)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
  sendSse(res, { type: 'message_started', runId, conversationId: conversation.id, userMessageId: userMessage?.id, messageId: assistant?.id })

  const controller = new AbortController()
  activeRuns.set(assistant.id, controller)
  res.on('close', () => { if (!res.writableEnded) controller.abort() })
  let answer = ''
  const trace: any[] = []
  const sources: any[] = []
  let usage: Record<string, unknown> = {}
  let heartbeat: NodeJS.Timeout | undefined
  let firstTokenSeen = false
  try {
    heartbeat = setInterval(() => sendSse(res, { type: 'heartbeat', runId }), 10_000)
    const history = await query<any>(`SELECT role,content FROM agent_message WHERE conversation_id=$1 AND id<>$2 AND status='completed' ORDER BY created_at DESC LIMIT 20`, [conversation.id, assistant.id])
    const attachments = await query<any>(`SELECT id,filename,mime_type AS "mimeType",storage_path AS "storagePath",parsed_text_path AS "parsedTextPath"
      FROM agent_attachment WHERE conversation_id=$1 AND user_id=$2`, [conversation.id, user(req).id])
    const servers = await query<any>(`SELECT id,name,title,url,encrypted_token AS "encryptedToken",tool_allowlist AS "toolAllowlist",timeout_seconds AS "timeoutSeconds"
      FROM agent_mcp_server WHERE enabled=true AND status='available' ORDER BY name`)
    const ai = await getSettings(['ai.baseUrl', 'ai.chatApiKey', 'ai.sharedApiKey'])
    const settings = await queryOne<any>(`SELECT jsonb_object_agg(key,value) AS value FROM agent_setting`)
    const runtimeSettings = { ...(settings?.value || {}) }
    if (runtimeSettings['search.tavilyKey']?.encrypted) runtimeSettings['search.tavilyKey'] = decryptSecret(runtimeSettings['search.tavilyKey'].encrypted)
    const runtime = await fetch(`${process.env.AGENT_SERVICE_URL || 'http://agent-service:8200'}/agent/stream`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({
        runId, conversationId: conversation.id, user: user(req), question, mode,
        history: history.reverse(), attachments,
        mcpServers: servers.map((server) => ({ ...server, token: decryptSecret(server.encryptedToken), encryptedToken: undefined })),
        gateway: { baseURL: ai['ai.baseUrl'], apiKey: ai['ai.chatApiKey'] || ai['ai.sharedApiKey'], model: settings?.value?.['model.name'] || process.env.AGENT_MODEL || '' },
        settings: runtimeSettings,
      }),
    })
    if (!runtime.ok || !runtime.body) throw new Error(`Agent Runtime 不可用: ${runtime.status}`)
    const reader = runtime.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n'); buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        const event = JSON.parse(line)
        if (event.type === 'error') throw new Error(event.message || 'Agent 执行失败')
        if (event.type === 'delta') {
          answer += event.content || ''
          if (!firstTokenSeen) {
            firstTokenSeen = true
            await query(`UPDATE agent_run SET first_token_at=now() WHERE run_id=$1`, [runId])
          }
        }
        if (event.type?.startsWith('tool_') || event.type === 'progress') trace.push(event)
        if (event.type === 'source') sources.push(event.source)
        if (event.type === 'context_usage') usage = event.usage || {}
        if (event.type === 'artifact') {
          const artifactPath = path.resolve(String(event.storagePath || ''))
          const artifactBase = path.resolve(dataRoot, 'artifacts') + path.sep
          if (!artifactPath.startsWith(artifactBase)) throw new Error('Agent Runtime 返回了非法产物路径')
          const artifact = await queryOne<any>(`INSERT INTO agent_attachment(user_id,conversation_id,filename,mime_type,size_bytes,storage_path,status)
            VALUES($1,$2,$3,$4,$5,$6,'generated') RETURNING id,filename,mime_type AS "mimeType",size_bytes AS "sizeBytes",status`, [
            user(req).id, conversation.id, path.basename(String(event.filename || 'artifact')).slice(0, 200),
            String(event.mimeType || 'application/octet-stream'), Number(event.sizeBytes || 0), artifactPath,
          ])
          delete event.storagePath
          event.attachmentId = artifact.id
          event.downloadUrl = `/api/agent/attachments/${artifact.id}`
        }
        sendSse(res, event)
      }
    }
    await query(`UPDATE agent_message SET content=$2,status='completed',sources=$3,trace=$4,usage=$5 WHERE id=$1`, [assistant.id, answer, JSON.stringify(sources), JSON.stringify(trace), JSON.stringify(usage)])
    await query(`UPDATE agent_run SET status='completed',tool_count=$2,finished_at=now(),duration_ms=round(extract(epoch FROM (now()-started_at))*1000) WHERE run_id=$1`, [runId, trace.filter((event) => event.type === 'tool_started').length])
    sendSse(res, { type: 'done', runId, messageId: assistant.id })
  } catch (error) {
    const cancelled = controller.signal.aborted
    await query(`UPDATE agent_message SET content=$2,status=$3,trace=$4 WHERE id=$1`, [assistant.id, answer || (cancelled ? '（已取消）' : ''), cancelled ? 'cancelled' : 'failed', JSON.stringify(trace)])
    await query(`UPDATE agent_run SET status=$2,tool_count=$3,finished_at=now(),duration_ms=round(extract(epoch FROM (now()-started_at))*1000),error=$4 WHERE run_id=$1`, [runId, cancelled ? 'cancelled' : 'failed', trace.filter((event) => event.type === 'tool_started').length, cancelled ? null : (error as Error).message])
    if (!res.writableEnded) sendSse(res, { type: 'error', runId, message: cancelled ? '生成已取消' : (error as Error).message })
  } finally {
    if (heartbeat) clearInterval(heartbeat)
    activeRuns.delete(assistant.id)
    res.end()
  }
})

agentRouter.post('/conversations/:id/messages/:messageId/cancel', async (req: AuthenticatedRequest, res) => {
  const message = await queryOne(`SELECT m.id FROM agent_message m JOIN agent_conversation c ON c.id=m.conversation_id
    WHERE m.id=$1 AND c.id=$2 AND c.user_id=$3`, [req.params.messageId, req.params.id, user(req).id])
  if (!message) return void res.status(404).json({ detail: '消息不存在' })
  const controller = activeRuns.get(String(req.params.messageId))
  if (!controller) return void res.status(409).json({ detail: '生成任务不在当前进程中' })
  controller.abort(); res.status(202).json({ accepted: true })
})

agentAdminRouter.get('/mcp/servers', async (_req, res) => {
  const rows = await query(`SELECT id,name,title,url,enabled,purpose,encrypted_token IS NOT NULL AS "tokenConfigured",
    tool_allowlist AS "toolAllowlist",timeout_seconds AS "timeoutSeconds",status,latency_ms AS "latencyMs",last_error AS "lastError",tools,checked_at AS "checkedAt"
    FROM agent_mcp_server ORDER BY name`)
  res.json(rows)
})

agentAdminRouter.post('/mcp/servers', async (req: AuthenticatedRequest, res) => {
  try {
    assertAllowedServiceUrl(String(req.body?.url || ''))
    const row = await queryOne<{ id: string }>(`INSERT INTO agent_mcp_server(name,title,url,enabled,purpose,encrypted_token,tool_allowlist,timeout_seconds)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,name,title,url,enabled,status`, [
      String(req.body.name || '').trim(), String(req.body.title || req.body.name || '').trim(), String(req.body.url), req.body.enabled !== false,
      String(req.body.purpose || ''), req.body.token ? encryptSecret(String(req.body.token)) : null,
      JSON.stringify(Array.isArray(req.body.toolAllowlist) ? req.body.toolAllowlist : []), parseLimit(req.body.timeoutSeconds, 20, 120),
    ])
    await query(`INSERT INTO agent_audit_log(user_id,action,target) VALUES($1,'mcp.create',$2)`, [user(req).id, row?.id])
    res.status(201).json(row)
  } catch (error) { res.status(400).json({ detail: (error as Error).message }) }
})

agentAdminRouter.patch('/mcp/servers/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (req.body.url) assertAllowedServiceUrl(String(req.body.url))
    const token = req.body.token ? encryptSecret(String(req.body.token)) : null
    const row = await queryOne(`UPDATE agent_mcp_server SET title=COALESCE($2,title),url=COALESCE($3,url),enabled=COALESCE($4,enabled),
      purpose=COALESCE($5,purpose),encrypted_token=COALESCE($6,encrypted_token),tool_allowlist=COALESCE($7,tool_allowlist),
      timeout_seconds=COALESCE($8,timeout_seconds),updated_at=now() WHERE id=$1 RETURNING id,name,title,url,enabled,status`, [
      req.params.id, req.body.title ?? null, req.body.url ?? null, req.body.enabled ?? null, req.body.purpose ?? null, token,
      req.body.toolAllowlist ? JSON.stringify(req.body.toolAllowlist) : null, req.body.timeoutSeconds ?? null,
    ])
    if (!row) return void res.status(404).json({ detail: 'MCP 服务不存在' })
    await query(`INSERT INTO agent_audit_log(user_id,action,target) VALUES($1,'mcp.update',$2)`, [user(req).id, req.params.id])
    res.json(row)
  } catch (error) { res.status(400).json({ detail: (error as Error).message }) }
})

agentAdminRouter.post('/mcp/servers/:id/probe', async (req: AuthenticatedRequest, res) => {
  const server = await queryOne<any>(`SELECT id,name,url,encrypted_token,timeout_seconds FROM agent_mcp_server WHERE id=$1`, [req.params.id])
  if (!server) return void res.status(404).json({ detail: 'MCP 服务不存在' })
  const result = await probeMcp(server)
  await query(`UPDATE agent_mcp_server SET status=$2,latency_ms=$3,last_error=$4,tools=$5,checked_at=now(),updated_at=now() WHERE id=$1`,
    [server.id, result.status, result.latencyMs, result.error || null, JSON.stringify(result.tools)])
  await query(`INSERT INTO agent_audit_log(user_id,action,target,detail) VALUES($1,'mcp.probe',$2,$3)`, [user(req).id, server.id, JSON.stringify({ status: result.status })])
  res.json(result)
})

agentAdminRouter.delete('/mcp/servers/:id', async (req: AuthenticatedRequest, res) => {
  await query(`DELETE FROM agent_mcp_server WHERE id=$1`, [req.params.id])
  await query(`INSERT INTO agent_audit_log(user_id,action,target) VALUES($1,'mcp.delete',$2)`, [user(req).id, req.params.id])
  res.status(204).end()
})

agentAdminRouter.get('/agent/settings', async (_req, res) => {
  const rows = await query<{ key: string; value: any }>(`SELECT key,value FROM agent_setting ORDER BY key`)
  const sensitive = new Set(['search.tavilyKey', 'codegraph.gitlabToken', 'external.apiToken'])
  res.json(Object.fromEntries(rows.map((item) => [item.key, sensitive.has(item.key) ? '' : item.value])))
})

agentAdminRouter.get('/agent/metrics', async (_req, res) => {
  const summary = await queryOne<Record<string, number>>(`SELECT count(*)::int AS runs,
    count(*) FILTER (WHERE status='completed')::int AS completed,
    count(*) FILTER (WHERE status='failed')::int AS failed,
    coalesce(round(avg(duration_ms))::int,0) AS "averageDurationMs",
    coalesce(round(avg(extract(epoch FROM (first_token_at-started_at))*1000))::int,0) AS "averageFirstTokenMs",
    coalesce(sum(tool_count),0)::int AS "toolCalls"
    FROM agent_run WHERE started_at >= now()-interval '24 hours'`)
  res.json({ window: '24h', ...(summary || {}) })
})

agentAdminRouter.put('/agent/settings', async (req: AuthenticatedRequest, res) => {
  const allowed = new Set(['model.name','model.temperature','model.maxTokens','search.primary','search.fallback','search.searxngUrl','search.searxngEngines','search.tavilyKey','search.maxResults','search.timeoutSeconds','search.allowedDomains','search.blockedDomains','external.apiToken','external.allowedModes','agent.maxRounds','agent.maxDurationSeconds','agent.contextWindow','sandbox.timeoutSeconds','sandbox.memoryMb','sandbox.cpus','sandbox.pids','sandbox.outputMb','codegraph.gitlabUrl','codegraph.gitlabToken','codegraph.projects','codegraph.branch'])
  for (const [key, value] of Object.entries(req.body?.values || {})) {
    if (!allowed.has(key)) continue
    if ((key.endsWith('Key') || key.endsWith('Token')) && !value) continue
    const stored = (key.endsWith('Key') || key.endsWith('Token')) && value ? { encrypted: encryptSecret(String(value)) } : value
    await query(`INSERT INTO agent_setting(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=now()`, [key, JSON.stringify(stored)])
  }
  await query(`INSERT INTO agent_audit_log(user_id,action) VALUES($1,'agent.settings.update')`, [user(req).id])
  res.json({ success: true })
})
