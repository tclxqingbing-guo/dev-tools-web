/**
 * 微信小程序相关字符串解析（Scheme、页面路径 query、常见 WebView 参数）。
 * 适用于本项目的「小程序解析」工具页；不涉及微信服务端密钥或私有 API。
 */

/** 识别出的输入大类 */
export type WxMpInputKind = 'scheme' | 'https' | 'page_path' | 'unknown'

/** Scheme 解析结果 */
export interface WxMpSchemeParts {
  /** 小程序展示名称（Scheme 中第一段，非官方 AppID） */
  nickname: string
  /** Scheme 中路径占位段，通常不是真实 pages 路径 */
  pathToken: string
}

/** 页面路径解析结果 */
export interface WxMpPagePathParts {
  /** 不含 query 的路径，如 pages/index/index */
  path: string
  /** 原始 query 字符串（不含 ?） */
  queryString: string
  /** 解码后的 query 键值（同键取首次出现） */
  params: Record<string, string>
}

/** 统一解析输出，供 UI 展示 */
export interface WxMpParseResult {
  kind: WxMpInputKind
  /** 归一化后的原始输入（trim、补全协议等） */
  normalizedRaw: string
  scheme?: WxMpSchemeParts
  pagePath?: WxMpPagePathParts
  /** 从 query 中提取的可能是 H5 的链接（已多次 decode） */
  webviewUrls: { param: string; url: string }[]
  /** 给用户的说明性提示 */
  hints: string[]
}

const SCHEME_RE = /^#?小程序:\/\/([^/]+)\/([^?\s#]+)/

const WEBVIEW_PARAM_KEYS = ['src', 'url', 'h5Url', 'link', 'webviewUrl', 'weburl', 'targetUrl'] as const

/**
 * 归一化用户输入：去空白、常见全角符号、为无协议的短链补 https。
 * @param raw 用户粘贴的原始字符串
 * @returns 归一化后的字符串
 */
export function normalizeWxMpInput(raw: string): string {
  let s = raw.trim().replace(/\u00a0/g, ' ')
  if (!s) return ''
  if (/^wxaurl\.cn\//i.test(s)) s = `https://${s}`
  if (/^wxurl\.cn\//i.test(s)) s = `https://${s}`
  return s
}

/**
 * 判断字符串是否像小程序页面路径（含可选 query），而非完整 URL。
 * @param s 归一化后的字符串
 * @returns 是否为页面路径形态
 */
export function looksLikePagePath(s: string): boolean {
  if (/^https?:\/\//i.test(s)) return false
  if (SCHEME_RE.test(s)) return false
  const base = s.split('?')[0] ?? ''
  return /^(?:\/)?[\w./-]+\/[\w./-]+/.test(base) || /^pages\//i.test(base)
}

/**
 * 粗分输入类型，供后续分支处理。
 * @param s 归一化后的字符串
 * @returns 输入大类
 */
export function classifyWxMpInput(s: string): WxMpInputKind {
  if (!s) return 'unknown'
  if (SCHEME_RE.test(s)) return 'scheme'
  if (/^https?:\/\//i.test(s)) return 'https'
  if (looksLikePagePath(s)) return 'page_path'
  return 'unknown'
}

/**
 * 从 `#小程序://昵称/路径令牌` 形态中提取昵称与路径令牌。
 * @param s 归一化后的字符串
 * @returns 解析结果；不匹配时返回 null
 */
export function parseWxMpScheme(s: string): WxMpSchemeParts | null {
  const m = s.match(SCHEME_RE)
  if (!m || !m[1] || !m[2]) return null
  return { nickname: decodeURIComponentSafe(m[1]), pathToken: m[2] }
}

/**
 * 将 query 字符串解析为键值对象（重复键取第一次）。
 * @param queryString 不含 `?` 的 query
 * @returns 参数表
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!queryString) return out
  const sp = new URLSearchParams(queryString)
  sp.forEach((v, k) => {
    if (!(k in out)) out[k] = v
  })
  return out
}

/**
 * 安全多次 URL 解码，避免无限循环。
 * @param value 可能是编码过的字符串
 * @param maxRounds 最多解码轮数
 * @returns 解码后的字符串
 */
export function multiDecodeURIComponent(value: string, maxRounds = 4): string {
  let cur = value
  for (let i = 0; i < maxRounds; i++) {
    try {
      const next = decodeURIComponent(cur)
      if (next === cur) break
      cur = next
    } catch {
      break
    }
  }
  return cur
}

/**
 * 在 decodeURIComponent 失败时回退为原串。
 * @param segment URI 组件
 * @returns 解码结果或原串
 */
function decodeURIComponentSafe(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/**
 * 解析小程序页面路径与 query，并抽取常见 WebView 参数中的 URL。
 * @param s 形如 pages/a/b?x=1 的字符串（可有前导 /）
 * @returns 页面路径结构；无法解析时返回 null
 */
export function parseWxMpPagePath(s: string): WxMpPagePathParts | null {
  const t = s.replace(/^\//, '')
  const qIdx = t.indexOf('?')
  const path = qIdx >= 0 ? t.slice(0, qIdx) : t
  const queryString = qIdx >= 0 ? t.slice(qIdx + 1) : ''
  if (!path || !/^[\w./-]+$/i.test(path)) return null
  const params = parseQueryString(queryString)
  return { path, queryString, params }
}

/**
 * 从 query 参数表中收集可能是 H5 地址的字段。
 * @param params 已解析的 query
 * @returns 参数名与解码后 URL 列表
 */
export function extractWebviewUrlsFromParams(params: Record<string, string>): { param: string; url: string }[] {
  const list: { param: string; url: string }[] = []
  for (const key of WEBVIEW_PARAM_KEYS) {
    const v = params[key]
    if (!v) continue
    const decoded = multiDecodeURIComponent(v)
    if (/^https?:\/\//i.test(decoded)) list.push({ param: key, url: decoded })
  }
  for (const [k, v] of Object.entries(params)) {
    if (WEBVIEW_PARAM_KEYS.includes(k as (typeof WEBVIEW_PARAM_KEYS)[number])) continue
    const decoded = multiDecodeURIComponent(v)
    if (/^https?:\/\//i.test(decoded)) list.push({ param: k, url: decoded })
  }
  const seen = new Set<string>()
  return list.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

/**
 * 对一段文本做完整小程序语义解析（不含网络请求）。
 * @param raw 用户输入
 * @returns 结构化结果与提示
 */
export function parseWxMpTextLocally(raw: string): WxMpParseResult {
  const normalizedRaw = normalizeWxMpInput(raw)
  const hints: string[] = []
  const webviewUrls: { param: string; url: string }[] = []

  if (!normalizedRaw) {
    return { kind: 'unknown', normalizedRaw, webviewUrls, hints: ['请输入小程序 Scheme、URL Link 或页面路径'] }
  }

  const kind = classifyWxMpInput(normalizedRaw)

  if (kind === 'scheme') {
    const scheme = parseWxMpScheme(normalizedRaw)
    hints.push(
      'Scheme 中通常不包含完整 pages 路径与业务 query，完整参数请在微信内打开该页后使用「复制页面路径」再粘贴到此处。',
    )
    return {
      kind: 'scheme',
      normalizedRaw,
      scheme: scheme ?? undefined,
      webviewUrls,
      hints,
    }
  }

  if (kind === 'https') {
    hints.push('HTTPS 短链需由服务端跟随重定向解析，请点击「解析链接」或等待自动解析。')
    return { kind: 'https', normalizedRaw, webviewUrls, hints }
  }

  if (kind === 'page_path') {
    const pagePath = parseWxMpPagePath(normalizedRaw)
    if (pagePath) {
      const urls = extractWebviewUrlsFromParams(pagePath.params)
      webviewUrls.push(...urls)
      if (urls.length === 0 && pagePath.queryString)
        hints.push('未在 query 中发现以 http(s) 开头的常见 WebView 参数，可检查是否使用了其它参数名。')
    } else {
      hints.push('无法识别为合法页面路径，请确认格式类似：pages/index/index?a=1')
    }
    return {
      kind: 'page_path',
      normalizedRaw,
      pagePath: pagePath ?? undefined,
      webviewUrls,
      hints,
    }
  }

  hints.push('未能识别输入类型，请尝试：小程序码图片识别、粘贴 Scheme / URL / 页面路径')
  return { kind: 'unknown', normalizedRaw, webviewUrls, hints }
}

/**
 * 从微信 H5 错误页等链接的 query 中提取 appid（若存在）。
 * @param urlString 完整 URL
 * @returns appid 或 null
 */
export function tryExtractAppIdFromUrl(urlString: string): string | null {
  try {
    const u = new URL(urlString)
    const appid = u.searchParams.get('appid') || u.searchParams.get('appId')
    if (appid && /^wx[0-9a-f]{16}$/i.test(appid)) return appid
  } catch {
    /* ignore */
  }
  return null
}
