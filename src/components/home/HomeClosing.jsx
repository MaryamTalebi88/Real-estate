import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import SectionHead from '../SectionHead.jsx'
import { Reveal } from '../Reveal.jsx'
import { useAppData } from '../../lib/appData.jsx'
import { useI18n } from '../../lib/i18n.jsx'
import { formatNumber } from '../../lib/format.js'

export function Locations() {
  const { cities } = useAppData()
  const { t, lang, pick } = useI18n()

  return (
    <section className="section" style={{ background: '#fff' }}>
      <div className="container">
        <SectionHead
          eyebrow={pick('Explore locations', 'کاوش موقعیت‌ها')}
          title={pick('Where Would You Like To Live?', 'کجا دوست دارید زندگی کنید؟')}
          description={pick(
            'Neighbourhood guides, price movement and available listings for every city we cover.',
            'راهنمای محله‌ها، روند قیمت و املاک موجود در هر شهری که پوشش می‌دهیم.',
          )}
          linkTo="/properties"
          linkLabel={t('common.viewAll')}
        />
        <div className="location-grid">
          {cities.map((city, i) => (
            <Reveal key={city.id} delay={i * 60}>
              <Link to={`/properties?city=${city.slug}`} className="location-card">
                {city.image && <img src={city.image} alt="" loading="lazy" />}
                <div>
                  <h4>{lang === 'fa' ? city.name_fa : city.name_en}</h4>
                  <span>
                    {formatNumber(city.count, lang)} {lang === 'fa' ? 'ملک' : 'properties'} ·{' '}
                    {lang === 'fa' ? city.country_fa : city.country_en}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  const { settings } = useAppData()
  const { t, pick } = useI18n()
  const contact = settings.contact || {}

  return (
    <section className="section">
      <div className="container">
        <div className="cta-band">
          <img src={settings.whyImage} alt="" loading="lazy" />
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>
            {pick('Start today', 'همین امروز شروع کنید')}
          </span>
          <h2 className="h-section" style={{ color: '#fff', marginBlock: '18px 14px' }}>
            {pick('Ready to Find Your Dream Property?', 'آماده‌اید خانه رؤیایی خود را پیدا کنید؟')}
          </h2>
          <p className="lead" style={{ color: 'rgba(255,255,255,0.78)' }}>
            {pick(
              'Speak with an advisor, arrange a viewing, or list your own property in under ten minutes.',
              'با یک مشاور گفتگو کنید، بازدید ترتیب دهید یا ملک خود را در کمتر از ده دقیقه ثبت کنید.',
            )}
          </p>
          <div className="cta-actions">
            <Link to="/properties" className="btn btn-gold btn-lg">
              {t('hero.explore')} <ArrowRight size={16} className="flip-rtl" />
            </Link>
            <Link to="/sell" className="btn btn-outline-light btn-lg">
              {t('nav.listProperty')}
            </Link>
          </div>

          <div className="row wrap gap-24" style={{ marginBlockStart: 34, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            {contact.phone && (
              <span className="row gap-8">
                <Phone size={15} /> {contact.phone}
              </span>
            )}
            {contact.email && (
              <span className="row gap-8">
                <Mail size={15} /> {contact.email}
              </span>
            )}
            <span className="row gap-8">
              <MapPin size={15} /> {pick(contact.address_en, contact.address_fa)}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
