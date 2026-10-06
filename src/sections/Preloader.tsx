import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/motion'
import { site } from '../data/content'

interface PreloaderProps {
  /** Fired the moment the curtain starts lifting — hero intro begins. */
  onDone: () => void
}

/**
 * White full-screen preloader: giant wordmark bottom-left, 0→100% counter,
 * ~200ms hold, then the curtain slides up (power4.inOut) and unmounts.
 */
export default function Preloader({ onDone }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(() => {
    try {
      return sessionStorage.getItem('pm-intro-seen') === '1'
    } catch {
      return false
    }
  })
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (gone) {
      doneRef.current()
      return
    }
    try {
      sessionStorage.setItem('pm-intro-seen', '1')
    } catch {
      /* storage unavailable: intro simply plays each load */
    }
    const overlay = overlayRef.current
    const counter = counterRef.current
    if (!overlay || !counter) return

    if (reducedMotion) {
      counter.textContent = '100%'
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.3,
        delay: 0.2,
        onStart: () => doneRef.current(),
        onComplete: () => setGone(true),
      })
      return
    }

    const obj = { v: 0 }
    gsap
      .timeline({ onComplete: () => setGone(true) })
      .to(obj, {
        v: 100,
        duration: 0.7,
        ease: 'power3.out',
        onUpdate: () => {
          counter.textContent = `${Math.round(obj.v)}%`
        },
      })
      .to({}, { duration: 0.1 })
      .add(() => doneRef.current())
      .to(overlay, { yPercent: -100, duration: 0.6, ease: 'power4.inOut' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[70] flex flex-col justify-between bg-white px-5 pb-6 pt-5 md:px-10" aria-hidden="true">
      <div className="flex items-start justify-between">
        <span className="type-label">{site.label}</span>
        <span className="type-label">Loading</span>
      </div>
      <div className="flex items-end justify-between gap-6">
        <p className="font-display text-[clamp(3rem,11vw,11rem)] leading-[0.92] tracking-[-0.035em]">
          {site.name}
        </p>
        <span
          ref={counterRef}
          className="type-label shrink-0 text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold tabular-nums"
        >
          0%
        </span>
      </div>
    </div>
  )
}
