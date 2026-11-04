import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { useAppData } from '../lib/appData.jsx'
import { useI18n } from '../lib/i18n.jsx'

export default function AuthLayout({ title, subtitle, children }) {
  const { settings } = useAppData()
  const { pick, t } = useI18n()

  return (
    <div className="auth-shell">
      <div className="auth-media">
        <img src={settings.whyImage} alt="" />
        <div className="auth-media-content">
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>
            {settings.siteName || 'EstatePro'}
          </span>
          <h2>{pick('A better way to find your next home.', 'راهی بهتر برای یافتن خانه بعدی.')}</h2>
          <p>
            {pick(
              'Save the properties you love, track inquiries, and list your own home in minutes.',
              'املاک مورد علاقه خود را ذخیره کنید، درخواست‌ها را پیگیری کنید و خانه‌تان را در چند دقیقه ثبت کنید.',
            )}
          </p>
          <Link to="/properties" className="btn btn-outline-light btn-sm" style={{ marginBlockStart: 22, alignSelf: 'flex-start' }}>
            {t('hero.explore')}
          </Link>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div style={{ marginBlockEnd: 26 }}>
            <Logo />
          </div>
          <h1>{title}</h1>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}
