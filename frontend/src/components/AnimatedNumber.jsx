import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value }) {
  const node = useRef(null)
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    let frame
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setDisplay(value)
      return undefined
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = time => {
        const ratio = Math.min(1, (time - start) / 1100)
        setDisplay(Math.round(value * (1 - (1 - ratio) ** 3)))
        if (ratio < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })
    observer.observe(node.current)
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [value])
  return <strong ref={node} aria-label={String(value)}><span aria-hidden="true">{display}</span></strong>
}
