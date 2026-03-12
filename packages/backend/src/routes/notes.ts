import type { IRouter } from 'express'
import { Router } from 'express'
import initSqlJs from 'sql.js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '../../data')
const dbPath = resolve(dataDir, 'notes.db')

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
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  return db
}

function persist(db: import('sql.js').Database) {
  const data = db.export()
  writeFileSync(dbPath, Buffer.from(data))
}

export const notesRouter: IRouter = Router()

notesRouter.get('/', async (_req, res) => {
  try {
    const database = await getDb()
    const result = database.exec('SELECT * FROM notes ORDER BY updated_at DESC')
    const rows = result[0]?.values?.map((v) => ({
      id: v[0],
      title: v[1],
      content: v[2],
      created_at: v[3],
      updated_at: v[4],
    })) ?? []
    res.json(rows)
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

notesRouter.get('/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const result = database.exec(`SELECT * FROM notes WHERE id = ${id}`)
    const values = result[0]?.values?.[0]
    if (!values) {
      res.status(404).json({ message: 'Note not found' })
      return
    }
    res.json({
      id: values[0],
      title: values[1],
      content: values[2],
      created_at: values[3],
      updated_at: values[4],
    })
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

notesRouter.post('/', async (req, res) => {
  try {
    const database = await getDb()
    const { title, content } = req.body
    database.run('INSERT INTO notes (title, content) VALUES (?, ?)', [title ?? '', content ?? ''])
    const result = database.exec('SELECT last_insert_rowid() as id')
    const id = result[0]?.values?.[0]?.[0] as number
    const row = database.exec(`SELECT * FROM notes WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.status(201).json(
      values
        ? {
            id: values[0],
            title: values[1],
            content: values[2],
            created_at: values[3],
            updated_at: values[4],
          }
        : { id, title: title ?? '', content: content ?? '', created_at: '', updated_at: '' }
    )
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

notesRouter.put('/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    const { title, content } = req.body
    database.run(
      "UPDATE notes SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?",
      [title ?? '', content ?? '', id]
    )
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Note not found' })
      return
    }
    const row = database.exec(`SELECT * FROM notes WHERE id = ${id}`)
    const values = row[0]?.values?.[0]
    persist(database)
    res.json(
      values
        ? {
            id: values[0],
            title: values[1],
            content: values[2],
            created_at: values[3],
            updated_at: values[4],
          }
        : {}
    )
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})

notesRouter.delete('/:id', async (req, res) => {
  try {
    const database = await getDb()
    const id = parseInt(req.params.id, 10)
    if (Number.isNaN(id)) {
      res.status(400).json({ message: 'Invalid id' })
      return
    }
    database.run('DELETE FROM notes WHERE id = ?', [id])
    if (database.getRowsModified() === 0) {
      res.status(404).json({ message: 'Note not found' })
      return
    }
    persist(database)
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: (e as Error).message })
  }
})
