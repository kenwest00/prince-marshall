import { useRef } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/motion'

interface RollTextProps {
  text: string
  className?: string
}

/**
 * Hover label roll: the visible label sits in normal flow (so the wrapper is
 * exactly one line tall and clips the shadow copy); a second copy waits just
 * below and both slide up together on hover.
 */
export default function RollText({ text, className = '' }: RollTextProps) {
  const topRef = useRef<HTMLSpanElement>(null)
  const bottomRef = useRef<HTMLSpanElement>(null)

  const roll = (yPercent: number) => {
    if (reducedMotion) return
    gsap.to([topRef.current, bottomRef.current], {
      yPercent,
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  return (
    <span
      className={`relative inline-block overflow-hidden align-top ${className}`}
      onMouseEnter={() => roll(-100)}
      onMouseLeave={() => roll(0)}
      onFocus={() => roll(-100)}
      onBlur={() => roll(0)}
    >
      <span ref={topRef} className="block will-change-transform">
        {text}
      </span>
      <span ref={bottomRef} className="absolute left-0 top-full block w-full will-change-transform" aria-hidden="true">
        {text}
      </span>
    </span>
  )
}
