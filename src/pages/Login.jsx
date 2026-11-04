import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import AuthLayout from './AuthLayout.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function Login() {
  const { t, pick } = useI18n()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  usePageMeta({ title: `${t('auth.loginTitle')} — EstatePro` })

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await login(form.email.trim(), form.password)
      const from = location.state?.from
      if (from) navigate(from, { replace: true })
      else if (user.role === 'admin') navigate('/admin', { replace: true })
      else navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const fill = (email, password) => setForm({ email, password })

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSub')}>
      <form onSubmit={submit}>
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
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="field-error" style={{ marginBlockStart: 14 }}>{error}</p>}

        <div className="spread" style={{ marginBlock: '18px 6px' }}>
          <span />
          <Link to="/forgot-password" className="small" style={{ color: 'var(--gold-deep)', fontWeight: 600 }}>
            {t('auth.forgot')}
          </Link>
        </div>

        <button type="submit" className="btn btn-navy btn-block btn-lg" disabled={busy}>
          {busy ? t('common.loading') : t('auth.signIn')}
        </button>
      </form>

      <div className="demo-accounts">
        <strong>{t('auth.demoTitle')}</strong>
        <div className="stack gap-4" style={{ marginBlockStart: 8 }}>
          <button type="button" className="row gap-8" style={{ textAlign: 'start' }} onClick={() => fill('admin@estatepro.dev', 'Admin1234')}>
            <Lock size={13} /> <code>admin@estatepro.dev</code> / <code>Admin1234</code>
          </button>
          <button type="button" className="row gap-8" style={{ textAlign: 'start' }} onClick={() => fill('agent@estatepro.dev', 'Agent1234')}>
            <Lock size={13} /> <code>agent@estatepro.dev</code> / <code>Agent1234</code>
          </button>
          <button type="button" className="row gap-8" style={{ textAlign: 'start' }} onClick={() => fill('demo@estatepro.dev', 'Demo1234')}>
            <Lock size={13} /> <code>demo@estatepro.dev</code> / <code>Demo1234</code>
          </button>
        </div>
      </div>

      <p className="auth-foot">
        {t('auth.noAccount')} <Link to="/register">{t('auth.signUp')}</Link>
      </p>
      <p className="tiny muted center" style={{ marginBlockStart: 10 }}>
        <Mail size={12} style={{ verticalAlign: -2, marginInlineEnd: 5 }} />
        {pick('Accounts are stored in this app’s own database.', 'حساب‌ها در پایگاه داده همین اپ ذخیره می‌شوند.')}
      </p>
    </AuthLayout>
  )
}
