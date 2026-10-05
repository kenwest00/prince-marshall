import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { hero, site } from '../data/content'
import { reducedMotion } from '../lib/motion'

interface HeroProps {
  /** True once the preloader curtain starts lifting. */
  active: boolean
}

/**
 * Hero: every headline line sits in an overflow-hidden mask and rises from
 * translateY(110%) with a stagger once the preloader hands off.
 */
export default function Hero({ active }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const statementRef = useRef<HTMLParagraphElement>(null)
  const lineRefs = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    if (!active || reducedMotion) return
    const root = rootRef.current
    if (!root) return

    const lines = lineRefs.current.filter(Boolean)
    const ctx = gsap.context(() => {
      gsap.set(lines, { yPercent: 110 })
      if (metaRef.current) gsap.set(metaRef.current, { autoAlpha: 0, y: 24 })
      if (statementRef.current) gsap.set(statementRef.current, { autoAlpha: 0, y: 30 })

      const tl = gsap.timeline({ delay: 0.15 })
      tl.to(lines, {
        yPercent: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.09,
      })
      if (metaRef.current) {
        tl.to(metaRef.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4)
      }
      if (statementRef.current) {
        tl.to(statementRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.7)
      }
    }, root)
    return () => ctx.revert()
  }, [active])

  const allLines = [{ text: hero.nameLine, right: true }, ...hero.stackedLines.map((l) => ({ text: l.text, right: l.align === 'right' }))]

  return (
    <section
      id="home"
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col px-5 pt-24 md:px-10 md:pt-28"
    >
      {/* top meta */}
      <div ref={metaRef} className="type-label">
        <p>
          {site.metaTop.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      {/* spacer pushes headline toward lower half, like the template */}
      <div className="flex-1" />

      <div className="pb-16 md:pb-24">
        <div className="mt-10 md:mt-16">
          {allLines.map((line, i) => (
            <div key={line.text} className={`overflow-hidden ${line.right ? 'text-right' : 'text-left'}`}>
              <span
                ref={(el) => {
                  if (el) lineRefs.current[i] = el
                }}
                className="type-hero block will-change-transform"
              >
                {line.text}
              </span>
            </div>
          ))}
        </div>

        <p ref={statementRef} className="mt-12 max-w-xl text-lg font-bold leading-snug tracking-tight md:mt-16 md:text-xl">
          {hero.statement}
        </p>
      </div>
    </section>
  )
}
