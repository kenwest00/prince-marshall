import { method } from '../data/content'
import { useFadeItems } from '../lib/motion'
import SectionHead from '../components/SectionHead'

export default function Method() {
  const listRef = useFadeItems<HTMLOListElement>()

  return (
    <section id={method.id} aria-labelledby="method-heading" className="hairline-t px-5 py-24 md:px-10 md:py-36">
      <SectionHead id="method-heading" eyebrow={method.eyebrow} heading={method.heading} intro={method.intro} />

      <ol ref={listRef} className="md:ml-[264px]">
        {method.steps.map((step) => (
          <li
            key={step.number}
            className="fade-item grid grid-cols-[3rem_1fr] gap-x-4 gap-y-3 border-b border-[#0a0a0a]/20 py-7 first:border-t first:border-[#0a0a0a] md:grid-cols-[4rem_12rem_1fr_16rem] md:gap-x-8 md:py-9"
          >
            <span className="type-label pt-2 text-[#0a0a0a]/70">{step.number}</span>
            <h3 className="font-display text-3xl leading-none tracking-[-0.03em] md:text-4xl">{step.name}</h3>
            <p className="col-span-2 text-base font-semibold leading-snug md:col-span-1 md:col-start-3 md:text-lg">
              {step.body}
            </p>
            <p className="type-label col-span-2 text-[#0a0a0a]/70 md:col-span-1 md:col-start-4">
              <span className="block uppercase tracking-wide text-[#0a0a0a]/70">You get</span>
              {step.deliverable}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
