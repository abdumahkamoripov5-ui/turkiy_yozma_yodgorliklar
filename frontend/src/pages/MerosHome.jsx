import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRemote, items } from '../mvp/api'
import { BookCard, LessonCard, RemoteState } from '../mvp/components'
import MonumentCard from '../components/MonumentCard'
import MonumentModal from '../components/MonumentModal'

const paths = [
  { number: '01', to: '/monuments', title: 'Yozma merosni kashf eting', text: 'Yodgorliklar, asl bitiklar, tarjimalar va tadqiqotlar.', icon: '𐱅', color: 'green' },
  { number: '02', to: '/learn', title: 'Hikoyalar bilan o‘rganing', text: '7–12 yosh uchun multfilmlar, 12–18 yosh uchun anime va topshiriqlar.', icon: '✳', color: 'orange' },
  { number: '03', to: '/library', title: 'Bir kitobdan boshlang', text: 'Ochiq to‘plamlar, varaqlanadigan kitoblar va shaxsiy qaydlar.', icon: '▤', color: 'blue' },
]

export default function MerosHome() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const featured = useRemote('/monuments/featured/')
  const books = useRemote('/books/?page_size=3')
  const lessons = useRemote('/lessons/?page_size=2')
  const stats = useRemote('/monuments/stats/')
  return <div className="meros-home">
    <section className="meros-hero"><div className="container meros-hero-grid"><div className="meros-hero-copy"><span className="meros-eyebrow">ILDIZLARIMIZDAN KELAJAKKA</span><h1>Ming yillik so‘z.<br /><em>Yangi kashfiyotlar.</em></h1><p>Barcha turkiy xalqlarning yozma merosi bir makonda. O‘qing, tomosha qiling, o‘rganing va o‘z hissangizni qo‘shing.</p>
      <form className="meros-search" onSubmit={event => { event.preventDefault(); navigate(`/monuments?search=${encodeURIComponent(query)}`) }}><span aria-hidden="true">⌕</span><input aria-label="Yodgorliklarni qidirish" placeholder="Yodgorlik nomini qidiring…" value={query} onChange={event => setQuery(event.target.value)} /><button className="btn btn-primary">Izlash →</button></form>
      <div className="meros-hero-links"><Link to="/words">So‘zlar xazinasi ↗</Link><span>·</span><Link to="/map">Meros xaritasi ↗</Link></div>
    </div><div className="meros-manuscript" aria-label="Turkiy yozma merosning dekorativ tasviri"><div className="manuscript-orbit" /><span className="manuscript-label">TOSHGA BITILGAN XOTIRA</span><div className="manuscript-slab"><span>𐱅𐰇𐰼𐰚</span><span>𐰉𐰃𐱅𐰃𐰏</span><span>𐰋𐰃𐰠𐰏𐰀</span><div className="slab-lines" /></div><div className="manuscript-caption"><span className="caption-mark">𐰃</span><div><strong>Har bir bitik — bir hikoya</strong><span>O‘tmishni o‘qiymiz. Kelajakni boyitamiz.</span></div></div></div></div></section>
    <div className="meros-stats-strip"><div className="container">{stats.data && <span><strong>{stats.data.total}</strong> demo yodgorlik</span>}{books.data && <span><strong>{books.data.count}</strong> o‘quv kitobi</span>}<span>Ochiq bilim</span><span>Barcha turkiy xalqlar merosi</span><span>O‘zbekcha interfeys</span></div></div>
    <section className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">SIZ QAYERDAN BOSHLAYSIZ?</span><h2>Merosga uch yo‘l</h2></div><p>Har bir yosh va har bir qiziqish uchun.</p></div><div className="meros-paths">{paths.map(path => <Link className={`meros-path ${path.color}`} to={path.to} key={path.to}><div className="path-top"><span>{path.number}</span><span aria-hidden="true">↗</span></div><span className="path-symbol" aria-hidden="true">{path.icon}</span><h3>{path.title}</h3><p>{path.text}</p></Link>)}</div></section>
    <section className="meros-library-band"><div className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">BIR VAROQDAN BOSHLANADI</span><h2>Bugun nimani o‘qiymiz?</h2></div><Link className="meros-text-link" to="/library">Barcha kitoblar →</Link></div><RemoteState remote={books} empty={!items(books.data).length}><div className="meros-books-grid">{items(books.data).map(book => <BookCard key={book.id} book={book} />)}</div></RemoteState></div></section>
    <section className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">QIZIQISH BILIMGA AYLANADI</span><h2>Yosh kashfiyotchilar uchun</h2></div><Link className="meros-text-link" to="/learn">O‘rganish bo‘limi →</Link></div><RemoteState remote={lessons} empty={!items(lessons.data).length}><div className="meros-lessons-grid">{items(lessons.data).map(lesson => <LessonCard key={lesson.id} lesson={lesson} />)}</div></RemoteState></section>
    <section className="container meros-section meros-feature-banner"><div><span className="meros-eyebrow">SO‘ZNING ERTASI SIZ BILAN</span><h2>Tilimizni birga boyitamiz.</h2><p>Variantlar bilan tanishing, dalillarni o‘qing va o‘zingiz ma’qul ko‘rgan so‘zga ovoz bering.</p><Link to="/polls" className="btn btn-primary">Ovoz berishda qatnashish →</Link></div><span className="banner-rune" aria-hidden="true">𐰋</span></section>
    <section className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">MANBALARGA QAYTAMIZ</span><h2>Yozma merosdan saralar</h2></div><Link className="meros-text-link" to="/monuments">Barcha yodgorliklar →</Link></div><RemoteState remote={featured} empty={!items(featured.data).length}><div className="grid grid-2">{items(featured.data).slice(0, 4).map(monument => <MonumentCard key={monument.id} monument={monument} onClick={setSelected} />)}</div></RemoteState></section>
    <section className="container meros-collaborate"><div><span className="meros-eyebrow">TADQIQOTCHILAR VA O‘QITUVCHILARGA</span><h2>Bilimingizni ulashing.</h2><p>Ilmiy ishlaringiz, tadqiqotlaringiz va darslaringiz yangi o‘quvchilarini topsin.</p></div><Link to="/research" className="btn btn-outline">Ilmiy hamkorlik →</Link></section>
    {selected && <MonumentModal monument={selected} onClose={() => setSelected(null)} />}
  </div>
}
