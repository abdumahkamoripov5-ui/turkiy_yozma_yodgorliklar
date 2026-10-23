import { useApp } from '../context/AppContext'

// Subscribe each translated view to language changes without translating stored content.
export function useMerosLocale() {
  return useApp().lang
}
