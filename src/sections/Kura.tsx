import { contact, kura } from '../data/content'
import { useFadeItems, useWordReveal } from '../lib/motion'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
import { RING_COLORS } from '../lib/palette'
import KuraField from '../components/KuraField'
import { useState } from 'react'
import { openContact } from '../lib/contactEvents'

/** Generative portrait of a collection: one object, five orbits of record. */
function KuraVisual({ active, onActive }: { active: number | null; onActive: (i: number | null) => void }) {
  return (
    <figure className="fade-item border border-[#0a0a0a] bg-[#0a0a0a]" aria-label={kura.visualLabel}>
      <KuraField labels={kura.ringLabels} active={active} onActive={onActive} />
      <figcaption className="type-label border-t border-white/25 px-4 py-3 text-white/80">{kura.visualLabel}</figcaption>
    </figure>
  )
}

export default function Kura() {
  const nameRef = useWordReveal<HTMLHeadingElement>()
  const contentRef = useFadeItems<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

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
          <p className="type-label mt-4 inline-flex items-center gap-2 bg-[#0a0a0a] px-3 py-1.5 text-white"><span className="signal-dot signal-dot--on-dark" aria-hidden="true" />{kura.status}</p>
        </div>
      </div>

      <div ref={contentRef} className="md:ml-[264px]">
        <p className="fade-item max-w-3xl text-lg font-semibold leading-snug md:text-xl">{kura.intro}</p>

        <div className="mt-12">
          <KuraVisual active={active} onActive={setActive} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 xl:grid-cols-[1.1fr_1fr] xl:gap-14">
          <ul className="space-y-0">
            {kura.pillars.map((p, i) => (
              <li
                key={p.title}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className={`fade-item grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[#0a0a0a]/25 py-5 transition-colors last:border-b ${active === i ? 'bg-[#0a0a0a] px-4 text-white' : ''}`}
                style={active === i ? { boxShadow: `inset 5px 0 0 ${RING_COLORS[i]}` } : undefined}
              >
                <span className={`type-label pt-1 ${active === i ? 'text-white/80' : 'text-[#0a0a0a]/70'}`}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-xl font-extrabold leading-tight tracking-tight">{p.title}</h3>
                  <p className={`mt-1 font-semibold leading-snug ${active === i ? 'text-white/85' : 'text-[#0a0a0a]/80'}`}>{p.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-10">
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
          <PillButton
            href="#contact"
            onClick={(e) => {
              e?.preventDefault()
              openContact(contact.form.topicOptions[1])
            }}
          >
            <RollText text={kura.cta} />
          </PillButton>
        </div>
      </div>
    </section>
  )
}
