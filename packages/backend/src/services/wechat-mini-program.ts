import { getSettings } from './settings-store.js'

type MiniProgramEnvVersion = 'develop' | 'trial' | 'release'

interface WechatTokenResponse {
  access_token?: string
  expires_in?: number
  errcode?: number
  errmsg?: string
}

let tokenCache = {
  value: '',
  expiresAt: 0,
  appId: '',
}

/**
 * 获取微信小程序基础配置。
 *
 * @return 微信小程序 AppID 和 AppSecret。
 */
async function getWechatCredentials() {
  const settings = await getSettings(['wechat.appId', 'wechat.appSecret'])
  if (!settings['wechat.appId'] || !settings['wechat.appSecret']) {
    throw new Error('请先在设置中心配置微信小程序 AppID 和 AppSecret')
  }
  return {
    appId: settings['wechat.appId'],
    appSecret: settings['wechat.appSecret'],
  }
}

/**
 * 获取并缓存微信接口调用凭证。
 *
 * @param forceRefresh 是否强制刷新凭证。
 * @return 微信 access_token。
 */
export async function getWechatAccessToken(forceRefresh = false): Promise<string> {
  const { appId, appSecret } = await getWechatCredentials()
  if (
    !forceRefresh &&
    tokenCache.value &&
    tokenCache.appId === appId &&
    Date.now() < tokenCache.expiresAt
  ) {
    return tokenCache.value
  }

  const response = await fetch('https://api.weixin.qq.com/cgi-bin/stable_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credential',
      appid: appId,
      secret: appSecret,
      force_refresh: forceRefresh,
    }),
  })
  const data = (await response.json()) as WechatTokenResponse
  if (!response.ok || !data.access_token) {
    throw new Error(data.errmsg || `微信 access_token 获取失败：${response.status}`)
  }
  tokenCache = {
    value: data.access_token,
    appId,
    expiresAt: Date.now() + Math.max(60, (data.expires_in || 7200) - 300) * 1000,
  }
  return tokenCache.value
}

/**
 * 生成无限数量的小程序码。
 *
 * @param scene 二维码场景参数。
 * @param page 扫码后打开的小程序页面。
 * @param envVersion 目标小程序版本。
 * @return 小程序码图片二进制。
 */
export async function createUnlimitedQrCode(
  scene: string,
  page: string,
  envVersion: MiniProgramEnvVersion
): Promise<Buffer> {
  const accessToken = await getWechatAccessToken()
  const response = await fetch(
    `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scene,
        page,
        check_path: true,
        env_version: envVersion,
        width: 430,
      }),
    }
  )
  const contentType = response.headers.get('content-type') || ''
  const buffer = Buffer.from(await response.arrayBuffer())
  const looksLikeJson = buffer[0] === 0x7b
  if (!response.ok || contentType.includes('application/json') || looksLikeJson) {
    let message = `微信小程序码生成失败：${response.status}`
    try {
      const error = JSON.parse(buffer.toString('utf8')) as { errmsg?: string }
      message = error.errmsg || message
    } catch {
      // 非 JSON 错误保持通用提示。
    }
    throw new Error(message)
  }
  return buffer
}
