import { clients } from '../data/content'
import { useFadeItems } from '../lib/motion'

/**
 * Client strip. Each client renders its logo if `logo` is set in content.ts
 * (drop the official SVG into public/clients/), otherwise its name is typeset.
 * Logos are shown in one ink colour so no brand colour competes with the site.
 */
export default function Clients() {
  const ref = useFadeItems<HTMLDivElement>()
  return (
    <section id={clients.id} aria-labelledby="clients-heading" className="hairline-t px-5 py-16 md:px-10 md:py-24">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] md:gap-16">
        <p className="type-label text-[#0a0a0a]/70">{clients.eyebrow}</p>
        <div ref={ref}>
          <h2 id="clients-heading" className="fade-item text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
            {clients.heading}
          </h2>
          <ul className="mt-10 grid grid-cols-2 border-l border-t border-[#0a0a0a] md:grid-cols-3">
            {clients.items.map((c) => (
              <li
                key={c.name}
                className="fade-item group flex min-h-[110px] items-center justify-center border-b border-r border-[#0a0a0a] px-4 py-6 transition-colors duration-300 hover:bg-[#0a0a0a] hover:text-white"
              >
                {c.logo ? (
                  <img
                    src={c.logo}
                    alt={c.name}
                    loading="lazy"
                    className="h-9 w-auto max-w-[70%] object-contain brightness-0 transition duration-300 group-hover:invert"
                  />
                ) : (
                  <span className="text-center font-display text-xl leading-none tracking-[-0.02em] md:text-2xl">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
