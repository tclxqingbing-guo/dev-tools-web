import type { IRouter } from 'express'
import { Router } from 'express'

export const dictionaryRouter: IRouter = Router()

dictionaryRouter.get('/search', (req, res) => {
  const word = (req.query.word as string || '').trim()
  if (!word) {
    res.json([])
    return
  }
  res.json([{ word, translation: 'Dictionary service - configure SQLite dictionary file' }])
})
