import { translateMvp as tr } from '../mvp/locale'
import { useMerosLocale } from '../mvp/useLocale'
import { Link } from 'react-router-dom'
import { useSaved } from '../mvp/api'
import { PageHeading } from '../mvp/components'

export default function PersonalLibrary() {
  useMerosLocale()
  const { saved, toggle } = useSaved()
  return <div className="container meros-page"><PageHeading eyebrow={tr("SIZNING MEROS DAFTARINGIZ")} title={tr("Saqlanganlar")}>{tr("Kitob, dars va so‘zlaringiz bir joyda. Bu MVPda saqlanganlar va o‘qish joyi shu brauzerda saqlanadi.")}</PageHeading>
    {saved.length ? <div className="meros-saved-list">{saved.map(item => <article key={item.key}><span className="meros-eyebrow">{tr(item.type)}</span><h2><Link to={item.to}>{item.title} →</Link></h2><button className="btn btn-outline" onClick={() => toggle(item)}>{tr("Olib tashlash")}</button></article>)}</div> : <div className="meros-empty"><span className="empty-symbol" aria-hidden="true">＋</span><h2>{tr("O‘z to‘plamingizni boshlang")}</h2><p>{tr("Kitob yoki dars yonidagi “Saqlash” tugmasini bosing.")}</p><Link className="btn btn-primary" to="/library">{tr("Kitobxonani ochish →")}</Link></div>}
  </div>
}
