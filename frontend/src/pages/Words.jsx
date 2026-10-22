import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { items, useRemote } from '../mvp/api'
import { PageHeading, Pagination, RemoteState, SaveButton } from '../mvp/components'

export default function Words() {
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('search') || '')
  const [input, setInput] = useState(params.get('search') || '')
  const [page, setPage] = useState(1)
  const remote = useRemote(`/words/?search=${encodeURIComponent(query)}&page=${page}`)
  const words = items(remote.data)
  return <div className="container meros-page"><PageHeading eyebrow="SO‘ZNING SAYOHATI" title="So‘zlar xazinasi">Ma’no, qo‘llanish va manba. Har bir so‘zning o‘z hikoyasi bor.</PageHeading>
    <form className="meros-search" onSubmit={event => { event.preventDefault(); setQuery(input); setPage(1) }}><span aria-hidden="true">⌕</span><input value={input} onChange={event => setInput(event.target.value)} placeholder="So‘z yoki ma’nosini qidiring…" aria-label="Lug‘atdan qidirish" /><button className="btn btn-primary">Qidirish →</button></form>
    <RemoteState remote={remote} empty={!words.length}><div className="meros-words-grid">{words.map(word => <article className="meros-word-card" key={word.id}><div className="meros-section-top"><span className="meros-eyebrow">{word.status === 'community' ? 'JAMOATCHILIK TANLAGAN' : 'LUG‘AT BIRLIGI'}</span><SaveButton item={{ key: `word-${word.id}`, title: word.word, to: `/words?search=${encodeURIComponent(word.word)}`, type: 'So‘z' }} /></div><h2>{word.word}</h2><p>{word.meaning}</p>{word.example && <blockquote>{word.example}</blockquote>}<small>Manba: {word.source}</small>{word.monument && <Link className="meros-text-link" to="/monuments">Yodgorliklar korpusiga o‘tish →</Link>}</article>)}</div><Pagination data={remote.data} page={page} setPage={setPage} /></RemoteState>
  </div>
}
