import { translateMvp as tr } from './locale'
import { useMerosLocale } from './useLocale'
import { Link, useLocation } from 'react-router-dom'
import { useSaved } from './api'
import { useApp } from '../context/AppContext'
import { useCopy } from './copy'
import { useState } from 'react'

export function PageHeading({ eyebrow, title, children }) {
  useMerosLocale()
  return <header className="meros-page-heading"><span className="meros-eyebrow">{eyebrow}</span><h1>{title}</h1>{children && <p>{children}</p>}</header>
}

export function RemoteState({ remote, empty, children }) {
  useMerosLocale()
  if (remote.loading) return <div className="meros-empty" role="status"><div className="spinner" />{tr("Ma’lumotlar yuklanmoqda…")}</div>
  if (remote.error) return <div className="meros-empty" role="alert"><h2>{tr("Hozircha ulana olmadik")}</h2><p>{remote.message || tr("Server bilan aloqani tekshirib, qayta urinib ko‘ring.")}</p><button className="btn btn-outline" onClick={remote.reload}>{tr("Qayta urinish")}</button></div>
  if (empty) return <div className="meros-empty"><h2>{tr("Hali material topilmadi")}</h2><p>{tr("Boshqa so‘z bilan qidiring yoki keyinroq qayting.")}</p></div>
  return children
}

export function SaveButton({ item }) {
  useMerosLocale()
  const { user } = useApp()
  const c = useCopy()
  const location = useLocation()
  const { saved, toggle, loading } = useSaved()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const active = saved.some(entry => entry.key === item.key)
  if (!user) return <Link className="meros-text-link" to={`/login?mode=register&next=${encodeURIComponent(location.pathname + location.search + location.hash)}`}>{c('Saqlash uchun qo‘shiling', 'Войдите, чтобы сохранить', 'Join to save')}</Link>
  return <span><button type="button" className={`meros-save ${active ? 'is-saved' : ''}`} disabled={busy || loading} aria-pressed={active} onClick={async () => {
    setBusy(true); setFailed(false)
    try { await toggle(item) } catch { setFailed(true) } finally { setBusy(false) }
  }}>
    {active ? tr("✓ Saqlandi") : tr("＋ Saqlash")}
  </button>{failed && <small role="alert">{c('Saqlanmadi. Qayta urinib ko‘ring.', 'Не сохранено. Повторите попытку.', 'Not saved. Try again.')}</small>}</span>
}

export function BookCard({ book }) {
  useMerosLocale()
  return <article className="meros-book-card">
    <Link to={`/library/${book.id}`} className={`meros-book-cover ${book.cover_style}`} aria-label={`${book.title} — ${tr('o‘qish')}`}>
      <span className="cover-top">{tr("TURKIY MEROS · KITOBXONA")}</span><span className="cover-mark" aria-hidden="true">𐰃</span>
      <h2>{book.title}</h2><span className="cover-author">{book.author}</span><span className="cover-bottom">{book.page_count}{' '}{tr("sahifa ·")}{' '}{book.language}</span>
    </Link>
    <div className="meros-book-info"><div><span className="meros-meta">{book.is_sample ? tr("O‘quv namunasi") : book.period || tr("Elektron kitob")}</span><h3><Link to={`/library/${book.id}`}>{book.title}</Link></h3></div>
      <SaveButton item={{ key: `book-${book.id}`, title: book.title, to: `/library/${book.id}`, type: 'Kitob' }} /></div>
  </article>
}

export function LessonCard({ lesson }) {
  useMerosLocale()
  return <Link to={`/learn/${lesson.id}`} className={`meros-lesson-card ${lesson.audience}`}>
    <div className="meros-lesson-art"><span className="lesson-age">{lesson.audience === 'children' ? tr("7–12 yosh") : tr("12–18 yosh")}</span>
      <span className="lesson-symbol" aria-hidden="true">{lesson.audience === 'children' ? '𐰚' : '𐱅'}</span><span className="lesson-play" aria-hidden="true">{lesson.video ? '▶' : '↗'}</span>
      <span className="lesson-art-label">{lesson.video ? tr("Tomosha qilish") : tr("Hikoya va topshiriq")}</span></div>
    <div className="meros-lesson-body"><span className="meros-meta">{lesson.series} · {lesson.episode}{tr("-qism")}</span><h2>{lesson.title}</h2><p>{lesson.description}</p>
      {!lesson.video && <span className="meros-meta">{tr("Video hali yuklanmagan · matnli dars mavjud")}</span>}</div>
  </Link>
}

export function Pagination({ data, page, setPage }) {
  useMerosLocale()
  if (!data?.next && page === 1) return null
  return <nav className="meros-pagination" aria-label={tr("Sahifalar")}><button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>{tr("← Oldingi")}</button><span>{page}{tr("-sahifa")}</span><button className="btn btn-outline" disabled={!data?.next} onClick={() => setPage(page + 1)}>{tr("Keyingi →")}</button></nav>
}
