import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCopy } from '../mvp/copy'
import { PageHeading } from '../mvp/components'
import MorphologyDetails from '../components/MorphologyDetails'
import './research.css'

export default function Morphology() {
  const c = useCopy()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  return <div className="container meros-page research-page"><PageHeading eyebrow={c('EKSPERT TAHLILLARI', 'ЭКСПЕРТНЫЙ АНАЛИЗ', 'EXPERT ANALYSES')} title={c('Lemma va so‘z shakllari', 'Леммы и словоформы', 'Lemmas and word forms')}>{c('Matndagi so‘zning bosh shakli, o‘zagi va grammatik izohlarini manbasi bilan ko‘ring.', 'Смотрите лемму, корень и грамматические пояснения к словоформе с источниками.', 'View the lemma, root and grammatical explanation of a word form with its source.')}</PageHeading><form className="research-search-form research-actions" onSubmit={event => { event.preventDefault(); setParams({ q: query.trim() }) }}><label>{c('So‘z yoki lemma', 'Форма или лемма', 'Word form or lemma')}<input required maxLength={150} value={query} onChange={event => setQuery(event.target.value)} /></label><button className="btn btn-primary">{c('Tahlilni ko‘rish', 'Показать анализ', 'Show analysis')}</button></form>{params.get('q') && <MorphologyDetails word={params.get('q')} />}</div>
}
