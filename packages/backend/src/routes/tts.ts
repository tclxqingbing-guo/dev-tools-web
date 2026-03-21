import type { IRouter } from 'express'
import { Router } from 'express'

/** 与前端 TTS 工具一致，仅允许从该主机拉取合成结果，避免开放代理被滥用 */
const TTS_ORIGIN = 'https://bx-tts.17usoft.com'
const TTS_HOST = new URL(TTS_ORIGIN).hostname

export const ttsRouter: IRouter = Router()

/**
 * POST /api/tts/fetch-audio
 * 请求体: { path: string }，为 generate 接口返回的 data.audio 相对路径。
 * 用途：服务端代拉音频，前端同源 fetch 得到 Blob，绕过 CDN 对浏览器的强缓存与 CORS 限制。
 */
ttsRouter.post('/fetch-audio', async (req, res) => {
  const raw = typeof req.body?.path === 'string' ? req.body.path.trim() : ''
  if (!raw || raw.length > 512) {
    res.status(400).json({ message: 'invalid path' })
    return
  }
  if (raw.includes('..') || raw.startsWith('//') || /^https?:/i.test(raw)) {
    res.status(400).json({ message: 'invalid path' })
    return
  }

  let target: URL
  try {
    target = new URL(raw.replace(/^\//, ''), `${TTS_ORIGIN}/`)
  } catch {
    res.status(400).json({ message: 'invalid path' })
    return
  }
  if (target.hostname !== TTS_HOST) {
    res.status(400).json({ message: 'invalid host' })
    return
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: { Accept: 'audio/*,*/*' },
    })
    if (!upstream.ok) {
      res.status(502).json({ message: 'upstream failed' })
      return
    }
    const ct = upstream.headers.get('content-type') || 'application/octet-stream'
    const buf = Buffer.from(await upstream.arrayBuffer())
    res.setHeader('Content-Type', ct)
    res.setHeader('Cache-Control', 'no-store')
    res.send(buf)
  } catch (e) {
    res.status(502).json({ message: e instanceof Error ? e.message : 'fetch failed' })
  }
})
