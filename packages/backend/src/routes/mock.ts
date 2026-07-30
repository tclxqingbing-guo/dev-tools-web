import type { IRouter, Request, Response } from 'express'
import { Router } from 'express'
import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { generateFromTemplate, generateList, generateListAtPath, evaluateConditionGroups } from '../utils/mock-generator.js'
import type { ConditionRule, ConditionGroup } from '../utils/mock-generator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../../data')
const dbPath = resolve(dataDir, 'mock.db')

mkdirSync(dataDir, { recursive: true })

let db: import('sql.js').Database

/**
 * 获取数据库单例，首次调用时初始化表结构。
 *
 * @return 数据库实例。
 */
async function getDb(): Promise<import('sql.js').Database> {
  if (db) return db
  const SQL = await initSqlJs()
  if (existsSync(dbPath)) {
    const buf = readFileSync(dbPath)
    db = new SQL.Database(new Uint8Array(buf))
  } else {
    db = new SQL.Database()
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS mock_apis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      method TEXT NOT NULL DEFAULT 'GET',
      path TEXT NOT NULL,
      headers TEXT NOT NULL DEFAULT '{}',
      status_code INTEGER NOT NULL DEFAULT 200,
      response_body TEXT NOT NULL DEFAULT '{}',
      response_config TEXT NOT NULL DEFAULT '{}',
      enabled INTEGER NOT NULL DEFAULT 1,
      delay_ms INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  return db
}

/**
 * 持久化数据库到文件。
 *
 * @param database 数据库实例。
 */
function persist(database: import('sql.js').Database) {
  const data = database.export()
  writeFileSync(dbPath, Buffer.from(data))
}

/**
 * 将数据库行映射为 MockApi 对象。
 *
 * @param v 行数据数组。
 * @return MockApi 对象。
 */
function mapRow(v: unknown[]) {
  return {
    id: v[0] as number,
    name: v[1] as string,
    method: v[2] as string,
    path: v[3] as string,
    headers: v[4] as string,
    status_code: v[5] as number,
    response_body: v[6] as string,
    response_config: v[7] as string,
    enabled: v[8] as number,
    delay_ms: v[9] as number,
    created_at: v[10] as string,
    updated_at: v[11] as string,
  }
}

export const mockRouter: IRouter = Router()

// ==================== CRUD 端点 ====================

/** 获取 mock 规则列表，支持搜索过滤 */
mockRouter.get('/', async (req: Request, res: Response) => {
  try {
    const database = await getDb()
    const search = (req.query.search as string) || ''
    let sql = 'SELECT * FROM mock_apis'
    if (search) {
      sql += ` WHERE name LIKE '%${search.replace(/'/g, "''")}' OR path LIKE '%${search.replace(/'/g, "''")}%'`
    }
    sql += ' ORDER BY updated_at DESC'
    const result = database.exec(sql)
    const rows = (result[0]?.values ?? []).map(mapRow)
    res.json(rows)
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

/** 获取单条 mock 规则详情 */
mockRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const database = await getDb()
    const id = parseInt(String(req.params.id), 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const result = database.exec(`SELECT * FROM mock_apis WHERE id = ${id}`)
    const values = result[0]?.values?.[0]
    if (!values) {
      res.status(404).json({ message: 'Mock rule not found' })
      return
    }
    res.json(mapRow(values))
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

/** 创建 mock 规则 */
mockRouter.post('/', async (req: Request, res: Response) => {
  try {
    const database = await getDb()
    const { name, method, path, headers, status_code, response_body, response_config, enabled, delay_ms } = req.body
    database.run(
      `INSERT INTO mock_apis (name, method, path, headers, status_code, response_body, response_config, enabled, delay_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name ?? '',
        method ?? 'GET',
        path ?? '/',
        typeof headers === 'string' ? headers : JSON.stringify(headers ?? {}),
        status_code ?? 200,
        typeof response_body === 'string' ? response_body : JSON.stringify(response_body ?? {}),
        typeof response_config === 'string' ? response_config : JSON.stringify(response_config ?? {}),
        enabled ?? 1,
        delay_ms ?? 0,
      ]
    )
    const result = database.exec('SELECT last_insert_rowid() as id')
    const id = result[0]?.values?.[0]?.[0] as number
    const row = database.exec(`SELECT * FROM mock_apis WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.status(201).json(values ? mapRow(values) : { id })
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

/** 更新 mock 规则 */
mockRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const database = await getDb()
    const id = parseInt(String(req.params.id), 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const { name, method, path, headers, status_code, response_body, response_config, enabled, delay_ms } = req.body
    database.run(
      `UPDATE mock_apis SET name=?, method=?, path=?, headers=?, status_code=?, response_body=?, response_config=?, enabled=?, delay_ms=?, updated_at=datetime('now') WHERE id=?`,
      [
        name ?? '',
        method ?? 'GET',
        path ?? '/',
        typeof headers === 'string' ? headers : JSON.stringify(headers ?? {}),
        status_code ?? 200,
        typeof response_body === 'string' ? response_body : JSON.stringify(response_body ?? {}),
        typeof response_config === 'string' ? response_config : JSON.stringify(response_config ?? {}),
        enabled ?? 1,
        delay_ms ?? 0,
        id,
      ]
    )
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Mock rule not found' })
      return
    }
    const row = database.exec(`SELECT * FROM mock_apis WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.json(values ? mapRow(values) : {})
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

/** 删除 mock 规则 */
mockRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const database = await getDb()
    const id = parseInt(String(req.params.id), 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    database.run('DELETE FROM mock_apis WHERE id = ?', [id])
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Mock rule not found' })
      return
    }
    persist(database)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

/** 切换 mock 规则启用/禁用状态 */
mockRouter.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const database = await getDb()
    const id = parseInt(String(req.params.id), 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    database.run(`UPDATE mock_apis SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?`, [id])
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Mock rule not found' })
      return
    }
    const row = database.exec(`SELECT * FROM mock_apis WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.json(values ? mapRow(values) : {})
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

// ==================== Mock 服务端点 ====================

/**
 * 通配路由：根据请求 method + path 匹配已启用的 mock 规则并返回动态数据。
 * 放在 CRUD 路由之后，确保不影响管理接口。
 */
mockRouter.all('/serve/{*splat}', async (req: Request, res: Response) => {
  try {
    const database = await getDb()
    // 提取用户自定义路径（去掉 /serve 前缀）
    const splat = req.params.splat
    const rawPath = Array.isArray(splat) ? splat.join('/') : String(splat || '')
    const userPath = '/' + rawPath
    const method = req.method.toUpperCase()

    // 查找匹配的已启用规则
    const result = database.exec(
      `SELECT * FROM mock_apis WHERE enabled = 1 AND method = '${method}' AND path = '${userPath.replace(/'/g, "''")}'`
    )
    const values = result[0]?.values?.[0]
    if (!values) {
      res.status(404).json({ message: `No mock rule found for ${method} ${userPath}` })
      return
    }

    const rule = mapRow(values)

    // 模拟延迟
    if (rule.delay_ms > 0) {
      await new Promise(resolve => setTimeout(resolve, rule.delay_ms))
    }

    // 解析响应配置
    let responseConfig: { conditions?: (ConditionGroup | ConditionRule)[]; list_count?: number; list_path?: string } = {}
    try {
      responseConfig = JSON.parse(rule.response_config)
    } catch { /* 使用默认空配置 */ }

    // 检查条件返回
    if (responseConfig.conditions && responseConfig.conditions.length > 0) {
      const condResult = evaluateConditionGroups(responseConfig.conditions, {
        query: req.query as Record<string, unknown>,
        headers: req.headers as Record<string, unknown>,
        body: (req.body ?? {}) as Record<string, unknown>,
      })
      if (condResult) {
        applyHeaders(res, rule.headers)
        res.status(condResult.statusCode).json(condResult.responseBody)
        return
      }
    }

    // 解析响应体模板
    let responseBody: unknown
    try {
      responseBody = JSON.parse(rule.response_body)
    } catch {
      responseBody = rule.response_body
    }

    // 生成动态数据
    let data: unknown
    if (responseConfig.list_count && responseConfig.list_count > 0) {
      if (responseConfig.list_path) {
        // 在指定路径处生成列表
        data = generateListAtPath(generateFromTemplate(responseBody), responseConfig.list_path, responseConfig.list_count)
      } else {
        // 整体包装为数组（向后兼容）
        data = generateList(responseBody, responseConfig.list_count)
      }
    } else {
      data = generateFromTemplate(responseBody)
    }

    // 设置自定义响应头
    applyHeaders(res, rule.headers)
    res.status(rule.status_code).json(data)
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

/**
 * 解析并应用自定义响应头。
 *
 * @param res Express 响应对象。
 * @param headersJson JSON 格式的 headers 字符串。
 */
function applyHeaders(res: Response, headersJson: string) {
  try {
    const headers = JSON.parse(headersJson)
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        res.setHeader(key, value)
      }
    }
  } catch { /* 忽略无效 headers */ }
}
