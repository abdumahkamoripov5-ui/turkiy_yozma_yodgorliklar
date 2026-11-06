import { useApp } from '../context/AppContext'
import { EXTRA_COPY } from '../locale-additions'
import { getPublishedTranslation } from '../i18n'

export function useCopy() {
  const { lang } = useApp()
  return (uz, ru, en) => getPublishedTranslation(lang, uz) ?? ({ uz, ru, en }[lang] || EXTRA_COPY[lang]?.[uz] || uz)
}
