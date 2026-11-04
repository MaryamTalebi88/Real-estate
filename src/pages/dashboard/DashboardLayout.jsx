import { NavLink, Outlet } from 'react-router-dom'
import { Heart, Home, Inbox, LayoutDashboard, Settings, Eye } from 'lucide-react'
import { useI18n } from '../../lib/i18n.jsx'
import { useAuth } from '../../lib/auth.jsx'

const LINKS = [
  { to: '/dashboard', end: true, key: 'dash.overview', icon: LayoutDashboard },
  { to: '/dashboard/favorites', key: 'dash.favorites', icon: Heart },
  { to: '/dashboard/listings', key: 'dash.listings', icon: Home },
  { to: '/dashboard/inquiries', key: 'dash.inquiries', icon: Inbox },
  { to: '/dashboard/recent', key: 'dash.recent', icon: Eye },
  { to: '/dashboard/settings', key: 'dash.settings', icon: Settings },
]

export default function DashboardLayout() {
  const { t, pick } = useI18n()
  const { user } = useAuth()

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>
            {t('dash.welcome')}
            {user ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p>{t('dash.subtitle')}</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="dash-shell">
            <nav className="dash-nav" aria-label={t('nav.dashboard')}>
              <span className="dash-nav-label">{pick('Account', 'حساب کاربری')}</span>
              {LINKS.map(({ to, end, key, icon: Icon }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Icon size={17} /> {t(key)}
                </NavLink>
              ))}
            </nav>
            <div className="dash-main">
              <Outlet />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
