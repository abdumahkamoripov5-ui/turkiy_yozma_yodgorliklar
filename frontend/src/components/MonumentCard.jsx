import { useApp } from '../context/AppContext'
import { formatYear } from '../utils/format'

export default function MonumentCard({ monument, onClick }) {
  const { t } = useApp()

  const yearLabel = formatYear(monument.year, t)
  const open = () => onClick(monument)

  return (
    <div className="card card-click" onClick={open} role="button" tabIndex={0}
      aria-label={monument.title}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() }
      }}
      style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      {monument.image ? (
        <div style={{ borderRadius:'var(--radius)', overflow:'hidden', height:'140px' }}>
          <img src={monument.image} alt={monument.title} loading="lazy"
            style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      ) : (
        <div className="rune-placeholder" aria-hidden="true">
          {['𐰴', '𐱃', '𐰆', '𐰚', '𐰃', '𐰠'][monument.id % 6]}
        </div>
      )}

      <div>
        <div style={{ fontSize:'0.75rem', color:'var(--text2)', marginBottom:'0.3rem' }}>
          {monument.script_display || monument.script}
          {(monument.category_display || monument.category) && <> · {monument.category_display || monument.category}</>}
        </div>
        <h3 style={{ fontSize:'1rem', fontWeight:600, lineHeight:1.3, marginBottom:'0.4rem' }}>
          {monument.title}
        </h3>
        {monument.title_original && (
          <p style={{ fontSize:'0.85rem', color:'var(--text2)', fontStyle:'italic', marginBottom:'0.3rem' }}>
            {monument.title_original}
          </p>
        )}
        {monument.description && (
          <p style={{ fontSize:'0.85rem', color:'var(--text2)', lineHeight:1.5,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {monument.description}
          </p>
        )}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:'auto' }}>
        {monument.year != null && <span className="badge">{yearLabel}</span>}
        {monument.location && <span className="badge">{monument.location}</span>}
        {monument.word_count > 0 && (
          <span className="badge">{monument.word_count} {t('card_words')}</span>
        )}
        {monument.featured && <span className="badge badge-accent">★</span>}
      </div>
    </div>
  )
}
