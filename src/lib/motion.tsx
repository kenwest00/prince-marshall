import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------- Lenis smooth scroll (driven by gsap.ticker) ---------------- */

let lenis: Lenis | null = null

export function getLenis(): Lenis | null {
  if (reducedMotion) return null
  if (!lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    lenis.on('scroll', () => ScrollTrigger.update())
    gsap.ticker.add((time) => {
      lenis?.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
  }
  return lenis
}

export function stopScroll() {
  lenis?.stop()
}

export function startScroll() {
  lenis?.start()
}

export function scrollToTarget(target: string | number, immediate = false) {
  if (lenis) {
    // force: true — programmatic navigation must work even while lenis is stopped
    lenis.scrollTo(target, immediate ? { immediate: true, force: true } : { offset: 0, force: true })
    return
  }
  if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'auto' })
  } else {
    window.scrollTo({ top: target })
  }
}

export function refreshScroll() {
  ScrollTrigger.refresh()
}

/* ---------------- Word splitting + masked word reveal ---------------- */

/**
 * Splits all text inside `el` into words, each wrapped in an
 * overflow-hidden inline-block mask with an inner span (the animated part).
 * Returns the inner spans. Cleans up by restoring innerHTML.
 */
export function splitWords(el: HTMLElement): HTMLSpanElement[] {
  const result: HTMLSpanElement[] = []

  const splitNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? ''
      const frag = document.createDocumentFragment()
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '))
          return
        }
        const mask = document.createElement('span')
        mask.style.display = 'inline-block'
        mask.style.overflow = 'hidden'
        mask.style.verticalAlign = 'top'
        // room for descenders / tight tracking; offset so layout is unchanged
        mask.style.paddingBottom = '0.14em'
        mask.style.marginBottom = '-0.14em'
        mask.style.paddingRight = '0.06em'
        mask.style.marginRight = '-0.06em'
        const inner = document.createElement('span')
        inner.style.display = 'inline-block'
        inner.style.willChange = 'transform'
        inner.textContent = part
        mask.appendChild(inner)
        frag.appendChild(mask)
        result.push(inner)
      })
      node.parentNode?.replaceChild(frag, node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(splitNode)
    }
  }

  Array.from(el.childNodes).forEach(splitNode)
  return result
}

interface WordRevealOptions {
  /** ScrollTrigger start, default "top 85%" */
  start?: string
  /** stagger between words, default 0.05 */
  stagger?: number
  /** extra delay before the reveal starts, default 0 */
  delay?: number
  /** animate immediately instead of waiting for scroll, default false */
  immediate?: boolean
}

/**
 * React hook: word-level masked text reveal on scroll (once).
 * Returns a ref to attach to the heading. No-op under reduced motion,
 * so content is always visible when animations are skipped.
 */
export function useWordReveal<T extends HTMLElement = HTMLElement>(
  options: WordRevealOptions = {}
): RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion) return

    const original = el.innerHTML
    const inners = splitWords(el)
    if (inners.length === 0) return

    gsap.set(inners, { yPercent: 110 })

    const animate = () => {
      gsap.to(inners, {
        yPercent: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: options.stagger ?? 0.05,
        delay: options.delay ?? 0,
      })
    }

    let trigger: ScrollTrigger | undefined
    if (options.immediate) {
      animate()
    } else {
      trigger = ScrollTrigger.create({
        trigger: el,
        start: options.start ?? 'top 85%',
        once: true,
        onEnter: animate,
      })
    }

    return () => {
      trigger?.kill()
      gsap.killTweensOf(inners)
      el.innerHTML = original
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}

/**
 * React hook: fades/raises every `.fade-item` descendant of the returned
 * container ref as it scrolls into view (once). No-op under reduced motion.
 */
export function useFadeItems<T extends HTMLElement = HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion) return
    const items = Array.from(el.querySelectorAll<HTMLElement>('.fade-item'))
    if (!items.length) return

    const ctx = gsap.context(() => {
      gsap.set(items, { autoAlpha: 0, y: 28 })
      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return ref
}
