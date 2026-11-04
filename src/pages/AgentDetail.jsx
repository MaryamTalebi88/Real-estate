import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Globe2, Mail, MessageCircle, Phone, Star } from 'lucide-react'
import PropertyCard from '../components/PropertyCard.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { api } from '../lib/api.js'
import usePageMeta from '../lib/useMeta.js'

export default function AgentDetail() {
  const { slug } = useParams()
  const { t, lang, pick } = useI18n()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  usePageMeta({
    title: data ? `${pick(data.agent.name_en, data.agent.name_fa)} — EstatePro` : 'EstatePro',
    description: data ? pick(data.agent.bio_en, data.agent.bio_fa) : undefined,
  })

  useEffect(() => {
    let active = true
    setLoading(true)
    api
      .get(`/agents/${slug}`)
      .then((res) => active && setData(res))
      .catch(() => active && setData(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 140 }}>
        <div className="skeleton" style={{ height: 260, borderRadius: 24 }} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container section">
        <div className="empty-state">
          <h2 className="h-section">{pick('Agent not found', 'مشاور پیدا نشد')}</h2>
          <Link to="/agents" className="btn btn-navy">{t('nav.agents')}</Link>
        </div>
      </div>
    )
  }

  const { agent, listings, reviews } = data
  const whatsapp = (agent.phone || '').replace(/[^\d]/g, '')

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumbs">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <Link to="/agents">{t('nav.agents')}</Link>
            <span>/</span>
            <span>{lang === 'fa' ? agent.name_fa : agent.name_en}</span>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="split" style={{ alignItems: 'start' }}>
            <div className="card panel">
              <div className="row gap-20" style={{ alignItems: 'center' }}>
                <img src={agent.avatar} alt="" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold-soft)' }} />
                <div>
                  <h1 style={{ fontSize: '1.55rem' }}>{lang === 'fa' ? agent.name_fa : agent.name_en}</h1>
                  <p className="small" style={{ color: 'var(--gold-deep)', fontWeight: 600, marginBlockStart: 4 }}>
                    {pick(agent.title_en, agent.title_fa)}
                  </p>
                  <p className="small muted" style={{ marginBlockStart: 6 }}>
                    {pick(agent.spec_en, agent.spec_fa)} · {agent.experience} {pick('years', 'سال تجربه')}
                  </p>
                </div>
              </div>

              <p style={{ marginBlockStart: 22, lineHeight: 1.8, color: '#4a4f56' }}>
                {pick(agent.bio_en, agent.bio_fa)}
              </p>

              <div className="divider" style={{ marginBlock: 20 }} />

              <div className="stack gap-12 small">
                {agent.phone && (
                  <a href={`tel:${agent.phone.replace(/\s/g, '')}`} className="row gap-8">
                    <Phone size={15} style={{ color: 'var(--gold-deep)' }} /> {agent.phone}
                  </a>
                )}
                {agent.email && (
                  <a href={`mailto:${agent.email}`} className="row gap-8">
                    <Mail size={15} style={{ color: 'var(--gold-deep)' }} /> {agent.email}
                  </a>
                )}
                {agent.languages?.length > 0 && (
                  <span className="row gap-8">
                    <Globe2 size={15} style={{ color: 'var(--gold-deep)' }} /> {agent.languages.join(' · ')}
                  </span>
                )}
              </div>

              <div className="row gap-10 wrap" style={{ marginBlockStart: 20 }}>
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    <MessageCircle size={15} /> {t('detail.whatsapp')}
                  </a>
                )}
                <Link to="/contact" className="btn btn-gold btn-sm">{t('detail.inquiry')}</Link>
              </div>
            </div>

            <div>
              <h2 className="h-section" style={{ fontSize: '1.3rem', marginBlockEnd: 18 }}>
                {pick('Active listings', 'املاک فعال')}
              </h2>
              {listings.length === 0 ? (
                <div className="empty-state">
                  <p className="muted">{pick('No live listings right now.', 'در حال حاضر آگهی فعالی ندارد.')}</p>
                </div>
              ) : (
                <div className="property-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {listings.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBlockStart: 44 }}>
            <h2 className="h-section" style={{ fontSize: '1.3rem', marginBlockEnd: 18 }}>
              {pick('Client reviews', 'نظرات مشتریان')}
            </h2>
            {reviews.length === 0 ? (
              <div className="empty-state">
                <p className="muted">{pick('No published reviews yet.', 'هنوز نظر منتشرشده‌ای ثبت نشده است.')}</p>
              </div>
            ) : (
              <div className="testimonial-track">
                {reviews.map((review) => (
                  <article className="testimonial-card" key={review.id}>
                    <div className="stars">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <blockquote>{review.body}</blockquote>
                    <div className="testimonial-person">
                      {review.avatar && <img src={review.avatar} alt="" loading="lazy" />}
                      <div>
                        <strong>{review.name}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
