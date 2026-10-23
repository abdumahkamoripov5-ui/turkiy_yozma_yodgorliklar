import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useRemote, items } from '../mvp/api'
import './parallel-reading.css'

const WORDS = /([\p{L}\p{M}]+(?:['’‘ʻʼʹ-][\p{L}\p{M}]+)*)/gu

function WordText({ text, selected, onSelect }) {
  return (text || '—').split(WORDS).map((part, index) => index % 2
    ? <button type="button" className={`reading-word${selected === part ? ' is-selected' : ''}`} key={index}
      aria-pressed={selected === part} onClick={() => onSelect(part)}>{part}</button>
    : part)
}

function WordExplanation({ word }) {
  const { t } = useApp()
  const remote = useRemote(`/words/lookup/?q=${encodeURIComponent(word)}`)
  const entries = items(remote.data)
  return <div className="reading-definition" aria-live="polite" aria-busy={remote.loading}>
    <h3>{word}</h3>
    {remote.loading ? <p role="status">{t('loading')}</p> : remote.error
      ? <div role="alert"><p>{t('error_load')}</p><button className="btn btn-outline" onClick={remote.reload}>{t('retry')}</button></div>
      : entries.length ? entries.map(entry => <article key={entry.id}>
        <p>{entry.meaning}</p>{entry.example && <blockquote>{entry.example}</blockquote>}
        <small>{t('reading_source')}: {entry.source}</small>
      </article>) : <p>{t('reading_word_missing')}</p>}
    <Link className="meros-text-link" to={`/words?search=${encodeURIComponent(word)}`}>{t('reading_dictionary')} →</Link>
  </div>
}

export default function ParallelReading({ monument }) {
  const { t } = useApp()
  const [active, setActive] = useState(null)
  const [selection, setSelection] = useState(null)
  const reading = monument.reading || { alignment: 'unavailable', lines: [] }
  const select = (word, position) => { setActive(position); setSelection({ word, position }) }
  const columns = [
    ['original', t('modal_text')], ['transliteration', t('modal_transliteration')], ['translation', t('modal_translation')],
  ]
  return <section className="parallel-reading" aria-label={t('reading_title')}>
    <p className={`reading-notice ${reading.alignment}`}>
      {t(reading.alignment === 'editorial' ? 'reading_editorial' : reading.alignment === 'automatic' ? 'reading_automatic' : 'reading_unavailable')}
    </p>
    <div className="reading-layout">
      <aside className="reading-lexicon">
        <div className="reading-lexicon-heading"><h3>{t('reading_word_title')}</h3>{selection && <button type="button" className="btn btn-ghost" onClick={() => setSelection(null)} aria-label={t('modal_close')}>×</button>}</div>
        {selection ? <WordExplanation key={selection.word} word={selection.word} /> : <p>{t('reading_word_hint')}</p>}
      </aside>
      <div className="reading-lines">
        {reading.lines.length ? reading.lines.map(line => <article key={line.id || `auto-${line.position}`}
          className={`reading-line${active === line.position ? ' is-active' : ''}`}>
          <button type="button" className="reading-line-label" aria-pressed={active === line.position}
            onClick={() => setActive(line.position)}>{t('reading_line')} {line.label || line.position}</button>
          <div className="reading-columns">{columns.map(([field, label]) => <div key={field} className={`reading-cell ${field}`}>
            <h4>{label}</h4><div dir="auto">{field === 'original' ? line[field] || '—'
              : <WordText text={line[field]} selected={selection?.position === line.position ? selection.word : null} onSelect={word => select(word, line.position)} />}</div>
          </div>)}</div>
          {line.source && <p className="reading-line-source">{t('reading_source')}: {line.source}</p>}
        </article>) : <div className="reading-columns reading-unaligned">{columns.map(([field, label]) => <div key={field} className="reading-cell">
          <h4>{label}</h4><div dir="auto">{field === 'original' ? monument.full_text || '—'
            : <WordText text={monument[field]} selected={selection?.word} onSelect={word => select(word, null)} />}</div>
        </div>)}</div>}
      </div>
    </div>
  </section>
}
