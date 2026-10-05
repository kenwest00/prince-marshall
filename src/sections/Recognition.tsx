import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { recognition } from '../data/content'
import { reducedMotion, useWordReveal } from '../lib/motion'

export default function Recognition() {
  const headingRef = useWordReveal<HTMLHeadingElement>()
  const yearsRef = useWordReveal<HTMLUListElement>({ stagger: 0.08 })
  const rowsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = rowsRef.current
    if (!container || reducedMotion) return
    const rows = Array.from(container.querySelectorAll<HTMLElement>('.rec-row'))
    if (!rows.length) return

    const ctx = gsap.context(() => {
      gsap.set(rows, { autoAlpha: 0, y: 28 })
      gsap.to(rows, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: { trigger: container, start: 'top 85%', once: true },
      })
    }, container)
    return () => ctx.revert()
  }, [])

  const years = [...new Set(recognition.rows.map((r) => r.year))]

  return (
    <section id="recognition" className="px-5 py-24 md:px-10 md:py-36">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr] md:gap-16">
        {/* left sub-column mirroring the template's meta column */}
        <div>
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[-0.03em]"
          >
            {recognition.heading}
          </h2>
          <ul ref={yearsRef} className="mt-8 hidden space-y-1 md:block">
            {recognition.yearGroups.map((year) => (
              <li key={year} className="type-label text-[#0a0a0a]/50">
                {year}
              </li>
            ))}
          </ul>
        </div>

        {/* award rows */}
        <div ref={rowsRef}>
          {years.map((year) => (
            <div
              key={year}
              className="hairline-t first:border-t-0 md:first:border-t md:first:border-[#0a0a0a]"
            >
              <div className="flex items-baseline justify-between gap-4 pb-2 pt-3 md:hidden md:pb-3 md:pt-4">
                <span className="type-label text-[#0a0a0a]/50">{year}</span>
              </div>
              {recognition.rows
                .filter((row) => row.year === year)
                .map((row) => (
                  <div
                    key={`${row.org}-${row.award}`}
                    className="rec-row relative flex items-baseline justify-between gap-6 overflow-hidden border-b border-[#0a0a0a]/15 py-4 md:py-5"
                  >
                    <span className="relative z-10 px-1 text-base font-bold tracking-tight transition-colors duration-300 md:text-lg">
                      <span className="mr-4 inline-block w-9 type-label text-[#0a0a0a]/40 md:hidden">
                        {row.year}
                      </span>
                      {row.org}
                    </span>
                    <span className="relative z-10 px-1 text-right type-label text-[#0a0a0a]/70 transition-colors duration-300">
                      {row.award}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
