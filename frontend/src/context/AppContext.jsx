import { createContext, useContext, useState, useCallback } from 'react'
import { getLang, setLang as setI18nLang, t } from '../i18n'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'light')
  const [lang, setLangState] = useState(getLang)
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('username')
    const s = localStorage.getItem('is_staff')
    return u ? { username: u, is_staff: s === 'true' } : null
  })

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

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

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, changeLang, user, login, logout, t }}>
      {children}
    </AppContext.Provider>
  )
}

// Provider va hook bir faylda — context uchun odatiy usul
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
