import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { useAppData } from '../lib/appData.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { useAuth } from '../lib/auth.jsx'
import { api } from '../lib/api.js'
import { formatArea, formatPrice } from '../lib/format.js'
import { useToast } from '../lib/toast.jsx'
import { AmenityIcon } from '../components/Icons.jsx'
import usePageMeta from '../lib/useMeta.js'

const CURRENCIES = ['AED', 'USD', 'PKR', 'EUR']
const CITY_CURRENCY = { dubai: 'AED', 'abu-dhabi': 'AED', lahore: 'PKR', karachi: 'PKR', islamabad: 'PKR', tehran: 'USD' }

const EMPTY = {
  title_en: '', title_fa: '', category_id: '', listing_type: 'sale',
  description_en: '', description_fa: '',
  city_id: '', neighborhood: '', address: '',
  price: '', currency: 'AED', bedrooms: '', bathrooms: '', area: '',
  parking: '', year_built: '', floor: '', furnishing: 'unfurnished', is_new: false,
  amenities: [], images: [],
  contact_name: '', contact_phone: '', contact_email: '',
}

export default function Sell() {
  const { t, lang, pick } = useI18n()
  const { categories, cities, neighborhoods, amenities } = useAppData()
  const { user, refresh } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    contact_name: user?.name || '',
    contact_phone: user?.phone || '',
    contact_email: user?.email || '',
  }))
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  usePageMeta({
    title: `${t('sell.title')} — EstatePro`,
    description: t('sell.subtitle'),
  })

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const steps = [
    { n: 1, label: t('sell.step1') },
    { n: 2, label: t('sell.step2') },
    { n: 3, label: t('sell.step3') },
    { n: 4, label: t('sell.step4') },
    { n: 5, label: t('sell.step5') },
    { n: 6, label: t('sell.step6') },
    { n: 7, label: t('sell.step7') },
  ]

  const cityHoods = useMemo(
    () => neighborhoods.filter((n) => String(n.city_id) === String(form.city_id)),
    [neighborhoods, form.city_id],
  )

  const validate = (target = step) => {
    const next = {}
    if (target === 1) {
      if (form.title_en.trim().length < 4) next.title_en = t('common.required')
      if (!form.category_id) next.category_id = t('common.required')
      if (form.description_en.trim().length < 20) next.description_en = t('common.required')
    }
    if (target === 2 && !form.city_id) next.city_id = t('common.required')
    if (target === 3) {
      if (!(Number(form.price) > 0)) next.price = t('common.required')
      if (!(Number(form.area) > 0)) next.area = t('common.required')
    }
    if (target === 5 && form.images.length === 0) next.images = t('common.required')
    if (target === 6) {
      if (form.contact_name.trim().length < 2) next.contact_name = t('common.required')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.contact_email)) next.contact_email = t('common.required')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (!validate()) return
    setStep((s) => Math.min(7, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const { files: urls } = await api.upload(files.slice(0, 8 - form.images.length))
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, 8) }))
      setErrors((prev) => ({ ...prev, images: undefined }))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const makeCover = (index) => {
    setForm((prev) => {
      const images = [...prev.images]
      const [picked] = images.splice(index, 1)
      return { ...prev, images: [picked, ...images] }
    })
  }

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const submit = async () => {
    for (const target of [1, 2, 3, 5, 6]) {
      if (!validate(target)) {
        setStep(target)
        return
      }
    }
    setSubmitting(true)
    try {
      if (form.contact_name !== user?.name || form.contact_phone !== user?.phone) {
        await api.patch('/auth/profile', { name: form.contact_name, phone: form.contact_phone })
        await refresh()
      }
      const result = await api.post('/properties', {
        title_en: form.title_en,
        title_fa: form.title_fa || form.title_en,
        description_en: form.description_en,
        description_fa: form.description_fa || form.description_en,
        category_id: Number(form.category_id),
        listing_type: form.listing_type,
        price: Number(form.price),
        currency: form.currency,
        city_id: Number(form.city_id),
        neighborhood: form.neighborhood,
        address: form.address,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        area: Number(form.area) || 0,
        parking: Number(form.parking) || 0,
        year_built: form.year_built ? Number(form.year_built) : null,
        floor: form.floor,
        furnishing: form.furnishing,
        is_new: form.is_new,
        amenities: form.amenities,
        images: form.images,
      })
      setDone(result)
    } catch (err) {
      if (err.errors) {
        const firstKey = Object.keys(err.errors)[0]
        toast.error(err.errors[firstKey])
      } else {
        toast.error(err.message || t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <section className="section" style={{ paddingTop: 'calc(var(--header-h) + 60px)' }}>
        <div className="container">
          <div className="card panel center" style={{ maxWidth: 640, marginInline: 'auto', padding: 48 }}>
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(33,150,107,0.12)',
                color: 'var(--success)',
                marginInline: 'auto',
                marginBlockEnd: 22,
              }}
            >
              <CheckCircle2 size={34} />
            </span>
            <h1 className="h-section">{t('sell.successTitle')}</h1>
            <p className="lead" style={{ marginInline: 'auto', marginBlock: '14px 8px' }}>
              {t('sell.successBody')}
            </p>
            <p className="small muted">
              {t('detail.reference')}: <strong>{done.reference}</strong>
            </p>
            <div className="row gap-12" style={{ justifyContent: 'center', marginBlockStart: 26 }}>
              <Link to="/dashboard/listings" className="btn btn-gold">
                {t('sell.viewListing')}
              </Link>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/properties')}>
                {t('hero.explore')}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{t('sell.title')}</h1>
          <p>{t('sell.subtitle')}</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="wizard-shell">
            <nav className="wizard-steps" aria-label={t('sell.title')}>
              {steps.map((item) => (
                <button
                  key={item.n}
                  type="button"
                  className={`wizard-step ${step === item.n ? 'is-active' : ''} ${step > item.n ? 'is-done' : ''}`}
                  onClick={() => item.n < step && setStep(item.n)}
                >
                  <span className="ws-num">{step > item.n ? <Check size={13} /> : item.n}</span>
                  <span className="ws-label">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="wizard-body">
              {step === 1 && (
                <>
                  <h2>{t('sell.step1')}</h2>
                  <p className="wiz-hint">{pick('Start with the essentials.', 'با اطلاعات اصلی شروع کنید.')}</p>
                  <div className="form-grid">
                    <div className="field span-2">
                      <label className="label" htmlFor="title_en">{t('sell.titleEn')}</label>
                      <input
                        id="title_en"
                        className="input"
                        value={form.title_en}
                        onChange={(e) => set('title_en', e.target.value)}
                        placeholder={pick('e.g. Modern villa with private pool', 'مثلاً ویلای مدرن با استخر خصوصی')}
                        aria-invalid={Boolean(errors.title_en)}
                      />
                      {errors.title_en && <span className="field-error">{errors.title_en}</span>}
                    </div>
                    <div className="field span-2">
                      <label className="label" htmlFor="title_fa">{t('sell.titleFa')} ({t('common.optional')})</label>
                      <input
                        id="title_fa"
                        className="input"
                        dir="rtl"
                        value={form.title_fa}
                        onChange={(e) => set('title_fa', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="category">{t('sell.category')}</label>
                      <select
                        id="category"
                        className="select"
                        value={form.category_id}
                        onChange={(e) => set('category_id', e.target.value)}
                        aria-invalid={Boolean(errors.category_id)}
                      >
                        <option value="">{pick('Select…', 'انتخاب کنید…')}</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{lang === 'fa' ? c.name_fa : c.name_en}</option>
                        ))}
                      </select>
                      {errors.category_id && <span className="field-error">{errors.category_id}</span>}
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="listing">{t('sell.listingType')}</label>
                      <select
                        id="listing"
                        className="select"
                        value={form.listing_type}
                        onChange={(e) => set('listing_type', e.target.value)}
                      >
                        <option value="sale">{t('sell.forSale')}</option>
                        <option value="rent">{t('sell.forRent')}</option>
                      </select>
                    </div>
                    <div className="field span-2">
                      <label className="label" htmlFor="desc_en">{t('sell.descEn')}</label>
                      <textarea
                        id="desc_en"
                        className="textarea"
                        value={form.description_en}
                        onChange={(e) => set('description_en', e.target.value)}
                        placeholder={pick('Describe the layout, finishes and what makes it special…', 'نقشه، متریال و ویژگی‌های خاص ملک را توضیح دهید…')}
                        aria-invalid={Boolean(errors.description_en)}
                      />
                      {errors.description_en && <span className="field-error">{errors.description_en}</span>}
                    </div>
                    <div className="field span-2">
                      <label className="label" htmlFor="desc_fa">{t('sell.descFa')} ({t('common.optional')})</label>
                      <textarea
                        id="desc_fa"
                        className="textarea"
                        dir="rtl"
                        rows={4}
                        value={form.description_fa}
                        onChange={(e) => set('description_fa', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2>{t('sell.step2')}</h2>
                  <p className="wiz-hint">{pick('Where is the property?', 'ملک کجاست؟')}</p>
                  <div className="form-grid">
                    <div className="field">
                      <label className="label" htmlFor="city">{t('sell.city')}</label>
                      <select
                        id="city"
                        className="select"
                        value={form.city_id}
                        onChange={(e) => {
                          const city = cities.find((c) => String(c.id) === e.target.value)
                          setForm((prev) => ({
                            ...prev,
                            city_id: e.target.value,
                            neighborhood: '',
                            currency: city ? CITY_CURRENCY[city.slug] || prev.currency : prev.currency,
                          }))
                          setErrors((prev) => ({ ...prev, city_id: undefined }))
                        }}
                        aria-invalid={Boolean(errors.city_id)}
                      >
                        <option value="">{pick('Select…', 'انتخاب کنید…')}</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>{lang === 'fa' ? c.name_fa : c.name_en}</option>
                        ))}
                      </select>
                      {errors.city_id && <span className="field-error">{errors.city_id}</span>}
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="country">{t('sell.country')}</label>
                      <input
                        id="country"
                        className="input"
                        value={
                          lang === 'fa'
                            ? cities.find((c) => String(c.id) === String(form.city_id))?.country_fa || ''
                            : cities.find((c) => String(c.id) === String(form.city_id))?.country_en || ''
                        }
                        readOnly
                        placeholder="—"
                      />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="hood">{t('sell.neighborhood')}</label>
                      <select
                        id="hood"
                        className="select"
                        value={form.neighborhood}
                        onChange={(e) => set('neighborhood', e.target.value)}
                      >
                        <option value="">{pick('Select…', 'انتخاب کنید…')}</option>
                        {cityHoods.map((n) => (
                          <option key={n.id} value={n.name_en}>{lang === 'fa' ? n.name_fa : n.name_en}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="address">{t('sell.address')}</label>
                      <input
                        id="address"
                        className="input"
                        value={form.address}
                        onChange={(e) => set('address', e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="field-hint" style={{ marginBlockStart: 16 }}>
                    {pick(
                      'The map pin is generated from the city for now — exact coordinates can be refined by our team during review.',
                      'نشانه نقشه فعلاً از روی شهر ساخته می‌شود — مختصات دقیق در مرحله بررسی توسط تیم ما اصلاح می‌شود.',
                    )}
                  </p>
                </>
              )}

              {step === 3 && (
                <>
                  <h2>{t('sell.step3')}</h2>
                  <p className="wiz-hint">{pick('Pricing and physical details.', 'قیمت و مشخصات فیزیکی.')}</p>
                  <div className="form-grid">
                    <div className="field">
                      <label className="label" htmlFor="price">{t('sell.price')}</label>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        className="input"
                        value={form.price}
                        onChange={(e) => set('price', e.target.value)}
                        aria-invalid={Boolean(errors.price)}
                      />
                      {errors.price && <span className="field-error">{errors.price}</span>}
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="currency">{t('common.currency')}</label>
                      <select
                        id="currency"
                        className="select"
                        value={form.currency}
                        onChange={(e) => set('currency', e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="beds">{t('sell.beds')}</label>
                      <input id="beds" type="number" min="0" className="input" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="baths">{t('sell.baths')}</label>
                      <input id="baths" type="number" min="0" className="input" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="area">{t('sell.area')}</label>
                      <input
                        id="area"
                        type="number"
                        min="0"
                        className="input"
                        value={form.area}
                        onChange={(e) => set('area', e.target.value)}
                        aria-invalid={Boolean(errors.area)}
                      />
                      {errors.area && <span className="field-error">{errors.area}</span>}
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="parking">{t('sell.parking')}</label>
                      <input id="parking" type="number" min="0" className="input" value={form.parking} onChange={(e) => set('parking', e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="year">{t('sell.year')}</label>
                      <input id="year" type="number" className="input" value={form.year_built} onChange={(e) => set('year_built', e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="floor">{t('sell.floor')}</label>
                      <input id="floor" className="input" value={form.floor} onChange={(e) => set('floor', e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="furnishing">{t('sell.furnishing')}</label>
                      <select id="furnishing" className="select" value={form.furnishing} onChange={(e) => set('furnishing', e.target.value)}>
                        <option value="furnished">{t('filters.furnished')}</option>
                        <option value="semi">{t('filters.semi')}</option>
                        <option value="unfurnished">{t('filters.unfurnished')}</option>
                      </select>
                    </div>
                    <div className="field" style={{ justifyContent: 'flex-end' }}>
                      <label className="check">
                        <input type="checkbox" checked={form.is_new} onChange={(e) => set('is_new', e.target.checked)} />
                        {t('sell.isNew')}
                      </label>
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h2>{t('sell.step4')}</h2>
                  <p className="wiz-hint">{t('sell.amenitiesHint')}</p>
                  <div className="amenity-grid">
                    {amenities.map((amenity) => {
                      const active = form.amenities.includes(amenity.id)
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          className="amenity"
                          aria-pressed={active}
                          onClick={() =>
                            set(
                              'amenities',
                              active
                                ? form.amenities.filter((id) => id !== amenity.id)
                                : [...form.amenities, amenity.id],
                            )
                          }
                          style={
                            active
                              ? { borderColor: 'var(--gold)', background: 'rgba(221,187,114,0.12)' }
                              : undefined
                          }
                        >
                          <AmenityIcon name={amenity.icon} size={18} />
                          <span className="grow" style={{ textAlign: 'start' }}>
                            {lang === 'fa' ? amenity.name_fa : amenity.name_en}
                          </span>
                          {active && <Check size={15} style={{ color: 'var(--gold-deep)' }} />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <h2>{t('sell.step5')}</h2>
                  <p className="wiz-hint">{t('sell.imagesHint')}</p>
                  <div className="upload-grid">
                    {form.images.map((url, index) => (
                      <div className="upload-tile" key={url}>
                        <img src={url} alt="" />
                        <button type="button" className="upload-remove" onClick={() => removeImage(index)} aria-label="Remove image">
                          <X size={13} />
                        </button>
                        {index === 0 ? (
                          <span className="upload-cover">{t('sell.cover')}</span>
                        ) : (
                          <button
                            type="button"
                            className="upload-cover"
                            style={{ background: 'rgba(255,255,255,0.9)', cursor: 'pointer' }}
                            onClick={() => makeCover(index)}
                          >
                            <Star size={11} /> {t('sell.cover')}
                          </button>
                        )}
                      </div>
                    ))}
                    {form.images.length < 8 && (
                      <label className="upload-dropzone">
                        {uploading ? <Loader2 size={20} className="spin" /> : <ImagePlus size={20} />}
                        <span>{uploading ? t('common.loading') : t('sell.addPhotos')}</span>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={onFiles}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                  {errors.images && <p className="field-error" style={{ marginBlockStart: 10 }}>{errors.images}</p>}
                </>
              )}

              {step === 6 && (
                <>
                  <h2>{t('sell.step6')}</h2>
                  <p className="wiz-hint">{t('sell.contactHint')}</p>
                  <div className="form-grid">
                    <div className="field">
                      <label className="label" htmlFor="c-name">{t('common.name')}</label>
                      <input
                        id="c-name"
                        className="input"
                        value={form.contact_name}
                        onChange={(e) => set('contact_name', e.target.value)}
                        aria-invalid={Boolean(errors.contact_name)}
                      />
                      {errors.contact_name && <span className="field-error">{errors.contact_name}</span>}
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="c-phone">{t('common.phone')}</label>
                      <input
                        id="c-phone"
                        className="input"
                        value={form.contact_phone}
                        onChange={(e) => set('contact_phone', e.target.value)}
                      />
                    </div>
                    <div className="field span-2">
                      <label className="label" htmlFor="c-email">{t('common.email')}</label>
                      <input
                        id="c-email"
                        type="email"
                        className="input"
                        value={form.contact_email}
                        onChange={(e) => set('contact_email', e.target.value)}
                        aria-invalid={Boolean(errors.contact_email)}
                      />
                      {errors.contact_email && <span className="field-error">{errors.contact_email}</span>}
                    </div>
                  </div>
                </>
              )}

              {step === 7 && (
                <>
                  <h2>{t('sell.step7')}</h2>
                  <p className="wiz-hint">{t('sell.reviewHint')}</p>

                  <div className="card" style={{ padding: 0, overflow: 'hidden', marginBlockEnd: 22 }}>
                    {form.images[0] && (
                      <img src={form.images[0]} alt="" style={{ width: '100%', aspectRatio: '16/8', objectFit: 'cover' }} />
                    )}
                    <div style={{ padding: 22 }}>
                      <div className="row wrap gap-8" style={{ marginBlockEnd: 10 }}>
                        <span className={`badge ${form.listing_type === 'rent' ? 'badge-navy' : 'badge-gold'}`}>
                          {form.listing_type === 'rent' ? t('card.forRent') : t('card.forSale')}
                        </span>
                        <span className="badge badge-muted">{t('dash.pendingReview')}</span>
                      </div>
                      <h3 className="h-card">{form.title_en}</h3>
                      <p className="small muted" style={{ marginBlockStart: 6 }}>
                        {[form.neighborhood, cities.find((c) => String(c.id) === String(form.city_id))?.name_en]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <div className="property-specs" style={{ marginBlock: 14 }}>
                        <span>{form.bedrooms || 0} {t('card.beds')}</span>
                        <span>{form.bathrooms || 0} {t('card.baths')}</span>
                        <span>{formatArea(form.area || 0, lang)}</span>
                      </div>
                      <strong style={{ fontSize: '1.15rem' }}>
                        {formatPrice(Number(form.price), form.currency, lang)}
                        {form.listing_type === 'rent' && <span className="small muted"> {t('card.perMonth')}</span>}
                      </strong>
                    </div>
                  </div>

                  <dl className="stack gap-8 small">
                    <div className="spread">
                      <dt className="muted">{t('sell.amenities')}</dt>
                      <dd style={{ margin: 0 }}>{form.amenities.length}</dd>
                    </div>
                    <div className="spread">
                      <dt className="muted">{t('sell.step5')}</dt>
                      <dd style={{ margin: 0 }}>{form.images.length}</dd>
                    </div>
                    <div className="spread">
                      <dt className="muted">{t('common.name')}</dt>
                      <dd style={{ margin: 0 }}>
                        {form.contact_name} · {form.contact_phone || '—'}
                      </dd>
                    </div>
                  </dl>

                  <div className="sticky-note" style={{ marginBlockStart: 20 }}>
                    {pick(
                      'Submitting places your listing in the review queue. You can edit it any time from your dashboard until it is approved.',
                      'با ارسال، آگهی شما به صف بررسی می‌رود. تا زمان تأیید می‌توانید از داشبورد آن را ویرایش کنید.',
                    )}
                  </div>
                </>
              )}

              <div className="wizard-nav">
                <button type="button" className="btn btn-outline" onClick={goBack} disabled={step === 1}>
                  <ArrowLeft size={16} className="flip-rtl" /> {t('common.back')}
                </button>
                <span className="small muted">
                  {step} / 7
                </span>
                {step < 7 ? (
                  <button type="button" className="btn btn-navy" onClick={goNext}>
                    {t('common.next')} <ArrowRight size={16} className="flip-rtl" />
                  </button>
                ) : (
                  <button type="button" className="btn btn-gold" onClick={submit} disabled={submitting}>
                    {submitting ? t('common.saving') : t('sell.submitForReview')}
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
