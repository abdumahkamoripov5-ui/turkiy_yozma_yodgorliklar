import { translateMvp as tr } from '../mvp/locale'
import { useMerosLocale } from '../mvp/useLocale'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCopy } from '../mvp/copy'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  useMerosLocale()
  const { theme, toggleTheme, lang, changeLang, user, logout, t } = useApp()
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  const c = useCopy()
  const links = user ? [
    { to: '/', label: t('nav_home') },
    { to: '/corpus', label: c('Korpus qidiruvi', 'Поиск в корпусе', 'Corpus search') },
    { to: '/monuments', label: t('nav_monuments') },
    { to: '/words', label: c('Lug‘at', 'Словарь', 'Dictionary') },
    { to: '/tools', label: c('Tadqiqot vositalari', 'Инструменты', 'Research tools') },
    { to: '/polls', label: c('Hamjamiyat', 'Сообщество', 'Community') },
    { to: '/saved', label: c('Tadqiqot daftari', 'Тетрадь', 'Notebook') },
  ] : []

  return (
    <nav className="navbar-blur" style={{
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:'52px', padding:'0.55rem 1rem' }}>
        <Link to="/" className="meros-brand" aria-label={tr("Turkiy Meros — bosh sahifa")}>
          <span className="brand-symbol" aria-hidden="true">𐰴</span><span>Turkiy Meros<small>{tr("RAQAMLI XAZINA")}</small></span>
        </Link>

        <div className="nav-controls" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {/* Language switcher */}
          <select data-language-select value={lang} onChange={e => changeLang(e.target.value)} aria-label={tr("Til / Language")}
            style={{ fontSize:'0.8rem', padding:'0.25rem 0.5rem', minHeight:'32px' }}>
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="tr">TR · Türkçe</option>
          </select>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding:'0.35rem 0.5rem', fontSize:'1.1rem' }}
            title={theme === 'dark' ? tr("Light mode") : tr("Dark mode")}
            aria-label={theme === 'dark' ? tr("Light mode") : tr("Dark mode")}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Auth */}
          {user?.is_staff && <a href="/django-admin/" className="btn btn-ghost nav-staff" style={{ fontSize:'0.8rem' }}>{tr("Boshqaruv ↗")}</a>}
          {user ? (
            <button onClick={logout} className="btn btn-outline" style={{ fontSize:'0.8rem', padding:'0.35rem 0.75rem' }}>
              {t('nav_logout')}
            </button>
          ) : (
            <Link to="/login?mode=register" className="btn btn-outline" style={{ fontSize:'0.8rem', padding:'0.35rem 0.75rem' }}>
              {c('Bepul qo‘shilish', 'Присоединиться', 'Join for free')}
            </Link>
          )}

          {/* Hamburger */}
          {links.length > 0 && <button onClick={() => setOpen(o => !o)} className="btn btn-ghost hamburger"
            aria-label={tr("Menu")} aria-expanded={open}
            style={{ fontSize:'1.3rem', padding:'0.25rem 0.5rem' }}>
            {open ? '✕' : '☰'}
          </button>}
        </div>
      </div>

      {/* Desktop links — logotip qatoridan pastda, alohida qator */}
      {links.length > 0 && <div className="container nav-links-desktop"
           style={{ display:'flex', gap:'0.25rem', flexWrap:'wrap', justifyContent:'center',
                     padding:'0.5rem 1rem 0.6rem', borderTop:'1px solid var(--border)' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} aria-current={loc.pathname === l.to ? 'page' : undefined}
            className={`nav-link${loc.pathname === l.to ? ' active' : ''}`}
            style={{
              color: loc.pathname === l.to ? 'var(--accent)' : 'var(--text2)',
              background: loc.pathname === l.to ? 'rgba(var(--accent-rgb),0.1)' : 'transparent',
            }}>
            {l.label}
          </Link>
        ))}
      </div>}

      {/* Mobile menu */}
      {open && links.length > 0 && (
        <div style={{
          background:'var(--bg2)',
          borderTop:'1px solid var(--border)',
          padding:'0.5rem 1rem',
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} aria-current={loc.pathname === l.to ? 'page' : undefined}
              onClick={() => setOpen(false)}
              style={{
                display:'block',
                padding:'0.65rem 0',
                borderBottom:'1px solid var(--border)',
                color: loc.pathname === l.to ? 'var(--accent)' : 'var(--text)',
                fontSize:'0.95rem',
              }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .hamburger { display: none; }
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
