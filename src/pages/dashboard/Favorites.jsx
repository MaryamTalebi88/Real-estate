import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import PropertyCard from '../../components/PropertyCard.jsx'
import { PropertyGridSkeleton } from '../../components/Skeletons.jsx'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { useAuth } from '../../lib/auth.jsx'
import usePageMeta from '../../lib/useMeta.js'

export default function Favorites() {
  const { t, pick } = useI18n()
  const { favoriteIds } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  usePageMeta({ title: `${t('dash.favorites')} — EstatePro` })

  useEffect(() => {
    api
      .get('/favorites')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const visible = items.filter((item) => favoriteIds.includes(item.id))

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>{t('dash.favorites')}</h1>
          <p>{pick('Properties you saved for later.', 'املاکی که برای بعد ذخیره کرده‌اید.')}</p>
        </div>
      </div>

      {loading ? (
        <PropertyGridSkeleton count={3} />
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Heart size={24} />
          </span>
          <h3 className="h-card">{t('dash.noFavorites')}</h3>
          <Link to="/properties" className="btn btn-navy btn-sm">
            {t('dash.browse')}
          </Link>
        </div>
      ) : (
        <div className="property-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {visible.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </>
  )
}
