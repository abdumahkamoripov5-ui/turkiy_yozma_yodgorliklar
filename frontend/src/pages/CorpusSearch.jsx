import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRemote } from '../mvp/api'
import { useCopy } from '../mvp/copy'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageHeading, RemoteState, SaveButton } from '../mvp/components'
import CorpusFilters from '../components/CorpusFilters'
import ResearchExport from '../components/ResearchExport'
import './research.css'

export default function CorpusSearch() {
  const c = useCopy()
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState(() => Object.fromEntries(params))
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState('')
  const [saving, setSaving] = useState(false)
  const { save, items } = useWorkspace()
  useEffect(() => { setDraft(Object.fromEntries(params)); setCopied(''); setNotice('') }, [params])
  const remote = useRemote(params.get('q') ? `/research/search/?${params}` : null)
  const current = Object.fromEntries(params)
  const set = (key, value) => setDraft(previous => ({ ...previous, [key]: value }))
  const submit = event => {
    event.preventDefault()
    setParams(new URLSearchParams(Object.entries({ ...draft, q: (draft.q || '').trim(), page: '1' }).filter(([, value]) => value !== '')))
  }
  const saveQuery = async () => {
    setSaving(true)
    try {
      const entries = Object.entries(current).filter(([key]) => key !== 'page').sort(([left], [right]) => left.localeCompare(right))
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(entries)))
      const key = 'query-' + [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
      const existing = items.find(item => item.key === key)
      await save({ key, kind: 'query', title: current.q,
        collection: existing?.collection || c('Qidiruvlar', 'Поиски', 'Searches'), target: `/corpus?${new URLSearchParams(entries)}`, payload: { params: Object.fromEntries(entries) } })
      setNotice(c('Qidiruv daftaringizga saqlandi.', 'Поиск сохранён в вашей тетради.', 'Search saved to your notebook.'))
    } catch { setNotice(c('Saqlab bo‘lmadi. Qayta urinib ko‘ring.', 'Не удалось сохранить. Повторите попытку.', 'Could not save. Try again.')) } finally { setSaving(false) }
  }
  return <div className="container meros-page research-page">
    <PageHeading eyebrow={c('KORPUS BILAN ISHLASH', 'РАБОТА С КОРПУСОМ', 'CORPUS WORKSPACE')} title={c('Qidiruv va konkordans', 'Поиск и конкорданс', 'Search and concordance')}>{c('So‘z yoki iborani toping. Natijadan asl satr, lug‘at va manbaga o‘ting.', 'Найдите слово или фразу. Перейдите из результата к строке, словарю и источнику.', 'Find a word or phrase, then follow it to its original line, dictionary and source.')}</PageHeading>
    <form onSubmit={submit} className="research-search-form">
      <label className="research-query">{c('So‘z yoki ibora', 'Слово или фраза', 'Word or phrase')}<input type="search" required maxLength={150} value={draft.q || ''} onChange={e => set('q', e.target.value)} placeholder={c('Masalan: bodun', 'Например: bodun', 'For example: bodun')} /></label>
      <div className="research-search-options">
        <label>{c('Qayerdan izlash', 'Где искать', 'Search in')}<select value={draft.field || 'all'} onChange={e => set('field', e.target.value)}><option value="all">{c('Barcha matnlar', 'Все тексты', 'All text layers')}</option><option value="original">{c('Asl yozuv', 'Оригинал', 'Original')}</option><option value="transliteration">{c('Transliteratsiya', 'Транслитерация', 'Transliteration')}</option><option value="translation">{c('Tarjima', 'Перевод', 'Translation')}</option></select></label>
        <label>{c('Qidiruv usuli', 'Режим поиска', 'Search mode')}<select value={draft.mode || 'word'} onChange={e => set('mode', e.target.value)}><option value="word">{c('Butun so‘z', 'Целое слово', 'Whole word')}</option><option value="substring">{c('So‘zning bir qismi', 'Часть слова', 'Substring')}</option><option value="phrase">{c('Ibora', 'Фраза', 'Phrase')}</option><option value="lemma">{c('Lemma va tekshirilgan shakllar', 'Лемма и проверенные формы', 'Lemma and reviewed forms')}</option></select></label>
        <label>{c('Kontekst hajmi', 'Размер контекста', 'Context size')}<select value={draft.context || '60'} onChange={e => set('context', e.target.value)}>{[30, 60, 120, 250].map(size => <option key={size}>{size}</option>)}</select></label>
        <label>{c('Saralash', 'Сортировка', 'Sort')}<select value={draft.sort || 'source'} onChange={e => set('sort', e.target.value)}>{[['source', c('Manba tartibida', 'По источнику', 'Source order')], ['left', c('Chapdagi so‘zlar', 'Левый контекст', 'Left context')], ['right', c('O‘ngdagi so‘zlar', 'Правый контекст', 'Right context')], ['match', c('Topilgan shakl', 'Найденная форма', 'Matched form')], ['title', c('Yodgorlik nomi', 'Название памятника', 'Monument title')]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <div className="research-checks"><label><input type="checkbox" checked={draft.normalize !== '0'} onChange={e => set('normalize', e.target.checked ? '1' : '0')} />{c('Apostrofning turli yozilishini birga izlash', 'Учитывать варианты апострофа', 'Match apostrophe variants')}</label><label><input type="checkbox" checked={draft.case_sensitive === '1'} onChange={e => set('case_sensitive', e.target.checked ? '1' : '0')} />{c('Katta-kichik harfni farqlash', 'Учитывать регистр', 'Case sensitive')}</label></div>
      <CorpusFilters value={draft} onChange={setDraft} />
      <button className="btn btn-primary" disabled={remote.loading} type="submit">{c('Korpusdan izlash', 'Искать в корпусе', 'Search corpus')} ↗</button>
    </form>
    {params.get('q') && <RemoteState remote={remote}>{remote.data && <>
      <div className="research-result-heading"><p aria-live="polite"><strong>{remote.data.count}{remote.data.truncated ? '+' : ''}</strong> {c('natija', 'результатов', 'matches')} · {remote.data.document_count} {c('yodgorlik tanlangan', 'памятников выбрано', 'monuments selected')}</p><button type="button" className="btn btn-outline" disabled={saving} onClick={saveQuery}>{c('Qidiruvni saqlash', 'Сохранить поиск', 'Save search')}</button></div>
      {current.mode === 'lemma' && <p className="research-help">{c('Lemma qidiruvi faqat ekspert kiritgan shakllarni qo‘shadi.', 'Поиск по лемме включает только проверенные формы.', 'Lemma search adds only expert-reviewed forms.')} {remote.data.analysis_count} {c('tahlil topildi', 'анализов найдено', 'analyses found')}.</p>}
      {notice && <p role="status">{notice}</p>}
      {remote.data.truncated && <p role="status">{c('10 000 ta natija chegarasiga yetildi. Filtrlarni toraytiring.', 'Достигнут лимит 10 000 результатов. Уточните фильтры.', 'The 10,000-match limit was reached. Narrow the filters.')}</p>}
      {!remote.data.results.length && <p className="meros-empty">{c('Mos natija topilmadi. Yozilishni yoki filtrlarni o‘zgartiring.', 'Ничего не найдено. Измените написание или фильтры.', 'No matches. Change the spelling or filters.')}</p>}
      <div className="kwic-results">{remote.data.results.map((row, index) => <article className="kwic-result" key={`${row.monumentId}-${row.field_key}-${row.position}-${index}`}>
        <header><Link to={row.target}>{row.monumentTitle} · {row.label} ↗</Link><span>{row.year} · {row.field}</span></header>
        <div className="kwic-context"><span className="kwic-left">{row.left}</span><mark>{row.match}</mark><span>{row.right}</span></div>
        {row.source && <p className="meros-meta">{row.source}</p>}
        <div className="research-actions"><SaveButton item={{ key: `line-${row.monumentId}-${row.position}`, title: `${row.monumentTitle} · ${row.label}`, to: row.target, type: 'line' }} /><Link to={`/words?search=${encodeURIComponent(row.match)}`}>{c('Lug‘at', 'Словарь', 'Dictionary')}</Link><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(row.citation); setCopied(String(index)) } catch { setNotice(c('Nusxalab bo‘lmadi.', 'Не удалось скопировать.', 'Could not copy.')) } }}>{copied === String(index) ? '✓' : c('Iqtibosni nusxalash', 'Копировать цитату', 'Copy citation')}</button></div>
      </article>)}</div>
      <nav className="research-pagination" aria-label={c('Natija sahifalari', 'Страницы результатов', 'Result pages')}><button type="button" className="btn btn-outline" disabled={remote.data.page <= 1} onClick={() => setParams({ ...current, page: String(remote.data.page - 1) })}>← {c('Oldingi', 'Назад', 'Previous')}</button><span>{remote.data.page} / {Math.max(1, Math.ceil(remote.data.count / remote.data.page_size))}</span><button type="button" className="btn btn-outline" disabled={remote.data.page * remote.data.page_size >= remote.data.count} onClick={() => setParams({ ...current, page: String(remote.data.page + 1) })}>{c('Keyingi', 'Далее', 'Next')} →</button></nav>
      <ResearchExport endpoint="/research/search/" params={current} label={c('Barcha topilgan natijalar', 'Все найденные результаты', 'All matching results')} />
    </>}</RemoteState>}
    <div className="research-related"><Link to={`/frequent-words?${new URLSearchParams(Object.entries(current).filter(([key]) => !['q', 'mode', 'field', 'page'].includes(key)))}`}>{c('Tanlangan korpus statistikasi', 'Статистика выбранного корпуса', 'Selected corpus statistics')} ↗</Link><Link to="/saved">{c('Tadqiqot daftari', 'Исследовательская тетрадь', 'Research notebook')} ↗</Link></div>
    <ResearchExport endpoint="/research/export/" params={current} formats={['tei', 'xlsx', 'csv', 'json']} label={c('Tanlangan yodgorliklarni eksport qilish', 'Экспорт выбранных памятников', 'Export selected monuments')} />
  </div>
}
