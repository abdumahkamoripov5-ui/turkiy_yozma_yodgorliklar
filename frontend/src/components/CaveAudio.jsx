import { useEffect, useRef, useState } from 'react'
import { useCopy } from '../mvp/copy'
import { createCaveAudio } from './cave-audio'

export default function CaveAudio() {
  const c = useCopy()
  const engine = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(.45)
  const [error, setError] = useState(false)
  useEffect(() => {
    const visibility = () => {
      const audio = engine.current
      if (!audio) return
      void (document.hidden ? audio.pause() : audio.play()).catch(() => {
        audio.stop()
        if (engine.current === audio) { engine.current = null; setPlaying(false); setError(true) }
      })
    }
    document.addEventListener('visibilitychange', visibility)
    return () => { document.removeEventListener('visibilitychange', visibility); engine.current?.stop(); engine.current = null }
  }, [])
  const toggle = async () => {
    if (engine.current) {
      engine.current.stop()
      engine.current = null
      setPlaying(false)
      return
    }
    setError(false)
    let audio
    try {
      audio = createCaveAudio(volume)
      engine.current = audio
      await audio.play()
      if (engine.current === audio) setPlaying(true)
    } catch {
      audio?.stop()
      if (!audio || engine.current === audio) {
        engine.current = null
        setPlaying(false)
        setError(true)
      }
    }
  }
  return <div className="cave-audio">
    <button type="button" onClick={toggle} aria-pressed={playing} aria-label={playing ? c('Fon musiqasini o‘chirish', 'Выключить музыку', 'Turn background music off') : c('Fon musiqasini yoqish', 'Включить музыку', 'Turn background music on')}>
      <span aria-hidden="true">{playing ? 'Ⅱ' : '♫'}</span> {c('Musiqa', 'Музыка', 'Music')}
    </button>
    {playing && <label className="cave-volume"><span>{c('Ovoz', 'Громкость', 'Volume')}</span><input type="range" min="0" max="1" step=".05" value={volume} onChange={event => { const value = Number(event.target.value); setVolume(value); engine.current?.setVolume(value) }} /></label>}
    {error && <span className="cave-audio-error" role="status">{c('Musiqa yoqilmadi. Qayta urinib ko‘ring.', 'Не удалось включить музыку. Попробуйте ещё раз.', 'Music could not start. Try again.')}</span>}
  </div>
}
