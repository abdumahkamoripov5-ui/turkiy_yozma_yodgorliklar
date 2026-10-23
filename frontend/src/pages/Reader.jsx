import { translateMvp as tr } from '../mvp/locale'
import { useMerosLocale } from '../mvp/useLocale'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { stored, useRemote } from '../mvp/api'
import { RemoteState, SaveButton } from '../mvp/components'

export default function Reader() {
  useMerosLocale()
  const { id } = useParams()
  const remote = useRemote(`/books/${id}/`)
  return <div className="container meros-page"><RemoteState remote={remote}>
    {remote.data && <BookReader key={id} book={remote.data} />}
  </RemoteState></div>
}

function BookReader({ book }) {
  useMerosLocale()
  const pageKey = `meros-book-page-${book.id}`
  const [page, setPage] = useState(() => Math.max(0, Math.min(Number(stored(pageKey, 0)) || 0, book.pages.length - 1)))
  const [size, setSize] = useState(19)
  const [mode, setMode] = useState('book')
  const [search, setSearch] = useState('')
  const [note, setNote] = useState(() => stored(`meros-note-${book.id}`, ''))
  const [notice, setNotice] = useState('')
  const current = book.pages[page]
  useEffect(() => { localStorage.setItem(pageKey, JSON.stringify(page)) }, [page, pageKey])
  const matches = search.trim() ? book.pages.map((entry, index) => ({ ...entry, index })).filter(entry =>
    `${entry.title} ${entry.text}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())) : []
  return <>
    <Link to="/library" className="meros-back">{tr("← Kitobxonaga qaytish")}</Link>
    <div className="meros-reader-title"><div><span className="meros-eyebrow">{book.author}</span><h1>{book.title}</h1></div><SaveButton item={{ key: `book-${book.id}`, title: book.title, to: `/library/${book.id}`, type: 'Kitob' }} /></div>
    {book.is_sample && <p className="meros-notice">{tr("O‘quv namunasi ·")}{' '}{book.source}</p>}
    <div className="meros-reader-toolbar"><label>{tr("Ko‘rinish")}{' '}<select value={mode} onChange={event => setMode(event.target.value)}><option value="book">{tr("Varaqlanadigan kitob")}</option><option value="flow">{tr("Qulay o‘qish")}</option></select></label><label>{tr("Matn")}{' '}<select value={size} onChange={event => setSize(Number(event.target.value))}><option value={17}>{tr("Kichik")}</option><option value={19}>{tr("O‘rta")}</option><option value={23}>{tr("Katta")}</option></select></label><span className="meros-meta">{tr("O‘qish joyi shu qurilmada saqlanadi")}</span></div>
    <div className="meros-reader-layout"><aside className="meros-reader-sidebar"><h2>{tr("Mundarija")}</h2>{book.pages.map((entry, index) => <button key={index} className={page === index ? 'active' : ''} onClick={() => setPage(index)} aria-current={page === index ? 'page' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{entry.title}</button>)}
      <label className="meros-field">{tr("Kitobdan qidirish")}<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={tr("So‘z kiriting…")} /></label>
      {search && <div aria-live="polite">{matches.length ? matches.map(entry => <button key={entry.index} onClick={() => setPage(entry.index)}>{entry.index + 1}{tr("-sahifa ·")}{' '}{entry.title}</button>) : <p className="meros-meta">{tr("Mos sahifa topilmadi")}</p>}</div>}
    </aside><div>
      {current ? <article key={`${page}-${mode}`} className={`meros-reader-paper ${mode}`} style={{ fontSize: size }}><span className="paper-running">{tr("TURKIY MEROS /")}{' '}{book.title}</span><span className="paper-chapter">{String(page + 1).padStart(2, '0')}</span><h2>{current.title}</h2>{current.text.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}<span className="paper-number">{page + 1}</span></article> : <div className="meros-empty">{tr("Bu kitobga hali sahifalar yuklanmagan.")}</div>}
      <nav className="meros-pagination" aria-label={tr("Kitob sahifalari")}><button className="btn btn-outline" disabled={page === 0} onClick={() => setPage(value => value - 1)}>{tr("← Oldingi varoq")}</button><span>{book.pages.length ? page + 1 : 0} / {book.pages.length}</span><button className="btn btn-primary" disabled={page >= book.pages.length - 1} onClick={() => setPage(value => value + 1)}>{tr("Keyingi varoq →")}</button></nav>
      <details className="meros-note"><summary>{tr("Shaxsiy qayd qoldirish")}</summary><label className="meros-field">{tr("Qaydlaringiz")}<textarea value={note} onChange={event => setNote(event.target.value)} rows={4} maxLength={5000} /></label><button className="btn btn-outline" onClick={() => { localStorage.setItem(`meros-note-${book.id}`, JSON.stringify(note)); setNotice(tr("Qayd shu qurilmada saqlandi.")) }}>{tr("Qaydni saqlash")}</button><p role="status">{notice}</p></details>
    </div></div>
  </>
}
