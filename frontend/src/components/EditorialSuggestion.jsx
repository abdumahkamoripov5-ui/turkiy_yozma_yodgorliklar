import { useState } from 'react'
import api from '../api'
import { useCopy } from '../mvp/copy'

export default function EditorialSuggestion({ line }) {
  const c = useCopy()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ proposed_reading: '', rationale: '', source: '' })
  const set = key => event => setForm(value => ({ ...value, [key]: event.target.value }))
  const submit = async event => {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      await api.post('/research/suggestions/', { line: line.id, ...form })
      setSent(true); setForm({ proposed_reading: '', rationale: '', source: '' })
    } catch (failure) {
      const data = failure.response?.data
      setError(typeof data === 'string' ? data : Object.values(data || {}).flat().join(' ') || c('Yuborilmadi. Qayta urinib ko‘ring.', 'Не отправлено. Повторите попытку.', 'Could not submit. Please try again.'))
    } finally { setBusy(false) }
  }
  if (!line.id) return null
  return <section className="editorial-suggestion">
    <button type="button" className="meros-text-link" aria-expanded={open} onClick={() => { setOpen(value => !value); setSent(false); setError('') }}>
      {c('Satrga manbali tuzatish taklif qilish', 'Предложить исправление строки с источником', 'Suggest a sourced correction to this line')}
    </button>
    {open && <div className="editorial-suggestion-panel">
      <p>{c('Taklif avval tahririyatga boradi. U tasdiqlanmaguncha nashr qilingan matn o‘zgarmaydi.', 'Предложение сначала поступит редакции. Опубликованный текст не изменится до проверки.', 'Your suggestion goes to the editors first. It will not change the published text before review.')}</p>
      {sent ? <p role="status">{c('Taklif yuborildi. Rahmat — tahririyat ko‘rib chiqadi.', 'Предложение отправлено. Спасибо — редакция его рассмотрит.', 'Suggestion submitted. Thank you; the editors will review it.')}</p> : <form onSubmit={submit}>
        <label>{c('Taklif etilgan o‘qilish yoki tarjima', 'Предлагаемое чтение или перевод', 'Proposed reading or translation')}<textarea required maxLength={5000} rows={3} value={form.proposed_reading} onChange={set('proposed_reading')} /></label>
        <label>{c('Dalil va izoh (kamida 20 belgi)', 'Обоснование (не менее 20 знаков)', 'Reasoning (at least 20 characters)')}<textarea required minLength={20} maxLength={5000} rows={3} value={form.rationale} onChange={set('rationale')} /></label>
        <label>{c('Nashr, sahifa yoki barqaror manba havolasi', 'Издание, страница или постоянная ссылка на источник', 'Edition, page or stable source link')}<input required minLength={5} maxLength={1000} value={form.source} onChange={set('source')} /></label>
        {error && <p role="alert">{error}</p>}
        <button className="btn btn-outline" disabled={busy}>{busy ? c('Yuborilmoqda…', 'Отправка…', 'Submitting…') : c('Tahririyatga yuborish', 'Отправить редакции', 'Submit to editors')}</button>
      </form>}
    </div>}
  </section>
}
