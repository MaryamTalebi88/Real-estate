import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function SectionHead({ eyebrow, title, description, linkTo, linkLabel, onDark = false }) {
  return (
    <div className="section-head">
      <div className="stack">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && <h2 className="h-section" style={onDark ? { color: '#fff' } : undefined}>{title}</h2>}
        {description && <p className="lead" style={onDark ? { color: 'rgba(238,241,244,0.72)' } : undefined}>{description}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="link-arrow" style={onDark ? { color: '#fff' } : undefined}>
          {linkLabel} <ArrowRight size={16} className="flip-rtl" />
        </Link>
      )}
    </div>
  )
}
