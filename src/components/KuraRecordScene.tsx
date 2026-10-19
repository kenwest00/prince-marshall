import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { camera, lerp, seeded, ss, useCanvasLoop, type V3 } from '../lib/scene'
import { reducedMotion } from '../lib/motion'
import { RING_COLORS } from '../lib/palette'

/**
 * KURA: from notebook to record. A handwritten ledger entry breaks into points
 * that gather into a public sculpture; then each part of its record arrives as
 * its own orbit: what you hold, where it is (city map), condition (scan),
 * provenance (dated nodes) and worth. Example data only, labelled as such.
 */

export interface KuraSceneCopy {
  notebook: string[]
  /** index of the entry that becomes the record */
  entry: number
  tags: string[]
  mapLabel: string
  conditionMark: string
  provenance: { year: string; label: string }[]
}

interface Props {
  target: MutableRefObject<number>
  copy: KuraSceneCopy
  onStage?: (i: number) => void
  label: string
  className?: string
}

const KURA_BOUNDS = [0, 0.28, 0.46, 0.64, 0.82, 1.0001]

const prof: [number, number][] = [[-0.72, 0.2], [-0.5, 0.34], [-0.15, 0.48], [0.2, 0.4], [0.5, 0.22], [0.72, 0.27], [0.92, 0.18], [1.05, 0.06]]
const R = (y: number) => {
  for (let i = 0; i < prof.length - 1; i++) {
    const [y0, r0] = prof[i]
    const [y1, r1] = prof[i + 1]
    if (y <= y1) {
      const k = (1 - Math.cos(((y - y0) / (y1 - y0)) * Math.PI)) / 2
      return r0 + (r1 - r0) * k
    }
  }
  return prof[prof.length - 1][1]
}
const Y0 = -0.72
const Y1 = 1.05
const PL = 0.42 // plinth half-width
const surf = (u: number, v: number): V3 => {
  const y = Y0 + (Y1 - Y0) * u
  const a = v * Math.PI * 2 + y * 0.6 // gentle twist
  const r = R(y)
  return [Math.cos(a) * r, y, Math.sin(a) * r]
}
const plinthFaces: { v: V3[]; n: V3 }[] = [
  { v: [[-PL, -0.72, PL], [PL, -0.72, PL], [PL, -1, PL], [-PL, -1, PL]], n: [0, 0, 1] },
  { v: [[PL, -0.72, -PL], [-PL, -0.72, -PL], [-PL, -1, -PL], [PL, -1, -PL]], n: [0, 0, -1] },
  { v: [[PL, -0.72, PL], [PL, -0.72, -PL], [PL, -1, -PL], [PL, -1, PL]], n: [1, 0, 0] },
  { v: [[-PL, -0.72, -PL], [-PL, -0.72, PL], [-PL, -1, PL], [-PL, -1, -PL]], n: [-1, 0, 0] },
  { v: [[-PL, -0.72, -PL], [PL, -0.72, -PL], [PL, -0.72, PL], [-PL, -0.72, PL]], n: [0, 1, 0] },
]
const streets: [V3, V3][] = [
  [[-2.6, -1, -1.9], [2.6, -1, -1.9]], [[-2.6, -1, 1.5], [2.6, -1, 1.5]], [[-2.6, -1, 2.3], [2.6, -1, 2.3]],
  [[-2.1, -1, -2.6], [-2.1, -1, 2.6]], [[1.7, -1, -2.6], [1.7, -1, 2.6]], [[2.4, -1, -2.6], [2.4, -1, 2.6]],
  [[-2.6, -1, -0.4], [-2.1, -1, -0.6]], [[-2.6, -1, 2.6], [0.4, -1, -2.6]],
]

export default function KuraRecordScene({ target, copy, onStage, label, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isPhone = typeof window !== 'undefined' && window.innerWidth < 700
  const LAT = 22
  const LON = isPhone ? 24 : 32
  const N = isPhone ? 420 : 700

  const pts = useMemo(() => {
    const rng = seeded(214)
    const rnd = rng.range
    return Array.from({ length: N }, (_, i) => {
        let t: V3
        if (i % 5 === 0) {
          const f = plinthFaces[Math.floor(rnd(0, 5))]
          const a = rnd(0, 1), b = rnd(0, 1)
          const [p0, p1, , p3] = f.v
          t = [p0[0] + (p1[0] - p0[0]) * a + (p3[0] - p0[0]) * b, p0[1] + (p1[1] - p0[1]) * a + (p3[1] - p0[1]) * b, p0[2] + (p1[2] - p0[2]) * a + (p3[2] - p0[2]) * b]
        } else t = surf(rng.next(), rng.next())
        const ang = rnd(0, Math.PI * 2), rr = rnd(1.3, 2.8)
        return { t, s: [Math.cos(ang) * rr * 1.3, rnd(-1.3, 1.3), Math.sin(ang) * rr] as V3, d: rnd(0, 0.3) }
      })
  }, [N])

  // pixel offsets of the chosen ledger entry, sampled once at 20px
  const textPts = useMemo(() => {
    if (typeof document === 'undefined') return [] as [number, number][]
    const c = document.createElement('canvas')
    c.width = 900
    c.height = 40
    const x = c.getContext('2d')
    if (!x) return []
    x.font = 'italic 500 20px Archivo, Arial, sans-serif'
    x.fillStyle = '#000'
    x.textBaseline = 'middle'
    x.fillText(copy.notebook[copy.entry] ?? '', 0, 20)
    const d = x.getImageData(0, 0, 900, 40).data
    const out: [number, number][] = []
    for (let yy = 0; yy < 40; yy += 2) for (let xx = 0; xx < 900; xx += 2) if (d[(yy * 900 + xx) * 4 + 3] > 128) out.push([xx, yy - 20])
    const rng = seeded(31)
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out.slice(0, isPhone ? 140 : 220)
  }, [copy, isPhone])

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
    const stage = KURA_BOUNDS.findIndex((b, i) => p >= b && p < KURA_BOUNDS[i + 1])
    if (stage !== stageRef.current && stage >= 0) {
      stageRef.current = stage
      onStageRef.current?.(stage)
    }
    const cur = stage

    cx.fillStyle = '#0a0a0a'
    cx.fillRect(0, 0, W, H)

    const book = 1 - ss(0.06, 0.2, p)
    const gather = ss(0.08, 0.24, p)
    const wire = ss(0.14, 0.3, p)
    const solid = ss(0.46, 0.6, p)
    const S = Math.min(W, H) * (isPhone ? 0.3 : 0.32)
    const cX = W / 2
    const cY = H / 2 + S * 0.08
    const yaw = t * 0.16 + p * 1.5 + px * 0.7
    const pitch = 0.3 + py * 0.25
    const wx = Math.min(1.9, Math.max(1, (W / H) * 0.75))
    const { proj, projFixed, rotN } = camera(yaw, pitch, cX, cY, S)

    /* --- the notebook page --- */
    const pageW = Math.min(W * 0.78, 620)
    const fs = Math.min(20, pageW / 30)
    const lh = fs * 1.9
    const pageH = lh * 10
    const pX = (W - pageW) / 2
    const pY = (H - pageH) / 2
    const entryY = pY + lh * (copy.entry + 2)
    if (book > 0.01) {
      cx.save()
      cx.globalAlpha = book
      cx.strokeStyle = 'rgba(255,255,255,0.22)'
      cx.lineWidth = 0.75
      cx.strokeRect(pX, pY, pageW, pageH)
      cx.beginPath()
      for (let i = 1; i < 10; i++) { cx.moveTo(pX, pY + i * lh + lh * 0.5); cx.lineTo(pX + pageW, pY + i * lh + lh * 0.5) }
      cx.stroke()
      cx.strokeStyle = 'rgba(255,255,255,0.3)'
      cx.beginPath(); cx.moveTo(pX + fs * 2.2, pY); cx.lineTo(pX + fs * 2.2, pY + pageH); cx.stroke()
      cx.font = `italic 500 ${fs}px Archivo, Arial, sans-serif`
      cx.textBaseline = 'middle'
      const breaking = ss(0.05, 0.12, p)
      copy.notebook.forEach((line, i) => {
        const y = pY + lh * (i + 2)
        const isEntry = i === copy.entry
        const jitter = Math.sin(i * 7.3) * 0.6
        cx.fillStyle = isEntry ? `rgba(255,255,255,${1 - breaking})` : `rgba(255,255,255,${0.75 - 0.65 * ss(0.02, 0.1, p)})`
        cx.fillText(line, pX + fs * 2.8, y + jitter)
        if (isEntry) {
          cx.strokeStyle = `rgba(200,255,46,${0.9 * (1 - breaking)})`
          cx.lineWidth = 1.5
          cx.beginPath(); cx.moveTo(pX + fs * 2.8, y + fs * 0.7); cx.lineTo(pX + fs * 2.8 + cx.measureText(line).width, y + fs * 0.7); cx.stroke()
        }
      })
      cx.font = '700 10px Archivo, Arial, sans-serif'
      cx.fillStyle = 'rgba(255,255,255,0.6)'
      cx.fillText('COLLECTION LEDGER · P. 14', pX + fs * 2.8, pY + lh * 0.9)
      cx.restore()
    }

    /* --- city map (Where it is) --- */
    const where = ss(0.28, 0.36, p)
    if (where > 0.01) {
      cx.save()
      cx.globalAlpha = where
      cx.strokeStyle = 'rgba(255,255,255,0.16)'
      cx.lineWidth = 0.75
      cx.beginPath()
      for (const [a, b] of streets) { const A2 = projFixed(a), B2 = projFixed(b); cx.moveTo(A2.x, A2.y); cx.lineTo(B2.x, B2.y) }
      cx.stroke()
      const park: V3[] = [[-1.3, -1, -1.2], [1.2, -1, -1.2], [1.2, -1, 1.1], [-1.3, -1, 1.1]]
      cx.strokeStyle = 'rgba(255,255,255,0.45)'
      cx.setLineDash([3, 4])
      cx.beginPath(); park.map((v) => projFixed(v)).forEach((q, i) => (i ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y))); cx.closePath(); cx.stroke()
      cx.setLineDash([])
      const pin: V3[] = [[-0.55, -1, -0.55], [0.55, -1, -0.55], [0.55, -1, 0.55], [-0.55, -1, 0.55]]
      cx.strokeStyle = RING_COLORS[1]
      cx.lineWidth = 1.5
      cx.beginPath(); pin.map((v) => projFixed(v)).forEach((q, i) => (i ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y))); cx.closePath(); cx.stroke()
      cx.font = '700 10px Archivo, Arial, sans-serif'
      cx.fillStyle = 'rgba(255,255,255,0.7)'
      const lab = projFixed([1.2, -1, 1.1])
      const lw = cx.measureText(copy.mapLabel).width
      cx.fillText(copy.mapLabel, Math.min(W - lw - 12, Math.max(12, lab.x - lw)), lab.y + 16)
      cx.restore()
    }

    /* --- record orbits --- */
    const rings = [0, 1, 2, 3, 4].map((k) => {
      const on = ss(KURA_BOUNDS[k] + 0.02, KURA_BOUNDS[k] + 0.1, p) * (k === 0 ? ss(0.16, 0.26, p) : 1)
      const rr = 1.12 + k * 0.17
      const ty = 0.15 * (k - 2) + 0.1
      const q: { x: number; y: number; z: number }[] = []
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2
        q.push(projFixed([Math.cos(a) * rr, ty + Math.sin(a) * 0.12 * (k % 2 ? 1 : -1), Math.sin(a) * rr], wx))
      }
      return { k, on, rr, ty, q }
    })
    const ringPass = (front: boolean) => {
      for (const r of rings) {
        if (r.on < 0.01) continue
        cx.beginPath()
        let pen = false
        for (const q of r.q) {
          if ((q.z >= 0) === front) { if (pen) cx.lineTo(q.x, q.y); else cx.moveTo(q.x, q.y); pen = true } else pen = false
        }
        const active = cur === r.k
        cx.globalAlpha = r.on
        cx.strokeStyle = active ? RING_COLORS[r.k] : 'rgba(255,255,255,0.28)'
        cx.lineWidth = active ? 1.6 : 1
        cx.setLineDash(active ? [2, 5] : [])
        cx.lineDashOffset = -t * 24
        cx.stroke()
        cx.setLineDash([])
        cx.globalAlpha = 1
      }
    }
    ringPass(false)

    /* --- points: from the ledger entry and the field into the work --- */
    const ptA = 1 - solid * 0.88
    cx.fillStyle = '#f4f3f0'
    const tx0 = pX + fs * 2.8
    const tScale = fs / 20
    pts.forEach((o, i) => {
      const k = ss(o.d, o.d + 0.6, gather)
      const tgt = proj(o.t)
      let x: number, y: number, a: number
      if (i < textPts.length) {
        const [ox, oy] = textPts[i]
        const sx = tx0 + ox * tScale
        const sy = entryY + oy * tScale
        x = lerp(sx, tgt.x, k)
        y = lerp(sy, tgt.y, k)
        a = ss(0.06, 0.1, p)
      } else {
        const q = proj([lerp(o.s[0], o.t[0], k), lerp(o.s[1], o.t[1], k), lerp(o.s[2], o.t[2], k)])
        x = q.x
        y = q.y
        a = ss(0.1, 0.2, p)
      }
      const depth = (tgt.z + 1.5) / 3
      const sz = 0.8 + 1.4 * depth
      cx.globalAlpha = ptA * a * (0.3 + 0.7 * depth)
      cx.fillRect(x - sz / 2, y - sz / 2, sz, sz)
    })
    cx.globalAlpha = 1

    /* --- solid work and plinth --- */
    if (solid > 0.01) {
      type Q = { q: { x: number; y: number; z: number }[]; z: number; l: number }
      const quads: Q[] = []
      for (let i = 0; i < LAT; i++) {
        for (let j = 0; j < LON; j++) {
          const u0 = i / LAT, u1 = (i + 1) / LAT, v0 = j / LON, v1 = (j + 1) / LON
          const q = [proj(surf(u0, v0)), proj(surf(u0, v1)), proj(surf(u1, v1)), proj(surf(u1, v0))]
          const ym = Y0 + (Y1 - Y0) * ((u0 + u1) / 2)
          const ang = (v0 + v1) * Math.PI + ym * 0.6
          const n = rotN([Math.cos(ang), 0.15, Math.sin(ang)])
          quads.push({ q, z: (q[0].z + q[1].z + q[2].z + q[3].z) / 4, l: Math.max(0, -n[0] * 0.5 + n[1] * 0.5 + n[2] * 0.7) })
        }
      }
      for (const f of plinthFaces) {
        const q = f.v.map((v) => proj(v))
        const n = rotN(f.n)
        quads.push({ q, z: q.reduce((s, v) => s + v.z, 0) / 4 - 0.05, l: Math.max(0, -n[0] * 0.5 + n[1] * 0.5 + n[2] * 0.7) * 0.7 })
      }
      quads.sort((a, b) => a.z - b.z)
      for (const f of quads) {
        const l = Math.round(64 + 150 * f.l)
        cx.fillStyle = `rgba(${l},${Math.round(l * 0.97)},${Math.round(l * 0.9)},${solid})`
        cx.beginPath(); f.q.forEach((v, i) => (i ? cx.lineTo(v.x, v.y) : cx.moveTo(v.x, v.y))); cx.closePath(); cx.fill()
      }
    }

    /* --- wireframe --- */
    if (wire > 0.01) {
      cx.lineWidth = 0.75
      cx.strokeStyle = `rgba(255,255,255,${0.55 * wire * (1 - solid * 0.75)})`
      cx.beginPath()
      for (let j = 0; j < LON; j += 3) {
        for (let i = 0; i <= LAT * wire; i++) { const q = proj(surf(i / LAT, j / LON)); if (i) cx.lineTo(q.x, q.y); else cx.moveTo(q.x, q.y) }
      }
      for (let i = 0; i <= LAT; i += 3) {
        if (i / LAT > wire) break
        for (let j = 0; j <= LON; j++) { const q = proj(surf(i / LAT, j / LON)); if (j) cx.lineTo(q.x, q.y); else cx.moveTo(q.x, q.y) }
      }
      cx.stroke()
      cx.beginPath()
      for (const f of plinthFaces) { const q = f.v.map((v) => proj(v)); q.forEach((v, i) => (i ? cx.lineTo(v.x, v.y) : cx.moveTo(v.x, v.y))); cx.closePath() }
      cx.stroke()
    }

    /* --- condition pass --- */
    const cond = ss(0.46, 0.5, p) * (1 - ss(0.62, 0.66, p))
    if (cond > 0.01) {
      const sy = Y0 + (Y1 - Y0) * ((t * 0.35) % 1)
      const r = R(sy) + 0.06
      cx.globalAlpha = cond
      cx.strokeStyle = RING_COLORS[2]
      cx.lineWidth = 1.5
      cx.beginPath()
      for (let j = 0; j <= 48; j++) { const a = (j / 48) * Math.PI * 2; const q = proj([Math.cos(a) * r, sy, Math.sin(a) * r]); if (j) cx.lineTo(q.x, q.y); else cx.moveTo(q.x, q.y) }
      cx.stroke()
      const corners: V3[] = [[PL, -0.72, PL], [-PL, -0.72, PL], [PL, -0.72, -PL], [-PL, -0.72, -PL]]
      const m = corners.map((v) => proj(v)).sort((a, b) => b.z - a.z)[0]
      cx.fillStyle = RING_COLORS[2]
      cx.beginPath(); cx.arc(m.x, m.y, 4, 0, Math.PI * 2); cx.fill()
      cx.lineWidth = 0.75
      cx.beginPath(); cx.moveTo(m.x, m.y); cx.lineTo(m.x + 60, m.y + 30); cx.stroke()
      cx.font = '700 10px Archivo, Arial, sans-serif'
      cx.fillStyle = '#fff'
      cx.fillText(copy.conditionMark, Math.min(W - 140, m.x + 64), m.y + 34)
      cx.globalAlpha = 1
    }

    ringPass(true)

    /* --- provenance nodes --- */
    const prov = rings[3]
    if (prov.on > 0.01) {
      cx.font = '700 10px Archivo, Arial, sans-serif'
      copy.provenance.forEach((e, n) => {
        const a = n * (Math.PI / 2) + 0.4 + t * 0.06
        const q = projFixed([Math.cos(a) * prov.rr, prov.ty + Math.sin(a) * 0.12, Math.sin(a) * prov.rr], wx)
        cx.globalAlpha = prov.on * (q.z >= 0 ? 1 : 0.5)
        cx.fillStyle = RING_COLORS[3]
        cx.beginPath(); cx.arc(q.x, q.y, 3.5, 0, Math.PI * 2); cx.fill()
        cx.fillStyle = '#fff'
        cx.fillText(`${e.year} ${e.label}`.toUpperCase(), q.x + 7, q.y + 3)
      })
      cx.globalAlpha = 1
    }

    /* --- markers; the active orbit carries its record tag --- */
    for (const r of rings) {
      if (r.on < 0.01) continue
      const a = t * (0.45 - r.k * 0.05) * (r.k % 2 ? -1 : 1) + r.k * 1.3
      const q = projFixed([Math.cos(a) * r.rr, r.ty + Math.sin(a) * 0.12 * (r.k % 2 ? 1 : -1), Math.sin(a) * r.rr], wx)
      cx.globalAlpha = r.on
      if (cur === r.k) {
        cx.strokeStyle = RING_COLORS[r.k]
        cx.lineWidth = 3
        cx.beginPath(); cx.moveTo(q.x - 7, q.y); cx.lineTo(q.x + 7, q.y); cx.moveTo(q.x, q.y - 7); cx.lineTo(q.x, q.y + 7); cx.stroke()
        const text = `0${r.k + 1}  ${(copy.tags[r.k] ?? '').toUpperCase()}`
        cx.font = '700 11px Archivo, Arial, sans-serif'
        const tw = cx.measureText(text).width + 16
        let tx = q.x + 12
        let ty = q.y - 24
        if (tx + tw > W - 8) tx = q.x - tw - 12
        if (tx < 8) tx = 8
        if (ty < 8) ty = q.y + 12
        cx.fillStyle = RING_COLORS[r.k]
        cx.fillRect(tx, ty, tw, 20)
        cx.fillStyle = '#0a0a0a'
        cx.textBaseline = 'middle'
        cx.fillText(text, tx + 8, ty + 10.5)
      } else {
        cx.fillStyle = '#fff'
        cx.fillRect(q.x - 2, q.y - 2, 4, 4)
      }
      cx.globalAlpha = 1
    }
  })

  return <canvas ref={canvasRef} role="img" aria-label={label} className={`block h-full w-full ${className}`} />
}
