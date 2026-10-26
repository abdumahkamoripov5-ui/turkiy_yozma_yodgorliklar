import { useState, useEffect, useRef } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import { formatYear } from '../utils/format'
import { Link, useSearchParams } from 'react-router-dom'
import { useCopy } from '../mvp/copy'
import ResearchExport from '../components/ResearchExport'
import '../pages/research.css'

// Yorliq → yodgorlik maydoni (ro'yxat API'si matnlarni bermaydi — ular to'liq
// ma'lumotdan olinadi)
const TEXT_FIELDS = { text: 'full_text', transliteration: 'transliteration', translation: 'translation' }

export default function Compare() {
  const { t } = useApp()
  const c = useCopy()
  const [params, setParams] = useSearchParams()
  const [all, setAll] = useState([])
  const [selected, setSelected] = useState([])
  const [details, setDetails] = useState({})
  const [searchQ, setSearchQ] = useState('')
  const [tab, setTab] = useState('text')
  const [error, setError] = useState(null)
  const [detailErrors, setDetailErrors] = useState({})
  const [wordFilter, setWordFilter] = useState('')
  useEffect(() => {
    if (!all.length) return
    const ids = (params.get('monuments') || '').split(',').filter(id => /^\d+$/.test(id)).slice(0, 3)
    setSelected(ids.map(id => all.find(item => String(item.id) === id)).filter(Boolean))
  }, [all, params])

  useEffect(() => {
    setError(null)
    api.all({ ordering: 'year' }).then(r => {
      setAll(r.data.results || r.data)
    }).catch(() => setError(t('error_load')))
  }, [t])

  // Tanlangan yodgorliklarning to'liq matnini yuklash (ko'rishlar soni oshirilmaydi)
  const requested = useRef(new Set())
  useEffect(() => {
    selected.filter(m => !requested.current.has(m.id)).forEach(m => {
      requested.current.add(m.id)
      setDetailErrors(d => ({ ...d, [m.id]: false }))
      api.get(m.id, { countView: false })
        .then(r => setDetails(d => ({ ...d, [m.id]: r.data })))
        .catch(() => {
          requested.current.delete(m.id)  // keyingi tanlashda qayta urinib ko'riladi
          setDetailErrors(d => ({ ...d, [m.id]: true }))
        })
    })
  }, [selected])

  const filtered = all.filter(m =>
    m.title.toLowerCase().includes(searchQ.toLowerCase()) &&
    !selected.find(s => s.id === m.id)
  )

  const choose = rows => setParams(rows.length ? { monuments: rows.map(item => item.id).join(',') } : {})
  const add = m => { if (selected.length < 3 && !selected.some(item => item.id === m.id)) choose([...selected, m]) }
  const remove = id => choose(selected.filter(m => m.id !== id))

  const tabs = ['text', 'transliteration', 'translation', 'info', 'lexical']
  const tabLabel = { text: t('modal_text'), transliteration: t('modal_transliteration'),
    translation: t('modal_translation'), info: t('modal_info'), lexical: c('So‘z shakllarini solishtirish', 'Сравнить словоформы', 'Compare word forms') }
  const vocabulary = selected.map(item => {
    const detail = details[item.id]
    const text = detail?.reading?.lines.length ? detail.reading.lines.map(line => line.transliteration).join('\n') : detail?.transliteration || ''
    return new Set((text.match(/[\p{L}\p{M}]+(?:['’‘ʻʼʹ-][\p{L}\p{M}]+)*/gu) || []).map(word => word.normalize('NFC').toLowerCase().replace(/[’‘ʻʼʹ]/g, "'")))
  })
  const common = vocabulary.length > 1 ? [...vocabulary[0]].filter(word => vocabulary.every(words => words.has(word))) : []
  const allReady = selected.every(item => Boolean(details[item.id]))

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
                <button key={m.id} disabled={selected.length >= 3} onClick={() => { add(m); setSearchQ('') }}
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
            <button onClick={() => choose([])} className="btn btn-ghost" style={{ fontSize:'0.8rem' }}>
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

            <div className="research-actions"><Link to={`/corpus?monuments=${selected.map(item => item.id).join(',')}`}>{c('Tanlangan matnlardan izlash', 'Поиск в выбранных текстах', 'Search selected texts')} ↗</Link><Link to={`/frequent-words?monuments=${selected.map(item => item.id).join(',')}`}>{c('Chastotalarni ko‘rish', 'Посмотреть частоты', 'View frequencies')} ↗</Link></div>
            {tab === 'lexical' && allReady && <section className="compare-vocabulary"><label>{c('Shaklni filtrlash', 'Фильтр словоформ', 'Filter word forms')}<input value={wordFilter} onChange={event => setWordFilter(event.target.value)} /></label><h3>{c('Barcha tanlangan matnlarda uchragan', 'Встречаются во всех выбранных текстах', 'Present in all selected texts')} · {common.length}</h3><p>{common.filter(word => word.includes(wordFilter.toLowerCase())).sort().slice(0, 200).map(word => <Link key={word} to={`/corpus?q=${encodeURIComponent(word)}&monuments=${selected.map(item => item.id).join(',')}`}>{word} </Link>)}</p><p className="meros-meta">{c('Shakllar transliteratsiyadan olinadi. Ro‘yxat 200 tagacha ko‘rsatiladi; so‘z bilan toraytirishingiz mumkin.', 'Формы извлекаются из транслитерации. Показано до 200; уточните фильтр.', 'Forms come from transliteration. Up to 200 are displayed; use the word filter to narrow them.')}</p></section>}

            {/* Side-by-side content */}
            <div className="compare-grid" style={{ display:'grid', gridTemplateColumns:`repeat(${selected.length}, minmax(0, 1fr))`, gap:'1rem' }}>
              {selected.map(sel => {
                const m = details[sel.id] || sel
                const ready = Boolean(details[sel.id])
                return (
                <div key={sel.id} className="card" style={{ minWidth:0 }}>
                  <h3 style={{ fontSize:'0.95rem', color:'var(--accent)', marginBottom:'0.75rem' }}>{m.title}</h3>
                  {tab === 'lexical' && !ready ? <p role="status">{detailErrors[sel.id] ? t('error_load') : t('loading')}</p> : tab === 'lexical' ? <div><strong>{c('Faqat ushbu matnda', 'Только в этом тексте', 'Only in this text')}</strong><p>{[...vocabulary[selected.indexOf(sel)]].filter(word => !vocabulary.some((words, index) => index !== selected.indexOf(sel) && words.has(word))).filter(word => word.includes(wordFilter.toLowerCase())).sort().slice(0, 200).map(word => <Link key={word} to={`/corpus?q=${encodeURIComponent(word)}&monuments=${sel.id}`}>{word} </Link>)}</p></div> : tab === 'info' ? (
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
                  ) : detailErrors[sel.id] ? (
                    <div className="error-msg">{t('error_load')}
                      <button className="btn btn-outline" onClick={() => setSelected(s => [...s])}>{t('retry')}</button>
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
            <ResearchExport endpoint="/research/export/" params={{ monuments: selected.map(item => item.id).join(',') }} formats={['tei', 'xlsx', 'csv', 'json']} />
          </>
        )}
      </div>
    </div>
  )
}
