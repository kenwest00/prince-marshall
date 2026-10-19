import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { clients } from '../data/content'
import { reducedMotion, scrollToTarget } from '../lib/motion'
import { SIGNAL } from '../lib/palette'
import { clamp01, lerp, seeded, ss, useCanvasLoop, useMediaQuery, useScrollProgress } from '../lib/scene'

/**
 * Client index. A pinned scroll scene: each client's name is built from small
 * p+m tiles, holds, then breaks apart and re-forms as the next client. A HUD
 * readout decodes the index number and sector; the pointer scatters tiles
 * nearby. The real list is always in the DOM for assistive tech and crawlers;
 * reduced motion gets a static list.
 */

const names = clients.items.map((c) => c.name)
const N = names.length
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+·/'

/** Decodes to the new text whenever it changes. Writes the DOM directly. */
function Scramble({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion) {
      el.textContent = text
      return
    }
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 450)
      const keep = Math.floor(k * text.length)
      let out = text.slice(0, keep)
      for (let i = keep; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      el.textContent = out
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [text])
  return (
    <span ref={ref} className={className} aria-hidden="true">
      {text}
    </span>
  )
}

interface Targets {
  w: number
  h: number
  pts: [number, number][][]
  size: number
}

/** Sample each name as filled text into tile positions that fit the canvas. */
function sample(w: number, h: number): Targets {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d', { willReadFrequently: true })
  if (!x) return { w, h, pts: names.map(() => []), size: 3 }
  const base = Math.min(h * 0.34, w * 0.2)
  const step = Math.max(6, Math.round(Math.min(w, h * 1.6) / 95))
  const pts = names.map((name) => {
    x.clearRect(0, 0, w, h)
    x.fillStyle = '#000'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    let fs = base
    x.font = `800 ${fs}px Archivo, 'Helvetica Neue', Arial, sans-serif`
    let lines = [name]
    const fit = (ls: string[]) => Math.max(...ls.map((l) => x.measureText(l).width))
    if (fit(lines) > w * 0.88) {
      const words = name.split(' ')
      if (words.length > 1) {
        const mid = Math.ceil(words.length / 2)
        lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
      }
      const wid = fit(lines)
      if (wid > w * 0.88) fs = (fs * w * 0.88) / wid
      fs = Math.min(fs, (h * 0.8) / (lines.length * 1.0))
      x.font = `800 ${fs}px Archivo, 'Helvetica Neue', Arial, sans-serif`
    }
    lines.forEach((l, i) => x.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * fs * 0.95))
    const d = x.getImageData(0, 0, w, h).data
    const out: [number, number][] = []
    for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) if (d[(yy * w + xx) * 4 + 3] > 128) out.push([xx, yy])
    // shuffle so each name's tiles come from everywhere in the last one
    const rng = seeded(name.length * 97 + 7)
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  })
  return { w, h, pts, size: step * 0.78 }
}

function Field({ target, onIndex, label }: { target: MutableRefObject<number>; onIndex: (i: number) => void; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tg = useRef<Targets | null>(null)
  const fontsReady = useRef(false)
  const P = useRef(-1)
  const idx = useRef(-1)
  const ptr = useRef({ x: -9999, y: -9999 })
  const cb = useRef(onIndex)
  useEffect(() => {
    cb.current = onIndex
  })
  useEffect(() => {
    document.fonts?.ready.then(() => {
      fontsReady.current = true
      tg.current = null
    })
    const el = canvasRef.current?.parentElement
    if (!el) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const leave = () => (ptr.current = { x: -9999, y: -9999 })
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  // per-tile scatter direction and colour, fixed
  const seedsRef = useRef<{ a: number; r: number; d: number; sig: boolean }[]>([])

  useCanvasLoop(canvasRef, ({ ctx, w, h, t }) => {
    if (!tg.current || tg.current.w !== w || tg.current.h !== h) {
      tg.current = sample(w, h)
      const max = Math.max(...tg.current.pts.map((p) => p.length), 1)
      const rng = seeded(4242)
      seedsRef.current = Array.from({ length: max }, () => ({ a: rng.range(0, Math.PI * 2), r: rng.range(0.25, 0.7), d: rng.range(0, 0.25), sig: rng.next() < 0.06 }))
    }
    const T = tg.current
    const seeds = seedsRef.current
    if (P.current < 0) P.current = target.current
    P.current += (target.current - P.current) * 0.14
    const f = clamp01(P.current) * (N - 1)
    const k = Math.min(N - 2, Math.floor(f))
    const local = f - k
    const nearest = Math.round(f)
    if (nearest !== idx.current) {
      idx.current = nearest
      cb.current(nearest)
    }

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, w, h)

    const A = T.pts[k]
    const B = T.pts[k + 1]
    const R = Math.min(w, h) * 0.16
    const px = ptr.current.x
    const py = ptr.current.y
    const sz = T.size
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      // hold, then a staggered break-and-reform in the middle of each segment
      const e = ss(0.3 + s.d, 0.55 + s.d, local)
      const a = A.length ? A[i % A.length] : [w / 2, h / 2]
      const b = B.length ? B[i % B.length] : [w / 2, h / 2]
      const burst = Math.sin(Math.PI * e)
      let x = lerp(a[0], b[0], e) + Math.cos(s.a + t * 0.2) * s.r * w * 0.5 * burst
      let y = lerp(a[1], b[1], e) + Math.sin(s.a + t * 0.2) * s.r * h * 0.6 * burst
      // idle shimmer
      x += Math.sin(t * 1.3 + i) * 0.6
      y += Math.cos(t * 1.1 + i * 0.7) * 0.6
      // pointer scatter
      const dx = x - px
      const dy = y - py
      const d2 = dx * dx + dy * dy
      if (d2 < R * R && d2 > 0.01) {
        const dd = Math.sqrt(d2)
        const push = ((R - dd) / R) ** 2 * R * 0.55
        x += (dx / dd) * push
        y += (dy / dd) * push
      }
      // duplicates (when this name has fewer tiles) fade out while the name holds
      const dupA = i >= A.length ? 1 : 0
      const dupB = i >= B.length ? 1 : 0
      const alpha = 1 - lerp(dupA, dupB, e) * (1 - burst * 0.6)
      if (alpha < 0.02) continue
      ctx.globalAlpha = alpha * (0.55 + 0.45 * (1 - burst))
      ctx.fillStyle = s.sig ? SIGNAL : '#ffffff'
      const z = sz * (1 - burst * 0.45)
      ctx.fillRect(x - z / 2, y - z / 2, z, z)
    }
    ctx.globalAlpha = 1
  })

  return <canvas ref={canvasRef} role="img" aria-label={label} className="block h-full w-full" />
}

export default function Clients() {
  const ref = useRef<HTMLDivElement>(null)
  const target = useRef(0)
  const [active, setActive] = useState(0)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const top = isDesktop ? 0 : 73
  useScrollProgress(ref, !reducedMotion, (v) => {
    target.current = v
  })

  const jump = (i: number) => {
    const el = ref.current
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY
    scrollToTarget(y + (i / (N - 1)) * (el.offsetHeight - window.innerHeight))
  }

  const head = (
    <div className="grid grid-cols-1 gap-4 px-5 pb-10 pt-16 md:grid-cols-[200px_1fr] md:gap-16 md:px-10 md:pb-14 md:pt-24">
      <p className="type-label text-white/70">{clients.eyebrow}</p>
      <h2 id="clients-heading" className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
        {clients.heading}
      </h2>
    </div>
  )

  if (reducedMotion) {
    return (
      <section id={clients.id} aria-labelledby="clients-heading" className="hairline-t bg-[#0a0a0a] pb-16 text-white md:pb-24">
        {head}
        <ul className="flex flex-wrap gap-x-10 gap-y-4 px-5 md:px-10">
          {names.map((n) => (
            <li key={n} className="font-display text-4xl tracking-[-0.03em]">
              {n}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const c = clients.items[active]
  return (
    <section id={clients.id} aria-labelledby="clients-heading" className="hairline-t bg-[#0a0a0a] text-white">
      {head}
      <ul className="sr-only">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <div ref={ref} className="relative" style={{ height: `${N * 38 + 70}vh` }}>
        <div className="sticky flex flex-col overflow-hidden" style={{ top, height: `calc(100svh - ${top}px)` }}>
          {/* HUD */}
          <div className="flex items-start justify-between gap-4 border-t border-white/30 px-5 pt-4 md:justify-start md:gap-16 md:px-10 md:pt-6" aria-hidden="true">
            <div className="type-label grid gap-1">
              <span className="text-white/60">Index</span>
              <span className="tabular-nums">
                <span style={{ color: SIGNAL }}>{String(active + 1).padStart(2, '0')}</span> / {String(N).padStart(2, '0')}
              </span>
            </div>
            <div className="type-label grid gap-1 text-right md:text-left">
              <span className="text-white/60">Sector</span>
              <Scramble text={(c.sector ?? '').toUpperCase()} />
            </div>
          </div>
          <div className="relative min-h-0 flex-1">
            <Field target={target} onIndex={setActive} label={`Client names forming from tiles: ${names.join(', ')}`} />
            {/* progress rail */}
            <div className="pointer-events-none absolute inset-y-6 right-5 w-px bg-white/20 md:right-10" aria-hidden="true">
              <div className="absolute left-[-2px] h-6 w-[5px] transition-[top] duration-300" style={{ top: `calc(${(active / (N - 1)) * 100}% - 12px)`, background: SIGNAL }} />
            </div>
          </div>
          {/* index list */}
          <nav aria-label="Client index" className="border-t border-white/30 px-5 py-3 md:px-10 md:py-4">
            <ol className="flex flex-wrap gap-x-5 gap-y-1 md:gap-x-8">
              {names.map((n, i) => (
                <li key={n}>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    aria-current={i === active ? 'true' : undefined}
                    className={`type-label inline-flex min-h-[32px] items-center gap-1.5 transition-colors duration-300 ${i === active ? 'text-white' : 'text-white/40 hover:text-white/80'}`}
                  >
                    <span className="tabular-nums" style={{ color: i === active ? SIGNAL : undefined }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {n}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  )
}
