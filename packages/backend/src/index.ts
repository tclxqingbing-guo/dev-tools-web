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
import { miniprogramRouter } from './routes/miniprogram.js'
import { ttsRouter } from './routes/tts.js'

const app = express()
const PORT = process.env.BACKEND_PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api/ai', aiRouter)
app.use('/api/notes', notesRouter)
app.use('/api/wishes', wishesRouter)
app.use('/api/dictionary', dictionaryRouter)
app.use('/api/miniprogram', miniprogramRouter)
app.use('/api/tts', ttsRouter)

app.listen(PORT, () => {
  const hasAi =
    !!(
      process.env.AI_API_BASE_URL &&
      (process.env.AI_API_KEY ||
        process.env['AI_API_KEY-CHAT'] ||
        process.env['AI_API_KEY-IMAGE'])
    )
  console.log(`Backend running on http://localhost:${PORT} | AI API: ${hasAi ? 'configured' : 'not configured'}`)
})
