import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import SectionHead from '../SectionHead.jsx'
import PropertyCard from '../PropertyCard.jsx'
import { Reveal } from '../Reveal.jsx'
import { PropertyGridSkeleton } from '../Skeletons.jsx'
import { CategoryIcon } from '../Icons.jsx'
import { useAppData } from '../../lib/appData.jsx'
import { useI18n } from '../../lib/i18n.jsx'
import { useProperties } from '../../lib/useProperties.js'
import { api } from '../../lib/api.js'
import { useEffect } from 'react'
import { formatNumber, formatPrice } from '../../lib/format.js'

export function CategorySection() {
  const { categories } = useAppData()
  const { t, lang, pick } = useI18n()

  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow={pick('Explore by category', 'دسته‌بندی‌ها')}
          title={pick('Find Properties That Fit Your Lifestyle', 'ملکی متناسب با سبک زندگی خود بیابید')}
          description={pick(
            'From family houses to landmark villas and commercial floors — every listing is reviewed before it goes live.',
            'از خانه‌های خانوادگی تا ویلاهای شاخص و طبقات تجاری — هر آگهی پیش از انتشار بررسی می‌شود.',
          )}
          linkTo="/properties"
          linkLabel={t('common.viewAll')}
        />

        <div className="category-grid">
          {categories.map((category, i) => (
            <Reveal key={category.id} delay={i * 70}>
              <Link to={`/properties?type=${category.slug}`} className="category-card">
                {category.image && <img src={category.image} alt="" loading="lazy" />}
                <span className="cat-icon">
                  <CategoryIcon name={category.icon} size={21} />
                </span>
                <span className="cat-count">
                  {formatNumber(category.count, lang)} {lang === 'fa' ? 'ملک' : 'listings'}
                </span>
                <div className="cat-body">
                  <h3>{lang === 'fa' ? category.name_fa : category.name_en}</h3>
                  <p>{pick(category.desc_en, category.desc_fa)}</p>
                </div>
                <span className="cat-arrow" aria-hidden="true">
                  <ArrowUpRight size={17} className="flip-rtl" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const TABS = [
  { key: 'all', labelEn: 'All', labelFa: 'همه', params: {} },
  { key: 'sale', labelEn: 'For Sale', labelFa: 'برای فروش', params: { listing: 'sale' } },
  { key: 'rent', labelEn: 'For Rent', labelFa: 'برای اجاره', params: { listing: 'rent' } },
  { key: 'featured', labelEn: 'Featured', labelFa: 'ویژه', params: { featured: 'true' } },
  { key: 'luxury', labelEn: 'Luxury', labelFa: 'لوکس', params: { luxury: 'true' } },
]

export function FeaturedProperties() {
  const { settings } = useAppData()
  const sections = settings?.sections || {}
  const { t, lang, pick } = useI18n()
  const [tab, setTab] = useState('all')
  const active = TABS.find((item) => item.key === tab) || TABS[0]
  const { items, loading } = useProperties({ ...active.params }, { limit: 6 })

  return (
    <section className="section" style={{ background: '#fff' }}>
      <div className="container">
        <SectionHead
          eyebrow={pick('Featured properties', 'املاک ویژه')}
          title={
            (lang === 'fa' ? sections.featuredHeadingFa : sections.featuredHeading) ||
            pick('Handpicked Properties For You', 'ملک‌هایی که برای شما انتخاب کرده‌ایم')
          }
          description={
            (lang === 'fa' ? sections.featuredSubtitleFa : sections.featuredSubtitle) ||
            pick(
              'Explore our carefully selected collection of exceptional properties.',
              'مجموعه‌ای منتخب از املاک استثنایی را ببینید.',
            )
          }
          linkTo="/properties"
          linkLabel={t('common.viewAll')}
        />

        <div className="tab-row" style={{ marginBlockEnd: 28 }} role="tablist">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              className={`tab ${tab === item.key ? 'is-active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              {lang === 'fa' ? item.labelFa : item.labelEn}
            </button>
          ))}
        </div>

        {loading ? (
          <PropertyGridSkeleton count={6} />
        ) : (
          <div className="property-grid">
            {items.map((property, i) => (
              <Reveal key={property.id} delay={i * 60}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        )}

        <div className="center" style={{ marginBlockStart: 40 }}>
          <Link to="/properties" className="btn btn-navy">
            {t('common.viewAll')} <ArrowRight size={16} className="flip-rtl" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function LuxuryShowcase() {
  const { t, lang, pick } = useI18n()
  const { items, loading } = useProperties({ luxury: 'true', sort: 'price_desc' }, { limit: 3 })

  return (
    <section className="section section-dark on-dark">
      <div className="container">
        <SectionHead
          eyebrow={pick('The luxury collection', 'مجموعه لوکس')}
          title={pick('Signature Homes For Discerning Buyers', 'خانه‌های شاخص برای خریداران سخت‌پسند')}
          description={pick(
            'Private villas, penthouse floors and estates with verified documentation and discreet viewings.',
            'ویلاهای خصوصی، طبقات پنت‌هاوس و عمارت‌هایی با مدارک تأییدشده و بازدید محرمانه.',
          )}
          linkTo="/properties?luxury=true"
          linkLabel={t('common.viewAll')}
          onDark
        />
        {loading ? (
          <PropertyGridSkeleton count={3} />
        ) : (
          <div className="property-grid">
            {items.map((property, i) => (
              <Reveal key={property.id} delay={i * 70}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function LatestProperties() {
  const { t, lang, pick } = useI18n()
  const { items, loading } = useProperties({ sort: 'newest' }, { limit: 3 })

  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow={pick('Just listed', 'تازه‌ترین‌ها')}
          title={pick('Latest Properties', 'آخرین املاک')}
          description={pick(
            'The newest additions to the marketplace, published in the last few days.',
            'تازه‌ترین املاکی که در روزهای گذشته منتشر شده‌اند.',
          )}
          linkTo="/properties?sort=newest"
          linkLabel={t('common.viewAll')}
        />
        {loading ? (
          <PropertyGridSkeleton count={3} />
        ) : (
          <div className="property-grid">
            {items.map((property, i) => (
              <Reveal key={property.id} delay={i * 70}>
                <PropertyCard property={property} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export function Developments() {
  const { t, lang, pick } = useI18n()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/developments')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section" style={{ background: '#fff' }}>
      <div className="container">
        <SectionHead
          eyebrow={pick('New developments', 'پروژه‌های جدید')}
          title={pick('Upcoming Residential Projects', 'پروژه‌های مسکونی در راه')}
          description={pick(
            'Launch-phase projects with developer terms, payment plans and completion timelines.',
            'پروژه‌های در مرحله آغاز با شرایط سازنده، برنامه پرداخت و زمان تحویل.',
          )}
          linkTo="/projects"
          linkLabel={t('common.viewAll')}
        />

        {loading ? (
          <div className="property-grid">
            <div className="skeleton" style={{ height: 280, borderRadius: 22 }} />
            <div className="skeleton" style={{ height: 280, borderRadius: 22 }} />
            <div className="skeleton" style={{ height: 280, borderRadius: 22 }} />
          </div>
        ) : (
          <div className="property-grid">
            {items.slice(0, 3).map((item, i) => (
              <Reveal key={item.id} delay={i * 70}>
                <article className="card card-lg" style={{ overflow: 'hidden', height: '100%' }}>
                  <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden' }}>
                    <img src={item.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="badge badge-glass" style={{ position: 'absolute', top: 14, insetInlineStart: 14 }}>
                      {pick(item.status_en, item.status_fa)}
                    </span>
                  </div>
                  <div style={{ padding: 22 }}>
                    <h3 className="h-card">{pick(item.name_en, item.name_fa)}</h3>
                    <div className="property-loc" style={{ marginBlock: 8 }}>
                      <MapPin size={14} />
                      {pick(item.city_name_en, item.city_name_fa)}
                    </div>
                    <p className="small muted" style={{ lineHeight: 1.65 }}>
                      {pick(item.desc_en, item.desc_fa)}
                    </p>
                    <div className="spread" style={{ marginBlockStart: 18, paddingBlockStart: 14, borderBlockStart: '1px solid var(--border)' }}>
                      <span className="small muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <CalendarDays size={14} /> {item.completion}
                      </span>
                      <strong style={{ fontSize: '0.9rem' }}>
                        {lang === 'fa' ? 'از ' : 'from '}
                        {formatPrice(item.price_from, item.currency, lang)}
                      </strong>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
