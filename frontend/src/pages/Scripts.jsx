import { useState, useEffect } from 'react'
import { monuments as api } from '../api'
import { useApp } from '../context/AppContext'
import MonumentCard from '../components/MonumentCard'
import MonumentModal from '../components/MonumentModal'

const SCRIPT_INFO = {
  "Ko'ktürk": {
    desc: "Qadimgi turkiy runik (O'rxun-Enasoy) yozuvi. VII–X asrlarda qo'llanilgan.",
    sample: '𐰴𐰃𐰔 𐱃𐰇𐰼𐰚 𐰉𐰆𐰑𐰣',
  },
  "So'g'd": {
    desc: "Birinchi Ko'ktürk xoqonligi davrida diplomatiya va rasmiy hujjatlarda qo'llanilgan yozuv.",
    sample: '',
  },
  "Uyg'ur": {
    desc: "So'g'd yozuvi asosida shakllangan ko'hna uyg'ur yozuvi. VIII–XVIII asrlarda qo'llanilgan.",
    // Eski uyg'ur yozuvining Unicode bloki (U+10F70) ko'p shriftlarda yo'q,
    // mo'g'ul harflari esa boshqa yozuv — namuna ko'rsatilmaydi
    sample: '',
  },
  'Arab': {
    desc: "Arab alifbosi asosida turkiy yozuv. X asrdan hozirgi kungacha.",
    sample: 'ديوان لغات الترك',
  },
}

export default function Scripts() {
  const { t } = useApp()
  const [byScript, setByScript] = useState({})
  const [activeScript, setActiveScript] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.list({ ordering: 'year', page_size: 200 }).then(r => {
      const items = r.data.results || r.data
      const grouped = {}
      items.forEach(m => {
        const key = m.script_display || m.script || 'Boshqa'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(m)
      })
      setByScript(grouped)
      setActiveScript(Object.keys(grouped)[0] || null)
    }).catch(() => setError(t('error_load'))).finally(() => setLoading(false))
  }, [t])

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('scripts_title')}</h1>
        {loading && <div className="spinner" />}
        {error && <div className="error-msg">{error}</div>}

        {!loading && (
          <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
            {/* Script list */}
            <div style={{ flex:'0 0 220px', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {Object.entries(byScript).map(([script, items]) => (
                <button key={script}
                  onClick={() => setActiveScript(script)}
                  aria-pressed={activeScript === script}
                  className={`card ${activeScript === script ? 'badge-accent' : ''}`}
                  style={{
                    textAlign:'left', cursor:'pointer',
                    border: activeScript === script ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: activeScript === script ? 'rgba(var(--accent-rgb),0.1)' : 'var(--bg2)',
                    color:'var(--text)',
                  }}>
                  <div style={{ fontWeight:600, fontSize:'0.95rem' }}>{script}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text2)' }}>{t('scripts_count', { n: items.length })}</div>
                  {SCRIPT_INFO[script]?.sample && (
                    <div style={{ fontSize:'1.1rem', marginTop:'0.25rem', letterSpacing:'0.05em' }}>
                      {SCRIPT_INFO[script].sample}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Monuments in script */}
            <div style={{ flex:1, minWidth:0 }}>
              {activeScript && (
                <>
                  {SCRIPT_INFO[activeScript] && (
                    <div className="card" style={{ marginBottom:'1rem', background:'rgba(var(--accent-rgb),0.05)', borderColor:'var(--accent)' }}>
                      <p style={{ color:'var(--text2)' }}>{SCRIPT_INFO[activeScript].desc}</p>
                    </div>
                  )}
                  <div className="grid grid-2">
                    {(byScript[activeScript] || []).map(m => (
                      <MonumentCard key={m.id} monument={m} onClick={setSelected} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {selected && <MonumentModal monument={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
