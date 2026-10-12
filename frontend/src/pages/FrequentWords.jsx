import { useState, useEffect, useCallback } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'

export default function FrequentWords() {
  const { t } = useApp()
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await api.wordFrequency(150)
      setWords(r.data.results || [])
    } catch {
      setError(t('error_load'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = words.filter(w => !search || w.word.includes(search.toLowerCase()))
  const maxCount = words[0]?.count || 1

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('frequent_title')}</h1>
        <p style={{ color: 'var(--text2)', maxWidth: '720px', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
          {t('frequent_desc')}
        </p>
        <input type="search" placeholder={t('frequent_search')} value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: '1.5rem', maxWidth: '400px', display: 'block' }} />

        {loading && <div className="spinner" />}
        {error && (
          <div className="error-msg">
            {error}
            <div style={{ marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={fetchData}>{t('retry')}</button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map((w, i) => (
              <div key={w.word} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.65rem 1rem' }}>
                <div className="frequency-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--text2)', fontSize: '0.8rem', width: '2rem', flexShrink: 0 }}>{i + 1}</span>
                  <span className="frequency-word" style={{ fontWeight: 600, color: 'var(--text)', minWidth: '140px' }}>{w.word}</span>
                  <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.max(4, (w.count / maxCount) * 100)}%`, height: '100%',
                      background: 'var(--accent-grad)', borderRadius: '100px',
                    }} />
                  </div>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, minWidth: '70px', textAlign: 'right' }}>
                    {w.count} {t('frequent_times')}
                  </span>
                </div>
                {w.tr && (
                  <div style={{ marginLeft: '3rem', fontSize: '0.82rem', color: 'var(--text2)' }}>
                    <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{t('frequent_tr_label')}:</span> {w.tr}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text2)', padding: '2rem' }}>{t('no_results')}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
