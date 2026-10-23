import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const clamp = value => Math.min(1, Math.max(0, value))
const symbols = ['𐱅𐰇𐰼𐰚', '𐰋𐰃𐰠𐰏𐰀', '𐰉𐰃𐱅𐰃𐰏', '𐰚𐰇𐰠']

export default function StoneJourney({ monuments, onSelect }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const section = useRef(null)
  const world = useRef(null)
  const stage = useRef(null)
  const progressBar = useRef(null)
  const [current, setCurrent] = useState(0)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const stones = monuments.slice(0, 8)
  const rows = Math.max(1, Math.ceil(stones.length / 2))
  const travel = rows * 540 + 100

  useEffect(() => {
    document.documentElement.classList.add('immersive-home')
    return () => document.documentElement.classList.remove('immersive-home')
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(preference.matches)
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (reduced) return undefined
    let frame = 0
    let previous = -1
    let previousIndex = -1
    let previousStarted = null
    let previousFinished = null
    let visualProgress = -1
    let lastTime = 0
    let needsMeasure = true
    let navbarHeight = -1
    const geometry = { start: 0, range: 1 }
    const navbar = document.querySelector('.navbar-blur')
    const update = (time = performance.now()) => {
      frame = 0
      if (!section.current || !world.current) return
      // Geometry is measured only on resize/content changes, never on ordinary scroll frames.
      if (needsMeasure) {
        const height = navbar?.offsetHeight || 0
        if (height !== navbarHeight) {
          section.current.style.setProperty('--museum-nav-height', `${height}px`)
          navbarHeight = height
        }
        geometry.start = section.current.getBoundingClientRect().top + window.scrollY - height
        geometry.range = Math.max(1, section.current.offsetHeight - stage.current.offsetHeight)
        needsMeasure = false
      }
      const target = clamp((window.scrollY - geometry.start) / geometry.range)
      const delta = lastTime && time - lastTime < 100 ? time - lastTime : 16.67
      lastTime = time
      visualProgress = visualProgress < 0 ? target : visualProgress + (target - visualProgress) * (1 - Math.exp(-delta / 55))
      if (Math.abs(target - visualProgress) < 0.0001) visualProgress = target
      const ratio = visualProgress
      if (ratio !== target) frame = requestAnimationFrame(update)
      if (ratio === previous) return
      previous = ratio
      // Two compositor transforms per frame; React and scene attributes change at boundaries only.
      world.current.style.transform = `translateZ(${(ratio * travel).toFixed(2)}px)`
      const finished = ratio > 0.94
      const started = ratio > 0.07
      if (finished !== previousFinished) {
        stage.current.dataset.finished = String(finished)
        previousFinished = finished
      }
      if (started !== previousStarted) {
        stage.current.dataset.started = String(started)
        previousStarted = started
      }
      if (progressBar.current) progressBar.current.style.transform = `scaleX(${ratio})`
      const index = Math.min(Math.max(0, stones.length - 1), Math.floor(ratio * stones.length))
      if (index !== previousIndex) {
        previousIndex = index
        setCurrent(index)
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const invalidate = () => {
      needsMeasure = true
      schedule()
    }
    const resize = 'ResizeObserver' in window ? new ResizeObserver(invalidate) : null
    if (navbar) resize?.observe(navbar)
    resize?.observe(section.current)
    resize?.observe(stage.current)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', invalidate)
    update()
    return () => {
      cancelAnimationFrame(frame)
      resize?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', invalidate)
    }
  }, [reduced, stones.length, travel])

  const active = stones[current] || stones[0]
  return <section id="stone-journey" ref={section} className={`stone-journey${reduced ? ' journey-reduced' : ''}`} aria-labelledby="journey-title">
    <div className="journey-stage" ref={stage}>
      <div className="journey-sky" aria-hidden="true" /><div className="journey-mountains" aria-hidden="true" />
      <div className="journey-topbar container"><span><span className="journey-compass" aria-hidden="true">✳</span> TURKIY MEROS / RAQAMLI MUZEY</span><a href="#discover">Bo‘limlarga o‘tish <span aria-hidden="true">↘</span></a></div>
      <span className="journey-side-label" aria-hidden="true">TOSHGA BITILGAN XOTIRA</span>
      <div className="journey-intro"><span className="journey-edition"><i /> O‘TMISHGA OCHILGAN ESHIK</span><h1 id="journey-title">Ming yillik meros.<br /><em>Bir qadam yaqinroq.</em></h1><p>Bitiktoshlar orasidan yuring. So‘zlar ortidagi tarixni kashf eting.</p>
        <form className="journey-search" onSubmit={event => { event.preventDefault(); navigate(`/monuments?search=${encodeURIComponent(query)}`) }}><span aria-hidden="true">⌕</span><input aria-label="Yodgorliklarni qidirish" placeholder="Qaysi bitikni izlayapsiz?" value={query} onChange={event => setQuery(event.target.value)} /><button type="submit">Izlash <span aria-hidden="true">↗</span></button></form>
        <div className="journey-entry-links"><Link to="/monuments">Yodgorliklar <span aria-hidden="true">↗</span></Link><span aria-hidden="true">/</span><Link to="/library">Kitobxona <span aria-hidden="true">↗</span></Link></div>
        {!reduced && <div className="journey-scroll-prompt"><span className="journey-scroll-mark" aria-hidden="true">↓</span><span>SCROLL QILING. SAYOHAT BOSHLANADI.</span></div>}
      </div>
      <div className="journey-atmosphere" aria-hidden="true" />
      {!reduced && <div className="journey-viewport" aria-hidden="true"><div className="journey-world" ref={world}>
        <div className="journey-floor"><div className="journey-trail" /></div>
        {stones.map((monument, index) => <div className={`journey-monument stone-tone-${index % 3}`} key={monument.id} style={{
          '--side': index % 2 ? 1 : -1,
          '--depth': `${-400 - Math.floor(index / 2) * 540 - (index % 2) * 100}px`,
          '--stone-height': `${280 + (index % 3) * 35}px`,
          '--stone-yaw': `${index % 2 ? -14 : 14}deg`,
        }}>
          <div className="journey-stone-front"><span className="journey-stone-emblem">✳</span><span className="journey-carving">{symbols[index % symbols.length]}</span><span className="journey-carving">{symbols[(index + 1) % symbols.length]}</span><span className="journey-carving">{symbols[(index + 2) % symbols.length]}</span><div className="journey-stone-lines" /><span className="journey-stone-title">{monument.title}</span><span className="journey-stone-year">{monument.year < 0 ? `${Math.abs(monument.year)} m.av.` : monument.year}</span></div>
          <div className="journey-stone-edge edge-left" /><div className="journey-stone-edge edge-right" /><div className="journey-stone-foot" />
        </div>)}
      </div></div>}
      {!reduced && <div className="journey-end"><span>BU — FAQAT BOSHLANISHI</span><h3>Har bir bitikda<br />yangi bir olam.</h3><Link to="/monuments">Korpusni ochish <span aria-hidden="true">↗</span></Link></div>}
      {reduced && <div className="journey-static-list">{stones.map(monument => <button type="button" key={monument.id} onClick={() => onSelect(monument)}><span aria-hidden="true">𐰃</span><strong>{monument.title}</strong><span>O‘qish ↗</span></button>)}</div>}
      <div className="journey-bottom container"><div className="journey-current"><span>YAQINROQ TANISHING</span>{active ? <button type="button" onClick={() => onSelect(active)}>{active.title} <span aria-hidden="true">↗</span></button> : <Link to="/monuments">Yodgorliklar korpusi ↗</Link>}</div><div className="journey-distance"><span>{stones.length ? `${String(current + 1).padStart(2, '0')} / ${String(stones.length).padStart(2, '0')}` : 'SAYOHAT'}<small>Badiiy 3D sayohat</small></span><div><span ref={progressBar} /></div></div></div>
    </div>
  </section>
}
