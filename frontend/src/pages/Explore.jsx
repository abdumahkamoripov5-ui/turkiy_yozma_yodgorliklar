import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRemote, items } from '../mvp/api'
import { RemoteState } from '../mvp/components'
import { useCopy } from '../mvp/copy'
import StoneJourney from '../components/StoneJourney'
import MonumentModal from '../components/MonumentModal'
import MonumentCard from '../components/MonumentCard'
import PreviewNotice from '../components/PreviewNotice'

export default function Explore() {
  const c = useCopy()
  const remote = useRemote('/monuments/featured/')
  const [selected, setSelected] = useState(null)
  const monuments = items(remote.data)
  return <div className="meros-home"><RemoteState remote={remote} empty={!monuments.length}><StoneJourney monuments={monuments} onSelect={setSelected} /></RemoteState><section id="discover" className="container meros-section"><div className="meros-section-heading"><div><span className="meros-eyebrow">{c('YAQINROQ TANISHING', 'ПОЗНАКОМЬТЕСЬ БЛИЖЕ', 'TAKE A CLOSER LOOK')}</span><h2>{c('Tarixni matnlardan o‘qing.', 'Читайте историю в текстах.', 'Read history through its texts.')}</h2></div><Link to="/words" className="meros-text-link">{c('Lug‘atni ochish →', 'Открыть словарь →', 'Open the dictionary →')}</Link></div><PreviewNotice /><div className="grid grid-2">{monuments.map(monument => <MonumentCard key={monument.id} monument={monument} onClick={setSelected} />)}</div></section>{selected && <MonumentModal monument={selected} onClose={() => setSelected(null)} />}</div>
}
