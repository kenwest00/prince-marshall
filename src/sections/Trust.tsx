import { trust } from '../data/content'
import { useFadeItems } from '../lib/motion'
import SectionHead from '../components/SectionHead'

export default function Trust() {
  const gridRef = useFadeItems<HTMLUListElement>()

  return (
    <section id={trust.id} aria-labelledby="trust-heading" className="hairline-t px-5 py-24 md:px-10 md:py-36">
      <SectionHead id="trust-heading" eyebrow={trust.eyebrow} heading={trust.heading} intro={trust.intro} />

      <ul ref={gridRef} className="grid grid-cols-1 gap-x-10 gap-y-0 md:ml-[264px] md:grid-cols-2">
        {trust.items.map((item, i) => (
          <li key={item.title} className="fade-item grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[#0a0a0a]/25 py-6">
            <span className="type-label pt-1 text-[#0a0a0a]/70">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="text-xl font-extrabold leading-tight tracking-tight">{item.title}</h3>
              <p className="mt-1 font-semibold leading-snug text-[#0a0a0a]/80">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
