import { useEffect, useState } from 'react'
import api from '../api'
import { useWorkspace } from '../context/WorkspaceContext'

export { api }

export function useRemote(path) {
  const [state, setState] = useState({ data: null, loading: Boolean(path), error: false })
  const [version, setVersion] = useState(0)
  useEffect(() => {
    if (!path) { setState({ data: null, loading: false, error: false }); return undefined }
    let active = true
    setState({ data: null, loading: true, error: false })
    api.get(path).then(({ data }) => {
      if (active) setState({ data, loading: false, error: false })
    }).catch(error => {
      const data = error.response?.data
      const message = typeof data?.detail === 'string' ? data.detail : data && typeof data === 'object' ? Object.values(data).flat().join(' ') : ''
      if (active) setState({ data: null, loading: false, error: true, message })
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
  const { items, save, remove, loading, error } = useWorkspace()
  const saved = items.filter(item => item.kind === 'bookmark').map(item => ({ ...item, to: item.target }))
  const toggle = item => saved.some(entry => entry.key === item.key) ? remove(item.key)
    : save({ key: item.key, kind: 'bookmark', title: item.title, target: item.to, payload: { type: item.type || '' } })
  return { saved, toggle, loading, error }
}

export function errorMessage(error, fallback = 'Amal bajarilmadi. Qayta urinib ko‘ring.') {
  const data = error.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (data && typeof data === 'object') return Object.values(data).flat().join(' ')
  return fallback
}
