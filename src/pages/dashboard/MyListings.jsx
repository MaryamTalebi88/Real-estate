import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Home, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
import Modal from '../../components/Modal.jsx'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { formatDate, formatPrice } from '../../lib/format.js'
import { useToast } from '../../lib/toast.jsx'
import usePageMeta from '../../lib/useMeta.js'

const STATUS_CLASS = {
  active: 'badge-success',
  pending: 'badge',
  rejected: 'badge-danger',
  sold: 'badge-muted',
}

export default function MyListings() {
  const { t, lang, pick } = useI18n()
  const toast = useToast()
  const fileRef = useRef(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  usePageMeta({ title: `${t('dash.listings')} — EstatePro` })

  const load = () =>
    api
      .get('/me/properties')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const openEdit = (property) => {
    setEditing(property)
    setForm({
      title_en: property.title_en,
      title_fa: property.title_fa || '',
      price: property.price,
      currency: property.currency,
      description_en: property.description_en || '',
      images: property.images || [],
    })
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/properties/${editing.id}`, {
        title_en: form.title_en,
        title_fa: form.title_fa || form.title_en,
        price: Number(form.price),
        currency: form.currency,
        description_en: form.description_en,
        images: form.images,
      })
      toast.success(t('admin.savedOk'))
      setEditing(null)
      load()
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (property) => {
    if (!window.confirm(pick('Delete this listing permanently?', 'این آگهی برای همیشه حذف شود؟'))) return
    try {
      await api.delete(`/properties/${property.id}`)
      setItems((prev) => prev.filter((p) => p.id !== property.id))
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const onFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const { files: urls } = await api.upload(files)
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, 8) }))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>{t('dash.listings')}</h1>
          <p>{pick('Track the review status of every property you submitted.', 'وضعیت بررسی هر ملکی که ثبت کرده‌اید را پیگیری کنید.')}</p>
        </div>
        <Link to="/sell" className="btn btn-gold btn-sm">
          <Plus size={15} /> {t('dash.addListing')}
        </Link>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Home size={24} />
          </span>
          <h3 className="h-card">{t('dash.noListings')}</h3>
          <Link to="/sell" className="btn btn-navy btn-sm">
            {t('dash.addListing')}
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>{pick('Property', 'ملک')}</th>
                  <th>{t('sell.price')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('detail.listed')}</th>
                  <th style={{ textAlign: 'end' }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="row gap-12">
                        {item.cover && <img src={item.cover} alt="" className="table-thumb" />}
                        <div>
                          <div className="row-title">{pick(item.title_en, item.title_fa)}</div>
                          <div className="row-sub">
                            {item.reference} · {item.neighborhood || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="nowrap">{formatPrice(item.price, item.currency, lang)}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[item.status] || 'badge-muted'}`}>
                        {item.status === 'pending'
                          ? t('dash.pendingReview')
                          : item.status === 'rejected'
                            ? t('dash.rejected')
                            : item.status}
                      </span>
                      {item.status === 'rejected' && item.rejection_note && (
                        <div className="row-sub" style={{ marginBlockStart: 4 }}>{item.rejection_note}</div>
                      )}
                    </td>
                    <td className="nowrap small muted">{formatDate(item.created_at, lang)}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/properties/${item.slug}`} className="mini-btn" aria-label={t('common.viewDetails')}>
                          <ExternalLink size={14} />
                        </Link>
                        <button type="button" className="mini-btn" onClick={() => openEdit(item)} aria-label={t('common.edit')}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="mini-btn danger" onClick={() => remove(item)} aria-label={t('common.delete')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={t('common.edit')} size={620}>
        {form && (
          <form className="stack gap-16" onSubmit={save}>
            <div className="field">
              <label className="label" htmlFor="e-title">{t('sell.titleEn')}</label>
              <input
                id="e-title"
                className="input"
                required
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="e-title-fa">{t('sell.titleFa')}</label>
              <input
                id="e-title-fa"
                className="input"
                dir="rtl"
                value={form.title_fa}
                onChange={(e) => setForm({ ...form, title_fa: e.target.value })}
              />
            </div>
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="e-price">{t('sell.price')}</label>
                <input
                  id="e-price"
                  type="number"
                  min="0"
                  className="input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="e-currency">{t('common.currency')}</label>
                <select
                  id="e-currency"
                  className="select"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {['AED', 'USD', 'PKR', 'EUR'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="e-desc">{t('sell.descEn')}</label>
              <textarea
                id="e-desc"
                className="textarea"
                rows={5}
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label">{t('sell.step5')}</label>
              <div className="upload-grid">
                {form.images.map((url) => (
                  <div className="upload-tile" key={url}>
                    <img src={url} alt="" />
                    <button
                      type="button"
                      className="upload-remove"
                      onClick={() => setForm({ ...form, images: form.images.filter((u) => u !== url) })}
                      aria-label={t('common.remove')}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {form.images.length < 8 && (
                  <label className="upload-dropzone">
                    <ImagePlus size={18} />
                    <span>{uploading ? t('common.loading') : t('sell.addPhotos')}</span>
                    <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
                  </label>
                )}
              </div>
            </div>
            <div className="row gap-10" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn btn-gold" disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
