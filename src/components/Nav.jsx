import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSmoothScroll } from '../context/SmoothScrollContext'

const ITEMS = [
  { id: 'Home', label: 'Home' },
  { id: 'About', label: 'About' },
  { id: 'Portofolio', label: 'Portfolio' },
  { id: 'Contact', label: 'Contact' },
]

function getDocumentTop(id) {
  const element = document.getElementById(id)
  if (!element) return Number.POSITIVE_INFINITY
  return element.getBoundingClientRect().top + window.scrollY
}

export default function Nav() {
  const navRef = useRef(null)
  const [active, setActive] = useState('Home')
  const [light, setLight] = useState(false)
  const [mascotLeft, setMascotLeft] = useState(0)
  const { scrollTo } = useSmoothScroll()

  useEffect(() => {
    let frame = 0

    const update = () => {
      const viewport = window.innerHeight
      const probe = window.scrollY + viewport * 0.38
      const aboutTop = getDocumentTop('About')
      const portfolioTop = getDocumentTop('Portofolio')
      const contactTop = getDocumentTop('Contact')
      const content = document.getElementById('Portofolio-content')
      const contentTop = content
        ? content.getBoundingClientRect().top + window.scrollY
        : Number.POSITIVE_INFINITY

      let next = 'Home'
      if (probe >= contactTop) next = 'Contact'
      else if (probe >= portfolioTop) next = 'Portfolio'
      else if (probe >= aboutTop) next = 'About'

      setActive(current => (current === next ? current : next))
      setLight(current => {
        const nextLight = window.scrollY >= contentTop - viewport * 0.95
        return current === nextLight ? current : nextLight
      })
    }

    const requestUpdate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  useLayoutEffect(() => {
    const pill = navRef.current
    if (!pill) return undefined

    const measure = () => {
      const link = pill.querySelector(`[data-nav-id="${active}"]`)
      if (!link) return
      const pillRect = pill.getBoundingClientRect()
      const linkRect = link.getBoundingClientRect()
      setMascotLeft(linkRect.left - pillRect.left + linkRect.width / 2)
    }

    measure()
    const timeout = window.setTimeout(measure, 150)
    window.addEventListener('resize', measure)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('resize', measure)
    }
  }, [active])

  const handleNavigate = event => {
    event.preventDefault()
    if (active === event.currentTarget.dataset.navId) {
      const target = getDocumentTop(event.currentTarget.dataset.navId)
      scrollTo(Math.max(0, target - 68), { duration: 1.15 })
      return
    }

    const id = event.currentTarget.dataset.navId
    const target = id === 'Home' ? 0 : Math.max(0, getDocumentTop(id) - 68)
    scrollTo(target, { duration: 1.15 })
  }

  return (
    <div className={`site-nav${light ? ' is-light' : ''}`}>
      <div className="nav-wrap">
        <nav className="nav-pill" ref={navRef} aria-label="Navigasi utama">
          <span
            className="nav-mascot"
            style={{ transform: `translateX(${mascotLeft}px)` }}
            aria-hidden="true"
          >
            <span className="nav-mascot-inner" key={active}>
              <span className="mascot-tail" />
              <span className="mascot-face">
                <span className="mascot-eye mascot-eye--left" />
                <span className="mascot-eye mascot-eye--right" />
                <span className="mascot-blush mascot-blush--left" />
                <span className="mascot-blush mascot-blush--right" />
                <span className="mascot-smile" />
              </span>
            </span>
          </span>

          {ITEMS.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-nav-id={item.id}
              onClick={handleNavigate}
              className={`nav-link${active === item.id ? ' is-active' : ''}`}
            >
              <span className="nav-link-bg" aria-hidden="true" />
              <span className="nav-link-text">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
