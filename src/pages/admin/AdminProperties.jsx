import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Pencil, Plus, Sparkles, Star, Trash2, X } from 'lucide-react'
import Modal from '../../components/Modal.jsx'
import { api } from '../../lib/api.js'
import { useAppData } from '../../lib/appData.jsx'
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

const EMPTY_FORM = {
  title_en: '', title_fa: '', description_en: '', description_fa: '',
  category_id: '', listing_type: 'sale', price: '', currency: 'AED',
  city_id: '', neighborhood: '', address: '', bedrooms: '', bathrooms: '',
  area: '', parking: '', floor: '', year_built: '', furnishing: 'unfurnished',
  status: 'active', agent_id: '',
}

export default function AdminProperties() {
  const { t, lang, pick } = useI18n()
  const { categories, cities } = useAppData()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'all'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  usePageMeta({ title: `${t('admin.properties')} — EstatePro` })

  const load = () =>
    api
      .get(`/admin/properties?status=${status}`)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    setLoading(true)
    load()
  }, [status])

  useEffect(() => {
    api.get('/admin/agents').then(setAgents).catch(() => setAgents([]))
  }, [])

  const patch = async (property, body) => {
    try {
      await api.patch(`/admin/properties/${property.id}`, body)
      toast.success(t('admin.savedOk'))
      setItems((prev) => prev.map((item) => (item.id === property.id ? { ...item, ...body } : item)))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const remove = async (property) => {
    if (!window.confirm(pick('Delete this property?', 'این ملک حذف شود؟'))) return
    try {
      await api.delete(`/admin/properties/${property.id}`)
      setItems((prev) => prev.filter((item) => item.id !== property.id))
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const openEdit = (property) => {
    setEditing(property)
    setForm(
      property
        ? {
            ...EMPTY_FORM,
            ...Object.fromEntries(
              Object.keys(EMPTY_FORM).map((key) => [key, property[key] ?? EMPTY_FORM[key]]),
            ),
          }
        : { ...EMPTY_FORM },
    )
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      area: Number(form.area) || 0,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      parking: Number(form.parking) || 0,
      category_id: form.category_id ? Number(form.category_id) : null,
      city_id: form.city_id ? Number(form.city_id) : null,
      agent_id: form.agent_id ? Number(form.agent_id) : null,
      year_built: form.year_built ? Number(form.year_built) : null,
    }
    try {
      if (editing) await api.patch(`/admin/properties/${editing.id}`, payload)
      else await api.post('/admin/properties', payload)
      toast.success(t('admin.savedOk'))
      setEditing(undefined)
      setLoading(true)
      load()
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const tabs = ['all', 'active', 'pending', 'rejected', 'sold']

  return (
    <>
      <div className="spread wrap" style={{ marginBlockEnd: 18 }}>
        <div className="row wrap gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`chip ${status === tab ? 'is-active' : ''}`}
              onClick={() => setParams(tab === 'all' ? {} : { status: tab })}
            >
              {tab === 'all' ? t('common.all') : tab}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-gold btn-sm" onClick={() => openEdit(null)}>
          <Plus size={15} /> {t('admin.newProperty')}
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 260, borderRadius: 20 }} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p className="muted">{pick('No properties in this view.', 'در این نما ملکی وجود ندارد.')}</p>
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
                  <th>{pick('Agent', 'مشاور')}</th>
                  <th>{t('common.date')}</th>
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
                            {item.reference} · {pick(item.city_name_en, item.city_name_fa)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="nowrap">
                      {formatPrice(item.price, item.currency, lang)}
                      <div className="row-sub">{item.listing_type === 'rent' ? t('card.forRent') : t('card.forSale')}</div>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[item.status] || 'badge-muted'}`}>{item.status}</span>
                      <div className="row gap-4" style={{ marginBlockStart: 6 }}>
                        {item.is_featured && <span className="badge badge-gold">{t('card.featured')}</span>}
                        {item.is_verified && <span className="badge badge-success">{t('card.verified')}</span>}
                      </div>
                    </td>
                    <td className="small">{pick(item.agent_name_en, item.agent_name_fa) || '—'}</td>
                    <td className="nowrap small muted">{formatDate(item.created_at, lang)}</td>
                    <td>
                      <div className="table-actions">
                        {item.status === 'pending' && (
                          <button
                            type="button"
                            className="mini-btn"
                            title={t('admin.approve')}
                            onClick={() => patch(item, { status: 'active' })}
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            type="button"
                            className="mini-btn danger"
                            title={t('admin.reject')}
                            onClick={() => patch(item, { status: 'rejected', rejection_note: pick('Please review the listing details.', 'لطفاً جزئیات آگهی را بازبینی کنید.') })}
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="mini-btn"
                          title={t('admin.feature')}
                          onClick={() => patch(item, { is_featured: !item.is_featured })}
                        >
                          <Star size={14} fill={item.is_featured ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          title={t('admin.verify')}
                          onClick={() => patch(item, { is_verified: !item.is_verified })}
                        >
                          <Sparkles size={14} />
                        </button>
                        <button type="button" className="mini-btn" title={t('common.edit')} onClick={() => openEdit(item)}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="mini-btn danger" title={t('common.delete')} onClick={() => remove(item)}>
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

      <Modal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        title={editing ? t('admin.editProperty') : t('admin.newProperty')}
        size={760}
      >
        {form && (
          <form className="form-grid" onSubmit={save}>
            <div className="field">
              <label className="label" htmlFor="p-title">{t('sell.titleEn')}</label>
              <input
                id="p-title"
                className="input"
                required
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-title-fa">{t('sell.titleFa')}</label>
              <input
                id="p-title-fa"
                className="input"
                dir="rtl"
                value={form.title_fa}
                onChange={(e) => setForm({ ...form, title_fa: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-cat">{t('sell.category')}</label>
              <select
                id="p-cat"
                className="select"
                value={form.category_id || ''}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{lang === 'fa' ? c.name_fa : c.name_en}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="p-city">{t('sell.city')}</label>
              <select
                id="p-city"
                className="select"
                value={form.city_id || ''}
                onChange={(e) => setForm({ ...form, city_id: e.target.value })}
              >
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{lang === 'fa' ? c.name_fa : c.name_en}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="p-price">{t('sell.price')}</label>
              <input
                id="p-price"
                type="number"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-currency">{t('common.currency')}</label>
              <select
                id="p-currency"
                className="select"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {['AED', 'USD', 'PKR', 'EUR'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="p-listing">{t('sell.listingType')}</label>
              <select
                id="p-listing"
                className="select"
                value={form.listing_type}
                onChange={(e) => setForm({ ...form, listing_type: e.target.value })}
              >
                <option value="sale">{t('sell.forSale')}</option>
                <option value="rent">{t('sell.forRent')}</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="p-status">{t('common.status')}</label>
              <select
                id="p-status"
                className="select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {['active', 'pending', 'rejected', 'sold'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="p-agent">{pick('Assigned agent', 'مشاور تخصیص‌یافته')}</label>
              <select
                id="p-agent"
                className="select"
                value={form.agent_id || ''}
                onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
              >
                <option value="">—</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{lang === 'fa' ? a.name_fa : a.name_en}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="p-hood">{t('sell.neighborhood')}</label>
              <input
                id="p-hood"
                className="input"
                value={form.neighborhood || ''}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-beds">{t('sell.beds')}</label>
              <input
                id="p-beds"
                type="number"
                className="input"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-baths">{t('sell.baths')}</label>
              <input
                id="p-baths"
                type="number"
                className="input"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-area">{t('sell.area')}</label>
              <input
                id="p-area"
                type="number"
                className="input"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="p-parking">{t('sell.parking')}</label>
              <input
                id="p-parking"
                type="number"
                className="input"
                value={form.parking}
                onChange={(e) => setForm({ ...form, parking: e.target.value })}
              />
            </div>
            <div className="field span-2">
              <label className="label" htmlFor="p-addr">{t('sell.address')}</label>
              <input
                id="p-addr"
                className="input"
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="field span-2">
              <label className="label" htmlFor="p-desc">{t('sell.descEn')}</label>
              <textarea
                id="p-desc"
                className="textarea"
                rows={4}
                value={form.description_en || ''}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              />
            </div>
            <div className="span-2 row gap-12" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(undefined)}>
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
