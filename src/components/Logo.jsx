import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function Logo({ to = '/', compact = false }) {
  return (
    <Link to={to} className="logo" aria-label="EstatePro — home">
      <span className="logo-mark" aria-hidden="true">
        <Home size={compact ? 18 : 20} strokeWidth={2.2} />
      </span>
      <span>
        Estate<em>Pro</em>
      </span>
    </Link>
  )
}
