import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { items, useRemote } from '../mvp/api'
import { LessonCard, PageHeading, Pagination, RemoteState } from '../mvp/components'

export default function Learn() {
  const [params, setParams] = useSearchParams()
  const age = ['children', 'teens'].includes(params.get('age')) ? params.get('age') : ''
  const [page, setPage] = useState(1)
  const remote = useRemote(`/lessons/?audience=${age}&page=${page}`)
  const lessons = items(remote.data)
  return <div className="container meros-page"><PageHeading eyebrow="KICHIK HIKOYALAR. KATTA KASHFIYOTLAR." title="Merosni birga o‘rganamiz">So‘zlar hikoyaga aylanadi. Yoshga mos darslar, multfilmlar, anime va qiziqarli topshiriqlar.</PageHeading>
    <div className="meros-tabs" role="group" aria-label="Yosh guruhi">{[['', 'Barchasi'], ['children', '7–12 yosh · Multfilmlar'], ['teens', '12–18 yosh · Anime']].map(([value, label]) => <button key={value} aria-pressed={age === value} className={age === value ? 'active' : ''} onClick={() => { setParams(value ? { age: value } : {}); setPage(1) }}>{label}</button>)}</div>
    <RemoteState remote={remote} empty={!lessons.length}><div className="meros-lessons-grid">{lessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} />)}</div><Pagination data={remote.data} page={page} setPage={setPage} /></RemoteState>
    <div className="meros-learning-note"><span aria-hidden="true">✦</span><div><h2>Ko‘ring. So‘zni toping. Ma’nosini kashf eting.</h2><p>Har bir darsda lug‘atga bog‘langan so‘zlar va o‘zingizni sinab ko‘rish uchun topshiriq bor.</p></div></div>
  </div>
}
