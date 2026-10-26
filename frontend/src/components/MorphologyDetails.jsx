import { Link } from 'react-router-dom'
import { useRemote } from '../mvp/api'
import { useCopy } from '../mvp/copy'

export default function MorphologyDetails({ word }) {
  const c = useCopy()
  const remote = useRemote(word ? `/research/morphology/?q=${encodeURIComponent(word)}` : null)
  if (!word) return null
  return <section className="morphology-details" aria-label={c('Morfologik tahlil', 'Морфологический анализ', 'Morphological analysis')}>
    <h3>{c('Morfologik tahlil', 'Морфологический анализ', 'Morphological analysis')}</h3>
    {remote.loading ? <p role="status">{c('Yuklanmoqda…', 'Загрузка…', 'Loading…')}</p> : remote.error ? <p role="alert">{c('Tahlil yuklanmadi.', 'Не удалось загрузить анализ.', 'Analysis could not load.')} <button type="button" onClick={remote.reload}>{c('Qayta urinish', 'Повторить', 'Retry')}</button></p> : !remote.data?.results.length ? <p className="meros-meta">{c('Bu shakl uchun ekspert tahlili hali kiritilmagan.', 'Для этой формы экспертный анализ ещё не добавлен.', 'No expert-reviewed analysis has been added for this form yet.')}</p> : remote.data.results.map(row => <article key={row.id}>
      <strong>{row.form} → {row.lemma}</strong><dl>{[[c('So‘z turkumi', 'Часть речи', 'Part of speech'), row.part_of_speech], [c('O‘zak', 'Корень', 'Root'), row.root], [c('Tarkibi', 'Состав', 'Segmentation'), row.segmentation], [c('Grammatik belgilar', 'Грамматика', 'Features'), row.features]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="meros-meta">{row.source}</p><div className="research-actions"><Link to={`/corpus?q=${encodeURIComponent(row.lemma)}&mode=lemma`}>{c('Shakllarini korpusdan topish', 'Найти формы в корпусе', 'Find forms in the corpus')} ↗</Link>{row.word_id && <Link to={`/words/${row.word_id}`}>{c('Lug‘at maqolasi', 'Словарная статья', 'Dictionary entry')} ↗</Link>}</div>
    </article>)}
  </section>
}
