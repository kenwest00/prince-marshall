import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { clamp01, lerp, seeded, ss, useCanvasLoop } from '../../lib/scene'
import { reducedMotion } from '../../lib/motion'
import { WEEK_BOUNDS } from './bounds'

/**
 * "Your week, before and after": a 5 × 10 grid of working hours. Busywork
 * takes 14 of them (red, labelled, counted). A p+m system assembles, the
 * leaked hours break into particles and flow into it, and 10 come back as
 * lime hours; the other 4 stay with a person, outlined. Example data only.
 */


const INK = '#0a0a0a'
const RED = '#ff5a4e'
const LIME = '#c8ff2e'
const FONT = "Archivo, 'Helvetica Neue', Arial, sans-serif"
const DAYS = 5
const HOURS = 10
const LOST = 14
const BACK = 10

interface Props {
  target: MutableRefObject<number>
  days: string[]
  leaks: string[]
  lostLabel: string
  backLabel: string
  systemLabel: string
  keptLabel: string
  label: string
  onStage?: (i: number) => void
  onPayoff?: (on: boolean) => void
}

interface Leak {
  cell: number
  label: string
  /** order in which it is lost, 0..LOST-1 */
  order: number
  /** comes back (true) or stays with a person (false) */
  back: boolean
}

export default function WeekScene({ target, days, leaks, lostLabel, backLabel, systemLabel, keptLabel, label, onStage, onPayoff }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const P = useRef(-1)
  const stageRef = useRef(-1)
  const payRef = useRef(false)
  const cbs = useRef({ onStage, onPayoff })
  useEffect(() => {
    cbs.current = { onStage, onPayoff }
  })

  const plan = useMemo(() => {
    const rng = seeded(1450)
    const cells = Array.from({ length: DAYS * HOURS }, (_, i) => i)
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      ;[cells[i], cells[j]] = [cells[j], cells[i]]
    }
    const picked = cells.slice(0, LOST)
    const list: Leak[] = picked.map((cell, i) => ({ cell, label: leaks[i % leaks.length], order: i, back: i < BACK }))
    // particles: 22 per returning hour, with a fixed scatter
    const parts = list
      .filter((l) => l.back)
      .flatMap((l) =>
        Array.from({ length: 22 }, () => ({
          cell: l.cell,
          ox: rng.range(-0.5, 0.5),
          oy: rng.range(-0.5, 0.5),
          bend: rng.range(-0.35, 0.35),
          d: rng.range(0, 0.25),
          r: rng.range(0.6, 1),
        })),
      )
    return { list, parts }
  }, [leaks])

  useCanvasLoop(canvasRef, ({ ctx: cx, w: W, h: H, t }) => {
    if (P.current < 0) P.current = target.current
    P.current += (target.current - P.current) * (reducedMotion ? 1 : 0.14)
    const p = P.current
    const stage = WEEK_BOUNDS.findIndex((b, i) => p >= b && p < WEEK_BOUNDS[i + 1])
    if (stage >= 0 && stage !== stageRef.current) {
      stageRef.current = stage
      cbs.current.onStage?.(stage)
    }
    const pay = p > 0.86
    if (pay !== payRef.current) {
      payRef.current = pay
      cbs.current.onPayoff?.(pay)
    }

    cx.clearRect(0, 0, W, H)
    const phone = W < 700

    /* layout: grid on the left (top on phones), system tile and counters on the right (below) */
    const gx = phone ? 16 + 26 : Math.round(W * 0.06) + 40
    const gy = phone ? 34 : Math.round(H * 0.14)
    const gw = phone ? W - gx - 16 : Math.round(W * 0.5)
    const gh = phone ? Math.round(H * 0.5) : Math.round(H * 0.72)
    const cw = gw / DAYS
    const ch = gh / HOURS
    const gap = Math.max(2, Math.round(Math.min(cw, ch) * 0.08))
    const cell = (i: number) => {
      const d = Math.floor(i / HOURS)
      const h = i % HOURS
      return { x: gx + d * cw + gap / 2, y: gy + h * ch + gap / 2, w: cw - gap, h: ch - gap }
    }
    const tile = phone
      ? { x: W / 2, y: gy + gh + (H - gy - gh) * 0.5, s: Math.min(W * 0.2, (H - gy - gh) * 0.42) }
      : { x: gx + gw + (W - gx - gw) * 0.5, y: H * 0.56, s: Math.min(W * 0.11, H * 0.2) }

    const appear = ss(0.0, 0.12, p)
    const sys = ss(0.4, 0.5, p) // system tile assembles
    const send = (k: number) => ss(0.42 + k, 0.58 + k, p) // hour flows into the system
    const ret = (k: number) => ss(0.6 + k, 0.8 + k, p) // hour flows back as lime
    const kept = ss(0.74, 0.84, p)

    /* day and hour labels */
    cx.textBaseline = 'middle'
    cx.font = `700 ${phone ? 10 : 12}px ${FONT}`
    cx.fillStyle = `rgba(10,10,10,${0.6 * appear})`
    cx.textAlign = 'center'
    days.forEach((d, i) => cx.fillText(d.toUpperCase(), gx + (i + 0.5) * cw, gy - 14))
    cx.textAlign = 'right'
    for (let h = 0; h < HOURS; h += phone ? 3 : 1) {
      const hr = 8 + h
      cx.fillText(`${hr > 12 ? hr - 12 : hr}${hr >= 12 ? 'p' : 'a'}`, gx - 8, gy + (h + 0.5) * ch)
    }
    cx.textAlign = 'start'

    /* the hour blocks */
    const leakBy = new Map(plan.list.map((l) => [l.cell, l]))
    let lostNow = 0
    let backNow = 0
    for (let i = 0; i < DAYS * HOURS; i++) {
      const c = cell(i)
      const dayIn = clamp01(appear * 1.6 - Math.floor(i / HOURS) * 0.15)
      if (dayIn <= 0) continue
      const lk = leakBy.get(i)
      const lost = lk ? ss(0.15 + lk.order * 0.016, 0.2 + lk.order * 0.016, p) : 0
      if (lk) lostNow += lost
      cx.globalAlpha = dayIn
      if (!lk || lost < 0.01) {
        cx.fillStyle = 'rgba(10,10,10,0.06)'
        cx.fillRect(c.x, c.y, c.w, c.h)
        cx.globalAlpha = 1
        continue
      }
      const k = lk.order * 0.008
      const gone = lk.back ? send(k) : 0
      const home = lk.back ? ret(k) : 0
      if (lk.back) backNow += home
      // red, labelled, while lost; empty while it is inside the system; lime when it is back
      if (home > 0.02) {
        cx.fillStyle = 'rgba(10,10,10,0.06)'
        cx.fillRect(c.x, c.y, c.w, c.h)
        const hh = c.h * home
        cx.fillStyle = LIME
        cx.fillRect(c.x, c.y + c.h - hh, c.w, hh)
        if (home > 0.7 && c.w > 64) {
          cx.fillStyle = INK
          cx.font = `700 ${Math.min(12, c.h * 0.36)}px ${FONT}`
          cx.fillText('✓ yours', c.x + 6, c.y + c.h / 2)
        }
      } else if (gone < 0.98) {
        cx.globalAlpha = dayIn * (1 - gone)
        cx.fillStyle = 'rgba(10,10,10,0.06)'
        cx.fillRect(c.x, c.y, c.w, c.h)
        cx.fillStyle = RED
        const ww = c.w * lost
        cx.fillRect(c.x, c.y, ww, c.h)
        if (lost > 0.9 && c.w > 64) {
          cx.fillStyle = INK
          cx.font = `700 ${Math.min(12, c.h * 0.36)}px ${FONT}`
          cx.save()
          cx.beginPath(); cx.rect(c.x, c.y, c.w, c.h); cx.clip()
          cx.fillText(lk.label, c.x + 6, c.y + c.h / 2)
          cx.restore()
        }
        // kept hours: the red turns into a person-shaped outline
        if (!lk.back && kept > 0.01) {
          cx.globalAlpha = dayIn
          cx.fillStyle = `rgba(255,255,255,${kept})`
          cx.fillRect(c.x, c.y, c.w, c.h)
          cx.strokeStyle = `rgba(10,10,10,${kept})`
          cx.lineWidth = 1.5
          cx.setLineDash([4, 3])
          cx.strokeRect(c.x + 0.75, c.y + 0.75, c.w - 1.5, c.h - 1.5)
          cx.setLineDash([])
          if (c.w > 64) {
            cx.fillStyle = `rgba(10,10,10,${kept})`
            cx.font = `700 ${Math.min(12, c.h * 0.36)}px ${FONT}`
            cx.fillText('needs you', c.x + 6, c.y + c.h / 2)
          }
        }
      } else {
        cx.fillStyle = 'rgba(10,10,10,0.06)'
        cx.fillRect(c.x, c.y, c.w, c.h)
      }
      cx.globalAlpha = 1
    }

    /* particles: hours flowing into the system, then back out as lime */
    for (const q of plan.parts) {
      const lk = leakBy.get(q.cell)
      if (!lk) continue
      const k = lk.order * 0.008
      const a = send(k)
      const b = ret(k)
      const c = cell(q.cell)
      const cxp = c.x + c.w * (0.5 + q.ox * 0.9)
      const cyp = c.y + c.h * (0.5 + q.oy * 0.9)
      let u: number
      let col: string
      if (b > 0 && b < 1) {
        u = 1 - ss(q.d, q.d + 0.75, b)
        col = LIME
      } else if (a > 0 && a < 1 && b <= 0) {
        u = ss(q.d, q.d + 0.75, a)
        col = RED
      } else continue
      if (u <= 0.001 || u >= 0.999) continue
      // a bowed path between the hour and the system
      const mx = (cxp + tile.x) / 2 + (tile.y - cyp) * q.bend
      const my = (cyp + tile.y) / 2 - (tile.x - cxp) * q.bend
      const x = (1 - u) * (1 - u) * cxp + 2 * (1 - u) * u * mx + u * u * tile.x
      const y = (1 - u) * (1 - u) * cyp + 2 * (1 - u) * u * my + u * u * tile.y
      const s = (phone ? 3 : 4) * q.r
      cx.fillStyle = col
      cx.fillRect(x - s / 2, y - s / 2, s, s)
      if (col === LIME) {
        cx.strokeStyle = 'rgba(10,10,10,0.35)'
        cx.lineWidth = 0.5
        cx.strokeRect(x - s / 2, y - s / 2, s, s)
      }
    }

    /* the p+m system tile */
    if (sys > 0.01) {
      const busy = ss(0.42, 0.5, p) * (1 - ss(0.82, 0.9, p))
      const pulse = 1 + Math.sin(t * 6) * 0.03 * busy
      const s = tile.s * (0.6 + 0.4 * sys) * pulse
      cx.globalAlpha = sys
      // depth
      cx.fillStyle = '#2a2a2a'
      cx.beginPath()
      cx.moveTo(tile.x - s / 2, tile.y - s / 2)
      cx.lineTo(tile.x - s / 2 + s * 0.14, tile.y - s / 2 - s * 0.1)
      cx.lineTo(tile.x + s / 2 + s * 0.14, tile.y - s / 2 - s * 0.1)
      cx.lineTo(tile.x + s / 2 + s * 0.14, tile.y + s / 2 - s * 0.1)
      cx.lineTo(tile.x + s / 2, tile.y + s / 2)
      cx.lineTo(tile.x + s / 2, tile.y - s / 2)
      cx.closePath()
      cx.fill()
      cx.fillStyle = INK
      cx.fillRect(tile.x - s / 2, tile.y - s / 2, s, s)
      const bar = s * 0.16
      cx.fillStyle = LIME
      cx.fillRect(tile.x - s * 0.3, tile.y - bar / 2, s * 0.6, bar)
      cx.fillRect(tile.x - bar / 2, tile.y - s * 0.3, bar, s * 0.6)
      cx.fillStyle = INK
      cx.font = `700 ${phone ? 11 : 13}px ${FONT}`
      cx.textAlign = 'center'
      cx.fillText(systemLabel.toUpperCase(), tile.x, tile.y + s / 2 + 18)
      cx.textAlign = 'start'
      cx.globalAlpha = 1
    }

    /* counters */
    const lostShown = Math.round(lerp(0, LOST, clamp01(lostNow / LOST)) - backNow - kept * (LOST - BACK))
    const backShown = Math.round(backNow)
    const big = phone ? 30 : Math.min(64, W * 0.045)
    const cxN = phone ? 16 : tile.x - tile.s * 1.1
    const cyN = phone ? gy + gh + 22 : H * 0.16
    if (p > 0.12) {
      cx.globalAlpha = ss(0.12, 0.16, p)
      cx.textBaseline = 'alphabetic'
      cx.fillStyle = 'rgba(10,10,10,0.7)'
      cx.font = `700 ${phone ? 10 : 13}px ${FONT}`
      cx.fillText(lostLabel.toUpperCase(), cxN, cyN)
      cx.fillStyle = RED
      cx.font = `800 ${big}px ${FONT}`
      cx.fillText(`${Math.max(0, lostShown)}h`, cxN, cyN + big + 2)
      if (p > 0.6) {
        const bx = phone ? W - 16 - big * 2.6 : cxN
        const by = phone ? cyN : cyN + big + 34
        cx.globalAlpha = ss(0.6, 0.64, p)
        cx.fillStyle = 'rgba(10,10,10,0.7)'
        cx.font = `700 ${phone ? 10 : 13}px ${FONT}`
        cx.fillText(backLabel.toUpperCase(), bx, by)
        cx.font = `800 ${big}px ${FONT}`
        const txt = `+${backShown}h`
        const tw = cx.measureText(txt).width
        cx.fillStyle = LIME
        cx.fillRect(bx - 4, by + 8, tw + 8, big * 0.95)
        cx.fillStyle = INK
        cx.fillText(txt, bx, by + big + 2)
      }
      if (kept > 0.5 && !phone) {
        cx.globalAlpha = kept
        cx.font = `700 13px ${FONT}`
        cx.fillStyle = 'rgba(10,10,10,0.75)'
        cx.strokeStyle = INK
        cx.setLineDash([4, 3])
        const ky = cyN + big * 2 + 72
        cx.strokeRect(cxN, ky - 11, 22, 14)
        cx.setLineDash([])
        cx.fillText(keptLabel, cxN + 30, ky)
      }
      cx.globalAlpha = 1
    }
  })

  return <canvas ref={canvasRef} role="img" aria-label={label} className="block h-full w-full" />
}
