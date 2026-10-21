import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { lerp, seeded, ss, useCanvasLoop } from '../../lib/scene'
import { reducedMotion } from '../../lib/motion'
import { MESS_BOUNDS } from './bounds'

/**
 * "From mess to one clean line": one request bounces between email, phone,
 * a spreadsheet, a person, the CRM and an invoice. Fieldwork measures every
 * hop; Build slides the stops into one line so the doubled-back hops fold
 * away; Run sends a pulse down the line, over and over. Example data only.
 */


const INK = '#0a0a0a'
const RED = '#ff5a4e'
const LIME = '#c8ff2e'
const FONT = "Archivo, 'Helvetica Neue', Arial, sans-serif"

// the route one request takes today (indices into nodes)
const ROUTE = [0, 2, 3, 1, 2, 3, 4, 0, 3, 2, 5, 3, 5]
// the order of the stops once it is one line
const CLEAN = [0, 1, 4, 2, 3, 5]
const MINUTES = [6, 4, 12, 3, 8, 5, 9, 4, 15, 6, 7, 5]

interface Props {
  target: MutableRefObject<number>
  nodes: string[]
  label: string
  onStage?: (i: number) => void
}

export default function MessScene({ target, nodes, label, onStage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const P = useRef(-1)
  const stageRef = useRef(-1)
  const cb = useRef(onStage)
  useEffect(() => {
    cb.current = onStage
  })

  // scattered positions (0..1 space) for the mess
  const messy = useMemo(() => {
    const rng = seeded(77)
    const spots: [number, number][] = [[0.18, 0.22], [0.82, 0.18], [0.5, 0.48], [0.2, 0.74], [0.8, 0.62], [0.52, 0.86]]
    return spots.map(([x, y]) => [x + rng.range(-0.04, 0.04), y + rng.range(-0.04, 0.04)] as [number, number])
  }, [])

  useCanvasLoop(canvasRef, ({ ctx: cx, w: W, h: H, t }) => {
    if (P.current < 0) P.current = target.current
    P.current += (target.current - P.current) * (reducedMotion ? 1 : 0.14)
    const p = P.current
    const stage = MESS_BOUNDS.findIndex((b, i) => p >= b && p < MESS_BOUNDS[i + 1])
    if (stage >= 0 && stage !== stageRef.current) {
      stageRef.current = stage
      cb.current?.(stage)
    }
    cx.clearRect(0, 0, W, H)
    const phone = W < 700

    const map = ss(0.24, 0.4, p) // fieldwork: measure every hop
    const build = ss(0.5, 0.72, p) // stops slide into one line
    const run = ss(0.76, 0.84, p)
    const calm = 1 - ss(0.45, 0.7, p) // the wobble of the mess

    const padX = phone ? 44 : W * 0.1
    const padY = H * 0.16
    const lineY = H * 0.5
    const pos = nodes.map((_, i) => {
      const [mx, my] = messy[i]
      const wob = calm * (phone ? 4 : 7)
      const ax = padX + mx * (W - padX * 2) + Math.sin(t * 1.3 + i * 2.1) * wob
      const ay = padY + my * (H - padY * 2) + Math.cos(t * 1.1 + i * 1.7) * wob
      const k = CLEAN.indexOf(i)
      // phones: the clean line runs top to bottom so the stops have room
      const bx = phone ? W / 2 : padX + (k / (CLEAN.length - 1)) * (W - padX * 2)
      const by = phone ? padY * 0.6 + (k / (CLEAN.length - 1)) * (H - padY * 0.6 - 90 - padY * 0.6) : lineY
      const e = ss(i * 0.04, 0.8 + i * 0.04, build)
      return { x: lerp(ax, bx, e), y: lerp(ay, by, e) }
    })

    /* the route */
    cx.lineJoin = 'round'
    cx.lineCap = 'round'
    const segs = ROUTE.slice(1).map((n, i) => [ROUTE[i], n])
    // drawn in, hop by hop, at the start
    const drawn = ss(0.02, 0.2, p) * segs.length
    segs.forEach(([a, b], i) => {
      const k = Math.min(1, Math.max(0, drawn - i))
      if (k <= 0) return
      const A = pos[a]
      const B = pos[b]
      // a slight bow so the mess reads as tangled; it straightens with the build
      const bow = (i % 2 ? 1 : -1) * (phone ? 26 : 46) * (1 - build)
      const mx = (A.x + B.x) / 2 + bow
      const my = (A.y + B.y) / 2 - bow * 0.6
      cx.strokeStyle = build > 0.5 ? `rgba(10,10,10,${0.25 + 0.6 * build})` : `rgba(255,90,78,${0.85 - 0.5 * build})`
      cx.lineWidth = lerp(phone ? 1.5 : 2, phone ? 3 : 4, build)
      cx.beginPath()
      cx.moveTo(A.x, A.y)
      const steps = 24
      for (let s = 1; s <= Math.round(steps * k); s++) {
        const u = s / steps
        cx.lineTo((1 - u) * (1 - u) * A.x + 2 * (1 - u) * u * mx + u * u * B.x, (1 - u) * (1 - u) * A.y + 2 * (1 - u) * u * my + u * u * B.y)
      }
      cx.stroke()
      // fieldwork: every hop gets measured
      if (map > 0.01 && build < 0.6) {
        cx.globalAlpha = map * (1 - ss(0.4, 0.6, build))
        const lx = 0.25 * A.x + 0.5 * mx + 0.25 * B.x
        const ly = 0.25 * A.y + 0.5 * my + 0.25 * B.y
        const txt = `${MINUTES[i]} min`
        cx.font = `700 ${phone ? 9 : 11}px ${FONT}`
        const tw = cx.measureText(txt).width + 8
        cx.fillStyle = '#ffffff'
        cx.fillRect(lx - tw / 2, ly - 8, tw, 16)
        cx.strokeStyle = INK
        cx.lineWidth = 1
        cx.setLineDash([3, 2])
        cx.strokeRect(lx - tw / 2, ly - 8, tw, 16)
        cx.setLineDash([])
        cx.fillStyle = INK
        cx.textAlign = 'center'
        cx.textBaseline = 'middle'
        cx.fillText(txt, lx, ly + 0.5)
        cx.textAlign = 'start'
        cx.globalAlpha = 1
      }
    })

    /* run: the clean line lights up and a pulse travels it, again and again */
    if (run > 0.01) {
      const first = pos[CLEAN[0]]
      const last = pos[CLEAN[CLEAN.length - 1]]
      cx.globalAlpha = run
      cx.strokeStyle = LIME
      cx.lineWidth = phone ? 8 : 12
      cx.beginPath(); cx.moveTo(first.x, first.y); cx.lineTo(last.x, last.y); cx.stroke()
      cx.strokeStyle = INK
      cx.lineWidth = phone ? 2 : 3
      cx.beginPath(); cx.moveTo(first.x, first.y); cx.lineTo(last.x, last.y); cx.stroke()
      for (let k = 0; k < 3; k++) {
        const u = (t * 0.35 + k / 3) % 1
        const x = lerp(first.x, last.x, u)
        const y = lerp(first.y, last.y, u)
        cx.fillStyle = INK
        cx.beginPath(); cx.arc(x, y, phone ? 5 : 7, 0, Math.PI * 2); cx.fill()
        cx.fillStyle = LIME
        cx.beginPath(); cx.arc(x, y, phone ? 2.5 : 3.5, 0, Math.PI * 2); cx.fill()
      }
      cx.globalAlpha = 1
    }

    /* the stops */
    cx.font = `700 ${phone ? 11 : 14}px ${FONT}`
    cx.textBaseline = 'middle'
    cx.textAlign = 'center'
    nodes.forEach((n, i) => {
      const q = pos[i]
      const you = n === 'You'
      const tw = cx.measureText(n).width + (phone ? 16 : 24)
      const th = phone ? 24 : 32
      cx.fillStyle = you ? INK : '#ffffff'
      cx.strokeStyle = INK
      cx.lineWidth = 1.5
      cx.beginPath()
      cx.roundRect(q.x - tw / 2, q.y - th / 2, tw, th, th / 2)
      cx.fill(); cx.stroke()
      cx.fillStyle = you ? '#ffffff' : INK
      cx.fillText(n, q.x, q.y + 0.5)
    })
    cx.textAlign = 'start'

    /* the tally */
    const hops = Math.round(lerp(segs.length, CLEAN.length - 1, build))
    const mins = Math.round(lerp(MINUTES.reduce((a, b) => a + b, 0), 14, build))
    const a = ss(0.06, 0.14, p)
    if (a > 0.01) {
      cx.globalAlpha = a
      cx.font = `700 ${phone ? 10 : 12}px ${FONT}`
      cx.fillStyle = 'rgba(10,10,10,0.65)'
      cx.textBaseline = 'alphabetic'
      const x0 = phone ? 16 : W * 0.04
      const y0 = phone ? H - 46 : H - 64
      cx.fillText('HAND-OFFS', x0, y0)
      cx.fillText('MINUTES PER REQUEST', x0 + (phone ? 96 : 150), y0)
      cx.font = `800 ${phone ? 26 : 40}px ${FONT}`
      cx.fillStyle = build > 0.5 ? INK : RED
      cx.fillText(String(hops), x0, y0 + (phone ? 30 : 44))
      cx.fillText(String(mins), x0 + (phone ? 96 : 150), y0 + (phone ? 30 : 44))
      cx.globalAlpha = 1
    }
  })

  return <canvas ref={canvasRef} role="img" aria-label={label} className="block h-full w-full" />
}
