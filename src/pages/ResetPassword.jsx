import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import { api } from '../lib/api.js'
import { useI18n } from '../lib/i18n.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function ResetPassword() {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  usePageMeta({ title: `${t('auth.resetTitle')} — EstatePro` })

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) return setError(t('common.required'))
    if (password !== confirm) return setError(t('common.required'))
    setBusy(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      window.setTimeout(() => navigate('/login'), 2200)
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title={t('auth.resetTitle')}>
      {done ? (
        <div className="sticky-note">
          <p>{t('auth.resetDone')}</p>
          <Link to="/login" className="btn btn-gold btn-sm" style={{ marginBlockStart: 12 }}>
            {t('auth.signIn')}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label className="label" htmlFor="password">{t('auth.newPassword')}</label>
            <input
              id="password"
              type="password"
              className="input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="confirm">{t('auth.confirmPassword')}</label>
            <input
              id="confirm"
              type="password"
              className="input"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error && <p className="field-error" style={{ marginBlockStart: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-navy btn-block btn-lg" style={{ marginBlockStart: 20 }} disabled={busy || !token}>
            {busy ? t('common.loading') : t('common.save')}
          </button>
          {!token && <p className="field-error" style={{ marginBlockStart: 12 }}>{t('common.required')}</p>}
        </form>
      )}
    </AuthLayout>
  )
}
