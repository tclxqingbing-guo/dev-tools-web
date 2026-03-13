import type { IRouter } from 'express'
import { Router } from 'express'
import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../../data')
const dbPath = resolve(dataDir, 'wishes.db')

mkdirSync(dataDir, { recursive: true })

let db: import('sql.js').Database

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
    CREATE TABLE IF NOT EXISTS wishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('problem', 'wish')),
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS wish_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wish_id INTEGER NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  return db
}

function persist(database: import('sql.js').Database) {
  const data = database.export()
  writeFileSync(dbPath, Buffer.from(data))
}

export const wishesRouter: IRouter = Router()

wishesRouter.get('/', async (req, res) => {
  try {
    const database = await getDb()
    const type = req.query.type as string | undefined
    let sql = 'SELECT * FROM wishes ORDER BY created_at DESC'
    if (type === 'problem' || type === 'wish') {
      sql = `SELECT * FROM wishes WHERE type = '${type}' ORDER BY created_at DESC`
    }
    const result = database.exec(sql)
    const rows = (result[0]?.values ?? []).map((v) => ({
      id: v[0],
      type: v[1],
      content: v[2],
      created_at: v[3],
    }))
    res.json(rows)
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

wishesRouter.get('/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const wishResult = database.exec(`SELECT * FROM wishes WHERE id = ${id}`)
    const wishRow = wishResult[0]?.values?.[0]
    if (!wishRow) {
      res.status(404).json({ message: 'Not found' })
      return
    }
    const wish = { id: wishRow[0], type: wishRow[1], content: wishRow[2], created_at: wishRow[3] }
    const commentResult = database.exec(`SELECT * FROM wish_comments WHERE wish_id = ${id} ORDER BY created_at ASC`)
    const comments = (commentResult[0]?.values ?? []).map((v) => ({
      id: v[0],
      wish_id: v[1],
      content: v[2],
      created_at: v[3],
    }))
    res.json({ ...wish, comments })
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

wishesRouter.post('/', async (req, res) => {
  try {
    const database = await getDb()
    const { type, content } = req.body
    const t = type === 'wish' ? 'wish' : 'problem'
    database.run('INSERT INTO wishes (type, content) VALUES (?, ?)', [t, content ?? ''])
    const result = database.exec('SELECT last_insert_rowid() as id')
    const id = result[0]?.values?.[0]?.[0] as number
    const row = database.exec(`SELECT * FROM wishes WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.status(201).json(
      values
        ? { id: values[0], type: values[1], content: values[2], created_at: values[3] }
        : { id, type: t, content: content ?? '', created_at: '' }
    )
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

wishesRouter.post('/:id/comments', async (req, res) => {
  try {
    const database = await getDb()
    const wishId = parseInt(req.params.id, 10)
    if (Number.isNaN(wishId)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const check = database.exec(`SELECT 1 FROM wishes WHERE id = ${wishId}`)
    if (!check[0]?.values?.length) {
      res.status(404).json({ message: 'Not found' })
      return
    }
    const { content } = req.body
    database.run('INSERT INTO wish_comments (wish_id, content) VALUES (?, ?)', [wishId, content ?? ''])
    const result = database.exec('SELECT last_insert_rowid() as id')
    const id = result[0]?.values?.[0]?.[0] as number
    const row = database.exec(`SELECT * FROM wish_comments WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.status(201).json(
      values
        ? { id: values[0], wish_id: values[1], content: values[2], created_at: values[3] }
        : { id, wish_id: wishId, content: content ?? '', created_at: '' }
    )
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})
