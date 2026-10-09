import { useApp } from '../context/AppContext'

export default function About() {
  const { t } = useApp()
  return (
    <div className="page">
      <div className="container" style={{ maxWidth:'800px' }}>
        <h1 className="page-title">{t('about_title')}</h1>

        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ color:'var(--accent)', marginBottom:'1rem', fontSize:'1.2rem' }}>Loyiha haqida</h2>
          <p style={{ lineHeight:1.8, marginBottom:'1rem' }}>
            Turkiy Yozma Yodgorliklar Elektron Korpusi — O'rta asrlar turkiy yozma merosini
            raqamlashtirish va ilmiy tadqiq qilish uchun yaratilgan platforma.
          </p>
          <p style={{ lineHeight:1.8, color:'var(--text2)' }}>
            Ushbu korpus qadimgi turkiy, uyg'ur, arab yozuvlaridagi yodgorliklarni
            o'z ichiga oladi va tadqiqotchilar, o'quvchilar hamda barcha qiziquvchilar
            uchun ochiq manba sifatida xizmat qiladi.
          </p>
        </div>

        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ color:'var(--accent)', marginBottom:'1rem', fontSize:'1.2rem' }}>Texnik ma'lumot</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', fontSize:'0.9rem' }}>
            {[
              ['Backend', 'Django 4.2 + PostgreSQL'],
              ['API', 'Django REST Framework'],
              ['Frontend', 'React + Vite'],
              ['Autentifikatsiya', 'JWT (JSON Web Token)'],
              ['Litsenziya', 'Open Source'],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', gap:'1rem' }}>
                <span style={{ color:'var(--text2)', minWidth:'180px' }}>{k}:</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ color:'var(--accent)', marginBottom:'1rem', fontSize:'1.2rem' }}>Aloqa</h2>
          <p style={{ color:'var(--text2)', fontSize:'0.9rem' }}>
            Saytga oid takliflar va xabarlar uchun:{' '}
            <a href="mailto:info@turkiy-korpus.uz">info@turkiy-korpus.uz</a>
          </p>
        </div>
      </div>
    </div>
  )
}
