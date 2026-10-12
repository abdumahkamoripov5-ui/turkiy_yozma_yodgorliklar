import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import MonumentCard from '../components/MonumentCard'
import MonumentModal from '../components/MonumentModal'

export default function Home() {
  const { t } = useApp()
  const [featured, setFeatured] = useState([])
  const [stats, setStats] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    Promise.all([api.featured(), api.stats()]).then(([featuredResponse, statsResponse]) => {
      if (!active) return
      setFeatured(featuredResponse.data.slice(0, 6))
      setStats(statsResponse.data)
    }).catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  return (
    <div>
      {/* Hero */}
      <section className="hero" style={{ padding: '5.5rem 0 4.5rem', textAlign: 'center' }}>
        <span className="hero-rune" aria-hidden="true" style={{ top:'-2rem', left:'-1.5rem', transform:'rotate(-8deg)' }}>𐰴</span>
        <span className="hero-rune" aria-hidden="true" style={{ bottom:'-3rem', right:'-1rem', transform:'rotate(10deg)' }}>𐱃</span>
        <div className="container" style={{ position:'relative' }}>
          <div className="hero-runic-title fade-up">
            𐰴𐰃𐰔 𐱃𐰇𐰼𐰚
          </div>
          <h1 className="fade-up fade-up-1" style={{ fontSize:'2.7rem', fontWeight:700, marginBottom:'0.5rem', lineHeight:1.2 }}>
            {t('hero_title')}
          </h1>
          <p className="fade-up fade-up-2" style={{ fontSize:'1.3rem', color:'var(--accent)', fontFamily:'var(--font-display)', fontStyle:'italic' }}>
            {t('hero_subtitle')}
          </p>
          <div className="hero-divider fade-up fade-up-2" aria-hidden="true">✦</div>
          <p className="fade-up fade-up-3" style={{ fontSize:'1.02rem', color:'var(--text2)', maxWidth:'600px', margin:'0 auto 2.2rem' }}>
            {t('hero_desc')}
          </p>
          <div className="fade-up fade-up-4" style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/monuments" className="btn btn-primary" style={{ fontSize:'1rem', padding:'0.75rem 2.2rem' }}>
              {t('hero_explore')}
            </Link>
            <Link to="/submit" className="btn btn-outline" style={{ fontSize:'1rem', padding:'0.75rem 2.2rem' }}>
              {t('hero_submit')}
            </Link>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      {stats && (
        <section style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)', padding:'1.5rem 0' }}>
          <div className="container" style={{ display:'flex', justifyContent:'center', gap:'3rem', flexWrap:'wrap' }}>
            {[
              { label: t('stats_total'), value: stats.total },
              { label: t('stats_words'), value: stats.totalWords?.toLocaleString() || 0 },
              { label: t('stats_views'), value: stats.totalViews?.toLocaleString() || 0 },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign:'center' }}>
                <div className="stat-number">{value}</div>
                <div style={{ fontSize:'0.82rem', color:'var(--text2)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container research-tools" aria-label={t('nav_concordance')}>
        {[
          ['/concordance', '⌕', 'nav_concordance', 'concordance_placeholder'],
          ['/compare', '⇄', 'nav_compare', 'compare_select'],
          ['/map', '◎', 'nav_map', 'map_desc'],
        ].map(([to, icon, title, description]) => (
          <Link key={to} to={to} className="card tool-card">
            <span className="tool-icon" aria-hidden="true">{icon}</span>
            <div><h2>{t(title)}</h2><p>{t(description)}</p></div>
            <span className="tool-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>
      {loading && <div className="container home-loading" aria-busy="true"><div className="spinner" /></div>}
      {error && <div className="container error-msg" role="alert">{t('error_load')}
        <div><button className="btn btn-outline" onClick={() => setAttempt(a => a + 1)}>{t('retry')}</button></div>
      </div>}

      {/* Featured monuments */}
      {featured.length > 0 && (
        <section className="container" style={{ paddingBottom:'3rem', paddingLeft:'1rem', paddingRight:'1rem' }}>
          <h2 className="page-title">★ {t('nav_monuments')}</h2>
          <div className="grid grid-2">
            {featured.map(m => (
              <MonumentCard key={m.id} monument={m} onClick={setSelected} />
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
            <Link to="/monuments" className="btn btn-outline">{t('hero_explore')} →</Link>
          </div>
        </section>
      )}

      {selected && <MonumentModal monument={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
