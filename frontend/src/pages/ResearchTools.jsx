import { Link } from 'react-router-dom'
import { PageHeading } from '../mvp/components'

const tools = [
  ['/concordance', '⌕', 'Kontekstli qidiruv', 'So‘zlarni asl matn, transliteratsiya va tarjimadan konteksti bilan toping.'],
  ['/compare', '⇄', 'Matnlarni taqqoslash', 'Ikki yodgorlik matnini yonma-yon solishtiring.'],
  ['/map', '◎', 'Meros xaritasi', 'Yodgorliklarning geografiyasi bilan tanishing.'],
  ['/timeline', '↔', 'Vaqt chizig‘i', 'Yozma merosni davrlar ketma-ketligida ko‘ring.'],
  ['/scripts', '𐰚', 'Yozuv tizimlari', 'Yodgorliklardagi yozuv turlari bilan tanishing.'],
  ['/bibliography', '▤', 'Bibliografiya', 'Nashrlar, mualliflar va ilmiy manbalarni izlang.'],
  ['/stats', '◴', 'Korpus statistikasi', 'Bazadagi materiallar taqsimotini ko‘ring.'],
  ['/frequent-words', '≋', 'So‘zlar chastotasi', 'Korpusda ko‘p qo‘llangan so‘zlarni o‘rganing.'],
  ['/submit', '＋', 'Yodgorlik taklif qilish', 'Yangi materialni admin tekshiruviga yuboring.'],
]
export default function ResearchTools() {
  return <div className="container meros-page"><PageHeading eyebrow="ILMIY IZLANISH UCHUN" title="Tadqiqot vositalari">Demodagi foydali korpus imkoniyatlari bir joyda.</PageHeading><div className="meros-paths">{tools.map(([to, icon, title, text]) => <Link className="meros-path" to={to} key={to}><span className="path-symbol" aria-hidden="true">{icon}</span><h2>{title}</h2><p>{text}</p></Link>)}</div></div>
}
