import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useI18n } from '../lib/i18n.jsx'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (role && user.role !== role) {
    return (
      <div className="container section">
        <div className="empty-state">
          <h2 className="h-section">{t('admin.noAccess')}</h2>
          <p className="muted">{t('admin.noAccess')}</p>
        </div>
      </div>
    )
  }

  return children
}
