import type { IRouter } from 'express'
import { Router } from 'express'

export const miniprogramRouter: IRouter = Router()

/** 允许解析的域名后缀，用于降低 SSRF 风险 */
const ALLOWED_HOST_SUFFIXES = [
  'wxaurl.cn',
  'wxurl.cn',
  'mp.weixin.qq.com',
  'servicewechat.com',
  'weixin.qq.com',
  'open.weixin.qq.com',
  'work.weixin.qq.com',
]

const MAX_REDIRECTS = 12
const FETCH_TIMEOUT_MS = 12_000

const WECHAT_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0(0x18000029) NetType/WIFI Language/zh_CN'

type Hop = { url: string; status: number }

/**
 * 判断主机名是否在白名单内（精确或子域）。
 * @param hostname URL 的 hostname 小写形式
 * @returns 是否允许作为解析起点或跳转目标
 */
function isAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (!h || h === 'localhost') return false
  return ALLOWED_HOST_SUFFIXES.some((s) => h === s || h.endsWith(`.${s}`))
}

/**
 * 判断是否为可跟随的 http(s) 跳转地址且主机在白名单。
 * @param nextUrl 下一跳绝对 URL 字符串
 * @returns 合法则返回 URL 对象，否则 null
 */
function safeNextHttpUrl(nextUrl: string): URL | null {
  let u: URL
  try {
    u = new URL(nextUrl)
  } catch {
    return null
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
  if (!isAllowedHost(u.hostname)) return null
  return u
}

/**
 * 跟随重定向链，记录每一跳 URL 与状态码（用于调试展示）。
 * @param startUrl 用户提供的 https 链接
 * @returns 链路与最终 URL；失败时带 error 信息
 */
async function followRedirectsSafe(startUrl: string): Promise<{
  chain: Hop[]
  finalUrl: string | null
  error?: string
}> {
  const chain: Hop[] = []
  let current: URL
  try {
    current = new URL(startUrl)
  } catch {
    return { chain: [], finalUrl: null, error: '无效的 URL' }
  }
  if (current.protocol !== 'http:' && current.protocol !== 'https:') {
    return { chain: [], finalUrl: null, error: '仅支持 http(s) 链接' }
  }
  if (!isAllowedHost(current.hostname)) {
    return { chain: [], finalUrl: null, error: '该域名不在允许列表内（防 SSRF）' }
  }

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const urlStr = current.toString()
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(urlStr, {
        method: 'GET',
        redirect: 'manual',
        signal: ac.signal,
        headers: {
          'User-Agent': WECHAT_UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
      })
    } catch (e) {
      clearTimeout(timer)
      const msg = e instanceof Error ? e.message : '请求失败'
      return { chain, finalUrl: null, error: msg }
    }
    clearTimeout(timer)

    chain.push({ url: urlStr, status: res.status })

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) return { chain, finalUrl: null, error: '重定向缺少 Location' }
      const resolved = new URL(loc, current).toString()
      const next = safeNextHttpUrl(resolved)
      if (!next) {
        return { chain, finalUrl: resolved, error: undefined }
      }
      current = next
      continue
    }

    return { chain, finalUrl: urlStr }
  }

  return { chain, finalUrl: null, error: '重定向次数过多' }
}

/**
 * POST /api/miniprogram/resolve-link
 * 请求体: { url: string }
 * 返回: { chain, finalUrl, error? }
 */
miniprogramRouter.post('/resolve-link', async (req, res) => {
  const url = typeof req.body?.url === 'string' ? req.body.url.trim() : ''
  if (!url || url.length > 4096) {
    res.status(400).json({ message: 'url 无效或过长' })
    return
  }
  const result = await followRedirectsSafe(url)
  res.json(result)
})
