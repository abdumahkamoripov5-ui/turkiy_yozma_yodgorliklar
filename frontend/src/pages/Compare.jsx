import { useState, useEffect, useRef } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import { formatYear } from '../utils/format'

// Yorliq → yodgorlik maydoni (ro'yxat API'si matnlarni bermaydi — ular to'liq
// ma'lumotdan olinadi)
const TEXT_FIELDS = { text: 'full_text', transliteration: 'transliteration', translation: 'translation' }

export default function Compare() {
  const { t } = useApp()
  const [all, setAll] = useState([])
  const [selected, setSelected] = useState([])
  const [details, setDetails] = useState({})
  const [searchQ, setSearchQ] = useState('')
  const [tab, setTab] = useState('text')
  const [error, setError] = useState(null)

  useEffect(() => {
    api.list({ ordering: 'year', page_size: 200 }).then(r => {
      setAll(r.data.results || r.data)
    }).catch(() => setError(t('error_load')))
  }, [t])

  // Tanlangan yodgorliklarning to'liq matnini yuklash (ko'rishlar soni oshirilmaydi)
  const requested = useRef(new Set())
  useEffect(() => {
    selected.filter(m => !requested.current.has(m.id)).forEach(m => {
      requested.current.add(m.id)
      api.get(m.id, { countView: false })
        .then(r => setDetails(d => ({ ...d, [m.id]: r.data })))
        .catch(() => {
          requested.current.delete(m.id)  // keyingi tanlashda qayta urinib ko'riladi
          setDetails(d => ({ ...d, [m.id]: m }))
        })
    })
  }, [selected])

  const filtered = all.filter(m =>
    m.title.toLowerCase().includes(searchQ.toLowerCase()) &&
    !selected.find(s => s.id === m.id)
  )

  const add = m => { if (selected.length < 3) setSelected(s => [...s, m]) }
  const remove = id => setSelected(s => s.filter(m => m.id !== id))

  const tabs = ['text', 'transliteration', 'translation', 'info']
  const tabLabel = { text: t('modal_text'), transliteration: t('modal_transliteration'),
    translation: t('modal_translation'), info: t('modal_info') }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('compare_title')}</h1>

        {error && <div className="error-msg" style={{ marginBottom:'1rem' }}>{error}</div>}

        {/* Selection area */}
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          <input type="search" placeholder={t('search_placeholder')} value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{ flex:'1 1 200px' }} />
          {searchQ && (
            <div style={{ position:'relative', flex:'1 1 300px', maxHeight:'200px', overflowY:'auto' }}
              className="card">
              {filtered.slice(0,10).map(m => (
                <button key={m.id} onClick={() => { add(m); setSearchQ('') }}
                  style={{ display:'block', width:'100%', textAlign:'left', padding:'0.5rem',
                    borderBottom:'1px solid var(--border)', color:'var(--text)', fontSize:'0.85rem',
                    background:'transparent', cursor:'pointer' }}>
                  {m.title} <span style={{ color:'var(--text2)' }}>({formatYear(m.year, t)})</span>
                </button>
              ))}
              {filtered.length === 0 && <p style={{ padding:'0.5rem', color:'var(--text2)', fontSize:'0.85rem' }}>{t('no_results')}</p>}
            </div>
          )}
        </div>

        {/* Selected chips */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {selected.map(m => (
            <span key={m.id} className="badge badge-accent" style={{ fontSize:'0.85rem', padding:'0.3rem 0.75rem' }}>
              {m.title}
              <button onClick={() => remove(m.id)} aria-label={`${t('compare_clear')}: ${m.title}`}
                style={{ marginLeft:'0.5rem', color:'var(--accent)', fontWeight:700, cursor:'pointer', background:'none', border:'none' }}>
                ×
              </button>
            </span>
          ))}
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} className="btn btn-ghost" style={{ fontSize:'0.8rem' }}>
              {t('compare_clear')}
            </button>
          )}
        </div>

        {selected.length < 2 && (
          <div style={{ textAlign:'center', color:'var(--text2)', padding:'3rem' }}>
            {t('compare_select')} (2-3)
          </div>
        )}

        {selected.length >= 2 && (
          <>
            {/* Tabs */}
            <div className="modal-tabs" style={{ padding:0, marginBottom:'1rem' }}>
              {tabs.map(tb => (
                <button key={tb} onClick={() => setTab(tb)}
                  className={`modal-tab ${tab === tb ? 'active' : ''}`}>
                  {tabLabel[tb]}
                </button>
              ))}
            </div>

            {/* Side-by-side content */}
            <div className="compare-grid" style={{ display:'grid', gridTemplateColumns:`repeat(${selected.length}, minmax(0, 1fr))`, gap:'1rem' }}>
              {selected.map(sel => {
                const m = details[sel.id] || sel
                const ready = Boolean(details[sel.id])
                return (
                <div key={sel.id} className="card" style={{ minWidth:0 }}>
                  <h3 style={{ fontSize:'0.95rem', color:'var(--accent)', marginBottom:'0.75rem' }}>{m.title}</h3>
                  {tab === 'info' ? (
                    <div style={{ fontSize:'0.85rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                      {[[t('modal_year'), m.year != null ? formatYear(m.year, t) : null],
                        [t('modal_location'), m.location],
                        [t('modal_script'), m.script_display || m.script],
                        [t('modal_language'), m.language],
                        [t('modal_words'), m.word_count]].map(([l, v]) => v ? (
                        <div key={l} style={{ display:'flex', gap:'0.5rem' }}>
                          <span style={{ color:'var(--text2)', minWidth:'90px' }}>{l}:</span>
                          <span>{v}</span>
                        </div>
                      ) : null)}
                    </div>
                  ) : !ready ? (
                    <div className="spinner" />
                  ) : (
                    <pre style={{ fontSize:'0.85rem', whiteSpace:'pre-wrap', lineHeight:1.7,
                      fontFamily: tab === 'text' ? 'serif' : tab === 'transliteration' ? 'monospace' : 'inherit',
                      color:'var(--text)', maxHeight:'400px', overflow:'auto' }}>
                      {m[TEXT_FIELDS[tab]] || '—'}
                    </pre>
                  )}
                </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
