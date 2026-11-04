export function formatNumber(value, lang = 'en', options = {}) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', options).format(n)
}

export function formatPrice(value, currency = 'AED', lang = 'en') {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return lang === 'fa' ? 'قیمت با تماس' : 'Price on request'
  try {
    return new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${formatNumber(n, lang)} ${currency}`
  }
}

export function formatArea(area, lang = 'en') {
  return lang === 'fa'
    ? `${formatNumber(area, lang)} متر مربع`
    : `${formatNumber(area, lang)} m²`
}

export function formatDate(value, lang = 'en') {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function timeAgo(value, lang = 'en') {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 60) return lang === 'fa' ? `${mins} دقیقه پیش` : `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return lang === 'fa' ? `${hours} ساعت پیش` : `${hours}h ago`
  return formatDate(value, lang)
}

export function mapEmbedUrl(lat, lng, label = '') {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null
  const la = Number(lat)
  const ln = Number(lng)
  const d = 0.02
  const bbox = `${ln - d},${la - d},${ln + d},${la + d}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${la},${ln}${
    label ? `#${encodeURIComponent(label)}` : ''
  }`
}
