import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'
import { useAppData } from '../lib/appData.jsx'
import { qs } from '../lib/api.js'

export default function SearchBar({ compact = false, initial = {} }) {
  const { t, lang } = useI18n()
  const { categories, cities } = useAppData()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    q: initial.q || '',
    type: initial.type || '',
    listing: initial.listing || '',
    minPrice: initial.minPrice || '',
    maxPrice: initial.maxPrice || '',
  })

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    navigate(`/properties${qs(form)}`)
  }

  return (
    <form className="search-bar" onSubmit={submit} role="search">
      <div className="search-cell">
        <label htmlFor="sb-location">{t('hero.location')}</label>
        <input
          id="sb-location"
          value={form.q}
          onChange={update('q')}
          placeholder={t('hero.locationPlaceholder')}
          autoComplete="off"
        />
      </div>

      <div className="search-cell">
        <label htmlFor="sb-type">{t('hero.type')}</label>
        <select id="sb-type" value={form.type} onChange={update('type')}>
          <option value="">{t('hero.any')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {lang === 'fa' ? c.name_fa : c.name_en}
            </option>
          ))}
        </select>
      </div>

      <div className="search-cell">
        <label htmlFor="sb-purpose">{t('hero.purpose')}</label>
        <select id="sb-purpose" value={form.listing} onChange={update('listing')}>
          <option value="">{t('hero.any')}</option>
          <option value="sale">{t('hero.buy')}</option>
          <option value="rent">{t('hero.rent')}</option>
        </select>
      </div>

      <div className="search-cell">
        <label htmlFor="sb-min">{t('hero.minPrice')}</label>
        <input
          id="sb-min"
          type="number"
          min="0"
          value={form.minPrice}
          onChange={update('minPrice')}
          placeholder="0"
        />
      </div>

      <div className="search-cell">
        <label htmlFor="sb-max">{t('hero.maxPrice')}</label>
        <input
          id="sb-max"
          type="number"
          min="0"
          value={form.maxPrice}
          onChange={update('maxPrice')}
          placeholder={t('hero.any')}
        />
      </div>

      <button type="submit" className="search-submit" aria-label={t('hero.search')}>
        <Search size={22} />
      </button>

      {!compact && cities.length > 0 && (
        <div className="popular-row" style={{ gridColumn: '1 / -1' }}>
          <span>{t('hero.popular')}</span>
          {cities.slice(0, 5).map((city) => (
            <button
              key={city.id}
              type="button"
              className="chip-clear"
              style={{ border: 0 }}
              onClick={() => navigate(`/properties?city=${city.slug}`)}
            >
              <span
                style={{
                  padding: '5px 13px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: 'rgba(255,255,255,0.86)',
                  fontSize: '0.8rem',
                }}
              >
                {lang === 'fa' ? city.name_fa : city.name_en}
              </span>
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
