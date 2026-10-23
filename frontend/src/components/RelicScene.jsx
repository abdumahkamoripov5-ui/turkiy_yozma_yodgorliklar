import { useEffect, useRef, useState } from 'react'

export default function RelicScene() {
  const scene = useRef(null)
  const object = useRef(null)
  const frame = useRef(0)
  const [spinning, setSpinning] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { setReduced(preference.matches); if (preference.matches) setSpinning(false) }
    preference.addEventListener('change', update)
    return () => { preference.removeEventListener('change', update); cancelAnimationFrame(frame.current) }
  }, [])

  const tilt = event => {
    if (reduced || spinning || event.pointerType === 'touch') return
    const bounds = scene.current.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      object.current?.style.setProperty('--relic-x', `${-10 - y * 18}deg`)
      object.current?.style.setProperty('--relic-y', `${-24 + x * 35}deg`)
    })
  }
  const reset = () => {
    cancelAnimationFrame(frame.current)
    object.current?.style.removeProperty('--relic-x')
    object.current?.style.removeProperty('--relic-y')
  }

  return <div className="relic-exhibit" ref={scene} onPointerMove={tilt} onPointerLeave={reset}>
    <div className="exhibit-topline"><span className="exhibit-live-dot" /> RAQAMLI MEROS <span>01 / 03</span></div>
    <div className="relic-world" aria-hidden="true">
      <div className="relic-aura" />
      <div className="relic-orbit orbit-one" /><div className="relic-orbit orbit-two" />
      <div className="relic-star star-one">✧</div><div className="relic-star star-two">✧</div><div className="relic-star star-three">·</div>
      <div className="relic-levitate"><div ref={object} className={`relic-object${spinning && !reduced ? ' is-spinning' : ''}`}>
        <div className="relic-face relic-front"><span className="relic-crest">✳</span><span className="relic-inscription">𐱅𐰇𐰼𐰚</span><span className="relic-inscription">𐰉𐰃𐱅𐰃𐰏</span><span className="relic-inscription">𐰋𐰃𐰠𐰏𐰀</span><div className="relic-etchings" /><span className="relic-seal">𐰃</span></div>
        <div className="relic-face relic-back"><span>𐰴</span><small>TURKIY<br />MEROS</small></div>
        <div className="relic-side relic-right" /><div className="relic-side relic-left" />
      </div></div>
      <div className="relic-pedestal" /><div className="relic-ground-shadow" />
      <div className="relic-floating-note note-script"><span>𐱅</span><div>Asl bitik<small>Har bir belgi — xotira.</small></div></div>
      <div className="relic-floating-note note-meaning"><span>↗</span><div>Yangi ma’no<small>O‘tmishdan kelajakka.</small></div></div>
    </div>
    <div className="exhibit-bottom"><div><span>YOZMA MEROS TIMSOLI</span><p>Tarixga boshqa tomondan qarang.</p></div>
      {!reduced && <button type="button" className="relic-control" onClick={() => { reset(); setSpinning(value => !value) }} aria-pressed={spinning} aria-label={spinning ? '3D bitik aylanishini to‘xtatish' : '3D bitikni aylantirish'}><span aria-hidden="true">{spinning ? 'Ⅱ' : '⟳'}</span>{spinning ? 'To‘xtatish' : 'Aylantirish'}</button>}
    </div>
  </div>
}
