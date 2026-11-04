import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  SearchX,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import PropertyCard from '../components/PropertyCard.jsx'
import Pagination from '../components/Pagination.jsx'
import MapPanel from '../components/MapPanel.jsx'
import { PropertyGridSkeleton } from '../components/Skeletons.jsx'
import { useAppData } from '../lib/appData.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { api, qs } from '../lib/api.js'
import { formatNumber } from '../lib/format.js'
import usePageMeta from '../lib/useMeta.js'

const FILTER_KEYS = [
  'q', 'type', 'listing', 'city', 'neighborhood', 'minPrice', 'maxPrice',
  'bedrooms', 'bathrooms', 'minArea', 'maxArea', 'furnishing', 'isNew', 'verified', 'featured',
]

const PAGE_SIZE = 9

export default function Properties() {
  const { t, lang, pick } = useI18n()
  const { categories, cities, neighborhoods } = useAppData()
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState(() => Object.fromEntries(params.entries()))
  const [state, setState] = useState({ items: [], total: 0, pages: 1, loading: true })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const lastWritten = useRef(params.toString())

  usePageMeta({
    title: `${pick('Properties for sale and rent', 'املاک برای خرید و اجاره')} — EstatePro`,
    description: pick(
      'Search verified properties across Dubai, Lahore, Karachi, Islamabad, Abu Dhabi and Tehran.',
      'جستجوی املاک تأییدشده در دبی، لاهور، کراچی، اسلام‌آباد، ابوظبی و تهران.',
    ),
  })

  /* URL is the source of truth; local draft keeps typing smooth. */
  useEffect(() => {
    if (params.toString() !== lastWritten.current) {
      lastWritten.current = params.toString()
      setDraft(Object.fromEntries(params.entries()))
    }
  }, [params])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams()
      Object.entries(draft).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined && value !== false) {
          next.set(key, String(value))
        }
      })
      if (next.toString() !== params.toString()) {
        lastWritten.current = next.toString()
        setParams(next, { replace: true })
      }
    }, 280)
    return () => window.clearTimeout(timer)
  }, [draft, params, setParams])

  const query = params.toString()

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true }))
    const page = Number(new URLSearchParams(query).get('page')) || 1
    api
      .get(`/properties${qs({ ...Object.fromEntries(new URLSearchParams(query)), limit: PAGE_SIZE, page })}`)
      .then((data) => {
        if (!active) return
        setState({ items: data.items, total: data.total, pages: data.pages, loading: false })
      })
      .catch(() => {
        if (active) setState({ items: [], total: 0, pages: 1, loading: false })
      })
    return () => {
      active = false
    }
  }, [query])

  const view = draft.view === 'list' ? 'list' : 'grid'
  const showMap = draft.map === '1'

  const set = (key, value) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      if (key !== 'page') delete next.page
      return next
    })
  }

  const clearFilters = () => {
    setDraft((prev) => {
      const next = {}
      if (prev.sort) next.sort = prev.sort
      if (prev.view) next.view = prev.view
      if (prev.map) next.map = prev.map
      return next
    })
  }

  const activeChips = useMemo(() => {
    const chips = []
    const category = categories.find((c) => c.slug === draft.type)
    const city = cities.find((c) => c.slug === draft.city)
    if (draft.q) chips.push({ key: 'q', label: `“${draft.q}”` })
    if (draft.listing) {
      chips.push({ key: 'listing', label: draft.listing === 'rent' ? t('card.forRent') : t('card.forSale') })
    }
    if (category) chips.push({ key: 'type', label: lang === 'fa' ? category.name_fa : category.name_en })
    if (city) chips.push({ key: 'city', label: lang === 'fa' ? city.name_fa : city.name_en })
    if (draft.neighborhood) chips.push({ key: 'neighborhood', label: draft.neighborhood })
    if (draft.minPrice) chips.push({ key: 'minPrice', label: `${t('hero.minPrice')}: ${formatNumber(draft.minPrice, lang)}` })
    if (draft.maxPrice) chips.push({ key: 'maxPrice', label: `${t('hero.maxPrice')}: ${formatNumber(draft.maxPrice, lang)}` })
    if (draft.bedrooms) chips.push({ key: 'bedrooms', label: `${draft.bedrooms}+ ${t('card.beds')}` })
    if (draft.bathrooms) chips.push({ key: 'bathrooms', label: `${draft.bathrooms}+ ${t('card.baths')}` })
    if (draft.minArea) chips.push({ key: 'minArea', label: `≥ ${formatNumber(draft.minArea, lang)} m²` })
    if (draft.maxArea) chips.push({ key: 'maxArea', label: `≤ ${formatNumber(draft.maxArea, lang)} m²` })
    if (draft.furnishing) chips.push({ key: 'furnishing', label: t(`filters.${draft.furnishing}`) })
    if (draft.isNew) chips.push({ key: 'isNew', label: t('filters.isNew') })
    if (draft.verified) chips.push({ key: 'verified', label: t('filters.verified') })
    if (draft.featured) chips.push({ key: 'featured', label: t('filters.featured') })
    return chips
  }, [draft, categories, cities, lang, t])

  const cityNeighborhoods = neighborhoods.filter((n) => {
    const city = cities.find((c) => c.slug === draft.city)
    return city ? n.city_id === city.id : true
  })

  const filtersPanel = (
    <>
      <div className="filters-head">
        <strong>{t('filters.title')}</strong>
        <button type="button" className="mini-btn" onClick={() => setDrawerOpen(false)} aria-label={t('common.close')}>
          <X size={15} />
        </button>
      </div>

      <div className="filter-group">
        <span className="label">{t('filters.purpose')}</span>
        <div className="row wrap gap-8">
          {[
            { value: '', label: t('common.all') },
            { value: 'sale', label: t('hero.buy') },
            { value: 'rent', label: t('hero.rent') },
          ].map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              className="chip"
              aria-pressed={(draft.listing || '') === option.value}
              onClick={() => set('listing', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="label" htmlFor="f-type">{t('filters.type')}</label>
        <select id="f-type" className="select" value={draft.type || ''} onChange={(e) => set('type', e.target.value)}>
          <option value="">{t('filters.any')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{lang === 'fa' ? c.name_fa : c.name_en}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="label" htmlFor="f-city">{t('filters.city')}</label>
        <select
          id="f-city"
          className="select"
          value={draft.city || ''}
          onChange={(e) => {
            setDraft((prev) => ({ ...prev, city: e.target.value, neighborhood: '', page: undefined }))
          }}
        >
          <option value="">{t('filters.any')}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.slug}>{lang === 'fa' ? c.name_fa : c.name_en}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="label" htmlFor="f-hood">{t('filters.neighborhood')}</label>
        <select
          id="f-hood"
          className="select"
          value={draft.neighborhood || ''}
          onChange={(e) => set('neighborhood', e.target.value)}
        >
          <option value="">{t('filters.any')}</option>
          {cityNeighborhoods.map((n) => (
            <option key={n.id} value={n.name_en}>{lang === 'fa' ? n.name_fa : n.name_en}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="label">{t('filters.price')}</span>
        <div className="price-row">
          <input
            className="input"
            type="number"
            min="0"
            placeholder={t('hero.minPrice')}
            value={draft.minPrice || ''}
            onChange={(e) => set('minPrice', e.target.value)}
            aria-label={t('hero.minPrice')}
          />
          <input
            className="input"
            type="number"
            min="0"
            placeholder={t('hero.maxPrice')}
            value={draft.maxPrice || ''}
            onChange={(e) => set('maxPrice', e.target.value)}
            aria-label={t('hero.maxPrice')}
          />
        </div>
      </div>

      <div className="filter-group">
        <span className="label">{t('filters.bedrooms')}</span>
        <div className="row wrap gap-8">
          {['', '1', '2', '3', '4', '5'].map((value) => (
            <button
              key={value || 'any'}
              type="button"
              className="chip"
              aria-pressed={(draft.bedrooms || '') === value}
              onClick={() => set('bedrooms', value)}
            >
              {value ? `${value}+` : t('filters.any')}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="label">{t('filters.bathrooms')}</span>
        <div className="row wrap gap-8">
          {['', '1', '2', '3', '4'].map((value) => (
            <button
              key={value || 'any'}
              type="button"
              className="chip"
              aria-pressed={(draft.bathrooms || '') === value}
              onClick={() => set('bathrooms', value)}
            >
              {value ? `${value}+` : t('filters.any')}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="label">{t('filters.area')}</span>
        <div className="price-row">
          <input
            className="input"
            type="number"
            min="0"
            placeholder={t('hero.minPrice')}
            value={draft.minArea || ''}
            onChange={(e) => set('minArea', e.target.value)}
            aria-label={`${t('filters.area')} min`}
          />
          <input
            className="input"
            type="number"
            min="0"
            placeholder={t('hero.maxPrice')}
            value={draft.maxArea || ''}
            onChange={(e) => set('maxArea', e.target.value)}
            aria-label={`${t('filters.area')} max`}
          />
        </div>
      </div>

      <div className="filter-group">
        <label className="label" htmlFor="f-furnish">{t('filters.furnishing')}</label>
        <select
          id="f-furnish"
          className="select"
          value={draft.furnishing || ''}
          onChange={(e) => set('furnishing', e.target.value)}
        >
          <option value="">{t('filters.any')}</option>
          <option value="furnished">{t('filters.furnished')}</option>
          <option value="semi">{t('filters.semi')}</option>
          <option value="unfurnished">{t('filters.unfurnished')}</option>
        </select>
      </div>

      <div className="filter-toggles">
        <label className="check">
          <input type="checkbox" checked={draft.isNew === 'true'} onChange={(e) => set('isNew', e.target.checked ? 'true' : '')} />
          {t('filters.isNew')}
        </label>
        <label className="check">
          <input type="checkbox" checked={draft.verified === 'true'} onChange={(e) => set('verified', e.target.checked ? 'true' : '')} />
          {t('filters.verified')}
        </label>
        <label className="check">
          <input type="checkbox" checked={draft.featured === 'true'} onChange={(e) => set('featured', e.target.checked ? 'true' : '')} />
          {t('filters.featured')}
        </label>
      </div>

      <button type="button" className="btn btn-navy btn-block" onClick={() => setDrawerOpen(false)}>
        {t('common.apply')}
      </button>
      <button type="button" className="chip chip-clear" style={{ alignSelf: 'center' }} onClick={clearFilters}>
        {t('filters.clearAll')}
      </button>
    </>
  )

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="crumbs">
            <span>{t('nav.home')}</span>
            <span>/</span>
            <span>{t('nav.properties')}</span>
          </div>
          <h1>{pick('Find your next address', 'نشانی بعدی خود را پیدا کنید')}</h1>
          <p>
            {pick(
              'Every listing below is submitted by an owner or a verified agent, and reviewed before it appears here.',
              'هر آگهی زیر توسط مالک یا مشاور تأییدشده ثبت شده و پیش از نمایش در اینجا بررسی شده است.',
            )}
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="filter-bar-mobile">
            <button type="button" className="btn btn-outline btn-sm grow" onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal size={15} /> {t('common.filters')}
              {activeChips.length > 0 && ` (${activeChips.length})`}
            </button>
          </div>

          <div className="listings-layout">
            <aside className={`filters ${drawerOpen ? 'open' : ''}`} aria-label={t('common.filters')}>
              {filtersPanel}
            </aside>
            {drawerOpen && <div className="drawer-backdrop" style={{ zIndex: 120 }} onClick={() => setDrawerOpen(false)} />}

            <div>
              <div className="listings-toolbar">
                <div className="results-count">
                  {state.loading ? (
                    t('common.loading')
                  ) : (
                    <>
                      <strong>{formatNumber(state.total, lang)}</strong> {t('filters.results')}
                    </>
                  )}
                </div>
                <div className="row gap-12 wrap">
                  <button
                    type="button"
                    className={`chip ${showMap ? 'is-active' : ''}`}
                    onClick={() => set('map', showMap ? '' : '1')}
                  >
                    <MapIcon size={15} /> {showMap ? t('filters.hideMap') : t('filters.showMap')}
                  </button>
                  <select
                    className="select"
                    style={{ width: 170 }}
                    value={draft.sort || 'newest'}
                    onChange={(e) => set('sort', e.target.value)}
                    aria-label={t('filters.sort')}
                  >
                    <option value="newest">{t('filters.sortNewest')}</option>
                    <option value="price_asc">{t('filters.sortPriceAsc')}</option>
                    <option value="price_desc">{t('filters.sortPriceDesc')}</option>
                    <option value="popular">{t('filters.sortPopular')}</option>
                    <option value="area_desc">{t('filters.sortArea')}</option>
                  </select>
                  <div className="view-toggle">
                    <button
                      type="button"
                      className={view === 'grid' ? 'is-active' : ''}
                      onClick={() => set('view', 'grid')}
                      aria-label="Grid view"
                      aria-pressed={view === 'grid'}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      type="button"
                      className={view === 'list' ? 'is-active' : ''}
                      onClick={() => set('view', 'list')}
                      aria-label="List view"
                      aria-pressed={view === 'list'}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {activeChips.length > 0 && (
                <div className="active-chips">
                  {activeChips.map((chip) => (
                    <span key={chip.key} className="chip chip-removable">
                      {chip.label}
                      <button type="button" onClick={() => set(chip.key, '')} aria-label={`Remove ${chip.label}`}>
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  <button type="button" className="chip chip-clear" onClick={clearFilters}>
                    {t('filters.clearAll')}
                  </button>
                </div>
              )}

              {showMap && !state.loading && state.items.length > 0 && (
                <div className="map-panel">
                  <MapPanel
                    points={state.items}
                    label={(p) => (lang === 'fa' ? p.title_fa : p.title_en)}
                  />
                </div>
              )}

              {state.loading ? (
                <PropertyGridSkeleton count={6} />
              ) : state.items.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">
                    <SearchX size={26} />
                  </span>
                  <h3 className="h-card">{t('common.noResults')}</h3>
                  <p className="muted small">
                    {pick('Try widening your budget or removing a filter.', 'بودجه را گسترده‌تر کنید یا فیلتری را بردارید.')}
                  </p>
                  <button type="button" className="btn btn-navy btn-sm" onClick={clearFilters}>
                    {t('filters.clearAll')}
                  </button>
                </div>
              ) : (
                <div className={view === 'list' ? 'stack gap-20' : 'property-grid'}>
                  {state.items.map((property) => (
                    <PropertyCard key={property.id} property={property} variant={view} />
                  ))}
                </div>
              )}

              <Pagination
                page={Number(draft.page) || 1}
                pages={state.pages}
                onChange={(page) => set('page', String(page))}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
