import { Router } from 'express'
import { many, one, query } from '../db.js'
import {
  PROPERTY_COLUMNS,
  PROPERTY_FROM,
  buildPropertyFilters,
  mapProperty,
} from '../lib/properties.js'

const router = Router()
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

const DEFAULT_SETTINGS = { siteName: 'EstatePro', stats: [], sections: {}, faq: [] }

export async function getSettings() {
  const row = await one('SELECT data FROM site_settings WHERE id = 1')
  return row?.data || DEFAULT_SETTINGS
}

router.get(
  '/health',
  ah(async (_req, res) => {
    await query('SELECT 1')
    res.json({ ok: true, service: 'estatepro-api', time: new Date().toISOString() })
  }),
)

/* ---------- bootstrap: everything the shell needs in one round-trip ---------- */
router.get(
  '/bootstrap',
  ah(async (_req, res) => {
    const [settings, categories, cities, amenities] = await Promise.all([
      getSettings(),
      many(
        `SELECT c.*, COUNT(p.id) FILTER (WHERE p.status = 'active')::int AS count
           FROM categories c
           LEFT JOIN properties p ON p.category_id = c.id
          GROUP BY c.id ORDER BY c.sort, c.id`,
      ),
      many(
        `SELECT ci.*, COUNT(p.id) FILTER (WHERE p.status = 'active')::int AS count
           FROM cities ci
           LEFT JOIN properties p ON p.city_id = ci.id
          GROUP BY ci.id ORDER BY ci.sort, ci.id`,
      ),
      many('SELECT * FROM amenities ORDER BY id'),
    ])
    const neighborhoods = await many(
      'SELECT id, city_id, name_en, name_fa FROM neighborhoods ORDER BY id',
    )
    const counts = await one(
      `SELECT
         (SELECT COUNT(*)::int FROM properties WHERE status = 'active') AS properties,
         (SELECT COUNT(*)::int FROM agents) AS agents,
         (SELECT COUNT(*)::int FROM cities) AS cities`,
    )
    res.json({ settings, categories, cities, neighborhoods, amenities, counts })
  }),
)

/* ---------- locations ---------- */
router.get(
  '/locations',
  ah(async (_req, res) => {
    const rows = await many(
      `SELECT ci.*, COUNT(p.id) FILTER (WHERE p.status = 'active')::int AS count
         FROM cities ci LEFT JOIN properties p ON p.city_id = ci.id
        GROUP BY ci.id ORDER BY ci.sort, ci.id`,
    )
    res.json(rows)
  }),
)

/* ---------- properties ---------- */
router.get(
  '/properties',
  ah(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 9))
    const { whereSql, values, orderSql } = buildPropertyFilters(req.query, 'public')

    const totalRow = await one(
      `SELECT COUNT(*)::int AS n ${PROPERTY_FROM} ${whereSql}`,
      values,
    )
    const rows = await many(
      `SELECT ${PROPERTY_COLUMNS} ${PROPERTY_FROM} ${whereSql}
        ORDER BY ${orderSql} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, (page - 1) * limit],
    )

    // lightweight search analytics for the admin reports module
    if (req.query.city || req.query.q) {
      query('INSERT INTO search_events (city, query) VALUES ($1,$2)', [
        req.query.city || null,
        (req.query.q || '').slice(0, 120) || null,
      ]).catch(() => {})
    }

    res.json({
      items: rows.map(mapProperty),
      total: totalRow.n,
      page,
      pages: Math.max(1, Math.ceil(totalRow.n / limit)),
      limit,
    })
  }),
)

router.get(
  '/search/suggest',
  ah(async (req, res) => {
    const q = String(req.query.q || '').trim()
    if (q.length < 2) return res.json([])
    const like = `%${q}%`
    const rows = await many(
      `SELECT p.slug, p.title_en, p.title_fa, p.price, p.currency, p.neighborhood,
              ci.name_en AS city_name_en, ci.name_fa AS city_name_fa,
              (SELECT url FROM property_images WHERE property_id = p.id ORDER BY is_cover DESC, sort LIMIT 1) AS cover
         FROM properties p
         LEFT JOIN cities ci ON ci.id = p.city_id
        WHERE p.status = 'active'
          AND (p.title_en ILIKE $1 OR p.title_fa ILIKE $1 OR p.neighborhood ILIKE $1)
        ORDER BY p.is_featured DESC, p.created_at DESC LIMIT 6`,
      [like],
    )
    res.json(rows)
  }),
)

router.get(
  '/properties/:slug',
  ah(async (req, res) => {
    const row = await one(
      `SELECT ${PROPERTY_COLUMNS} ${PROPERTY_FROM}
        WHERE p.slug = $1 AND (p.status = 'active' OR p.status = 'sold'
          OR p.owner_id = $2 OR $3::boolean)`,
      [req.params.slug, req.user?.id ?? null, req.user?.role === 'admin'],
    )
    if (!row) return res.status(404).json({ error: 'Property not found' })

    const property = mapProperty(row)

    const similar = await many(
      `SELECT ${PROPERTY_COLUMNS} ${PROPERTY_FROM}
        WHERE p.status = 'active' AND p.id <> $1
          AND (p.category_id = $2 OR p.city_id = $3)
        ORDER BY ABS(p.price - $4) ASC LIMIT 3`,
      [property.id, property.category_id, property.city_id, property.price],
    )

    query('UPDATE properties SET views = views + 1 WHERE id = $1', [property.id]).catch(() => {})
    query('INSERT INTO property_views (property_id, user_id) VALUES ($1,$2)', [
      property.id,
      req.user?.id ?? null,
    ]).catch(() => {})

    let isFavorite = false
    if (req.user) {
      const fav = await one(
        'SELECT 1 AS ok FROM favorites WHERE user_id = $1 AND property_id = $2',
        [req.user.id, property.id],
      )
      isFavorite = Boolean(fav)
    }

    res.json({ property: { ...property, is_favorite: isFavorite }, similar: similar.map(mapProperty) })
  }),
)

/* ---------- agents ---------- */
router.get(
  '/agents',
  ah(async (_req, res) => {
    const rows = await many(
      `SELECT a.*, COUNT(p.id) FILTER (WHERE p.status = 'active')::int AS listings
         FROM agents a LEFT JOIN properties p ON p.agent_id = a.id
        GROUP BY a.id ORDER BY a.experience DESC, a.id`,
    )
    res.json(rows)
  }),
)

router.get(
  '/agents/:slug',
  ah(async (req, res) => {
    const agent = await one('SELECT * FROM agents WHERE slug = $1', [req.params.slug])
    if (!agent) return res.status(404).json({ error: 'Agent not found' })
    const listings = await many(
      `SELECT ${PROPERTY_COLUMNS} ${PROPERTY_FROM}
        WHERE a.id = $1 AND p.status = 'active' ORDER BY p.created_at DESC LIMIT 6`,
      [agent.id],
    )
    const reviews = await many(
      `SELECT id, name, avatar, rating, body, created_at FROM reviews
        WHERE agent_id = $1 AND status = 'approved' ORDER BY created_at DESC LIMIT 6`,
      [agent.id],
    )
    res.json({ agent, listings: listings.map(mapProperty), reviews })
  }),
)

/* ---------- reviews & testimonials ---------- */
router.get(
  '/reviews',
  ah(async (req, res) => {
    const limit = Math.min(24, Number(req.query.limit) || 6)
    const rows = await many(
      `SELECT r.id, r.name, r.avatar, r.rating, r.body, r.created_at,
              p.slug AS property_slug, p.title_en AS property_title_en,
              p.title_fa AS property_title_fa, p.reference AS property_reference
         FROM reviews r LEFT JOIN properties p ON p.id = r.property_id
        WHERE r.status = 'approved' ORDER BY r.created_at DESC LIMIT $1`,
      [limit],
    )
    res.json(rows)
  }),
)

router.post(
  '/reviews',
  ah(async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Sign in to leave a review' })
    const { rating, body, propertyId, agentId } = req.body || {}
    if (!body || String(body).trim().length < 10) {
      return res.status(400).json({ error: 'Please write at least a sentence about your experience' })
    }
    const row = await one(
      `INSERT INTO reviews (user_id, property_id, agent_id, name, avatar, rating, body, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING id`,
      [
        req.user.id,
        propertyId || null,
        agentId || null,
        req.user.name,
        req.user.avatar,
        Math.min(5, Math.max(1, Number(rating) || 5)),
        String(body).trim(),
      ],
    )
    res.status(201).json({ id: row.id, status: 'pending' })
  }),
)

/* ---------- developments ---------- */
router.get(
  '/developments',
  ah(async (_req, res) => {
    const rows = await many(
      `SELECT d.*, ci.name_en AS city_name_en, ci.name_fa AS city_name_fa
         FROM developments d LEFT JOIN cities ci ON ci.id = d.city_id
        ORDER BY d.id`,
    )
    res.json(rows.map((r) => ({ ...r, price_from: r.price_from ? Number(r.price_from) : null })))
  }),
)

/* ---------- inquiries & newsletter ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

router.post(
  '/inquiries',
  ah(async (req, res) => {
    const { name, email, phone, subject, message, propertyId, agentId, kind } = req.body || {}
    const errors = {}
    if (!name || String(name).trim().length < 2) errors.name = 'Please enter your name'
    if (!email || !EMAIL_RE.test(String(email))) errors.email = 'Please enter a valid email'
    if (!message || String(message).trim().length < 5) errors.message = 'Please add a short message'
    if (Object.keys(errors).length) return res.status(400).json({ errors })

    let resolvedAgent = agentId || null
    if (propertyId && !resolvedAgent) {
      const p = await one('SELECT agent_id FROM properties WHERE id = $1', [propertyId])
      resolvedAgent = p?.agent_id ?? null
    }

    const row = await one(
      `INSERT INTO inquiries (kind, property_id, agent_id, user_id, name, email, phone, subject, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, created_at`,
      [
        kind === 'contact' ? 'contact' : 'property',
        propertyId || null,
        resolvedAgent,
        req.user?.id ?? null,
        String(name).trim(),
        String(email).trim(),
        phone || null,
        subject || (kind === 'contact' ? 'Website enquiry' : 'Property enquiry'),
        String(message).trim(),
      ],
    )
    res.status(201).json({ ok: true, id: row.id, message: 'Your message has been sent' })
  }),
)

router.post(
  '/newsletter',
  ah(async (req, res) => {
    const email = String(req.body?.email || '').trim()
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email' })
    await query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [email],
    )
    res.status(201).json({ ok: true, message: 'You are subscribed' })
  }),
)

export default router
