import { translateMvp as tr } from '../mvp/locale'
import { useMerosLocale } from '../mvp/useLocale'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { items, useRemote } from '../mvp/api'
import { PageHeading, Pagination, RemoteState } from '../mvp/components'
import { useCopy } from '../mvp/copy'
import PreviewNotice from '../components/PreviewNotice'

export default function Words() {
  useMerosLocale()
  const c = useCopy()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('search') || '')
  const [input, setInput] = useState(params.get('search') || '')
  const [page, setPage] = useState(1)
  const remote = useRemote(`/words/?search=${encodeURIComponent(query)}&page=${page}`)
  const words = items(remote.data)
  return <div className="container meros-page"><PageHeading eyebrow={c('SO‘ZNING SAYOHATI', 'ИСТОРИЯ СЛОВА', 'A WORD’S JOURNEY')} title={c('Lug‘at', 'Словарь', 'Dictionary')}>{c('Ma’no, talaffuz, tarixiy satrlar va turkiy muqobillar.', 'Значения, произношение, исторические строки и тюркские соответствия.', 'Meanings, pronunciation, historical lines and Turkic equivalents.')}</PageHeading>
    <PreviewNotice /><form className="meros-search" onSubmit={event => { event.preventDefault(); setQuery(input); setPage(1) }}><span aria-hidden="true">⌕</span><input value={input} onChange={event => setInput(event.target.value)} placeholder={tr("So‘z yoki ma’nosini qidiring…")} aria-label={tr("Lug‘atdan qidirish")} /><button className="btn btn-primary">{tr("Qidirish →")}</button></form>
    <RemoteState remote={remote} empty={!words.length}><div className="meros-words-grid">{words.map(word => <article className="meros-word-card" key={word.id}><div className="meros-section-top"><span className="meros-eyebrow">{word.status === 'community' ? tr("JAMOATCHILIK TANLAGAN") : tr("LUG‘AT BIRLIGI")}</span></div><h2><Link to={`/words/${word.id}`}>{word.word} ↗</Link></h2><p>{word.meaning}</p>{word.example && <blockquote>{word.example}</blockquote>}<small>{tr("Manba:")}{' '}{word.source}</small>{word.monument && <Link className="meros-text-link" to="/monuments">{tr("Yodgorliklar korpusiga o‘tish →")}</Link>}</article>)}</div><Pagination data={remote.data} page={page} setPage={setPage} /></RemoteState>
  </div>
}
