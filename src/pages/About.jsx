import { Link } from 'react-router-dom'
import { BadgeCheck, Building2, HeartHandshake, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useAppData } from '../lib/appData.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { Reveal } from '../components/Reveal.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function About() {
  const { settings } = useAppData()
  const { t, pick } = useI18n()

  usePageMeta({
    title: `${pick('About us', 'درباره ما')} — EstatePro`,
    description: pick(
      'EstatePro is a premium property marketplace and advisory built on verified listings and transparent advice.',
      'استیت‌پرو بازاری حرفه‌ای برای املاک است که بر پایه آگهی‌های تأییدشده و مشاوره شفاف ساخته شده.',
    ),
  })

  const pillars = [
    {
      icon: BadgeCheck,
      title: pick('Verified first', 'تأیید اصالت، اول از همه'),
      text: pick(
        'Every listing is checked for ownership, pricing and photography before publication.',
        'هر آگهی پیش از انتشار از نظر مالکیت، قیمت و تصاویر بررسی می‌شود.',
      ),
    },
    {
      icon: ShieldCheck,
      title: pick('Transparent fees', 'کارمزد شفاف'),
      text: pick(
        'Commission is agreed in writing before any viewing. No surprise charges at signing.',
        'کارمزد پیش از هر بازدید به‌صورت کتبی توافق می‌شود. بدون هزینه غافلگیرکننده هنگام امضا.',
      ),
    },
    {
      icon: Users,
      title: pick('Local specialists', 'متخصصان محلی'),
      text: pick(
        'Advisors who live in the neighbourhoods they sell, not a call centre.',
        'مشاورانی که در همان محله‌هایی که می‌فروشند زندگی می‌کنند، نه یک مرکز تماس.',
      ),
    },
    {
      icon: HeartHandshake,
      title: pick('Support after handover', 'پشتیبانی پس از تحویل'),
      text: pick(
        'Utilities, handover snags and renovation introductions — we stay available.',
        'قبوض، ایرادات تحویل و معرفی تیم بازسازی — ما در دسترس می‌مانیم.',
      ),
    },
  ]

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumbs">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('nav.about')}</span>
          </div>
          <h1>{pick('A property partner, not a listing site', 'شریکی در املاک، نه فقط یک سایت آگهی')}</h1>
          <p>
            {pick(
              'EstatePro was built for buyers who want the details: real photos, verified documents and advisors who answer.',
              'استیت‌پرو برای خریدارانی ساخته شده که جزئیات را می‌خواهند: تصاویر واقعی، مدارک تأییدشده و مشاورانی که پاسخ می‌دهند.',
            )}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <Reveal className="split-media">
              <img src={settings.heroImage} alt="" loading="lazy" />
              <div className="floating-card">
                <span className="feature-icon" style={{ margin: 0, background: 'var(--gold)', color: 'var(--navy)' }}>
                  <Sparkles size={18} />
                </span>
                <div>
                  <strong>{pick('14 years', '۱۴ سال')}</strong>
                  <span>{pick('of local market knowledge', 'تجربه بازار محلی')}</span>
                </div>
              </div>
            </Reveal>
            <div>
              <span className="eyebrow">{pick('Our story', 'داستان ما')}</span>
              <h2 className="h-section" style={{ marginBlock: '18px 16px' }}>
                {pick('The details make a home', 'جزئیات است که خانه را می‌سازد')}
              </h2>
              <p className="lead">
                {pick(
                  'We started in a single office in Dubai with one belief: buyers deserve the same information the seller has. Today we work across six cities, but the rule has not changed.',
                  'ما با یک دفتر در دبی و یک باور شروع کردیم: خریدار هم باید همان اطلاعاتی را داشته باشد که فروشنده دارد. امروز در شش شهر فعالیم، اما این قاعده تغییر نکرده است.',
                )}
              </p>
              <p className="lead" style={{ marginBlockStart: 14 }}>
                {pick(
                  'Every property on this site is submitted by an owner or a verified agent and reviewed by our team. What you see is what is available.',
                  'هر ملکی که در این سایت می‌بینید توسط مالک یا مشاور تأییدشده ثبت و توسط تیم ما بررسی شده است. آنچه می‌بینید همان چیزی است که موجود است.',
                )}
              </p>
              <div className="row gap-12 wrap" style={{ marginBlockStart: 26 }}>
                <Link to="/agents" className="btn btn-navy">{t('nav.agents')}</Link>
                <Link to="/contact" className="btn btn-outline">{t('nav.contact')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark on-dark">
        <div className="container">
          <span className="eyebrow">{pick('How we work', 'شیوه کار ما')}</span>
          <h2 className="h-section" style={{ marginBlock: '18px 30px', color: '#fff' }}>
            {pick('Four commitments', 'چهار تعهد')}
          </h2>
          <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {pillars.map(({ icon: Icon, title, text }) => (
              <div className="feature-card" key={title}>
                <span className="feature-icon">
                  <Icon size={19} />
                </span>
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="kpi-grid">
            {(settings.stats || []).map((stat) => (
              <div className="kpi" key={stat.key}>
                <span className="kpi-icon">
                  <Building2 size={17} />
                </span>
                <strong>
                  {stat.value}
                  {stat.suffix}
                </strong>
                <span>{pick(stat.labelEn, stat.labelFa)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
