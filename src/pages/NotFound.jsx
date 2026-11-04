import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'
import usePageMeta from '../lib/useMeta.js'

export default function NotFound() {
  const { t, pick } = useI18n()
  usePageMeta({ title: `404 — EstatePro` })

  return (
    <div className="notfound">
      <div>
        <div className="nf-code">404</div>
        <h1 className="h-section" style={{ marginBlock: '-10px 14px' }}>
          {t('notfound.title')}
        </h1>
        <p className="lead" style={{ marginInline: 'auto' }}>
          {t('notfound.body')}
        </p>
        <div className="row gap-12" style={{ justifyContent: 'center', marginBlockStart: 26 }}>
          <Link to="/" className="btn btn-navy">{t('nav.home')}</Link>
          <Link to="/properties" className="btn btn-gold">
            <Compass size={16} /> {t('hero.explore')}
          </Link>
        </div>
      </div>
    </div>
  )
}
