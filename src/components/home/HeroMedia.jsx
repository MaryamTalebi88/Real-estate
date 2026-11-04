import { useEffect, useRef, useState } from 'react'

/** Full-bleed villa film used by the home hero. Swap these two files to change the hero. */
const VIDEO_SRC = '/media/villa-hero.mp4'
const POSTER_SRC = '/media/villa-hero-poster.jpg'

/**
 * Cinematic hero background: muted looping villa video, with the poster frame as
 * an instant placeholder and as the still fallback when motion is reduced.
 */
export default function HeroMedia() {
  const videoRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // React does not always reflect `muted` on the DOM node; set it before play so
    // browsers allow autoplay.
    video.muted = true
    const attempt = video.play()
    if (attempt?.catch) attempt.catch(() => {})
  }, [reducedMotion, failed])

  return (
    <div className="hero-media">
      {reducedMotion || failed ? (
        <img className="hero-media-still" src={POSTER_SRC} alt="" fetchPriority="high" />
      ) : (
        <video
          ref={videoRef}
          className="hero-video"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
          tabIndex={-1}
          aria-hidden="true"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
