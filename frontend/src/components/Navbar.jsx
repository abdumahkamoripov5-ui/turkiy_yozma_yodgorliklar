import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, X, Moon, Sun, Globe2, BookOpen, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useCopy } from '../mvp/copy'

export default function Navbar() {
  const { theme, toggleTheme, lang, changeLang, user, logout } = useApp()
  const c = useCopy()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname, location.search])
  useEffect(() => { const close = e => { if (e.key === 'Escape') setOpen(false) }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [])
  const links = [
    ['/monuments', c('Yodgorliklar', 'Памятники', 'Monuments')],
    ['/corpus', c('Korpus qidiruvi', 'Поиск в корпусе', 'Corpus search')],
    ['/words', c('Lug‘at', 'Словарь', 'Dictionary')],
    ['/map', c('Xarita', 'Карта', 'Atlas')],
    ['/tools', c('Tadqiqot', 'Исследования', 'Research')],
  ]
  return <>
    <a href="#main-content" className="skip-link">{c('Asosiy mazmunga o‘tish', 'Перейти к содержимому', 'Skip to content')}</a>
    <div className="scholar-topline"><div className="container"><span><span className="status-dot" />{c('VII–VIII ASRLARDAGI TURKIY YOZMA YODGORLIKLAR', 'ТЮРКСКИЕ ПИСЬМЕННЫЕ ПАМЯТНИКИ VII–VIII ВЕКОВ', 'TURKIC WRITTEN MONUMENTS OF THE 7TH–8TH CENTURIES')}</span><Link to="/guide">{c('Foydalanish qo‘llanmasi', 'Руководство', 'Corpus guide')} <ArrowUpRight size={12} /></Link></div></div>
    <header className="scholar-header"><div className="container scholar-nav">
      <Link to="/" className="scholar-brand" aria-label="Turkiy Meros"><span className="scholar-mark" aria-hidden="true">𐱅</span><span>Turkiy Meros<small>{c('TURKIY YOZMA YODGORLIKLAR KORPUSI', 'КОРПУС ТЮРКСКИХ ПАМЯТНИКОВ', 'CORPUS OF TURKIC WRITTEN MONUMENTS')}</small></span></Link>
      <nav className="scholar-desktop" aria-label={c('Asosiy menyu', 'Главное меню', 'Main navigation')}>{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      <div className="scholar-controls"><label className="scholar-language"><Globe2 size={15} /><select data-language-select value={lang} onChange={e => changeLang(e.target.value)} aria-label="Til / Язык / Language"><option value="uz">UZ</option><option value="ru">RU</option><option value="en">EN</option></select></label><button className="scholar-icon-button" onClick={toggleTheme} aria-label={c('Rang rejimini almashtirish', 'Изменить тему', 'Toggle colour theme')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>{user ? <Link to="/saved" className="scholar-account scholar-account-user" aria-label={c('Daftarim', 'Мои записи', 'Notebook')}><BookOpen size={16} /><span>{c('Daftarim', 'Мои записи', 'Notebook')}</span></Link> : <Link to="/login" className="scholar-account"><span>{c('Kirish', 'Войти', 'Sign in')}</span><ArrowUpRight size={16} /></Link>}{user && <button className="scholar-icon-button scholar-logout" onClick={logout} aria-label={c('Hisobdan chiqish', 'Выйти из аккаунта', 'Sign out')} title={c('Chiqish', 'Выйти', 'Sign out')}><LogOut size={16}/></button>}<button className="scholar-mobile-toggle scholar-icon-button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={c('Menyu', 'Меню', 'Menu')} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
    </div>{open && <nav id="mobile-navigation" className="scholar-mobile" aria-label={c('Mobil menyu', 'Мобильное меню', 'Mobile navigation')}>{links.map(([to, label]) => <NavLink key={to} to={to}>{label}<ArrowUpRight size={16} /></NavLink>)}<Link to="/timeline">{c('Vaqt shkalasi', 'Хронология', 'Timeline')}</Link><Link to="/sources">{c('Manbalar', 'Источники', 'Sources')}</Link>{user && <button onClick={logout}>{c('Chiqish', 'Выйти', 'Sign out')}</button>}</nav>}</header>
  </>
}
