import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'

export default function Pagination({ page, pages, onChange }) {
  const { lang } = useI18n()
  if (pages <= 1) return null

  const nums = []
  const start = Math.max(1, page - 1)
  const end = Math.min(pages, start + 2)
  for (let i = start; i <= end; i += 1) nums.push(i)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={16} className="flip-rtl" />
      </button>
      {start > 1 && (
        <>
          <button type="button" onClick={() => onChange(1)}>1</button>
          {start > 2 && <span className="muted">…</span>}
        </>
      )}
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          className={n === page ? 'is-active' : ''}
          onClick={() => onChange(n)}
        >
          {new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(n)}
        </button>
      ))}
      {end < pages && (
        <>
          {end < pages - 1 && <span className="muted">…</span>}
          <button type="button" onClick={() => onChange(pages)}>
            {new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(pages)}
          </button>
        </>
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page">
        <ChevronRight size={16} className="flip-rtl" />
      </button>
    </nav>
  )
}
