import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// One observer handles both initial content and asynchronously loaded cards.
export default function MotionEffects() {
  const progress = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const main = document.querySelector('main')
    if (!main) return undefined
    const selector = '[data-reveal], .meros-section-heading, .meros-path, .meros-book-card, .meros-lesson-card, .meros-feature-banner, .meros-collaborate, .meros-page-heading, .card-click, .meros-word-card, .meros-poll'
    let observer
    let mutation
    let frame = 0
    let scrollDistance = 1
    let wasScrolled = null
    let previousProgress = -1
    const observed = new WeakSet()
    const revealAll = () => main.querySelectorAll('.motion-reveal').forEach(node => node.classList.add('is-visible'))
    const connect = () => {
      observer?.disconnect()
      mutation?.disconnect()
      if (preference.matches || !('IntersectionObserver' in window)) {
        revealAll()
        return
      }
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' })
      const register = node => {
        if (!(node instanceof HTMLElement)) return
        const targets = [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]
        targets.forEach(target => {
          if (observed.has(target) || target.classList.contains('is-visible')) return
          observed.add(target)
          // Content already on screen remains visible, including restored scroll positions.
          target.classList.add('motion-reveal')
          observer.observe(target)
        })
      }
      register(main)
      mutation = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(register)))
      mutation.observe(main, { childList: true, subtree: true })
    }
    const updateProgress = () => {
      frame = 0
      const ratio = scrollDistance > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollDistance)) : 0
      if (progress.current && previousProgress !== ratio) progress.current.style.transform = `scaleX(${ratio})`
      previousProgress = ratio
      const scrolled = window.scrollY > 24
      if (scrolled !== wasScrolled) document.documentElement.classList.toggle('page-scrolled', scrolled)
      wasScrolled = scrolled
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateProgress) }
    const measure = () => {
      scrollDistance = document.documentElement.scrollHeight - window.innerHeight
      schedule()
    }
    connect()
    measure()
    preference.addEventListener('change', connect)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    const resize = 'ResizeObserver' in window ? new ResizeObserver(measure) : null
    resize?.observe(main)
    return () => {
      observer?.disconnect()
      mutation?.disconnect()
      resize?.disconnect()
      cancelAnimationFrame(frame)
      preference.removeEventListener('change', connect)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      revealAll()
    }
  }, [pathname])

  return <div className="reading-progress" aria-hidden="true"><span ref={progress} /></div>
}
