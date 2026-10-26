import { Link } from 'react-router-dom'
import { useCopy } from '../mvp/copy'
import { useApp } from '../context/AppContext'

export default function Footer() {
  const c = useCopy()
  const { user } = useApp()
  return <footer id="site-footer" className="site-footer">
    <div className="container footer-content">
      <div><strong>𐰴 Turkiy Meros</strong><p>{c('Tarixiy matnlar. So‘zlar. Hamjamiyat.', 'Исторические тексты. Слова. Сообщество.', 'Historical texts. Words. Community.')}</p><small>© {new Date().getFullYear()} Turkiy Meros</small></div>
      <div className="footer-account">
        <nav className="footer-account-links" aria-label={c('Hisobga kirish', 'Доступ к аккаунту', 'Account access')}>
          {user ? <Link to="/submit">{c('Manbali taklif yuborish →', 'Предложить материал →', 'Contribute a source →')}</Link> : <>
            <Link className="footer-register" to="/login?mode=register">{c('Ro‘yxatdan o‘tish', 'Регистрация', 'Create an account')} <span aria-hidden="true">↗</span></Link>
            <Link to="/login">{c('Kirish', 'Войти', 'Sign in')} <span aria-hidden="true">→</span></Link>
          </>}
        </nav>
        <p><small>{c('Foydalanish va kirish hodisalari hisobingiz bilan qayd etiladi.', 'События доступа и использования связаны с вашим аккаунтом.', 'Access and usage events are recorded with your account.')}</small></p>
      </div>
    </div>
  </footer>
}
