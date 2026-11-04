import crypto from 'node:crypto'
import { one, query } from './db.js'

const SECRET = process.env.SESSION_SECRET || 'estatepro-dev-secret'
export const SESSION_COOKIE = 'ep_session'
const SESSION_DAYS = 30

/* ---------- passwords ---------- */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password, stored) {
  if (!stored) return false
  const [scheme, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const candidate = crypto.scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  )
}

/* ---------- cookies ---------- */
export function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    if (!key) continue
    out[key] = decodeURIComponent(part.slice(idx + 1).trim())
  }
  return out
}

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex')
}

export function cookieHeader(name, value, { maxAge = 0 } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (maxAge) parts.push(`Max-Age=${maxAge}`)
  else parts.push('Max-Age=0')
  return parts.join('; ')
}

/* ---------- sessions ---------- */
export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex')
  await query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, now() + interval '${SESSION_DAYS} days')`,
    [token, userId],
  )
  return token
}

export async function destroySession(token) {
  if (!token) return
  await query('DELETE FROM sessions WHERE token = $1', [token])
}

export async function destroyUserSessions(userId) {
  await query('DELETE FROM sessions WHERE user_id = $1', [userId])
}

export function sessionCookieValue(token) {
  return `${token}.${sign(token)}`
}

export function readSessionToken(req) {
  const raw = parseCookies(req.headers.cookie).ep_session
  if (!raw) return null
  const [token, sig] = raw.split('.')
  if (!token || !sig) return null
  const expected = sign(token)
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null
  }
  return token
}

/* ---------- request middleware ---------- */
export async function attachUser(req, _res, next) {
  try {
    const token = readSessionToken(req)
    if (!token) return next()
    const row = await one(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar, u.status, u.created_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token = $1 AND s.expires_at > now()`,
      [token],
    )
    if (row && row.status !== 'suspended') {
      req.user = row
      req.sessionToken = token
    }
    next()
  } catch (err) {
    next(err)
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  next()
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have access to this resource' })
    }
    next()
  }
}

export const isAdmin = (user) => user?.role === 'admin'

/* ---------- misc ---------- */
export const randomToken = () => crypto.randomBytes(24).toString('hex')

export function reference() {
  return `EP-${crypto.randomInt(100000, 999999)}`
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}
