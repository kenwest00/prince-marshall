import { kura, site } from '../data/content'
import { useFadeItems, useWordReveal } from '../lib/motion'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'

/** Abstract record card: field labels only — no invented values or screenshots. */
function RecordDiagram() {
  return (
    <figure className="fade-item border border-[#0a0a0a] bg-white" aria-label={kura.recordLabel}>
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-[#0a0a0a] px-4 py-3">
        {kura.recordTabs.map((tab, i) => (
          <span
            key={tab}
            className={`type-label ${i === 0 ? 'border-b-2 border-[#0a0a0a]' : 'text-[#0a0a0a]/70'}`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-[96px_1fr] gap-4 p-4 md:grid-cols-[140px_1fr] md:p-6" aria-hidden="true">
        <div className="aspect-[4/5] bg-[#ededed]">
          <svg viewBox="0 0 120 150" className="h-full w-full text-[#0a0a0a]/35">
            <rect x="14" y="16" width="92" height="118" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="60" cy="66" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="14" y1="104" x2="106" y2="104" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="space-y-3">
          {['Accession number', 'Maker', 'Medium', 'Condition', 'Current location', 'Insured value'].map((label) => (
            <div key={label} className="flex items-center gap-3">
              <span className="type-label w-36 shrink-0 text-[#0a0a0a]/70 md:w-44">{label}</span>
              <span className="h-2 flex-1 bg-[#0a0a0a]/10" />
            </div>
          ))}
        </div>
      </div>
      <figcaption className="hairline-t type-label px-4 py-3 text-[#0a0a0a]/70">{kura.recordLabel}</figcaption>
    </figure>
  )
}

export default function Kura() {
  const nameRef = useWordReveal<HTMLHeadingElement>()
  const contentRef = useFadeItems<HTMLDivElement>()
  const subject = encodeURIComponent('KURA walkthrough request')

  return (
    <section id={kura.id} aria-labelledby="kura-heading" className="hairline-t bg-[#f4f3f0] px-5 py-24 md:px-10 md:py-36">
      <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-[200px_1fr] md:gap-16 md:pb-16">
        <p className="type-label text-[#0a0a0a]/70">{kura.eyebrow}</p>
        <div>
          <h2
            ref={nameRef}
            id="kura-heading"
            className="font-display text-[clamp(4rem,14vw,13rem)] leading-[0.88] tracking-[-0.04em]"
          >
            {kura.name}
          </h2>
          <p className="mt-6 text-2xl font-bold leading-tight tracking-tight md:text-4xl">{kura.tagline}</p>
          <p className="type-label mt-4 inline-block border border-[#0a0a0a] px-3 py-1.5">{kura.status}</p>
        </div>
      </div>

      <div ref={contentRef} className="md:ml-[264px]">
        <p className="fade-item max-w-3xl text-lg font-semibold leading-snug md:text-xl">{kura.intro}</p>

        <div className="mt-12 grid grid-cols-1 gap-10 xl:grid-cols-[1.1fr_1fr] xl:gap-14">
          <ul className="space-y-0">
            {kura.pillars.map((p, i) => (
              <li key={p.title} className="fade-item grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[#0a0a0a]/25 py-5 last:border-b">
                <span className="type-label pt-1 text-[#0a0a0a]/70">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-xl font-extrabold leading-tight tracking-tight">{p.title}</h3>
                  <p className="mt-1 font-semibold leading-snug text-[#0a0a0a]/80">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-10">
            <RecordDiagram />
            <div className="fade-item">
              <h3 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{kura.rulesHeading}</h3>
              <ul className="mt-5 space-y-3">
                {kura.rules.map((rule) => (
                  <li key={rule} className="flex gap-3 font-semibold leading-snug">
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-[#0a0a0a]" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="fade-item mt-14">
          <PillButton href={`mailto:${site.email}?subject=${subject}`}>
            <RollText text={kura.cta} />
          </PillButton>
        </div>
      </div>
    </section>
  )
}
