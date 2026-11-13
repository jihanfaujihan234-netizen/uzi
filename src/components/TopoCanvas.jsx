import { useEffect, useRef } from 'react'

const PALETTES = {
  dark: {
    stroke: '110, 150, 235',
    alpha: 0.16,
    strongAlpha: 0.28,
  },
  light: {
    stroke: '100, 116, 139',
    alpha: 0.3,
    strongAlpha: 0.44,
  },
}

function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildField(width, height, seed) {
  const random = mulberry32(seed)
  const blobs = []

  for (let i = 0; i < 11; i += 1) {
    blobs.push({
      x: random() * width,
      y: random() * height,
      radius: (0.12 + random() * 0.42) * Math.max(width, height),
      strength: (random() > 0.35 ? 1 : -0.85) * (0.45 + random() * 0.9),
    })
  }

  const sample = (x, y) => {
    let value = 0
    for (const blob of blobs) {
      const dx = x - blob.x
      const dy = y - blob.y
      value += blob.strength * Math.exp(-(dx * dx + dy * dy) / (2 * blob.radius * blob.radius))
    }
    value += Math.sin((x / Math.max(width, 1)) * 6.2) * 0.12
    value += Math.cos((y / Math.max(height, 1)) * 5.1) * 0.1
    return value
  }

  return { sample }
}

function drawTopo(canvas, variant) {
  const parent = canvas.parentElement
  if (!parent) return

  const rect = parent.getBoundingClientRect()
  const width = Math.max(320, Math.round(rect.width))
  const height = Math.max(320, Math.round(rect.height))
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const palette = PALETTES[variant] ?? PALETTES.dark
  const seed = variant === 'light' ? 20261 : 90917
  const { sample } = buildField(width, height, seed)
  const step = 26
  const cols = Math.ceil(width / step) + 1
  const rows = Math.ceil(height / step) + 1

  const values = new Float32Array(cols * rows)
  let min = Infinity
  let max = -Infinity

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const value = sample(col * step, row * step)
      values[row * cols + col] = value
      if (value < min) min = value
      if (value > max) max = value
    }
  }

  const bands = 13
  const spacing = (max - min) / (bands + 1)
  if (!Number.isFinite(spacing) || spacing <= 0) return

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let band = 1; band <= bands; band += 1) {
    const level = min + spacing * band
    const isIndex = band % 4 === 0
    ctx.strokeStyle = `rgba(${palette.stroke}, ${isIndex ? palette.strongAlpha : palette.alpha})`
    ctx.lineWidth = isIndex ? 1.15 : 0.85
    ctx.beginPath()

    for (let row = 0; row < rows - 1; row += 1) {
      for (let col = 0; col < cols - 1; col += 1) {
        const tl = values[row * cols + col]
        const tr = values[row * cols + col + 1]
        const br = values[(row + 1) * cols + col + 1]
        const bl = values[(row + 1) * cols + col]
        const index =
          (tl > level ? 8 : 0) |
          (tr > level ? 4 : 0) |
          (br > level ? 2 : 0) |
          (bl > level ? 1 : 0)

        if (index === 0 || index === 15) continue

        const x = col * step
        const y = row * step
        const top = () => [x + (step * (level - tl)) / (tr - tl || 1e-6), y]
        const right = () => [
          x + step,
          y + (step * (level - tr)) / (br - tr || 1e-6),
        ]
        const bottom = () => [
          x + (step * (level - bl)) / (br - bl || 1e-6),
          y + step,
        ]
        const left = () => [x, y + (step * (level - tl)) / (bl - tl || 1e-6)]

        const segment = (a, b) => {
          const pointA = a()
          const pointB = b()
          ctx.moveTo(pointA[0], pointA[1])
          ctx.lineTo(pointB[0], pointB[1])
        }

        switch (index) {
          case 1:
          case 14:
            segment(left, bottom)
            break
          case 2:
          case 13:
            segment(bottom, right)
            break
          case 3:
          case 12:
            segment(left, right)
            break
          case 4:
          case 11:
            segment(top, right)
            break
          case 5:
            segment(left, bottom)
            segment(top, right)
            break
          case 6:
          case 9:
            segment(top, bottom)
            break
          case 7:
          case 8:
            segment(left, top)
            break
          case 10:
            segment(left, top)
            segment(bottom, right)
            break
          default:
            break
        }
      }
    }

    ctx.stroke()
  }
}

export default function TopoCanvas({ variant = 'dark', className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let frame = 0
    const render = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => drawTopo(canvas, variant))
    }

    render()
    const observer = new ResizeObserver(render)
    observer.observe(canvas.parentElement)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [variant])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />
}
