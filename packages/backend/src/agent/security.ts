import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { isIP } from 'node:net'
import type { NextFunction, Response } from 'express'
import type { AgentUser, AuthenticatedRequest } from './types.js'

const runtimeSecret = randomBytes(32).toString('hex')

function envBool(name: string, fallback = false): boolean {
  const value = String(process.env[name] || '').trim().toLowerCase()
  return value ? ['1', 'true', 'yes', 'on'].includes(value) : fallback
}

function csv(value: string | undefined): string[] {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
}

function sessionSecret(): string {
  return process.env.SSO_SESSION_SECRET || runtimeSecret
}

function parseCookies(req: AuthenticatedRequest): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of String(req.headers.cookie || '').split(';')) {
    const index = part.indexOf('=')
    if (index > 0) out[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim())
  }
  return out
}

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url')
}

/** 签发无状态 SSO 会话 Cookie。 */
export function writeSession(res: Response, value: Record<string, unknown>): void {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url')
  const cookie = `${payload}.${sign(payload)}`
  const name = process.env.SSO_COOKIE_NAME || 'bx_tools_session'
  const secure = envBool('SSO_COOKIE_SECURE') ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(cookie)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${6 * 86400}${secure}`)
}

export function clearSession(res: Response): void {
  res.setHeader('Set-Cookie', `${process.env.SSO_COOKIE_NAME || 'bx_tools_session'}=; Path=/; HttpOnly; Max-Age=0`)
}

/** 解析并校验签名会话。 */
export function readSession(req: AuthenticatedRequest): Record<string, any> {
  const raw = parseCookies(req)[process.env.SSO_COOKIE_NAME || 'bx_tools_session']
  if (!raw) return {}
  const index = raw.lastIndexOf('.')
  if (index < 1) return {}
  const payload = raw.slice(0, index)
  const supplied = Buffer.from(raw.slice(index + 1))
  const expected = Buffer.from(sign(payload))
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return {}
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()) } catch { return {} }
}

export function authenticationEnabled(): boolean {
  return envBool('SSO_ENABLED') || envBool('AUTH_MOCK_ENABLED')
}

/** 从 SSO 会话或本地调试配置解析当前用户。 */
export function resolveUser(req: AuthenticatedRequest): AgentUser | null {
  const session = readSession(req)
  const raw = session.user || (envBool('AUTH_MOCK_ENABLED') ? {
    userId: process.env.AUTH_MOCK_USER_ID || 'local-user',
    username: process.env.AUTH_MOCK_USERNAME || '本地测试用户',
    roles: csv(process.env.AUTH_MOCK_ROLES || 'admin'),
  } : null)
  if (!raw) return null
  const id = String(raw.userId || raw.workId || raw.memberId || '').trim()
  if (!id) return null
  const roles = Array.isArray(raw.roles) ? raw.roles.map(String) : csv(raw.roles)
  const adminRoles = new Set(csv(process.env.AUTHORITY_ALLOWED_ADMIN_ROLE_NAMES || 'admin'))
  return { id, name: String(raw.username || raw.name || id), roles, admin: roles.some((r: string) => adminRoles.has(r)) }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = resolveUser(req)
  if (!user) {
    if (authenticationEnabled()) {
      res.status(401).json({ detail: '未登录或登录已过期', login_url: '/api/auth/sso/login' })
      return
    }
    if (!envBool('AGENT_ALLOW_GUEST')) {
      res.status(503).json({ detail: '统一 Agent 尚未配置登录服务' })
      return
    }
    const guest = { id: `guest-${randomBytes(12).toString('hex')}`, name: '访客', roles: ['guest'], admin: false }
    writeSession(res, { user: { userId: guest.id, username: guest.name, roles: guest.roles } })
    req.agentUser = guest
    next()
    return
  }
  req.agentUser = user
  next()
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.agentUser?.roles.includes('guest')) return void res.status(403).json({ detail: '访客不能访问系统设置' })
    if (req.agentUser?.admin) return next()
    void hasAuthorityAdminRole(req.agentUser!).then((allowed) => {
      if (!allowed) return void res.status(403).json({ detail: '需要管理员权限' })
      req.agentUser!.admin = true
      next()
    }).catch((error) => res.status(503).json({ detail: `统一权限校验失败：${(error as Error).message}` }))
  })
}

const authorityCache = new Map<string, { value: boolean; expires: number }>()

/** 调用统一权限角色接口校验管理员身份，结果短时缓存。 */
async function hasAuthorityAdminRole(user: AgentUser): Promise<boolean> {
  const adminIds = new Set(csv(process.env.AUTH_ADMIN_USER_IDS))
  if (adminIds.has(user.id)) return true
  if (!envBool('AUTHORITY_ENABLED')) return false
  const cached = authorityCache.get(user.id)
  if (cached && cached.expires > Date.now()) return cached.value
  const baseUrl = String(process.env.AUTHORITY_BASE_URL || '').replace(/\/+$/, '')
  const appKey = process.env.AUTHORITY_APP_KEY || ''
  const appCode = process.env.AUTHORITY_APP_CODE || ''
  if (!baseUrl || !appKey || !appCode) throw new Error('统一权限配置不完整')
  const response = await fetch(`${baseUrl}/role/getrolebyuserid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Labrador-Token': process.env.AUTHORITY_LABRADOR_TOKEN || '' },
    body: JSON.stringify({ Act: { AppKey: appKey, AppCode: appCode }, UserId: user.id, OnlyValid: true, ...(process.env.AUTHORITY_TID ? { TID: process.env.AUTHORITY_TID } : {}) }),
    signal: AbortSignal.timeout(Number(process.env.AUTHORITY_TIMEOUT_SECONDS || 10) * 1000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const payload = await response.json()
  const values = new Set<string>()
  const walk = (node: any): void => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (!node || typeof node !== 'object') return
    for (const [key, value] of Object.entries(node)) {
      if (/^(RoleId|roleId|RoleName|roleName|Name|name|Id|id)$/.test(key) && ['string', 'number'].includes(typeof value)) values.add(String(value))
      else walk(value)
    }
  }
  walk(payload)
  const allowed = new Set([...csv(process.env.AUTHORITY_ALLOWED_ADMIN_ROLE_NAMES), ...csv(process.env.AUTHORITY_ALLOWED_ADMIN_ROLE_IDS)])
  const result = [...values].some((value) => allowed.has(value))
  authorityCache.set(user.id, { value: result, expires: Date.now() + 60_000 })
  return result
}

function encryptionKey(): Buffer {
  return createHash('sha256').update(process.env.AGENT_ENCRYPTION_KEY || sessionSecret()).digest()
}

export function encryptSecret(value: string): string {
  if (!value) return ''
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.')
}

export function decryptSecret(value: string | null | undefined): string {
  if (!value) return ''
  const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64url'))
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

/** 防止 MCP 管理配置成为任意 SSRF 跳板。 */
export function assertAllowedServiceUrl(raw: string): URL {
  const url = new URL(raw)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('只允许 HTTP/HTTPS MCP 地址')
  const host = url.hostname.toLowerCase()
  const allowed = csv(process.env.MCP_ALLOWED_HOSTS)
  if (allowed.length && !allowed.some((item) => host === item || host.endsWith(`.${item}`))) {
    throw new Error('MCP 地址不在允许域名列表')
  }
  if (!envBool('MCP_ALLOW_PRIVATE_NETWORK')) {
    if (host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0' || host === '169.254.169.254') {
      throw new Error('禁止访问本机或云元数据地址')
    }
    if (isIP(host) && (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host))) {
      throw new Error('禁止访问未授权私网地址')
    }
  }
  return url
}
