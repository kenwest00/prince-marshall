import { useEffect, useRef, useState, type RefObject } from 'react'
import { reducedMotion } from './motion'

/** Shared math and plumbing for the canvas 2D scenes (tile + KURA record). */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Deterministic PRNG (mulberry32) so scene geometry is pure and stable. */
export function seeded(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return { next, range: (lo: number, hi: number) => lo + next() * (hi - lo) }
}

export type V3 = [number, number, number]

export interface Frame {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
  /** seconds; frozen at 0 under reduced motion */
  t: number
  /** eased pointer offset, -0.5..0.5 */
  px: number
  py: number
}

/**
 * Sizes a canvas to its box (DPR ≤ 2), pauses off-screen, eases the pointer
 * (tracked on the canvas' parent so overlays don't block it) and calls draw
 * every animation frame while visible.
 */
export function useCanvasLoop(canvasRef: RefObject<HTMLCanvasElement | null>, draw: (f: Frame) => void) {
  const drawRef = useRef(draw)
  useEffect(() => {
    drawRef.current = draw
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const host = canvas.parentElement ?? canvas
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let visible = true
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    const frame = (time: number) => {
      raf = 0
      if (!visible || !w || !h) return
      ptr.x += (ptr.tx - ptr.x) * 0.08
      ptr.y += (ptr.ty - ptr.y) * 0.08
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawRef.current({ ctx, w, h, t: reducedMotion ? 0 : time / 1000, px: ptr.x, py: ptr.y })
      raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      ptr.tx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5))
      ptr.ty = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5))
    }
    const onLeave = () => {
      ptr.tx = 0
      ptr.ty = 0
    }

    resize()
    const ro = new ResizeObserver(() => {
      resize()
      kick()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(canvas)
    if (!reducedMotion) {
      host.addEventListener('pointermove', onMove)
      host.addEventListener('pointerleave', onLeave)
    }
    kick()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [canvasRef])
}

/** Scroll progress (0..1) through a tall section whose inner box is sticky. */
export function useScrollProgress(sectionRef: RefObject<HTMLElement | null>, enabled: boolean, onProgress: (p: number) => void) {
  const cb = useRef(onProgress)
  useEffect(() => {
    cb.current = onProgress
  })
  useEffect(() => {
    if (!enabled) return
    const on = () => {
      const el = sectionRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const span = el.offsetHeight - window.innerHeight
      cb.current(span > 0 ? clamp01(-r.top / span) : 0)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [sectionRef, enabled])
}

/** Steps a progress value through still frames on a timer, stopping on the last one. */
export function useStills(enabled: boolean, stops: number[], onProgress: (p: number) => void, every = 1200) {
  const cb = useRef(onProgress)
  useEffect(() => {
    cb.current = onProgress
  })
  const stopsKey = stops.join(',')
  useEffect(() => {
    if (!enabled) return
    const list = stopsKey.split(',').map(Number)
    if (reducedMotion) {
      cb.current(list[list.length - 1])
      return
    }
    let i = 0
    cb.current(list[0])
    const id = window.setInterval(() => {
      i += 1
      if (i >= list.length) {
        window.clearInterval(id)
        return
      }
      cb.current(list[i])
    }, every)
    return () => window.clearInterval(id)
  }, [enabled, stopsKey, every])
}

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/** Orbit-camera projection used by both scenes. */
export function camera(yaw: number, pitch: number, cx: number, cy: number, scale: number, lift = 0) {
  const cyR = Math.cos(yaw)
  const syR = Math.sin(yaw)
  const cxR = Math.cos(pitch)
  const sxR = Math.sin(pitch)
  const rot = (v: V3): V3 => {
    const x1 = v[0] * cyR + v[2] * syR
    const z1 = -v[0] * syR + v[2] * cyR
    const y1 = v[1] + lift
    return [x1, y1 * cxR - z1 * sxR, y1 * sxR + z1 * cxR]
  }
  const proj = (v: V3, stretch = 1) => {
    const q = rot(v)
    const k = 1 / (1 - q[2] * 0.12)
    return { x: cx + q[0] * scale * k * stretch, y: cy - q[1] * scale * k, z: q[2] }
  }
  /** Pitch only: for rings and ground that should not spin with the object. */
  const projFixed = (v: V3, stretch = 1) => {
    const y1 = v[1] * cxR - v[2] * sxR
    const z1 = v[1] * sxR + v[2] * cxR
    const k = 1 / (1 - z1 * 0.12)
    return { x: cx + v[0] * scale * k * stretch, y: cy - y1 * scale * k, z: z1 }
  }
  const rotN = (n: V3): V3 => {
    const x1 = n[0] * cyR + n[2] * syR
    const z1 = -n[0] * syR + n[2] * cyR
    return [x1, n[1] * cxR - z1 * sxR, n[1] * sxR + z1 * cxR]
  }
  return { rot, proj, projFixed, rotN }
}

/**
 * Scroll-linked segment bar. Each child of `listRef` grows as the fractional
 * position returned by `getF` (0 = first segment) nears it and shrinks as it
 * moves on; an element marked [data-fill] inside each child is scaled to
 * `fillOf(i, f)` (0..1), so a segment fills as you work through it. Writes
 * styles directly (no re-render).
 */
export function useSegmentFlex(
  listRef: RefObject<HTMLElement | null>,
  getF: () => number,
  grow = 3.5,
  fillOf: (i: number, f: number) => number = (i, f) => clamp01(f - i),
) {
  const fn = useRef(getF)
  const fillFn = useRef(fillOf)
  useEffect(() => {
    fn.current = getF
    fillFn.current = fillOf
  })
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    let raf = 0
    let cur = fn.current()
    let last = -1
    const tick = () => {
      const f = fn.current()
      cur = reducedMotion ? f : cur + (f - cur) * 0.2
      if (Math.abs(cur - last) > 0.0005) {
        last = cur
        const kids = el.children
        const g = Math.min(cur, kids.length - 1)
        for (let i = 0; i < kids.length; i++) {
          const kid = kids[i] as HTMLElement
          const w = Math.max(0, 1 - Math.abs(g - i))
          kid.style.flexGrow = String(1 + grow * w * w * (3 - 2 * w))
          const fill = kid.querySelector<HTMLElement>('[data-fill]')
          if (fill) fill.style.transform = `scaleX(${clamp01(fillFn.current(i, cur)).toFixed(4)})`
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [listRef, grow])
}
