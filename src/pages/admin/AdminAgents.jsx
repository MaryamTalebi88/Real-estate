import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal.jsx'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { useToast } from '../../lib/toast.jsx'
import usePageMeta from '../../lib/useMeta.js'

const EMPTY = {
  name_en: '', name_fa: '', title_en: '', title_fa: '', bio_en: '', bio_fa: '',
  phone: '', email: '', avatar: '', languages: '', spec_en: '', spec_fa: '', experience: 5,
}

export default function AdminAgents() {
  const { t, lang, pick } = useI18n()
  const toast = useToast()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  usePageMeta({ title: `${t('admin.agents')} — EstatePro` })

  const load = () =>
    api
      .get('/admin/agents')
      .then(setAgents)
      .catch(() => setAgents([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const openForm = (agent) => {
    setEditing(agent)
    setForm(
      agent
        ? {
            ...EMPTY,
            ...agent,
            languages: Array.isArray(agent.languages) ? agent.languages.join(', ') : '',
          }
        : { ...EMPTY },
    )
    setOpen(true)
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      languages: form.languages
        ? form.languages.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      experience: Number(form.experience) || 0,
    }
    try {
      if (editing?.id) await api.patch(`/admin/agents/${editing.id}`, payload)
      else await api.post('/admin/agents', payload)
      toast.success(t('admin.savedOk'))
      setOpen(false)
      setLoading(true)
      load()
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (agent) => {
    if (!window.confirm(pick('Remove this agent?', 'این مشاور حذف شود؟'))) return
    try {
      await api.delete(`/admin/agents/${agent.id}`)
      setAgents((prev) => prev.filter((a) => a.id !== agent.id))
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  return (
    <>
      <div className="spread" style={{ marginBlockEnd: 18 }}>
        <span className="small muted">{pick('Advisors shown on the public agent directory.', 'مشاورانی که در فهرست عمومی نمایش داده می‌شوند.')}</span>
        <button type="button" className="btn btn-gold btn-sm" onClick={() => openForm(null)}>
          <Plus size={15} /> {pick('Add agent', 'افزودن مشاور')}
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('common.email')}</th>
                  <th>{t('common.phone')}</th>
                  <th>{pick('Listings', 'آگهی')}</th>
                  <th style={{ textAlign: 'end' }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td>
                      <div className="row gap-12">
                        {agent.avatar && <img src={agent.avatar} alt="" className="table-thumb" style={{ width: 38, height: 38, borderRadius: '50%' }} />}
                        <div>
                          <div className="row-title">{lang === 'fa' ? agent.name_fa : agent.name_en}</div>
                          <div className="row-sub">{pick(agent.title_en, agent.title_fa)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="small">{agent.email}</td>
                    <td className="small nowrap">{agent.phone}</td>
                    <td>{agent.listings}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="mini-btn" onClick={() => openForm(agent)}>
                          {t('common.edit')}
                        </button>
                        <button type="button" className="mini-btn danger" onClick={() => remove(agent)} aria-label={t('common.delete')}>
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

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t('common.edit') : pick('Add agent', 'افزودن مشاور')} size={700}>
        <form className="form-grid" onSubmit={save}>
          <div className="field">
            <label className="label" htmlFor="a-name">{t('common.name')} (EN)</label>
            <input id="a-name" className="input" required value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="a-name-fa">{t('common.name')} (FA)</label>
            <input id="a-name-fa" className="input" dir="rtl" value={form.name_fa} onChange={(e) => setForm({ ...form, name_fa: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="a-title">{pick('Title', 'عنوان')} (EN)</label>
            <input id="a-title" className="input" value={form.title_en || ''} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="a-title-fa">{pick('Title', 'عنوان')} (FA)</label>
            <input id="a-title-fa" className="input" dir="rtl" value={form.title_fa || ''} onChange={(e) => setForm({ ...form, title_fa: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="a-email">{t('common.email')}</label>
            <input id="a-email" type="email" className="input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="a-phone">{t('common.phone')}</label>
            <input id="a-phone" className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="a-avatar">{pick('Photo URL', 'نشانی تصویر')}</label>
            <input id="a-avatar" className="input" value={form.avatar || ''} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="a-lang">{pick('Languages (comma separated)', 'زبان‌ها (با کاما)')}</label>
            <input id="a-lang" className="input" value={form.languages || ''} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
          </div>
          <div className="field">
            <label className="label" htmlFor="a-exp">{pick('Years of experience', 'سال تجربه')}</label>
            <input id="a-exp" type="number" className="input" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          </div>
          <div className="field span-2">
            <label className="label" htmlFor="a-bio">{pick('Biography', 'زندگی‌نامه')}</label>
            <textarea id="a-bio" className="textarea" rows={4} value={form.bio_en || ''} onChange={(e) => setForm({ ...form, bio_en: e.target.value })} />
          </div>
          <div className="span-2 row gap-12" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
