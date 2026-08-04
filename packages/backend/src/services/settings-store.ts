import initSqlJs from 'sql.js'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../../data')
const dbPath = resolve(dataDir, 'settings.db')
const keyPath = resolve(dataDir, '.settings.key')

mkdirSync(dataDir, { recursive: true })

export const SETTING_DEFAULTS = {
  'ai.baseUrl': '',
  'ai.sharedApiKey': '',
  'ai.chatApiKey': '',
  'ai.imageApiKey': '',
  'wechat.appId': 'wxc3c2bcd1b954b8a3',
  'wechat.appSecret': '',
  'wechat.allowedWebviewDomains':
    'www.baoxianzj.com,www.qa.baoxianzj.com,www.t.baoxianzj.com',
  'wechat.defaultEnvVersion': 'trial',
  'wechat.qrPage': 'pages/index/index',
  'wechat.proxyBaseUrl': 'https://bx-tools.17usoft.com',
  'sentry.dsn': '',
  'sentry.tracesSampleRate': '1',
  'sentry.testEvent': 'false',
  'tts.origin': 'https://bx-tts.17usoft.com',
} as const

export type SettingKey = keyof typeof SETTING_DEFAULTS

export const SENSITIVE_SETTING_KEYS = new Set<SettingKey>([
  'ai.sharedApiKey',
  'ai.chatApiKey',
  'ai.imageApiKey',
  'wechat.appSecret',
])

const LEGACY_ENV_MAP: Partial<Record<SettingKey, string>> = {
  'ai.baseUrl': 'AI_API_BASE_URL',
  'ai.sharedApiKey': 'AI_API_KEY',
  'ai.chatApiKey': 'AI_API_KEY-CHAT',
  'ai.imageApiKey': 'AI_API_KEY-IMAGE',
  'wechat.appId': 'WX_MINI_APP_ID',
  'wechat.appSecret': 'WX_MINI_APP_SECRET',
  'wechat.allowedWebviewDomains': 'WX_MINI_QR_ALLOWED_DOMAINS',
  'sentry.dsn': 'VITE_SENTRY_DSN',
  'sentry.tracesSampleRate': 'VITE_SENTRY_TRACES_SAMPLE_RATE',
  'sentry.testEvent': 'VITE_SENTRY_TEST_EVENT',
}

let db: import('sql.js').Database
let encryptionKey: Buffer

/**
 * 判断指定设置键是否已经存在。
 *
 * @param database 设置数据库。
 * @param key 设置键。
 * @return 设置是否存在。
 */
function settingExists(database: import('sql.js').Database, key: SettingKey): boolean {
  const statement = database.prepare('SELECT key FROM settings WHERE key = ?')
  try {
    statement.bind([key])
    return statement.step()
  } finally {
    statement.free()
  }
}

/**
 * 查询设置值及加密标志。
 *
 * @param database 设置数据库。
 * @param key 设置键。
 * @return 数据库设置行。
 */
function querySetting(
  database: import('sql.js').Database,
  key: SettingKey
): unknown[] | undefined {
  const statement = database.prepare('SELECT value, encrypted FROM settings WHERE key = ?')
  try {
    statement.bind([key])
    return statement.step() ? statement.get() : undefined
  } finally {
    statement.free()
  }
}

/**
 * 读取或生成设置加密密钥。
 *
 * @return 用于 AES-256-GCM 的 32 字节密钥。
 */
function getEncryptionKey(): Buffer {
  if (encryptionKey) return encryptionKey
  if (existsSync(keyPath)) {
    encryptionKey = readFileSync(keyPath)
  } else {
    encryptionKey = randomBytes(32)
    writeFileSync(keyPath, encryptionKey, { mode: 0o600 })
    chmodSync(keyPath, 0o600)
  }
  if (encryptionKey.length !== 32) {
    throw new Error('设置加密密钥格式异常')
  }
  return encryptionKey
}

/**
 * 加密敏感设置。
 *
 * @param value 待加密的明文。
 * @return 包含随机向量、认证标签和密文的字符串。
 */
function encrypt(value: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), ciphertext].map(item => item.toString('base64')).join('.')
}

/**
 * 解密敏感设置。
 *
 * @param value 已加密的设置字符串。
 * @return 解密后的明文。
 */
function decrypt(value: string): string {
  const [ivValue, tagValue, ciphertextValue] = value.split('.')
  if (!ivValue || !tagValue || !ciphertextValue) throw new Error('敏感设置格式异常')
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivValue, 'base64')
  )
  decipher.setAuthTag(Buffer.from(tagValue, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}

/**
 * 将设置数据库写入持久化目录。
 *
 * @param database 当前设置数据库。
 */
function persist(database: import('sql.js').Database) {
  writeFileSync(dbPath, Buffer.from(database.export()))
}

/**
 * 初始化设置数据库并迁移旧环境变量。
 *
 * @return 可复用的设置数据库实例。
 */
async function getDb(): Promise<import('sql.js').Database> {
  if (db) return db
  const SQL = await initSqlJs()
  db = existsSync(dbPath)
    ? new SQL.Database(new Uint8Array(readFileSync(dbPath)))
    : new SQL.Database()
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      encrypted INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  let migrated = false
  for (const key of Object.keys(LEGACY_ENV_MAP) as SettingKey[]) {
    const envName = LEGACY_ENV_MAP[key]
    const legacyValue = envName ? process.env[envName] : ''
    if (!legacyValue) continue
    if (settingExists(db, key)) continue
    const sensitive = SENSITIVE_SETTING_KEYS.has(key)
    db.run(
      'INSERT INTO settings (key, value, encrypted) VALUES (?, ?, ?)',
      [key, sensitive ? encrypt(legacyValue) : legacyValue, sensitive ? 1 : 0]
    )
    migrated = true
  }
  if (migrated || !existsSync(dbPath)) persist(db)
  return db
}

/**
 * 读取单项运行期设置。
 *
 * @param key 设置键。
 * @return 当前设置值；未配置时返回默认值。
 */
export async function getSetting(key: SettingKey): Promise<string> {
  const database = await getDb()
  const row = querySetting(database, key)
  if (!row) return SETTING_DEFAULTS[key]
  const value = String(row[0] ?? '')
  return Number(row[1]) === 1 && value ? decrypt(value) : value
}

/**
 * 批量读取运行期设置。
 *
 * @param keys 需要读取的设置键。
 * @return 设置键值对象。
 */
export async function getSettings<T extends SettingKey>(
  keys: T[]
): Promise<Record<T, string>> {
  const entries = await Promise.all(keys.map(async key => [key, await getSetting(key)] as const))
  return Object.fromEntries(entries) as Record<T, string>
}

/**
 * 保存单项运行期设置。
 *
 * @param key 设置键。
 * @param value 新设置值。
 */
export async function setSetting(key: SettingKey, value: string): Promise<void> {
  const database = await getDb()
  const sensitive = SENSITIVE_SETTING_KEYS.has(key)
  const storedValue = sensitive && value ? encrypt(value) : value
  database.run(
    `INSERT INTO settings (key, value, encrypted, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       encrypted = excluded.encrypted,
       updated_at = datetime('now')`,
    [key, storedValue, sensitive ? 1 : 0]
  )
  persist(database)
}

/**
 * 批量保存运行期设置。
 *
 * @param values 设置键值对象。
 */
export async function setSettings(
  values: Partial<Record<SettingKey, string>>
): Promise<void> {
  for (const [key, value] of Object.entries(values) as [SettingKey, string][]) {
    await setSetting(key, value)
  }
}

/**
 * 判断敏感设置是否已经配置。
 *
 * @param key 敏感设置键。
 * @return 是否存在非空配置。
 */
export async function hasSetting(key: SettingKey): Promise<boolean> {
  return Boolean(await getSetting(key))
}
