import { useState, useEffect } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'

function Bar({ label, count, max, color = 'var(--accent)' }) {
  const pct = max > 0 ? (count / max) * 100 : 0
  return (
    <div style={{ marginBottom:'0.75rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.25rem', fontSize:'0.85rem' }}>
        <span>{label}</span>
        <span style={{ color:'var(--text2)' }}>{count}</span>
      </div>
      <div style={{ background:'var(--bg3)', borderRadius:'4px', height:'8px', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, background:color, height:'100%', borderRadius:'4px',
          transition:'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export default function Stats() {
  const { t } = useApp()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.stats().then(r => { setStats(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>
  if (!stats) return <div className="page"><div className="container"><div className="error-msg">{t('error_load')}</div></div></div>

  const maxOf = list => Math.max(1, ...(list || []).map(x => x.count))
  const maxScript = maxOf(stats.byScript)
  const maxCentury = maxOf(stats.byCentury)
  const maxCategory = maxOf(stats.byCategory)

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('stats_title')}</h1>

        {/* Summary cards */}
        <div className="grid grid-3" style={{ marginBottom:'2rem' }}>
          {[
            { label: t('stats_total'), value: stats.total, icon: '📜' },
            { label: t('stats_words'), value: stats.totalWords?.toLocaleString(), icon: '📝' },
            { label: t('stats_views'), value: stats.totalViews?.toLocaleString(), icon: '👁' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{icon}</div>
              <div style={{ fontSize:'2rem', fontWeight:700, color:'var(--accent)' }}>{value || 0}</div>
              <div style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-2">
          {/* By script */}
          <div className="card">
            <h3 style={{ marginBottom:'1rem', color:'var(--accent)' }}>{t('stats_by_script')}</h3>
            {stats.byScript?.map(s => (
              <Bar key={s.script} label={s.label || s.script || 'Boshqa'} count={s.count} max={maxScript} />
            ))}
          </div>

          {/* By category */}
          <div className="card">
            <h3 style={{ marginBottom:'1rem', color:'var(--accent)' }}>{t('stats_by_category')}</h3>
            {stats.byCategory?.map(c => (
              <Bar key={c.category} label={c.label || c.category || 'Boshqa'} count={c.count} max={maxCategory}
                color='#7c9bbf' />
            ))}
          </div>

          {/* By century */}
          <div className="card" style={{ gridColumn:'1 / -1' }}>
            <h3 style={{ marginBottom:'1rem', color:'var(--accent)' }}>{t('stats_by_century')}</h3>
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-end', overflowX:'auto', padding:'0.5rem 0' }}>
              {stats.byCentury?.map(c => {
                const pct = maxCentury > 0 ? (c.count / maxCentury) * 100 : 0
                return (
                  <div key={c.century} style={{ flex:'0 0 auto', textAlign:'center', minWidth:'48px' }}>
                    <div style={{ background:'var(--accent)', width:'100%', height:`${Math.max(pct * 1.2, 4)}px`,
                      borderRadius:'3px 3px 0 0', marginBottom:'0.3rem' }} />
                    <div style={{ fontSize:'0.7rem', color:'var(--text2)', writingMode:'vertical-rl',
                      transform:'rotate(180deg)', height:'60px' }}>{c.number != null
                      ? t('century_label', { n: Math.abs(c.number) }) + (c.number < 0 ? ` ${t('era_bce')}` : '')
                      : c.century}</div>
                    <div style={{ fontSize:'0.8rem', fontWeight:600 }}>{c.count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
