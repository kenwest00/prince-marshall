import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { hero, site } from '../data/content'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
import TileScene from '../components/TileScene'
import { reducedMotion, scrollToTarget } from '../lib/motion'
import { openContact } from '../lib/contactEvents'
import { ss, useMediaQuery, useScrollProgress, useStills } from '../lib/scene'

interface HeroProps {
  /** True once the preloader curtain starts lifting. */
  active: boolean
}

const STAGE_AT = [0.1, 0.3, 0.53, 0.75, 0.95]

/**
 * Hero: the value proposition and both calls to action are on the first
 * screen; behind them the p+m tile is built through the five Method stages.
 * Desktop pins for 150vh while the tile builds, with a Skip link.
 * Phones get the scene below the buttons as timed still frames.
 */
export default function Hero({ active }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const chromeRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const statementRef = useRef<HTMLParagraphElement>(null)
  const lineRefs = useRef<HTMLSpanElement[]>([])
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const pin = isDesktop && !reducedMotion
  const target = useRef(0)
  const [stage, setStage] = useState(0)

  useScrollProgress(rootRef, pin, (v) => {
    target.current = v
  })
  useStills(!pin, STAGE_AT, (v) => {
    target.current = v
  })

  // Fade the headline out and the stage bar in as the build progresses.
  useEffect(() => {
    if (!pin) {
      if (textRef.current) textRef.current.style.opacity = ''
      return
    }
    let raf = 0
    const tick = () => {
      const p = target.current
      const text = textRef.current
      const chrome = chromeRef.current
      if (text) {
        const k = ss(0.04, 0.2, p)
        text.style.opacity = String(1 - k)
        text.style.transform = `translateY(${-k * 40}px)`
        text.style.pointerEvents = k > 0.6 ? 'none' : ''
      }
      if (chrome) {
        const k = ss(0.06, 0.16, p)
        chrome.style.opacity = String(k)
        chrome.style.pointerEvents = k > 0.5 ? '' : 'none'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pin])

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
      tl.to(lines, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.09 })
      if (metaRef.current) tl.to(metaRef.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4)
      if (statementRef.current) tl.to(statementRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.7)
    }, root)
    return () => ctx.revert()
  }, [active])

  const jumpTo = (i: number) => {
    const el = rootRef.current
    if (!el) return
    const span = el.offsetHeight - window.innerHeight
    scrollToTarget(el.offsetTop + STAGE_AT[i] * span)
  }

  const allLines = hero.stackedLines.map((l) => ({ text: l.text, right: l.align === 'right' }))

  const text = (
    <div ref={textRef} className="relative z-10 flex min-h-[100svh] flex-col px-5 pt-24 md:px-10 md:pt-28 will-change-transform">
      <div ref={metaRef} className="flex items-start justify-between gap-10">
        <p className="type-label">
          {site.metaTop.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>
      <div className="flex-1" />
      <div className="pb-16 md:pb-10">
        <h1 className="mt-10 md:mt-0">
          <span className="font-display mb-6 block text-right text-[clamp(1.25rem,2.4vw,2.25rem)] leading-none tracking-[-0.02em] md:mb-6">
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
        <p ref={statementRef} className="mt-12 max-w-xl text-lg font-bold leading-snug tracking-tight md:mt-8 md:text-xl">
          {hero.statement}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-6">
          <PillButton
            href="#contact"
            onClick={(e) => {
              e?.preventDefault()
              openContact('A project or engagement')
            }}
          >
            <RollText text={hero.primaryCta} />
          </PillButton>
        </div>
      </div>
    </div>
  )

  const stageBar = (
    <ol className="grid grid-cols-5 border-t border-[#0a0a0a] bg-white/90">
      {hero.stages.map((s, i) => (
        <li key={s.name} className={`min-w-0 border-r border-[#0a0a0a]/15 last:border-r-0 ${stage === i ? 'bg-[#0a0a0a] text-white' : ''}`}>
          <button
            type="button"
            onClick={() => jumpTo(i)}
            className="grid w-full gap-1 px-3 py-3 text-left md:px-4 md:py-4"
            aria-current={stage === i ? 'step' : undefined}
          >
            <span className={`type-label ${stage === i ? 'text-[#c8ff2e]' : 'text-[#0a0a0a]/70'}`}>0{i + 1}</span>
            <span className="font-display text-base leading-none tracking-[-0.02em] md:text-2xl">{s.name}</span>
            <span className={`hidden text-sm font-semibold leading-snug lg:block ${stage === i ? 'text-white/80' : 'text-[#0a0a0a]/70'}`}>{s.line}</span>
          </button>
        </li>
      ))}
    </ol>
  )

  if (pin) {
    return (
      <section id="home" ref={rootRef} className="relative h-[250vh]" aria-label="prince + marshall">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div className="absolute inset-0" aria-hidden={false}>
            <TileScene target={target} onStage={setStage} label={hero.sceneLabel} scale={0.26} centerX={0.5} />
          </div>
          <div className="absolute inset-0 overflow-hidden">{text}</div>
          <div ref={chromeRef} className="absolute inset-x-0 bottom-0 z-20" style={{ opacity: 0 }}>
            <div className="flex items-center justify-between px-5 pb-3 md:px-10">
              <span className="type-label">
                Stage 0{stage + 1} / 05 · {hero.stages[stage]?.name}
              </span>
              <a href="#audiences" className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4">
                {hero.skip} <span aria-hidden="true" className="ml-1">↓</span>
              </a>
            </div>
            {stageBar}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="home" ref={rootRef} className="relative" aria-label="prince + marshall">
      {text}
      <div className="hairline-t">
        <div className="relative aspect-square max-h-[70svh] w-full">
          <TileScene target={target} onStage={setStage} label={hero.sceneLabel} scale={0.3} />
          <span className="type-label absolute left-5 top-4">
            Stage 0{stage + 1} / 05 · {hero.stages[stage]?.name}
          </span>
        </div>
        {stageBar}
      </div>
    </section>
  )
}
