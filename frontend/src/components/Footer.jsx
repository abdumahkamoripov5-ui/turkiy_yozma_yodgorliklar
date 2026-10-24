import { Link } from 'react-router-dom'
import { useCopy } from '../mvp/copy'
import { useApp } from '../context/AppContext'

export default function Footer() {
  const c = useCopy()
  const { user } = useApp()
  return <footer className="site-footer"><div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}><div><strong>𐰴 Turkiy Meros</strong><p>{c('Tarixiy matnlar. So‘zlar. Hamjamiyat.', 'Исторические тексты. Слова. Сообщество.', 'Historical texts. Words. Community.')}</p><small>© {new Date().getFullYear()} Turkiy Meros</small></div><div><Link to={user ? '/submit' : '/login?mode=register'}>{user ? c('Manbali taklif yuborish →', 'Предложить материал →', 'Contribute a source →') : c('Bepul hisob ochish →', 'Создать бесплатный аккаунт →', 'Create a free account →')}</Link><p><small>{c('Foydalanish va kirish hodisalari hisobingiz bilan qayd etiladi.', 'События доступа и использования связаны с вашим аккаунтом.', 'Access and usage events are recorded with your account.')}</small></p></div></div></footer>
}
