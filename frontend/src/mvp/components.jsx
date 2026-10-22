import { Link } from 'react-router-dom'
import { useSaved } from './api'

export function PageHeading({ eyebrow, title, children }) {
  return <header className="meros-page-heading"><span className="meros-eyebrow">{eyebrow}</span><h1>{title}</h1>{children && <p>{children}</p>}</header>
}

export function RemoteState({ remote, empty, children }) {
  if (remote.loading) return <div className="meros-empty" role="status"><div className="spinner" />Ma’lumotlar yuklanmoqda…</div>
  if (remote.error) return <div className="meros-empty" role="alert"><h2>Hozircha ulana olmadik</h2><p>Server bilan aloqani tekshirib, qayta urinib ko‘ring.</p><button className="btn btn-outline" onClick={remote.reload}>Qayta urinish</button></div>
  if (empty) return <div className="meros-empty"><h2>Hali material topilmadi</h2><p>Boshqa so‘z bilan qidiring yoki keyinroq qayting.</p></div>
  return children
}

export function SaveButton({ item }) {
  const { saved, toggle } = useSaved()
  const active = saved.some(entry => entry.key === item.key)
  return <button className={`meros-save ${active ? 'is-saved' : ''}`} aria-pressed={active} onClick={() => toggle(item)}>
    {active ? '✓ Saqlandi' : '＋ Saqlash'}
  </button>
}

export function BookCard({ book }) {
  return <article className="meros-book-card">
    <Link to={`/library/${book.id}`} className={`meros-book-cover ${book.cover_style}`} aria-label={`${book.title} — o‘qish`}>
      <span className="cover-top">TURKIY MEROS · KITOBXONA</span><span className="cover-mark" aria-hidden="true">𐰃</span>
      <h2>{book.title}</h2><span className="cover-author">{book.author}</span><span className="cover-bottom">{book.page_count} sahifa · {book.language}</span>
    </Link>
    <div className="meros-book-info"><div><span className="meros-meta">{book.is_sample ? 'O‘quv namunasi' : book.period || 'Elektron kitob'}</span><h3><Link to={`/library/${book.id}`}>{book.title}</Link></h3></div>
      <SaveButton item={{ key: `book-${book.id}`, title: book.title, to: `/library/${book.id}`, type: 'Kitob' }} /></div>
  </article>
}

export function LessonCard({ lesson }) {
  return <Link to={`/learn/${lesson.id}`} className={`meros-lesson-card ${lesson.audience}`}>
    <div className="meros-lesson-art"><span className="lesson-age">{lesson.audience === 'children' ? '7–12 yosh' : '12–18 yosh'}</span>
      <span className="lesson-symbol" aria-hidden="true">{lesson.audience === 'children' ? '𐰚' : '𐱅'}</span><span className="lesson-play" aria-hidden="true">{lesson.video ? '▶' : '↗'}</span>
      <span className="lesson-art-label">{lesson.video ? 'Tomosha qilish' : 'Hikoya va topshiriq'}</span></div>
    <div className="meros-lesson-body"><span className="meros-meta">{lesson.series} · {lesson.episode}-qism</span><h2>{lesson.title}</h2><p>{lesson.description}</p>
      {!lesson.video && <span className="meros-meta">Video hali yuklanmagan · matnli dars mavjud</span>}</div>
  </Link>
}

export function Pagination({ data, page, setPage }) {
  if (!data?.next && page === 1) return null
  return <nav className="meros-pagination" aria-label="Sahifalar"><button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>← Oldingi</button><span>{page}-sahifa</span><button className="btn btn-outline" disabled={!data?.next} onClick={() => setPage(page + 1)}>Keyingi →</button></nav>
}
