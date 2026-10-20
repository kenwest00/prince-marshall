import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { clients } from '../data/content'
import { reducedMotion, scrollToTarget } from '../lib/motion'
import { SIGNAL } from '../lib/palette'
import { LOGO_URLS, renderTile } from '../lib/clientIcons'
import { clamp01, lerp, seeded, ss, useCanvasLoop, useMediaQuery, useScrollProgress, useSegmentFlex } from '../lib/scene'

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
  /** particle patch size and tile size, device pixels */
  S: number
  z: number
  /** tile's top-left corner, device pixels */
  ox: number
  oy: number
  /** per client: particle patches as tile-local [x, y] pairs */
  pts: Int32Array[]
  /** per client: the full-resolution tile, blended over the background; 0 = empty */
  tiles: Uint32Array[]
}

const BG = 0xff0a0a0a // #0a0a0a as little-endian ABGR
const LIME = 0xff2effc8 // #c8ff2e

/**
 * Cut each full-resolution tile into small patches; every patch that holds
 * any of the tile is one particle. Assembled, the patches are the tile pixel
 * for pixel, so it lands sharp without anything fading in over it.
 */
function build(W: number, H: number, cssW: number, logos: Partial<Record<string, HTMLImageElement>>): Targets {
  const dpr = W / Math.max(1, cssW)
  const cssH = H / dpr
  const zc = Math.round(Math.min(cssH * 0.54, cssW < 700 ? cssW * 0.6 : cssW * 0.5))
  const z = Math.round(zc * dpr)
  const S = Math.max(2, Math.round(z / 230))
  const ox = Math.round((W - z) / 2)
  const oy = Math.round(Math.max(8 * dpr, H * (cssW < 700 ? 0.45 : 0.4) - z / 2))
  const tiles: Uint32Array[] = []
  const pts = clients.items.map((c, n) => {
    const img = c.logo ? logos[c.logo] : undefined
    const d = renderTile(c, n, z, img).getContext('2d')?.getImageData(0, 0, z, z).data
    const tile = new Uint32Array(z * z)
    if (d)
      for (let i = 0; i < z * z; i++) {
        const al = d[i * 4 + 3] / 255
        if (al < 0.02) continue
        // blend over the page background so antialiased edges stay smooth
        const r = Math.round(d[i * 4] * al + 10 * (1 - al))
        const g = Math.round(d[i * 4 + 1] * al + 10 * (1 - al))
        const bl = Math.round(d[i * 4 + 2] * al + 10 * (1 - al))
        tile[i] = (0xff000000 | (bl << 16) | (g << 8) | r) >>> 0
      }
    tiles.push(tile)
    const out: number[] = []
    for (let y = 0; y < z; y += S)
      for (let x = 0; x < z; x += S) {
        let any = false
        for (let yy = y; yy < Math.min(z, y + S) && !any; yy++) for (let xx = x; xx < Math.min(z, x + S); xx++) if (tile[yy * z + xx]) { any = true; break }
        if (any) out.push(x, y)
      }
    // shuffle (in pairs) so each tile's particles come from all over the last one
    const rng = seeded(n * 131 + 17)
    const m = out.length / 2
    for (let i = m - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1))
      const tx = out[i * 2], ty = out[i * 2 + 1]
      out[i * 2] = out[j * 2]
      out[i * 2 + 1] = out[j * 2 + 1]
      out[j * 2] = tx
      out[j * 2 + 1] = ty
    }
    return Int32Array.from(out)
  })
  return { W, H, S, z, ox, oy, pts, tiles }
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
      const max = Math.max(...tg.current.pts.map((p) => p.length / 2), 1)
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
    const tA = T.tiles[k]
    const tB = T.tiles[k + 1]
    const nA = A.length / 2
    const nB = B.length / 2
    const n = Math.max(nA, nB)
    const { S, z, ox, oy } = T
    // gentle parallax with the pointer
    const sx = Math.round(px * 26 * (W / w))
    const sy = Math.round(py * 18 * (W / w))
    const ampX = W * 0.42
    const ampY = H * 0.42
    const drift = t * 0.25
    for (let i = 0; i < n; i++) {
      const a2 = (i % nA) * 2
      const b2 = (i % nB) * 2
      const s4 = i * 4
      // hold, then a staggered break-and-reform in the middle of each segment
      const e = ss(0.2 + sd[s4 + 2], 0.6 + sd[s4 + 2], local)
      const fromB = e >= 0.5
      const tx = fromB ? B[b2] : A[a2]
      const ty = fromB ? B[b2 + 1] : A[a2 + 1]
      const tile = fromB ? tB : tA
      if (e <= 0 || e >= 1) {
        // landed: copy the patch exactly
        const dx = ox + tx + sx
        const dy = oy + ty + sy
        for (let r = 0; r < S && ty + r < z; r++) {
          const yy = dy + r
          if (yy < 0 || yy >= H) continue
          const so = (ty + r) * z + tx
          const dO = yy * W + dx
          for (let c = 0; c < S && tx + c < z; c++) {
            const v = tile[so + c]
            if (v && dx + c >= 0 && dx + c < W) pix[dO + c] = v
          }
        }
        continue
      }
      // in flight: a single bright point carrying the patch's colour
      const burst = Math.sin(Math.PI * e)
      const ang = sd[s4] + drift
      const x = Math.round(ox + lerp(A[a2], B[b2], e) + Math.cos(ang) * sd[s4 + 1] * ampX * burst + sx + S / 2)
      const y = Math.round(oy + lerp(A[a2 + 1], B[b2 + 1], e) + Math.sin(ang) * sd[s4 + 1] * ampY * burst + sy + S / 2)
      if (x < 0 || y < 0 || x + 1 >= W || y + 1 >= H) continue
      let col = tile[Math.min(z - 1, ty + (S >> 1)) * z + Math.min(z - 1, tx + (S >> 1))] || tile[ty * z + tx] || 0xffffffff
      if (sd[s4 + 3] === 1 && burst > 0.15) col = LIME
      const o = y * W + x
      pix[o] = col
      if (burst < 0.6) {
        pix[o + 1] = col
        pix[o + W] = col
        pix[o + W + 1] = col
      }
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
  const segRef = useRef<HTMLOListElement>(null)
  useSegmentFlex(segRef, () => target.current * (N - 1), 4, (i, f) => (f * N) / (N - 1) - i)

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
          {/* scroll-linked index bar: one segment per client, the current one longest */}
          <ol ref={segRef} className="flex gap-1 px-5 pt-3 md:px-10" aria-hidden="true">
            {names.map((n, i) => (
              <li key={n} className="min-w-0 basis-0" style={{ flexGrow: 1 }}>
                <span className="relative block h-[3px] w-full overflow-hidden bg-white/20">
                  <span data-fill className="absolute inset-0 origin-left scale-x-0 transition-colors duration-300" style={{ background: i < active ? 'rgba(255,255,255,0.8)' : SIGNAL }} />
                </span>
              </li>
            ))}
          </ol>
          {/* HUD */}
          <div className="flex items-start justify-between gap-4 px-5 pt-3 md:justify-start md:gap-16 md:px-10 md:pt-6" aria-hidden="true">
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
