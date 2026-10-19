import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import paintingUrl from '../assets/mona-lisa-128.png'
import { camera, lerp, seeded, ss, useCanvasLoop, type V3 } from '../lib/scene'
import { reducedMotion } from '../lib/motion'
import { RING_COLORS } from '../lib/palette'

/**
 * KURA: from notebook to record. A handwritten ledger entry breaks into
 * particles that assemble, in the painting's own colours, into a 3D Mona Lisa
 * (Leonardo da Vinci, public domain); then each part of its record arrives as
 * its own orbit: what you hold, where it is (floor plan), condition (surface
 * scan), provenance (dated nodes) and worth. Example data only, labelled as such.
 */

export interface KuraSceneCopy {
  notebook: string[]
  /** index of the entry that becomes the record */
  entry: number
  problems: { line: number; word: string; text: string }[]
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

/** stage 0 = before KURA (the ledger); stages 1-5 = the five parts of the record */
const KURA_BOUNDS = [0, 0.14, 0.3, 0.47, 0.64, 0.82, 1.0001]
const RED = '#ff5a4e'

/* the painting: 53 × 77 cm panel, normalised so its height spans y -1..1 */
const PW = 0.69
const PH = 1
const GY = -1.3 // floor
const rooms: [V3, V3][] = [
  [[-2.4, GY, -2], [2.4, GY, -2]], [[2.4, GY, -2], [2.4, GY, 2]], [[2.4, GY, 2], [-2.4, GY, 2]], [[-2.4, GY, 2], [-2.4, GY, -2]],
  [[-1, GY, -2], [-1, GY, 0.7]], [[1, GY, -2], [1, GY, 0.7]], [[-2.4, GY, 0.7], [-1.6, GY, 0.7]], [[-0.3, GY, 0.7], [2.4, GY, 0.7]],
]
interface Particle { t: V3; s: V3; d: number; c: string[] }

export default function KuraRecordScene({ target, copy, onStage, label, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isPhone = typeof window !== 'undefined' && window.innerWidth < 700
  const cols = isPhone ? 40 : 64
  const rows = Math.round(cols * (77 / 53))
  const partsRef = useRef<Particle[] | null>(null)

  useEffect(() => {
    let alive = true
    const img = new Image()
    img.onload = () => {
      if (!alive) return
      const c = document.createElement('canvas')
      c.width = cols
      c.height = rows
      const x = c.getContext('2d', { willReadFrequently: true })
      if (!x) return
      x.drawImage(img, 0, 0, cols, rows)
      const d = x.getImageData(0, 0, cols, rows).data
      const rng = seeded(214)
      const list: Particle[] = []
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const o = (j * cols + i) * 4
          const r = d[o], g = d[o + 1], b = d[o + 2]
          const lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255
          const ang = rng.range(0, Math.PI * 2)
          const rr = rng.range(1.1, 2.9)
          // four colour stops from washed-out (scattered) to true colour (assembled)
          const c = [0, 1, 2, 3].map((k) => {
            const m = 0.5 * (1 - k / 3)
            return `rgb(${Math.round(r + (235 - r) * m)},${Math.round(g + (232 - g) * m)},${Math.round(b + (225 - b) * m)})`
          })
          list.push({
            t: [-PW + ((i + 0.5) / cols) * 2 * PW, PH - ((j + 0.5) / rows) * 2 * PH, (lum - 0.5) * 0.1],
            s: [Math.cos(ang) * rr * 1.35, rng.range(-1.4, 1.4), Math.sin(ang) * rr * 0.9],
            d: rng.range(0, 0.32),
            c,
          })
        }
      }
      // shuffle so the ledger's particles land all over the painting
      for (let k = list.length - 1; k > 0; k--) {
        const m = Math.floor(rng.next() * (k + 1))
        ;[list[k], list[m]] = [list[m], list[k]]
      }
      partsRef.current = list
    }
    img.src = paintingUrl
    return () => {
      alive = false
    }
  }, [cols, rows])

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
    const cur = stage - 1

    cx.fillStyle = '#0a0a0a'
    cx.fillRect(0, 0, W, H)

    const book = 1 - ss(0.12, 0.24, p)
    const gather = ss(0.13, 0.28, p)
    const wire = ss(0.18, 0.32, p)
    const solid = ss(0.47, 0.6, p)
    const marks = book * (1 - ss(0.095, 0.125, p))
    const S = Math.min(W, H) * (isPhone ? 0.33 : 0.36)
    const cX = W / 2
    const cY = H / 2 - S * 0.02
    const yaw = -0.5 + p * 0.8 + Math.sin(t * 0.3) * 0.07 + px * 0.5
    const pitch = 0.14 + py * 0.2
    const wx = Math.min(1.9, Math.max(1, (W / H) * 0.75))
    const { proj, projFixed } = camera(yaw, pitch, cX, cY, S)

    /* --- the notebook page --- */
    const pageW = Math.min(W * 0.8, 560)
    const fs = Math.min(19, pageW / 30)
    const lh = fs * 1.9
    const pageH = lh * 8.2
    const roomRight = W - pageW > 480
    const pX = roomRight ? Math.max(24, (W - pageW) / 2 - 150) : (W - pageW) / 2
    const pY = roomRight ? Math.max(90, H * 0.4 - pageH / 2) : (H - pageH) / 2
    const entryY = pY + lh * (copy.entry + 2)
    if (book > 0.01) {
      cx.save()
      cx.globalAlpha = book
      cx.strokeStyle = 'rgba(255,255,255,0.22)'
      cx.lineWidth = 0.75
      cx.strokeRect(pX, pY, pageW, pageH)
      cx.beginPath()
      for (let i = 1; i < 8; i++) { cx.moveTo(pX, pY + i * lh + lh * 0.5); cx.lineTo(pX + pageW, pY + i * lh + lh * 0.5) }
      cx.stroke()
      cx.strokeStyle = 'rgba(255,255,255,0.3)'
      cx.beginPath(); cx.moveTo(pX + fs * 2.2, pY); cx.lineTo(pX + fs * 2.2, pY + pageH); cx.stroke()
      cx.font = `italic 500 ${fs}px Archivo, Arial, sans-serif`
      cx.textBaseline = 'middle'
      const breaking = ss(0.11, 0.17, p)
      copy.notebook.forEach((line, i) => {
        const y = pY + lh * (i + 2)
        const isEntry = i === copy.entry
        const jitter = Math.sin(i * 7.3) * 0.6
        cx.fillStyle = isEntry ? `rgba(255,255,255,${1 - breaking})` : `rgba(255,255,255,${0.75 - 0.65 * ss(0.1, 0.15, p)})`
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

    /* --- red-pen marks: what the ledger cannot tell you --- */
    if (marks > 0.01) {
      cx.save()
      cx.globalAlpha = marks
      cx.textBaseline = 'middle'
      const tagFont = '700 11px Archivo, Arial, sans-serif'
      copy.problems.forEach((pr, n) => {
        let cxm: number, cym: number, rw: number, rh: number, ly: number
        if (pr.line < 0) {
          cxm = pX + pageW / 2; cym = pY + pageH / 2; rw = pageW / 2 + 8; rh = pageH / 2 + 8; ly = pY + lh * 0.9
        } else {
          cx.font = `italic 500 ${fs}px Archivo, Arial, sans-serif`
          const line = copy.notebook[pr.line] ?? ''
          const at = Math.max(0, line.lastIndexOf(pr.word))
          const x0 = pX + fs * 2.8 + cx.measureText(line.slice(0, at)).width
          const ww = cx.measureText(pr.word).width
          cxm = x0 + ww / 2; cym = pY + lh * (pr.line + 2); rw = ww / 2 + fs * 0.5; rh = fs * 0.75; ly = cym
        }
        // hand-drawn loop: two slightly offset strokes
        cx.strokeStyle = RED
        cx.lineWidth = 1.5
        for (let k = 0; k < 2; k++) {
          cx.beginPath()
          if (pr.line < 0) cx.rect(cxm - rw + k * 2, cym - rh - k, rw * 2 - k * 3, rh * 2 + k * 2)
          else cx.ellipse(cxm + k * 1.5, cym + k, rw + k * 2, rh - k, -0.04 + k * 0.05, 0, Math.PI * 2)
          cx.stroke()
        }
        if (roomRight) {
          cx.font = tagFont
          const label = pr.text.toUpperCase()
          const tw = cx.measureText(label).width + 14
          const tx = pX + pageW + 22
          const ty = pr.line < 0 ? pY - 10 : ly - 10
          cx.beginPath(); cx.moveTo(pr.line < 0 ? pX + pageW + 8 : cxm + rw, pr.line < 0 ? pY + 2 : cym); cx.lineTo(tx, ty + 10); cx.stroke()
          cx.fillStyle = RED
          cx.fillRect(tx, ty, tw, 20)
          cx.fillStyle = '#0a0a0a'
          cx.fillText(label, tx + 7, ty + 10.5)
        } else {
          // narrow screens: numbered badge; the list itself is HTML under the scene
          const bx = pr.line < 0 ? pX + pageW : cxm + rw
          const by = pr.line < 0 ? pY : cym - rh
          cx.fillStyle = RED
          cx.beginPath(); cx.arc(bx, by, 8, 0, Math.PI * 2); cx.fill()
          cx.fillStyle = '#0a0a0a'
          cx.font = '800 10px Archivo, Arial, sans-serif'
          cx.textAlign = 'center'
          cx.fillText(String(n + 1), bx, by + 0.5)
          cx.textAlign = 'start'
        }
      })
      cx.restore()
    }

    /* --- gallery floor plan (Where it is) --- */
    const where = ss(0.3, 0.38, p)
    if (where > 0.01) {
      cx.save()
      cx.globalAlpha = where
      cx.strokeStyle = 'rgba(255,255,255,0.22)'
      cx.lineWidth = 0.75
      cx.beginPath()
      for (const [a, b] of rooms) { const A2 = projFixed(a), B2 = projFixed(b); cx.moveTo(A2.x, A2.y); cx.lineTo(B2.x, B2.y) }
      cx.stroke()
      const pin: V3[] = [[-PW, GY, -0.12], [PW, GY, -0.12], [PW, GY, 0.12], [-PW, GY, 0.12]]
      cx.strokeStyle = RING_COLORS[1]
      cx.lineWidth = 1.5
      cx.beginPath(); pin.map((v) => projFixed(v)).forEach((q, i) => (i ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y))); cx.closePath(); cx.stroke()
      cx.font = '700 10px Archivo, Arial, sans-serif'
      cx.fillStyle = 'rgba(255,255,255,0.7)'
      const lab = projFixed([2.4, GY, 2])
      const lw = cx.measureText(copy.mapLabel).width
      cx.fillText(copy.mapLabel, Math.min(W - lw - 12, Math.max(12, lab.x - lw)), Math.min(H - 10, lab.y + 16))
      cx.restore()
    }

    /* --- record orbits --- */
    const rings = [0, 1, 2, 3, 4].map((k) => {
      const on = ss(KURA_BOUNDS[k + 1] + 0.02, KURA_BOUNDS[k + 1] + 0.1, p) * (k === 0 ? ss(0.2, 0.28, p) : 1)
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

    /* --- wireframe: panel edges, registration grid, real dimensions --- */
    const corners: V3[] = [[-PW, PH, 0], [PW, PH, 0], [PW, -PH, 0], [-PW, -PH, 0]]
    const back: V3[] = corners.map((v) => [v[0], v[1], -0.06])
    if (wire > 0.01) {
      const a = 0.6 * wire * (1 - solid * 0.6)
      cx.lineWidth = 1
      cx.strokeStyle = `rgba(255,255,255,${a})`
      const edges: [V3, V3][] = [0, 1, 2, 3].flatMap((i) => [[corners[i], corners[(i + 1) % 4]], [back[i], back[(i + 1) % 4]], [corners[i], back[i]]] as [V3, V3][])
      cx.beginPath()
      edges.forEach(([A, B], i) => {
        const k = Math.min(1, Math.max(0, wire * 1.6 - i * 0.04))
        if (k <= 0) return
        const A2 = proj(A), B2 = proj(B)
        cx.moveTo(A2.x, A2.y); cx.lineTo(lerp(A2.x, B2.x, k), lerp(A2.y, B2.y, k))
      })
      cx.stroke()
      // registration grid
      cx.lineWidth = 0.75
      cx.strokeStyle = `rgba(255,255,255,${a * 0.45 * (1 - solid)})`
      cx.beginPath()
      for (let i = 1; i < 3; i++) { const x = -PW + (i / 3) * 2 * PW; const A2 = proj([x, PH, 0.01]), B2 = proj([x, -PH, 0.01]); cx.moveTo(A2.x, A2.y); cx.lineTo(B2.x, B2.y) }
      for (let j = 1; j < 4; j++) { const y = PH - (j / 4) * 2 * PH; const A2 = proj([-PW, y, 0.01]), B2 = proj([PW, y, 0.01]); cx.moveTo(A2.x, A2.y); cx.lineTo(B2.x, B2.y) }
      cx.stroke()
      // dimensions: 53 cm × 77 cm
      const dimA = ss(0.2, 0.3, p) * (1 - ss(0.44, 0.5, p))
      if (dimA > 0.01) {
        const dim = (A: V3, B: V3, text: string) => {
          const A2 = proj(A), B2 = proj(B)
          cx.strokeStyle = `rgba(255,255,255,${dimA * 0.8})`
          cx.lineWidth = 0.75
          cx.beginPath(); cx.moveTo(A2.x, A2.y); cx.lineTo(B2.x, B2.y); cx.stroke()
          cx.font = '700 11px Archivo, Arial, sans-serif'
          const tw = cx.measureText(text).width + 10
          const mx = (A2.x + B2.x) / 2, my = (A2.y + B2.y) / 2
          cx.fillStyle = `rgba(10,10,10,${dimA})`; cx.fillRect(mx - tw / 2, my - 9, tw, 18)
          cx.fillStyle = `rgba(255,255,255,${dimA})`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(text, mx, my + 0.5); cx.textAlign = 'start'
        }
        dim([-PW, -PH - 0.16, 0], [PW, -PH - 0.16, 0], '53 CM')
        dim([PW + 0.16, -PH, 0], [PW + 0.16, PH, 0], '77 CM')
      }
    }

    /* --- particles: from the ledger entry and the field into the painting --- */
    const parts = partsRef.current
    if (parts) {
      const tx0 = pX + fs * 2.8
      const tScale = fs / 20
      const cell = (S * (2 * PW)) / cols
      for (let i = 0; i < parts.length; i++) {
        const o = parts[i]
        const k = ss(o.d, o.d + 0.6, gather)
        let x: number, y: number, a: number
        if (i < textPts.length) {
          const tgt = proj(o.t)
          const [ox, oy] = textPts[i]
          x = lerp(tx0 + ox * tScale, tgt.x, k)
          y = lerp(entryY + oy * tScale, tgt.y, k)
          a = ss(0.11, 0.15, p)
        } else {
          const q = proj([lerp(o.s[0], o.t[0], k), lerp(o.s[1], o.t[1], k), lerp(o.s[2], o.t[2], k)])
          x = q.x
          y = q.y
          a = ss(0.13, 0.24, p) * (0.35 + 0.65 * k)
        }
        if (a < 0.01) continue
        const sz = lerp(isPhone ? 1.8 : 2.2, cell * 1.3, Math.max(solid, k * 0.6) * k)
        cx.globalAlpha = a
        cx.fillStyle = o.c[Math.min(3, Math.round(k * (1.5 + solid * 1.5)))]
        cx.fillRect(x - sz / 2, y - sz / 2, sz, sz)
      }
      cx.globalAlpha = 1
    }

    /* --- frame, once it is solid --- */
    if (solid > 0.01) {
      const f = corners.map((v) => proj([v[0] * 1.06, v[1] * 1.04, 0.02]))
      cx.strokeStyle = `rgba(255,255,255,${0.5 * solid})`
      cx.lineWidth = 1.5
      cx.beginPath(); f.forEach((q, i) => (i ? cx.lineTo(q.x, q.y) : cx.moveTo(q.x, q.y))); cx.closePath(); cx.stroke()
    }

    /* --- condition pass --- */
    const cond = ss(0.47, 0.51, p) * (1 - ss(0.62, 0.66, p))
    if (cond > 0.01) {
      const sy = PH - 2 * PH * ((t * 0.3) % 1)
      cx.globalAlpha = cond
      cx.strokeStyle = RING_COLORS[2]
      cx.lineWidth = 1.5
      const L1 = proj([-PW * 1.08, sy, 0.05]), L2 = proj([PW * 1.08, sy, 0.05])
      cx.beginPath(); cx.moveTo(L1.x, L1.y); cx.lineTo(L2.x, L2.y); cx.stroke()
      const m = proj([-PW * 0.62, PH * 0.78, 0.05])
      cx.fillStyle = RING_COLORS[2]
      cx.beginPath(); cx.arc(m.x, m.y, 4, 0, Math.PI * 2); cx.fill()
      cx.lineWidth = 0.75
      cx.beginPath(); cx.moveTo(m.x, m.y); cx.lineTo(m.x - 50, m.y - 30); cx.stroke()
      cx.font = '700 10px Archivo, Arial, sans-serif'
      cx.fillStyle = '#fff'
      const cw = cx.measureText(copy.conditionMark).width
      cx.fillText(copy.conditionMark, Math.max(10, m.x - 54 - cw), m.y - 34)
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
        const pt = `${e.year} ${e.label}`.toUpperCase()
        cx.fillText(pt, Math.min(W - cx.measureText(pt).width - 6, Math.max(6, q.x + 7)), q.y + 3)
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
        // phones: the record panel under the scene carries the full text
        const text = isPhone ? `0${r.k + 1}  ${['OBJECT', 'PLACE', 'STATE', 'ORIGIN', 'VALUE'][r.k]}` : `0${r.k + 1}  ${(copy.tags[r.k] ?? '').toUpperCase()}`
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
