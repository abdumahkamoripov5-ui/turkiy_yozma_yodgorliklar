import { useApp } from '../context/AppContext'
import { EXTRA_COPY } from '../locale-additions'

export function useCopy() {
  const { lang } = useApp()
  return (uz, ru, en) => ({ uz, ru, en }[lang] || EXTRA_COPY[lang]?.[uz] || uz)
}
