import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { useAppData } from '../../lib/appData.jsx'
import { useToast } from '../../lib/toast.jsx'
import usePageMeta from '../../lib/useMeta.js'

export function AdminCategories() {
  const { t, pick, lang } = useI18n()
  const { reload } = useAppData()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [draft, setDraft] = useState({ name_en: '', name_fa: '', desc_en: '', desc_fa: '', icon: 'home', image: '' })
  const [busy, setBusy] = useState(false)

  usePageMeta({ title: `${t('admin.categories')} — EstatePro` })

  const load = () =>
    api.get('/admin/categories').then(setItems).catch(() => setItems([]))

  useEffect(() => {
    load()
  }, [])

  const create = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await api.post('/admin/categories', draft)
      setDraft({ name_en: '', name_fa: '', desc_en: '', desc_fa: '', icon: 'home', image: '' })
      load()
      reload()
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  const patch = async (item, body) => {
    try {
      await api.patch(`/admin/categories/${item.id}`, body)
      setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, ...body } : c)))
      reload()
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const remove = async (item) => {
    if (!window.confirm(pick('Delete this category?', 'این دسته‌بندی حذف شود؟'))) return
    try {
      await api.delete(`/admin/categories/${item.id}`)
      setItems((prev) => prev.filter((c) => c.id !== item.id))
      reload()
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  return (
    <>
      <div className="table-wrap" style={{ marginBlockEnd: 22 }}>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>{pick('Name (EN)', 'نام (انگلیسی)')}</th>
                <th>{pick('Name (FA)', 'نام (فارسی)')}</th>
                <th>{pick('Icon', 'آیکون')}</th>
                <th>{pick('Listings', 'آگهی')}</th>
                <th style={{ textAlign: 'end' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      className="input"
                      style={{ padding: '8px 12px' }}
                      value={item.name_en}
                      onChange={(e) => setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, name_en: e.target.value } : c)))}
                      onBlur={(e) => patch(item, { name_en: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      dir="rtl"
                      style={{ padding: '8px 12px' }}
                      value={item.name_fa}
                      onChange={(e) => setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, name_fa: e.target.value } : c)))}
                      onBlur={(e) => patch(item, { name_fa: e.target.value })}
                    />
                  </td>
                  <td className="small muted">{item.icon}</td>
                  <td>{item.count}</td>
                  <td>
                    <div className="table-actions">
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

      <form className="card panel" onSubmit={create}>
        <h3 className="h-card" style={{ marginBlockEnd: 16 }}>{pick('Add a category', 'افزودن دسته‌بندی')}</h3>
        <div className="form-grid">
          <div className="field">
            <label className="label" htmlFor="c-en">{pick('Name (EN)', 'نام (انگلیسی)')}</label>
            <input id="c-en" className="input" required value={draft.name_en} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="c-fa">{pick('Name (FA)', 'نام (فارسی)')}</label>
            <input id="c-fa" className="input" dir="rtl" value={draft.name_fa} onChange={(e) => setDraft({ ...draft, name_fa: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="c-icon">{pick('Icon key', 'کلید آیکون')}</label>
            <select id="c-icon" className="select" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })}>
              {['home', 'building', 'crown', 'briefcase', 'land'].map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="c-image">{pick('Cover image URL', 'نشانی تصویر کاور')}</label>
            <input id="c-image" className="input" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn btn-gold btn-sm" style={{ marginBlockStart: 16 }} disabled={busy}>
          <Plus size={15} /> {t('common.create')}
        </button>
      </form>
    </>
  )
}

export function AdminLocations() {
  const { t, pick, lang } = useI18n()
  const { reload } = useAppData()
  const toast = useToast()
  const [cities, setCities] = useState([])
  const [neighborhoods, setNeighborhoods] = useState([])
  const [draft, setDraft] = useState({ name_en: '', name_fa: '', country_en: '', country_fa: '' })
  const [hood, setHood] = useState({ city_id: '', name_en: '', name_fa: '' })

  usePageMeta({ title: `${t('admin.locations')} — EstatePro` })

  const load = () =>
    api
      .get('/admin/cities')
      .then((data) => {
        setCities(data.cities)
        setNeighborhoods(data.neighborhoods)
      })
      .catch(() => setCities([]))

  useEffect(() => {
    load()
  }, [])

  const createCity = async (event) => {
    event.preventDefault()
    try {
      await api.post('/admin/cities', draft)
      setDraft({ name_en: '', name_fa: '', country_en: '', country_fa: '' })
      load()
      reload()
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const addHood = async (event) => {
    event.preventDefault()
    try {
      await api.post('/admin/neighborhoods', hood)
      setHood({ city_id: '', name_en: '', name_fa: '' })
      load()
      reload()
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const removeCity = async (city) => {
    if (!window.confirm(pick('Delete this city?', 'این شهر حذف شود؟'))) return
    try {
      await api.delete(`/admin/cities/${city.id}`)
      load()
      reload()
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const removeHood = async (item) => {
    try {
      await api.delete(`/admin/neighborhoods/${item.id}`)
      load()
      reload()
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  return (
    <>
      <div className="table-wrap" style={{ marginBlockEnd: 22 }}>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>{pick('City', 'شهر')}</th>
                <th>{pick('Country', 'کشور')}</th>
                <th>{pick('Listings', 'آگهی')}</th>
                <th>{pick('Neighborhoods', 'محله‌ها')}</th>
                <th style={{ textAlign: 'end' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => {
                const hoods = neighborhoods.filter((n) => n.city_id === city.id)
                return (
                  <tr key={city.id}>
                    <td>
                      <div className="row-title">{lang === 'fa' ? city.name_fa : city.name_en}</div>
                      <div className="row-sub">{city.slug}</div>
                    </td>
                    <td className="small">{lang === 'fa' ? city.country_fa : city.country_en}</td>
                    <td>{city.count}</td>
                    <td>
                      <div className="row wrap gap-6">
                        {hoods.map((n) => (
                          <span key={n.id} className="chip" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                            {lang === 'fa' ? n.name_fa : n.name_en}
                            <button type="button" onClick={() => removeHood(n)} aria-label={t('common.remove')}>
                              <Trash2 size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="mini-btn danger" onClick={() => removeCity(city)} aria-label={t('common.delete')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-grid" style={{ alignItems: 'start' }}>
        <form className="card panel" onSubmit={createCity}>
          <h3 className="h-card" style={{ marginBlockEnd: 16 }}>{pick('Add a city', 'افزودن شهر')}</h3>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field">
              <label className="label" htmlFor="city-en">{pick('Name (EN)', 'نام (انگلیسی)')}</label>
              <input id="city-en" className="input" required value={draft.name_en} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} />
            </div>
            <div className="field">
              <label className="label" htmlFor="city-fa">{pick('Name (FA)', 'نام (فارسی)')}</label>
              <input id="city-fa" className="input" dir="rtl" value={draft.name_fa} onChange={(e) => setDraft({ ...draft, name_fa: e.target.value })} />
            </div>
            <div className="field">
              <label className="label" htmlFor="country-en">{pick('Country (EN)', 'کشور (انگلیسی)')}</label>
              <input id="country-en" className="input" value={draft.country_en} onChange={(e) => setDraft({ ...draft, country_en: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-gold btn-sm" style={{ marginBlockStart: 16 }}>
            <Plus size={15} /> {t('common.create')}
          </button>
        </form>

        <form className="card panel" onSubmit={addHood}>
          <h3 className="h-card" style={{ marginBlockEnd: 16 }}>{pick('Add a neighborhood', 'افزودن محله')}</h3>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field">
              <label className="label" htmlFor="hood-city">{pick('City', 'شهر')}</label>
              <select id="hood-city" className="select" required value={hood.city_id} onChange={(e) => setHood({ ...hood, city_id: e.target.value })}>
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{lang === 'fa' ? c.name_fa : c.name_en}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="hood-en">{pick('Name (EN)', 'نام (انگلیسی)')}</label>
              <input id="hood-en" className="input" required value={hood.name_en} onChange={(e) => setHood({ ...hood, name_en: e.target.value })} />
            </div>
            <div className="field">
              <label className="label" htmlFor="hood-fa">{pick('Name (FA)', 'نام (فارسی)')}</label>
              <input id="hood-fa" className="input" dir="rtl" value={hood.name_fa} onChange={(e) => setHood({ ...hood, name_fa: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-gold btn-sm" style={{ marginBlockStart: 16 }}>
            <Plus size={15} /> {t('common.create')}
          </button>
        </form>
      </div>
    </>
  )
}
