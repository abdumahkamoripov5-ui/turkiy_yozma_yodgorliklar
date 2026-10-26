import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCopy } from '../mvp/copy'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageHeading } from '../mvp/components'
import ResearchExport from '../components/ResearchExport'
import SavedQuerySummary from '../components/SavedQuerySummary'
import './research.css'

function NotebookEntry({ item, save, remove, collections }) {
  const c = useCopy()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError(false)
    try { await save(draft); setEditing(false) } catch { setError(true) } finally { setBusy(false) }
  }
  return <article className="notebook-entry">
    {editing ? <form onSubmit={submit} className="notebook-edit">
      <label>{c('Sarlavha', 'Заголовок', 'Title')}<input required maxLength={250} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
      <label>{c('To‘plam', 'Коллекция', 'Collection')}<input list={`collections-${item.id}`} maxLength={100} value={draft.collection} onChange={e => setDraft({ ...draft, collection: e.target.value })} /><datalist id={`collections-${item.id}`}>{collections.map(name => <option key={name}>{name}</option>)}</datalist></label>
      <label>{c('Shaxsiy izoh', 'Личная заметка', 'Personal note')}<textarea rows={5} maxLength={10000} value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} /></label>
      <div className="research-actions"><button className="btn btn-primary" disabled={busy}>{c('Saqlash', 'Сохранить', 'Save')}</button><button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>{c('Bekor qilish', 'Отмена', 'Cancel')}</button></div>
    </form> : <>
      <header><div><span className="meros-eyebrow">{item.collection || c('To‘plamsiz', 'Без коллекции', 'Unfiled')}</span><h2>{item.target ? <Link to={item.target}>{item.title} ↗</Link> : item.title}</h2></div><small>{new Date(item.updated_at).toLocaleDateString()}</small></header>
      {item.note && <p className="notebook-note">{item.note}</p>}
      {item.kind === 'query' && item.payload.params && <SavedQuerySummary params={item.payload.params} />}
      <div className="research-actions"><button type="button" onClick={() => { setDraft(item); setEditing(true) }}>{c('Izoh va to‘plamni tahrirlash', 'Изменить заметку и коллекцию', 'Edit note and collection')}</button><button type="button" onClick={() => setConfirm(true)}>{c('O‘chirish', 'Удалить', 'Delete')}</button></div>
      {confirm && <div className="research-actions" role="group" aria-label={c('O‘chirishni tasdiqlash', 'Подтверждение удаления', 'Confirm deletion')}><span>{c('Ushbu yozuv o‘chirilsinmi?', 'Удалить эту запись?', 'Delete this entry?')}</span><button type="button" disabled={busy} onClick={async () => { setBusy(true); setError(false); try { await remove(item.key) } catch { setError(true); setBusy(false) } }}>{c('Ha, o‘chirish', 'Да, удалить', 'Yes, delete')}</button><button type="button" onClick={() => setConfirm(false)}>{c('Bekor qilish', 'Отмена', 'Cancel')}</button></div>}
    </>}
    {error && <p role="alert">{c('Amal bajarilmadi. Qayta urinib ko‘ring.', 'Не удалось выполнить действие. Повторите попытку.', 'The action failed. Try again.')}</p>}
  </article>
}

export default function ResearchNotebook() {
  const c = useCopy()
  const { items, loading, error, reload, save, remove } = useWorkspace()
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('')
  const [collection, setCollection] = useState('')
  const [limit, setLimit] = useState(30)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState({ title: '', note: '', collection: '' })
  const collections = [...new Set(items.map(item => item.collection).filter(Boolean))].sort()
  const filtered = items.filter(item => (!kind || item.kind === kind) && (!collection || item.collection === collection)
    && `${item.title} ${item.note}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const create = async event => {
    event.preventDefault(); setBusy(true)
    try { await save({ ...draft, key: `note-${crypto.randomUUID()}`, kind: 'note', target: '', payload: {} }); setCreating(false); setDraft({ title: '', note: '', collection: '' }) } catch { /* Shared workspace error remains visible. */ } finally { setBusy(false) }
  }
  return <div className="container meros-page research-page">
    <PageHeading eyebrow={c('SHAXSIY ISH MAYDONI', 'ЛИЧНОЕ ПРОСТРАНСТВО', 'PERSONAL WORKSPACE')} title={c('Tadqiqot daftari', 'Исследовательская тетрадь', 'Research notebook')}>{c('So‘zlar, satrlar, qidiruvlar va izohlaringiz hisobingizga saqlanadi. Boshqa qurilmada ham davom eting.', 'Слова, строки, поиски и заметки сохраняются в вашем аккаунте. Продолжайте на другом устройстве.', 'Words, lines, searches and notes are saved to your account. Continue on another device.')}</PageHeading>
    <div className="research-actions"><button type="button" className="btn btn-primary" onClick={() => setCreating(value => !value)}>{c('Yangi qayd', 'Новая заметка', 'New note')} ＋</button><button type="button" className="btn btn-outline" disabled={loading} onClick={reload}>{c('Yangilash', 'Обновить', 'Refresh')}</button><Link to="/corpus">{c('Korpusda izlash', 'Поиск в корпусе', 'Search corpus')} ↗</Link></div>
    {creating && <form className="notebook-edit notebook-create" onSubmit={create}><label>{c('Sarlavha', 'Заголовок', 'Title')}<input autoFocus required maxLength={250} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label><label>{c('To‘plam', 'Коллекция', 'Collection')}<input maxLength={100} list="new-note-collections" value={draft.collection} onChange={e => setDraft({ ...draft, collection: e.target.value })} /><datalist id="new-note-collections">{collections.map(name => <option key={name}>{name}</option>)}</datalist></label><label>{c('Shaxsiy izoh', 'Личная заметка', 'Personal note')}<textarea required rows={5} maxLength={10000} value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })} /></label><button className="btn btn-primary" disabled={busy}>{c('Qaydni saqlash', 'Сохранить заметку', 'Save note')}</button></form>}
    <div className="research-search-options notebook-filters"><label>{c('Daftardan izlash', 'Поиск в тетради', 'Search notebook')}<input type="search" value={query} onChange={e => { setQuery(e.target.value); setLimit(30) }} /></label><label>{c('Yozuv turi', 'Тип записи', 'Entry type')}<select value={kind} onChange={e => { setKind(e.target.value); setLimit(30) }}><option value="">{c('Barchasi', 'Все', 'All')}</option><option value="bookmark">{c('Saqlanganlar', 'Закладки', 'Bookmarks')}</option><option value="note">{c('Qaydlar', 'Заметки', 'Notes')}</option><option value="query">{c('Qidiruvlar', 'Поиски', 'Searches')}</option><option value="progress">{c('O‘qish tarixi', 'История чтения', 'Reading history')}</option></select></label><label>{c('To‘plam', 'Коллекция', 'Collection')}<select value={collection} onChange={e => { setCollection(e.target.value); setLimit(30) }}><option value="">{c('Barchasi', 'Все', 'All')}</option>{collections.map(name => <option key={name}>{name}</option>)}</select></label></div>
    {loading && <p role="status">{c('Daftar yuklanmoqda…', 'Загрузка тетради…', 'Loading notebook…')}</p>}
    {error && <p role="alert">{c('Hisobdagi yozuvlar bilan aloqa uzildi. Qayta yangilang; saqlanmagan amalni yana bajaring.', 'Нет связи с записями аккаунта. Обновите и повторите несохранённое действие.', 'Could not sync account entries. Refresh and retry the unsaved action.')}</p>}
    {!loading && !error && !filtered.length && <div className="meros-empty"><h2>{c('Hozircha mos yozuv yo‘q', 'Подходящих записей пока нет', 'No matching entries yet')}</h2><p>{c('Matn yoki lug‘atdagi “Saqlash” tugmasini bosing yoki yangi qayd yarating.', 'Нажмите «Сохранить» в тексте или словаре либо создайте заметку.', 'Save a line or word, or create your first note.')}</p></div>}
    <div className="notebook-entries">{filtered.slice(0, limit).map(item => <NotebookEntry key={item.key} item={item} save={save} remove={remove} collections={collections} />)}</div>
    {filtered.length > limit && <button type="button" className="btn btn-outline" onClick={() => setLimit(limit + 30)}>{c('Yana ko‘rsatish', 'Показать ещё', 'Show more')}</button>}
    <ResearchExport endpoint="/workspace/export/" params={{ kind, collection, q: query }} formats={['json', 'csv']} label={c('Shaxsiy daftarni yuklab olish', 'Скачать личную тетрадь', 'Download your notebook')} />
  </div>
}
