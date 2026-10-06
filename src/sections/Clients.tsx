import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { clients } from '../data/content'
import { reducedMotion } from '../lib/motion'
import { SIGNAL } from '../lib/palette'

/**
 * Kinetic client index. Two opposing rows of oversized names — solid and
 * outlined in alternation — drift sideways and surge with scroll speed.
 * Hovering a row slows it to a stop and lights the name under the cursor.
 * Reduced-motion users get a static wrapped list. A real list is always in the
 * DOM for assistive tech and crawlers; the looping copies are aria-hidden.
 */

function Group({ names, offset, hidden }: { names: string[]; offset: number; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined} role={hidden ? 'presentation' : undefined}>
      {names.map((n, i) => (
        <li key={`${n}-${i}`} className="flex shrink-0 items-center">
          <span
            className={`client-name font-display text-[clamp(3rem,9vw,8.5rem)] leading-[1.05] tracking-[-0.03em] transition-colors duration-200 ${
              (i + offset) % 2 ? 'client-name--outline' : ''
            }`}
          >
            {n}
          </span>
          <span aria-hidden="true" className="mx-[clamp(1.5rem,4vw,4rem)] font-display text-[clamp(2rem,5vw,4.5rem)] leading-none" style={{ color: SIGNAL }}>
            +
          </span>
        </li>
      ))}
    </ul>
  )
}

function Row({ names, dir, offset }: { names: string[]; dir: 1 | -1; offset: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const hoverRef = useRef(false)

  useEffect(() => {
    if (reducedMotion) return
    const track = trackRef.current
    if (!track) return
    let groupW = 0
    let pos = 0
    let pace = 1
    let lastY = window.scrollY
    let surge = 0
    let visible = true

    const measure = () => {
      groupW = (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0
      if (dir === 1) pos = -groupW
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(track)

    const tick = (_: number, deltaMs: number) => {
      if (!visible || !groupW) return
      const y = window.scrollY
      surge += (Math.min(Math.abs(y - lastY), 80) - surge) * 0.12
      lastY = y
      pace += ((hoverRef.current ? 0 : 1) - pace) * 0.08
      const move = (0.045 * deltaMs + surge * 0.9) * pace
      pos += dir === -1 ? -move : move
      if (dir === -1 && pos <= -groupW) pos += groupW
      if (dir === 1 && pos >= 0) pos -= groupW
      track.style.transform = `translate3d(${pos}px,0,0)`
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
      io.disconnect()
    }
  }, [dir])

  const names2 = names
  return (
    <div
      className="overflow-hidden py-2"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        <Group names={names2} offset={offset} />
        {!reducedMotion && <Group names={names2} offset={offset} hidden />}
        {!reducedMotion && <Group names={names2} offset={offset} hidden />}
      </div>
    </div>
  )
}

export default function Clients() {
  const names = clients.items.map((c) => c.name)
  const reversed = [...names].reverse()
  return (
    <section
      id={clients.id}
      aria-labelledby="clients-heading"
      className="hairline-t overflow-hidden bg-[#0a0a0a] py-16 text-white md:py-24"
    >
      <div className="grid grid-cols-1 gap-4 px-5 pb-10 md:grid-cols-[200px_1fr] md:gap-16 md:px-10 md:pb-14">
        <p className="type-label text-white/70">{clients.eyebrow}</p>
        <h2 id="clients-heading" className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
          {clients.heading}
        </h2>
      </div>
      {reducedMotion ? (
        <ul className="flex flex-wrap gap-x-10 gap-y-4 px-5 md:px-10">
          {names.map((n) => (
            <li key={n} className="font-display text-4xl tracking-[-0.03em]">
              {n}
            </li>
          ))}
        </ul>
      ) : (
        <div className="md:ml-0">
          <Row names={names} dir={-1} offset={0} />
          <Row names={reversed} dir={1} offset={1} />
        </div>
      )}
    </section>
  )
}
