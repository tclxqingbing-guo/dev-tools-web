import type { IRouter } from 'express'
import { Router } from 'express'
import { requireAdmin } from '../agent/security.js'
import type { AuthenticatedRequest } from '../agent/types.js'
import { codeGraphService } from './service.js'

export const codeGraphAdminRouter: IRouter = Router()
codeGraphAdminRouter.use(requireAdmin)

codeGraphAdminRouter.get('/repositories', async (_req, res) => res.json(await codeGraphService.listRepositories()))
codeGraphAdminRouter.post('/sync', async (req, res) => {
  try { res.status(202).json(await codeGraphService.trigger(req.body?.projectId)) }
  catch (error) { res.status(400).json({ detail: (error as Error).message }) }
})
codeGraphAdminRouter.get('/tree/:projectId', async (req, res) => res.json(await codeGraphService.tree(req.params.projectId)))
codeGraphAdminRouter.post('/query', async (req, res) => res.json(await codeGraphService.queryRelations(String(req.body?.symbol || ''), req.body?.projectId)))

const toolDefinitions = [
  { name: 'codegraph.list_repositories', description: '列出公共系统已同步的代码仓库及精确版本。', inputSchema: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] } },
  { name: 'codegraph.search_code', description: '在指定不可变仓库快照中搜索实际代码。', inputSchema: { type: 'object', properties: { reason: { type: 'string' }, projectId: { type: 'string' }, query: { type: 'string' }, maxResults: { type: 'integer' } }, required: ['reason', 'projectId', 'query'] } },
  { name: 'codegraph.list_files', description: '列出不可变仓库快照中的文件。', inputSchema: { type: 'object', properties: { reason: { type: 'string' }, projectId: { type: 'string' }, pattern: { type: 'string' } }, required: ['reason', 'projectId'] } },
  { name: 'codegraph.read_file', description: '按真实行号读取不可变仓库快照文件。', inputSchema: { type: 'object', properties: { reason: { type: 'string' }, projectId: { type: 'string' }, path: { type: 'string' }, startLine: { type: 'integer' }, endLine: { type: 'integer' } }, required: ['reason', 'projectId', 'path'] } },
  { name: 'codegraph.query_relations', description: '查询代码符号的一跳导入或包含关系。', inputSchema: { type: 'object', properties: { reason: { type: 'string' }, symbol: { type: 'string' }, projectId: { type: 'string' } }, required: ['reason', 'symbol'] } },
  { name: 'codegraph.git_history', description: '读取仓库或文件最近 Git 提交历史。', inputSchema: { type: 'object', properties: { reason: { type: 'string' }, projectId: { type: 'string' }, path: { type: 'string' } }, required: ['reason', 'projectId'] } },
  { name: 'codegraph.git_diff', description: '比较仓库中两个 Git ref。', inputSchema: { type: 'object', properties: { reason: { type: 'string' }, projectId: { type: 'string' }, base: { type: 'string' }, target: { type: 'string' }, path: { type: 'string' } }, required: ['reason', 'projectId', 'base'] } },
]

async function callTool(name: string, args: any): Promise<any> {
  if (name === 'codegraph.list_repositories') return codeGraphService.listRepositories()
  if (name === 'codegraph.search_code') return codeGraphService.searchCode(args.projectId, args.query, args.maxResults)
  if (name === 'codegraph.list_files') return codeGraphService.listFiles(args.projectId, args.pattern)
  if (name === 'codegraph.read_file') return codeGraphService.readFile(args.projectId, args.path, args.startLine, args.endLine)
  if (name === 'codegraph.query_relations') return codeGraphService.queryRelations(args.symbol, args.projectId)
  if (name === 'codegraph.git_history') return codeGraphService.history(args.projectId, args.path)
  if (name === 'codegraph.git_diff') return codeGraphService.diff(args.projectId, args.base, args.target, args.path)
  throw new Error(`未开放的 Code Graph 工具: ${name}`)
}

/** 公共 Code Graph MCP，可供统一 Agent、知识库和监控复用。 */
export const codeGraphMcpRouter: IRouter = Router()
codeGraphMcpRouter.post('/', async (req: AuthenticatedRequest, res) => {
  const expected = String(process.env.CODEGRAPH_MCP_TOKEN || '')
  const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!expected || supplied !== expected) return void res.status(401).json({ error: { code: -32001, message: 'Code Graph MCP 服务令牌无效' } })
  const rpc = req.body || {}; const reply = (result?: any, error?: any) => ({ jsonrpc: '2.0', id: rpc.id ?? null, ...(error ? { error } : { result }) })
  try {
    if (rpc.method === 'initialize') return void res.json(reply({ protocolVersion: '2025-03-26', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'bx-codegraph', version: '1.0.0' } }))
    if (rpc.method === 'ping' || rpc.method === 'initialized' || rpc.method === 'notifications/initialized') return void res.json(reply({}))
    if (rpc.method === 'tools/list') return void res.json(reply({ tools: toolDefinitions }))
    if (rpc.method === 'tools/call') {
      const value = await callTool(String(rpc.params?.name || ''), rpc.params?.arguments || {})
      return void res.json(reply({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }], structuredContent: typeof value === 'object' ? value : undefined }))
    }
    res.json(reply(undefined, { code: -32601, message: `Method not found: ${rpc.method}` }))
  } catch (error) { res.json(reply(undefined, { code: -32603, message: (error as Error).message })) }
})
