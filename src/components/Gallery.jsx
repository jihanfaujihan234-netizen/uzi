import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { ScrollTrigger } from '../context/SmoothScrollContext'
import { useSmoothScroll } from '../context/SmoothScrollContext'
import { galleryPhotos } from '../data/site'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function Gallery() {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const sceneRef = useRef(null)
  const hintRef = useRef(null)
  const cardsRef = useRef([])
  const progressRef = useRef(0)
  const [activePhoto, setActivePhoto] = useState(null)
  const { stop, start } = useSmoothScroll()

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const cards = cardsRef.current.filter(Boolean)

    const apply = progress => {
      progressRef.current = progress
      cards.forEach((card, index) => {
        const x = Number(card.dataset.x || 0)
        const y = Number(card.dataset.y || 0)
        const rotation = Number(card.dataset.rotation || 0)
        const start = -0.45 + index * 0.066
        const local = clamp((progress - start) / 0.86, 0, 1)
        const z = -1700 + 2200 * local
        const fadeIn = clamp(local / 0.15, 0, 1)
        const fadeOut = clamp((1 - local) / 0.25, 0, 1)
        const opacity = fadeIn * fadeOut

        card.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateZ(${rotation}deg)`
        card.style.opacity = String(opacity)
        card.style.pointerEvents = opacity > 0.45 ? 'auto' : 'none'
      })

      if (hintRef.current) {
        hintRef.current.style.opacity = String(clamp(1 - progress * 4, 0, 1))
      }
    }

    const layout = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      cards.forEach((card, index) => {
        const angle = (index * 137.5 * Math.PI) / 180
        const radiusX = width * (0.28 + (index % 3) * 0.08)
        const radiusY = height * (0.26 + (index % 2) * 0.09)
        const x = Math.cos(angle) * radiusX
        const y = Math.sin(angle) * radiusY
        const rotation = (index % 2 ? -1 : 1) * (3 + (index % 5) * 2)
        card.dataset.x = String(x)
        card.dataset.y = String(y)
        card.dataset.rotation = String(rotation)
      })
      apply(progressRef.current)
    }

    layout()

    if (reduceMotion) {
      cards.forEach((card, index) => {
        card.style.opacity = '1'
        card.style.pointerEvents = 'auto'
        const z = -60 + index * 12
        card.style.transform = `translate3d(calc(-50% + ${card.dataset.x}px), calc(-50% + ${card.dataset.y}px), ${z}px) rotateZ(${card.dataset.rotation}deg)`
      })
      return undefined
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

    const handleResize = () => {
      layout()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      trigger.kill()
    }
  }, [])

  useEffect(() => {
    if (!activePhoto) return undefined
    stop()
    document.body.classList.add('has-modal')

    const handleKey = event => {
      if (event.key === 'Escape') setActivePhoto(null)
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      start()
      document.body.classList.remove('has-modal')
      window.removeEventListener('keydown', handleKey)
    }
  }, [activePhoto, start, stop])

  const handlePointerMove = event => {
    if (!window.matchMedia('(hover: hover)').matches) return
    const scene = sceneRef.current
    if (!scene) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    scene.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`
  }

  const handlePointerLeave = () => {
    if (sceneRef.current) sceneRef.current.style.transform = ''
  }

  return (
    <section id="Gallery" className="gallery" ref={sectionRef}>
      <div
        className="gallery-sticky"
        ref={stickyRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="gallery-scene" ref={sceneRef}>
          {galleryPhotos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className="gallery-card"
              ref={element => {
                cardsRef.current[index] = element
              }}
              onClick={() => setActivePhoto(photo)}
              aria-label={`Perbesar ${photo.alt}`}
            >
              <span className="gallery-card-inner">
                <img
                  src={photo.image}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </span>
            </button>
          ))}
        </div>

        <div className="gallery-hint" ref={hintRef}>
          <span>Scroll to explore</span>
          <span className="gallery-hint-line" aria-hidden="true" />
        </div>
      </div>

      {activePhoto ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt}
          onClick={() => setActivePhoto(null)}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            aria-label="Tutup foto"
            onClick={() => setActivePhoto(null)}
          >
            <X size={22} aria-hidden="true" />
          </button>
          <img
            src={activePhoto.image}
            alt={activePhoto.alt}
            onClick={event => event.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  )
}
