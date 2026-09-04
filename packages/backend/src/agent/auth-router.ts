import { randomBytes } from 'node:crypto'
import type { IRouter } from 'express'
import { Router } from 'express'
import { authenticationEnabled, clearSession, readSession, resolveUser, writeSession } from './security.js'
import type { AuthenticatedRequest } from './types.js'

export const agentAuthRouter: IRouter = Router()

function origin(req: AuthenticatedRequest): string {
  const configured = String(process.env.SSO_PUBLIC_ORIGIN || '').replace(/\/+$/, '')
  if (configured) return configured
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http')
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
  return `${proto}://${host}`
}

function safeReturnUri(req: AuthenticatedRequest, value: unknown): string {
  const base = origin(req)
  const raw = String(value || '/')
  try {
    const target = new URL(raw, base)
    return target.origin === base ? target.toString() : `${base}/agent`
  } catch { return `${base}/agent` }
}

agentAuthRouter.get('/me', (req: AuthenticatedRequest, res) => {
  const user = resolveUser(req)
  if (user) return void res.json({ enabled: true, authenticated: true, user })
  if (!authenticationEnabled()) return void res.json({ enabled: false, authenticated: false, user: null })
  res.status(401).json({ enabled: true, authenticated: false, user: null, login_url: '/api/auth/sso/login' })
})

agentAuthRouter.get('/sso/login', (req: AuthenticatedRequest, res) => {
  const baseUrl = String(process.env.SSO_BASE_URL || '').replace(/\/+$/, '')
  if (!baseUrl || process.env.SSO_ENABLED !== 'true') return void res.redirect(safeReturnUri(req, req.query.return_uri))
  const state = randomBytes(24).toString('base64url')
  const returnUri = safeReturnUri(req, req.query.return_uri)
  writeSession(res, { ...readSession(req), state, returnUri })
  const query = new URLSearchParams({
    response_type: 'code',
    scope: process.env.SSO_SCOPE || 'read',
    client_id: process.env.SSO_CLIENT_ID || '',
    redirect_uri: process.env.SSO_REDIRECT_URI || `${origin(req)}/api/auth/sso/callback`,
    state,
    return_uri: returnUri,
  })
  res.redirect(`${baseUrl}/oauth/authorize?${query}`)
})

agentAuthRouter.get('/sso/callback', async (req: AuthenticatedRequest, res) => {
  try {
    const session = readSession(req)
    if (!req.query.code || !session.state || session.state !== req.query.state) return void res.status(400).send('SSO state 校验失败')
    const baseUrl = String(process.env.SSO_BASE_URL || '').replace(/\/+$/, '')
    const redirectUri = process.env.SSO_REDIRECT_URI || `${origin(req)}/api/auth/sso/callback`
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', code: String(req.query.code), redirect_uri: redirectUri,
        client_id: process.env.SSO_CLIENT_ID || '', client_secret: process.env.SSO_CLIENT_SECRET || '',
      }),
      signal: AbortSignal.timeout(Number(process.env.SSO_TIMEOUT_SECONDS || 10) * 1000),
    })
    if (!tokenResponse.ok) throw new Error(`SSO token 接口失败: ${tokenResponse.status}`)
    const token = await tokenResponse.json() as Record<string, any>
    const accessToken = String(token.access_token || '')
    const userResponse = await fetch(`${baseUrl}/oauth/rs/getuserinfo?${new URLSearchParams({ access_token: accessToken })}`, {
      method: 'POST', signal: AbortSignal.timeout(Number(process.env.SSO_TIMEOUT_SECONDS || 10) * 1000),
    })
    if (!userResponse.ok) throw new Error(`SSO 用户接口失败: ${userResponse.status}`)
    const info = await userResponse.json() as Record<string, any>
    writeSession(res, { user: info, accessToken })
    res.redirect(session.returnUri || '/agent')
  } catch (error) {
    res.status(502).send((error as Error).message)
  }
})

agentAuthRouter.post('/logout', async (req: AuthenticatedRequest, res) => {
  clearSession(res)
  res.json({ success: true, redirect_url: safeReturnUri(req, req.body?.return_uri) })
})
