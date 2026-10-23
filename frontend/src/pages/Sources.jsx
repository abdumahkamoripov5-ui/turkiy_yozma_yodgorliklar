import { translateMvp as tr } from '../mvp/locale'
import { useMerosLocale } from '../mvp/useLocale'
import { items, useRemote } from '../mvp/api'
import { PageHeading, Pagination, RemoteState } from '../mvp/components'
import { useState } from 'react'

export default function Sources() {
  useMerosLocale()
  const [page, setPage] = useState(1)
  const remote = useRemote(`/sources/?page=${page}`)
  const sources = items(remote.data)
  return <div className="container meros-page"><PageHeading eyebrow={tr("MANBALARGA OCHIQ YO‘L")} title={tr("Bog‘langan manbalar")}>{tr("Turkiy yozma merosga aloqador kutubxonalar, lug‘atlar va ilmiy manbalar.")}</PageHeading><RemoteState remote={remote} empty={!sources.length}><div className="meros-research-grid">{sources.map(source => <article className="meros-work" key={source.id}><h2>{source.title}</h2><p>{source.description}</p><a className="meros-text-link" href={source.url} target="_blank" rel="noopener noreferrer">{tr("Manbani ochish ↗")}</a></article>)}</div><Pagination data={remote.data} page={page} setPage={setPage} /></RemoteState><p className="meros-notice">{tr("Tashqi manbalarni admin qo‘shadi. Bu bo‘limdagi havola avtomatik API importi ulanganini anglatmaydi.")}</p></div>
}
