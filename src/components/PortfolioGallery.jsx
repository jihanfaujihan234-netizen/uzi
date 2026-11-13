import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Code,
  Trophy,
} from 'lucide-react'
import { ScrollTrigger } from '../context/SmoothScrollContext'
import { useSmoothScroll } from '../context/SmoothScrollContext'
import { usePortfolio } from '../context/PortfolioContext'
import { awards, certificates, projects } from '../data/site'

const TABS = [
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'awards', label: 'Awards', icon: Trophy },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function PortfolioGallery() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const distanceRef = useRef(0)
  const [distance, setDistance] = useState(0)
  const { activeTab, goToTab } = usePortfolio()
  const { scrollTo } = useSmoothScroll()

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const next = Math.max(0, track.scrollWidth - window.innerWidth + 32)
    distanceRef.current = next
    setDistance(current => (current === next ? current : next))
  }, [])

  useLayoutEffect(() => {
    const track = trackRef.current
    measure()

    const observer = new ResizeObserver(measure)
    if (track) observer.observe(track)
    window.addEventListener('resize', measure)
    const timeout = window.setTimeout(measure, 400)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.clearTimeout(timeout)
    }
  }, [measure, activeTab])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.transform = 'translate3d(0,0,0)'
      return undefined
    }

    const apply = progress => {
      const travel = clamp((progress - 0.02) / 0.94, 0, 1)
      const x = -distanceRef.current * travel
      track.style.transform = `translate3d(${x}px, 0, 0)`
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: self => apply(self.progress),
      onRefresh: self => apply(self.progress),
    })

    apply(trigger.progress)

    return () => trigger.kill()
  }, [activeTab, distance])

  const moveCarousel = direction => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track || !distanceRef.current) return

    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    const range = Math.max(1, section.offsetHeight - window.innerHeight)
    const card = track.firstElementChild
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0') || 0
    const step = (card?.getBoundingClientRect().width ?? 320) + gap
    const scrollStep = step * (range / distanceRef.current)
    const next = clamp(
      window.scrollY + direction * scrollStep,
      sectionTop,
      sectionTop + range,
    )
    scrollTo(next, { duration: 0.7 })
  }

  const items =
    activeTab === 'certificates'
      ? certificates
      : activeTab === 'awards'
        ? awards
        : projects

  return (
    <section
      id="Portofolio-Gallery"
      className="pf-gallery"
      ref={sectionRef}
      style={{ height: `calc(100svh + ${distance + 260}px)` }}
    >
      <div className="pf-sticky">
        <div className="pf-header">
          <h2 className="pf-title">Portofolio</h2>
          <div className="pf-tabs" role="tablist" aria-label="Kategori portofolio">
            {TABS.map(tab => {
              const Icon = tab.icon
              const selected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`pf-tab${selected ? ' is-active' : ''}`}
                  onClick={() => goToTab(tab.id)}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pf-carousel">
          <button
            type="button"
            className="pf-arrow pf-arrow--left"
            aria-label="Kartu sebelumnya"
            onClick={() => moveCarousel(-1)}
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>

          <div className="pf-track" ref={trackRef}>
            {items.map(item =>
              activeTab === 'projects' ? (
                <article className="pf-card" key={item.slug}>
                  <div className="pf-card-media">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="pf-card-body">
                    <h3>{item.title}</h3>
                    <p>{item.short}</p>
                    <Link className="pf-details" to={`/project/${item.slug}`}>
                      Details
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ) : (
                <article className="pf-card pf-card--image" key={item.id}>
                  <div className="pf-card-media">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </article>
              ),
            )}
          </div>

          <button
            type="button"
            className="pf-arrow pf-arrow--right"
            aria-label="Kartu berikutnya"
            onClick={() => moveCarousel(1)}
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
