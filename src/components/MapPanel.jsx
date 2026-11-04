import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const PIN_HTML =
  '<span style="display:block;width:16px;height:16px;border-radius:50%;background:#DDBB72;border:3px solid #101820;box-shadow:0 2px 8px rgba(16,24,32,.4)"></span>'

/** Interactive OpenStreetMap panel with one marker per property. */
export default function MapPanel({ points = [], height = 380, zoom = 11, label }) {
  const hostRef = useRef(null)
  const key = JSON.stringify(points.map((p) => [p.id, p.lat, p.lng]))

  useEffect(() => {
    if (!hostRef.current) return undefined
    const valid = points.filter((p) => Number(p.lat) && Number(p.lng))
    const center = valid.length ? [Number(valid[0].lat), Number(valid[0].lng)] : [25.2048, 55.2708]

    const map = L.map(hostRef.current, {
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    const icon = L.divIcon({
      className: 'ep-marker',
      html: PIN_HTML,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })

    const markers = valid.map((point) =>
      L.marker([Number(point.lat), Number(point.lng)], { icon })
        .addTo(map)
        .bindPopup(
          `<strong>${label ? label(point) : point.title || ''}</strong><br/>${
            point.neighborhood || ''
          }`,
        ),
    )

    if (markers.length > 1) {
      map.fitBounds(L.latLngBounds(valid.map((p) => [Number(p.lat), Number(p.lng)])), {
        padding: [40, 40],
        maxZoom: 12,
      })
    }

    return () => {
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, zoom])

  return <div ref={hostRef} style={{ height, width: '100%' }} role="img" aria-label="Property map" />
}
