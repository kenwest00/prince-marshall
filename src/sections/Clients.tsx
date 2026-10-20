import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { clients } from '../data/content'
import { reducedMotion, scrollToTarget } from '../lib/motion'
import { SIGNAL } from '../lib/palette'
import { LOGO_URLS, renderTile } from '../lib/clientIcons'
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
  /** canvas size in device pixels */
  W: number
  H: number
  /** particle block size in device pixels */
  S: number
  /** centre of the tile, device pixels */
  cx: number
  cy: number
  /** per client: packed particle targets [x, y, colour] in device pixels */
  pts: Int32Array[]
}

const BG = 0xff0a0a0a // #0a0a0a as little-endian ABGR
const WHITE = 0xffffffff
const LIME = 0xff2effc8 // #c8ff2e

/**
 * Sample each tile at the particle grid. Every opaque cell becomes one
 * particle, so the assembled particles are the tile: no solid image is
 * faded in over them.
 */
function build(W: number, H: number, cssW: number, logos: Partial<Record<string, HTMLImageElement>>): Targets {
  const dpr = W / Math.max(1, cssW)
  const cssH = H / dpr
  const zc = Math.round(Math.min(cssH * 0.54, cssW < 700 ? cssW * 0.6 : cssW * 0.5))
  const z = Math.round(zc * dpr)
  const S = Math.max(2, Math.round(z / 230))
  const ox = Math.round((W - z) / 2)
  const oy = Math.round(Math.max(8 * dpr, H * (cssW < 700 ? 0.45 : 0.4) - z / 2))
  const pts = clients.items.map((c, n) => {
    const img = c.logo ? logos[c.logo] : undefined
    const tile = renderTile(c, n, z, img)
    const d = tile.getContext('2d')?.getImageData(0, 0, z, z).data
    const out: number[] = []
    if (d)
      for (let y = 0; y + S <= z; y += S)
        for (let x = 0; x + S <= z; x += S) {
          const o = ((y + (S >> 1)) * z + x + (S >> 1)) * 4
          if (d[o + 3] > 128) out.push(ox + x, oy + y, d[o + 2] < 150 ? 1 : 0)
        }
    // shuffle (in triples) so each tile's particles come from all over the last one
    const rng = seeded(n * 131 + 17)
    const m = out.length / 3
    for (let i = m - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      for (let k = 0; k < 3; k++) {
        const t = out[i * 3 + k]
        out[i * 3 + k] = out[j * 3 + k]
        out[j * 3 + k] = t
      }
    }
    return Int32Array.from(out)
  })
  return { W, H, S, cx: ox + z / 2, cy: oy + z / 2, pts }
}

function Field({ target, onIndex, label }: { target: MutableRefObject<number>; onIndex: (i: number) => void; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tg = useRef<Targets | null>(null)
  const buf = useRef<{ img: ImageData; px: Uint32Array } | null>(null)
  const P = useRef(-1)
  const idx = useRef(-1)
  const cb = useRef(onIndex)
  useEffect(() => {
    cb.current = onIndex
  })
  const logos = useRef<Partial<Record<string, HTMLImageElement>>>({})
  useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => {
      if (alive) tg.current = null
    })
    for (const [key, url] of Object.entries(LOGO_URLS)) {
      const img = new Image()
      img.onload = () => {
        if (!alive) return
        logos.current[key] = img
        tg.current = null
      }
      img.src = url
    }
    return () => {
      alive = false
    }
  }, [])
  // per-particle scatter direction, distance, stagger and spark, fixed
  const seedsRef = useRef<Float32Array | null>(null)

  useCanvasLoop(canvasRef, ({ ctx, w, t, px, py }) => {
    const W = ctx.canvas.width
    const H = ctx.canvas.height
    if (!W || !H) return
    if (!tg.current || tg.current.W !== W || tg.current.H !== H) {
      tg.current = build(W, H, w, logos.current)
      const max = Math.max(...tg.current.pts.map((p) => p.length / 3), 1)
      const rng = seeded(4242)
      const sd = new Float32Array(max * 4)
      for (let i = 0; i < max; i++) {
        sd[i * 4] = rng.range(0, Math.PI * 2)
        sd[i * 4 + 1] = rng.range(0.15, 0.6)
        sd[i * 4 + 2] = rng.range(0, 0.2)
        sd[i * 4 + 3] = rng.next() < 0.05 ? 1 : 0
      }
      seedsRef.current = sd
      const img = ctx.createImageData(W, H)
      buf.current = { img, px: new Uint32Array(img.data.buffer) }
    }
    const T = tg.current
    const sd = seedsRef.current
    const B0 = buf.current
    if (!sd || !B0) return
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

    const pix = B0.px
    pix.fill(BG)
    const A = T.pts[k]
    const B = T.pts[k + 1]
    const nA = A.length / 3
    const nB = B.length / 3
    const n = Math.max(nA, nB)
    const S = T.S
    // gentle parallax with the pointer
    const sx = px * 26 * (W / w)
    const sy = py * 18 * (W / w)
    const ampX = W * 0.42
    const ampY = H * 0.42
    const drift = t * 0.25
    for (let i = 0; i < n; i++) {
      const a3 = (i % nA) * 3
      const b3 = (i % nB) * 3
      const s4 = i * 4
      // hold, then a staggered break-and-reform in the middle of each segment
      const e = ss(0.2 + sd[s4 + 2], 0.6 + sd[s4 + 2], local)
      const burst = Math.sin(Math.PI * e)
      const ang = sd[s4] + drift
      const x = Math.round(lerp(A[a3], B[b3], e) + Math.cos(ang) * sd[s4 + 1] * ampX * burst + sx)
      const y = Math.round(lerp(A[a3 + 1], B[b3 + 1], e) + Math.sin(ang) * sd[s4 + 1] * ampY * burst + sy)
      if (x < 0 || y < 0 || x + S > W || y + S > H) continue
      const lime = (e < 0.5 ? A[a3 + 2] : B[b3 + 2]) === 1 || (sd[s4 + 3] === 1 && burst > 0.15)
      const col = lime ? LIME : WHITE
      // particles shrink to single pixels in flight, grow back to fill the tile as they land
      const sz = burst > 0.5 ? 1 : S
      let o = y * W + x
      for (let r = 0; r < sz; r++, o += W) for (let c = 0; c < sz; c++) pix[o + c] = col
    }
    ctx.putImageData(B0.img, 0, 0)
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
            <div className="pointer-events-none absolute inset-x-0 bottom-[6%] px-5 text-center md:px-10" aria-hidden="true">
              <Scramble text={c.name} className="font-display block text-[clamp(1.9rem,6.5vw,5.75rem)] leading-[0.95] tracking-[-0.035em]" />
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
