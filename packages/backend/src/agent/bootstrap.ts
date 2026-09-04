import { query } from './db.js'
import { encryptSecret } from './security.js'
import { probeMcp } from './mcp.js'
import { promises as fs } from 'node:fs'

/** 按部署环境预置内部领域 MCP；管理员后续可在页面调整。 */
export async function seedMcpServers(): Promise<void> {
  const servers = [
    { name: 'codegraph', title: '公共 Code Graph', url: process.env.CODEGRAPH_MCP_URL || 'http://backend:3001/api/mcp/codegraph', token: process.env.CODEGRAPH_MCP_TOKEN || '' },
    { name: 'knowledge', title: '知识库', url: process.env.KNOWLEDGE_MCP_URL || '', token: process.env.KNOWLEDGE_MCP_TOKEN || '' },
    { name: 'monitor', title: '监控系统', url: process.env.MONITOR_MCP_URL || '', token: process.env.MONITOR_MCP_TOKEN || '' },
  ]
  for (const server of servers.filter((item) => item.url && item.token)) {
    await query(`INSERT INTO agent_mcp_server(name,title,url,encrypted_token,purpose)
      VALUES($1,$2,$3,$4,$5) ON CONFLICT(name) DO NOTHING`, [
      server.name, server.title, server.url, encryptSecret(server.token), `${server.title}只读领域能力`,
    ])
  }
}

let probing = false

/** 周期探测所有启用的 MCP，故障只更新能力状态，不影响网关进程。 */
export function startMcpHealthChecks(): void {
  const run = async () => {
    if (probing) return
    probing = true
    try {
      const servers = await query<any>('SELECT id,name,url,encrypted_token,timeout_seconds FROM agent_mcp_server WHERE enabled=true')
      for (const server of servers) {
        const result = await probeMcp(server)
        await query(`UPDATE agent_mcp_server SET status=$2,latency_ms=$3,last_error=$4,tools=$5,checked_at=now() WHERE id=$1`,
          [server.id, result.status, result.latencyMs, result.error || null, JSON.stringify(result.tools)])
      }
    } catch (error) { console.warn(`MCP health check failed: ${(error as Error).message}`) }
    finally { probing = false }
  }
  void run()
  setInterval(run, Number(process.env.MCP_HEALTH_INTERVAL_SECONDS || 60) * 1000).unref()
}

/** 清理上传后未绑定会话且超过 24 小时的临时附件。 */
export function startAttachmentCleanup(): void {
  const run = async () => {
    try {
      const expired = await query<{ storage_path: string; parsed_text_path?: string }>(`DELETE FROM agent_attachment
        WHERE conversation_id IS NULL AND created_at < now() - interval '24 hours' RETURNING storage_path,parsed_text_path`)
      await Promise.all(expired.flatMap((item) => [item.storage_path, item.parsed_text_path].filter(Boolean).map((file) => fs.rm(file!, { force: true }))))
    } catch (error) { console.warn(`Attachment cleanup failed: ${(error as Error).message}`) }
  }
  void run()
  setInterval(run, 60 * 60 * 1000).unref()
}
