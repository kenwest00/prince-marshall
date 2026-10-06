import { faq } from '../data/content'
import { useFadeItems } from '../lib/motion'
import SectionHead from '../components/SectionHead'

export default function Faq() {
  const ref = useFadeItems<HTMLDivElement>()

  return (
    <section id={faq.id} aria-labelledby="faq-heading" className="hairline-t px-5 py-24 md:px-10 md:py-36">
      <SectionHead id="faq-heading" eyebrow={faq.eyebrow} heading={faq.heading} />

      <div ref={ref} className="md:ml-[264px]">
        {faq.items.map((item) => (
          <details key={item.q} className="fade-item group border-t border-[#0a0a0a]/30 last:border-b">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-baseline justify-between gap-6 py-5 text-lg font-extrabold leading-snug tracking-tight md:text-xl [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden="true" className="text-2xl font-bold transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="max-w-3xl pb-6 font-semibold leading-snug text-[#0a0a0a]/80">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
