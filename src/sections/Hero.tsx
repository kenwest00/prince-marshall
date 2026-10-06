import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { hero, site } from '../data/content'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
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

  const allLines = hero.stackedLines.map((l) => ({ text: l.text, right: l.align === 'right' }))

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
        <h1 className="mt-10 md:mt-16">
          <span className="font-display mb-6 block text-right text-[clamp(1.25rem,2.4vw,2.25rem)] leading-none tracking-[-0.02em] md:mb-10">
            {hero.nameLine}
          </span>
          {allLines.map((line, i) => (
            <span key={line.text} className={`block overflow-hidden ${line.right ? 'text-right' : 'text-left'}`}>
              <span
                ref={(el) => {
                  if (el) lineRefs.current[i] = el
                }}
                className="type-hero-md block pb-[0.12em] -mb-[0.12em] will-change-transform"
              >
                {line.text}
              </span>
            </span>
          ))}
        </h1>

        <p ref={statementRef} className="mt-12 max-w-xl text-lg font-bold leading-snug tracking-tight md:mt-16 md:text-xl">
          {hero.statement}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <PillButton href="#contact">
            <RollText text={hero.primaryCta} />
          </PillButton>
          <a href="#method" className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4">
            {hero.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  )
}
