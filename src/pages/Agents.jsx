import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Star } from 'lucide-react'
import { api } from '../lib/api.js'
import { useI18n } from '../lib/i18n.jsx'
import { Reveal } from '../components/Reveal.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function Agents() {
  const { t, lang, pick } = useI18n()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  usePageMeta({
    title: `${pick('Our agents', 'مشاوران ما')} — EstatePro`,
    description: pick(
      'Meet the advisors behind EstatePro — specialists in luxury homes, family houses and commercial leasing.',
      'با مشاوران استیت‌پرو آشنا شوید — متخصصان خانه‌های لوکس، خانه‌های خانوادگی و اجاره تجاری.',
    ),
  })

  useEffect(() => {
    api
      .get('/agents')
      .then(setAgents)
      .catch(() => setAgents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumbs">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('nav.agents')}</span>
          </div>
          <h1>{pick('Meet our advisors', 'با مشاوران ما آشنا شوید')}</h1>
          <p>
            {pick(
              'Six specialists, one standard: honest advice and documentation you can trust.',
              'شش متخصص، یک استاندارد: مشاوره صادقانه و مدارکی که می‌توانید به آن اعتماد کنید.',
            )}
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          {loading ? (
            <div className="agent-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 320, borderRadius: 24 }} />
              ))}
            </div>
          ) : (
            <div className="agent-grid">
              {agents.map((agent, i) => (
                <Reveal key={agent.id} delay={i * 60}>
                  <article className="agent-tile">
                    <img src={agent.avatar} alt="" loading="lazy" />
                    <h3>{lang === 'fa' ? agent.name_fa : agent.name_en}</h3>
                    <div className="agent-spec">{pick(agent.title_en, agent.title_fa)}</div>
                    <div className="agent-stats">
                      <div>
                        <strong>{agent.listings}</strong>
                        <span>{pick('listings', 'ملک')}</span>
                      </div>
                      <div>
                        <strong>{agent.experience}</strong>
                        <span>{pick('years', 'سال تجربه')}</span>
                      </div>
                    </div>
                    <p>{pick(agent.bio_en, agent.bio_fa)?.slice(0, 118)}…</p>
                    <div className="row gap-8" style={{ justifyContent: 'center', marginBlock: '16px 12px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <span className="row gap-4">
                        <Star size={13} style={{ color: 'var(--gold)' }} fill="currentColor" /> {pick(agent.spec_en, agent.spec_fa)}
                      </span>
                    </div>
                    <Link to={`/agents/${agent.slug}`} className="btn btn-outline btn-sm btn-block">
                      {pick('View profile', 'مشاهده پروفایل')}
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card panel" style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <span className="feature-icon" style={{ background: 'rgba(221,187,114,0.2)', color: '#8a6b28' }}>
                <Mail size={18} />
              </span>
              <h3 className="h-card">{pick('Not sure who to ask?', 'نمی‌دانید از چه کسی بپرسید؟')}</h3>
              <p className="small muted" style={{ marginBlockStart: 6 }}>
                {pick('Send one message and we route it to the right specialist.', 'یک پیام بفرستید تا آن را به متخصص مناسب برسانیم.')}
              </p>
              <Link to="/contact" className="btn btn-navy btn-sm" style={{ marginBlockStart: 14 }}>
                {t('nav.contact')}
              </Link>
            </div>
            <div>
              <span className="feature-icon" style={{ background: 'rgba(221,187,114,0.2)', color: '#8a6b28' }}>
                <MapPin size={18} />
              </span>
              <h3 className="h-card">{pick('Six cities covered', 'پوشش شش شهر')}</h3>
              <p className="small muted" style={{ marginBlockStart: 6 }}>
                {pick('Dubai, Abu Dhabi, Lahore, Karachi, Islamabad and Tehran.', 'دبی، ابوظبی، لاهور، کراچی، اسلام‌آباد و تهران.')}
              </p>
            </div>
            <div>
              <span className="feature-icon" style={{ background: 'rgba(221,187,114,0.2)', color: '#8a6b28' }}>
                <Star size={18} />
              </span>
              <h3 className="h-card">{pick('4.9 / 5 average rating', 'میانگین امتیاز ۴.۹ از ۵')}</h3>
              <p className="small muted" style={{ marginBlockStart: 6 }}>
                {pick('Based on verified client reviews published on this site.', 'بر اساس نظرات تأییدشده مشتریان در همین سایت.')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
