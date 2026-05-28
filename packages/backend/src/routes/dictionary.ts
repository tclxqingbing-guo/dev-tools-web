import type { IRouter } from 'express'
import { Router } from 'express'
import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../../data')
const dbPath = resolve(dataDir, 'dictionary.db')

mkdirSync(dataDir, { recursive: true })

type DictionaryValueType = 'object' | 'array' | 'invalid'
type DictionaryTagColor = 'red' | 'green' | 'blue' | 'amber' | 'violet' | 'slate'

interface DictionaryRecord {
  id: number
  name: string
  code: string
  description: string
  value: string
  metadata: string
  value_type: DictionaryValueType
  item_count: number
  created_at: string
  updated_at: string
}

interface DictionaryTagRecord {
  id: number
  name: string
  color: DictionaryTagColor
  created_at: string
  updated_at: string
}

let db: import('sql.js').Database

/**
 * 初始化并返回字典数据库连接。
 *
 * @return 字典数据库连接实例。
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
    CREATE TABLE IF NOT EXISTS dictionaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      code TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      value TEXT NOT NULL DEFAULT '{}',
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS dictionary_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT 'slate',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  ensureMetadataColumn(db)
  return db
}

/**
 * 为旧版字典数据库补齐元数据列。
 *
 * @param database 字典数据库实例。
 */
function ensureMetadataColumn(database: import('sql.js').Database) {
  const tableInfo = database.exec('PRAGMA table_info(dictionaries)')
  const hasMetadata = (tableInfo[0]?.values ?? []).some(column => String(column[1]) === 'metadata')
  if (!hasMetadata) {
    database.run("ALTER TABLE dictionaries ADD COLUMN metadata TEXT NOT NULL DEFAULT '{}'")
    persist(database)
  }
}

/**
 * 将内存数据库保存到磁盘文件。
 *
 * @param database 需要持久化的数据库实例。
 */
function persist(database: import('sql.js').Database) {
  const data = database.export()
  writeFileSync(dbPath, Buffer.from(data))
}

/**
 * 解析字典 JSON 字符串并识别顶层类型。
 *
 * @param value 字典值 JSON 字符串。
 * @return 顶层类型和数组元素数量。
 */
function parseDictionaryValue(value: string): { type: DictionaryValueType; count: number } {
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return { type: 'array', count: parsed.length }
    if (parsed && typeof parsed === 'object') return { type: 'object', count: Object.keys(parsed).length }
  } catch {
    return { type: 'invalid', count: 0 }
  }
  return { type: 'invalid', count: 0 }
}

/**
 * 校验字典值必须是 JSON 对象或数组字符串。
 *
 * @param value 待校验的 JSON 字符串。
 * @return 标准化后的 JSON 字符串。
 */
function normalizeJsonValue(value: unknown): string {
  const rawValue = typeof value === 'string' && value.trim() ? value.trim() : '{}'
  const parsed = JSON.parse(rawValue)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Dictionary value must be a JSON object or array')
  }
  return JSON.stringify(parsed, null, 2)
}

/**
 * 校验并标准化字典元数据。
 *
 * @param value 待校验的元数据。
 * @return 标准化后的 JSON 字符串。
 */
function normalizeMetadataValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '{}'
  const parsed = typeof value === 'string' ? JSON.parse(value) : value
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Dictionary metadata must be a JSON object')
  }
  return JSON.stringify(parsed, null, 2)
}

/**
 * 将数据库行转换为接口记录。
 *
 * @param row 数据库查询结果行。
 * @return 字典记录。
 */
function mapDictionaryRow(row: unknown[]): DictionaryRecord {
  const value = String(row[4] ?? '{}')
  const valueInfo = parseDictionaryValue(value)
  return {
    id: Number(row[0]),
    name: String(row[1] ?? ''),
    code: String(row[2] ?? ''),
    description: String(row[3] ?? ''),
    value,
    metadata: String(row[5] ?? '{}'),
    value_type: valueInfo.type,
    item_count: valueInfo.count,
    created_at: String(row[6] ?? ''),
    updated_at: String(row[7] ?? ''),
  }
}

/**
 * 将数据库行转换为标签记录。
 *
 * @param row 数据库查询结果行。
 * @return 标签记录。
 */
function mapDictionaryTagRow(row: unknown[]): DictionaryTagRecord {
  return {
    id: Number(row[0]),
    name: String(row[1] ?? ''),
    color: normalizeTagColor(row[2]),
    created_at: String(row[3] ?? ''),
    updated_at: String(row[4] ?? ''),
  }
}

/**
 * 查询全部标签记录并按名称排序。
 *
 * @param database 字典数据库实例。
 * @return 标签记录列表。
 */
function getDictionaryTagRows(database: import('sql.js').Database): DictionaryTagRecord[] {
  const result = database.exec('SELECT id, name, color, created_at, updated_at FROM dictionary_tags ORDER BY name ASC, id ASC')
  return (result[0]?.values ?? []).map(mapDictionaryTagRow)
}

/**
 * 校验标签名称。
 *
 * @param value 标签名称。
 * @return 规范化后的标签名称。
 */
function normalizeTagName(value: unknown): string {
  const name = String(value ?? '').trim()
  if (!name) throw new Error('Tag name is required')
  return name
}

/**
 * 校验标签颜色。
 *
 * @param value 标签颜色。
 * @return 规范化后的标签颜色。
 */
function normalizeTagColor(value: unknown): DictionaryTagColor {
  const color = String(value ?? 'slate')
  return ['red', 'green', 'blue', 'amber', 'violet', 'slate'].includes(color) ? color as DictionaryTagColor : 'slate'
}

/**
 * 删除标签后清理字典元数据中的引用。
 *
 * @param database 字典数据库实例。
 * @param tagId 被删除的标签 ID。
 */
function removeTagFromDictionaryMetadata(database: import('sql.js').Database, tagId: number) {
  const rows = database.exec('SELECT id, metadata FROM dictionaries')
  for (const row of rows[0]?.values ?? []) {
    const dictionaryId = Number(row[0])
    const metadataText = String(row[1] ?? '{}')
    try {
      const metadata = JSON.parse(metadataText) as { tagIds?: unknown }
      if (!Array.isArray(metadata.tagIds)) continue
      const nextTagIds = metadata.tagIds.map(Number).filter(id => Number.isInteger(id) && id !== tagId)
      if (nextTagIds.length === metadata.tagIds.length) continue
      metadata.tagIds = nextTagIds
      database.run('UPDATE dictionaries SET metadata = ?, updated_at = datetime(\'now\') WHERE id = ?', [JSON.stringify(metadata, null, 2), dictionaryId])
    } catch {
      // Ignore malformed dictionary metadata while cleaning tag references.
    }
  }
}

/**
 * 查询全部字典记录并按更新时间排序。
 *
 * @param database 字典数据库实例。
 * @return 字典记录列表。
 */
function getDictionaryRows(database: import('sql.js').Database): DictionaryRecord[] {
  const result = database.exec('SELECT id, name, code, description, value, metadata, created_at, updated_at FROM dictionaries ORDER BY updated_at DESC')
  return (result[0]?.values ?? []).map(mapDictionaryRow)
}

/**
 * 按关键词过滤字典记录。
 *
 * @param rows 字典记录列表。
 * @param keyword 搜索关键词。
 * @return 过滤后的字典记录列表。
 */
function filterDictionaryRows(rows: DictionaryRecord[], keyword: string): DictionaryRecord[] {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return rows
  return rows.filter(row =>
    row.name.toLowerCase().includes(normalizedKeyword) ||
    row.code.toLowerCase().includes(normalizedKeyword) ||
    row.description.toLowerCase().includes(normalizedKeyword) ||
    row.value.toLowerCase().includes(normalizedKeyword)
  )
}

export const dictionaryRouter: IRouter = Router()

dictionaryRouter.get('/', async (req, res) => {
  try {
    const database = await getDb()
    const keyword = String(req.query.keyword ?? '').trim()
    res.json(filterDictionaryRows(getDictionaryRows(database), keyword))
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

dictionaryRouter.get('/search', async (req, res) => {
  try {
    const database = await getDb()
    const keyword = String(req.query.keyword ?? req.query.word ?? '').trim()
    res.json(filterDictionaryRows(getDictionaryRows(database), keyword))
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

dictionaryRouter.get('/tags', async (_req, res) => {
  try {
    const database = await getDb()
    res.json(getDictionaryTagRows(database))
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

dictionaryRouter.post('/tags', async (req, res) => {
  try {
    const database = await getDb()
    const name = normalizeTagName(req.body.name)
    const color = normalizeTagColor(req.body.color)
    database.run('INSERT INTO dictionary_tags (name, color) VALUES (?, ?)', [name, color])
    const result = database.exec('SELECT last_insert_rowid() as id')
    const id = result[0]?.values?.[0]?.[0] as number
    const row = database.exec(`SELECT id, name, color, created_at, updated_at FROM dictionary_tags WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.status(201).json(values ? mapDictionaryTagRow(values) : { id, name, color })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

dictionaryRouter.put('/tags/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const name = normalizeTagName(req.body.name)
    const color = normalizeTagColor(req.body.color)
    database.run("UPDATE dictionary_tags SET name = ?, color = ?, updated_at = datetime('now') WHERE id = ?", [name, color, id])
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Tag not found' })
      return
    }
    const row = database.exec(`SELECT id, name, color, created_at, updated_at FROM dictionary_tags WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.json(values ? mapDictionaryTagRow(values) : {})
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

dictionaryRouter.delete('/tags/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    database.run('DELETE FROM dictionary_tags WHERE id = ?', [id])
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Tag not found' })
      return
    }
    removeTagFromDictionaryMetadata(database, id)
    persist(database)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

dictionaryRouter.get('/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const row = database.exec(`SELECT id, name, code, description, value, metadata, created_at, updated_at FROM dictionaries WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    if (!values) {
      res.status(404).json({ message: 'Dictionary not found' })
      return
    }
    res.json(mapDictionaryRow(values))
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})

dictionaryRouter.post('/', async (req, res) => {
  try {
    const database = await getDb()
    const value = normalizeJsonValue(req.body.value)
    const metadata = normalizeMetadataValue(req.body.metadata)
    const name = String(req.body.name ?? '').trim()
    const code = String(req.body.code ?? '').trim()
    const description = String(req.body.description ?? '').trim()
    database.run(
      'INSERT INTO dictionaries (name, code, description, value, metadata) VALUES (?, ?, ?, ?, ?)',
      [name || '未命名字典', code, description, value, metadata]
    )
    const result = database.exec('SELECT last_insert_rowid() as id')
    const id = result[0]?.values?.[0]?.[0] as number
    const row = database.exec(`SELECT id, name, code, description, value, metadata, created_at, updated_at FROM dictionaries WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.status(201).json(values ? mapDictionaryRow(values) : { id, name, code, description, value })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

dictionaryRouter.put('/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const value = normalizeJsonValue(req.body.value)
    const name = String(req.body.name ?? '').trim()
    const code = String(req.body.code ?? '').trim()
    const description = String(req.body.description ?? '').trim()
    database.run(
      "UPDATE dictionaries SET name = ?, code = ?, description = ?, value = ?, updated_at = datetime('now') WHERE id = ?",
      [name || '未命名字典', code, description, value, id]
    )
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Dictionary not found' })
      return
    }
    const row = database.exec(`SELECT id, name, code, description, value, metadata, created_at, updated_at FROM dictionaries WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.json(values ? mapDictionaryRow(values) : {})
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

dictionaryRouter.patch('/:id/metadata', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const metadata = normalizeMetadataValue(req.body.metadata)
    database.run(
      "UPDATE dictionaries SET metadata = ?, updated_at = datetime('now') WHERE id = ?",
      [metadata, id]
    )
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Dictionary not found' })
      return
    }
    const row = database.exec(`SELECT id, name, code, description, value, metadata, created_at, updated_at FROM dictionaries WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.json(values ? mapDictionaryRow(values) : {})
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
})

dictionaryRouter.delete('/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    database.run('DELETE FROM dictionaries WHERE id = ?', [id])
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Dictionary not found' })
      return
    }
    persist(database)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: (error as Error).message })
  }
})
