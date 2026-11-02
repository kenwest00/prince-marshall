import { kuraPage as k } from '../data/content'
import SectionHead from '../components/SectionHead'

const section = 'hairline-t px-5 py-20 md:px-10 md:py-32'
const offset = 'md:ml-[264px]'

/** Only verified claims are shown; renders nothing when none are. */
export default function KuraAdvantage() {
  const a = k.advantage
  const items = a.items.filter((i) => i.verified)
  if (items.length === 0) return null

  return (
    <section id="why" aria-labelledby="why-h" className={section}>
      <SectionHead id="why-h" eyebrow={a.eyebrow} heading={a.heading} intro={a.intro} />
      <div className={offset}>
        {items.map((item) => (
          <details key={item.title} className="group border-t border-[#0a0a0a]/30 last:border-b">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-baseline justify-between gap-6 py-5 text-lg font-extrabold leading-snug tracking-tight md:text-xl [&::-webkit-details-marker]:hidden">
              {item.title}
              <span aria-hidden="true" className="text-2xl font-bold transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <dl className="grid max-w-4xl grid-cols-1 gap-6 pb-8 md:grid-cols-2 md:gap-10">
              <div>
                <dt className="type-label text-[#0a0a0a]/70">{a.typicalLabel}</dt>
                <dd className="mt-2 font-semibold leading-snug text-[#0a0a0a]/75">{item.typical}</dd>
              </div>
              <div className="border-l-4 border-[#c8ff2e] pl-4">
                <dt className="type-label">{a.kuraLabel}</dt>
                <dd className="mt-2 font-bold leading-snug">{item.kura}</dd>
              </div>
            </dl>
          </details>
        ))}
      </div>
    </section>
  )
}
