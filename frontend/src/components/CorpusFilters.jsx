import { useRemote } from '../mvp/api'
import { useCopy } from '../mvp/copy'

export default function CorpusFilters({ value, onChange }) {
  const c = useCopy()
  const options = useRemote('/research/options/')
  const set = (key, next) => onChange({ ...value, [key]: next })
  const selected = (value.monuments || '').split(',').filter(Boolean)
  return <details className="corpus-filters">
    <summary>{c('Korpusni tanlash va filtrlar', 'Выбор корпуса и фильтры', 'Corpus selection and filters')}{selected.length ? ` · ${selected.length}` : ''}</summary>
    {options.error && <p role="alert">{c('Filtrlar yuklanmadi.', 'Фильтры не загрузились.', 'Filters could not load.')} <button type="button" onClick={options.reload}>{c('Qayta urinish', 'Повторить', 'Retry')}</button></p>}
    <div className="corpus-filter-grid">
      <label>{c('Yozuv turi', 'Письменность', 'Script')}<select value={value.script || ''} onChange={e => set('script', e.target.value)}><option value="">{c('Barchasi', 'Все', 'All')}</option>{options.data?.scripts.map(row => <option key={row.value} value={row.value}>{row.label}</option>)}</select></label>
      <label>{c('Janr', 'Жанр', 'Category')}<select value={value.category || ''} onChange={e => set('category', e.target.value)}><option value="">{c('Barchasi', 'Все', 'All')}</option>{options.data?.categories.map(row => <option key={row.value} value={row.value}>{row.label}</option>)}</select></label>
      <label>{c('Til', 'Язык', 'Language')}<select value={value.language || ''} onChange={e => set('language', e.target.value)}><option value="">{c('Barchasi', 'Все', 'All')}</option>{options.data?.languages.map(row => <option key={row}>{row}</option>)}</select></label>
      <label>{c('Hudud', 'Регион', 'Location')}<input value={value.location || ''} onChange={e => set('location', e.target.value)} maxLength={250} /></label>
      <label>{c('Boshlanish yili', 'С года', 'From year')}<input type="number" min="-10000" max="10000" value={value.year_min || ''} onChange={e => set('year_min', e.target.value)} /></label>
      <label>{c('Tugash yili', 'До года', 'To year')}<input type="number" min="-10000" max="10000" value={value.year_max || ''} onChange={e => set('year_max', e.target.value)} /></label>
      <label className="corpus-filter-wide">{c('Nashr / manba', 'Издание / источник', 'Edition / source')}<input maxLength={250} value={value.source || ''} onChange={e => set('source', e.target.value)} /></label>
      <fieldset className="corpus-filter-wide"><legend>{c('Alohida yodgorliklar', 'Отдельные памятники', 'Individual monuments')}</legend><p className="meros-meta">{c('Tanlanmasa, filtrga mos barcha yodgorliklar olinadi.', 'Без выбора используются все памятники, соответствующие фильтрам.', 'Leave unselected to use all monuments matching the filters.')}</p><div className="corpus-monument-options">{options.data?.monuments.map(row => <label key={row.id}><input type="checkbox" checked={selected.includes(String(row.id))} onChange={e => set('monuments', (e.target.checked ? [...selected, String(row.id)] : selected.filter(id => id !== String(row.id))).join(','))} /> {row.title} <small>{row.year}</small></label>)}</div></fieldset>
    </div>
    <button type="button" className="meros-text-link" onClick={() => onChange(Object.fromEntries(Object.entries(value).filter(([key]) => !['script', 'category', 'language', 'location', 'year_min', 'year_max', 'source', 'monuments'].includes(key))))}>{c('Filtrlarni tozalash', 'Сбросить фильтры', 'Clear filters')}</button>
  </details>
}
