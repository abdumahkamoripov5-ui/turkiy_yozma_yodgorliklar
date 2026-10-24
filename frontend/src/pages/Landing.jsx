import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useCopy } from '../mvp/copy'

export default function Landing() {
  const c = useCopy()
  const { user } = useApp()
  const features = [
    ['01', c('Asl matndan boshlang', 'Начните с оригинала', 'Start with the original'), c('Yodgorliklarni asl yozuv, transliteratsiya va tarjima bilan satrma-satr o‘qing.', 'Читайте памятники построчно: оригинал, транслитерация и перевод.', 'Read inscriptions line by line with original text, transliteration and translation.')],
    ['02', c('So‘zning izini toping', 'Проследите историю слова', 'Follow a word’s history'), c('Lug‘at va konkordans orqali so‘zning ma’nosi va tarixiy kontekstini o‘rganing.', 'Изучайте значения и исторический контекст с помощью словаря и конкорданса.', 'Explore meanings and historical context through the dictionary and concordance.')],
    ['03', c('Bilimni birga boyiting', 'Пополняйте знания вместе', 'Build knowledge together'), c('Manbali taklif yuboring va so‘z muhokamalarida o‘z ovozingizni qo‘shing.', 'Предлагайте материалы с источниками и голосуйте за слова.', 'Contribute sourced material and take part in word polls.')],
  ]
  return <div className="simple-landing">
    <section className="container landing-hero">
      <div><span className="meros-eyebrow">{c('TURKIY MEROS · UMUMIY XAZINAMIZ', 'ТЮРКСКОЕ НАСЛЕДИЕ · ОБЩЕЕ ДОСТОЯНИЕ', 'TURKIY MEROS · OUR SHARED HERITAGE')}</span>
        <h1>{c('Merosni o‘qing.\nMa’noni kashf eting.', 'Читайте наследие.\nОткрывайте смыслы.', 'Read our heritage.\nDiscover its meaning.')}</h1>
        <p>{c('Qadimgi turkiy bitiklar va so‘zlar — bir joyda. Avval meros bilan tanishing. Yoqsa, bepul hisob ochib, izlanishingizni davom ettiring.', 'Древнетюркские тексты и слова в одном месте. Сначала познакомьтесь с наследием, затем создайте бесплатный аккаунт и продолжайте исследование.', 'Ancient Turkic texts and words in one place. Explore the heritage first, then create a free account to take your research further.')}</p>
        <div className="landing-actions"><Link className="btn btn-primary" to="/explore">{c('Merosni kashf eting →', 'Откройте наследие →', 'Explore the heritage →')}</Link><Link className="meros-text-link" to={user ? '/monuments' : '/login?mode=register'}>{user ? c('Korpusni ochish →', 'Открыть корпус →', 'Open the corpus →') : c('Bepul ro‘yxatdan o‘tish →', 'Зарегистрироваться бесплатно →', 'Join for free →')}</Link></div>
        <small>{c('O‘zbek · Русский · English / Asosiy kontentdan foydalanish bepul.', 'O‘zbek · Русский · English / Основной контент бесплатный.', 'O‘zbek · Русский · English / Core content is free.')}</small>
      </div>
      <div className="landing-stone" aria-hidden="true"><span>𐱅𐰇𐰼𐰚</span><span>𐰋𐰃𐱅𐰃𐰏</span><span>𐰃𐰠 · 𐱅𐰃𐰠</span><small>TURKIY MEROS</small></div>
    </section>
    <section id="how-it-works" className="container landing-features"><h2>{c('Qiziqishdan izlanishgacha.', 'От любопытства к исследованию.', 'From curiosity to discovery.')}</h2><div className="meros-paths">{features.map(([number, title, text], index) => <Link className="meros-path" to={['/monuments', '/words', user ? '/polls' : '/login?mode=register&next=/polls'][index]} key={number}><span className="meros-eyebrow">{number}</span><h3>{title} ↗</h3><p>{text}</p></Link>)}</div></section>
    <section className="container landing-community"><span className="meros-eyebrow">{c('SO‘ZNING ERTASI SIZ BILAN', 'БУДУЩЕЕ СЛОВА — С ВАМИ', 'A WORD’S FUTURE STARTS WITH YOU')}</span><h2>{c('Har bir so‘z — umumiy merosimizning bir bo‘lagi.', 'Каждое слово — часть общего наследия.', 'Every word is part of our shared heritage.')}</h2><p>{c('So‘z variantlari bilan tanishing va ovoz bering. Lug‘atga kiritiladigan natijani mutaxassislar tekshiradi.', 'Изучайте варианты и голосуйте. Перед включением в словарь результаты проверяют специалисты.', 'Explore word options and vote. Experts review results before they enter the dictionary.')}</p><Link className="btn btn-outline" to={user ? '/polls' : '/login?mode=register&next=/polls'}>{c('Hamjamiyatga qo‘shilish →', 'Присоединиться →', 'Join the community →')}</Link></section>
  </div>
}
