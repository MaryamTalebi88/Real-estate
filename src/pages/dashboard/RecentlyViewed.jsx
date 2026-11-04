import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import PropertyCard from '../../components/PropertyCard.jsx'
import { PropertyGridSkeleton } from '../../components/Skeletons.jsx'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import usePageMeta from '../../lib/useMeta.js'

export default function RecentlyViewed() {
  const { t, pick } = useI18n()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  usePageMeta({ title: `${t('dash.recent')} — EstatePro` })

  useEffect(() => {
    api
      .get('/me/recently-viewed')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>{t('dash.recent')}</h1>
          <p>{pick('The last properties you opened while signed in.', 'آخرین املاکی که در حالت ورود باز کرده‌اید.')}</p>
        </div>
      </div>

      {loading ? (
        <PropertyGridSkeleton count={3} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Eye size={24} />
          </span>
          <h3 className="h-card">{t('dash.noRecent')}</h3>
          <Link to="/properties" className="btn btn-navy btn-sm">{t('dash.browse')}</Link>
        </div>
      ) : (
        <div className="property-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {items.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </>
  )
}
