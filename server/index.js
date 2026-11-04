import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { initDatabase, query } from './db.js'
import { attachUser } from './auth.js'
import publicRouter from './routes/public.js'
import accountRouter from './routes/account.js'
import adminRouter from './routes/admin.js'

const app = express()
const PORT = Number(process.env.PORT || 4000)
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads'

app.set('trust proxy', true)
app.use(express.json({ limit: '4mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(attachUser)

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
})

/* ---------- uploads ---------- */
fs.mkdirSync(UPLOAD_DIR, { recursive: true })
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', fallthrough: true }))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase()
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.mimetype)) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  },
})

app.post('/api/uploads', (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  upload.array('files', 12)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    const files = (req.files || []).map((f) => `/uploads/${f.filename}`)
    res.json({ files })
  })
})

/* ---------- routes ---------- */
app.use('/api', publicRouter)
app.use('/api', accountRouter)
app.use('/api/admin', adminRouter)

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[api error]', err)
  const status = err.status || 500
  res.status(status).json({ error: err.expose ? err.message : 'Something went wrong' })
})

async function start() {
  try {
    await initDatabase({ seed: true })
  } catch (err) {
    console.error('[db init] failed', err)
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[api] listening on :${PORT}`)
  })
}

start()

export default app
