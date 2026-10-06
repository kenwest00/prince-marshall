import { environments } from '../data/content'
import { useFadeItems } from '../lib/motion'
import SectionHead from '../components/SectionHead'

export default function Environments() {
  const gridRef = useFadeItems<HTMLUListElement>()

  return (
    <section id={environments.id} aria-labelledby="env-heading" className="hairline-t px-5 py-24 md:px-10 md:py-36">
      <SectionHead
        id="env-heading"
        eyebrow={environments.eyebrow}
        heading={environments.heading}
        intro={environments.intro}
      />

      <ul ref={gridRef} className="grid grid-cols-1 gap-px border border-[#0a0a0a] bg-[#0a0a0a] md:ml-[264px] md:grid-cols-2">
        {environments.items.map((item) => (
          <li key={item.title} className="fade-item bg-white p-6 md:p-8">
            <h3 className="font-display text-2xl leading-none tracking-[-0.03em] md:text-3xl">{item.title}</h3>
            <p className="mt-5 font-semibold leading-snug">{item.different}</p>
            <p className="type-label mt-5 text-[#0a0a0a]/70">
              <span className="block uppercase tracking-wide text-[#0a0a0a]/70">Typical tools</span>
              {item.tools}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
