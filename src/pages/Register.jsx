import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { useToast } from '../lib/toast.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function Register() {
  const { t } = useI18n()
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  usePageMeta({ title: `${t('auth.registerTitle')} — EstatePro` })

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = t('common.required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = t('common.required')
    if (form.password.length < 8) next.password = t('common.required')
    if (form.password !== form.confirm) next.confirm = t('common.required')
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
      })
      toast.success(t('dash.welcome'))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.errors) setErrors(err.errors)
      else toast.error(err.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSub')}>
      <form onSubmit={submit}>
        <div className="field">
          <label className="label" htmlFor="name">{t('auth.fullName')}</label>
          <input
            id="name"
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="email">{t('common.email')}</label>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="phone">{t('common.phone')} ({t('common.optional')})</label>
          <input
            id="phone"
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="confirm">{t('auth.confirmPassword')}</label>
          <input
            id="confirm"
            type="password"
            className="input"
            autoComplete="new-password"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            aria-invalid={Boolean(errors.confirm)}
          />
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </div>

        <button type="submit" className="btn btn-navy btn-block btn-lg" style={{ marginBlockStart: 22 }} disabled={busy}>
          {busy ? t('common.loading') : t('auth.signUp')}
        </button>
        <p className="tiny muted" style={{ marginBlockStart: 14 }}>{t('auth.terms')}</p>
      </form>

      <p className="auth-foot">
        {t('auth.hasAccount')} <Link to="/login">{t('auth.signIn')}</Link>
      </p>
    </AuthLayout>
  )
}
