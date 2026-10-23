import { translateMvp as tr } from '../mvp/locale'
import { useMerosLocale } from '../mvp/useLocale'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, errorMessage, items, useRemote } from '../mvp/api'
import { PageHeading, Pagination, RemoteState } from '../mvp/components'

const kinds = { article: 'Maqola', book: 'Kitob', thesis: 'Dissertatsiya', text: 'Yodgorlik matni', lesson: 'Video dars' }
const statuses = { pending: 'Admin tekshiruvida', approved: 'Nashr qilingan', rejected: 'Rad etilgan' }

export default function Research() {
  useMerosLocale()
  const { user } = useApp()
  const [tab, setTab] = useState('public')
  const [page, setPage] = useState(1)
  const remote = useRemote(`/research/${tab === 'mine' && user ? 'mine/' : ''}?page=${page}`)
  const works = items(remote.data)
  const [showForm, setShowForm] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const download = async work => {
    setDownloadError('')
    try {
      const { data } = await api.get(`/research/${work.id}/document/`, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `ilmiy-ish-${work.id}.pdf`; anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch { setDownloadError(tr("Faylni yuklab bo‘lmadi. Kirish huquqini tekshiring.")) }
  }
  return <div className="container meros-page"><PageHeading eyebrow={tr("ILMNI BIRGA BOYITAMIZ")} title={tr("Ilmiy hamkorlik")}>{tr("Maqola, kitob, dissertatsiya, yodgorlik matni va video darslaringizni ulashing. Har bir ish nashrdan oldin admin tomonidan tekshiriladi.")}</PageHeading>
    <div className="meros-research-banner"><div><h2>{tr("Izlanishingiz merosning bir qismiga aylansin")}</h2><p>{tr("Muallif va institut ma’lumotlari ishingiz bilan birga ko‘rsatiladi.")}</p></div>{user ? <button className="btn btn-primary" onClick={() => setShowForm(value => !value)}>{showForm ? tr("Formani yopish") : tr("＋ Ilmiy ish yuborish")}</button> : <Link className="btn btn-primary" to="/login?next=/research">{tr("Kirish va ish yuborish →")}</Link>}</div>
    {user && showForm && <ResearchForm onSuccess={() => { setShowForm(false); setTab('mine'); setPage(1); remote.reload() }} />}
    <div className="meros-tabs" role="group" aria-label={tr("Ilmiy ishlar")}><button className={tab === 'public' ? 'active' : ''} aria-pressed={tab === 'public'} onClick={() => { setTab('public'); setPage(1) }}>{tr("Nashr qilingan ishlar")}</button>{user && <button className={tab === 'mine' ? 'active' : ''} aria-pressed={tab === 'mine'} onClick={() => { setTab('mine'); setPage(1) }}>{tr("Mening ishlarim")}</button>}</div>
    {downloadError && <p role="alert" className="error-msg">{downloadError}</p>}
    <RemoteState remote={remote} empty={!works.length}><div className="meros-research-grid">{works.map(work => <article className="meros-work" key={work.id}><div className="meros-section-top"><span className="meros-eyebrow">{tr(kinds[work.kind])}</span><span className="meros-status">{tr(statuses[work.status])}</span></div><h2>{work.title}</h2><p className="meros-work-author">{work.author}{work.institution && ` · ${work.institution}`}</p><p className="meros-work-abstract">{work.abstract}</p>{work.reviewer_note && tab === 'mine' && <p className="meros-notice">{tr("Admin izohi:")}{' '}{work.reviewer_note}</p>}<div className="meros-work-links">{work.source_url && <a href={work.source_url} target="_blank" rel="noopener noreferrer">{tr("Manbani ochish ↗")}</a>}{work.document_url && <button className="btn btn-outline" onClick={() => download(work)}>{tr("PDF fayl ↓")}</button>}</div></article>)}</div><Pagination data={remote.data} page={page} setPage={setPage} /></RemoteState>
  </div>
}

function ResearchForm({ onSuccess }) {
  useMerosLocale()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault(); setError('')
    const data = new FormData(event.currentTarget)
    const file = data.get('document')
    if (!file?.size) data.delete('document')
    else if (file.size > 20 * 1024 * 1024) { setError(tr("PDF 20 MB dan katta bo‘lmasin.")); return }
    setBusy(true)
    try { await api.post('/research/', data); onSuccess() }
    catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }
  return <form className="meros-research-form" onSubmit={submit}><h2>{tr("Ilmiy ish yuborish")}</h2><p>{tr("Yuborilgandan keyin ishingiz holatini “Mening ishlarim” bo‘limida ko‘rasiz.")}</p><div className="meros-form-grid">
    <label className="meros-field">{tr("Ish nomi")}<input name="title" required maxLength={250} /></label><label className="meros-field">{tr("Material turi")}<select name="kind">{Object.entries(kinds).map(([key, label]) => <option key={key} value={key}>{tr(label)}</option>)}</select></label>
    <label className="meros-field">{tr("Muallif / mualliflar")}<input name="author" required maxLength={150} /></label><label className="meros-field">{tr("Institut yoki tashkilot")}<input name="institution" maxLength={250} /></label>
    <label className="meros-field meros-span-all">{tr("Annotatsiya")}<textarea name="abstract" required rows={5} maxLength={15000} /></label><label className="meros-field">{tr("Manba yoki video dars havolasi")}<input name="source_url" type="url" placeholder="https://…" /></label><label className="meros-field">{tr("PDF hujjat · ko‘pi bilan 20 MB")}<input name="document" type="file" accept=".pdf,application/pdf" /></label>
  </div><label className="meros-consent"><input type="checkbox" required />{tr("Materialni yuborish huquqim borligini va admin tekshiruviga roziligimni tasdiqlayman.")}</label>{error && <p className="error-msg" role="alert">{error}</p>}<button disabled={busy} className="btn btn-primary">{busy ? tr("Yuborilmoqda…") : tr("Tekshiruvga yuborish →")}</button></form>
}
