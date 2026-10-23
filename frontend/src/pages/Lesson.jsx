import { translateMvp as tr } from '../mvp/locale'
import { useMerosLocale } from '../mvp/useLocale'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, errorMessage, stored, useRemote } from '../mvp/api'
import { PageHeading, RemoteState, SaveButton } from '../mvp/components'

export default function Lesson() {
  useMerosLocale()
  const { id } = useParams()
  const remote = useRemote(`/lessons/${id}/`)
  return <div className="container meros-page"><RemoteState remote={remote}>{remote.data && <LessonContent key={id} lesson={remote.data} />}</RemoteState></div>
}

function LessonContent({ lesson }) {
  useMerosLocale()
  const [selection, setSelection] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const video = useRef(null)
  const lastSaved = useRef(0)
  const [word, setWord] = useState(null)
  const answer = async () => {
    setBusy(true); setError('')
    try { const { data } = await api.post(`/lessons/${lesson.id}/answer/`, { answer: selection }); setResult(data) }
    catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }
  return <>
    <Link to="/learn" className="meros-back">{tr("← O‘rganish bo‘limi")}</Link>
    <PageHeading eyebrow={`${lesson.audience === 'children' ? tr("7–12 YOSH") : tr("12–18 YOSH")} / ${lesson.series} / ${lesson.episode}${tr('-QISM')}`} title={lesson.title}>{lesson.description}</PageHeading>
    <div className="meros-lesson-layout"><div>
      {lesson.video ? <video ref={video} className="meros-video" controls playsInline preload="metadata" src={lesson.video}
        onLoadedMetadata={() => { const position = Number(stored(`meros-video-${lesson.id}`, 0)); if (position > 0 && position < video.current.duration - 2) video.current.currentTime = position }}
        onTimeUpdate={() => { if (Date.now() - lastSaved.current > 4000) { localStorage.setItem(`meros-video-${lesson.id}`, JSON.stringify(video.current.currentTime)); lastSaved.current = Date.now() } }}
        onError={() => setError(tr("Video faylini ochib bo‘lmadi. Keyinroq qayta urinib ko‘ring."))}>{tr("Brauzeringiz video pleyerni qo‘llab-quvvatlamaydi.")}</video>
        : <div className={`meros-video-placeholder ${lesson.audience}`}><span aria-hidden="true">𐰚</span><h2>{tr("Hikoyani o‘qishdan boshlaymiz")}</h2><p>{tr("Video hali yuklanmagan. Hozircha dars matni va topshiriqdan foydalanishingiz mumkin.")}</p></div>}
      {error && <p className="error-msg" role="alert">{error}</p>}
      {lesson.is_sample && <p className="meros-notice">{tr("O‘quv namunasi. Tayyor videolar loyiha jamoasi tomonidan keyinchalik yuklanadi.")}</p>}
      <section className="meros-transcript"><span className="meros-eyebrow">{tr("HIKOYA MATNI")}</span><h2>{tr("Diqqat bilan o‘qing")}</h2><p>{lesson.transcript || tr("Matn hali kiritilmagan.")}</p></section>
      {lesson.quiz?.question && <section className="meros-quiz"><span className="meros-eyebrow">{tr("O‘ZINGIZNI SINAB KO‘RING")}</span><h2>{lesson.quiz.question}</h2><fieldset disabled={busy || !!result}><legend className="sr-only">{tr("Javobni tanlang")}</legend>{lesson.quiz.options.map((option, index) => <label key={index} className={selection === index ? 'selected' : ''}><input type="radio" name="quiz" checked={selection === index} onChange={() => setSelection(index)} />{option}</label>)}</fieldset>
        {!result ? <button className="btn btn-primary" disabled={selection === null || busy} onClick={answer}>{busy ? tr("Tekshirilmoqda…") : tr("Javobni tekshirish →")}</button> : <div className="meros-quiz-result" role="status"><h3>{result.correct ? tr("To‘g‘ri topdingiz!") : tr("Yana bir bor o‘rganamiz")}</h3><p>{result.explanation}</p><button className="btn btn-outline" onClick={() => { setSelection(null); setResult(null) }}>{tr("Qayta bajarish")}</button></div>}
      </section>}
    </div><aside className="meros-word-sidebar"><SaveButton item={{ key: `lesson-${lesson.id}`, title: lesson.title, to: `/learn/${lesson.id}`, type: 'Dars' }} /><h2>{tr("Darsdagi so‘zlar")}</h2><p>{tr("So‘zni tanlab, uning izohini ko‘ring.")}</p>{lesson.words.map(entry => <button className={`meros-word-chip ${word?.id === entry.id ? 'active' : ''}`} key={entry.id} onClick={() => setWord(entry)}>{entry.word} ↗</button>)}
      {word && <div className="meros-word-detail"><h3>{word.word}</h3><p>{word.meaning}</p><blockquote>{word.example}</blockquote><small>{word.source}</small></div>}
      <Link to="/words" className="meros-text-link">{tr("Lug‘atni ochish →")}</Link>
    </aside></div>
  </>
}
