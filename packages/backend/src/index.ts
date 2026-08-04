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

import express from 'express'
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
