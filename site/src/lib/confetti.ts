import { ZONE_FILL } from '../components/chart-model'

// A one-off confetti burst for finishing the 12-week build: two cannons from
// the bottom corners of the screen, so it doesn't depend on where the page
// has scrolled to. Dependency-free: a temporary full-screen canvas that
// removes itself when the pieces have fallen. Client-only (called from a click handler). Skipped when the rider
// asks for reduced motion.
const COLOURS = [...Object.values(ZONE_FILL).slice(1), '#F05A1A', '#FFFFFF']
const PIECES = 180
const DURATION_MS = 3500

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  angle: number
  spin: number
  colour: string
}

export function confettiBurst() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '9999',
  })
  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }
  ctx.scale(dpr, dpr)

  const W = window.innerWidth
  const H = window.innerHeight
  const pieces: Piece[] = Array.from({ length: PIECES }, (_, i) => {
    const left = i % 2 === 0
    // Up and inwards: about 60° from the horizontal, with some spread.
    const tilt = (Math.PI / 3) + (Math.random() - 0.5) * 0.5
    const angle = left ? -tilt : -(Math.PI - tilt)
    const speed = (12 + Math.random() * 10) * Math.min(1.4, Math.max(0.7, H / 800))
    return {
      x: left ? 0 : W,
      y: H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 6 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.4,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    }
  })

  const start = performance.now()
  function frame(now: number) {
    const t = now - start
    ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight)
    ctx!.globalAlpha = Math.max(0, 1 - Math.max(0, t - DURATION_MS * 0.6) / (DURATION_MS * 0.4))
    for (const p of pieces) {
      p.vy += 0.3 // gravity
      p.vx *= 0.985 // drag
      p.vy *= 0.985
      p.x += p.vx
      p.y += p.vy
      p.angle += p.spin
      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate(p.angle)
      ctx!.fillStyle = p.colour
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx!.restore()
    }
    if (t < DURATION_MS) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
