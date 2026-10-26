import { useMerosLocale } from '../mvp/useLocale'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '../api'
import { api, errorMessage } from '../mvp/api'
import { useApp } from '../context/AppContext'
import { useCopy } from '../mvp/copy'

export default function Login() {
  useMerosLocale()
  const { t, login } = useApp()
  const c = useCopy()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const register = params.get('mode') === 'register'
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const r = register ? await api.post('/auth/register/', form) : await auth.login(form.username, form.password)
      login(r.data)
      navigate('/', { replace: true })
    } catch (err) {
      // 429 — juda ko'p urinish (backend cheklovi); boshqa hollarda — login/parol xato
      setError(register ? errorMessage(err) : err.response?.status === 429
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
          {register ? c('Bepul hisob oching', 'Создайте бесплатный аккаунт', 'Create your free account') : t('login_title')}
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
            <input id="login_password" autoComplete={register ? 'new-password' : 'current-password'} type="password" value={form.password} required
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ width:'100%' }} />
          </div>
          {error && (
            <div role="alert" style={{ color:'#e57373', fontSize:'0.85rem', textAlign:'center' }}>{error}</div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width:'100%', justifyContent:'center', fontSize:'1rem' }}>
            {loading ? t('loading') : register ? c('Hisob yaratish →', 'Создать аккаунт →', 'Create account →') : t('login_submit')}
          </button>
        </form>
        {register && <p style={{ fontSize: '.85rem', marginTop: '1rem', color: 'var(--text2)' }}>{c('Kamida 8 belgili, oddiy bo‘lmagan parol tanlang. Kirish va foydalanish hodisalari hisobingiz bilan qayd etiladi.', 'Выберите сложный пароль от 8 символов. События входа и использования записываются с вашим аккаунтом.', 'Choose a strong password of at least 8 characters. Sign-in and usage events are recorded with your account.')}</p>}
        <button className="meros-text-link" style={{ marginTop: '1rem', width: '100%' }} onClick={() => { const next = new URLSearchParams(params); if (register) next.delete('mode'); else next.set('mode', 'register'); setParams(next, { replace: true }); setError(null) }}>{register ? c('Akkauntingiz bormi? Kirish', 'Уже есть аккаунт? Войти', 'Already a member? Sign in') : c('Bepul ro‘yxatdan o‘tish', 'Бесплатная регистрация', 'Register for free')}</button>
      </div>
    </div>
  )
}
