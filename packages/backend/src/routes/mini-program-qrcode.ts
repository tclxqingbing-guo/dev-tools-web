import type { IRouter } from 'express'
import { Router } from 'express'
import initSqlJs from 'sql.js'
import { randomBytes } from 'crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createUnlimitedQrCode } from '../services/wechat-mini-program.js'
import { getSettings } from '../services/settings-store.js'

type MiniProgramEnvVersion = 'develop' | 'trial' | 'release'

interface MiniProgramQrCodeRow {
  id: number
  code: string
  title: string
  targetUrl: string
  envVersion: MiniProgramEnvVersion
  enabled: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../../data')
const dbPath = resolve(dataDir, 'mini-program-qrcode.db')
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

mkdirSync(dataDir, { recursive: true })

let db: import('sql.js').Database

/**
 * 初始化小程序码数据库。
 *
 * @return 可复用的数据库实例。
 */
async function getDb(): Promise<import('sql.js').Database> {
  if (db) return db
  const SQL = await initSqlJs()
  db = existsSync(dbPath)
    ? new SQL.Database(new Uint8Array(readFileSync(dbPath)))
    : new SQL.Database()
  db.run(`
    CREATE TABLE IF NOT EXISTS mini_program_qrcodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL DEFAULT '',
      target_url TEXT NOT NULL,
      env_version TEXT NOT NULL DEFAULT 'trial',
      enabled INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT NOT NULL DEFAULT '',
      image BLOB NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  if (!existsSync(dbPath)) persist(db)
  return db
}

/**
 * 持久化小程序码数据库。
 *
 * @param database 当前数据库。
 */
function persist(database: import('sql.js').Database) {
  writeFileSync(dbPath, Buffer.from(database.export()))
}

/**
 * 生成适合放入 scene 的随机短码。
 *
 * @param length 短码长度。
 * @return 不含易混淆字符的短码。
 */
function createShortCode(length = 10): string {
  const bytes = randomBytes(length)
  return Array.from(bytes, value => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('')
}

/**
 * 使用参数绑定查询单行数据。
 *
 * @param database 数据库。
 * @param sql SQL 查询。
 * @param params 查询参数。
 * @return 单行值或空值。
 */
function queryOne(
  database: import('sql.js').Database,
  sql: string,
  params: Array<string | number>
): unknown[] | undefined {
  const statement = database.prepare(sql)
  try {
    statement.bind(params)
    return statement.step() ? statement.get() : undefined
  } finally {
    statement.free()
  }
}

/**
 * 映射数据库中的小程序码记录。
 *
 * @param row 数据库行。
 * @return 前端使用的小程序码对象。
 */
function mapRow(row: unknown[]): MiniProgramQrCodeRow {
  return {
    id: Number(row[0]),
    code: String(row[1]),
    title: String(row[2] || ''),
    targetUrl: String(row[3]),
    envVersion: String(row[4]) as MiniProgramEnvVersion,
    enabled: Number(row[5]) === 1,
    expiresAt: String(row[6] || ''),
    createdAt: String(row[7] || ''),
    updatedAt: String(row[8] || ''),
  }
}

/**
 * 校验并规范化 WebView 地址。
 *
 * @param rawUrl 用户输入的 WebView 地址。
 * @param allowedDomains 允许打开的业务域名。
 * @return 规范化后的 HTTPS 地址。
 */
function validateTargetUrl(rawUrl: unknown, allowedDomains: string[]): string {
  if (typeof rawUrl !== 'string' || rawUrl.length > 4096) {
    throw new Error('请输入有效的 WebView 地址')
  }
  const url = new URL(rawUrl.trim())
  if (url.protocol !== 'https:') throw new Error('WebView 地址必须使用 HTTPS')
  const hostname = url.hostname.toLowerCase()
  const allowed = allowedDomains.some(
    domain => hostname === domain || hostname.endsWith(`.${domain}`)
  )
  if (!allowed) {
    throw new Error(`域名 ${hostname} 不在允许列表中，请先到设置中心配置`)
  }
  return url.toString()
}

/**
 * 判断微信返回的小程序码图片格式。
 *
 * @param value 图片二进制。
 * @return 图片 MIME 类型及扩展名。
 */
function detectImageType(value: Uint8Array): { mime: string; extension: string } {
  if (
    value.length >= 4 &&
    value[0] === 0x89 &&
    value[1] === 0x50 &&
    value[2] === 0x4e &&
    value[3] === 0x47
  ) {
    return { mime: 'image/png', extension: 'png' }
  }
  return { mime: 'image/jpeg', extension: 'jpg' }
}

/**
 * 读取允许的 WebView 域名。
 *
 * @return 去重后的域名列表。
 */
async function getAllowedDomains(): Promise<string[]> {
  const settings = await getSettings(['wechat.allowedWebviewDomains'])
  return [
    ...new Set(
      settings['wechat.allowedWebviewDomains']
        .split(/[\n,]/)
        .map(value => value.trim().toLowerCase())
        .filter(Boolean)
    ),
  ]
}

export const miniProgramQrCodeRouter: IRouter = Router()

miniProgramQrCodeRouter.get('/config', async (_req, res) => {
  try {
    const settings = await getSettings(['wechat.defaultEnvVersion'])
    res.json({
      defaultEnvVersion: settings['wechat.defaultEnvVersion'] || 'trial',
      allowedDomains: await getAllowedDomains(),
    })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

miniProgramQrCodeRouter.get('/', async (_req, res) => {
  try {
    const database = await getDb()
    const result = database.exec(`
      SELECT id, code, title, target_url, env_version, enabled, expires_at, created_at, updated_at
      FROM mini_program_qrcodes
      ORDER BY id DESC
      LIMIT 200
    `)
    res.json((result[0]?.values ?? []).map(mapRow))
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

miniProgramQrCodeRouter.get('/resolve/:code', async (req, res) => {
  try {
    const code = req.params.code.trim()
    if (!/^[A-Za-z0-9]{6,24}$/.test(code)) {
      res.status(400).json({ message: '小程序码参数无效' })
      return
    }
    const database = await getDb()
    const row = queryOne(
      database,
      `SELECT id, code, title, target_url, env_version, enabled, expires_at, created_at, updated_at
       FROM mini_program_qrcodes WHERE code = ?`,
      [code]
    )
    if (!row) {
      res.status(404).json({ message: '小程序码不存在' })
      return
    }
    const record = mapRow(row)
    if (!record.enabled) {
      res.status(410).json({ message: '小程序码已停用' })
      return
    }
    if (record.expiresAt && Date.parse(record.expiresAt) <= Date.now()) {
      res.status(410).json({ message: '小程序码已过期' })
      return
    }
    res.setHeader('Cache-Control', 'no-store')
    res.json({ code: record.code, title: record.title, url: record.targetUrl })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

miniProgramQrCodeRouter.post('/', async (req, res) => {
  try {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
    if (!title || title.length > 100) throw new Error('请输入 1 到 100 个字符的名称')

    const settings = await getSettings([
      'wechat.defaultEnvVersion',
      'wechat.qrPage',
    ])
    const envVersion = String(
      req.body?.envVersion || settings['wechat.defaultEnvVersion']
    ) as MiniProgramEnvVersion
    if (!['develop', 'trial', 'release'].includes(envVersion)) {
      throw new Error('小程序版本配置无效')
    }
    const expiresAt =
      typeof req.body?.expiresAt === 'string' ? req.body.expiresAt.trim() : ''
    if (expiresAt && !Number.isFinite(Date.parse(expiresAt))) {
      throw new Error('过期时间格式无效')
    }

    const targetUrl = validateTargetUrl(req.body?.targetUrl, await getAllowedDomains())
    const database = await getDb()
    let code = ''
    for (let index = 0; index < 5; index += 1) {
      const candidate = createShortCode()
      if (
        !queryOne(database, 'SELECT id FROM mini_program_qrcodes WHERE code = ?', [
          candidate,
        ])
      ) {
        code = candidate
        break
      }
    }
    if (!code) throw new Error('短码生成失败，请重试')

    const image = await createUnlimitedQrCode(
      `q=${code}`,
      settings['wechat.qrPage'] || 'pages/index/index',
      envVersion
    )
    database.run(
      `INSERT INTO mini_program_qrcodes
       (code, title, target_url, env_version, enabled, expires_at, image)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [code, title, targetUrl, envVersion, expiresAt, new Uint8Array(image)]
    )
    const id = Number(
      queryOne(database, 'SELECT last_insert_rowid()', [])?.[0] || 0
    )
    persist(database)
    const row = queryOne(
      database,
      `SELECT id, code, title, target_url, env_version, enabled, expires_at, created_at, updated_at
       FROM mini_program_qrcodes WHERE id = ?`,
      [id]
    )
    res.status(201).json(row ? mapRow(row) : { id, code })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

miniProgramQrCodeRouter.get('/:id/image', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: '记录编号无效' })
      return
    }
    const database = await getDb()
    const row = queryOne(database, 'SELECT image, code FROM mini_program_qrcodes WHERE id = ?', [
      id,
    ])
    if (!row) {
      res.status(404).json({ message: '小程序码不存在' })
      return
    }
    const image = row[0] as Uint8Array
    const imageType = detectImageType(image)
    res.setHeader('Content-Type', imageType.mime)
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${String(row[1])}.${imageType.extension}"`
    )
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(Buffer.from(image))
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

miniProgramQrCodeRouter.patch('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || typeof req.body?.enabled !== 'boolean') {
      res.status(400).json({ message: '状态参数无效' })
      return
    }
    const database = await getDb()
    database.run(
      `UPDATE mini_program_qrcodes
       SET enabled = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [req.body.enabled ? 1 : 0, id]
    )
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: '小程序码不存在' })
      return
    }
    persist(database)
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

miniProgramQrCodeRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: '记录编号无效' })
      return
    }
    const database = await getDb()
    database.run('DELETE FROM mini_program_qrcodes WHERE id = ?', [id])
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: '小程序码不存在' })
      return
    }
    persist(database)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})
