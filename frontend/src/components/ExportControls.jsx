import { useState } from 'react'
import { exportData } from '../api'
import { useCopy } from '../mvp/copy'

export default function ExportControls() {
  const c = useCopy()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const download = async format => {
    setBusy(true); setError(false)
    try {
      const { data } = await exportData(format)
      const blob = format === 'csv' ? data : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = `turkiy-meros.${format}`
      document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch { setError(true) }
    finally { setBusy(false) }
  }
  return <section style={{ marginTop: '2rem' }}><h2>{c('Korpusni yuklab olish', 'Скачать корпус', 'Download the corpus')}</h2><p>{c('CSV yoki JSON shaklida. Manbalarga iqtibos keltiring.', 'В формате CSV или JSON. Указывайте источники.', 'In CSV or JSON format. Please cite the sources.')}</p><div className="landing-actions">{['csv', 'json'].map(format => <button key={format} className="btn btn-outline" disabled={busy} onClick={() => download(format)}>{format.toUpperCase()} ↓</button>)}</div>{error && <p role="alert">{c('Yuklab bo‘lmadi. Qayta urinib ko‘ring.', 'Не удалось скачать. Повторите попытку.', 'Download failed. Please try again.')}</p>}</section>
}
