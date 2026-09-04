import { performance } from 'node:perf_hooks'
import { assertAllowedServiceUrl, decryptSecret } from './security.js'

interface McpServerRow {
  id: string
  name: string
  url: string
  encrypted_token?: string
  timeout_seconds: number
}

async function rpc(server: McpServerRow, method: string, params?: unknown): Promise<{ result?: any; error?: any }> {
  const url = assertAllowedServiceUrl(server.url)
  const token = decryptSecret(server.encrypted_token)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: `${Date.now()}-${method}`, method, params: params || {} }),
    signal: AbortSignal.timeout(Math.max(1, server.timeout_seconds || 20) * 1000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const type = response.headers.get('content-type') || ''
  if (type.includes('text/event-stream')) {
    const match = (await response.text()).match(/data:\s*(\{[^\n]+\})/)
    if (!match) throw new Error('MCP SSE 响应为空')
    return JSON.parse(match[1])
  }
  return await response.json() as { result?: any; error?: any }
}

/** 探测远程 MCP 并读取唯一工具目录。 */
export async function probeMcp(server: McpServerRow): Promise<{ status: string; latencyMs: number; tools: any[]; error?: string }> {
  const started = performance.now()
  try {
    const initialized = await rpc(server, 'initialize', {
      protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'bx-tools', version: '1.0.0' },
    })
    if (initialized.error) throw new Error(initialized.error.message || 'MCP initialize 失败')
    const listed = await rpc(server, 'tools/list')
    if (listed.error) throw new Error(listed.error.message || 'MCP tools/list 失败')
    return { status: 'available', latencyMs: Math.round(performance.now() - started), tools: listed.result?.tools || [] }
  } catch (error) {
    return { status: 'unavailable', latencyMs: Math.round(performance.now() - started), tools: [], error: String((error as Error).message).slice(0, 500) }
  }
}
