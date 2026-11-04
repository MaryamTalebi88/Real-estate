import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import MapPanel from '../components/MapPanel.jsx'
import { useAppData } from '../lib/appData.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { useAuth } from '../lib/auth.jsx'
import { api } from '../lib/api.js'
import { useToast } from '../lib/toast.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function Contact() {
  const { settings, cities } = useAppData()
  const { t, pick } = useI18n()
  const { user } = useAuth()
  const toast = useToast()
  const contact = settings.contact || {}

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  usePageMeta({
    title: `${t('contact.title')} — EstatePro`,
    description: t('contact.subtitle'),
  })

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    try {
      await api.post('/inquiries', { ...form, kind: 'contact' })
      toast.success(t('contact.success'))
      setForm({ ...form, subject: '', message: '' })
    } catch (err) {
      if (err.errors) setErrors(err.errors)
      else toast.error(err.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const officeCity = cities[0]
  const officePoint = officeCity
    ? [{ id: 'office', lat: officeCity.lat, lng: officeCity.lng, title: contact.address_en }]
    : []

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumbs">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('nav.contact')}</span>
          </div>
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="contact-grid">
            <div className="card panel">
              <h2 className="h-card" style={{ fontSize: '1.15rem', marginBlockEnd: 18 }}>
                {pick('Send us a message', 'برای ما پیام بفرستید')}
              </h2>
              <form className="form-grid" onSubmit={submit}>
                <div className="field">
                  <label className="label" htmlFor="c-name">{t('common.name')}</label>
                  <input
                    id="c-name"
                    className="input"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="field">
                  <label className="label" htmlFor="c-email">{t('common.email')}</label>
                  <input
                    id="c-email"
                    type="email"
                    className="input"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
                <div className="field">
                  <label className="label" htmlFor="c-phone">{t('common.phone')}</label>
                  <input
                    id="c-phone"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="c-subject">{t('common.subject')}</label>
                  <input
                    id="c-subject"
                    className="input"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="field span-2">
                  <label className="label" htmlFor="c-message">{t('common.message')}</label>
                  <textarea
                    id="c-message"
                    className="textarea"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                </div>
                <div className="span-2">
                  <button type="submit" className="btn btn-gold" disabled={busy}>
                    {busy ? t('common.saving') : t('contact.send')} <Send size={15} />
                  </button>
                </div>
              </form>
            </div>

            <div>
              <div className="card panel" style={{ padding: 22 }}>
                <ul>
                  {contact.phone && (
                    <li className="contact-info-item">
                      <span className="ci-icon"><Phone size={17} /></span>
                      <div>
                        <strong>{t('common.phone')}</strong>
                        <span>{contact.phone}</span>
                      </div>
                    </li>
                  )}
                  {contact.email && (
                    <li className="contact-info-item">
                      <span className="ci-icon"><Mail size={17} /></span>
                      <div>
                        <strong>{t('common.email')}</strong>
                        <span>{contact.email}</span>
                      </div>
                    </li>
                  )}
                  <li className="contact-info-item">
                    <span className="ci-icon"><MapPin size={17} /></span>
                    <div>
                      <strong>{t('contact.office')}</strong>
                      <span>{pick(contact.address_en, contact.address_fa)}</span>
                    </div>
                  </li>
                  {contact.hours_en && (
                    <li className="contact-info-item">
                      <span className="ci-icon"><Clock size={17} /></span>
                      <div>
                        <strong>{t('contact.hours')}</strong>
                        <span>{pick(contact.hours_en, contact.hours_fa)}</span>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {officePoint.length > 0 && (
                <div className="map-panel" style={{ marginBlockStart: 16 }}>
                  <MapPanel points={officePoint} height={280} zoom={12} label={() => pick(contact.address_en, contact.address_fa)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
