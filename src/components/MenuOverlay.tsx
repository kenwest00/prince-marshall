import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { menu, site } from '../data/content'
import { getLenis, reducedMotion } from '../lib/motion'
import LogoTile from './LogoTile'
import PillButton from './PillButton'
import RollText from './RollText'

interface MenuOverlayProps {
  open: boolean
  /** Plain close (Esc / Close pill) — no navigation. */
  onClose: () => void
  /** Menu item clicked — overlay closes and the page-transition runs. */
  onNavigate: (href: string) => void
}

/**
 * Full-screen menu: white overlay wiping in with clip-path
 * inset(0 0 0 100%) → inset(0 0 0 0) (expands leftward from the right edge),
 * numbered items staggering in right after.
 */
export default function MenuOverlay({ open, onClose, onNavigate }: MenuOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const openRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (reducedMotion) {
      gsap.set(root, { autoAlpha: open ? 1 : 0 })
      openRef.current = open
      return
    }

    const items = Array.from(root.querySelectorAll<HTMLElement>('.menu-item-mask'))

    if (open && !openRef.current) {
      openRef.current = true
      getLenis()?.stop()
      const tl = gsap.timeline()
      tl.set(root, { autoAlpha: 1 })
        .fromTo(
          root,
          { clipPath: 'inset(0% 0% 0% 100%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power4.inOut' }
        )
        .fromTo(
          items,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power4.out', stagger: 0.06 },
          '-=0.25'
        )
    } else if (!open && openRef.current) {
      openRef.current = false
      gsap
        .timeline()
        .to(root, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.6, ease: 'power4.inOut' })
        .set(root, { autoAlpha: 0 })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-40 flex flex-col bg-white md:pl-[320px]"
      style={{ visibility: 'hidden', clipPath: 'inset(0% 0% 0% 100%)' }}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between px-5 py-5 md:px-10">
        <LogoTile size={48} />
        <PillButton onClick={onClose}>
          <RollText text={menu.closeLabel} />
        </PillButton>
      </div>

      <nav className="flex flex-1 flex-col justify-center px-5 md:px-10">
        <ul>
          {menu.items.map((item) => (
            <li key={item.label} className="hairline-b first:border-t first:border-[#0a0a0a]">
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(item.href)
                }}
                className="group flex items-baseline gap-4 py-3 md:gap-8 md:py-4"
              >
                {item.number && (
                  <span className="type-label w-8 shrink-0 text-[#0a0a0a]/70 transition-colors group-hover:text-[#0a0a0a] md:w-12">
                    {parseInt(item.number, 10)}
                  </span>
                )}
                {!item.number && <span className="w-8 shrink-0 md:w-12" />}
                <span className="menu-item-mask block overflow-hidden">
                  <span className="block font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.03em]">
                    <RollText text={item.label} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-6 md:px-10">
        <span className="type-label">{site.metaTop[0]}</span>
        <a href={`mailto:${site.email}`} className="type-label">
          <RollText text={site.email} className="underline underline-offset-4" />
        </a>
      </div>
    </div>
  )
}
