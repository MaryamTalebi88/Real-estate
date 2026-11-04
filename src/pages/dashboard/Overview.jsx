import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, Home, Inbox, Plus, ArrowRight } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { useAuth } from '../../lib/auth.jsx'
import { formatDate, formatNumber, formatPrice } from '../../lib/format.js'
import usePageMeta from '../../lib/useMeta.js'

const STATUS_BADGE = {
  active: 'badge-success',
  pending: 'badge',
  rejected: 'badge-danger',
  sold: 'badge-muted',
}

export default function Overview() {
  const { t, lang, pick } = useI18n()
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [listings, setListings] = useState([])
  const [inquiries, setInquiries] = useState([])

  usePageMeta({ title: `${t('dash.overview')} — EstatePro` })

  useEffect(() => {
    api.get('/me/summary').then(setSummary).catch(() => setSummary(null))
    api.get('/me/properties').then(setListings).catch(() => setListings([]))
    api.get('/me/inquiries').then(setInquiries).catch(() => setInquiries([]))
  }, [])

  const kpis = [
    { icon: Heart, label: t('dash.savedProperties'), value: summary?.favorites ?? 0, to: '/dashboard/favorites' },
    { icon: Home, label: t('dash.myListings'), value: summary?.listings ?? 0, to: '/dashboard/listings' },
    { icon: Eye, label: t('dash.liveListings'), value: summary?.live ?? 0, to: '/dashboard/listings' },
    { icon: Inbox, label: t('dash.inquiriesSent'), value: summary?.inquiries ?? 0, to: '/dashboard/inquiries' },
  ]

  return (
    <>
      <div className="dash-head">
        <div>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </div>
        <Link to="/sell" className="btn btn-gold btn-sm">
          <Plus size={15} /> {t('dash.addListing')}
        </Link>
      </div>

      <div className="kpi-grid">
        {kpis.map(({ icon: Icon, label, value, to }) => (
          <Link key={label} to={to} className="kpi">
            <span className="kpi-icon">
              <Icon size={17} />
            </span>
            <strong>{formatNumber(value, lang)}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="card panel">
        <div className="spread" style={{ marginBlockEnd: 16 }}>
          <h2 className="h-card">{t('dash.myListings')}</h2>
          <Link to="/dashboard/listings" className="link-arrow">
            {t('common.viewAll')} <ArrowRight size={14} className="flip-rtl" />
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="small muted">{t('dash.noListings')}</p>
        ) : (
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th>{pick('Property', 'ملک')}</th>
                  <th>{t('sell.price')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.date')}</th>
                </tr>
              </thead>
              <tbody>
                {listings.slice(0, 4).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="row gap-12">
                        {item.cover && <img src={item.cover} alt="" className="table-thumb" />}
                        <div>
                          <div className="row-title">{pick(item.title_en, item.title_fa)}</div>
                          <div className="row-sub">{item.reference}</div>
                        </div>
                      </div>
                    </td>
                    <td className="nowrap">{formatPrice(item.price, item.currency, lang)}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[item.status] || 'badge-muted'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="nowrap small muted">{formatDate(item.created_at, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card panel">
        <div className="spread" style={{ marginBlockEnd: 16 }}>
          <h2 className="h-card">{t('dash.inquiries')}</h2>
          <Link to="/dashboard/inquiries" className="link-arrow">
            {t('common.viewAll')} <ArrowRight size={14} className="flip-rtl" />
          </Link>
        </div>
        {inquiries.length === 0 ? (
          <p className="small muted">{t('dash.noInquiries')}</p>
        ) : (
          <div className="timeline">
            {inquiries.slice(0, 4).map((item) => (
              <div className="timeline-item" key={item.id}>
                <span className="timeline-dot">
                  <Inbox size={14} />
                </span>
                <div className="grow">
                  <strong>{item.subject || pick('Property enquiry', 'پرسش درباره ملک')}</strong>
                  <span>
                    {item.property_title_en ? pick(item.property_title_en, item.property_title_fa) : pick('General enquiry', 'درخواست عمومی')}
                    {' · '}
                    {formatDate(item.created_at, lang)}
                  </span>
                </div>
                <span className={`badge ${item.status === 'new' ? 'badge' : 'badge-muted'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
