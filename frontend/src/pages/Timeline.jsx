import { useState, useEffect } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import MonumentModal from '../components/MonumentModal'
import { centuryOf, formatCentury, formatYear } from '../utils/format'

export default function Timeline() {
  const { t } = useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.list({ ordering: 'year', page_size: 200 }).then(r => {
      setData(r.data.results || r.data)
    }).catch(() => setError(t('error_load'))).finally(() => setLoading(false))
  }, [t])

  // Asrlar bo'yicha guruhlash. Kalit — sonli (miloddan avvalgilar manfiy),
  // shuning uchun tartib to'g'ri: ... 2 m.a., 1 m.a., 1, 2, ... 10, 11
  const groups = new Map()
  data.forEach(m => {
    if (m.year == null) return
    const key = m.year < 0 ? -centuryOf(m.year) : centuryOf(m.year)
    if (!groups.has(key)) groups.set(key, { label: formatCentury(m.year, t), items: [] })
    groups.get(key).items.push(m)
  })
  const centuries = [...groups.entries()].sort(([a], [b]) => a - b).map(([, g]) => g)

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('timeline_title')}</h1>
        {loading && <div className="spinner" />}
        {error && <div className="error-msg">{error}</div>}
        <div className="timeline" style={{ position:'relative' }}>
          {/* Timeline line */}
          <div className="timeline-line" style={{
            position:'absolute', left:'calc(50% - 1px)', top:0, bottom:0,
            width:'2px', background:'var(--border)',
          }} />
          {centuries.map(({ label: century, items }, ci) => (
            <div key={century} className="timeline-row" style={{
              display:'flex',
              flexDirection: ci % 2 === 0 ? 'row' : 'row-reverse',
              gap:'2rem',
              marginBottom:'2rem',
              alignItems:'flex-start',
            }}>
              {/* Content */}
              <div className="timeline-content" style={{ flex:1, minWidth:0 }}>
                <div className="card">
                  <h3 style={{ color:'var(--accent)', marginBottom:'0.75rem', fontSize:'1.1rem' }}>
                    {century}
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                    {items.map(m => (
                      <button key={m.id} onClick={() => setSelected(m)}
                        style={{
                          textAlign:'left', padding:'0.5rem 0.75rem',
                          background:'var(--bg3)', border:'1px solid var(--border)',
                          borderRadius:'6px', cursor:'pointer', color:'var(--text)',
                          fontSize:'0.85rem', transition:'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background='var(--bg3)'}
                      >
                        <span style={{ color:'var(--accent)', marginRight:'0.5rem' }}>
                          {formatYear(m.year, t)}
                        </span>
                        {m.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center dot */}
              <div className="timeline-dot" style={{
                flex:'0 0 auto', width:'14px', height:'14px',
                background:'var(--accent)', borderRadius:'50%',
                border:'3px solid var(--bg)',
                marginTop:'1rem',
                zIndex:1,
              }} />

              <div className="timeline-spacer" style={{ flex:1 }} />
            </div>
          ))}
        </div>
      </div>
      {selected && <MonumentModal monument={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
