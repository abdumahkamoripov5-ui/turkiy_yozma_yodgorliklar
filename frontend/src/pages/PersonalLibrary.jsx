import { Link } from 'react-router-dom'
import { useSaved } from '../mvp/api'
import { PageHeading } from '../mvp/components'

export default function PersonalLibrary() {
  const { saved, toggle } = useSaved()
  return <div className="container meros-page"><PageHeading eyebrow="SIZNING MEROS DAFTARINGIZ" title="Saqlanganlar">Kitob, dars va so‘zlaringiz bir joyda. Bu MVPda saqlanganlar va o‘qish joyi shu brauzerda saqlanadi.</PageHeading>
    {saved.length ? <div className="meros-saved-list">{saved.map(item => <article key={item.key}><span className="meros-eyebrow">{item.type}</span><h2><Link to={item.to}>{item.title} →</Link></h2><button className="btn btn-outline" onClick={() => toggle(item)}>Olib tashlash</button></article>)}</div> : <div className="meros-empty"><span className="empty-symbol" aria-hidden="true">＋</span><h2>O‘z to‘plamingizni boshlang</h2><p>Kitob yoki dars yonidagi “Saqlash” tugmasini bosing.</p><Link className="btn btn-primary" to="/library">Kitobxonani ochish →</Link></div>}
  </div>
}
