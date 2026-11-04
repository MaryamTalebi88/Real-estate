import { useState } from 'react'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { useAuth } from '../../lib/auth.jsx'
import { useToast } from '../../lib/toast.jsx'
import usePageMeta from '../../lib/useMeta.js'

export default function AccountSettings() {
  const { t, pick } = useI18n()
  const { user, updateProfile, logout } = useAuth()
  const toast = useToast()

  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', password: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  usePageMeta({ title: `${t('dash.settings')} — EstatePro` })

  const submitProfile = async (event) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile({ name: profile.name, phone: profile.phone })
      toast.success(t('dash.profileSaved'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setSavingProfile(false)
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    if (passwords.password !== passwords.confirm) {
      toast.error(pick('Passwords do not match.', 'رمزهای عبور یکسان نیستند.'))
      return
    }
    setSavingPassword(true)
    try {
      await api.patch('/auth/profile', {
        currentPassword: passwords.currentPassword,
        password: passwords.password,
      })
      setPasswords({ currentPassword: '', password: '', confirm: '' })
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>{t('dash.settings')}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="card panel">
        <h2 className="h-card" style={{ marginBlockEnd: 18 }}>{t('dash.profileInfo')}</h2>
        <form className="form-grid" onSubmit={submitProfile}>
          <div className="field">
            <label className="label" htmlFor="p-name">{t('auth.fullName')}</label>
            <input
              id="p-name"
              className="input"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="p-phone">{t('common.phone')}</label>
            <input
              id="p-phone"
              className="input"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="p-email">{t('common.email')}</label>
            <input id="p-email" className="input" value={user?.email || ''} readOnly />
          </div>
          <div className="field">
            <label className="label" htmlFor="p-role">{t('admin.role')}</label>
            <input id="p-role" className="input" value={user?.role || ''} readOnly />
          </div>
          <div className="span-2">
            <button type="submit" className="btn btn-navy" disabled={savingProfile}>
              {savingProfile ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>

      <div className="card panel">
        <h2 className="h-card" style={{ marginBlockEnd: 6 }}>{t('dash.changePassword')}</h2>
        <p className="small muted" style={{ marginBlockEnd: 18 }}>{t('dash.passwordHint')}</p>
        <form className="form-grid" onSubmit={submitPassword}>
          <div className="field span-2">
            <label className="label" htmlFor="p-current">{t('dash.currentPassword')}</label>
            <input
              id="p-current"
              type="password"
              className="input"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="p-new">{t('auth.newPassword')}</label>
            <input
              id="p-new"
              type="password"
              className="input"
              required
              value={passwords.password}
              onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="p-confirm">{t('auth.confirmPassword')}</label>
            <input
              id="p-confirm"
              type="password"
              className="input"
              required
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
          </div>
          <div className="span-2 row gap-12">
            <button type="submit" className="btn btn-outline" disabled={savingPassword}>
              {savingPassword ? t('common.saving') : t('dash.changePassword')}
            </button>
            <button type="button" className="btn btn-light" onClick={logout}>
              {t('nav.logout')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
