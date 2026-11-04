import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  Flag,
  Home,
  Inbox,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Star,
  Users,
  X,
  MapPin,
  FolderTree,
} from 'lucide-react'
import Logo from '../../components/Logo.jsx'
import { useI18n } from '../../lib/i18n.jsx'
import { useAuth } from '../../lib/auth.jsx'

const GROUPS = [
  {
    labelEn: 'Manage',
    labelFa: 'مدیریت',
    links: [
      { to: '/admin', end: true, key: 'admin.overview', icon: LayoutDashboard },
      { to: '/admin/properties', key: 'admin.properties', icon: Building2 },
      { to: '/admin/inquiries', key: 'admin.inquiries', icon: Inbox },
      { to: '/admin/reviews', key: 'admin.reviews', icon: Star },
    ],
  },
  {
    labelEn: 'People',
    labelFa: 'افراد',
    links: [
      { to: '/admin/users', key: 'admin.users', icon: Users },
      { to: '/admin/agents', key: 'admin.agents', icon: ShieldCheck },
    ],
  },
  {
    labelEn: 'Content',
    labelFa: 'محتوا',
    links: [
      { to: '/admin/categories', key: 'admin.categories', icon: FolderTree },
      { to: '/admin/locations', key: 'admin.locations', icon: MapPin },
      { to: '/admin/homepage', key: 'admin.homepage', icon: Home },
      { to: '/admin/settings', key: 'admin.settings', icon: Settings },
    ],
  },
  {
    labelEn: 'Insight',
    labelFa: 'تحلیل',
    links: [{ to: '/admin/reports', key: 'admin.reports', icon: BarChart3 }],
  },
]

export default function AdminLayout() {
  const { t, pick } = useI18n()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="admin-shell">
      {open && <div className="drawer-backdrop" onClick={() => setOpen(false)} />}
      <aside className={`admin-side ${open ? 'open' : ''}`}>
        <div className="spread">
          <Logo />
          <button type="button" className="icon-btn admin-toggle" onClick={() => setOpen(false)} aria-label={t('common.close')} style={{ color: '#fff' }}>
            <X size={18} />
          </button>
        </div>

        {GROUPS.map((group) => (
          <div key={group.labelEn}>
            <span className="admin-label">{pick(group.labelEn, group.labelFa)}</span>
            {group.links.map(({ to, end, key, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setOpen(false)}
              >
                <Icon size={16} /> {t(key)}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="admin-foot">
          <Link to="/" className="row gap-8" style={{ fontSize: '0.82rem', padding: 10 }}>
            <Flag size={15} /> {pick('View website', 'مشاهده سایت')}
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div className="row gap-12">
            <button type="button" className="mini-btn admin-toggle" onClick={() => setOpen(true)} aria-label={t('nav.openMenu')}>
              <Menu size={16} />
            </button>
            <h1>{t(GROUPS.flatMap((g) => g.links).find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)))?.key || 'admin.title')}</h1>
          </div>
          <span className="small muted">
            {user?.name} · {t('admin.title')}
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
