import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useCopy } from '../mvp/copy'

export default function PreviewNotice() {
  const { user } = useApp()
  const c = useCopy()
  const location = useLocation()
  if (user) return null
  const next = encodeURIComponent(location.pathname + location.search + location.hash)
  return <aside className="preview-notice"><div><strong>{c('Avval tanishing. Keyin qo‘shiling.', 'Сначала познакомьтесь. Затем присоединяйтесь.', 'Explore first. Join when you’re ready.')}</strong><p>{c('Bu ochiq saralangan to‘plam. Barcha matnlar, tadqiqot vositalari, saqlash va ovoz berish uchun bepul hisob oching.', 'Это открытая подборка. Создайте бесплатный аккаунт для всех текстов, инструментов, сохранения и голосования.', 'This is a public selection. Create a free account for all texts, research tools, saving and voting.')}</p></div><Link className="btn btn-primary" to={`/login?mode=register&next=${next}`}>{c('Bepul qo‘shilish →', 'Присоединиться бесплатно →', 'Join for free →')}</Link></aside>
}
