import pg from 'pg'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { Pool } = pg
const here = path.dirname(fileURLToPath(import.meta.url))

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://estatepro:estatepro_local_dev@db:5432/estatepro',
  max: 10,
})

export const query = (text, params) => pool.query(text, params)

export async function one(text, params) {
  const { rows } = await query(text, params)
  return rows[0] || null
}

export async function many(text, params) {
  const { rows } = await query(text, params)
  return rows
}

/** Wait for postgres, then apply schema (idempotent) and seed demo content once. */
export async function initDatabase({ seed = true } = {}) {
  const deadline = Date.now() + 60_000
  for (;;) {
    try {
      await query('SELECT 1')
      break
    } catch (err) {
      if (Date.now() > deadline) throw err
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  await query(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8'))

  if (seed) {
    const { rows } = await query('SELECT COUNT(*)::int AS n FROM properties')
    if (rows[0].n === 0) {
      const { seedDatabase } = await import('./seed.js')
      await seedDatabase()
    }
  }
}
