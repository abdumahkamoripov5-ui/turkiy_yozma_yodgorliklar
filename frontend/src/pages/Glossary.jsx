import { useState } from 'react'
import { useApp } from '../context/AppContext'

const GLOSSARY_DATA = [
  { term: 'Epigrafiya', def: 'Tosh, metall va boshqa qattiq materiallarga o\'yib yozilgan yozuvlarni o\'rganuvchi fan.' },
  { term: 'Runik yozuv', def: 'Qadimgi turkiy xalqlar tomonidan VII-X asrlarda qo\'llanilgan yozuv tizimi. Orxun-Yenisey bitiktoshlari shu yozuvda.' },
  { term: 'Transliteratsiya', def: 'Bir yozuv tizimidan boshqa yozuv tizimiga harf-harf o\'tkazish jarayoni.' },
  { term: 'Transkriptsiya', def: 'So\'zlarning talaffuzini maxsus belgilar yordamida ifodalash.' },
  { term: 'Bitiktosh', def: 'Qadimgi turkiy yozuvlar bilan qoplangan tosh yodgorlik.' },
  { term: 'Mazmun', def: 'Yozma manbaning asosiy fikri va g\'oyasi.' },
  { term: 'Kodeks', def: 'Qo\'lyozma kitobning qadimgi shakli.' },
  { term: "Ko'hna turkiy", def: 'VII-XIII asrlardagi qadimgi turkiy til. Orxun va Uyg\'ur yozuvida yodgorliklar mavjud.' },
  { term: "Qoraxoniylar davri", def: 'X-XIII asrlarda Markaziy Osiyoda hukm surgan turkiy sulola davri.' },
  { term: 'Devon', def: "Bir shoir she'rlarining to'plami. (Mahmud Koshg'ariyning «Devonu lug'otit turk» asari esa she'rlar devoni emas, turkiy so'zlar lug'atidir — bu yerda «devon» «to'plam» ma'nosida.)" },
  { term: 'Chagatoy tili', def: 'XIV-XX asrlarda Markaziy Osiyoda keng qo\'llanilgan adabiy turkiy til.' },
  { term: "Lug'at", def: 'So\'z va atamalar ro\'yxati, ularning izohli tavsifi.' },
]

export default function Glossary() {
  const { t } = useApp()
  const [search, setSearch] = useState('')

  const filtered = GLOSSARY_DATA.filter(g => {
    const q = search.toLowerCase()
    return !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q)
  }).sort((a, b) => a.term.localeCompare(b.term))

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">{t('glossary_title')}</h1>
        <input type="search" placeholder={t('glossary_search')} value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom:'1.5rem', maxWidth:'400px', display:'block' }} />

        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {filtered.map(g => (
            <div key={g.term} className="card" style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <div style={{ flex:'0 0 180px', fontWeight:600, color:'var(--accent)', fontSize:'0.95rem' }}>
                {g.term}
              </div>
              <div style={{ fontSize:'0.9rem', color:'var(--text)', lineHeight:1.6 }}>{g.def}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', color:'var(--text2)', padding:'2rem' }}>{t('no_results')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
