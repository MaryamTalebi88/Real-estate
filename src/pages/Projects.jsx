import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import { api } from '../lib/api.js'
import { useI18n } from '../lib/i18n.jsx'
import { formatPrice } from '../lib/format.js'
import { Reveal } from '../components/Reveal.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function Projects() {
  const { t, lang, pick } = useI18n()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  usePageMeta({
    title: `${pick('New developments', 'پروژه‌های جدید')} — EstatePro`,
    description: pick(
      'Launch-phase residential projects with developer payment plans and completion dates.',
      'پروژه‌های مسکونی در مرحله آغاز با برنامه پرداخت سازنده و تاریخ تحویل.',
    ),
  })

  useEffect(() => {
    api
      .get('/developments')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumbs">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('nav.projects')}</span>
          </div>
          <h1>{pick('New developments', 'پروژه‌های جدید')}</h1>
          <p>
            {pick(
              'Off-plan and newly completed projects, with payment plans and handover dates confirmed by the developer.',
              'پروژه‌های پیش‌فروش و تازه‌تکمیل، با برنامه پرداخت و تاریخ تحویل تأییدشده توسط سازنده.',
            )}
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          {loading ? (
            <div className="property-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 320, borderRadius: 24 }} />
              ))}
            </div>
          ) : (
            <div className="property-grid">
              {items.map((item, i) => (
                <Reveal key={item.id} delay={i * 60}>
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
                      <p className="small muted" style={{ lineHeight: 1.7 }}>
                        {pick(item.desc_en, item.desc_fa)}
                      </p>
                      <div className="spread" style={{ marginBlockStart: 18, paddingBlockStart: 14, borderBlockStart: '1px solid var(--border)' }}>
                        <span className="small muted row gap-6">
                          <CalendarDays size={14} /> {item.completion}
                        </span>
                        <strong style={{ fontSize: '0.9rem' }}>
                          {lang === 'fa' ? 'از ' : 'from '}
                          {formatPrice(item.price_from, item.currency, lang)}
                        </strong>
                      </div>
                      <Link to="/contact" className="btn btn-outline btn-sm btn-block" style={{ marginBlockStart: 16 }}>
                        {pick('Request the brochure', 'دریافت بروشور')}
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
