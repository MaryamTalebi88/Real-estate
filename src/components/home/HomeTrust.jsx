import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MapPinned,
  Plus,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react'
import SectionHead from '../SectionHead.jsx'
import { Reveal } from '../Reveal.jsx'
import { useAppData } from '../../lib/appData.jsx'
import { useI18n } from '../../lib/i18n.jsx'
import { api } from '../../lib/api.js'

export function WhyUs() {
  const { settings } = useAppData()
  const { t, lang, pick } = useI18n()

  const features = [
    {
      icon: BadgeCheck,
      title: pick('Verified Listings', 'آگهی‌های تأییدشده'),
      text: pick('100% genuine properties with checked documents.', 'املاک واقعی با مدارک بررسی‌شده.'),
    },
    {
      icon: UserRound,
      title: pick('Expert Guidance', 'راهنمایی تخصصی'),
      text: pick('Advisors who know every building and street.', 'مشاورانی که هر ساختمان و خیابان را می‌شناسند.'),
    },
    {
      icon: MapPinned,
      title: pick('Prime Locations', 'موقعیت‌های ممتاز'),
      text: pick('Only established and high-growth districts.', 'تنها محله‌های شناخته‌شده و رو به رشد.'),
    },
    {
      icon: ShieldCheck,
      title: pick('After-Sales Support', 'پشتیبانی پس از معامله'),
      text: pick('We stay with you after the keys change hands.', 'پس از تحویل کلید هم کنار شما می‌مانیم.'),
    },
  ]

  return (
    <section className="section section-dark on-dark">
      <div className="container">
        <div className="split">
          <Reveal className="split-media">
            <img src={settings.whyImage} alt="" loading="lazy" />
            <div className="floating-card">
              <span className="feature-icon" style={{ margin: 0, background: 'var(--gold)', color: 'var(--navy)' }}>
                <Star size={18} />
              </span>
              <div>
                <strong>{settings.stats?.[2]?.value || 4.9}/5</strong>
                <span>{pick('average client rating', 'میانگین امتیاز مشتریان')}</span>
              </div>
            </div>
          </Reveal>

          <div>
            <span className="eyebrow">{pick('Why choose EstatePro', 'چرا استیت‌پرو')}</span>
            <h2 className="h-section" style={{ marginBlock: '18px 16px', color: '#fff' }}>
              {(lang === 'fa' ? settings.whyHeadingFa : settings.whyHeading) ||
                pick('Your Trusted Real Estate Partner', 'شریک مطمئن شما در املاک')}
            </h2>
            <p className="lead" style={{ color: 'rgba(238,241,244,0.72)' }}>
              {(lang === 'fa' ? settings.whyDescriptionFa : settings.whyDescription) ||
                pick(
                  'Experience a smarter and more transparent way to discover, buy, and rent properties.',
                  'روشی هوشمندانه‌تر و شفاف‌تر برای کشف، خرید و اجاره ملک را تجربه کنید.',
                )}
            </p>

            <div className="feature-grid">
              {features.map(({ icon: Icon, title, text }) => (
                <div className="feature-card" key={title}>
                  <span className="feature-icon">
                    <Icon size={19} />
                  </span>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              ))}
            </div>

            <Link to="/about" className="btn btn-gold">
              {pick('Learn More About Us', 'بیشتر درباره ما بدانید')}
              <ArrowRight size={16} className="flip-rtl" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  const { pick } = useI18n()
  const steps = [
    {
      title: pick('Search Properties', 'جستجوی ملک'),
      text: pick(
        'Filter by city, budget, layout and amenities to build a shortlist that matches your life.',
        'با فیلتر شهر، بودجه، تعداد اتاق و امکانات، فهرستی متناسب با زندگی خود بسازید.',
      ),
    },
    {
      title: pick('Explore Your Options', 'بررسی گزینه‌ها'),
      text: pick(
        'Tour properties in person or by video, compare documents and ask anything from the advisor.',
        'ملک را حضوری یا ویدئویی ببینید، مدارک را مقایسه کنید و هر پرسشی از مشاور بپرسید.',
      ),
    },
    {
      title: pick('Find Your Perfect Home', 'خانه مناسب را پیدا کنید'),
      text: pick(
        'We negotiate, coordinate the paperwork and stay available after the handover.',
        'ما مذاکره و هماهنگی مدارک را انجام می‌دهیم و پس از تحویل نیز در دسترس می‌مانیم.',
      ),
    },
  ]

  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow={pick('How it works', 'چطور کار می‌کند')}
          title={pick('Three Simple Steps', 'سه گام ساده')}
          description={pick(
            'A clear process from first search to receiving the keys.',
            'فرایندی روشن از اولین جستجو تا دریافت کلید.',
          )}
        />
        <div className="steps">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 90} className="step">
              <span className="step-num">0{i + 1}</span>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Testimonials() {
  const { pick } = useI18n()
  const [reviews, setReviews] = useState([])
  const [page, setPage] = useState(0)
  const perPage = 3

  useEffect(() => {
    api
      .get('/reviews?limit=9')
      .then(setReviews)
      .catch(() => setReviews([]))
  }, [])

  if (!reviews.length) return null

  const pages = Math.max(1, Math.ceil(reviews.length / perPage))
  const visible = reviews.slice(page * perPage, page * perPage + perPage)

  return (
    <section className="section" style={{ background: '#fff' }}>
      <div className="container">
        <div className="section-head">
          <div className="stack">
            <span className="eyebrow">{pick('Client stories', 'تجربه مشتریان')}</span>
            <h2 className="h-section">{pick('What Our Clients Say', 'مشتریان ما چه می‌گویند')}</h2>
          </div>
          <div className="carousel-nav">
            <button
              type="button"
              onClick={() => setPage((p) => (p - 1 + pages) % pages)}
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={18} className="flip-rtl" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => (p + 1) % pages)}
              aria-label="Next testimonials"
            >
              <ChevronRight size={18} className="flip-rtl" />
            </button>
          </div>
        </div>

        <div className="testimonial-track">
          {visible.map((review) => (
            <article className="testimonial-card" key={review.id}>
              <div className="stars" aria-label={`${review.rating} out of 5`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <blockquote>{review.body}</blockquote>
              <div className="testimonial-person">
                {review.avatar && <img src={review.avatar} alt="" loading="lazy" />}
                <div>
                  <strong>{review.name}</strong>
                  <span>
                    {review.property_reference
                      ? `${pick('Property', 'ملک')} ${review.property_reference}`
                      : pick('Verified client', 'مشتری تأییدشده')}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  const { settings } = useAppData()
  const { pick } = useI18n()
  const [open, setOpen] = useState(0)
  const items = settings.faq || []

  if (!items.length) return null

  return (
    <section className="section">
      <div className="container">
        <div className="split" style={{ alignItems: 'start' }}>
          <div>
            <span className="eyebrow">{pick('Questions', 'پرسش‌ها')}</span>
            <h2 className="h-section" style={{ marginBlock: '18px 14px' }}>
              {pick('Frequently Asked Questions', 'پرسش‌های پرتکرار')}
            </h2>
            <p className="lead">
              {pick(
                'Everything about viewings, verification, fees and paperwork. Still curious? Our team answers within a day.',
                'همه‌چیز درباره بازدید، تأیید اصالت، کارمزد و مدارک. سؤالی دارید؟ تیم ما در یک روز پاسخ می‌دهد.',
              )}
            </p>
            <Link to="/contact" className="btn btn-outline" style={{ marginBlockStart: 24 }}>
              {pick('Ask a question', 'پرسش خود را بپرسید')}
            </Link>
          </div>

          <div className="accordion">
            {items.map((item, i) => {
              const expanded = open === i
              return (
                <div className="accordion-item" key={i}>
                  <button
                    type="button"
                    className="accordion-trigger"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? -1 : i)}
                  >
                    {pick(item.q_en, item.q_fa)}
                    <span className="acc-icon">
                      <Plus size={16} />
                    </span>
                  </button>
                  <div className={`accordion-panel ${expanded ? 'open' : ''}`}>
                    <div>
                      <p>{pick(item.a_en, item.a_fa)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
