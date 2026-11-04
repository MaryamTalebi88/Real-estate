import { Link } from 'react-router-dom'
import { ArrowRight, Bath, BedDouble, Heart, MapPin, Maximize, Car } from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'
import { useAuth } from '../lib/auth.jsx'
import { formatArea, formatNumber, formatPrice } from '../lib/format.js'

export default function PropertyCard({ property, variant = 'grid' }) {
  const { t, lang, pick } = useI18n()
  const { favoriteIds, toggleFavorite } = useAuth()
  if (!property) return null

  const isFav = favoriteIds.includes(property.id)
  const title = pick(property.title_en, property.title_fa)
  const city = pick(property.city_name_en, property.city_name_fa)
  const type = pick(property.category_name_en, property.category_name_fa)
  const isRent = property.listing_type === 'rent'

  return (
    <article className={`property-card ${variant === 'list' ? 'list' : ''}`}>
      <Link to={`/properties/${property.slug}`} className="property-media" aria-hidden="true" tabIndex={-1}>
        {property.cover ? (
          <img src={property.cover} alt="" loading="lazy" />
        ) : (
          <div className="skeleton" style={{ width: '100%', height: '100%' }} />
        )}
      </Link>

      <div className="property-badges">
        <span className={`badge ${isRent ? 'badge-navy' : 'badge-gold'}`}>
          {isRent ? t('card.forRent') : t('card.forSale')}
        </span>
        {property.is_featured && <span className="badge badge-glass">{t('card.featured')}</span>}
      </div>

      <button
        type="button"
        className={`fav-btn ${isFav ? 'is-active' : ''}`}
        aria-pressed={isFav}
        aria-label={t('nav.favorites')}
        onClick={() => toggleFavorite(property.id)}
      >
        <Heart size={17} fill={isFav ? 'currentColor' : 'none'} />
      </button>

      <div className="property-body">
        <div className="spread" style={{ alignItems: 'flex-start' }}>
          <div className="property-price">
            {formatPrice(property.price, property.currency, lang)}
            {isRent && <span> {t('card.perMonth')}</span>}
          </div>
          {property.is_verified && <span className="badge badge-success">{t('card.verified')}</span>}
        </div>

        <Link to={`/properties/${property.slug}`} className="property-title">
          {title}
        </Link>

        <div className="property-loc">
          <MapPin size={14} />
          <span>{[property.neighborhood, city].filter(Boolean).join(' · ')}</span>
        </div>

        <div className="property-specs">
          {property.bedrooms > 0 && (
            <span>
              <BedDouble size={15} /> <b>{formatNumber(property.bedrooms, lang)}</b> {t('card.beds')}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span>
              <Bath size={15} /> <b>{formatNumber(property.bathrooms, lang)}</b> {t('card.baths')}
            </span>
          )}
          <span>
            <Maximize size={15} /> <b>{formatArea(property.area, lang)}</b>
          </span>
          {property.parking > 0 && variant === 'list' && (
            <span>
              <Car size={15} /> <b>{formatNumber(property.parking, lang)}</b>
            </span>
          )}
        </div>

        <div className="property-foot">
          <span className="small muted">{type}</span>
          <Link to={`/properties/${property.slug}`} className="link-arrow">
            {t('common.viewDetails')} <ArrowRight size={15} className="flip-rtl" />
          </Link>
        </div>
      </div>
    </article>
  )
}
