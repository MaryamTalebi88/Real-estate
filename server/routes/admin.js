import { Router } from 'express'
import { many, one, query } from '../db.js'
import { hashPassword, reference, requireRole, slugify } from '../auth.js'
import {
  PROPERTY_COLUMNS,
  PROPERTY_FROM,
  buildPropertyFilters,
  mapProperty,
} from '../lib/properties.js'

const router = Router()
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

router.use(requireRole('admin'))

async function uniqueSlug(table, base, ignoreId = null) {
  const root = slugify(base) || 'item'
  let candidate = root
  let i = 1
  for (;;) {
    const row = await one(`SELECT id FROM ${table} WHERE slug = $1`, [candidate])
    if (!row || row.id === ignoreId) return candidate
    i += 1
    candidate = `${root}-${i}`
  }
}

/* ======================= overview ======================= */

router.get(
  '/stats',
  ah(async (_req, res) => {
    const counts = await one(
      `SELECT
        (SELECT COUNT(*)::int FROM properties) AS properties,
        (SELECT COUNT(*)::int FROM properties WHERE status = 'active') AS active,
        (SELECT COUNT(*)::int FROM properties WHERE status = 'pending') AS pending,
        (SELECT COUNT(*)::int FROM properties WHERE is_featured) AS featured,
        (SELECT COUNT(*)::int FROM users) AS users,
        (SELECT COUNT(*)::int FROM agents) AS agents,
        (SELECT COUNT(*)::int FROM inquiries) AS inquiries,
        (SELECT COUNT(*)::int FROM inquiries WHERE status = 'new') AS new_inquiries,
        (SELECT COUNT(*)::int FROM reviews WHERE status = 'pending') AS pending_reviews,
        (SELECT COUNT(*)::int FROM newsletter_subscribers) AS subscribers,
        (SELECT COUNT(*)::int FROM favorites) AS favorites,
        (SELECT COALESCE(SUM(views),0)::int FROM properties) AS views`,
    )
    const activity = await many(
      `SELECT * FROM (
         SELECT 'property' AS kind, p.id, p.title_en AS title, p.created_at,
                CASE WHEN p.status = 'pending' THEN 'Submitted for review' ELSE 'Listing updated' END AS detail
           FROM properties p ORDER BY p.created_at DESC LIMIT 5
       ) a
       UNION ALL
       SELECT * FROM (
         SELECT 'user' AS kind, u.id, u.name AS title, u.created_at, 'New account registered' AS detail
           FROM users u ORDER BY u.created_at DESC LIMIT 5
       ) b
       UNION ALL
       SELECT * FROM (
         SELECT 'inquiry' AS kind, i.id, i.name AS title, i.created_at, i.subject AS detail
           FROM inquiries i ORDER BY i.created_at DESC LIMIT 5
       ) c
       ORDER BY created_at DESC LIMIT 10`,
    )
    res.json({ counts, activity })
  }),
)

/* ======================= properties ======================= */

router.get(
  '/properties',
  ah(async (req, res) => {
    const { whereSql, values, orderSql } = buildPropertyFilters(req.query, 'admin')
    const rows = await many(
      `SELECT ${PROPERTY_COLUMNS} ${PROPERTY_FROM} ${whereSql} ORDER BY ${orderSql} LIMIT 200`,
      values,
    )
    res.json(rows.map(mapProperty))
  }),
)

const PROPERTY_FIELDS = [
  'title_en', 'title_fa', 'description_en', 'description_fa', 'category_id', 'listing_type',
  'price', 'currency', 'city_id', 'neighborhood', 'address', 'bedrooms', 'bathrooms', 'area',
  'parking', 'floor', 'year_built', 'furnishing', 'is_new', 'is_featured', 'is_verified',
  'status', 'agent_id', 'rejection_note',
]

router.post(
  '/properties',
  ah(async (req, res) => {
    const body = req.body || {}
    if (!body.title_en) return res.status(400).json({ error: 'A title is required' })
    const slug = await uniqueSlug('properties', body.title_en)
    const columns = ['reference', 'slug', 'owner_id']
    const values = [reference(), slug, req.user.id]
    for (const field of PROPERTY_FIELDS) {
      if (body[field] !== undefined) {
        columns.push(field)
        values.push(body[field] === '' ? null : body[field])
      }
    }
    const placeholders = values.map((_, i) => `$${i + 1}`)
    const row = await one(
      `INSERT INTO properties (${columns.join(',')}) VALUES (${placeholders.join(',')})
       RETURNING id, slug`,
      values,
    )
    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : []
    for (const [i, url] of images.entries()) {
      await query(
        'INSERT INTO property_images (property_id, url, sort, is_cover) VALUES ($1,$2,$3,$4)',
        [row.id, url, i, i === 0],
      )
    }
    const amenities = Array.isArray(body.amenities) ? body.amenities.map(Number).filter(Boolean) : []
    for (const amenityId of amenities) {
      await query(
        'INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [row.id, amenityId],
      )
    }
    res.status(201).json({ id: row.id, slug: row.slug })
  }),
)

router.patch(
  '/properties/:id',
  ah(async (req, res) => {
    const id = Number(req.params.id)
    const existing = await one('SELECT * FROM properties WHERE id = $1', [id])
    if (!existing) return res.status(404).json({ error: 'Property not found' })

    const body = req.body || {}
    const fields = []
    const values = []
    for (const field of PROPERTY_FIELDS) {
      if (body[field] !== undefined) {
        values.push(body[field] === '' ? null : body[field])
        fields.push(`${field} = $${values.length}`)
      }
    }
    if (body.status && body.status !== 'rejected') {
      values.push(null)
      fields.push(`rejection_note = $${values.length}`)
    }
    if (!fields.length) return res.json({ ok: true })
    values.push(id)
    await query(
      `UPDATE properties SET ${fields.join(', ')}, updated_at = now() WHERE id = $${values.length}`,
      values,
    )

    if (Array.isArray(body.images)) {
      await query('DELETE FROM property_images WHERE property_id = $1', [id])
      for (const [i, url] of body.images.filter(Boolean).entries()) {
        await query(
          'INSERT INTO property_images (property_id, url, sort, is_cover) VALUES ($1,$2,$3,$4)',
          [id, url, i, i === 0],
        )
      }
    }
    if (Array.isArray(body.amenities)) {
      await query('DELETE FROM property_amenities WHERE property_id = $1', [id])
      for (const amenityId of body.amenities.map(Number).filter(Boolean)) {
        await query(
          'INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [id, amenityId],
        )
      }
    }
    res.json({ ok: true })
  }),
)

router.delete(
  '/properties/:id',
  ah(async (req, res) => {
    await query('DELETE FROM properties WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  }),
)

/* ======================= users ======================= */

router.get(
  '/users',
  ah(async (req, res) => {
    const q = `%${String(req.query.q || '').trim()}%`
    const rows = await many(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.status, u.created_at,
              (SELECT COUNT(*)::int FROM properties p WHERE p.owner_id = u.id) AS listings,
              (SELECT COUNT(*)::int FROM favorites f WHERE f.user_id = u.id) AS favorites
         FROM users u
        WHERE ($1 = '%%' OR u.name ILIKE $1 OR u.email ILIKE $1)
        ORDER BY u.created_at DESC`,
      [q],
    )
    res.json(rows)
  }),
)

router.patch(
  '/users/:id',
  ah(async (req, res) => {
    const id = Number(req.params.id)
    const { name, phone, role, status, password } = req.body || {}
    if (id === req.user.id && (role && role !== 'admin')) {
      return res.status(400).json({ error: 'You cannot remove your own admin access' })
    }
    const fields = []
    const values = []
    if (name !== undefined) { values.push(name); fields.push(`name = $${values.length}`) }
    if (phone !== undefined) { values.push(phone || null); fields.push(`phone = $${values.length}`) }
    if (role !== undefined) { values.push(role); fields.push(`role = $${values.length}`) }
    if (status !== undefined) { values.push(status); fields.push(`status = $${values.length}`) }
    if (password) { values.push(hashPassword(String(password))); fields.push(`password_hash = $${values.length}`) }
    if (!fields.length) return res.json({ ok: true })
    values.push(id)
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length}`, values)
    if (status === 'suspended') {
      await query('DELETE FROM sessions WHERE user_id = $1', [id])
    }
    res.json({ ok: true })
  }),
)

router.delete(
  '/users/:id',
  ah(async (req, res) => {
    const id = Number(req.params.id)
    if (id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' })
    await query('DELETE FROM users WHERE id = $1', [id])
    res.json({ ok: true })
  }),
)

/* ======================= agents ======================= */

router.get(
  '/agents',
  ah(async (_req, res) => {
    const rows = await many(
      `SELECT a.*, (SELECT COUNT(*)::int FROM properties p WHERE p.agent_id = a.id) AS listings
         FROM agents a ORDER BY a.id`,
    )
    res.json(rows)
  }),
)

const AGENT_FIELDS = [
  'name_en', 'name_fa', 'title_en', 'title_fa', 'bio_en', 'bio_fa', 'phone', 'email',
  'avatar', 'languages', 'spec_en', 'spec_fa', 'experience', 'user_id',
]

router.post(
  '/agents',
  ah(async (req, res) => {
    const body = req.body || {}
    if (!body.name_en) return res.status(400).json({ error: 'Agent name is required' })
    const slug = await uniqueSlug('agents', body.name_en)
    const columns = ['slug']
    const values = [slug]
    for (const field of AGENT_FIELDS) {
      if (body[field] !== undefined) {
        columns.push(field)
        values.push(body[field] === '' ? null : body[field])
      }
    }
    const row = await one(
      `INSERT INTO agents (${columns.join(',')}) VALUES (${values.map((_, i) => `$${i + 1}`).join(',')})
       RETURNING id, slug`,
      values,
    )
    res.status(201).json(row)
  }),
)

router.patch(
  '/agents/:id',
  ah(async (req, res) => {
    const id = Number(req.params.id)
    const body = req.body || {}
    const fields = []
    const values = []
    for (const field of AGENT_FIELDS) {
      if (body[field] !== undefined) {
        values.push(body[field] === '' ? null : body[field])
        fields.push(`${field} = $${values.length}`)
      }
    }
    if (!fields.length) return res.json({ ok: true })
    values.push(id)
    await query(`UPDATE agents SET ${fields.join(', ')} WHERE id = $${values.length}`, values)
    res.json({ ok: true })
  }),
)

router.delete(
  '/agents/:id',
  ah(async (req, res) => {
    await query('UPDATE properties SET agent_id = NULL WHERE agent_id = $1', [Number(req.params.id)])
    await query('DELETE FROM agents WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  }),
)

/* ======================= inquiries ======================= */

router.get(
  '/inquiries',
  ah(async (req, res) => {
    const status = req.query.status
    const rows = await many(
      `SELECT i.*, p.slug AS property_slug, p.title_en AS property_title_en,
              p.reference AS property_reference, a.name_en AS agent_name_en,
              (SELECT url FROM property_images WHERE property_id = p.id ORDER BY is_cover DESC, sort LIMIT 1) AS cover
         FROM inquiries i
         LEFT JOIN properties p ON p.id = i.property_id
         LEFT JOIN agents a ON a.id = i.agent_id
        WHERE ($1::text IS NULL OR i.status = $1)
        ORDER BY i.created_at DESC LIMIT 300`,
      [status && status !== 'all' ? status : null],
    )
    res.json(rows)
  }),
)

router.patch(
  '/inquiries/:id',
  ah(async (req, res) => {
    const { status, internal_note } = req.body || {}
    const fields = []
    const values = []
    if (status !== undefined) { values.push(status); fields.push(`status = $${values.length}`) }
    if (internal_note !== undefined) { values.push(internal_note); fields.push(`internal_note = $${values.length}`) }
    if (!fields.length) return res.json({ ok: true })
    values.push(Number(req.params.id))
    await query(`UPDATE inquiries SET ${fields.join(', ')} WHERE id = $${values.length}`, values)
    res.json({ ok: true })
  }),
)

router.delete(
  '/inquiries/:id',
  ah(async (req, res) => {
    await query('DELETE FROM inquiries WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  }),
)

/* ======================= categories / locations ======================= */

router.get(
  '/categories',
  ah(async (_req, res) => {
    const rows = await many(
      `SELECT c.*, (SELECT COUNT(*)::int FROM properties p WHERE p.category_id = c.id) AS count
         FROM categories c ORDER BY c.sort, c.id`,
    )
    res.json(rows)
  }),
)

router.post(
  '/categories',
  ah(async (req, res) => {
    const { name_en, name_fa, desc_en, desc_fa, icon, image, sort } = req.body || {}
    if (!name_en) return res.status(400).json({ error: 'English name is required' })
    const slug = await uniqueSlug('categories', req.body.slug || name_en)
    const row = await one(
      `INSERT INTO categories (slug, name_en, name_fa, desc_en, desc_fa, icon, image, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [slug, name_en, name_fa || name_en, desc_en, desc_fa, icon || 'home', image, Number(sort) || 99],
    )
    res.status(201).json(row)
  }),
)

router.patch(
  '/categories/:id',
  ah(async (req, res) => {
    const allowed = ['name_en', 'name_fa', 'desc_en', 'desc_fa', 'icon', 'image', 'sort']
    const fields = []
    const values = []
    for (const field of allowed) {
      if (req.body?.[field] !== undefined) {
        values.push(req.body[field])
        fields.push(`${field} = $${values.length}`)
      }
    }
    if (!fields.length) return res.json({ ok: true })
    values.push(Number(req.params.id))
    await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = $${values.length}`, values)
    res.json({ ok: true })
  }),
)

router.delete(
  '/categories/:id',
  ah(async (req, res) => {
    await query('UPDATE properties SET category_id = NULL WHERE category_id = $1', [Number(req.params.id)])
    await query('DELETE FROM categories WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  }),
)

router.get(
  '/cities',
  ah(async (_req, res) => {
    const cities = await many(
      `SELECT ci.*, (SELECT COUNT(*)::int FROM properties p WHERE p.city_id = ci.id) AS count
         FROM cities ci ORDER BY ci.sort, ci.id`,
    )
    const neighborhoods = await many('SELECT * FROM neighborhoods ORDER BY city_id, id')
    res.json({ cities, neighborhoods })
  }),
)

router.post(
  '/cities',
  ah(async (req, res) => {
    const { name_en, name_fa, country_en, country_fa, image, lat, lng } = req.body || {}
    if (!name_en) return res.status(400).json({ error: 'English name is required' })
    const slug = await uniqueSlug('cities', req.body.slug || name_en)
    const row = await one(
      `INSERT INTO cities (slug, name_en, name_fa, country_en, country_fa, image, lat, lng, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,99) RETURNING *`,
      [slug, name_en, name_fa || name_en, country_en, country_fa, image, lat || null, lng || null],
    )
    res.status(201).json(row)
  }),
)

router.patch(
  '/cities/:id',
  ah(async (req, res) => {
    const allowed = ['name_en', 'name_fa', 'country_en', 'country_fa', 'image', 'lat', 'lng', 'sort']
    const fields = []
    const values = []
    for (const field of allowed) {
      if (req.body?.[field] !== undefined) {
        values.push(req.body[field] === '' ? null : req.body[field])
        fields.push(`${field} = $${values.length}`)
      }
    }
    if (!fields.length) return res.json({ ok: true })
    values.push(Number(req.params.id))
    await query(`UPDATE cities SET ${fields.join(', ')} WHERE id = $${values.length}`, values)
    res.json({ ok: true })
  }),
)

router.delete(
  '/cities/:id',
  ah(async (req, res) => {
    await query('UPDATE properties SET city_id = NULL WHERE city_id = $1', [Number(req.params.id)])
    await query('DELETE FROM cities WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  }),
)

router.post(
  '/neighborhoods',
  ah(async (req, res) => {
    const { city_id, name_en, name_fa } = req.body || {}
    if (!city_id || !name_en) return res.status(400).json({ error: 'City and name are required' })
    const row = await one(
      'INSERT INTO neighborhoods (city_id, name_en, name_fa) VALUES ($1,$2,$3) RETURNING *',
      [Number(city_id), name_en, name_fa || name_en],
    )
    res.status(201).json(row)
  }),
)

router.delete(
  '/neighborhoods/:id',
  ah(async (req, res) => {
    await query('DELETE FROM neighborhoods WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  }),
)

/* ======================= reviews ======================= */

router.get(
  '/reviews',
  ah(async (req, res) => {
    const status = req.query.status
    const rows = await many(
      `SELECT r.*, p.slug AS property_slug, p.title_en AS property_title_en
         FROM reviews r LEFT JOIN properties p ON p.id = r.property_id
        WHERE ($1::text IS NULL OR r.status = $1)
        ORDER BY r.created_at DESC LIMIT 200`,
      [status && status !== 'all' ? status : null],
    )
    res.json(rows)
  }),
)

router.patch(
  '/reviews/:id',
  ah(async (req, res) => {
    const { status } = req.body || {}
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    await query('UPDATE reviews SET status = $1 WHERE id = $2', [status, Number(req.params.id)])
    res.json({ ok: true })
  }),
)

router.delete(
  '/reviews/:id',
  ah(async (req, res) => {
    await query('DELETE FROM reviews WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  }),
)

/* ======================= settings ======================= */

router.get(
  '/settings',
  ah(async (_req, res) => {
    const row = await one('SELECT data, updated_at FROM site_settings WHERE id = 1')
    res.json(row || { data: {}, updated_at: null })
  }),
)

router.put(
  '/settings',
  ah(async (req, res) => {
    const data = req.body?.data
    if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Invalid settings' })
    await query(
      `INSERT INTO site_settings (id, data, updated_at) VALUES (1, $1, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [JSON.stringify(data)],
    )
    res.json({ ok: true })
  }),
)

/* ======================= reports ======================= */

router.get(
  '/reports',
  ah(async (_req, res) => {
    const [popular, viewed, searched, registrations, inquiriesByMonth, totals] = await Promise.all([
      many(
        `SELECT p.id, p.slug, p.title_en, p.views, p.price, p.currency,
                (SELECT url FROM property_images WHERE property_id = p.id ORDER BY is_cover DESC, sort LIMIT 1) AS cover
           FROM properties p WHERE p.status = 'active'
          ORDER BY p.views DESC LIMIT 6`,
      ),
      many(
        `SELECT to_char(date_trunc('month', created_at), 'Mon') AS label,
                COUNT(*)::int AS value
           FROM property_views
          WHERE created_at > now() - interval '6 months'
          GROUP BY date_trunc('month', created_at)
          ORDER BY date_trunc('month', created_at)`,
      ),
      many(
        `SELECT ci.name_en, ci.name_fa, COUNT(s.id)::int AS searches
           FROM search_events s JOIN cities ci ON ci.slug = s.city
          GROUP BY ci.name_en, ci.name_fa
          ORDER BY searches DESC LIMIT 6`,
      ),
      many(
        `SELECT to_char(date_trunc('month', created_at), 'Mon') AS label,
                COUNT(*)::int AS value
           FROM users WHERE created_at > now() - interval '6 months'
          GROUP BY date_trunc('month', created_at)
          ORDER BY date_trunc('month', created_at)`,
      ),
      many(
        `SELECT status, COUNT(*)::int AS value FROM inquiries GROUP BY status ORDER BY status`,
      ),
      one(
        `SELECT (SELECT COUNT(*)::int FROM property_views) AS total_views,
                (SELECT COUNT(*)::int FROM search_events) AS total_searches,
                (SELECT COUNT(*)::int FROM newsletter_subscribers) AS subscribers`,
      ),
    ])
    res.json({ popular, viewed, searched, registrations, inquiriesByMonth, totals })
  }),
)

export default router
