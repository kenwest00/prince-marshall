import { useEffect, useRef } from 'react'
import { reducedMotion } from '../lib/motion'
import { RING_COLORS } from '../lib/palette'

/**
 * KURA field — an experimental, generative portrait of a collection.
 * A warped "object" made of points sits at the centre; five orbits carry
 * the five things KURA keeps for every object. Pointer near an orbit lights
 * it up (and reports it back so the matching list item highlights).
 * Pure canvas 2D, no dependencies; pauses off-screen; static under
 * prefers-reduced-motion.
 */

interface Props {
  labels: string[]
  active: number | null
  onActive: (i: number | null) => void
  className?: string
}

const N = 820
const RINGS = 5
const INK = '#0a0a0a'

const GOLD = Math.PI * (3 - Math.sqrt(5))

const base = Array.from({ length: N }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / N
  const r = Math.sqrt(1 - y * y)
  const th = i * GOLD
  const x = Math.cos(th) * r
  const z = Math.sin(th) * r
  // warp the sphere into something sculptural
  const d = 1 + 0.2 * Math.sin(4 * x + 1.3) * Math.cos(3 * y) + 0.13 * Math.sin(5 * z + 2 * y)
  return [x * d, y * d * 1.12, z * d] as [number, number, number]
})

const ringRadius = (k: number) => 1.6 + k * 0.27
const ringTilt = (k: number) => 0.28 * (k - 2)

export default function KuraField({ labels, active, onActive, className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef<number | null>(active)
  const onActiveRef = useRef(onActive)

  useEffect(() => {
    activeRef.current = active
  }, [active])
  useEffect(() => {
    onActiveRef.current = onActive
  }, [onActive])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let visible = true
    let hoverRing: number | null = null
    const ptr = { x: -9999, y: -9999, in: false, sx: 0, sy: 0 }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = wrap.clientWidth
      h = wrap.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }

    const rot = (
      p: [number, number, number],
      ry: number,
      rx: number,
    ): [number, number, number] => {
      const cy = Math.cos(ry)
      const sy = Math.sin(ry)
      const x1 = p[0] * cy + p[2] * sy
      const z1 = -p[0] * sy + p[2] * cy
      const cx = Math.cos(rx)
      const sx = Math.sin(rx)
      const y2 = p[1] * cx - z1 * sx
      const z2 = p[1] * sx + z1 * cx
      return [x1, y2, z2]
    }

    const ringPoint = (k: number, a: number): [number, number, number] => {
      const r = ringRadius(k)
      const t = ringTilt(k)
      const x = r * Math.cos(a)
      const z = r * Math.sin(a)
      // tilt each orbit plane around Z
      return [x * Math.cos(t), x * Math.sin(t) * 1.0, z]
    }

    const draw = (time: number) => {
      const t = reducedMotion ? 6 : time / 1000
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = INK
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const S = Math.min(w, h) / 2 / 2.25

      // pointer easing
      if (ptr.in) {
        ptr.sx += (ptr.x - ptr.sx) * 0.12
        ptr.sy += (ptr.y - ptr.sy) * 0.12
      } else {
        ptr.sx += (cx - ptr.sx) * 0.05
        ptr.sy += (cy - ptr.sy) * 0.05
      }
      const nx = (ptr.sx - cx) / (w / 2)
      const ny = (ptr.sy - cy) / (h / 2)
      const ry = t * 0.22 + nx * 0.7
      const rx = 0.42 + ny * 0.35

      // on wide canvases the orbits stretch sideways; the object itself does not
      const wx = Math.min(2.3, Math.max(1, (w / h) * 0.7))
      const proj = (p: [number, number, number], stretch = 1) => {
        const q = rot(p, ry, rx)
        const persp = 1 / (1 - q[2] * 0.13)
        return { x: cx + q[0] * S * persp * stretch, y: cy + q[1] * S * persp, z: q[2], s: persp }
      }

      // --- rings: project, hit-test pointer, draw
      const ringPts: { x: number; y: number; z: number }[][] = []
      let nearest = -1
      let nearestD = 26
      for (let k = 0; k < RINGS; k++) {
        const pts: { x: number; y: number; z: number }[] = []
        const steps = 120
        for (let i = 0; i <= steps; i++) {
          const q = proj(ringPoint(k, (i / steps) * Math.PI * 2), wx)
          pts.push(q)
          if (ptr.in) {
            const d = Math.hypot(q.x - ptr.x, q.y - ptr.y)
            if (d < nearestD) {
              nearestD = d
              nearest = k
            }
          }
        }
        ringPts.push(pts)
      }
      const newHover = ptr.in && nearest >= 0 ? nearest : null
      if (newHover !== hoverRing) {
        hoverRing = newHover
        onActiveRef.current(hoverRing)
      }
      const auto = Math.floor(t / 3.4) % RINGS
      const lit = hoverRing ?? activeRef.current ?? auto

      // back half of rings first (behind object), front half after
      const drawRing = (k: number, front: boolean) => {
        const pts = ringPts[k]
        const on = k === lit
        ctx.beginPath()
        let pen = false
        for (let i = 0; i < pts.length; i++) {
          const isFront = pts[i].z >= 0
          if (isFront === front) {
            if (!pen) ctx.moveTo(pts[i].x, pts[i].y)
            else ctx.lineTo(pts[i].x, pts[i].y)
            pen = true
          } else pen = false
        }
        ctx.lineWidth = on ? 1.6 : 1
        ctx.strokeStyle = on ? RING_COLORS[k] : 'rgba(255,255,255,0.22)'
        ctx.setLineDash(on ? [2, 5] : [])
        ctx.lineDashOffset = on ? -t * 24 : 0
        ctx.stroke()
        ctx.setLineDash([])
      }
      for (let k = 0; k < RINGS; k++) drawRing(k, false)

      // --- the object: point cloud
      const rad = 90
      const items: { x: number; y: number; z: number; a: number; r: number }[] = []
      for (let i = 0; i < N; i++) {
        const q = proj(base[i])
        let x = q.x
        let y = q.y
        let boost = 0
        if (ptr.in) {
          const dx = x - ptr.x
          const dy = y - ptr.y
          const d = Math.hypot(dx, dy)
          if (d < rad && d > 0.001) {
            boost = 1 - d / rad
            const push = boost * boost * 30
            x += (dx / d) * push
            y += (dy / d) * push
          }
        }
        const depth = (q.z + 1.5) / 3
        items.push({ x, y, z: q.z, a: 0.18 + 0.82 * depth + boost * 0.4, r: (0.7 + 1.5 * depth) * q.s + boost * 1.6 })
      }
      items.sort((a, b) => a.z - b.z)
      for (const p of items) {
        ctx.fillStyle = `rgba(244,243,240,${Math.min(1, p.a)})`
        ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r)
      }

      for (let k = 0; k < RINGS; k++) drawRing(k, true)

      // --- orbit markers; lit one is a "+" with a tag
      for (let k = 0; k < RINGS; k++) {
        const a = t * (0.55 - k * 0.07) * (k % 2 ? -1 : 1) + k * 1.37
        const m = proj(ringPoint(k, a), wx)
        const on = k === lit
        ctx.strokeStyle = on ? RING_COLORS[k] : '#ffffff'
        ctx.fillStyle = on ? RING_COLORS[k] : '#ffffff'
        if (on) {
          const s = 7
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(m.x - s, m.y)
          ctx.lineTo(m.x + s, m.y)
          ctx.moveTo(m.x, m.y - s)
          ctx.lineTo(m.x, m.y + s)
          ctx.stroke()
          // tag
          const label = `0${k + 1}  ${labels[k] ?? ''}`.toUpperCase()
          ctx.font = '700 11px "Archivo", system-ui, sans-serif'
          const tw = ctx.measureText(label).width
          let tx = m.x + 14
          let ty = m.y - 24
          if (tx + tw + 16 > w - 6) tx = m.x - 14 - tw - 16
          if (ty < 6) ty = m.y + 12
          ctx.fillStyle = RING_COLORS[k]
          ctx.fillRect(tx, ty, tw + 16, 20)
          ctx.fillStyle = INK
          ctx.textBaseline = 'middle'
          ctx.fillText(label, tx + 8, ty + 10.5)
        } else {
          ctx.fillRect(m.x - 2, m.y - 2, 4, 4)
        }
      }
    }

    const loop = (time: number) => {
      raf = 0
      if (visible) draw(time)
      if (!reducedMotion && visible) raf = requestAnimationFrame(loop)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      kick()
    })
    ro.observe(wrap)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(wrap)

    const setPtr = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      ptr.x = e.clientX - r.left
      ptr.y = e.clientY - r.top
      if (!ptr.in) {
        ptr.sx = ptr.x
        ptr.sy = ptr.y
      }
      ptr.in = true
      if (reducedMotion) kick()
    }
    const leave = () => {
      ptr.in = false
      if (reducedMotion) kick()
    }
    canvas.addEventListener('pointermove', setPtr)
    canvas.addEventListener('pointerdown', setPtr)
    canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('pointercancel', leave)

    kick()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointermove', setPtr)
      canvas.removeEventListener('pointerdown', setPtr)
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('pointercancel', leave)
    }
  }, [labels])

  return (
    <div ref={wrapRef} className={`relative aspect-[5/4] w-full md:aspect-[2/1] overflow-hidden bg-[#0a0a0a] ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block touch-pan-y" aria-hidden="true" />
    </div>
  )
}
