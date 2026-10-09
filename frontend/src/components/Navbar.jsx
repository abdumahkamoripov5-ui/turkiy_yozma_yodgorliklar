import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { theme, toggleTheme, lang, changeLang, user, logout, t } = useApp()
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  const links = [
    { to: '/', label: t('nav_home') },
    { to: '/monuments', label: t('nav_monuments') },
    { to: '/timeline', label: t('nav_timeline') },
    { to: '/map', label: t('nav_map') },
    { to: '/scripts', label: t('nav_scripts') },
    { to: '/stats', label: t('nav_stats') },
    { to: '/concordance', label: t('nav_concordance') },
    { to: '/compare', label: t('nav_compare') },
    { to: '/recommended-words', label: t('nav_recommended') },
    { to: '/frequent-words', label: t('nav_frequent') },
    { to: '/submit', label: t('nav_submit') },
    { to: '/about', label: t('nav_about') },
  ]

  return (
    <nav className="navbar-blur" style={{
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:'52px', padding:'0.55rem 1rem' }}>
        <Link to="/" style={{ fontWeight:700, fontSize:'1rem', color:'var(--accent)', letterSpacing:'0.02em' }}>
          𐰴 Turkiy Korpus
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {/* Language switcher */}
          <select value={lang} onChange={e => changeLang(e.target.value)} aria-label="Til / Language"
            style={{ fontSize:'0.8rem', padding:'0.25rem 0.5rem', minHeight:'32px' }}>
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="tr">TR</option>
          </select>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding:'0.35rem 0.5rem', fontSize:'1.1rem' }}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Auth */}
          {user ? (
            <button onClick={logout} className="btn btn-outline" style={{ fontSize:'0.8rem', padding:'0.35rem 0.75rem' }}>
              {t('nav_logout')}
            </button>
          ) : (
            <Link to="/login" className="btn btn-outline" style={{ fontSize:'0.8rem', padding:'0.35rem 0.75rem' }}>
              {t('nav_login')}
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setOpen(o => !o)} className="btn btn-ghost hamburger"
            aria-label="Menu" aria-expanded={open}
            style={{ fontSize:'1.3rem', padding:'0.25rem 0.5rem' }}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Desktop links — logotip qatoridan pastda, alohida qator */}
      <div className="container nav-links-desktop"
           style={{ display:'flex', gap:'0.25rem', flexWrap:'wrap', justifyContent:'center',
                     padding:'0.5rem 1rem 0.6rem', borderTop:'1px solid var(--border)' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`nav-link${loc.pathname === l.to ? ' active' : ''}`}
            style={{
              color: loc.pathname === l.to ? 'var(--accent)' : 'var(--text2)',
              background: loc.pathname === l.to ? 'rgba(var(--accent-rgb),0.1)' : 'transparent',
            }}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background:'var(--bg2)',
          borderTop:'1px solid var(--border)',
          padding:'0.5rem 1rem',
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
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
