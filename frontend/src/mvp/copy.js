import { useApp } from '../context/AppContext'

export function useCopy() {
  const { lang } = useApp()
  return (uz, ru, en) => ({ uz, ru, en }[lang] || uz)
}
