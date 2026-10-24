import { Link } from 'react-router-dom'
import { useSaved } from '../mvp/api'
import { PageHeading } from '../mvp/components'
import { useCopy } from '../mvp/copy'

export default function PersonalLibrary() {
  const c = useCopy()
  const { saved, toggle } = useSaved()
  return <div className="container meros-page"><PageHeading eyebrow={c('MEROS DAFTARINGIZ', 'ВАША ТЕТРАДЬ НАСЛЕДИЯ', 'YOUR HERITAGE NOTEBOOK')} title={c('Saqlanganlar', 'Сохранённое', 'Saved items')}>{c('Tanlangan so‘zlaringiz shu hisob uchun ushbu brauzerda saqlanadi. Qurilmalararo sinxronlash hali ulanmagan.', 'Выбранные слова сохраняются для этого аккаунта в этом браузере. Синхронизация устройств пока не подключена.', 'Selected words are saved for this account in this browser. Cross-device sync is not connected yet.')}</PageHeading>
    {saved.length ? <div className="meros-saved-list">{saved.map(item => <article key={item.key}><h2><Link to={item.to}>{item.title} →</Link></h2><button className="btn btn-outline" onClick={() => toggle(item)}>{c('Olib tashlash', 'Удалить', 'Remove')}</button></article>)}</div> : <div className="meros-empty"><span className="empty-symbol" aria-hidden="true">＋</span><h2>{c('O‘z to‘plamingizni boshlang', 'Начните свою коллекцию', 'Start your collection')}</h2><p>{c('Lug‘at maqolasidagi “Saqlash” tugmasini bosing.', 'Нажмите «Сохранить» в словарной статье.', 'Use the Save button on a dictionary article.')}</p><Link className="btn btn-primary" to="/words">{c('Lug‘atni ochish →', 'Открыть словарь →', 'Open dictionary →')}</Link></div>}
  </div>
}
