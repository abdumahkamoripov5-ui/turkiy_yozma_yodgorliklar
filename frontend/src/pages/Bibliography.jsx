import { useState, useEffect } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import { formatYear } from '../utils/format'

export default function Bibliography() {
  const { t } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.list({ ordering: 'year', page_size: 200 }).then(r => {
      const data = (r.data.results || r.data)
        .map(m => ({
          ...m,
          researchersText: Array.isArray(m.researchers) ? m.researchers.join(', ') : (m.researchers || ''),
          bibliographyList: Array.isArray(m.bibliography) ? m.bibliography : (m.bibliography ? [m.bibliography] : []),
        }))
        .filter(m => m.researchersText || m.bibliographyList.length)
      setItems(data)
    }).catch(() => setError(t('error_load'))).finally(() => setLoading(false))
  }, [t])

  const filtered = items.filter(m => {
    const q = search.toLowerCase()
    return !q || m.title.toLowerCase().includes(q) ||
      m.researchersText.toLowerCase().includes(q) ||
      m.bibliographyList.join('\n').toLowerCase().includes(q)
  })

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('bibliography_title')}</h1>
        <input type="search" placeholder={t('search_placeholder')} value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom:'1.5rem', maxWidth:'400px', display:'block' }} />

        {loading && <div className="spinner" />}
        {error && <div className="error-msg">{error}</div>}

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {filtered.map(m => (
            <div key={m.id} className="card">
              <h3 style={{ color:'var(--accent)', marginBottom:'0.5rem' }}>{m.title}</h3>
              {m.year != null && <p style={{ fontSize:'0.8rem', color:'var(--text2)', marginBottom:'0.5rem' }}>
                {formatYear(m.year, t)}
                {m.location && ` · ${m.location}`}
              </p>}
              {m.researchersText && (
                <p style={{ fontSize:'0.9rem', marginBottom:'0.4rem' }}>
                  <strong>{t('bibliography_researchers')}:</strong> {m.researchersText}
                </p>
              )}
              {m.bibliographyList.length > 0 && (
                <ul style={{ fontSize:'0.85rem', color:'var(--text2)', lineHeight:1.6,
                  paddingLeft:'1.2rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                  {m.bibliographyList.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign:'center', color:'var(--text2)', padding:'2rem' }}>{t('no_results')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
