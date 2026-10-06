import { studio } from '../data/content'
import { useFadeItems } from '../lib/motion'
import SectionHead from '../components/SectionHead'

export default function Studio() {
  const ref = useFadeItems<HTMLDivElement>()

  return (
    <section id={studio.id} aria-labelledby="studio-heading" className="hairline-t px-5 py-24 md:px-10 md:py-36">
      <SectionHead id="studio-heading" eyebrow={studio.eyebrow} heading={studio.heading} />

      <div ref={ref} className="grid grid-cols-1 gap-12 md:ml-[264px] xl:grid-cols-[1.3fr_1fr] xl:gap-16">
        <div className="space-y-6">
          {studio.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="fade-item max-w-2xl text-lg font-semibold leading-snug md:text-xl">
              {p}
            </p>
          ))}
        </div>
        <dl className="space-y-0">
          {studio.facts.map((f) => (
            <div key={f.label} className="fade-item border-t border-[#0a0a0a] py-5 last:border-b">
              <dt className="font-display text-2xl leading-none tracking-[-0.03em]">{f.label}</dt>
              <dd className="mt-2 font-semibold leading-snug text-[#0a0a0a]/80">{f.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
