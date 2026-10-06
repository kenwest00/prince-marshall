import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'
import LogoTile from './LogoTile'
import { getLenis, reducedMotion, refreshScroll, scrollToTarget, startScroll } from '../lib/motion'

export interface TransitionHandle {
  go: (target: string) => void
  isActive: () => boolean
}

/**
 * Black full-screen page-transition overlay with the white totem.
 * Wipes up from the bottom, jumps to the target, wipes away upward.
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
        .set(totem, { scale: 0.8, autoAlpha: 0 })
        .to(overlay, { yPercent: 0, duration: 0.5, ease: 'power4.inOut' })
        .to(totem, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'power3.out' }, '-=0.15')
        .add(() => {
          scrollToTarget(target, true)
          refreshScroll()
        }, '+=0.05')
        .to(totem, { scale: 0.8, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, '+=0.15')
        .to(overlay, { yPercent: -100, duration: 0.5, ease: 'power4.inOut' }, '-=0.05')
        .set(overlay, { autoAlpha: 0, yPercent: 100 })
    },
  }), [])

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0a]"
      style={{ visibility: 'hidden' }}
      aria-hidden="true"
    >
      <div ref={totemRef}>
        <LogoTile variant="light" size={160} />
      </div>
    </div>
  )
})

export default TransitionOverlay
