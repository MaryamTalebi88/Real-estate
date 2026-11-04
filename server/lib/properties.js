/** Shared property query helpers used by the public and admin routers. */

export const PROPERTY_COLUMNS = `
  p.id, p.reference, p.slug, p.title_en, p.title_fa, p.description_en, p.description_fa,
  p.listing_type, p.price, p.currency, p.neighborhood, p.address, p.lat, p.lng,
  p.bedrooms, p.bathrooms, p.area, p.parking, p.floor, p.year_built, p.furnishing,
  p.is_new, p.is_featured, p.is_verified, p.status, p.rejection_note, p.views,
  p.created_at, p.updated_at, p.owner_id,
  p.category_id, p.city_id, p.agent_id,
  c.slug AS category_slug, c.name_en AS category_name_en, c.name_fa AS category_name_fa,
  c.icon AS category_icon,
  ci.slug AS city_slug, ci.name_en AS city_name_en, ci.name_fa AS city_name_fa,
  ci.country_en AS country_en, ci.country_fa AS country_fa,
  a.slug AS agent_slug, a.name_en AS agent_name_en, a.name_fa AS agent_name_fa,
  a.avatar AS agent_avatar, a.phone AS agent_phone, a.email AS agent_email,
  a.title_en AS agent_title_en, a.title_fa AS agent_title_fa,
  u.name AS owner_name, u.email AS owner_email,
  (SELECT COALESCE(json_agg(t.url ORDER BY t.is_cover DESC, t.sort, t.id), '[]'::json)
     FROM property_images t WHERE t.property_id = p.id) AS images,
  (SELECT COALESCE(json_agg(json_build_object('slug', am.slug, 'name_en', am.name_en,
            'name_fa', am.name_fa, 'icon', am.icon) ORDER BY am.id), '[]'::json)
     FROM property_amenities pa JOIN amenities am ON am.id = pa.amenity_id
    WHERE pa.property_id = p.id) AS amenities
`

export const PROPERTY_FROM = `
  FROM properties p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN cities ci ON ci.id = p.city_id
  LEFT JOIN agents a ON a.id = p.agent_id
  LEFT JOIN users u ON u.id = p.owner_id
`

const num = (v) => (v === null || v === undefined ? null : Number(v))

export function mapProperty(row) {
  if (!row) return null
  const images = (row.images || []).filter(Boolean)
  return {
    ...row,
    price: num(row.price),
    area: num(row.area),
    lat: num(row.lat),
    lng: num(row.lng),
    images,
    cover: images[0] || null,
    amenities: row.amenities || [],
  }
}

const SORTS = {
  newest: 'p.created_at DESC',
  oldest: 'p.created_at ASC',
  price_asc: 'p.price ASC',
  price_desc: 'p.price DESC',
  popular: 'p.views DESC, p.created_at DESC',
  area_desc: 'p.area DESC',
}

/**
 * Builds a WHERE clause + ORDER BY from query params.
 * `scope` = 'public' restricts to active listings, 'admin' allows any status.
 */
export function buildPropertyFilters(params, scope = 'public') {
  const where = []
  const values = []
  const push = (sql, value) => {
    values.push(value)
    where.push(sql.replace('$?', `$${values.length}`))
  }

  if (scope === 'public') {
    where.push(`p.status = 'active'`)
  } else if (params.status && params.status !== 'all') {
    push('p.status = $?', params.status)
  }

  if (params.listing === 'sale' || params.listing === 'rent') {
    push('p.listing_type = $?', params.listing)
  }
  if (params.type) push('c.slug = $?', params.type)
  if (params.city) push('ci.slug = $?', params.city)
  if (params.neighborhood) push('p.neighborhood ILIKE $?', `%${params.neighborhood}%`)
  if (params.agent) push('a.slug = $?', params.agent)
  if (params.owner) push('p.owner_id = $?', Number(params.owner))

  const minPrice = Number(params.minPrice)
  if (Number.isFinite(minPrice) && minPrice > 0) push('p.price >= $?', minPrice)
  const maxPrice = Number(params.maxPrice)
  if (Number.isFinite(maxPrice) && maxPrice > 0) push('p.price <= $?', maxPrice)

  const beds = Number(params.bedrooms)
  if (Number.isFinite(beds) && beds > 0) push('p.bedrooms >= $?', beds)
  const baths = Number(params.bathrooms)
  if (Number.isFinite(baths) && baths > 0) push('p.bathrooms >= $?', baths)

  const minArea = Number(params.minArea)
  if (Number.isFinite(minArea) && minArea > 0) push('p.area >= $?', minArea)
  const maxArea = Number(params.maxArea)
  if (Number.isFinite(maxArea) && maxArea > 0) push('p.area <= $?', maxArea)

  if (params.furnishing) push('p.furnishing = $?', params.furnishing)
  if (params.isNew === 'true' || params.isNew === true) where.push('p.is_new = true')
  if (params.verified === 'true' || params.verified === true) where.push('p.is_verified = true')
  if (params.featured === 'true' || params.featured === true) where.push('p.is_featured = true')
  if (params.luxury === 'true' || params.luxury === true) {
    where.push("(p.price >= 3000000 OR c.slug = 'villas')")
  }

  const q = (params.q || params.query || '').trim()
  if (q) {
    values.push(`%${q}%`)
    const i = values.length
    where.push(
      `(p.title_en ILIKE $${i} OR p.title_fa ILIKE $${i} OR p.neighborhood ILIKE $${i}
        OR p.address ILIKE $${i} OR ci.name_en ILIKE $${i} OR p.reference ILIKE $${i})`,
    )
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    values,
    orderSql: SORTS[params.sort] || SORTS.newest,
  }
}
