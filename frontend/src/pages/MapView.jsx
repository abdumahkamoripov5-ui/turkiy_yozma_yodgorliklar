import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import { geocode } from '../utils/geocode'
import MonumentModal from '../components/MonumentModal'
import { formatYear } from '../utils/format'

// Vite'da Leaflet standart belgisi sinadi — rasmlarni import qilib tuzatamiz.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

async function fetchAll() {
  let all = []
  let page = 1
  while (page <= 50) {
    const r = await api.list({ page, page_size: 100 })
    all = all.concat(r.data.results || r.data)
    if (!r.data.next) break
    page++
  }
  return all
}

export default function MapView() {
  const { t } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchAll()
      .then(list => {
        const withCoords = list
          .map(m => ({ m, coord: geocode(m) }))
          .filter(x => x.coord)
        setItems(withCoords)
      })
      .catch(() => setError(t('error_load')))
      .finally(() => setLoading(false))
  }, [t])

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('map_title')}</h1>
        <p style={{ color:'var(--text2)', marginBottom:'1.5rem', fontSize:'0.9rem' }}>
          {t('map_desc')}
          {!loading && !error && <> {t('map_placed', { n: items.length })}</>}
        </p>

        {loading && <div className="spinner" />}
        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && (
          <div style={{ borderRadius:'var(--radius)', overflow:'hidden', border:'1px solid var(--border)' }}>
            <MapContainer center={[45, 92]} zoom={3} style={{ height:'70vh', width:'100%' }} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {items.map(({ m, coord }) => (
                <Marker key={m.id} position={coord}>
                  <Popup>
                    <div style={{ minWidth:'160px' }}>
                      <strong>{m.title}</strong>
                      <div style={{ fontSize:'0.8rem', color:'#666', margin:'0.3rem 0' }}>
                        {formatYear(m.year, t)} · {m.location}
                      </div>
                      <button
                        onClick={() => setSelected(m)}
                        style={{
                          border:'none', background:'var(--accent)', color:'#ffffff',
                          padding:'0.3rem 0.7rem', borderRadius:'6px', cursor:'pointer',
                          fontSize:'0.8rem', fontWeight:600,
                        }}>
                        {t('card_read_more')} →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {selected && <MonumentModal monument={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
