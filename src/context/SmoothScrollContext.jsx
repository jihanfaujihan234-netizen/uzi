import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SmoothScrollContext = createContext(null)

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null)
  const lastScrollRef = useRef(0)
  const location = useLocation()
  const sectionTarget = location.state?.scrollTo
  const prevPathRef = useRef(location.pathname)

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reduceMotion) return undefined

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const trackScroll = () => {
      lastScrollRef.current = window.scrollY
    }
    window.addEventListener('scroll', trackScroll, { passive: true })

    const tick = time => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      window.removeEventListener('scroll', trackScroll)
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = useCallback((target, options = {}) => {
    const lenis = lenisRef.current
    if (lenis) {
      if (options.immediate) lenis.resize()
      lenis.scrollTo(target, options)
      return
    }

    const top =
      typeof target === 'number'
        ? target
        : (target?.getBoundingClientRect().top ?? 0) + window.scrollY

    window.scrollTo({
      top: top + (options.offset ?? 0),
      behavior: options.immediate ? 'auto' : 'smooth',
    })
  }, [])

  const stop = useCallback(() => {
    lenisRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    lenisRef.current?.start()
  }, [])

  useEffect(() => {
    const previous = prevPathRef.current
    if (previous === location.pathname) return undefined

    try {
      sessionStorage.setItem(`scroll:${previous}`, String(lastScrollRef.current))
    } catch {
      /* storage can be unavailable */
    }

    prevPathRef.current = location.pathname

    if (sectionTarget) return undefined

    let target = 0
    try {
      target = Number(sessionStorage.getItem(`scroll:${location.pathname}`)) || 0
    } catch {
      target = 0
    }

    const timeout = window.setTimeout(() => {
      scrollTo(target, { immediate: true })
      ScrollTrigger.refresh()
    }, 240)

    return () => window.clearTimeout(timeout)
  }, [location.pathname, scrollTo, sectionTarget])

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

export { ScrollTrigger }
