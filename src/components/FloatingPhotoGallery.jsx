import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, ImagePlus, X } from 'lucide-react'
import TopoCanvas from './TopoCanvas'
import { useSmoothScroll } from '../context/SmoothScrollContext'

const ROTATIONS = [-8, 5, 10, -4, 7, -6, 3, -10, 8, -3, 6, -7, -5, 4, -9, 2, 9, -2]
const WIDTHS = [16, 13, 18, 14, 17, 13.5, 15, 19, 14, 16.5, 13.8, 17.5, 14.2, 18, 12.8, 15.6, 17, 13.2]
const ANCHORS = {
  1: [[52, 46]],
  2: [
    [36, 40],
    [66, 58],
  ],
  3: [
    [30, 38],
    [64, 32],
    [50, 70],
  ],
  4: [
    [28, 36],
    [54, 26],
    [74, 48],
    [46, 70],
  ],
  5: [
    [24, 34],
    [50, 22],
    [76, 38],
    [62, 66],
    [32, 64],
  ],
  6: [
    [20, 32],
    [45, 20],
    [72, 26],
    [84, 48],
    [62, 68],
    [34, 62],
  ],
  7: [
    [16, 30],
    [40, 18],
    [66, 22],
    [84, 42],
    [74, 64],
    [50, 74],
    [25, 58],
  ],
  8: [
    [16, 28],
    [38, 16],
    [62, 20],
    [82, 38],
    [86, 60],
    [66, 76],
    [42, 70],
    [20, 54],
  ],
  9: [
    [18, 24],
    [48, 20],
    [78, 26],
    [12, 52],
    [42, 48],
    [72, 52],
    [24, 76],
    [54, 74],
    [84, 78],
  ],
  10: [
    [14, 22],
    [39, 20],
    [64, 24],
    [88, 22],
    [22, 50],
    [50, 48],
    [78, 52],
    [16, 76],
    [44, 74],
    [72, 78],
  ],
  11: [
    [14, 22],
    [38, 20],
    [62, 24],
    [86, 22],
    [10, 50],
    [36, 48],
    [62, 52],
    [88, 50],
    [22, 76],
    [50, 74],
    [78, 78],
  ],
  12: [
    [14, 22],
    [38, 20],
    [62, 24],
    [86, 22],
    [10, 50],
    [36, 48],
    [62, 52],
    [88, 50],
    [14, 76],
    [40, 74],
    [66, 78],
    [90, 76],
  ],
}

function buildCrowdedPositions(total) {
  const columns = total > 24 ? 8 : total > 15 ? 6 : 5
  const rows = Math.ceil(total / columns)
  const top = rows > 3 ? 16 : 20
  const bottom = rows > 3 ? 84 : 76
  const positions = []
  let placed = 0

  for (let row = 0; row < rows; row += 1) {
    const inRow = Math.min(columns, total - placed)
    const offset = (columns - inRow) / 2

    for (let column = 0; column < inRow; column += 1) {
      const index = placed + column
      const jitterX = (((index * 0.37) % 1) - 0.5) * 3
      const jitterY = (((index * 0.53) % 1) - 0.5) * 3.5

      positions.push([
        10 + ((column + offset + 0.5) / columns) * 80 + jitterX,
        top + (row / Math.max(rows - 1, 1)) * (bottom - top) + jitterY,
      ])
    }

    placed += inRow
  }

  return positions
}

function buildPositions(total) {
  if (ANCHORS[total]) return ANCHORS[total]
  if (total > 12) return buildCrowdedPositions(total)

  const positions = []
  let placed = 0
  let ring = 0

  while (placed < total) {
    const inRing = Math.min(8, total - placed)
    for (let slot = 0; slot < inRing; slot += 1) {
      const angle = (slot / inRing) * Math.PI * 2 - Math.PI / 2 + ring * 0.45
      positions.push([
        50 + Math.cos(angle) * Math.min(38, 30 + ring * 5),
        46 + Math.sin(angle) * Math.min(34, 26 + ring * 4),
      ])
    }
    placed += inRing
    ring += 1
  }

  return positions
}

function buildLayout(index, positions, total) {
  const anchor = positions[index] ?? [50, 46]
  const density =
    total > 24 ? 0.52 : total > 15 ? 0.62 : total > 12 ? 0.7 : total > 8 ? 0.84 : 1

  return {
    left: anchor[0],
    top: anchor[1],
    rotation: ROTATIONS[index % ROTATIONS.length],
    width: WIDTHS[index % WIDTHS.length] * density,
    duration: 6 + (index % 5) * 1.1,
    bobDelay: -((index % 6) * 1.3),
    delay: index * 90,
    depth: 8 + (index % 4) * 6,
  }
}

export default function FloatingPhotoGallery({
  photos = [],
  title,
  count,
  folderId,
  onBack,
}) {
  const sceneRef = useRef(null)
  const parallaxRefs = useRef([])
  const frameRef = useRef(0)
  const touchStartRef = useRef(null)
  const dragRef = useRef(null)
  const offsetsRef = useRef({})
  const suppressClickRef = useRef(false)
  const closingRef = useRef(false)
  const [compact, setCompact] = useState(false)
  const [activeIndex, setActiveIndex] = useState(null)
  const [closing, setClosing] = useState(false)
  const { stop, start } = useSmoothScroll()

  const total = count ?? photos.length

  const layouts = useMemo(() => {
    const positions = buildPositions(photos.length)
    return photos.map((_, index) => buildLayout(index, positions, photos.length))
  }, [photos])

  useEffect(() => {
    const smallQuery = window.matchMedia('(max-width: 767px)')
    const tabletQuery = window.matchMedia('(max-width: 1023px)')
    const update = () =>
      setCompact(smallQuery.matches || (photos.length >= 13 && tabletQuery.matches))

    update()
    smallQuery.addEventListener('change', update)
    tabletQuery.addEventListener('change', update)

    return () => {
      smallQuery.removeEventListener('change', update)
      tabletQuery.removeEventListener('change', update)
    }
  }, [photos.length])

  useEffect(() => {
    closingRef.current = closing
    if (!closing) return undefined

    const timer = window.setTimeout(() => {
      setClosing(false)
      setActiveIndex(null)
    }, 220)

    return () => window.clearTimeout(timer)
  }, [closing])

  useEffect(() => {
    const resetPositions = () => {
      dragRef.current = null
      offsetsRef.current = {}
      sceneRef.current?.querySelectorAll('.float-card').forEach(card => {
        card.style.removeProperty('--dx')
        card.style.removeProperty('--dy')
        card.classList.remove('is-dragging')
      })
    }

    window.addEventListener('resize', resetPositions)
    return () => window.removeEventListener('resize', resetPositions)
  }, [])

  useEffect(() => {
    if (activeIndex === null) return undefined

    stop()
    document.body.classList.add('has-modal')

    const handleKey = event => {
      if (closingRef.current) return
      if (event.key === 'Escape') setClosing(true)
      if (event.key === 'ArrowRight') {
        setActiveIndex(current => (current + 1) % photos.length)
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex(current => (current - 1 + photos.length) % photos.length)
      }
    }

    window.addEventListener('keydown', handleKey)

    return () => {
      start()
      document.body.classList.remove('has-modal')
      window.removeEventListener('keydown', handleKey)
    }
  }, [activeIndex, photos.length, start, stop])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  const handlePointerMove = event => {
    if (compact || dragRef.current || event.pointerType === 'touch') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const scene = sceneRef.current
    if (!scene) return

    const rect = scene.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      layouts.forEach((layout, index) => {
        const element = parallaxRefs.current[index]
        if (!element) return
        const shiftX = -x * layout.depth
        const shiftY = -y * layout.depth
        element.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`
      })
    })
  }

  const handlePointerLeave = () => {
    cancelAnimationFrame(frameRef.current)
    layouts.forEach((_, index) => {
      const element = parallaxRefs.current[index]
      if (element) element.style.transform = ''
    })
  }

  const handleDragStart = (event, index) => {
    suppressClickRef.current = false
    if (compact || dragRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const card = event.currentTarget
    const scene = sceneRef.current
    if (!card || !scene) return

    const sceneRect = scene.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const offset = offsetsRef.current[index] ?? { x: 0, y: 0 }
    const pad = 6

    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      minX: offset.x + sceneRect.left + pad - cardRect.left,
      maxX: offset.x + sceneRect.right - pad - cardRect.right,
      minY: offset.y + sceneRect.top + pad - cardRect.top,
      maxY: offset.y + sceneRect.bottom - pad - cardRect.bottom,
      threshold: event.pointerType === 'touch' ? 8 : 5,
      moved: false,
      card,
    }

    try {
      card.setPointerCapture(event.pointerId)
    } catch {
      // pointer capture can fail if the pointer is already released
    }
  }

  const handleDragMove = event => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(deltaX, deltaY) < drag.threshold) return

    if (!drag.moved) {
      drag.moved = true
      drag.card.classList.add('is-dragging')
    }

    event.preventDefault()

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
    const x = clamp(drag.originX + deltaX, drag.minX, drag.maxX)
    const y = clamp(drag.originY + deltaY, drag.minY, drag.maxY)

    offsetsRef.current[drag.index] = { x, y }
    drag.card.style.setProperty('--dx', `${x.toFixed(2)}px`)
    drag.card.style.setProperty('--dy', `${y.toFixed(2)}px`)
  }

  const handleDragEnd = event => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return

    if (drag.moved) {
      suppressClickRef.current = true
      drag.card.classList.remove('is-dragging')
    }

    try {
      drag.card.releasePointerCapture(event.pointerId)
    } catch {
      // pointer capture may already be released
    }

    dragRef.current = null
  }

  const showPhoto = index => {
    setClosing(false)
    setActiveIndex(index)
  }

  const closeLightbox = () => {
    if (closingRef.current) return
    setClosing(true)
  }
  const showPrevious = () =>
    setActiveIndex(current => (current - 1 + photos.length) % photos.length)
  const showNext = () =>
    setActiveIndex(current => (current + 1) % photos.length)

  const handleTouchStart = event => {
    touchStartRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = event => {
    if (touchStartRef.current === null) return
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartRef.current
    touchStartRef.current = null
    if (Math.abs(delta) < 50) return
    if (delta < 0) showNext()
    else showPrevious()
  }

  const activePhoto = activeIndex === null ? null : photos[activeIndex]

  return (
    <section
      className="float-stage"
      data-folder={folderId || undefined}
      aria-label={`Galeri ${title}`}
    >
      <div className="float-stage-bg" aria-hidden="true">
        <TopoCanvas variant="dark" />
      </div>
      <span
        className="float-stage-rings float-stage-rings--tl"
        aria-hidden="true"
      />
      <span
        className="float-stage-rings float-stage-rings--br"
        aria-hidden="true"
      />

      <div className="float-stage-head" data-reveal>
        <button type="button" className="float-back" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Semua Folder
        </button>
        <div className="float-stage-title-wrap">
          <h1 className="float-stage-title">{title}</h1>
          <span className="float-stage-count">{total} foto</span>
        </div>
        <span className="float-stage-spacer" aria-hidden="true" />
      </div>

      {photos.length > 0 ? (
        <div className={`float-gallery${compact ? ' is-compact' : ''}`}>
          <div
            className="float-gallery-scene"
            ref={sceneRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {photos.map((photo, index) => {
              const layout = layouts[index]
              const style = {
                '--rot': `${layout.rotation}deg`,
                '--delay': `${layout.delay}ms`,
                '--dur': `${layout.duration}s`,
                '--bob-delay': `${layout.bobDelay}s`,
              }

              if (!compact) {
                const crowded = photos.length > 12
                const minWidth =
                  photos.length > 24 ? 100 : photos.length > 15 ? 112 : crowded ? 120 : 150
                const maxWidth = crowded ? 240 : 290
                style.left = `${layout.left}%`
                style.top = `${layout.top}%`
                style['--w'] = `clamp(${minWidth}px, ${layout.width}vw, ${maxWidth}px)`
              }

              return (
                <button
                  key={photo.id}
                  type="button"
                  className="float-card"
                  style={style}
                  onPointerDown={event => handleDragStart(event, index)}
                  onPointerMove={handleDragMove}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}
                  onClick={() => {
                    if (suppressClickRef.current) {
                      suppressClickRef.current = false
                      return
                    }
                    showPhoto(index)
                  }}
                  aria-label={`Perbesar ${photo.alt}`}
                  title={
                    compact
                      ? undefined
                      : 'Tarik untuk menggeser, klik untuk memperbesar'
                  }
                >
                  <span
                    className="float-parallax"
                    ref={element => {
                      parallaxRefs.current[index] = element
                    }}
                  >
                    <span className="float-bob">
                      <span className="float-frame">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading={index < 4 ? 'eager' : 'lazy'}
                          decoding="async"
                          fetchPriority={index < 3 ? 'high' : 'auto'}
                          draggable="false"
                        />
                      </span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="float-empty">
          <span className="float-empty-icon">
            <ImagePlus size={26} aria-hidden="true" />
          </span>
          <p>Belum ada foto di folder ini.</p>
          <small>Foto-foto akan segera ditambahkan.</small>
        </div>
      )}

      {activePhoto
        ? createPortal(
            <div
              className={`float-lightbox${closing ? ' is-closing' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-label={activePhoto.alt}
              onClick={closeLightbox}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                className="float-lightbox-close"
                aria-label="Tutup foto"
                onClick={closeLightbox}
              >
                <X size={22} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="float-lightbox-nav float-lightbox-nav--prev"
                aria-label="Foto sebelumnya"
                onClick={event => {
                  event.stopPropagation()
                  showPrevious()
                }}
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>

              <figure
                className="float-lightbox-frame"
                onClick={event => event.stopPropagation()}
              >
                <img
                  key={activePhoto.id}
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                />
              </figure>

              <button
                type="button"
                className="float-lightbox-nav float-lightbox-nav--next"
                aria-label="Foto berikutnya"
                onClick={event => {
                  event.stopPropagation()
                  showNext()
                }}
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>

              <span className="float-lightbox-count">
                {activeIndex + 1} / {photos.length}
              </span>
            </div>,
            document.body,
          )
        : null}
    </section>
  )
}
