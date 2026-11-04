import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Star, Trash2, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { formatDate } from '../../lib/format.js'
import { useToast } from '../../lib/toast.jsx'
import usePageMeta from '../../lib/useMeta.js'

export default function AdminReviews() {
  const { t, pick } = useI18n()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'all'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  usePageMeta({ title: `${t('admin.reviews')} — EstatePro` })

  const load = () =>
    api
      .get(`/admin/reviews?status=${status}`)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))

  useEffect(() => {
    setLoading(true)
    load()
  }, [status])

  const patch = async (review, next) => {
    try {
      await api.patch(`/admin/reviews/${review.id}`, { status: next })
      setItems((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: next } : r)))
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  const remove = async (review) => {
    if (!window.confirm(pick('Delete this review?', 'این نظر حذف شود؟'))) return
    try {
      await api.delete(`/admin/reviews/${review.id}`)
      setItems((prev) => prev.filter((r) => r.id !== review.id))
      toast.success(t('admin.savedOk'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    }
  }

  return (
    <>
      <div className="row wrap gap-8" style={{ marginBlockEnd: 18 }}>
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
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
          <p className="muted">{pick('No reviews in this view.', 'در این نما نظری وجود ندارد.')}</p>
        </div>
      ) : (
        <div className="stack gap-14">
          {items.map((review) => (
            <article className="card panel" style={{ padding: 20 }} key={review.id}>
              <div className="spread" style={{ alignItems: 'flex-start' }}>
                <div className="row gap-12">
                  {review.avatar && <img src={review.avatar} alt="" className="table-thumb" style={{ width: 42, height: 42, borderRadius: '50%' }} />}
                  <div>
                    <strong style={{ display: 'block' }}>{review.name}</strong>
                    <span className="row-sub">
                      {review.property_reference || review.property_title_en || pick('Site review', 'نظر سایت')} ·{' '}
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
                <div className="row gap-8">
                  <span className="row gap-4 small" style={{ color: 'var(--gold-deep)' }}>
                    <Star size={13} fill="currentColor" /> {review.rating}
                  </span>
                  <span
                    className={`badge ${
                      review.status === 'approved' ? 'badge-success' : review.status === 'rejected' ? 'badge-danger' : 'badge'
                    }`}
                  >
                    {review.status}
                  </span>
                </div>
              </div>
              <p className="small" style={{ marginBlock: '12px', lineHeight: 1.75, color: '#4a4f56' }}>{review.body}</p>
              <div className="row gap-8" style={{ justifyContent: 'flex-end' }}>
                {review.status !== 'approved' && (
                  <button type="button" className="mini-btn" title={t('admin.approve')} onClick={() => patch(review, 'approved')}>
                    <Check size={14} />
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button type="button" className="mini-btn" title={t('admin.reject')} onClick={() => patch(review, 'rejected')}>
                    <X size={14} />
                  </button>
                )}
                <button type="button" className="mini-btn danger" onClick={() => remove(review)} aria-label={t('common.delete')}>
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
