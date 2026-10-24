import { Link, useParams } from 'react-router-dom'
import { useRemote, items } from '../mvp/api'
import { RemoteState } from '../mvp/components'
import { useCopy } from '../mvp/copy'

export default function WordArticle() {
  const { id } = useParams()
  const c = useCopy()
  const remote = useRemote(`/words/${id}/`)
  const occurrences = useRemote(`/words/${id}/occurrences/`)
  const word = remote.data
  return <div className="container meros-page"><Link to="/words">← {c('Lug‘at', 'Словарь', 'Dictionary')}</Link><RemoteState remote={remote} empty={!word}>{word && <article><header className="meros-section-heading"><div><span className="meros-eyebrow">{word.reviewed ? c('EKSPERT TEKSHIRGAN', 'ПРОВЕРЕНО ЭКСПЕРТОМ', 'EXPERT REVIEWED') : c('MANBANI TEKSHIRING', 'ПРОВЕРЬТЕ ИСТОЧНИК', 'CHECK THE SOURCE')}</span><h1>{word.word}</h1></div></header><p>{c('Talaffuz', 'Произношение', 'Pronunciation')}: {word.pronunciation || c('Hali kiritilmagan', 'Пока не указано', 'Not yet provided')}</p><h2>{c('Ma’nosi', 'Значение', 'Meaning')}</h2><p>{word.meaning}</p>{word.example && <blockquote>{word.example}</blockquote>}<p>{c('Manba', 'Источник', 'Source')}: {word.source}</p><h2>{c('Turkiy tillardagi muqobillar', 'Соответствия в тюркских языках', 'Modern Turkic equivalents')}</h2>{Object.keys(word.equivalents || {}).length ? <dl>{Object.entries(word.equivalents).map(([language, value]) => <div key={language}><dt>{language}</dt><dd>{value}</dd></div>)}</dl> : <p>{c('Mutaxassislar tomonidan to‘ldiriladi.', 'Будет дополнено специалистами.', 'To be supplied by experts.')}</p>}<h2>{c('Tarixiy matnlarda', 'В исторических текстах', 'In historical texts')}</h2><RemoteState remote={occurrences} empty={!items(occurrences.data).length}><div className="meros-saved-list">{items(occurrences.data).map(line => <article key={`${line.monument}-${line.position}`}><Link to={`/monuments?monument=${line.monument}#line-${line.position}`}>{line.title} · {line.label || line.position} ↗</Link><p>{line.transliteration}</p><p>{line.translation}</p><small>{line.source}</small></article>)}</div></RemoteState>{occurrences.data?.truncated && <p>{c('Dastlabki 100 ta natija ko‘rsatildi.', 'Показаны первые 100 результатов.', 'Showing the first 100 results.')}</p>}<Link className="btn btn-outline" to={`/concordance?q=${encodeURIComponent(word.word)}`}>{c('Konkordansda izlash →', 'Искать в конкордансе →', 'Search concordance →')}</Link></article>}</RemoteState></div>
}
