import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { camera, lerp, seeded, ss, useCanvasLoop, type V3 } from '../lib/scene'
import { reducedMotion } from '../lib/motion'

/**
 * The p+m tile built in front of the visitor through the five Method stages:
 * Observe (survey points), Define (wireframe + real dimensions), Design
 * (surfaces + signal mark), Build (solid ink, lime plus), Sustain (ground, pulse).
 * Progress comes from the parent as a target in a ref; the scene eases toward it.
 */

interface Props {
  target: MutableRefObject<number>
  onStage?: (i: number) => void
  /** Draw dimension labels and point labels (off for the tiny preloader). */
  annotate?: boolean
  /** Fraction of the canvas' short side the tile spans. */
  scale?: number
  /** Horizontal centre as a fraction of width. */
  centerX?: number
  className?: string
  label: string
}

const HD = 0.28
const PZ = 0.15
const A = 0.17
const L = 0.62
const INK = '#0a0a0a'
const LIME = '#c8ff2e'

const box: V3[] = [
  [-1, -1, -HD], [1, -1, -HD], [1, 1, -HD], [-1, 1, -HD],
  [-1, -1, HD], [1, -1, HD], [1, 1, HD], [-1, 1, HD],
]
const boxEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
const boxFaces: { v: number[]; n: V3 }[] = [
  { v: [4, 5, 6, 7], n: [0, 0, 1] }, { v: [1, 0, 3, 2], n: [0, 0, -1] }, { v: [5, 1, 2, 6], n: [1, 0, 0] },
  { v: [0, 4, 7, 3], n: [-1, 0, 0] }, { v: [7, 6, 2, 3], n: [0, 1, 0] }, { v: [0, 1, 5, 4], n: [0, -1, 0] },
]
const plus2d = [[-A, -L], [A, -L], [A, -A], [L, -A], [L, A], [A, A], [A, L], [-A, L], [-A, A], [-L, A], [-L, -A], [-A, -A]]
const plusBase: V3[] = plus2d.map(([x, y]) => [x, y, HD])
const plusTop: V3[] = plus2d.map(([x, y]) => [x, y, HD + PZ])
const TILE_BOUNDS = [0, 0.2, 0.42, 0.64, 0.86, 1.0001]

function makePoints(n: number) {
  const rng = seeded(1200)
  const rnd = rng.range
  const pts: { s: V3; t: V3; d: number; lab: string | null }[] = []
  for (let i = 0; i < n; i++) {
    let t: V3
    const r = rng.next()
    if (r < 0.36) t = [rnd(-1, 1), rnd(-1, 1), HD]
    else if (r < 0.62) t = [rnd(-1, 1), rnd(-1, 1), -HD]
    else {
      const s = Math.floor(rnd(0, 4))
      const u = rnd(-1, 1)
      const w = rnd(-HD, HD)
      t = s === 0 ? [1, u, w] : s === 1 ? [-1, u, w] : s === 2 ? [u, 1, w] : [u, -1, w]
    }
    const ang = rnd(0, Math.PI * 2)
    const rad = rnd(1.4, 3.4)
    pts.push({
      s: [Math.cos(ang) * rad * 1.25, rnd(-1.1, 1.1) * 1.1 - 0.15, Math.sin(ang) * rad * 0.8],
      t,
      d: rnd(0, 0.35),
      lab: i % 37 === 0 ? String(10 + ((i * 7) % 89)).padStart(3, '0') : null,
    })
  }
  const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
  const links: [number, number][] = []
  const pick = (key: 's' | 't', count: number, min: number) => {
    for (let k = 0; k < count; k++) {
      const a = Math.floor(rnd(0, n))
      let best = -1
      let bd = 9
      for (let j = 0; j < 40; j++) {
        const b = Math.floor(rnd(0, n))
        if (b === a) continue
        const d = dist(pts[a][key], pts[b][key])
        if (d < bd && d > min) {
          bd = d
          best = b
        }
      }
      if (best >= 0) links.push([a, best])
    }
  }
  pick('t', Math.round(n / 4.7), 0.15)
  pick('s', Math.round(n / 4.7), 0)
  return { pts, links }
}

export default function TileScene({ target, onStage, annotate = true, scale = 0.25, centerX = 0.5, className = '', label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isPhone = typeof window !== 'undefined' && window.innerWidth < 700
  const { pts, links } = useMemo(() => makePoints(isPhone ? 420 : 760), [isPhone])
  const P = useRef(-1)
  const stageRef = useRef(-1)
  const onStageRef = useRef(onStage)
  useEffect(() => {
    onStageRef.current = onStage
  })

  useCanvasLoop(canvasRef, ({ ctx: cx, w: W, h: H, t, px, py }) => {
    if (P.current < 0) P.current = target.current
    P.current += (target.current - P.current) * (reducedMotion ? 1 : 0.12)
    const p = P.current
    const stage = TILE_BOUNDS.findIndex((b, i) => p >= b && p < TILE_BOUNDS[i + 1])
    if (stage !== stageRef.current && stage >= 0) {
      stageRef.current = stage
      onStageRef.current?.(stage)
    }
    cx.clearRect(0, 0, W, H)

    const obs = 1 - ss(0.14, 0.42, p)
    const wire = ss(0.24, 0.44, p)
    const dims = annotate ? ss(0.28, 0.44, p) * (1 - ss(0.7, 0.8, p)) : 0
    const surf = ss(0.44, 0.62, p)
    const solid = ss(0.64, 0.82, p)
    const sus = ss(0.86, 0.98, p)

    const S = Math.min(W, H) * scale
    const cX = W * centerX
    const cY = H / 2 - sus * S * 0.12
    const yaw = lerp(-0.95, -0.42, p) + Math.sin(t * 0.25) * 0.05 * (1 - solid * 0.5) + px * 0.6
    const pitch = lerp(0.62, 0.36, p) + py * 0.3
    const lift = sus * (0.08 + Math.sin(t * 1.4) * 0.025)
    const { proj, rotN } = camera(yaw, pitch, cX, cY, S, lift)

    if (sus > 0.01) {
      cx.save()
      cx.globalAlpha = sus
      const gy = -1.05 - lift
      cx.strokeStyle = 'rgba(10,10,10,0.14)'
      cx.lineWidth = 0.75
      cx.beginPath()
      for (let i = -6; i <= 6; i++) {
        const a = proj([i * 0.45, gy, -2.7]), b = proj([i * 0.45, gy, 2.7])
        const c = proj([-2.7, gy, i * 0.45]), d = proj([2.7, gy, i * 0.45])
        cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.moveTo(c.x, c.y); cx.lineTo(d.x, d.y)
      }
      cx.stroke()
      const sh = [[-1, -HD], [1, -HD], [1, HD], [-1, HD]].map(([x, z]) => proj([x * 1.06, gy, z * 1.4]))
      cx.fillStyle = 'rgba(10,10,10,0.12)'
      cx.beginPath(); sh.forEach((q, i) => (i ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y))); cx.fill()
      cx.restore()
    }

    const ptA = 1 - solid
    const P2 = pts.map((o) => {
      const k = ss(o.d, o.d + 0.65, 1 - obs)
      const drift = obs * 0.06
      return proj([
        lerp(o.s[0], o.t[0], k) + Math.sin(t * 0.7 + o.d * 20) * drift,
        lerp(o.s[1], o.t[1], k) + Math.cos(t * 0.6 + o.d * 13) * drift,
        lerp(o.s[2], o.t[2], k),
      ])
    })
    if (ptA > 0.01) {
      const maxLen = lerp(110, 400, 1 - obs)
      cx.lineWidth = 0.75
      cx.strokeStyle = `rgba(10,10,10,${0.22 * ptA})`
      cx.beginPath()
      for (const [a, b] of links) {
        if (Math.hypot(P2[a].x - P2[b].x, P2[a].y - P2[b].y) > maxLen) continue
        cx.moveTo(P2[a].x, P2[a].y); cx.lineTo(P2[b].x, P2[b].y)
      }
      cx.stroke()
    }

    type Face = { q: { x: number; y: number; z: number }[]; n: V3; kind: 'box' | 'pside' | 'ptop'; z: number }
    const faces: Face[] = boxFaces.map((f) => ({ q: f.v.map((i) => proj(box[i])), n: f.n, kind: 'box' as const, z: 0 }))
    if (surf > 0.01) {
      for (let i = 0; i < 12; i++) {
        const j = (i + 1) % 12
        const a = plusBase[i], b = plusBase[j]
        faces.push({ q: [proj(a), proj(b), proj(plusTop[j]), proj(plusTop[i])], n: [b[1] - a[1], -(b[0] - a[0]), 0], kind: 'pside', z: 0 })
      }
      faces.push({ q: plusTop.map((v) => proj(v)), n: [0, 0, 1], kind: 'ptop', z: 0 })
    }
    for (const f of faces) f.z = f.q.reduce((s, v) => s + v.z, 0) / f.q.length
    faces.sort((a, b) => a.z - b.z)
    for (const f of faces) {
      const n = rotN(f.n)
      const ln = Math.hypot(n[0], n[1], n[2]) || 1
      const dl = Math.max(0, (n[0] * 0.35 + n[1] * 0.55 + n[2] * 0.75) / ln)
      cx.beginPath(); f.q.forEach((v, i) => (i ? cx.lineTo(v.x, v.y) : cx.moveTo(v.x, v.y))); cx.closePath()
      if (f.kind === 'box') {
        if (surf > 0.01) {
          const paperA = surf * (1 - solid) * 0.55
          if (paperA > 0.01) { cx.fillStyle = `rgba(244,243,240,${paperA})`; cx.fill() }
          if (solid > 0.01) { const l = Math.round(10 + 46 * dl); cx.fillStyle = `rgba(${l},${l},${l},${solid})`; cx.fill() }
        }
      } else {
        if (solid < 0.99) { cx.strokeStyle = `rgba(10,10,10,${surf * (1 - solid)})`; cx.lineWidth = 1; cx.stroke() }
        if (solid > 0.01) {
          const k = 0.72 + 0.28 * dl
          cx.fillStyle = `rgba(${Math.round(200 * k)},${Math.round(255 * k)},${Math.round(46 * k)},${solid})`
          cx.fill(); cx.strokeStyle = `rgba(10,10,10,${solid * 0.9})`; cx.lineWidth = 1; cx.stroke()
        } else if (f.kind === 'ptop' && surf > 0.2) {
          cx.fillStyle = `rgba(200,255,46,${(surf - 0.2) * 0.8})`; cx.fill(); cx.stroke()
        }
      }
    }

    if (wire > 0.01) {
      cx.lineWidth = 1.5 - solid * 0.5
      cx.strokeStyle = `rgba(10,10,10,${0.9 - solid * 0.75})`
      boxEdges.forEach(([a, b], i) => {
        const k = Math.min(1, Math.max(0, wire * 1.6 - i * 0.05))
        if (k <= 0) return
        const A2 = proj(box[a]), B2 = proj(box[b])
        cx.beginPath(); cx.moveTo(A2.x, A2.y); cx.lineTo(lerp(A2.x, B2.x, k), lerp(A2.y, B2.y, k)); cx.stroke()
      })
    }

    if (ptA > 0.01) {
      cx.fillStyle = INK
      for (const q of P2) {
        const s = (1.1 + (q.z + 1.6) * 0.45) * (isPhone ? 0.9 : 1)
        cx.globalAlpha = ptA * (0.35 + 0.5 * ((q.z + 2) / 4))
        cx.fillRect(q.x - s / 2, q.y - s / 2, s, s)
      }
      cx.globalAlpha = 1
      if (annotate) {
        cx.font = '700 10px Archivo, Arial, sans-serif'
        cx.textBaseline = 'middle'
        pts.forEach((o, i) => {
          if (!o.lab) return
          const a = ptA * (0.35 + 0.6 * obs)
          if (a < 0.03) return
          cx.fillStyle = `rgba(10,10,10,${a})`
          cx.fillText(o.lab, P2[i].x + 5, P2[i].y - 6)
        })
      }
    }

    if (dims > 0.01) {
      const off = 0.32
      const dl = (a: V3, b: V3, text: string, nx: number) => {
        const A2 = proj(a), B2 = proj(b)
        const ux = B2.x - A2.x, uy = B2.y - A2.y
        const len = Math.hypot(ux, uy) || 1
        const tx = (-uy / len) * 5, ty = (ux / len) * 5
        cx.strokeStyle = `rgba(10,10,10,${dims * 0.8})`; cx.lineWidth = 0.75; cx.beginPath()
        cx.moveTo(A2.x, A2.y); cx.lineTo(B2.x, B2.y)
        cx.moveTo(A2.x - tx, A2.y - ty); cx.lineTo(A2.x + tx, A2.y + ty)
        cx.moveTo(B2.x - tx, B2.y - ty); cx.lineTo(B2.x + tx, B2.y + ty)
        cx.stroke()
        const mx = (A2.x + B2.x) / 2 + nx, my = (A2.y + B2.y) / 2
        cx.font = '700 11px Archivo, Arial, sans-serif'
        const tw = cx.measureText(text).width + 10
        cx.fillStyle = `rgba(255,255,255,${dims})`; cx.fillRect(mx - tw / 2, my - 9, tw, 18)
        cx.fillStyle = `rgba(10,10,10,${dims})`; cx.textAlign = 'center'; cx.fillText(text, mx, my + 0.5); cx.textAlign = 'start'
      }
      dl([-1, -1 - off, HD], [1, -1 - off, HD], '1200', 0)
      dl([1 + off, -1, HD], [1 + off, 1, HD], '1200', 0)
      dl([1 + off, -1 - off, -HD], [1 + off, -1 - off, HD], '280', 18)
    }

    if (sus > 0.01) {
      const a = t * 0.9
      const o = proj([Math.cos(a) * 1.55, 0.2 + Math.sin(a * 2) * 0.1, Math.sin(a) * 1.55])
      cx.globalAlpha = sus; cx.fillStyle = LIME; cx.strokeStyle = INK; cx.lineWidth = 1
      cx.beginPath(); cx.arc(o.x, o.y, 5, 0, Math.PI * 2); cx.fill(); cx.stroke()
      cx.globalAlpha = 1
    }
  })

  return <canvas ref={canvasRef} role="img" aria-label={label} className={`block h-full w-full ${className}`} />
}
