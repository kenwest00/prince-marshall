import { audiences } from '../data/content'

/** Four doors from the first screen: studio, KURA, Ride-Along, partners. */
export default function Audiences() {
  return (
    <section id={audiences.id} aria-labelledby="audiences-heading" className="hairline-t px-5 py-10 md:px-10 md:py-14">
      <h2 id="audiences-heading" className="type-label text-[#0a0a0a]/70">
        {audiences.label}
      </h2>
      <ul className="mt-5 grid grid-cols-2 border-l border-t border-[#0a0a0a] lg:grid-cols-4">
        {audiences.items.map((a) => (
          <li key={a.label} className="min-w-0 border-b border-r border-[#0a0a0a]">
            <a
              href={a.href}
              {...(a.page ? { 'data-page-link': true } : {})}
              className="group flex h-full min-h-[132px] flex-col justify-between gap-4 p-4 transition-colors duration-300 hover:bg-[#0a0a0a] hover:text-white md:p-6"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-display text-xl leading-[1] tracking-[-0.02em] md:text-2xl">
                  {a.dot && <span className="signal-dot mr-2 align-middle" aria-hidden="true" />}
                  {a.label}
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-white transition-colors duration-300 group-hover:bg-[#c8ff2e] group-hover:text-[#0a0a0a]"
                >
                  →
                </span>
              </span>
              <span className="text-sm font-semibold leading-snug text-[#0a0a0a]/75 transition-colors group-hover:text-white/80 md:text-base">
                {a.line}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
