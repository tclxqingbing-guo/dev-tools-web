import type { IRouter } from 'express'
import { Router } from 'express'
import { getSetting } from '../services/settings-store.js'

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
  let ttsOrigin: URL
  try {
    ttsOrigin = new URL(await getSetting('tts.origin'))
    target = new URL(raw.replace(/^\//, ''), `${ttsOrigin.origin}/`)
  } catch {
    res.status(400).json({ message: 'TTS 服务地址配置无效' })
    return
  }
  if (target.hostname !== ttsOrigin.hostname) {
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
