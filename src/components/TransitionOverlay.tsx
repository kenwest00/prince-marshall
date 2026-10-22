import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'
import { blueprintSVG } from '../lib/blueprint'
import { getLenis, reducedMotion, refreshScroll, scrollToTarget, startScroll } from '../lib/motion'

export interface TransitionHandle {
  go: (target: string) => void
  isActive: () => boolean
}

/**
 * Full-screen transition overlay: a blueprint sheet on which the p+m tile is
 * drawn line by line. Wipes up from the bottom, jumps to the target, wipes away.
 */
const TransitionOverlay = forwardRef<TransitionHandle>(function TransitionOverlay(_, ref) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const totemRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(false)

  useEffect(() => {
    gsap.set(overlayRef.current, { yPercent: 100, autoAlpha: 0 })
  }, [])

  useImperativeHandle(ref, () => ({
    isActive: () => activeRef.current,
    go(target: string) {
      const overlay = overlayRef.current
      const totem = totemRef.current
      if (!overlay || !totem) return

      if (reducedMotion) {
        scrollToTarget(target, true)
        return
      }

      activeRef.current = true
      getLenis()?.stop()

      gsap
        .timeline({
          onComplete: () => {
            activeRef.current = false
            startScroll()
          },
        })
        .set(overlay, { yPercent: 100, autoAlpha: 1 })
        .set(totem, { scale: 0.96, autoAlpha: 1 })
        .add(() => {
          // restart the line drawing
          totem.innerHTML = blueprintSVG(true)
        })
        .to(overlay, { yPercent: 0, duration: 0.5, ease: 'power4.inOut' })
        .to(totem, { scale: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3')
        .add(() => {
          scrollToTarget(target, true)
          refreshScroll()
        }, '+=0.05')
        .to(totem, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, '+=0.35')
        .to(overlay, { yPercent: -100, duration: 0.5, ease: 'power4.inOut' }, '-=0.05')
        .set(overlay, { autoAlpha: 0, yPercent: 100 })
    },
  }), [])

  return (
    <div
      ref={overlayRef}
      className="pm-blueprint pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
      style={{ visibility: 'hidden' }}
      aria-hidden="true"
    >
      <div ref={totemRef} className="pm-blueprint-art" />
    </div>
  )
})

export default TransitionOverlay
