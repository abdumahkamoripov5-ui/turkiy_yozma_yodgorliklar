import { translateMvp as tr } from '../mvp/locale'
import { useMerosLocale } from '../mvp/useLocale'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { items, useRemote } from '../mvp/api'
import { BookCard, PageHeading, Pagination, RemoteState } from '../mvp/components'

export default function Library() {
  useMerosLocale()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [input, setInput] = useState(query)
  const page = Math.max(1, Number(params.get('page')) || 1)
  const remote = useRemote(`/books/?search=${encodeURIComponent(query)}&page=${page}`)
  const books = items(remote.data)
  return <div className="container meros-page">
    <PageHeading eyebrow={tr("O‘QING. IZLANING. KASHF ETING.")} title={tr("Ochiq kitobxona")}>{tr("Turkiy yozma merosga yaqinroq bo‘ling. Kitobni oching, varaqlang va o‘qishni davom ettiring.")}</PageHeading>
    <form className="meros-search" onSubmit={event => { event.preventDefault(); setParams(input ? { q: input } : {}) }}>
      <span aria-hidden="true">⌕</span><input aria-label={tr("Kitob qidirish")} placeholder={tr("Kitob nomi yoki muallif…")} value={input} onChange={event => setInput(event.target.value)} /><button className="btn btn-primary">{tr("Qidirish →")}</button>
    </form>
    <div className="meros-section-top"><p>{remote.data?.count ?? books.length}{' '}{tr("ta kitob")}</p><span className="meros-meta">{tr("Ochiq va bepul")}</span></div>
    <RemoteState remote={remote} empty={!books.length}><div className="meros-books-grid">{books.map(book => <BookCard key={book.id} book={book} />)}</div><Pagination data={remote.data} page={page} setPage={value => setParams({ q: query, page: value })} /></RemoteState>
  </div>
}
