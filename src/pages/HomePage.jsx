import { useEffect } from 'react'
import Nav from '../components/Nav'
import Home from '../components/Home'
import About from '../components/About'
import Portfolio from '../components/Portfolio'
import { ScrollTrigger } from '../context/SmoothScrollContext'

export default function HomePage() {
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
