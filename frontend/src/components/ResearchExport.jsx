import { useState } from 'react'
import api from '../api'
import { useCopy } from '../mvp/copy'

export default function ResearchExport({ endpoint, params, formats = ['csv', 'xlsx', 'json'], label }) {
  const c = useCopy()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const download = async format => {
    setBusy(true); setError('')
    try {
      const response = await api.get(endpoint, { params: { ...params, download: format }, responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `turkiy-meros.${format === 'tei' ? 'tei.xml' : format}`
      document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      if (response.headers['x-results-truncated'] === 'true') setError(c('Eksport chegarasiga yetildi. Natijalarni filtr bilan toraytiring.', 'Достигнут лимит экспорта. Уточните фильтры.', 'Export limit reached. Narrow the filters.'))
    } catch (failure) {
      let message = c('Yuklab bo‘lmadi. Qayta urinib ko‘ring.', 'Не удалось скачать. Повторите попытку.', 'Download failed. Try again.')
      try { const data = JSON.parse(await failure.response.data.text()); message = typeof data.detail === 'string' ? data.detail : Object.values(data).flat().join(' ') } catch { /* Keep the readable fallback. */ }
      setError(message)
    } finally { setBusy(false) }
  }
  return <div className="research-export">{label && <span>{label}</span>}<div className="research-actions">{formats.map(format => <button type="button" className="btn btn-outline" disabled={busy} key={format} onClick={() => download(format)}>{format.toUpperCase()} ↓</button>)}</div>{error && <p role="status">{error}</p>}</div>
}
