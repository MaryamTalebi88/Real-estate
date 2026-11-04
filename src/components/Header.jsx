import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import Logo from './Logo.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { useAuth } from '../lib/auth.jsx'
import { api } from '../lib/api.js'
import { formatPrice } from '../lib/format.js'

const NAV = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/properties', key: 'nav.properties' },
  { to: '/properties?listing=sale', key: 'nav.buy' },
  { to: '/properties?listing=rent', key: 'nav.rent' },
  { to: '/sell', key: 'nav.sell' },
  { to: '/projects', key: 'nav.projects' },
  { to: '/agents', key: 'nav.agents' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
]

export default function Header() {
  const { t, lang, setLang } = useI18n()
  const { user, logout, favoriteIds } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const accountRef = useRef(null)
  const searchRef = useRef(null)

  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setDrawer(false)
    setAccountOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    document.body.style.overflow = drawer || searchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer, searchOpen])

  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    searchRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen])

  useEffect(() => {
    if (!searchOpen) return
    const value = term.trim()
    if (value.length < 2) {
      setResults([])
      return
    }
    const timer = window.setTimeout(() => {
      api
        .get(`/search/suggest?q=${encodeURIComponent(value)}`)
        .then(setResults)
        .catch(() => setResults([]))
    }, 220)
    return () => window.clearTimeout(timer)
  }, [term, searchOpen])

  useEffect(() => {
    if (!accountOpen) return
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [accountOpen])

  const submitSearch = (event) => {
    event.preventDefault()
    const value = term.trim()
    setSearchOpen(false)
    navigate(value ? `/properties?q=${encodeURIComponent(value)}` : '/properties')
  }

  const headerClass = [
    'site-header',
    isHome && !scrolled ? 'on-hero' : '',
    scrolled ? 'is-stuck' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className={headerClass}>
        <div className="header-inner">
          <Logo compact={scrolled} />

          <nav className="main-nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive &&
                    (item.to === '/' ||
                      location.pathname + location.search === item.to ||
                      (item.to === '/properties' && location.pathname === '/properties' && !location.search))
                      ? 'active'
                      : ''
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn desktop-only"
              aria-label={t('nav.search')}
              onClick={() => setSearchOpen(true)}
            >
              <Search size={19} />
            </button>

            <Link to="/dashboard/favorites" className="icon-btn desktop-only" aria-label={t('nav.favorites')}>
              <Heart size={19} />
              {favoriteIds.length > 0 && <span className="count-dot">{favoriteIds.length}</span>}
            </Link>

            <div className="lang-switch" role="group" aria-label="Language">
              <button
                type="button"
                className={lang === 'en' ? 'is-active' : ''}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={lang === 'fa' ? 'is-active' : ''}
                onClick={() => setLang('fa')}
              >
                فا
              </button>
            </div>

            <div className="account-menu desktop-only" ref={accountRef}>
              <button
                type="button"
                className="icon-btn"
                aria-label={t('nav.account')}
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    width={30}
                    height={30}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={19} />
                )}
              </button>
              {accountOpen && (
                <div className="dropdown" role="menu">
                  {user ? (
                    <>
                      <div className="dropdown-head">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <Link to="/dashboard" className="dropdown-item">
                        <LayoutDashboard size={16} /> {t('nav.dashboard')}
                      </Link>
                      <Link to="/dashboard/favorites" className="dropdown-item">
                        <Heart size={16} /> {t('nav.favorites')}
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="dropdown-item">
                          <ShieldCheck size={16} /> {t('nav.admin')}
                        </Link>
                      )}
                      <button type="button" className="dropdown-item danger" onClick={logout}>
                        <LogOut size={16} /> {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item">
                        <User size={16} /> {t('nav.login')}
                      </Link>
                      <Link to="/register" className="dropdown-item">
                        <ShieldCheck size={16} /> {t('nav.register')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/sell" className="btn btn-gold btn-sm desktop-only">
              {t('nav.listProperty')}
            </Link>

            <button
              type="button"
              className="icon-btn menu-toggle"
              aria-label={t('nav.openMenu')}
              onClick={() => setDrawer(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
          <aside className="drawer" aria-label="Mobile navigation">
            <div className="spread">
              <Logo />
              <button
                type="button"
                className="icon-btn"
                aria-label={t('nav.closeMenu')}
                onClick={() => setDrawer(false)}
              >
                <X size={20} />
              </button>
            </div>
            <nav className="drawer-nav">
              {NAV.map((item) => (
                <NavLink key={item.key} to={item.to} end={item.end}>
                  {t(item.key)} <ChevronRight size={16} className="flip-rtl" />
                </NavLink>
              ))}
            </nav>
            <Link to="/sell" className="btn btn-gold">
              {t('nav.listProperty')}
            </Link>
            <div className="drawer-foot">
              {user ? (
                <>
                  <p>
                    {t('nav.account')}: <strong>{user.name}</strong>
                  </p>
                  <Link to="/dashboard" className="btn btn-outline-light">
                    {t('nav.dashboard')}
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-outline-light">
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button type="button" className="btn btn-outline-light" onClick={logout}>
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-light">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn btn-gold">
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}

      {searchOpen && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.search')}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false)
          }}
        >
          <div className="search-overlay-inner">
            <form onSubmit={submitSearch}>
              <input
                ref={searchRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={t('hero.locationPlaceholder')}
                aria-label={t('nav.search')}
              />
            </form>
            <div className="search-results">
              {results.map((item) => (
                <Link key={item.slug} to={`/properties/${item.slug}`} className="search-result">
                  {item.cover && <img src={item.cover} alt="" loading="lazy" />}
                  <div className="grow">
                    <strong>{lang === 'fa' ? item.title_fa || item.title_en : item.title_en}</strong>
                    <span>
                      {[item.neighborhood, lang === 'fa' ? item.city_name_fa : item.city_name_en]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                  <strong className="nowrap" style={{ fontSize: '0.85rem' }}>
                    {formatPrice(item.price, item.currency, lang)}
                  </strong>
                </Link>
              ))}
            </div>
            <p style={{ marginBlockStart: 18, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
              {lang === 'fa' ? 'کلید Enter را برای جستجوی کامل بزنید' : 'Press Enter for the full search'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
