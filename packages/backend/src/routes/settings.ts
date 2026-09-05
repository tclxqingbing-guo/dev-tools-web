import type { IRouter } from 'express'
import { Router } from 'express'
import {
  SETTING_DEFAULTS,
  SENSITIVE_SETTING_KEYS,
  getSetting,
  getSettings,
  hasSetting,
  setSetting,
  setSettings,
  type SettingKey,
} from '../services/settings-store.js'
import { getWechatAccessToken } from '../services/wechat-mini-program.js'
import { loadAuthConfigFromDb, requireAdmin } from '../agent/security.js'

export const settingsRouter: IRouter = Router()

const settingKeys = Object.keys(SETTING_DEFAULTS) as SettingKey[]
const settingKeySet = new Set<string>(settingKeys)

/**
 * 校验运行期设置值。
 *
 * @param key 设置键。
 * @param value 待保存的设置值。
 * @return 校验后的字符串。
 */
function validateSetting(key: SettingKey, value: unknown): string {
  if (typeof value !== 'string') throw new Error(`${key} 必须是字符串`)
  const normalized = value.trim()
  if (normalized.length > 4096) throw new Error(`${key} 内容过长`)

  if (['ai.baseUrl', 'sentry.dsn', 'tts.origin', 'wechat.proxyBaseUrl'].includes(key) && normalized) {
    const url = new URL(normalized)
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`${key} 必须使用 HTTP 或 HTTPS`)
    }
    if (key === 'tts.origin' && url.protocol !== 'https:' && url.hostname !== 'localhost') {
      throw new Error(`${key} 必须使用 HTTPS`)
    }
    if (key === 'wechat.proxyBaseUrl' && url.protocol !== 'https:') {
      throw new Error(`${key} 必须使用 HTTPS`)
    }
  }
  if (key === 'wechat.defaultEnvVersion' && !['develop', 'trial', 'release'].includes(normalized)) {
    throw new Error('小程序版本只能是 develop、trial 或 release')
  }
  if (key === 'sentry.tracesSampleRate') {
    const rate = Number(normalized)
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      throw new Error('Sentry 采样率必须在 0 到 1 之间')
    }
  }
  if (key === 'sentry.testEvent' && !['true', 'false'].includes(normalized)) {
    throw new Error('Sentry 测试事件配置无效')
  }
  return normalized
}

settingsRouter.get('/public', async (_req, res) => {
  try {
    const values = await getSettings([
      'sentry.dsn',
      'sentry.tracesSampleRate',
      'sentry.testEvent',
    ])
    res.json({
      sentry: {
        dsn: values['sentry.dsn'],
        tracesSampleRate: Number(values['sentry.tracesSampleRate'] || '1'),
        testEvent: values['sentry.testEvent'] === 'true',
      },
    })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

// 设置中心包含模型密钥、SSO 凭据和统一权限令牌，只允许管理员访问。
settingsRouter.use(requireAdmin)

settingsRouter.get('/', async (_req, res) => {
  try {
    const values: Record<string, string> = {}
    const secrets: Record<string, boolean> = {}
    for (const key of settingKeys) {
      if (SENSITIVE_SETTING_KEYS.has(key)) {
        values[key] = ''
        secrets[key] = await hasSetting(key)
      } else {
        values[key] = await getSetting(key)
      }
    }
    res.json({ values, secrets })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

settingsRouter.put('/', async (req, res) => {
  try {
    const incoming = req.body?.values
    const clearKeys = Array.isArray(req.body?.clearKeys) ? req.body.clearKeys : []
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      res.status(400).json({ message: '设置内容格式错误' })
      return
    }

    const updates: Partial<Record<SettingKey, string>> = {}
    for (const [rawKey, rawValue] of Object.entries(incoming)) {
      if (!settingKeySet.has(rawKey)) {
        res.status(400).json({ message: `不支持的设置项：${rawKey}` })
        return
      }
      const key = rawKey as SettingKey
      if (SENSITIVE_SETTING_KEYS.has(key) && rawValue === '') continue
      updates[key] = validateSetting(key, rawValue)
    }
    for (const rawKey of clearKeys) {
      if (!settingKeySet.has(rawKey) || !SENSITIVE_SETTING_KEYS.has(rawKey as SettingKey)) {
        res.status(400).json({ message: `不可清除的设置项：${rawKey}` })
        return
      }
      updates[rawKey as SettingKey] = ''
    }
    await setSettings(updates)
    await loadAuthConfigFromDb()
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

settingsRouter.post('/test-ai', async (_req, res) => {
  try {
    const settings = await getSettings([
      'ai.baseUrl',
      'ai.sharedApiKey',
      'ai.chatApiKey',
    ])
    const baseUrl = settings['ai.baseUrl'].replace(/\/v1\/?$/, '').replace(/\/$/, '')
    const apiKey = settings['ai.chatApiKey'] || settings['ai.sharedApiKey']
    if (!baseUrl || !apiKey) throw new Error('请先配置大模型接口地址和 API Key')
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!response.ok) throw new Error((await response.text()) || `连接失败：${response.status}`)
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

settingsRouter.post('/test-wechat', async (_req, res) => {
  try {
    await getWechatAccessToken(true)
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

settingsRouter.delete('/secret/:key', async (req, res) => {
  try {
    const key = req.params.key as SettingKey
    if (!SENSITIVE_SETTING_KEYS.has(key)) {
      res.status(400).json({ message: '该设置不是敏感设置' })
      return
    }
    await setSetting(key, '')
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})
