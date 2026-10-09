import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Footer() {
  const { t } = useApp()
  return (
    <footer className="site-footer">
      <div className="container" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1.5rem' }}>
        <div>
          <div style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--accent)', marginBottom:'0.75rem' }}>
            𐰴 Turkiy Korpus
          </div>
          <p style={{ fontSize:'0.85rem', color:'var(--text2)', lineHeight:1.5 }}>
            Turkiy yozma yodgorliklar elektron korpusi
          </p>
        </div>
        <div>
          <div style={{ fontWeight:600, marginBottom:'0.75rem', fontSize:'0.9rem' }}>{t('footer_pages')}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            {[
              ['/monuments', t('nav_monuments')],
              ['/timeline', t('nav_timeline')],
              ['/stats', t('nav_stats')],
              ['/about', t('nav_about')],
            ].map(([to, label]) => (
              <Link key={to} to={to} style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontWeight:600, marginBottom:'0.75rem', fontSize:'0.9rem' }}>{t('footer_other')}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
            {[
              ['/concordance', t('nav_concordance')],
              ['/compare', t('nav_compare')],
              ['/bibliography', t('nav_bibliography')],
              ['/glossary', t('nav_glossary')],
              ['/submit', t('nav_submit')],
            ].map(([to, label]) => (
              <Link key={to} to={to} style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontWeight:600, marginBottom:'0.75rem', fontSize:'0.9rem' }}>{t('footer_contact')}</div>
          <p style={{ fontSize:'0.85rem', color:'var(--text2)' }}>info@turkiy-korpus.uz</p>
        </div>
      </div>
      <div className="container" style={{ marginTop:'1.5rem', paddingTop:'1rem', borderTop:'1px solid var(--border)', textAlign:'center', fontSize:'0.8rem', color:'var(--text2)' }}>
        𐰴 · © {new Date().getFullYear()} Turkiy Korpus — {t('footer_rights')}
      </div>
    </footer>
  )
}
