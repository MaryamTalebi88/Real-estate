import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { formatDate } from '../../lib/format.js'
import usePageMeta from '../../lib/useMeta.js'

export default function MyInquiries() {
  const { t, lang, pick } = useI18n()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  usePageMeta({ title: `${t('dash.inquiries')} — EstatePro` })

  useEffect(() => {
    api
      .get('/me/inquiries')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>{t('dash.inquiries')}</h1>
          <p>{pick('Every enquiry you have sent, with the advisor’s current status.', 'همه درخواست‌هایی که فرستاده‌اید، با وضعیت فعلی از سوی مشاور.')}</p>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Inbox size={24} />
          </span>
          <h3 className="h-card">{t('dash.noInquiries')}</h3>
          <Link to="/properties" className="btn btn-navy btn-sm">{t('dash.browse')}</Link>
        </div>
      ) : (
        <div className="stack gap-14">
          {items.map((item) => (
            <article className="card panel" style={{ padding: 20 }} key={item.id}>
              <div className="spread" style={{ alignItems: 'flex-start' }}>
                <div className="row gap-14" style={{ alignItems: 'flex-start' }}>
                  {item.cover && <img src={item.cover} alt="" className="table-thumb" style={{ width: 72, height: 54 }} />}
                  <div>
                    <strong style={{ display: 'block' }}>
                      {item.property_slug ? (
                        <Link to={`/properties/${item.property_slug}`}>{pick(item.property_title_en, item.property_title_fa)}</Link>
                      ) : (
                        item.subject || pick('General enquiry', 'درخواست عمومی')
                      )}
                    </strong>
                    <span className="row-sub">
                      {item.property_reference || item.subject} · {formatDate(item.created_at, lang)}
                    </span>
                  </div>
                </div>
                <span className={`badge ${item.status === 'new' ? 'badge' : item.status === 'closed' ? 'badge-muted' : 'badge-success'}`}>
                  {item.status}
                </span>
              </div>
              <p className="small muted" style={{ marginBlockStart: 12, lineHeight: 1.7 }}>{item.message}</p>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
