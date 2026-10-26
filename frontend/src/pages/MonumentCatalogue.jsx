import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRemote } from '../mvp/api'
import { useCopy } from '../mvp/copy'
import { PageHeading, RemoteState } from '../mvp/components'
import MonumentCard from '../components/MonumentCard'
import MonumentModal from '../components/MonumentModal'
import CorpusFilters from '../components/CorpusFilters'
import ResearchExport from '../components/ResearchExport'
import './research.css'

export default function MonumentCatalogue() {
  const c = useCopy()
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState(() => Object.fromEntries(params))
  const [selected, setSelected] = useState(null)
  useEffect(() => {
    setDraft(Object.fromEntries(params))
    const id = params.get('monument')
    setSelected(id && /^\d+$/.test(id) ? { id: Number(id) } : null)
  }, [params])
  const remote = useRemote(`/monuments/?${params}`)
  const current = Object.fromEntries(params)
  const page = Number(params.get('page') || 1)
  const pages = Math.max(1, Math.ceil((remote.data?.count || 0) / 20))
  const close = () => { setSelected(null); if (params.has('monument')) { const next = new URLSearchParams(params); next.delete('monument'); setParams(next, { replace: true }) } }
  return <div className="container meros-page research-page">
    <PageHeading eyebrow={c('ASL MANBALAR', 'ПЕРВОИСТОЧНИКИ', 'ORIGINAL SOURCES')} title={c('Yodgorliklar', 'Памятники', 'Monuments')}>{c('Davr, hudud, yozuv va nashr bo‘yicha tanlang. Matn, surat va ilmiy izohlarni birga o‘qing.', 'Выбирайте по периоду, региону, письменности и изданию. Читайте текст вместе с фотографией и научными примечаниями.', 'Filter by period, location, script and edition. Read texts alongside photographs and scholarly notes.')}</PageHeading>
    <form className="research-search-form" onSubmit={event => { event.preventDefault(); const next = { ...draft, page: '1' }; delete next.monument; setParams(Object.fromEntries(Object.entries(next).filter(([, value]) => value !== ''))) }}><div className="research-search-options"><label className="corpus-filter-wide">{c('Nomi yoki matndan izlash', 'Поиск по названию или тексту', 'Search title or text')}<input type="search" maxLength={150} value={draft.search || ''} onChange={event => setDraft({ ...draft, search: event.target.value })} /></label><label>{c('Saralash', 'Сортировка', 'Sort')}<select value={draft.ordering || 'year'} onChange={event => setDraft({ ...draft, ordering: event.target.value })}><option value="year">{c('Qadimgidan yangiga', 'От ранних к поздним', 'Oldest first')}</option><option value="-year">{c('Yangidan qadimgiga', 'От поздних к ранним', 'Newest first')}</option><option value="title">{c('Nomi bo‘yicha', 'По названию', 'By title')}</option><option value="-views">{c('Ko‘p o‘qilgan', 'Популярные', 'Most read')}</option></select></label></div><CorpusFilters value={draft} onChange={setDraft} /><button type="submit" className="btn btn-primary">{c('Tanlash', 'Применить', 'Apply')}</button></form>
    <RemoteState remote={remote}>{remote.data && <><div className="research-result-heading"><p>{remote.data.count} {c('yodgorlik', 'памятников', 'monuments')}</p><Link to={`/corpus?${new URLSearchParams(Object.entries(current).filter(([key]) => !['search', 'page', 'monument', 'ordering'].includes(key)))}`}>{c('Ushbu korpus ichida izlash', 'Поиск в этом корпусе', 'Search within this corpus')} ↗</Link></div><div className="grid grid-2">{remote.data.results.map(monument => <MonumentCard key={monument.id} monument={monument} onClick={item => { const next = new URLSearchParams(params); next.set('monument', String(item.id)); setParams(next) }} />)}</div>{!remote.data.count && <p className="meros-empty">{c('Mos yodgorlik topilmadi.', 'Памятники не найдены.', 'No matching monuments.')}</p>}{pages > 1 && <nav className="research-pagination" aria-label={c('Sahifalar', 'Страницы', 'Pages')}><button className="btn btn-outline" disabled={page <= 1} onClick={() => setParams({ ...current, page: String(page - 1) })}>←</button><span>{page} / {pages}</span><button className="btn btn-outline" disabled={page >= pages} onClick={() => setParams({ ...current, page: String(page + 1) })}>→</button></nav>}</>}</RemoteState>
    <ResearchExport endpoint="/research/export/" params={current} formats={['tei', 'xlsx', 'csv', 'json']} label={c('Tanlangan korpusni yuklab olish', 'Скачать выбранный корпус', 'Download selected corpus')} />
    {selected && <MonumentModal monument={selected} onClose={close} />}
  </div>
}
