import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../lib/motion'
import { menu } from '../data/content'

interface MenuLabelProps {
  open: boolean
}

/** Menu ⇄ Close label swap on the fixed pill, using a vertical roll. */
export default function MenuLabel({ open }: MenuLabelProps) {
  const stackRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reducedMotion || !stackRef.current) return
    gsap.to(stackRef.current, {
      yPercent: open ? -50 : 0,
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, [open])

  return (
    <span className="block h-[1.25em] overflow-hidden leading-none">
      <span ref={stackRef} className="flex flex-col will-change-transform">
        <span className="flex h-[1.25em] items-center">{menu.openLabel}</span>
        <span className="flex h-[1.25em] items-center" aria-hidden="true">
          {menu.closeLabel}
        </span>
      </span>
    </span>
  )
}
