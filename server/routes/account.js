import { Router } from 'express'
import crypto from 'node:crypto'
import { many, one, query } from '../db.js'
import {
  SESSION_COOKIE,
  cookieHeader,
  createSession,
  destroySession,
  destroyUserSessions,
  hashPassword,
  randomToken,
  reference,
  requireAuth,
  sessionCookieValue,
  slugify,
  verifyPassword,
} from '../auth.js'
import { PROPERTY_COLUMNS, PROPERTY_FROM, mapProperty } from '../lib/properties.js'

const router = Router()
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const publicUser = (u) =>
  u && {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    avatar: u.avatar,
    status: u.status,
    created_at: u.created_at,
  }

function startSession(res, userId) {
  return createSession(userId).then((token) => {
    res.setHeader(
      'Set-Cookie',
      cookieHeader(SESSION_COOKIE, sessionCookieValue(token), { maxAge: 60 * 60 * 24 * 30 }),
    )
    return token
  })
}

async function agentForUser(userId) {
  return one('SELECT id FROM agents WHERE user_id = $1', [userId])
}

/* ======================= auth ======================= */

router.post(
  '/auth/register',
  ah(async (req, res) => {
    const { name, email, password, phone } = req.body || {}
    const errors = {}
    if (!name || String(name).trim().length < 2) errors.name = 'Please enter your full name'
    if (!email || !EMAIL_RE.test(String(email))) errors.email = 'Please enter a valid email'
    if (!password || String(password).length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (Object.keys(errors).length) return res.status(400).json({ errors })

    const exists = await one('SELECT id FROM users WHERE lower(email) = lower($1)', [email])
    if (exists) return res.status(409).json({ errors: { email: 'This email is already registered' } })

    const user = await one(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1,$2,$3,$4,'user') RETURNING *`,
      [String(name).trim(), String(email).trim().toLowerCase(), hashPassword(String(password)), phone || null],
    )
    await startSession(res, user.id)
    res.status(201).json({ user: publicUser(user) })
  }),
)

router.post(
  '/auth/login',
  ah(async (req, res) => {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
    const user = await one('SELECT * FROM users WHERE lower(email) = lower($1)', [String(email).trim()])
    if (!user || !verifyPassword(String(password), user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended. Please contact support.' })
    }
    await startSession(res, user.id)
    res.json({ user: publicUser(user) })
  }),
)

router.post(
  '/auth/logout',
  ah(async (req, res) => {
    await destroySession(req.sessionToken)
    res.setHeader('Set-Cookie', cookieHeader(SESSION_COOKIE, '', { maxAge: 0 }))
    res.json({ ok: true })
  }),
)

router.get(
  '/auth/me',
  ah(async (req, res) => {
    if (!req.user) return res.json({ user: null })
    const agent = await agentForUser(req.user.id)
    res.json({ user: { ...publicUser(req.user), agent_id: agent?.id ?? null } })
  }),
)

router.patch(
  '/auth/profile',
  requireAuth,
  ah(async (req, res) => {
    const { name, phone, avatar, password, currentPassword } = req.body || {}
    const fields = []
    const values = []
    const set = (col, val) => {
      values.push(val)
      fields.push(`${col} = $${values.length}`)
    }
    if (name !== undefined) {
      if (String(name).trim().length < 2) return res.status(400).json({ error: 'Name is too short' })
      set('name', String(name).trim())
    }
    if (phone !== undefined) set('phone', phone || null)
    if (avatar !== undefined) set('avatar', avatar || null)
    if (password) {
      if (String(password).length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' })
      }
      const current = await one('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
      if (!verifyPassword(String(currentPassword || ''), current.password_hash)) {
        return res.status(400).json({ error: 'Current password is incorrect' })
      }
      set('password_hash', hashPassword(String(password)))
    }
    if (!fields.length) return res.json({ ok: true })
    values.push(req.user.id)
    const user = await one(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    )
    res.json({ user: publicUser(user) })
  }),
)

router.post(
  '/auth/forgot-password',
  ah(async (req, res) => {
    const email = String(req.body?.email || '').trim()
    const generic = { ok: true, message: 'If that email is registered, a reset link has been created.' }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email' })
    const user = await one('SELECT id FROM users WHERE lower(email) = lower($1)', [email])
    if (!user) return res.json(generic)

    const token = randomToken()
    await query(
      `INSERT INTO password_resets (token, user_id, expires_at)
       VALUES ($1,$2, now() + interval '2 hours')`,
      [token, user.id],
    )
    // No mail transport is configured for this environment, so the link is
    // returned directly to the interface instead of being emailed.
    res.json({ ...generic, resetToken: token })
  }),
)

router.post(
  '/auth/reset-password',
  ah(async (req, res) => {
    const { token, password } = req.body || {}
    if (!token) return res.status(400).json({ error: 'Reset token is missing' })
    if (!password || String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }
    const row = await one(
      `SELECT * FROM password_resets
        WHERE token = $1 AND used_at IS NULL AND expires_at > now()`,
      [token],
    )
    if (!row) return res.status(400).json({ error: 'This reset link is invalid or has expired' })
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashPassword(String(password)),
      row.user_id,
    ])
    await query('UPDATE password_resets SET used_at = now() WHERE token = $1', [token])
    await destroyUserSessions(row.user_id)
    res.json({ ok: true })
  }),
)

/* ======================= favorites ======================= */

router.get(
  '/me/favorite-ids',
  requireAuth,
  ah(async (req, res) => {
    const rows = await many('SELECT property_id FROM favorites WHERE user_id = $1', [req.user.id])
    res.json(rows.map((r) => r.property_id))
  }),
)

router.get(
  '/favorites',
  requireAuth,
  ah(async (req, res) => {
    const rows = await many(
      `SELECT ${PROPERTY_COLUMNS} ${PROPERTY_FROM}
         JOIN favorites f ON f.property_id = p.id AND f.user_id = $1
        ORDER BY f.created_at DESC`,
      [req.user.id],
    )
    res.json(rows.map((r) => ({ ...mapProperty(r), is_favorite: true })))
  }),
)

router.post(
  '/favorites/:id',
  requireAuth,
  ah(async (req, res) => {
    await query(
      'INSERT INTO favorites (user_id, property_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.id, Number(req.params.id)],
    )
    res.json({ ok: true, favorite: true })
  }),
)

router.delete(
  '/favorites/:id',
  requireAuth,
  ah(async (req, res) => {
    await query('DELETE FROM favorites WHERE user_id = $1 AND property_id = $2', [
      req.user.id,
      Number(req.params.id),
    ])
    res.json({ ok: true, favorite: false })
  }),
)

/* ======================= my listings ======================= */

router.get(
  '/me/properties',
  requireAuth,
  ah(async (req, res) => {
    const rows = await many(
      `SELECT ${PROPERTY_COLUMNS} ${PROPERTY_FROM}
        WHERE p.owner_id = $1 ORDER BY p.created_at DESC`,
      [req.user.id],
    )
    res.json(rows.map(mapProperty))
  }),
)

router.get(
  '/me/inquiries',
  requireAuth,
  ah(async (req, res) => {
    const rows = await many(
      `SELECT i.*, p.slug AS property_slug, p.title_en AS property_title_en,
              p.title_fa AS property_title_fa,
              (SELECT url FROM property_images WHERE property_id = p.id ORDER BY is_cover DESC, sort LIMIT 1) AS cover
         FROM inquiries i LEFT JOIN properties p ON p.id = i.property_id
        WHERE i.user_id = $1 OR lower(i.email) = lower($2)
        ORDER BY i.created_at DESC`,
      [req.user.id, req.user.email],
    )
    res.json(rows)
  }),
)

router.get(
  '/me/recently-viewed',
  requireAuth,
  ah(async (req, res) => {
    const rows = await many(
      `SELECT * FROM (
         SELECT DISTINCT ON (v.property_id) v.property_id, v.created_at AS viewed_at,
                ${PROPERTY_COLUMNS}
           FROM property_views v
           JOIN properties p ON p.id = v.property_id
           LEFT JOIN categories c ON c.id = p.category_id
           LEFT JOIN cities ci ON ci.id = p.city_id
           LEFT JOIN agents a ON a.id = p.agent_id
           LEFT JOIN users u ON u.id = p.owner_id
          WHERE v.user_id = $1 AND p.status = 'active'
          ORDER BY v.property_id, v.created_at DESC
       ) recent ORDER BY viewed_at DESC LIMIT 8`,
      [req.user.id],
    )
    res.json(rows.map((r) => ({ ...mapProperty(r), viewed_at: r.viewed_at })))
  }),
)

/* ======================= property submission ======================= */

const toNum = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

async function uniqueSlug(base, ignoreId = null) {
  const root = slugify(base) || 'property'
  let candidate = root
  let i = 1
  for (;;) {
    const row = await one('SELECT id FROM properties WHERE slug = $1', [candidate])
    if (!row || row.id === ignoreId) return candidate
    i += 1
    candidate = `${root}-${i}`
  }
}

function normaliseBody(body) {
  return {
    title_en: String(body.title_en || body.title || '').trim(),
    title_fa: String(body.title_fa || body.title || '').trim(),
    description_en: String(body.description_en || body.description || '').trim(),
    description_fa: String(body.description_fa || body.description || '').trim(),
    category_id: body.category_id ? Number(body.category_id) : null,
    listing_type: body.listing_type === 'rent' ? 'rent' : 'sale',
    price: toNum(body.price),
    currency: body.currency || 'AED',
    city_id: body.city_id ? Number(body.city_id) : null,
    neighborhood: body.neighborhood || null,
    address: body.address || null,
    bedrooms: toNum(body.bedrooms),
    bathrooms: toNum(body.bathrooms),
    area: toNum(body.area),
    parking: toNum(body.parking),
    floor: body.floor || null,
    year_built: body.year_built ? toNum(body.year_built) : null,
    furnishing: body.furnishing || null,
    is_new: Boolean(body.is_new),
    images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],
    amenities: Array.isArray(body.amenities) ? body.amenities.map(Number).filter(Boolean) : [],
  }
}

function validateSubmission(d) {
  const errors = {}
  if (d.title_en.length < 4) errors.title = 'Please give the listing a descriptive title'
  if (!d.category_id) errors.category_id = 'Choose a property type'
  if (!d.city_id) errors.city_id = 'Choose a city'
  if (!(d.price > 0)) errors.price = 'Enter a price greater than zero'
  if (!(d.area > 0)) errors.area = 'Enter the property area'
  if (!d.images.length) errors.images = 'Add at least one photo'
  if (d.description_en.length < 20) errors.description = 'Please describe the property (at least 20 characters)'
  return errors
}

router.post(
  '/properties',
  requireAuth,
  ah(async (req, res) => {
    const d = normaliseBody(req.body || {})
    const errors = validateSubmission(d)
    if (Object.keys(errors).length) return res.status(400).json({ errors })

    const agent = req.user.role === 'agent' ? await agentForUser(req.user.id) : null
    const slug = await uniqueSlug(d.title_en || d.title_fa)
    const ref = reference()

    const row = await one(
      `INSERT INTO properties (
         reference, slug, title_en, title_fa, description_en, description_fa, category_id,
         listing_type, price, currency, city_id, neighborhood, address, bedrooms, bathrooms,
         area, parking, floor, year_built, furnishing, is_new, status, agent_id, owner_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,
         'pending',$22,$23) RETURNING id, slug, reference`,
      [
        ref, slug, d.title_en, d.title_fa, d.description_en, d.description_fa, d.category_id,
        d.listing_type, d.price, d.currency, d.city_id, d.neighborhood, d.address, d.bedrooms,
        d.bathrooms, d.area, d.parking, d.floor, d.year_built, d.furnishing, d.is_new,
        agent?.id ?? null, req.user.id,
      ],
    )

    for (const [i, url] of d.images.entries()) {
      await query(
        'INSERT INTO property_images (property_id, url, sort, is_cover) VALUES ($1,$2,$3,$4)',
        [row.id, url, i, i === 0],
      )
    }
    for (const amenityId of d.amenities) {
      await query(
        'INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [row.id, amenityId],
      )
    }

    res.status(201).json({ id: row.id, slug: row.slug, reference: row.reference, status: 'pending' })
  }),
)

async function loadOwnedProperty(req, res) {
  const id = Number(req.params.id)
  const row = await one('SELECT * FROM properties WHERE id = $1', [id])
  if (!row) {
    res.status(404).json({ error: 'Property not found' })
    return null
  }
  const isOwner = row.owner_id === req.user.id
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403).json({ error: 'You can only edit your own listings' })
    return null
  }
  if (isOwner && !['pending', 'rejected', 'active'].includes(row.status)) {
    res.status(400).json({ error: 'This listing can no longer be edited' })
    return null
  }
  return row
}

router.patch(
  '/properties/:id',
  requireAuth,
  ah(async (req, res) => {
    const existing = await loadOwnedProperty(req, res)
    if (!existing) return
    const d = normaliseBody({ ...existing, ...req.body })
    if (req.body.images === undefined) d.images = []

    const agent = req.user.role === 'agent' ? await agentForUser(req.user.id) : null
    const nextStatus =
      req.user.role === 'admin' ? existing.status : existing.status === 'active' ? 'active' : 'pending'

    await query(
      `UPDATE properties SET
         title_en=$1, title_fa=$2, description_en=$3, description_fa=$4, category_id=$5,
         listing_type=$6, price=$7, currency=$8, city_id=$9, neighborhood=$10, address=$11,
         bedrooms=$12, bathrooms=$13, area=$14, parking=$15, floor=$16, year_built=$17,
         furnishing=$18, is_new=$19, status=$20, agent_id=COALESCE($21, agent_id), updated_at=now()
       WHERE id=$22`,
      [
        d.title_en, d.title_fa, d.description_en, d.description_fa, d.category_id, d.listing_type,
        d.price, d.currency, d.city_id, d.neighborhood, d.address, d.bedrooms, d.bathrooms,
        d.area, d.parking, d.floor, d.year_built, d.furnishing, d.is_new, nextStatus,
        agent?.id ?? null, existing.id,
      ],
    )

    if (req.body.images !== undefined) {
      await query('DELETE FROM property_images WHERE property_id = $1', [existing.id])
      for (const [i, url] of d.images.entries()) {
        await query(
          'INSERT INTO property_images (property_id, url, sort, is_cover) VALUES ($1,$2,$3,$4)',
          [existing.id, url, i, i === 0],
        )
      }
    }
    if (req.body.amenities !== undefined) {
      await query('DELETE FROM property_amenities WHERE property_id = $1', [existing.id])
      for (const amenityId of d.amenities) {
        await query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [existing.id, amenityId],
        )
      }
    }

    res.json({ ok: true, status: nextStatus })
  }),
)

router.delete(
  '/properties/:id',
  requireAuth,
  ah(async (req, res) => {
    const row = await one('SELECT id, owner_id FROM properties WHERE id = $1', [Number(req.params.id)])
    if (!row) return res.status(404).json({ error: 'Property not found' })
    if (row.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only remove your own listings' })
    }
    await query('DELETE FROM properties WHERE id = $1', [row.id])
    res.json({ ok: true })
  }),
)

router.get(
  '/me/summary',
  requireAuth,
  ah(async (req, res) => {
    const row = await one(
      `SELECT
        (SELECT COUNT(*)::int FROM favorites WHERE user_id = $1) AS favorites,
        (SELECT COUNT(*)::int FROM properties WHERE owner_id = $1) AS listings,
        (SELECT COUNT(*)::int FROM properties WHERE owner_id = $1 AND status = 'active') AS live,
        (SELECT COUNT(*)::int FROM inquiries WHERE user_id = $1 OR lower(email) = lower($2)) AS inquiries,
        (SELECT COUNT(*)::int FROM property_views WHERE user_id = $1) AS viewed`,
      [req.user.id, req.user.email],
    )
    res.json(row)
  }),
)

export default router
