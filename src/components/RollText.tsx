import { useRef } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/motion'

interface RollTextProps {
  text: string
  className?: string
}

/**
 * Template's .link-inner label/shadow pattern: two stacked copies of the
 * label inside an overflow-hidden box; on hover the stack rolls up so the
 * copy slides in from below (power3.out, 0.4s).
 */
export default function RollText({ text, className = '' }: RollTextProps) {
  const stackRef = useRef<HTMLSpanElement>(null)

  const roll = (yPercent: number) => {
    if (reducedMotion || !stackRef.current) return
    gsap.to(stackRef.current, { yPercent, duration: 0.4, ease: 'power3.out', overwrite: 'auto' })
  }

  return (
    <span
      className={`inline-block overflow-hidden align-top ${className}`}
      onMouseEnter={() => roll(-100)}
      onMouseLeave={() => roll(0)}
    >
      <span ref={stackRef} className="flex flex-col will-change-transform">
        <span className="block">{text}</span>
        <span className="block" aria-hidden="true">
          {text}
        </span>
      </span>
    </span>
  )
}
