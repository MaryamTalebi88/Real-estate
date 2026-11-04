import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import { api } from '../lib/api.js'
import { useI18n } from '../lib/i18n.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function ForgotPassword() {
  const { t, pick } = useI18n()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  usePageMeta({ title: `${t('auth.forgotTitle')} — EstatePro` })

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setSent(true)
      setToken(res.resetToken || null)
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title={t('auth.forgotTitle')} subtitle={t('auth.forgotSub')}>
      <form onSubmit={submit}>
        <div className="field">
          <label className="label" htmlFor="email">{t('common.email')}</label>
          <input
            id="email"
            type="email"
            className="input"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <p className="field-error" style={{ marginBlockStart: 12 }}>{error}</p>}
        <button type="submit" className="btn btn-navy btn-block btn-lg" style={{ marginBlockStart: 20 }} disabled={busy}>
          {busy ? t('common.loading') : t('auth.sendLink')}
        </button>
      </form>

      {sent && (
        <div className="sticky-note" style={{ marginBlockStart: 20 }}>
          {token ? (
            <>
              <p style={{ marginBlockEnd: 10 }}>
                {pick(
                  'Email delivery is not configured in this environment, so the reset link is shown here instead.',
                  'ارسال ایمیل در این محیط تنظیم نشده است، بنابراین لینک بازیابی اینجا نمایش داده می‌شود.',
                )}
              </p>
              <Link to={`/reset-password?token=${token}`} className="btn btn-gold btn-sm">
                {t('auth.newPassword')}
              </Link>
            </>
          ) : (
            <p>
              {pick(
                'If that email is registered, a reset link has been created.',
                'اگر این ایمیل ثبت شده باشد، لینک بازیابی ساخته شده است.',
              )}
            </p>
          )}
        </div>
      )}

      <p className="auth-foot">
        <Link to="/login">{t('auth.signIn')}</Link>
      </p>
    </AuthLayout>
  )
}
