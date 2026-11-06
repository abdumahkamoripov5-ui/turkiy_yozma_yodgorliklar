import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getLang, setLang as setI18nLang, setPublishedTranslations, t } from '../i18n'
import { EXTRA_LANGUAGES } from '../locale-additions'
import api from '../api'

const AppContext = createContext(null)
const readTheme = () => {
  const stored = localStorage.getItem('theme')
  return stored === 'light' || stored === 'dark' ? stored : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme)
  const [translationVersion, setTranslationVersion] = useState(0)
  const [lang, setLangState] = useState(() => {
    const preferred = getLang()
    if (['uz', 'ru', 'en', ...EXTRA_LANGUAGES].includes(preferred)) return preferred
    setI18nLang('uz')
    return 'uz'
  })
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('username')
    const s = localStorage.getItem('is_staff')
    return u && localStorage.getItem('access_token') ? { username: u, is_staff: s === 'true' } : null
  })

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setThemeState(readTheme())
    const storage = event => { if (event.key === 'theme' || event.key === null) sync() }
    const system = () => { if (!['light', 'dark'].includes(localStorage.getItem('theme'))) sync() }
    window.addEventListener('storage', storage)
    preference.addEventListener('change', system)
    return () => { window.removeEventListener('storage', storage); preference.removeEventListener('change', system) }
  }, [])

  useEffect(() => {
    let active = true
    setPublishedTranslations(lang, {})
    api.get(`/translations/${lang}/`).then(({ data }) => {
      if (!active) return
      setPublishedTranslations(lang, data.translations)
      setTranslationVersion(version => version + 1)
    }).catch(() => {})
    return () => { active = false }
  }, [lang])

  const changeLang = useCallback(l => {
    setI18nLang(l)
    setLangState(l)
  }, [])

  const login = useCallback((data) => {
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('username', data.username)
    localStorage.setItem('is_staff', data.is_staff)
    setUser({ username: data.username, is_staff: data.is_staff })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    localStorage.removeItem('is_staff')
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener('auth-expired', logout)
    return () => window.removeEventListener('auth-expired', logout)
  }, [logout])

  const translate = (key, vars) => { void translationVersion; return t(key, vars, lang) }

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, changeLang, user, login, logout, t: translate }}>
      {children}
    </AppContext.Provider>
  )
}

// Provider va hook bir faylda — context uchun odatiy usul
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
