import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Heart,
  Layers,
  Mail,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Sofa,
  Car,
} from 'lucide-react'
import PropertyCard from '../components/PropertyCard.jsx'
import Lightbox from '../components/Lightbox.jsx'
import MapPanel from '../components/MapPanel.jsx'
import Modal from '../components/Modal.jsx'
import { AmenityIcon } from '../components/Icons.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useAppData } from '../lib/appData.jsx'
import { api } from '../lib/api.js'
import { formatArea, formatDate, formatNumber, formatPrice } from '../lib/format.js'
import { useToast } from '../lib/toast.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function PropertyDetail() {
  const { slug } = useParams()
  const { t, lang, pick } = useI18n()
  const { user, favoriteIds, toggleFavorite } = useAuth()
  const { settings } = useAppData()
  const toast = useToast()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [gallery, setGallery] = useState(-1)
  const [expanded, setExpanded] = useState(false)
  const [inquiry, setInquiry] = useState(null) // 'viewing' | 'inquiry' | null
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setNotFound(false)
    api
      .get(`/properties/${slug}`)
      .then((res) => {
        if (!active) return
        setData(res)
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  const property = data?.property
  const similar = data?.similar || []

  usePageMeta({
    title: property ? `${pick(property.title_en, property.title_fa)} — EstatePro` : 'EstatePro',
    description: property ? pick(property.description_en, property.description_fa)?.slice(0, 155) : undefined,
    image: property?.cover,
  })

  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }))
  }, [user])

  const isFav = property ? favoriteIds.includes(property.id) : false
  const agent = useMemo(
    () =>
      property
        ? {
            name: pick(property.agent_name_en, property.agent_name_fa),
            title: pick(property.agent_title_en, property.agent_title_fa),
            avatar: property.agent_avatar,
            phone: property.agent_phone,
            email: property.agent_email,
            slug: property.agent_slug,
          }
        : null,
    [property, pick],
  )

  const contact = settings.contact || {}

  const openInquiry = (kind) => {
    if (!user) {
      toast.push(pick('Sign in to send an enquiry.', 'برای ارسال درخواست وارد شوید.'), 'error')
      navigate('/login', { state: { from: `/properties/${slug}` } })
      return
    }
    setInquiry(kind)
  }

  const submitInquiry = async (event) => {
    event.preventDefault()
    setSending(true)
    try {
      await api.post('/inquiries', {
        ...form,
        propertyId: property.id,
        kind: 'property',
        subject:
          inquiry === 'viewing'
            ? pick('Viewing request', 'درخواست بازدید')
            : pick('Property enquiry', 'پرسش درباره ملک'),
        message:
          form.message ||
          (inquiry === 'viewing'
            ? pick('I would like to request a viewing of this property.', 'مایلم برای بازدید این ملک وقت بگیرم.')
            : pick('I would like more information about this property.', 'اطلاعات بیشتری درباره این ملک می‌خواهم.')),
      })
      toast.success(t('detail.requestSent'))
      setInquiry(null)
      setForm({ name: form.name, email: form.email, phone: form.phone, message: '' })
    } catch (err) {
      const firstError = err.errors ? Object.values(err.errors)[0] : err.message
      toast.error(firstError || t('common.error'))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 140, paddingBottom: 80 }}>
        <div className="skeleton" style={{ height: 420, borderRadius: 26, marginBottom: 30 }} />
        <div className="detail-layout">
          <div className="stack gap-16">
            <div className="skeleton" style={{ height: 28, width: '55%' }} />
            <div className="skeleton" style={{ height: 18, width: '35%' }} />
            <div className="skeleton" style={{ height: 140 }} />
          </div>
          <div className="skeleton" style={{ height: 320 }} />
        </div>
      </div>
    )
  }

  if (notFound || !property) {
    return (
      <div className="container section">
        <div className="empty-state">
          <h2 className="h-section">{pick('Property not found', 'ملک پیدا نشد')}</h2>
          <p className="muted">
            {pick(
              'This listing may have been removed or is awaiting review.',
              'این آگهی ممکن است حذف شده یا در انتظار بررسی باشد.',
            )}
          </p>
          <Link to="/properties" className="btn btn-navy">
            {pick('Back to all properties', 'بازگشت به همه املاک')}
          </Link>
        </div>
      </div>
    )
  }

  const images = property.images?.length ? property.images : property.cover ? [property.cover] : []
  const title = pick(property.title_en, property.title_fa)
  const city = pick(property.city_name_en, property.city_name_fa)
  const type = pick(property.category_name_en, property.category_name_fa)
  const isRent = property.listing_type === 'rent'
  const whatsappNumber = (agent?.phone || contact.whatsapp || '').replace(/[^\d]/g, '')

  const specs = [
    { icon: BedDouble, label: t('detail.bedrooms'), value: property.bedrooms },
    { icon: Bath, label: t('detail.bathrooms'), value: property.bathrooms },
    { icon: Maximize, label: t('detail.area'), value: formatArea(property.area, lang) },
    { icon: Car, label: t('detail.parking'), value: property.parking },
    { icon: Building2, label: t('detail.type'), value: type },
    { icon: Layers, label: t('detail.floor'), value: property.floor || '—' },
    { icon: CalendarDays, label: t('detail.yearBuilt'), value: property.year_built || '—' },
    {
      icon: Sofa,
      label: t('detail.furnishing'),
      value: property.furnishing ? t(`filters.${property.furnishing === 'semi' ? 'semi' : property.furnishing}`) : '—',
    },
  ]

  return (
    <>
      <section className="section-sm" style={{ paddingTop: 'calc(var(--header-h) + 40px)' }}>
        <div className="container">
          <div className="crumbs" style={{ marginBlockEnd: 18, fontSize: '0.8rem', color: 'var(--muted)' }}>
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <Link to="/properties">{t('nav.properties')}</Link>
            <span>/</span>
            <span>{title}</span>
          </div>

          <div className="detail-gallery">
            <button
              type="button"
              className="gallery-main"
              onClick={() => setGallery(0)}
              aria-label={t('detail.viewGallery')}
              style={{ border: 0, padding: 0 }}
            >
              {images[0] && <img src={images[0]} alt={title} />}
            </button>
            <div className="gallery-side">
              {[1, 2].map((i) =>
                images[i] ? (
                  <button key={i} type="button" onClick={() => setGallery(i)} aria-label={t('detail.viewGallery')}>
                    <img src={images[i]} alt="" loading="lazy" />
                    {i === 2 && images.length > 3 && (
                      <span className="gallery-more">+{images.length - 3}</span>
                    )}
                  </button>
                ) : null,
              )}
            </div>
          </div>
          <div className="row wrap gap-12" style={{ marginBlockStart: -10, marginBlockEnd: 26 }}>
            <button type="button" className="chip" onClick={() => setGallery(0)}>
              {formatNumber(images.length, lang)} {t('detail.photos')}
            </button>
            <button type="button" className="chip" onClick={() => toggleFavorite(property.id)}>
              <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
              {t('nav.favorites')}
            </button>
          </div>

          <div className="detail-layout">
            <div>
              <div className="detail-title-block">
                <div>
                  <div className="row wrap gap-8" style={{ marginBlockEnd: 12 }}>
                    <span className={`badge ${isRent ? 'badge-navy' : 'badge-gold'}`}>
                      {isRent ? t('card.forRent') : t('card.forSale')}
                    </span>
                    {property.is_featured && <span className="badge">{t('card.featured')}</span>}
                    {property.is_verified && (
                      <span className="badge badge-success">
                        <ShieldCheck size={12} /> {t('detail.verifiedListing')}
                      </span>
                    )}
                    {property.is_new && <span className="badge badge-muted">{t('filters.isNew')}</span>}
                  </div>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)' }}>{title}</h1>
                  <div className="property-loc" style={{ marginBlockStart: 10, fontSize: '0.9rem' }}>
                    <MapPin size={15} />
                    {[property.address, property.neighborhood, city].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div className="detail-price">
                    {formatPrice(property.price, property.currency, lang)}
                    {isRent && <span> {t('detail.perMonth')}</span>}
                  </div>
                  <div className="detail-meta" style={{ justifyContent: 'flex-end' }}>
                    <span>
                      {t('detail.reference')}: <strong>{property.reference}</strong>
                    </span>
                    <span>
                      {t('detail.listed')}: <strong>{formatDate(property.created_at, lang)}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="spec-grid" style={{ marginBlock: 30 }}>
                {specs.map(({ icon: Icon, label, value }) => (
                  <div className="spec-cell" key={label}>
                    <span>{label}</span>
                    <strong>
                      <Icon size={16} />
                      {typeof value === 'number' ? formatNumber(value, lang) : value}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h2>{t('detail.description')}</h2>
                <div className={`expandable ${expanded ? 'expanded' : ''}`}>
                  <p>{pick(property.description_en, property.description_fa)}</p>
                </div>
                <button
                  type="button"
                  className="link-arrow"
                  style={{ marginBlockStart: 12 }}
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                >
                  {expanded ? t('common.showLess') : t('common.readMore')}
                  <ChevronDown size={15} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>

              {property.amenities.length > 0 && (
                <div className="detail-section">
                  <h2>{t('detail.amenities')}</h2>
                  <div className="amenity-grid">
                    {property.amenities.map((amenity) => (
                      <div className="amenity" key={amenity.slug}>
                        <AmenityIcon name={amenity.icon} size={18} />
                        {lang === 'fa' ? amenity.name_fa : amenity.name_en}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h2>{t('detail.location')}</h2>
                <div className="map-panel" style={{ margin: 0 }}>
                  <MapPanel
                    points={[{ id: property.id, lat: property.lat, lng: property.lng, title, neighborhood: property.neighborhood }]}
                    height={340}
                    zoom={13}
                    label={() => title}
                  />
                </div>
                <p className="small muted" style={{ marginBlockStart: 12 }}>
                  {[property.address, property.neighborhood, city].filter(Boolean).join(', ')}
                </p>
              </div>

              {similar.length > 0 && (
                <div className="detail-section">
                  <h2>{t('detail.similar')}</h2>
                  <div className="property-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                    {similar.map((item) => (
                      <PropertyCard key={item.id} property={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="detail-aside">
              <div className="card panel" style={{ padding: 24 }}>
                <div className="agent-card-head">
                  {agent?.avatar ? (
                    <img src={agent.avatar} alt="" />
                  ) : (
                    <span className="feature-icon" style={{ margin: 0, background: 'var(--gold)', color: 'var(--navy)' }}>
                      <ShieldCheck size={20} />
                    </span>
                  )}
                  <div>
                    <strong style={{ display: 'block' }}>{agent?.name || settings.siteName}</strong>
                    <span className="small muted">{agent?.title || t('detail.contactAgent')}</span>
                    {agent?.slug && (
                      <Link to={`/agents/${agent.slug}`} className="small" style={{ display: 'block', color: 'var(--gold-deep)', fontWeight: 600 }}>
                        {pick('View profile', 'مشاهده پروفایل')}
                      </Link>
                    )}
                  </div>
                </div>

                <div className="agent-actions">
                  {agent?.phone && (
                    <a href={`tel:${agent.phone.replace(/\s/g, '')}`} className="btn btn-navy btn-block">
                      <Phone size={16} /> {agent.phone}
                    </a>
                  )}
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        `${title} — ${property.reference}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-block"
                    >
                      <MessageCircle size={16} /> {t('detail.whatsapp')}
                    </a>
                  )}
                  <button type="button" className="btn btn-gold btn-block" onClick={() => openInquiry('inquiry')}>
                    <Mail size={16} /> {t('detail.inquiry')}
                  </button>
                  <button type="button" className="btn btn-light btn-block" onClick={() => openInquiry('viewing')}>
                    <CalendarDays size={16} /> {t('detail.viewing')}
                  </button>
                </div>

                <div className="divider" style={{ marginBlock: 20 }} />
                <ul className="stack gap-12 small muted">
                  <li className="row gap-8">
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    {pick('Documents verified by our team', 'مدارک توسط تیم ما بررسی شده')}
                  </li>
                  <li className="row gap-8">
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    {pick('No hidden agency fees', 'بدون کارمزد پنهان')}
                  </li>
                  <li className="row gap-8">
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    {pick('Reply within one business day', 'پاسخ حداکثر تا یک روز کاری')}
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="mobile-quick-actions">
        <a
          href={agent?.phone ? `tel:${agent.phone.replace(/\s/g, '')}` : `mailto:${contact.email || ''}`}
          className="btn btn-outline"
        >
          <Phone size={16} /> {t('detail.call')}
        </a>
        <button type="button" className="btn btn-gold" onClick={() => openInquiry('inquiry')}>
          {t('detail.inquiry')} <ArrowRight size={16} className="flip-rtl" />
        </button>
      </div>

      {gallery >= 0 && (
        <Lightbox images={images} index={gallery} onClose={() => setGallery(-1)} onChange={setGallery} />
      )}

      <Modal
        open={Boolean(inquiry)}
        onClose={() => setInquiry(null)}
        title={inquiry === 'viewing' ? t('detail.viewingTitle') : t('detail.inquiryTitle')}
      >
        <form className="stack gap-16" onSubmit={submitInquiry}>
          <div className="field">
            <label className="label" htmlFor="inq-name">{t('detail.yourName')}</label>
            <input
              id="inq-name"
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="inq-email">{t('detail.yourEmail')}</label>
            <input
              id="inq-email"
              type="email"
              className="input"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="inq-phone">{t('detail.yourPhone')}</label>
            <input
              id="inq-phone"
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="inq-message">{t('detail.yourMessage')}</label>
            <textarea
              id="inq-message"
              className="textarea"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={pick('Tell us when you would like to visit…', 'بگویید چه زمانی برای بازدید مناسب است…')}
            />
          </div>
          <button type="submit" className="btn btn-gold btn-block" disabled={sending}>
            {sending ? t('common.saving') : t('detail.send')}
          </button>
        </form>
      </Modal>
    </>
  )
}
