import { Link } from 'react-router-dom'
import { Building2, Home, ShieldCheck, Star, Users } from 'lucide-react'
import SearchBar from '../SearchBar.jsx'
import { Counter, Reveal } from '../Reveal.jsx'
import { useI18n } from '../../lib/i18n.jsx'
import { useAppData } from '../../lib/appData.jsx'

const STAT_ICONS = { properties: Home, clients: Users, rating: Star, experience: ShieldCheck }

export default function Hero() {
  const { settings, cities } = useAppData()
  const { t, lang, pick } = useI18n()

  const heading =
    lang === 'fa'
      ? settings.heroHeadingFa || 'خانه رؤیایی خود را پیدا کنید'
      : settings.heroHeading || 'Find Your Dream Property'
  const accent =
    lang === 'fa'
      ? settings.heroHeadingAccentFa || 'رؤیایی'
      : settings.heroHeadingAccent || 'Dream Property'
  const idx = heading.toLowerCase().indexOf(accent.toLowerCase())
  const before = idx >= 0 ? heading.slice(0, idx) : heading
  const highlighted = idx >= 0 ? heading.slice(idx, idx + accent.length) : ''
  const after = idx >= 0 ? heading.slice(idx + accent.length) : ''
  const eyebrow =
    lang === 'fa'
      ? settings.heroEyebrowFa || 'کشف زندگی استثنایی'
      : settings.heroEyebrow || 'Discover Exceptional Living'
  const description =
    lang === 'fa'
      ? settings.heroDescriptionFa ||
        'املاک استثنایی را کشف کنید، موقعیت‌های ممتاز را ببینید و خانه‌ای بیابید که بتوانید خانه‌اش بنامید.'
      : settings.heroDescription

  const stats = settings.stats?.length
    ? settings.stats
    : [
        { key: 'properties', value: 1240, suffix: '+', labelEn: 'Properties', labelFa: 'ملک' },
        { key: 'clients', value: 860, suffix: '+', labelEn: 'Happy Clients', labelFa: 'مشتری راضی' },
        { key: 'rating', value: 4.9, suffix: '/5', labelEn: 'Rating', labelFa: 'امتیاز' },
        { key: 'experience', value: 14, suffix: 'yrs', labelEn: 'Experience', labelFa: 'سال تجربه' },
      ]

  return (
    <section className="hero">
      <div className="hero-media">
        <img src={settings.heroImage} alt="" />
      </div>

      <div className="hero-inner">
        <div>
          <Reveal>
            <span className="hero-badge">
              <i aria-hidden="true" />
              {eyebrow}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1>
              {before}
              {highlighted && <span className="gold-text">{highlighted}</span>}
              {after}
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="hero-sub">{description}</p>
          </Reveal>

          <Reveal delay={200}>
            <SearchBar initial={{}} />
          </Reveal>

          <Reveal delay={260}>
            <div className="stats-bar">
              {stats.map((stat) => {
                const Icon = STAT_ICONS[stat.key] || Building2
                return (
                  <div className="stat" key={stat.key}>
                    <div className="stat-top">
                      <Icon size={16} />
                    </div>
                    <Counter
                      value={Number(stat.value) || 0}
                      suffix={(lang === 'fa' ? stat.suffixFa : stat.suffix) || ''}
                      lang={lang}
                      decimals={Number(stat.value) % 1 !== 0 ? 1 : 0}
                    />
                    <div className="stat-label">{lang === 'fa' ? stat.labelFa : stat.labelEn}</div>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>

        <Reveal delay={220} className="hero-aside">
          <strong>
            {lang === 'fa'
              ? settings.heroAsideTitleFa || 'بیش از فقط یک ملک'
              : settings.heroAsideTitle || 'More Than Just Properties'}
          </strong>
          <p>
            {lang === 'fa'
              ? settings.heroAsideTextFa ||
                'سبکی بهتر برای زندگی — خانه‌های منتخب، مدارک تأییدشده و مشاورانی که پاسخ می‌دهند.'
              : settings.heroAsideText}
          </p>
          <div className="hero-aside-imgs">
            {cities.slice(0, 4).map((city) =>
              city.image ? <img key={city.id} src={city.image} alt="" loading="lazy" /> : null,
            )}
          </div>
          <Link to="/properties" className="btn btn-outline-light btn-sm" style={{ marginBlockStart: 10 }}>
            {t('hero.explore')}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
