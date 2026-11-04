import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function Lightbox({ images = [], index = 0, onClose, onChange }) {
  const go = useCallback(
    (delta) => {
      const next = (index + delta + images.length) % images.length
      onChange(next)
    },
    [index, images.length, onChange],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [go, onClose])

  if (!images.length) return null

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image gallery">
      <div className="lightbox-bar">
        <span className="small" style={{ opacity: 0.72 }}>
          {index + 1} / {images.length}
        </span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close gallery" style={{ color: '#fff' }}>
          <X size={22} />
        </button>
      </div>

      <div className="lightbox-stage">
        <img src={images[index]} alt="" />
        {images.length > 1 && (
          <>
            <button type="button" className="lightbox-nav prev" onClick={() => go(-1)} aria-label="Previous image">
              <ChevronLeft size={22} className="flip-rtl" />
            </button>
            <button type="button" className="lightbox-nav next" onClick={() => go(1)} aria-label="Next image">
              <ChevronRight size={22} className="flip-rtl" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="lightbox-thumbs">
          {images.map((url, i) => (
            <img
              key={url + i}
              src={url}
              alt=""
              className={i === index ? 'active' : ''}
              onClick={() => onChange(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
