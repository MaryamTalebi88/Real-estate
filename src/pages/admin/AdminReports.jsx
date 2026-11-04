import { useEffect, useState } from 'react'
import { Eye, Search, Users } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useI18n } from '../../lib/i18n.jsx'
import { formatNumber, formatPrice } from '../../lib/format.js'
import usePageMeta from '../../lib/useMeta.js'

function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="bars">
      {data.map((item) => (
        <div className="bar-col" key={item.label}>
          <span className="tiny muted">{item.value}</span>
          <div className="bar" style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }} />
          <span className="bar-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminReports() {
  const { t, lang, pick } = useI18n()
  const [data, setData] = useState(null)

  usePageMeta({ title: `${t('admin.reports')} — EstatePro` })

  useEffect(() => {
    api.get('/admin/reports').then(setData).catch(() => setData(null))
  }, [])

  if (!data) return <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi">
          <span className="kpi-icon"><Eye size={17} /></span>
          <strong>{formatNumber(data.totals.total_views, lang)}</strong>
          <span>{pick('Property views', 'بازدید املاک')}</span>
        </div>
        <div className="kpi">
          <span className="kpi-icon"><Search size={17} /></span>
          <strong>{formatNumber(data.totals.total_searches, lang)}</strong>
          <span>{pick('Searches', 'جستجوها')}</span>
        </div>
        <div className="kpi">
          <span className="kpi-icon"><Users size={17} /></span>
          <strong>{formatNumber(data.totals.subscribers, lang)}</strong>
          <span>{pick('Newsletter subscribers', 'اعضای خبرنامه')}</span>
        </div>
      </div>

      <div className="form-grid" style={{ alignItems: 'start' }}>
        <div className="card panel">
          <h2 className="h-card" style={{ marginBlockEnd: 14 }}>{pick('Property views', 'بازدید املاک')}</h2>
          {data.viewed.length ? <Bars data={data.viewed} /> : <p className="small muted">—</p>}
        </div>
        <div className="card panel">
          <h2 className="h-card" style={{ marginBlockEnd: 14 }}>{pick('User registrations', 'ثبت‌نام کاربران')}</h2>
          {data.registrations.length ? <Bars data={data.registrations} /> : <p className="small muted">—</p>}
        </div>
      </div>

      <div className="form-grid" style={{ alignItems: 'start' }}>
        <div className="card panel">
          <h2 className="h-card" style={{ marginBlockEnd: 14 }}>{pick('Most popular listings', 'محبوب‌ترین املاک')}</h2>
          <div className="stack gap-12">
            {data.popular.map((item) => (
              <div className="row gap-12" key={item.id}>
                {item.cover && <img src={item.cover} alt="" className="table-thumb" />}
                <div className="grow">
                  <div className="row-title" style={{ fontSize: '0.86rem' }}>{item.title_en}</div>
                  <div className="row-sub">
                    {formatPrice(item.price, item.currency, lang)} · {formatNumber(item.views, lang)} {pick('views', 'بازدید')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card panel">
          <h2 className="h-card" style={{ marginBlockEnd: 14 }}>{pick('Most searched locations', 'پرچستجوترین شهرها')}</h2>
          <div className="stack gap-10">
            {data.searched.map((item) => (
              <div className="spread small" key={item.name_en}>
                <span>{lang === 'fa' ? item.name_fa : item.name_en}</span>
                <strong>{formatNumber(item.searches, lang)}</strong>
              </div>
            ))}
            {data.searched.length === 0 && <p className="small muted">—</p>}
          </div>

          <h2 className="h-card" style={{ marginBlock: '22px 14px' }}>{pick('Inquiries by status', 'درخواست‌ها بر اساس وضعیت')}</h2>
          <div className="stack gap-10">
            {data.inquiriesByMonth.map((item) => (
              <div className="spread small" key={item.status}>
                <span>{item.status}</span>
                <strong>{formatNumber(item.value, lang)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
