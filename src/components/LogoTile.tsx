import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/motion'

const WORD_A = 'rince'.split('')
const WORD_B = 'arshall'.split('')

const EXPANDED_FONT = 22
const COLLAPSED_FONT_RATIO = 0.36 // collapsed font-size as a share of the tile edge
const EXPANDED_WIDTH = 256

interface LogoTileProps {
  variant?: 'dark' | 'light'
  /** Edge length of the collapsed square tile, in px. */
  size?: number
  /** Static tiles render just "p+m" with no behavior. */
  interactive?: boolean
  className?: string
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** A plus drawn as two bars so it rotates cleanly around its true center. */
function PlusMark({ barRefs }: { barRefs?: (el: SVGRectElement | null, i: number) => void }) {
  return (
    <svg viewBox="0 0 100 100" className="logo-plus" aria-hidden="true" focusable="false">
      <rect ref={(el) => barRefs?.(el, 0)} x="0" y="38" width="100" height="24" fill="currentColor" />
      <rect ref={(el) => barRefs?.(el, 1)} x="38" y="0" width="24" height="100" fill="currentColor" />
    </svg>
  )
}

/**
 * prince + marshall tile.
 *
 * The monogram is a compressed name. Interactive behavior:
 *  - the "+" ticks a quarter turn every few seconds, like a mechanical latch;
 *  - with a pointer anywhere on the page, letters stretch and gain weight
 *    toward it (the typeface's own width and weight axes) while the "+"
 *    turns like a compass needle;
 *  - click / Enter / Space unfolds p→prince and m→marshall, letter by letter.
 * Reduced-motion users get the same states with no continuous animation.
 */
export default function LogoTile({
  variant = 'dark',
  size = 112,
  interactive = false,
  className = '',
}: LogoTileProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const tileRef = useRef<HTMLSpanElement>(null)
  const rowRef = useRef<HTMLSpanElement>(null)
  const descRef = useRef<HTMLSpanElement>(null)
  const plusRef = useRef<HTMLSpanElement>(null)
  const barsRef = useRef<SVGRectElement[]>([])
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const tone = variant === 'dark' ? 'logo-tile--dark bg-[#0a0a0a] text-white' : 'bg-white text-[#0a0a0a]'
  const collapsedFont = size * COLLAPSED_FONT_RATIO

  /* ---------- unfold / fold timeline ---------- */
  useEffect(() => {
    if (!interactive) return
    const tile = tileRef.current
    const row = rowRef.current
    const desc = descRef.current
    const plus = plusRef.current
    const root = rootRef.current
    if (!tile || !row || !desc || !plus || !root) return

    const restsA = root.querySelectorAll('[data-word="a"] [data-rest]')
    const restsB = root.querySelectorAll('[data-word="b"] [data-rest]')
    const rot = { expand: 0 }
    ;(root as HTMLElement & { _rot?: typeof rot })._rot = rot

    const ctx = gsap.context(() => {
      gsap.set(row, { fontSize: collapsedFont })
      gsap.set(tile, { width: size })
      gsap.set(desc, { autoAlpha: 0, y: 6 })
      gsap.set([...restsA, ...restsB], { gridTemplateColumns: '0fr', autoAlpha: 0 })

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      tl.to(tile, { width: EXPANDED_WIDTH, duration: 0.9, ease: 'power4.inOut' }, 0)
        .to(row, { fontSize: EXPANDED_FONT, duration: 0.9, ease: 'power4.inOut' }, 0)
        .to(plus, { marginLeft: 9, marginRight: 9, duration: 0.7 }, 0.1)
        .to(rot, { expand: 180, duration: 0.9, ease: 'power4.inOut' }, 0)
        .to(restsA, { gridTemplateColumns: '1fr', autoAlpha: 1, duration: 0.45, stagger: 0.05 }, 0.2)
        .to(restsB, { gridTemplateColumns: '1fr', autoAlpha: 1, duration: 0.45, stagger: 0.05 }, 0.2)
        .to(desc, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.6)
      tlRef.current = tl
    }, root)

    return () => {
      tlRef.current = null
      ctx.revert()
    }
  }, [interactive, size, collapsedFont])

  useEffect(() => {
    const tl = tlRef.current
    if (!tl) return
    if (reducedMotion) tl.progress(open ? 1 : 0)
    else if (open) tl.play()
    else tl.reverse()
  }, [open])

  /* ---------- latch tick + pointer-reactive type ---------- */
  useEffect(() => {
    if (!interactive || reducedMotion) return
    const root = rootRef.current as (HTMLElement & { _rot?: { expand: number } }) | null
    const plus = plusRef.current
    if (!root || !plus) return

    const state = { tick: 0, track: 0 }
    const pointer = { x: 0, y: 0, seen: false }
    const glyphs = Array.from(root.querySelectorAll<HTMLElement>('[data-g]')).map((el) => ({
      el,
      wt: 700,
      x: 0,
      y: 0,
    }))

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.seen = true
    }
    const onLeave = () => {
      pointer.seen = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    const tickId = window.setInterval(() => {
      if (document.hidden || pointer.seen) return
      gsap.to(state, { tick: '+=90', duration: 0.55, ease: 'back.out(2.4)', overwrite: false })
    }, 3200)

    const RADIUS = 280
    const frame = () => {

      for (const g of glyphs) {
        const r = g.el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = pointer.x - cx
        const dy = pointer.y - cy
        const d = Math.hypot(dx, dy) || 1
        const infl = pointer.seen ? Math.exp(-Math.pow(d / RADIUS, 2)) : 0

        const twt = pointer.seen ? lerp(500, 700, infl) : 700
        g.wt += (twt - g.wt) * 0.16
        const tx = pointer.seen ? (dx / d) * infl * 4 : 0
        const ty = pointer.seen ? (dy / d) * infl * 3 : 0
        g.x += (tx - g.x) * 0.2
        g.y += (ty - g.y) * 0.2

        g.el.style.fontWeight = `${Math.round(g.wt)}`
        g.el.style.transform = `translate3d(${g.x.toFixed(2)}px, ${g.y.toFixed(2)}px, 0)`
      }

      // The plus turns like a compass needle toward the pointer.
      const pr = plus.getBoundingClientRect()
      const pdx = pointer.x - (pr.left + pr.width / 2)
      const pdy = pointer.y - (pr.top + pr.height / 2)
      const pd = Math.hypot(pdx, pdy) || 1
      const pInfl = pointer.seen ? Math.exp(-Math.pow(pd / (RADIUS * 1.6), 2)) : 0
      const angle = (Math.atan2(pdy, pdx) * 180) / Math.PI
      const wrapped = ((angle % 90) + 90) % 90
      const targetTrack = pointer.seen ? (wrapped > 45 ? wrapped - 90 : wrapped) * pInfl : 0
      state.track += (targetTrack - state.track) * 0.14

      const svg = plus.firstElementChild as SVGElement | null
      if (svg) {
        const expand = root._rot?.expand ?? 0
        svg.style.transform = `rotate(${(state.tick + state.track + expand).toFixed(2)}deg)`
      }
      const thick = lerp(22, 34, pInfl)
      const [h, v] = barsRef.current
      if (h && v) {
        h.setAttribute('y', String(50 - thick / 2))
        h.setAttribute('height', String(thick))
        v.setAttribute('x', String(50 - thick / 2))
        v.setAttribute('width', String(thick))
      }
    }
    gsap.ticker.add(frame)

    return () => {
      gsap.ticker.remove(frame)
      window.clearInterval(tickId)
      gsap.killTweensOf(state)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      glyphs.forEach((g) => {
        g.el.style.fontWeight = ''
        g.el.style.transform = ''
      })
    }
  }, [interactive])

  /* ---------- static tile ---------- */
  if (!interactive) {
    return (
      <span
        className={`logo-tile ${tone} ${className}`}
        style={{ width: size, height: size, fontSize: collapsedFont }}
        role="img"
        aria-label="prince + marshall"
      >
        <span className="logo-tile__row" aria-hidden="true">
          <span>p</span>
          <span className="logo-plus-wrap">
            <PlusMark />
          </span>
          <span>m</span>
        </span>
      </span>
    )
  }

  /* ---------- interactive tile ---------- */
  return (
    <button
      ref={rootRef as React.RefObject<HTMLButtonElement>}
      type="button"
      className={`logo-btn ${className}`}
      aria-expanded={open}
      aria-label={open ? 'prince + marshall — fold the name' : 'prince + marshall — unfold the name'}
      onClick={() => setOpen((v) => !v)}
    >
      <span ref={tileRef} className={`logo-tile ${tone}`} style={{ height: size }}>
        <span ref={rowRef} className="logo-tile__row" aria-hidden="true">
          <span className="logo-word" data-word="a">
            <span data-g>p</span>
            {WORD_A.map((c, i) => (
              <span key={`a${i}`} className="logo-rest" data-rest data-g>
                <span>{c}</span>
              </span>
            ))}
          </span>
          <span ref={plusRef} className="logo-plus-wrap">
            <PlusMark barRefs={(el, i) => el && (barsRef.current[i] = el)} />
          </span>
          <span className="logo-word" data-word="b">
            <span data-g>m</span>
            {WORD_B.map((c, i) => (
              <span key={`b${i}`} className="logo-rest" data-rest data-g>
                <span>{c}</span>
              </span>
            ))}
          </span>
        </span>
        <span ref={descRef} className="logo-desc" aria-hidden="true">
          RESEARCH-LED ENTERPRISE TOOLS
        </span>
      </span>
      <span className="logo-hint type-label" aria-hidden="true">
        {open ? '(fold)' : '(unfold)'}
      </span>
    </button>
  )
}
