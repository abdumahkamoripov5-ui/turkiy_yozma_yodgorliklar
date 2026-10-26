import { useCallback, useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { useCopy } from '../mvp/copy'

export function FacsimileViewer({ monument, line }) {
  const c = useCopy()
  const [zoom, setZoom] = useState(1)
  const [failed, setFailed] = useState(false)
  const scroll = useRef(null)
  const image = useRef(null)
  const url = line?.facsimile_url || monument.image
  useEffect(() => { setFailed(false); setZoom(1) }, [url])
  const region = line?.image_region
  const hasRegion = region && ['x', 'y', 'width', 'height'].every(key => typeof region[key] === 'number')
  const x = region?.x, y = region?.y, width = region?.width, height = region?.height
  const center = useCallback(() => {
    if (!hasRegion || !scroll.current || !image.current) return
    scroll.current.scrollTo({ left: (x + width / 2) / 100 * image.current.clientWidth - scroll.current.clientWidth / 2,
      top: (y + height / 2) / 100 * image.current.clientHeight - scroll.current.clientHeight / 2, behavior: 'instant' })
  }, [hasRegion, x, y, width, height])
  useEffect(() => { const frame = requestAnimationFrame(center); return () => cancelAnimationFrame(frame) }, [center, zoom])
  if (!url) return null
  return <section className="reading-facsimile" aria-label={c('Surat va satr', 'Фотография и строка', 'Photograph and line')}>
    <header><h3>{c('Asl surat', 'Фотография оригинала', 'Source photograph')}{line && ` · ${line.label || line.position}`}</h3><div className="research-actions"><button type="button" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .5))} aria-label={c('Kichraytirish', 'Уменьшить', 'Zoom out')}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" disabled={zoom >= 3} onClick={() => setZoom(value => Math.min(3, value + .5))} aria-label={c('Kattalashtirish', 'Увеличить', 'Zoom in')}>＋</button><a href={url} target="_blank" rel="noreferrer">{c('Suratni ochish', 'Открыть фото', 'Open image')} ↗</a></div></header>
    {failed ? <p role="status">{c('Surat yuklanmadi. Asl manba havolasidan ochib ko‘ring.', 'Фото не загрузилось. Попробуйте открыть ссылку на оригинал.', 'The image could not load. Try opening its source link.')}</p> : <div className="reading-facsimile-scroll" ref={scroll}><div className="reading-facsimile-image" style={{ width: `${zoom * 100}%` }}><img src={url} ref={image} alt={monument.title} onLoad={center} onError={() => setFailed(true)} />{hasRegion && <span className="reading-region" style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%` }} aria-label={c('Tanlangan satr hududi', 'Область выбранной строки', 'Selected line region')} />}</div></div>}
    <p className="meros-meta">{hasRegion ? c('Belgilangan hudud tanlangan satrga tegishli.', 'Выделенная область относится к выбранной строке.', 'The highlighted region corresponds to the selected line.') : c('Satrni tanlang. Suratdagi hudud mavjud bo‘lsa, ajratib ko‘rsatiladi.', 'Выберите строку: привязанная область изображения будет выделена.', 'Select a line to highlight its image region when one has been mapped.')}</p>
  </section>
}

export function LineNote({ monument, line }) {
  const c = useCopy()
  const workspace = useWorkspace()
  const key = `annotation-${monument.id}-${line.position}`
  const existing = workspace.items.find(item => item.key === key)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError(false)
    try {
      await workspace.save({ key, kind: 'note', title: `${monument.title} · ${line.label || line.position}`,
        target: `/monuments?monument=${monument.id}#line-${line.position}`,
        collection: existing?.collection || c('Satr qaydlari', 'Заметки к строкам', 'Line notes'),
        note: text, payload: { source: line.source || '', text: line.transliteration || line.original } })
      setOpen(false)
    } catch { setError(true) } finally { setBusy(false) }
  }
  return <div className="reading-personal-note"><button type="button" className="meros-text-link" onClick={() => { setText(existing?.note || ''); setOpen(value => !value) }}>{existing ? c('Shaxsiy qaydni ochish', 'Открыть заметку', 'Open personal note') : c('Shaxsiy qayd yozish', 'Написать заметку', 'Add personal note')}</button>{open && <form onSubmit={submit}><label>{c('Faqat siz ko‘radigan izoh', 'Заметка видна только вам', 'A note visible only to you')}<textarea maxLength={10000} required rows={3} value={text} onChange={event => setText(event.target.value)} /></label><button className="btn btn-outline" disabled={busy}>{c('Daftarga saqlash', 'Сохранить в тетрадь', 'Save to notebook')}</button></form>}{error && <p role="alert">{c('Qayd saqlanmadi. Qayta urinib ko‘ring.', 'Заметка не сохранена. Повторите попытку.', 'Note was not saved. Try again.')}</p>}</div>
}

export function ReadingProgress({ monument, position }) {
  const c = useCopy()
  const { save, loading } = useWorkspace()
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (loading) return undefined
    const timer = setTimeout(() => {
      void save({ key: `progress-${monument.id}`, kind: 'progress', title: `${monument.title}${position ? ` · ${position}` : ''}`,
        target: `/monuments?monument=${monument.id}${position ? `#line-${position}` : ''}`,
        collection: '', payload: { position: position || 0, monument: monument.id } }).then(() => setFailed(false)).catch(() => setFailed(true))
    }, 900)
    return () => clearTimeout(timer)
  }, [monument.id, monument.title, position, loading, save])
  return failed ? <p role="status">{c('O‘qish joyi hisobga saqlanmadi. Aloqani tekshiring.', 'Не удалось сохранить место чтения. Проверьте соединение.', 'Reading position could not sync. Check your connection.')}</p> : null
}
