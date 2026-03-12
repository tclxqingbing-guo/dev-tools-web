import type { IRouter } from 'express'
import { Router } from 'express'

export const aiRouter: IRouter = Router()

const getBaseUrl = () => {
  let baseUrl = (process.env.AI_API_BASE_URL || '').replace(/\/$/, '')
  return baseUrl.replace(/\/v1\/?$/, '')
}

const getChatConfig = () => ({
  baseUrl: getBaseUrl(),
  apiKey: process.env['AI_API_KEY-CHAT'] || process.env.AI_API_KEY || '',
})

const getImageConfig = () => ({
  baseUrl: getBaseUrl(),
  apiKey: process.env['AI_API_KEY-IMAGE'] || process.env.AI_API_KEY || '',
})

const CHAT_MODEL_PATTERN = /^(deepseek-v3|qwen|gpt|claude)/i
const NON_CHAT_SUFFIX = /-(embedding|ocr|seedream|seededit)$/i

aiRouter.get('/models', async (_req, res) => {
  const { baseUrl, apiKey } = getChatConfig()
  if (!baseUrl || !apiKey) {
    res.status(400).json({ message: 'AI API not configured' })
    return
  }
  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!response.ok) {
      const err = await response.text()
      res.status(response.status).json({ message: err })
      return
    }
    const data = (await response.json()) as { data?: { id: string }[] }
    const all = data.data?.map((m) => m.id) ?? []
    const chatModels = all.filter(
      (id) => (CHAT_MODEL_PATTERN.test(id) || !NON_CHAT_SUFFIX.test(id)) && !/-embedding$/i.test(id) && !/-ocr$/i.test(id)
    )
    res.json(chatModels.length ? chatModels : all)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

aiRouter.post('/chat', async (req, res) => {
  const { baseUrl, apiKey } = getChatConfig()
  if (!baseUrl || !apiKey) {
    res.status(400).json({ message: 'AI API not configured' })
    return
  }

  const { messages, model, stream, max_tokens } = req.body

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages,
        stream: stream ?? false,
        max_tokens: max_tokens || 4096,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      res.status(response.status).json({ message: err })
      return
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      const reader = response.body?.getReader()
      if (!reader) {
        res.status(500).json({ message: 'No stream body' })
        return
      }
      const decoder = new TextDecoder()
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            res.end()
            return
          }
          res.write(decoder.decode(value, { stream: true }))
        }
      }
      await pump()
    } else {
      const data = await response.json()
      res.json(data)
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

aiRouter.post('/image', async (req, res) => {
  const { baseUrl, apiKey } = getImageConfig()
  if (!baseUrl || !apiKey) {
    res.status(400).json({ message: 'AI API not configured' })
    return
  }
  try {
    const response = await fetch(`${baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    })
    if (!response.ok) {
      const err = await response.text()
      res.status(response.status).json({ message: err })
      return
    }
    const data = await response.json()
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})

aiRouter.post('/tts', async (req, res) => {
  const { baseUrl, apiKey } = getChatConfig()
  if (!baseUrl || !apiKey) {
    res.status(400).json({ message: 'AI API not configured' })
    return
  }
  try {
    const response = await fetch(`${baseUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    })
    if (!response.ok) {
      const err = await response.text()
      res.status(response.status).json({ message: err })
      return
    }
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg')
    const arrayBuf = await response.arrayBuffer()
    res.send(Buffer.from(arrayBuf))
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
})
