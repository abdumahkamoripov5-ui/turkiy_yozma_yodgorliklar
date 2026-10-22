import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, errorMessage, items, useRemote } from '../mvp/api'
import { PageHeading, Pagination, RemoteState } from '../mvp/components'

const kinds = { article: 'Maqola', book: 'Kitob', thesis: 'Dissertatsiya', text: 'Yodgorlik matni', lesson: 'Video dars' }
const statuses = { pending: 'Admin tekshiruvida', approved: 'Nashr qilingan', rejected: 'Rad etilgan' }

export default function Research() {
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
    } catch { setDownloadError('Faylni yuklab bo‘lmadi. Kirish huquqini tekshiring.') }
  }
  return <div className="container meros-page"><PageHeading eyebrow="ILMNI BIRGA BOYITAMIZ" title="Ilmiy hamkorlik">Maqola, kitob, dissertatsiya, yodgorlik matni va video darslaringizni ulashing. Har bir ish nashrdan oldin admin tomonidan tekshiriladi.</PageHeading>
    <div className="meros-research-banner"><div><h2>Izlanishingiz merosning bir qismiga aylansin</h2><p>Muallif va institut ma’lumotlari ishingiz bilan birga ko‘rsatiladi.</p></div>{user ? <button className="btn btn-primary" onClick={() => setShowForm(value => !value)}>{showForm ? 'Formani yopish' : '＋ Ilmiy ish yuborish'}</button> : <Link className="btn btn-primary" to="/login?next=/research">Kirish va ish yuborish →</Link>}</div>
    {user && showForm && <ResearchForm onSuccess={() => { setShowForm(false); setTab('mine'); setPage(1); remote.reload() }} />}
    <div className="meros-tabs" role="group" aria-label="Ilmiy ishlar"><button className={tab === 'public' ? 'active' : ''} aria-pressed={tab === 'public'} onClick={() => { setTab('public'); setPage(1) }}>Nashr qilingan ishlar</button>{user && <button className={tab === 'mine' ? 'active' : ''} aria-pressed={tab === 'mine'} onClick={() => { setTab('mine'); setPage(1) }}>Mening ishlarim</button>}</div>
    {downloadError && <p role="alert" className="error-msg">{downloadError}</p>}
    <RemoteState remote={remote} empty={!works.length}><div className="meros-research-grid">{works.map(work => <article className="meros-work" key={work.id}><div className="meros-section-top"><span className="meros-eyebrow">{kinds[work.kind]}</span><span className="meros-status">{statuses[work.status]}</span></div><h2>{work.title}</h2><p className="meros-work-author">{work.author}{work.institution && ` · ${work.institution}`}</p><p className="meros-work-abstract">{work.abstract}</p>{work.reviewer_note && tab === 'mine' && <p className="meros-notice">Admin izohi: {work.reviewer_note}</p>}<div className="meros-work-links">{work.source_url && <a href={work.source_url} target="_blank" rel="noopener noreferrer">Manbani ochish ↗</a>}{work.document_url && <button className="btn btn-outline" onClick={() => download(work)}>PDF fayl ↓</button>}</div></article>)}</div><Pagination data={remote.data} page={page} setPage={setPage} /></RemoteState>
  </div>
}

function ResearchForm({ onSuccess }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault(); setError('')
    const data = new FormData(event.currentTarget)
    const file = data.get('document')
    if (!file?.size) data.delete('document')
    else if (file.size > 20 * 1024 * 1024) { setError('PDF 20 MB dan katta bo‘lmasin.'); return }
    setBusy(true)
    try { await api.post('/research/', data); onSuccess() }
    catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }
  return <form className="meros-research-form" onSubmit={submit}><h2>Ilmiy ish yuborish</h2><p>Yuborilgandan keyin ishingiz holatini “Mening ishlarim” bo‘limida ko‘rasiz.</p><div className="meros-form-grid">
    <label className="meros-field">Ish nomi<input name="title" required maxLength={250} /></label><label className="meros-field">Material turi<select name="kind">{Object.entries(kinds).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <label className="meros-field">Muallif / mualliflar<input name="author" required maxLength={150} /></label><label className="meros-field">Institut yoki tashkilot<input name="institution" maxLength={250} /></label>
    <label className="meros-field meros-span-all">Annotatsiya<textarea name="abstract" required rows={5} maxLength={15000} /></label><label className="meros-field">Manba yoki video dars havolasi<input name="source_url" type="url" placeholder="https://…" /></label><label className="meros-field">PDF hujjat · ko‘pi bilan 20 MB<input name="document" type="file" accept=".pdf,application/pdf" /></label>
  </div><label className="meros-consent"><input type="checkbox" required />Materialni yuborish huquqim borligini va admin tekshiruviga roziligimni tasdiqlayman.</label>{error && <p className="error-msg" role="alert">{error}</p>}<button disabled={busy} className="btn btn-primary">{busy ? 'Yuborilmoqda…' : 'Tekshiruvga yuborish →'}</button></form>
}
