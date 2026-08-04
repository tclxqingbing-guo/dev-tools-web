import type { IRouter, NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import { getActiveQrCodeRecord, getAllowedDomains, type MiniProgramQrCodeRow } from './mini-program-qrcode.js'

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'content-encoding',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

/**
 * 判断目标地址是否仍在 WebView 白名单内。
 *
 * @param targetUrl 待请求地址。
 * @param allowedDomains 允许的业务域名。
 * @return 是否允许转发。
 */
function isAllowedTarget(targetUrl: URL, allowedDomains: string[]): boolean {
  if (!['http:', 'https:'].includes(targetUrl.protocol) || targetUrl.username || targetUrl.password) {
    return false
  }
  const hostname = targetUrl.hostname.toLowerCase()
  return allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))
}

/**
 * 从网关请求路径还原目标页面地址。
 *
 * @param req 当前网关请求。
 * @param record 短码映射记录。
 * @return 上游目标 URL。
 */
function getTargetRequestUrl(req: Request, record: MiniProgramQrCodeRow): URL {
  const base = new URL(record.targetUrl)
  const pathCode = typeof req.query.__mini_proxy_code === 'string' ? req.query.__mini_proxy_code : ''
  if (pathCode) {
    const target = new URL(record.targetUrl)
    const incoming = new URL(req.originalUrl, 'http://mini-proxy')
    incoming.searchParams.delete('__mini_proxy_code')
    target.pathname = req.path
    target.search = incoming.search
    return target
  }
  const segments = req.path.split('/').filter(Boolean)
  const query = new URL(req.originalUrl, 'http://mini-proxy').search
  if (!segments.length) return base
  if (segments[0] === '__root__') {
    const path = `/${segments.slice(1).join('/')}`
    return new URL(`${path || '/'}${query}`, base.origin)
  }
  return new URL(`${segments.join('/')}${query}`, base)
}

/**
 * 把同一目标站点的资源地址映射回当前短码网关。
 *
 * @param rawValue 页面中发现的资源地址。
 * @param documentUrl 当前上游文档地址。
 * @param code 短码。
 * @return 可由浏览器继续请求的地址。
 */
function rewriteUrl(rawValue: string, documentUrl: URL, code: string, pathMode = false): string {
  const value = rawValue.trim()
  if (!value || value.startsWith('#') || /^(?:data|blob|javascript|mailto|tel):/i.test(value)) {
    return rawValue
  }
  try {
    const resolved = new URL(value, documentUrl)
    if (resolved.origin !== documentUrl.origin) return rawValue
    if (pathMode) {
      resolved.searchParams.set('__mini_proxy_code', code)
      return `${resolved.pathname}${resolved.search}`
    }
    return `/mini-proxy/${encodeURIComponent(code)}/__root__${resolved.pathname}${resolved.search}`
  } catch {
    return rawValue
  }
}

/**
 * 重写 HTML/CSS 中指向原站的资源链接。
 *
 * @param content 上游文本内容。
 * @param documentUrl 当前文档 URL。
 * @param code 短码。
 * @param contentType 内容类型。
 * @return 重写后的文本。
 */
function rewriteContent(content: string, documentUrl: URL, code: string, contentType: string, pathMode = false): string {
  if (contentType.includes('text/html')) {
    return content.replace(
      /(\s(?:src|href|action|poster|data-src)\s*=\s*)(["'])(.*?)\2/gi,
      (_match, prefix: string, quote: string, value: string) =>
        `${prefix}${quote}${rewriteUrl(value, documentUrl, code, pathMode)}${quote}`
    )
  }
  if (contentType.includes('text/css')) {
    return content.replace(
      /url\(\s*(["']?)(.*?)\1\s*\)/gi,
      (_match, quote: string, value: string) => `url(${quote}${rewriteUrl(value, documentUrl, code, pathMode)}${quote})`
    )
  }
  return content
}

/**
 * 读取原始请求体，保证表单和 JSON 请求都能转发。
 *
 * @param req 当前请求。
 * @return 请求体二进制。
 */
async function readRequestBody(req: Request): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req as unknown as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/**
 * 复制浏览器请求头并移除连接级头部。
 *
 * @param req 当前请求。
 * @return 上游请求头。
 */
function createForwardHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = { 'accept-encoding': 'identity' }
  for (const [key, value] of Object.entries(req.headers)) {
    const normalized = key.toLowerCase()
    if (HOP_BY_HOP_HEADERS.has(normalized) || value === undefined) continue
    headers[key] = Array.isArray(value) ? value.join(', ') : value
  }
  return headers
}

/**
 * 改写上游跳转地址。
 *
 * @param location Location 头值。
 * @param targetUrl 当前目标地址。
 * @param code 短码。
 * @return 网关跳转地址或原值。
 */
function rewriteLocation(location: string, targetUrl: URL, code: string, pathMode = false): string {
  try {
    const resolved = new URL(location, targetUrl)
    if (resolved.origin !== targetUrl.origin) return location
    if (pathMode) {
      resolved.searchParams.set('__mini_proxy_code', code)
      return `${resolved.pathname}${resolved.search}`
    }
    return `/mini-proxy/${encodeURIComponent(code)}/__root__${resolved.pathname}${resolved.search}`
  } catch {
    return location
  }
}

/**
 * 转发单个短码页面及其资源请求。
 *
 * @param req Express 请求。
 * @param res Express 响应。
 * @return 无返回值。
 */
async function proxyRequest(req: Request, res: Response, routeCode?: string): Promise<void> {
  const segments = req.path.split('/').filter(Boolean)
  const code = routeCode || segments[0] || ''
  const record = await getActiveQrCodeRecord(code)
  if (!record) {
    res.status(404).json({ message: '小程序码不存在、已停用或已过期' })
    return
  }
  const targetUrl = getTargetRequestUrl(req, record)
  const pathMode = typeof req.query.__mini_proxy_code === 'string'
  if (!isAllowedTarget(targetUrl, await getAllowedDomains())) {
    res.status(403).json({ message: '目标域名不在当前 WebView 白名单中' })
    return
  }

  const method = req.method.toUpperCase()
  const body = method === 'GET' || method === 'HEAD' ? undefined : await readRequestBody(req)
  const upstream = await fetch(targetUrl, {
    method,
    headers: createForwardHeaders(req),
    body: body && body.length ? (new Uint8Array(body) as unknown as BodyInit) : undefined,
    redirect: 'manual',
  })

  res.status(upstream.status)
  const contentType = upstream.headers.get('content-type') || ''
  upstream.headers.forEach((value, key) => {
    const normalized = key.toLowerCase()
    if (['content-length', 'content-encoding', 'transfer-encoding', 'connection', 'content-security-policy', 'content-security-policy-report-only', 'x-frame-options', 'set-cookie', 'location'].includes(normalized)) return
    res.setHeader(key, value)
  })

  const location = upstream.headers.get('location')
  if (location) res.setHeader('Location', rewriteLocation(location, targetUrl, code, pathMode))
  const setCookie = (upstream.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() || []
  for (const cookie of setCookie) {
    let normalized = cookie
      .replace(/;\s*Domain=[^;]*/gi, '')
      .replace(/;\s*Path=[^;]*/i, `; Path=/mini-proxy/${encodeURIComponent(code)}`)
    if (!/;\s*Path=/i.test(normalized)) {
      normalized += `; Path=/mini-proxy/${encodeURIComponent(code)}`
    }
    res.append('Set-Cookie', normalized)
  }

  if (method === 'HEAD' || !upstream.body) {
    res.end()
    return
  }
  if (contentType.includes('text/html') || contentType.includes('text/css')) {
    const content = await upstream.text()
    res.send(rewriteContent(content, targetUrl, code, contentType, pathMode))
    return
  }
  res.send(Buffer.from(await upstream.arrayBuffer()))
}

export const miniProgramProxyRouter: IRouter = Router()
miniProgramProxyRouter.use(async (req, res, next: NextFunction) => {
  try {
    const pathCode = typeof req.query.__mini_proxy_code === 'string'
      ? req.query.__mini_proxy_code
      : req.baseUrl.endsWith('/mini-proxy')
        ? req.path.split('/').filter(Boolean)[0]
        : ''
    if (!pathCode) {
      next()
      return
    }
    await proxyRequest(req, res, pathCode)
  } catch (error) {
    res.status(502).json({ message: `WebView 网关转发失败：${(error as Error).message}` })
  }
})
