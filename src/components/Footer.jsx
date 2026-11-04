import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send, Twitter } from 'lucide-react'
import Logo from './Logo.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { useAppData } from '../lib/appData.jsx'
import { api } from '../lib/api.js'
import { useToast } from '../lib/toast.jsx'

export default function Footer() {
  const { t, lang, pick } = useI18n()
  const { settings, categories } = useAppData()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const contact = settings.contact || {}
  const social = settings.social || {}

  const subscribe = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await api.post('/newsletter', { email })
      toast.success(t('newsletter.success'))
      setEmail('')
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const socialLinks = [
    { href: social.instagram, icon: Instagram, label: 'Instagram' },
    { href: social.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { href: social.facebook, icon: Facebook, label: 'Facebook' },
    { href: social.x, icon: Twitter, label: 'X' },
  ].filter((s) => s.href)

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p className="footer-about" style={{ marginBlockStart: 18 }}>
              {t('footer.about')}
            </p>
            <div className="socials" style={{ marginBlockStart: 22 }}>
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>{t('footer.quickLinks')}</h4>
            <div className="footer-links">
              <Link to="/properties">{t('nav.properties')}</Link>
              <Link to="/properties?listing=sale">{t('nav.buy')}</Link>
              <Link to="/properties?listing=rent">{t('nav.rent')}</Link>
              <Link to="/agents">{t('nav.agents')}</Link>
              <Link to="/projects">{t('nav.projects')}</Link>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/contact">{t('nav.contact')}</Link>
            </div>
          </div>

          <div>
            <h4>{t('footer.categories')}</h4>
            <div className="footer-links">
              {categories.map((c) => (
                <Link key={c.id} to={`/properties?type=${c.slug}`}>
                  {lang === 'fa' ? c.name_fa : c.name_en}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4>{t('footer.contact')}</h4>
            <ul className="footer-contact">
              {contact.phone && (
                <li>
                  <Phone size={15} />
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
                </li>
              )}
              {contact.email && (
                <li>
                  <Mail size={15} />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
              <li>
                <MapPin size={15} />
                <span>{pick(contact.address_en, contact.address_fa)}</span>
              </li>
            </ul>
            <form className="newsletter-form" onSubmit={subscribe}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                aria-label={t('newsletter.placeholder')}
              />
              <button type="submit" className="btn btn-gold btn-sm" disabled={busy} aria-label={t('newsletter.cta')}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {settings.siteName || 'EstatePro'}. {t('footer.rights')}
          </span>
          <nav>
            <Link to="/privacy">{t('footer.privacy')}</Link>
            <Link to="/terms">{t('footer.terms')}</Link>
            <Link to="/contact">{t('nav.contact')}</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
