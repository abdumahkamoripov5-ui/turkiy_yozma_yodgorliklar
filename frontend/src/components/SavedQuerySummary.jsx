import { useCopy } from '../mvp/copy'

export default function SavedQuerySummary({ params: rawParams }) {
  const params = Object.fromEntries(Object.entries(rawParams && typeof rawParams === 'object' ? rawParams : {}).filter(([, value]) => typeof value === 'string'))
  const c = useCopy()
  const fields = { all: c('Barcha matnlar', 'Все тексты', 'All text layers'), original: c('Asl yozuv', 'Оригинал', 'Original'), transliteration: c('Transliteratsiya', 'Транслитерация', 'Transliteration'), translation: c('Tarjima', 'Перевод', 'Translation') }
  const modes = { word: c('Butun so‘z', 'Целое слово', 'Whole word'), substring: c('So‘zning bir qismi', 'Часть слова', 'Substring'), phrase: c('Ibora', 'Фраза', 'Phrase'), lemma: c('Lemma', 'Лемма', 'Lemma') }
  const parts = [fields[params.field || 'all'], modes[params.mode || 'word'], params.language, params.location, params.source,
    params.year_min || params.year_max ? `${params.year_min || '…'} — ${params.year_max || '…'}` : '',
    params.monuments ? `${params.monuments.split(',').filter(Boolean).length} ${c('yodgorlik', 'памятников', 'monuments')}` : '']
  return <p className="meros-meta">{parts.filter(Boolean).join(' · ')}</p>
}
