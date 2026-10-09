import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { t, login } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const r = await auth.login(form.username, form.password)
      login(r.data)
      navigate('/')
    } catch (err) {
      // 429 — juda ko'p urinish (backend cheklovi); boshqa hollarda — login/parol xato
      setError(err.response?.status === 429
        ? (err.response.data?.detail || t('login_error'))
        : t('login_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="card" style={{ width:'100%', maxWidth:'380px' }}>
        <h2 style={{ marginBottom:'1.5rem', color:'var(--accent)', textAlign:'center' }}>
          {t('login_title')}
        </h2>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label htmlFor="login_username" style={{ display:'block', marginBottom:'0.35rem', fontSize:'0.85rem', color:'var(--text2)' }}>
              {t('login_username')}
            </label>
            <input id="login_username" autoComplete="username" type="text" value={form.username} required
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              style={{ width:'100%' }} autoFocus />
          </div>
          <div>
            <label htmlFor="login_password" style={{ display:'block', marginBottom:'0.35rem', fontSize:'0.85rem', color:'var(--text2)' }}>
              {t('login_password')}
            </label>
            <input id="login_password" autoComplete="current-password" type="password" value={form.password} required
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width:'100%' }} />
          </div>
          {error && (
            <div role="alert" style={{ color:'#e57373', fontSize:'0.85rem', textAlign:'center' }}>{error}</div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width:'100%', justifyContent:'center', fontSize:'1rem' }}>
            {loading ? t('loading') : t('login_submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
