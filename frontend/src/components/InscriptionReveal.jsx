import { Link } from 'react-router-dom'
import { useCopy } from '../mvp/copy'
import { useApp } from '../context/AppContext'
import detail from '../assets/stones/kultegin-detail.jpg'

export default function InscriptionReveal() {
  const c = useCopy()
  const { user } = useApp()
  return <section id="inscription-view" className="inscription-reveal" aria-labelledby="inscription-title">
    <div className="container inscription-layout">
      <figure className="inscription-photo">
        <img src={detail} width="581" height="525" alt={c('Kultegin bitiktoshidagi asl o‘yma belgilar — muzey fotosurati', 'Подлинные высеченные знаки стелы Кюль-тегина — музейная фотография', 'Original carved signs on the Kül Tigin stele — museum photograph')} loading="lazy" />
        <figcaption>{c('KULTEGIN · ASL FOTOSURAT', 'КЮЛЬ-ТЕГИН · ПОДЛИННОЕ ФОТО', 'KÜL TIGIN · ORIGINAL PHOTOGRAPH')}<span>732</span></figcaption>
      </figure>
      <div className="inscription-copy">
        <span className="meros-eyebrow">{c('04 / BITIKKA YAQINROQ', '04 / БЛИЖЕ К НАДПИСИ', '04 / CLOSER TO THE INSCRIPTION')}</span>
        <h2 id="inscription-title">{c('Har bir chiziqda\nbir ovoz bor.', 'В каждой черте —\nсвой голос.', 'A voice in\nevery line.')}</h2>
        <p>{c('G‘or sayohatidan so‘ng, bitikning o‘ziga qarang. Qarshingizda — Kultegin toshining haqiqiy fotosurati: o‘yma belgilar, yemirilgan sirt va asrlar qoldirgan yoriqlar.', 'После путешествия по пещере взгляните на саму надпись. Перед вами подлинная фотография камня Кюль-тегина: высеченные знаки, выветренная поверхность и трещины, оставленные веками.', 'After the cave journey, look closely at the inscription itself. This is an original photograph of the Kül Tigin stone: carved signs, a weathered surface and fractures left by the centuries.')}</p>
        <Link className="stone-discover-link" to={user ? '/monuments' : '/login?mode=register&next=%2Fmonuments'}>{c('Asl matn va tarjimalar', 'Оригиналы и переводы', 'Original texts and translations')} <span aria-hidden="true">↗</span></Link>
        <a className="inscription-next" href="#site-footer">{c('Hamjamiyatga qo‘shiling', 'Присоединиться к сообществу', 'Join the community')} <span aria-hidden="true">↓</span></a>
      </div>
    </div>
  </section>
}
