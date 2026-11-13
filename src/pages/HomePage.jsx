import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Nav from '../components/Nav'
import Home from '../components/Home'
import About from '../components/About'
import Portfolio from '../components/Portfolio'
import {
  ScrollTrigger,
  useSmoothScroll,
} from '../context/SmoothScrollContext'

export default function HomePage() {
  const location = useLocation()
  const { scrollTo } = useSmoothScroll()

  useLayoutEffect(() => {
    const targetId = location.state?.scrollTo
    if (!targetId) return

    const element = document.getElementById(targetId)
    if (!element) return

    const top = element.getBoundingClientRect().top + window.scrollY - 68
    scrollTo(Math.max(0, top), { immediate: true })
    ScrollTrigger.refresh()
  }, [location.state, scrollTo])

  useEffect(() => {
    document.title = 'Jihan Fauzi | Portofolio'

    const refresh = () => ScrollTrigger.refresh()
    const timeout = window.setTimeout(refresh, 700)

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {})
    }
    window.addEventListener('load', refresh)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Home />
        <About />
        <Portfolio />
      </main>
    </>
  )
}
