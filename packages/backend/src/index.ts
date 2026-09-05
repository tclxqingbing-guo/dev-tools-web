import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const candidates = [
  resolve(__dirname, '../../../.env'),
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../.env'),
  resolve(process.cwd(), '../../.env'),
]
for (const p of candidates) {
  if (existsSync(p)) {
    config({ path: p })
    break
  }
}

import express, { type ErrorRequestHandler } from 'express'
import cors from 'cors'
import { aiRouter } from './routes/ai.js'
import { notesRouter } from './routes/notes.js'
import { wishesRouter } from './routes/wishes.js'
import { dictionaryRouter } from './routes/dictionary.js'
import { ttsRouter } from './routes/tts.js'
import { mockRouter } from './routes/mock.js'
import { settingsRouter } from './routes/settings.js'
import { miniProgramQrCodeRouter } from './routes/mini-program-qrcode.js'
import { miniProgramProxyRouter } from './routes/mini-program-proxy.js'
import { agentAuthRouter } from './agent/auth-router.js'
import { agentAdminRouter, agentRouter } from './agent/router.js'
import { initAgentDb } from './agent/db.js'
import { codeGraphAdminRouter, codeGraphMcpRouter } from './codegraph/router.js'
import { seedMcpServers, startAttachmentCleanup, startMcpHealthChecks } from './agent/bootstrap.js'
import { agentOpenRouter } from './agent/open-router.js'

const app = express()
const PORT = process.env.BACKEND_PORT || 3001

app.use(cors())
// 网关需要读取原始表单请求体，因此必须放在全局 JSON body parser 之前。
app.use('/mini-proxy', miniProgramProxyRouter)
app.use('/', miniProgramProxyRouter)
app.use(express.json({ limit: '50mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api/ai', aiRouter)
app.use('/api/notes', notesRouter)
app.use('/api/wishes', wishesRouter)
app.use('/api/dictionary', dictionaryRouter)
app.use('/api/tts', ttsRouter)
app.use('/api/mock', mockRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/mini-program-qrcode', miniProgramQrCodeRouter)
app.use('/api/auth', agentAuthRouter)
app.use('/api/agent', agentRouter)
app.use('/api/open/agent/v1', agentOpenRouter)
app.use('/api/admin', agentAdminRouter)
app.use('/api/admin/codegraph', codeGraphAdminRouter)
app.use('/api/mcp/codegraph', codeGraphMcpRouter)

/** 将请求体解析错误统一转换为 JSON，方便开放 API 客户端稳定处理。 */
const jsonErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    if (req.originalUrl.startsWith('/api/open/agent/')) {
      res.status(400).json({ error: { message: '请求 JSON 格式无效', type: 'invalid_request_error' } })
    } else {
      res.status(400).json({ detail: '请求 JSON 格式无效' })
    }
    return
  }
  next(error)
}
app.use(jsonErrorHandler)

initAgentDb()
  .then(seedMcpServers)
  .then(() => app.listen(PORT, () => {
    startMcpHealthChecks()
    startAttachmentCleanup()
    console.log(`Backend running on http://localhost:${PORT}`)
  }))
  .catch((error) => {
    console.error(`Agent database initialization failed: ${(error as Error).message}`)
    process.exitCode = 1
  })
