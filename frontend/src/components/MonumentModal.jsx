import { useState, useEffect } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import { buildCitations } from '../utils/citation'
import { formatYear } from '../utils/format'

// Shu sessiyada ochilgan yodgorliklar — ko'rishlar soni har ochilishda emas,
// bir marta oshsin (StrictMode'dagi ikki marta chaqiruv ham hisoblanmaydi)
const VIEWED_KEY = 'viewed_monuments'

function markViewed(id) {
  try {
    const seen = JSON.parse(sessionStorage.getItem(VIEWED_KEY) || '[]')
    if (seen.includes(id)) return false
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...seen, id]))
    return true
  } catch {
    return true
  }
}

export default function MonumentModal({ monument, onClose }) {
  const { t } = useApp()
  const [detail, setDetail] = useState(null)
  const [tab, setTab] = useState('text')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState('')

  const copy = (key, text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 1500)
    })
  }

  useEffect(() => {
    let active = true
    api.get(monument.id, { countView: markViewed(monument.id) }).then(r => {
      if (active) setDetail(r.data)
    }).catch(() => {}).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [monument.id])

  // Esc bilan yopish va orqa sahifa aylanmasligi
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const data = detail || monument

  const tabs = [
    { key: 'text', label: t('modal_text') },
    { key: 'transliteration', label: t('modal_transliteration') },
    { key: 'translation', label: t('modal_translation') },
    { key: 'info', label: t('modal_info') },
    ...(data.bibliography?.length ? [{ key: 'bibliography', label: t('modal_bibliography') }] : []),
    { key: 'cite', label: t('modal_cite') },
  ]

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="monument-modal-title">
        <div className="modal-header">
          <div>
            <h2 id="monument-modal-title" style={{ fontSize:'1.2rem', marginBottom:'0.2rem' }}>{data.title}</h2>
            {data.title_original && (
              <p style={{ fontSize:'0.9rem', color:'var(--text2)', fontStyle:'italic' }}>{data.title_original}</p>
            )}
          </div>
          <button onClick={onClose} className="btn btn-ghost" aria-label={t('modal_close')} title={t('modal_close')} style={{ fontSize:'1.4rem', padding:'0.25rem 0.5rem' }}>✕</button>
        </div>

        <div className="modal-tabs">
          {tabs.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`modal-tab ${tab === tb.key ? 'active' : ''}`}>
              {tb.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {loading && <div className="spinner" />}

          {!loading && tab === 'text' && (
            <pre style={{ fontFamily:'serif', fontSize:'1rem', lineHeight:1.8, whiteSpace:'pre-wrap', color:'var(--text)' }}>
              {data.full_text || '—'}
            </pre>
          )}

          {!loading && tab === 'transliteration' && (
            <pre style={{ fontFamily:'monospace', fontSize:'0.95rem', lineHeight:1.8, whiteSpace:'pre-wrap' }}>
              {data.transliteration || '—'}
            </pre>
          )}

          {!loading && tab === 'translation' && (
            <div style={{ lineHeight:1.8, fontSize:'0.95rem' }}>
              {data.translation || '—'}
            </div>
          )}

          {!loading && tab === 'info' && (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
              <tbody>
                {[
                  [t('modal_year'), formatYear(data.year, t)],
                  [t('modal_location'), data.location],
                  [t('modal_script'), data.script_display || data.script],
                  [t('modal_language'), data.language],
                  [t('modal_words'), data.word_count],
                  [t('modal_lines'), data.line_count],
                  [t('modal_researchers'), Array.isArray(data.researchers) ? data.researchers.join(', ') : data.researchers],
                ].map(([label, value]) => value ? (
                  <tr key={label} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'0.6rem', color:'var(--text2)', width:'40%', fontWeight:500 }}>{label}</td>
                    <td style={{ padding:'0.6rem' }}>{value}</td>
                  </tr>
                ) : null)}
              </tbody>
            </table>
          )}

          {!loading && tab === 'bibliography' && (
            <ul style={{ lineHeight:1.7, fontSize:'0.9rem', paddingLeft:'1.2rem',
              display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {(Array.isArray(data.bibliography) ? data.bibliography : [data.bibliography]).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}

          {!loading && tab === 'cite' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <p style={{ fontSize:'0.85rem', color:'var(--text2)' }}>
                {t('cite_intro')}
              </p>
              {buildCitations(data).map(c => (
                <div key={c.key} style={{ border:'1px solid var(--border)', borderRadius:'8px', padding:'0.8rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem' }}>
                    <strong style={{ fontSize:'0.8rem', color:'var(--accent)', letterSpacing:'0.05em' }}>{c.label}</strong>
                    <button onClick={() => copy(c.key, c.text)} className="btn btn-ghost"
                      style={{ fontSize:'0.8rem', padding:'0.2rem 0.6rem' }}>
                      {copied === c.key ? t('cite_copied') : t('cite_copy')}
                    </button>
                  </div>
                  <div style={{ fontSize:'0.88rem', lineHeight:1.6, color:'var(--text)' }}>{c.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
