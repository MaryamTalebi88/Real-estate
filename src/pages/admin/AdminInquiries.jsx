import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Phone, Trash2 } from 'lucide-react'
import Modal from '../../components/Modal.jsx'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { formatDate } from '../../lib/format.js'
import { useToast } from '../../lib/toast.jsx'
import usePageMeta from '../../lib/useMeta.js'

const STATUSES = ['new', 'contacted', 'closed']

export default function AdminInquiries() {
  const { t, pick } = useI18n()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'all'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [note, setNote] = useState('')

  usePageMeta({ title: `${t('admin.inquiries')} — EstatePro` })

  const load = () =>
    api
      .get(`/admin/inquiries?status=${status}`)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    setLoading(true)
    load()
  }, [status])

  const patch = async (item, body) => {
    try {
      await api.patch(`/admin/inquiries/${item.id}`, body)
      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, ...body } : row)))
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const remove = async (item) => {
    if (!window.confirm(pick('Delete this inquiry?', 'این درخواست حذف شود؟'))) return
    try {
      await api.delete(`/admin/inquiries/${item.id}`)
      setItems((prev) => prev.filter((row) => row.id !== item.id))
      setActive(null)
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  return (
    <>
      <div className="row wrap gap-8" style={{ marginBlockEnd: 18 }}>
        {['all', ...STATUSES].map((tab) => (
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

      {loading ? (
        <div className="skeleton" style={{ height: 220, borderRadius: 20 }} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p className="muted">{pick('No inquiries in this view.', 'در این نما درخواستی وجود ندارد.')}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('common.subject')}</th>
                  <th>{pick('Property', 'ملک')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.date')}</th>
                  <th style={{ textAlign: 'end' }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="row-title">{item.name}</div>
                      <div className="row-sub">{item.email}</div>
                    </td>
                    <td className="small">{item.subject || (item.kind === 'contact' ? pick('Contact form', 'فرم تماس') : '—')}</td>
                    <td className="small">{item.property_reference || '—'}</td>
                    <td>
                      <select
                        className="select"
                        style={{ minWidth: 120, padding: '7px 12px' }}
                        value={item.status}
                        onChange={(e) => patch(item, { status: e.target.value })}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="small muted nowrap">{formatDate(item.created_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() => {
                            setActive(item)
                            setNote(item.internal_note || '')
                          }}
                        >
                          {t('common.edit')}
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

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title={active?.subject || t('admin.inquiries')}>
        {active && (
          <>
            <div className="stack gap-10">
              <div className="row gap-10 small">
                <strong className="grow">{active.name}</strong>
                <span className={`badge ${active.status === 'new' ? 'badge' : 'badge-muted'}`}>{active.status}</span>
              </div>
              <div className="row gap-16 small wrap">
                <a href={`mailto:${active.email}`} className="row gap-6">
                  <Mail size={14} /> {active.email}
                </a>
                {active.phone && (
                  <a href={`tel:${active.phone}`} className="row gap-6">
                    <Phone size={14} /> {active.phone}
                  </a>
                )}
              </div>
              {active.property_reference && (
                <p className="small muted">
                  {pick('Property', 'ملک')}: {active.property_title_en} ({active.property_reference})
                </p>
              )}
              <p className="small" style={{ lineHeight: 1.8, color: '#4a4f56' }}>{active.message}</p>
              <div className="field">
                <label className="label" htmlFor="admin-note">{pick('Internal note', 'یادداشت داخلی')}</label>
                <textarea
                  id="admin-note"
                  className="textarea"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="row gap-10" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActive(null)}>
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={async () => {
                    await patch(active, { internal_note: note })
                    setActive(null)
                  }}
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
