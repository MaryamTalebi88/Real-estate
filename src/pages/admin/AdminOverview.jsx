import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Inbox,
  Star,
  Users,
} from 'lucide-react'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { formatDate, formatNumber } from '../../lib/format.js'
import usePageMeta from '../../lib/useMeta.js'

export default function AdminOverview() {
  const { t, lang, pick } = useI18n()
  const [data, setData] = useState(null)

  usePageMeta({ title: `${t('admin.overview')} — EstatePro` })

  useEffect(() => {
    api.get('/admin/stats').then(setData).catch(() => setData(null))
  }, [])

  if (!data) {
    return <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
  }

  const { counts, activity } = data
  const kpis = [
    { icon: Building2, label: t('admin.totalProperties'), value: counts.properties, accent: false },
    { icon: CheckCircle2, label: t('admin.activeListings'), value: counts.active, accent: true },
    { icon: Clock, label: t('admin.pendingApprovals'), value: counts.pending, accent: false },
    { icon: Users, label: t('admin.totalUsers'), value: counts.users, accent: false },
    { icon: Star, label: t('admin.registeredAgents'), value: counts.agents, accent: false },
    { icon: Inbox, label: t('admin.totalInquiries'), value: counts.inquiries, accent: false },
    { icon: Eye, label: pick('Total views', 'کل بازدیدها'), value: counts.views, accent: false },
    { icon: Star, label: pick('Pending reviews', 'نظرات در انتظار'), value: counts.pending_reviews, accent: false },
  ]

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {kpis.map(({ icon: Icon, label, value, accent }) => (
          <div className={`kpi ${accent ? 'accent' : ''}`} key={label}>
            <span className="kpi-icon">
              <Icon size={17} />
            </span>
            <strong>{formatNumber(value, lang)}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="row gap-16 wrap" style={{ marginBlockStart: 4 }}>
        <Link to="/admin/properties?status=pending" className="btn btn-gold btn-sm">
          {t('admin.pendingApprovals')} ({counts.pending})
        </Link>
        <Link to="/admin/inquiries?status=new" className="btn btn-outline btn-sm">
          {pick('New inquiries', 'درخواست‌های جدید')} ({counts.new_inquiries})
        </Link>
        <Link to="/admin/reviews?status=pending" className="btn btn-outline btn-sm">
          {pick('Reviews to approve', 'نظرات برای تأیید')} ({counts.pending_reviews})
        </Link>
      </div>

      <div className="card panel">
        <h2 className="h-card" style={{ marginBlockEnd: 14 }}>{t('admin.recentActivity')}</h2>
        <div className="timeline">
          {activity.map((item, i) => (
            <div className="timeline-item" key={`${item.kind}-${item.id}-${i}`}>
              <span className="timeline-dot">
                {item.kind === 'property' ? <Building2 size={14} /> : item.kind === 'user' ? <Users size={14} /> : <Inbox size={14} />}
              </span>
              <div className="grow">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              <span className="small muted nowrap">{formatDate(item.created_at, lang)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
