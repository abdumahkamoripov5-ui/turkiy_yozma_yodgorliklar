import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRemote, items } from '../mvp/api'
import { BookCard, LessonCard, RemoteState } from '../mvp/components'
import MonumentCard from '../components/MonumentCard'
import MonumentModal from '../components/MonumentModal'
import AnimatedNumber from '../components/AnimatedNumber'
import StoneJourney from '../components/StoneJourney'

const paths = [
  { number: '01', to: '/monuments', title: 'Yozma merosni kashf eting', text: 'Yodgorliklar, asl bitiklar, tarjimalar va tadqiqotlar.', icon: '𐱅', color: 'green' },
  { number: '02', to: '/learn', title: 'Hikoyalar bilan o‘rganing', text: '7–12 yosh uchun multfilmlar, 12–18 yosh uchun anime va topshiriqlar.', icon: '✳', color: 'orange' },
  { number: '03', to: '/library', title: 'Bir kitobdan boshlang', text: 'Ochiq to‘plamlar, varaqlanadigan kitoblar va shaxsiy qaydlar.', icon: '▤', color: 'blue' },
]

export default function MerosHome() {
  const [selected, setSelected] = useState(null)
  const featured = useRemote('/monuments/featured/')
  const books = useRemote('/books/?page_size=3')
  const lessons = useRemote('/lessons/?page_size=2')
  const stats = useRemote('/monuments/stats/')
  return <div className="meros-home">
    <StoneJourney monuments={items(featured.data)} onSelect={setSelected} />
    <div className="meros-stats-strip"><div className="container">{stats.data && <div className="meros-stat"><AnimatedNumber value={stats.data.total} /><span>demo yodgorlik</span></div>}{books.data && <div className="meros-stat"><AnimatedNumber value={books.data.count} /><span>o‘quv kitobi</span></div>}<div className="meros-stat"><strong>∞</strong><span>o‘rganish imkoniyati</span></div><div className="stat-mission"><span className="stat-mission-symbol" aria-hidden="true">✳</span><p>Bir meros.<br /><strong>Minglab yangi hikoyalar.</strong></p></div></div></div>
    <section id="discover" className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">01 / O‘Z YO‘LINGIZNI TANLANG</span><h2>Qiziqishdan boshlanadi.</h2></div><p>O‘qing. O‘rganing. O‘z izingizni qoldiring.</p></div><div className="meros-paths">{paths.map(path => <Link className={`meros-path ${path.color}`} to={path.to} key={path.to}><div className="path-top"><span>YO‘NALISH / {path.number}</span><span className="path-arrow" aria-hidden="true">↗</span></div><span className="path-symbol" aria-hidden="true">{path.icon}</span><h3>{path.title}</h3><p>{path.text}</p><span className="path-cta">Kashf etish <span aria-hidden="true">→</span></span></Link>)}</div></section>
    <section className="meros-library-band"><div className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">BIR VAROQDAN BOSHLANADI</span><h2>Bugun nimani o‘qiymiz?</h2></div><Link className="meros-text-link" to="/library">Barcha kitoblar →</Link></div><RemoteState remote={books} empty={!items(books.data).length}><div className="meros-books-grid">{items(books.data).map(book => <BookCard key={book.id} book={book} />)}</div></RemoteState></div></section>
    <section className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">QIZIQISH BILIMGA AYLANADI</span><h2>Yosh kashfiyotchilar uchun</h2></div><Link className="meros-text-link" to="/learn">O‘rganish bo‘limi →</Link></div><RemoteState remote={lessons} empty={!items(lessons.data).length}><div className="meros-lessons-grid">{items(lessons.data).map(lesson => <LessonCard key={lesson.id} lesson={lesson} />)}</div></RemoteState></section>
    <section className="container meros-section meros-feature-banner"><div><span className="meros-eyebrow">SO‘ZNING ERTASI SIZ BILAN</span><h2>Tilimizni birga boyitamiz.</h2><p>Variantlar bilan tanishing, dalillarni o‘qing va o‘zingiz ma’qul ko‘rgan so‘zga ovoz bering.</p><Link to="/polls" className="btn btn-primary">Ovoz berishda qatnashish →</Link></div><span className="banner-rune" aria-hidden="true">𐰋</span></section>
    <section className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">MANBALARGA QAYTAMIZ</span><h2>Yozma merosdan saralar</h2></div><Link className="meros-text-link" to="/monuments">Barcha yodgorliklar →</Link></div><RemoteState remote={featured} empty={!items(featured.data).length}><div className="grid grid-2">{items(featured.data).slice(0, 4).map(monument => <MonumentCard key={monument.id} monument={monument} onClick={setSelected} />)}</div></RemoteState></section>
    <section className="container meros-collaborate"><div><span className="meros-eyebrow">TADQIQOTCHILAR VA O‘QITUVCHILARGA</span><h2>Bilimingizni ulashing.</h2><p>Ilmiy ishlaringiz, tadqiqotlaringiz va darslaringiz yangi o‘quvchilarini topsin.</p></div><Link to="/research" className="btn btn-outline">Ilmiy hamkorlik →</Link></section>
    {selected && <MonumentModal monument={selected} onClose={() => setSelected(null)} />}
  </div>
}
