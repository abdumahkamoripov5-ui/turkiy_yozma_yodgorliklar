import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { api, errorMessage, items, useRemote } from '../mvp/api'
import { PageHeading, Pagination, RemoteState } from '../mvp/components'

export default function Polls() {
  const [page, setPage] = useState(1)
  const remote = useRemote(`/polls/?page=${page}`)
  const polls = items(remote.data)
  return <div className="container meros-page"><PageHeading eyebrow="TIL — UMUMIY BOYLIGIMIZ" title="So‘zga ovoz bering">Tarixiy so‘zlarni qayta kashf etamiz, yangi tushunchalarga birga muqobil izlaymiz.</PageHeading>
    <div className="meros-poll-intro"><span>01 · Dalil bilan tanishing</span><span>02 · O‘z ovozingizni bering</span><span>03 · Natijani kuzating</span></div>
    <RemoteState remote={remote} empty={!polls.length}>{polls.map(poll => <Poll key={poll.id} initial={poll} />)}<Pagination data={remote.data} page={page} setPage={setPage} /></RemoteState>
    <p className="meros-notice">MVPda saytdagi ovozlar hisoblanadi. Ijtimoiy tarmoqlardan ovoz yig‘ish hali ulanmagan. Jamoatchilik tanlovi rasmiy til me’yori yoki tarixiy dalil hisoblanmaydi.</p>
  </div>
}

function Poll({ initial }) {
  const { user } = useApp()
  const [poll, setPoll] = useState(initial)
  const [choice, setChoice] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const vote = async () => {
    setBusy(true); setError('')
    try { const { data } = await api.post(`/polls/${poll.id}/vote/`, { option: choice }); setPoll(data) }
    catch (err) {
      setError(errorMessage(err))
      if (err.response?.status === 409) {
        try { const { data } = await api.get(`/polls/${poll.id}/`); setPoll(data) }
        catch { setError('Ovozingiz oldin qabul qilingan. Natijani ko‘rish uchun sahifani yangilang.') }
      }
    } finally { setBusy(false) }
  }
  return <article className="meros-poll"><div className="meros-section-top"><span className={`meros-status ${poll.is_open ? 'open' : ''}`}>{poll.is_open ? '● Ovoz berish ochiq' : 'Ovoz berish yopiq'}</span><span className="meros-meta">{poll.total_votes} ta ovoz · {new Date(poll.ends_at).toLocaleDateString('uz-UZ')} gacha</span></div><h2>{poll.title}</h2><p>{poll.context}</p>
    <fieldset disabled={busy || !!poll.my_vote || !poll.is_open}><legend className="sr-only">So‘z variantini tanlang</legend>{poll.options.map(option => {
      const percent = poll.total_votes ? Math.round(option.votes_count / poll.total_votes * 100) : 0
      return <label className={`meros-poll-option ${choice === option.id || poll.my_vote === option.id ? 'selected' : ''}`} key={option.id}>
        <span className="poll-option-top"><span><input type="radio" name={`poll-${poll.id}`} checked={choice === option.id || poll.my_vote === option.id} onChange={() => setChoice(option.id)} /> <strong>{option.word}</strong></span><span>{percent}% · {option.votes_count} ovoz</span></span><span className="poll-explanation">{option.explanation}</span>{option.source && <small>{option.source}</small>}<span className="poll-bar"><span style={{ width: `${percent}%` }} /></span>
      </label>
    })}</fieldset>
    {error && <p className="error-msg" role="alert">{error}</p>}
    <div className="meros-poll-actions">{poll.my_vote ? <p role="status">✓ Ovozingiz qabul qilindi. Rahmat!</p> : user ? <button className="btn btn-primary" disabled={!choice || busy || !poll.is_open} onClick={vote}>{busy ? 'Yuborilmoqda…' : 'Ovoz berish →'}</button> : <Link to="/login?next=/polls" className="btn btn-primary">Ovoz berish uchun kirish →</Link>}<span className="meros-meta">Har bir akkaunt — bitta ovoz</span></div>
    {poll.published_word && <p className="meros-notice">Admin tasdiqlagan natija: <Link to="/words">{poll.published_word.word} →</Link></p>}
  </article>
}
