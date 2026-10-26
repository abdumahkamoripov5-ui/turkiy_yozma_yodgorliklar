import { useEffect, useRef } from 'react'
import entrance from '../assets/caves/cave-grounded-v2.webp'
import interior from '../assets/caves/cave-interior-v2.webp'
import chamber from '../assets/caves/cave-arrival-v3.webp'

const clamp = value => Math.max(0, Math.min(1, value))

// Stones, contact shadows and cave lighting are baked into each chamber.
// Modest camera movement preserves detail; successive chambers supply depth.
export default function CaveJourney({ motion, nativeScroll }) {
  const world = useRef(null)
  const deep = useRef(null)
  const arrival = useRef(null)
  useEffect(() => {
    if (nativeScroll) return undefined
    const state = motion.current
    const draw = () => {
      const p = state.progress
      const first = clamp(p / .48)
      const second = clamp((p - .22) / .58)
      const final = clamp((p - .60) / .40)
      world.current.style.transform = `scale(${1 + first * .72}) translate3d(0,${-first * 2}%,0)`
      deep.current.style.transform = `scale(${1 + second * .52}) translate3d(0,${-second * 3}%,0)`
      deep.current.style.opacity = String(clamp((p - .22) / .20))
      arrival.current.style.transform = `scale(${1 + final * .22}) translate3d(0,${-final * 4}%,0)`
      arrival.current.style.opacity = String(clamp((p - .60) / .22))
    }
    state.invalidate = draw
    draw()
    return () => { if (state.invalidate === draw) delete state.invalidate }
  }, [motion, nativeScroll])
  return <div className="cave-viewport" aria-hidden="true">
    <div className="cave-world" ref={world}>
      <img className="cave-photograph" src={entrance} alt="" width="1672" height="941" fetchPriority="high" />
    </div>
    <div className="cave-deep" ref={deep}>
      <img className="cave-photograph" src={interior} alt="" width="1672" height="941" decoding="async" />
    </div>
    <div className="cave-arrival" ref={arrival}>
      <img className="cave-photograph" src={chamber} alt="" width="1672" height="940" decoding="async" />
    </div>
    <div className="cave-vignette" />
  </div>
}
