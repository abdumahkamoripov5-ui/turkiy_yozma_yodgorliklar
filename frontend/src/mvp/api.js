import { useEffect, useState } from 'react'
import api from '../api'

export { api }

export function useRemote(path) {
  const [state, setState] = useState({ data: null, loading: true, error: false })
  const [version, setVersion] = useState(0)
  useEffect(() => {
    let active = true
    setState({ data: null, loading: true, error: false })
    api.get(path).then(({ data }) => {
      if (active) setState({ data, loading: false, error: false })
    }).catch(() => {
      if (active) setState({ data: null, loading: false, error: true })
    })
    return () => { active = false }
  }, [path, version])
  return { ...state, reload: () => setVersion(value => value + 1) }
}

export const items = data => data?.results || (Array.isArray(data) ? data : [])

export function stored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export function useSaved() {
  const read = () => {
    const value = stored('meros-saved', [])
    return Array.isArray(value) ? value : []
  }
  const [saved, setSaved] = useState(read)
  useEffect(() => {
    const refresh = () => setSaved(read())
    window.addEventListener('meros-saved', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('meros-saved', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  const toggle = item => {
    const previous = read()
    const next = previous.some(entry => entry.key === item.key)
      ? previous.filter(entry => entry.key !== item.key) : [...previous, item]
    localStorage.setItem('meros-saved', JSON.stringify(next))
    window.dispatchEvent(new Event('meros-saved'))
  }
  return { saved, toggle }
}

export function errorMessage(error, fallback = 'Amal bajarilmadi. Qayta urinib ko‘ring.') {
  const data = error.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (data && typeof data === 'object') return Object.values(data).flat().join(' ')
  return fallback
}
