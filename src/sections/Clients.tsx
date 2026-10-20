import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { clients } from '../data/content'
import { reducedMotion, scrollToTarget } from '../lib/motion'
import { SIGNAL } from '../lib/palette'
import { renderTile } from '../lib/clientIcons'
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
  /** icon size, top-left corner and tile step */
  z: number
  ox: number
  oy: number
  g: number
  /** x, y, lime (1) or white (0) */
  pts: [number, number, number][][]
  solids: HTMLCanvasElement[]
}

/** Render each pictogram once (crisp, for the solid state) and sample it into tiles. */
function build(w: number, h: number): Targets {
  const z = Math.round(Math.min(h * 0.54, w < 700 ? w * 0.6 : w * 0.5))
  const ox = (w - z) / 2
  const oy = Math.max(8, h * (w < 700 ? 0.45 : 0.4) - z / 2)
  const g = Math.max(5, z / 34)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const solids: HTMLCanvasElement[] = []
  const pts = clients.items.map((c, n) => {
    solids.push(renderTile(c, n, Math.round(z * dpr)))
    const probe = renderTile(c, n, z)
    const d = probe.getContext('2d')?.getImageData(0, 0, z, z).data
    const out: [number, number, number][] = []
    if (d)
      for (let y = g / 2; y < z; y += g)
        for (let x = g / 2; x < z; x += g) {
          const o = (Math.floor(y) * z + Math.floor(x)) * 4
          if (d[o + 3] > 110) out.push([ox + x, oy + y, d[o + 2] < 150 ? 1 : 0])
        }
    const rng = seeded(n * 131 + 17)
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  })
  return { w, h, z, ox, oy, g, pts, solids }
}

function Field({ target, onIndex, label }: { target: MutableRefObject<number>; onIndex: (i: number) => void; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tg = useRef<Targets | null>(null)
  const P = useRef(-1)
  const idx = useRef(-1)
  const cb = useRef(onIndex)
  useEffect(() => {
    cb.current = onIndex
  })
  useEffect(() => {
    document.fonts?.ready.then(() => {
      tg.current = null
    })
  }, [])
  // per-tile scatter direction, stagger and colour, fixed
  const seedsRef = useRef<{ a: number; r: number; d: number; sig: boolean }[]>([])

  useCanvasLoop(canvasRef, ({ ctx, w, h, t, px, py }) => {
    if (!tg.current || tg.current.w !== w || tg.current.h !== h) {
      tg.current = build(w, h)
      const max = Math.max(...tg.current.pts.map((p) => p.length), 1)
      const rng = seeded(4242)
      seedsRef.current = Array.from({ length: max }, () => ({ a: rng.range(0, Math.PI * 2), r: rng.range(0.2, 0.6), d: rng.range(0, 0.18), sig: rng.next() < 0.08 }))
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

    // gentle parallax with the pointer
    const sx = px * 26
    const sy = py * 18
    // solid at either end of each segment, tiles in between
    const solidA = 1 - ss(0.1, 0.24, local)
    const solidB = ss(0.8, 0.94, local)
    const tiles = 1 - Math.max(solidA, solidB)

    if (tiles > 0.01) {
      const A = T.pts[k]
      const B = T.pts[k + 1]
      const cxm = w / 2
      const cym = T.oy + T.z / 2
      for (let i = 0; i < seeds.length; i++) {
        const s = seeds[i]
        const e = ss(0.22 + s.d, 0.62 + s.d, local)
        const a = A.length ? A[i % A.length] : [cxm, cym, 0]
        const b = B.length ? B[i % B.length] : [cxm, cym, 0]
        const burst = Math.sin(Math.PI * e)
        const x = lerp(a[0], b[0], e) + Math.cos(s.a + t * 0.25) * s.r * w * 0.45 * burst + sx
        const y = lerp(a[1], b[1], e) + Math.sin(s.a + t * 0.25) * s.r * h * 0.45 * burst + sy
        // extra tiles (when one icon has fewer than the other) only exist mid-flight
        const extra = lerp(i >= A.length ? 1 : 0, i >= B.length ? 1 : 0, e)
        const alpha = tiles * (1 - extra * (1 - burst))
        if (alpha < 0.02) continue
        const sz = T.g * (0.84 - burst * 0.4)
        ctx.globalAlpha = alpha * (1 - burst * 0.35)
        ctx.fillStyle = (e < 0.5 ? a[2] : b[2]) || (s.sig && burst > 0.15) ? SIGNAL : '#ffffff'
        ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz)
      }
      ctx.globalAlpha = 1
    }
    const drawSolid = (n: number, a: number) => {
      if (a < 0.01) return
      ctx.globalAlpha = a
      ctx.drawImage(T.solids[n], T.ox + sx, T.oy + sy, T.z, T.z)
      ctx.globalAlpha = 1
    }
    drawSolid(k, solidA)
    drawSolid(k + 1, solidB)
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
            <Field target={target} onIndex={setActive} label={`Index tiles assembling for each client: ${names.join(', ')}`} />
            <div className="pointer-events-none absolute inset-x-0 bottom-[6%] grid px-5 text-center md:px-10" aria-hidden="true">
              {names.map((n, i) => (
                <p
                  key={n}
                  className={`font-display col-start-1 row-start-1 text-[clamp(1.9rem,6.5vw,5.75rem)] leading-[0.95] tracking-[-0.035em] transition-all duration-500 ${
                    i === active ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-3 opacity-0 blur-[6px]'
                  }`}
                >
                  {n}
                </p>
              ))}
            </div>
            {/* progress rail */}
            <div className="pointer-events-none absolute inset-y-6 right-5 hidden w-px md:block bg-white/20 md:right-10" aria-hidden="true">
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
