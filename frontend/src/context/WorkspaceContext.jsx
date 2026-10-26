import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import api from '../api'
import { useApp } from './AppContext'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const { user } = useApp()
  const owner = user?.username || ''
  const latestOwner = useRef(owner)
  latestOwner.current = owner
  const generation = useRef(0)
  const [state, setState] = useState({ owner: '', items: [], loading: false, error: false })
  const reload = useCallback(async () => {
    const turn = ++generation.current
    if (!owner) { setState({ owner: '', items: [], loading: false, error: false }); return }
    setState(previous => ({ owner, items: previous.owner === owner ? previous.items : [], loading: true, error: false }))
    try {
      const rows = []
      let page = 1, more = true
      while (more) {
        const { data } = await api.get('/workspace/items/', { params: { page_size: 200, page } })
        if (turn !== generation.current) return
        rows.push(...data.results)
        more = Boolean(data.next)
        page++
      }
      // Import existing browser bookmarks once, preserving newer server records.
      let legacy = []
      try {
        if (!localStorage.getItem(`meros-migrated:${owner}`)) legacy = JSON.parse(localStorage.getItem(`meros-saved:${owner}`) || '[]')
      } catch { legacy = [] }
      if (Array.isArray(legacy)) {
        for (const item of legacy) {
          if (turn !== generation.current) return
          if (!item || typeof item.key !== 'string' || !/^[A-Za-z0-9:_-]{1,180}$/.test(item.key) || typeof item.title !== 'string' || item.title.length > 250 || typeof item.to !== 'string' || !item.to.startsWith('/') || item.to.startsWith('//') || item.to.includes('\\') || rows.some(row => row.key === item.key)) continue
          const { data } = await api.put('/workspace/items/by-key/', { key: item.key, kind: 'bookmark', title: item.title, target: item.to, payload: { type: item.type || '' } })
          rows.push(data)
        }
      }
      try { localStorage.setItem(`meros-migrated:${owner}`, '1') } catch { /* Server storage still works without local storage. */ }
      if (turn === generation.current) setState({ owner, items: rows, loading: false, error: false })
    } catch {
      if (turn === generation.current) setState(previous => ({ ...previous, loading: false, error: true }))
    }
  }, [owner])
  const cancelLoad = useCallback(() => { generation.current++ }, [])
  useEffect(() => { void reload(); return cancelLoad }, [reload, cancelLoad])
  useEffect(() => {
    const sync = event => { if (event.key === `meros-workspace:${owner}`) void reload() }
    const visible = () => { if (!document.hidden && owner) void reload() }
    window.addEventListener('storage', sync)
    document.addEventListener('visibilitychange', visible)
    return () => { window.removeEventListener('storage', sync); document.removeEventListener('visibilitychange', visible) }
  }, [owner, reload])
  const notify = useCallback(() => { try { localStorage.setItem(`meros-workspace:${owner}`, String(Date.now())) } catch { /* Optional tab notification. */ } }, [owner])
  const save = useCallback(async item => {
    if (!owner) throw new Error('Sign in to save')
    try {
      const { data } = await api.put('/workspace/items/by-key/', item)
      if (latestOwner.current === owner) {
        generation.current++
        setState(previous => ({ ...previous, loading: false, error: false, items: [data, ...previous.items.filter(row => row.key !== data.key)] }))
      }
      notify()
      return data
    } catch (error) {
      if (latestOwner.current === owner) setState(previous => ({ ...previous, error: true }))
      throw error
    }
  }, [owner, notify])
  const remove = useCallback(async key => {
    try {
      await api.delete('/workspace/items/by-key/', { data: { key } })
      if (latestOwner.current === owner) {
        generation.current++
        setState(previous => ({ ...previous, loading: false, error: false, items: previous.items.filter(row => row.key !== key) }))
      }
      notify()
    } catch (error) {
      if (latestOwner.current === owner) setState(previous => ({ ...previous, error: true }))
      throw error
    }
  }, [owner, notify])
  const current = state.owner === owner ? state : { items: [], loading: Boolean(owner), error: false }
  return <WorkspaceContext.Provider value={{ ...current, save, remove, reload }}>{children}</WorkspaceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspace = () => useContext(WorkspaceContext)
