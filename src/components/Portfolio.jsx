import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  ScrollTrigger,
  useSmoothScroll,
} from '../context/SmoothScrollContext'
import TopoCanvas from './TopoCanvas'
import PortfolioGallery from './PortfolioGallery'
import Gallery from './Gallery'
import Contact from './Contact'
import Footer from './Footer'

const WORD = 'PORTOFOLIO'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function Portfolio() {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const wordRef = useRef(null)
  const contentRef = useRef(null)
  const fillRef = useRef(null)
  const captionRef = useRef(null)
  const letterRefs = useRef([])
  const chosenRef = useRef(2)
  const [chosen, setChosen] = useState(2)
  const { scrollTo } = useSmoothScroll()

  const updateOrigin = useCallback(() => {
    const word = wordRef.current
    const letter = letterRefs.current[chosenRef.current]
    if (!word || !letter) return
    const x = ((letter.offsetLeft + letter.offsetWidth / 2) / word.offsetWidth) * 100
    word.style.transformOrigin = `${x}% 50%`
  }, [])

  const applyProgress = useCallback(progress => {
    const word = wordRef.current
    const pin = pinRef.current
    const content = contentRef.current
    const fill = fillRef.current
    const caption = captionRef.current
    if (!word || !content) return

    const local = clamp((progress - 0.06) / 0.84, 0, 1)
    const eased = local * local * (3 - 2 * local)
    const scale = 1 + Math.pow(eased, 2.6) * 130
    word.style.transform = `scale(${scale})`

    if (fill) fill.style.opacity = String(clamp((progress - 0.42) / 0.2, 0, 1))
    if (caption) {
      caption.style.opacity = String(clamp(1 - progress / 0.22, 0, 1))
      caption.style.pointerEvents = progress > 0.3 ? 'none' : 'auto'
    }
    if (pin) pin.classList.toggle('is-revealing', progress > 0.35)

    const contentOpacity = clamp((progress - 0.4) / 0.3, 0, 1)
    content.style.opacity = String(contentOpacity)
    content.style.pointerEvents = contentOpacity > 0.9 ? 'auto' : 'none'
  }, [])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    updateOrigin()

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (contentRef.current) contentRef.current.style.opacity = '1'
      return undefined
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * 1.7}`,
      scrub: true,
      onUpdate: self => applyProgress(self.progress),
      onRefresh: self => applyProgress(self.progress),
    })

    applyProgress(trigger.progress)

    const handleResize = () => {
      updateOrigin()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      trigger.kill()
    }
  }, [applyProgress, updateOrigin])

  const selectLetter = index => {
    chosenRef.current = index
    setChosen(index)
    updateOrigin()
  }

  const enterThrough = index => {
    selectLetter(index)
    const section = sectionRef.current
    const content = contentRef.current
    if (!section || !content) return
    const contentTop = content.getBoundingClientRect().top + window.scrollY
    scrollTo(Math.max(0, contentTop - 72), { duration: 1.4 })
  }

  return (
    <section id="Portofolio" className="gp-section" ref={sectionRef}>
      <div className="gp-pin" ref={pinRef}>
        <div className="gp-topo" aria-hidden="true">
          <TopoCanvas variant="dark" />
        </div>
        <div className="gp-vignette" aria-hidden="true" />

        <div className="gp-word-wrap">
          <div className="gp-word" ref={wordRef} aria-label="Portofolio">
            {WORD.split('').map((letter, index) => (
              <button
                key={`${letter}-${index}`}
                type="button"
                ref={element => {
                  letterRefs.current[index] = element
                }}
                className={`gp-letter${chosen === index ? ' is-chosen' : ''}`}
                onPointerEnter={() => selectLetter(index)}
                onFocus={() => selectLetter(index)}
                onClick={() => enterThrough(index)}
                aria-label={`Masuk melalui huruf ${letter}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="gp-fill" ref={fillRef} aria-hidden="true" />

        <div className="gp-caption" ref={captionRef}>
          <span className="gp-hint">
            Pilih satu huruf, lalu masuk ke portofolio
          </span>
          <button
            type="button"
            className="gp-enter"
            onClick={() => enterThrough(chosen)}
          >
            Enter
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="portfolio-content" id="Portofolio-content" ref={contentRef}>
        <div className="light-topo" aria-hidden="true">
          <div className="light-topo-sticky">
            <TopoCanvas variant="light" />
          </div>
        </div>
        <div className="portfolio-content-inner">
          <PortfolioGallery />
          <Gallery />
          <Contact />
          <Footer />
        </div>
      </div>
    </section>
  )
}
