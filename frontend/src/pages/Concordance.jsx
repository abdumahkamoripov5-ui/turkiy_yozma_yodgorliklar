import { useState, useRef } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import { useSearchParams } from 'react-router-dom'

export default function Concordance() {
  const { t } = useApp()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const searching = useRef(false)

  const search = async () => {
    if (searching.current || query.trim().length < 2) return
    searching.current = true
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const r = await api.concordance(query.trim())
      setResults(r.data)
    } catch {
      setError(t('error_load'))
    } finally {
      searching.current = false
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('concordance_title')}</h1>

        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', maxWidth:'600px' }}>
          <input
            type="search"
            placeholder={t('concordance_placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            style={{ flex:1 }}
          />
          <button onClick={search} disabled={loading || query.trim().length < 2} className="btn btn-primary">
            {t('concordance_search')}
          </button>
        </div>

        {loading && <div className="spinner" />}
        {error && <div className="error-msg">{error}</div>}

        {results && (
          <div>
            <p style={{ marginBottom:'1rem', color:'var(--text2)', fontSize:'0.9rem' }}>
              «{results.query}» — {results.count} {t('concordance_results')}
            </p>
            {results.results.length === 0 && (
              <div style={{ textAlign:'center', color:'var(--text2)', padding:'2rem' }}>
                {t('concordance_no_results')}
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {results.results.map((r, i) => (
                <div key={i} className="card" style={{ fontSize:'0.9rem' }}>
                  <div style={{ marginBottom:'0.4rem', fontSize:'0.8rem' }}>
                    <span style={{ color:'var(--accent)', fontWeight:600 }}>{r.monumentTitle}</span>
                    <span style={{ color:'var(--text2)', marginLeft:'0.5rem' }}>· {r.field}</span>
                  </div>
                  <div style={{ fontFamily:'monospace', lineHeight:1.6 }}>
                    <span style={{ color:'var(--text2)' }}>…{r.left}</span>
                    <mark style={{ background:'rgba(var(--accent-rgb),0.25)', color:'var(--accent)', padding:'0 2px', borderRadius:'2px' }}>
                      {r.match}
                    </mark>
                    <span style={{ color:'var(--text2)' }}>{r.right}…</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
