import { partners } from '../data/content'
import SectionHead from '../components/SectionHead'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
import { useFadeItems } from '../lib/motion'
import { openContact } from '../lib/contactEvents'

export default function Partners() {
  const ref = useFadeItems<HTMLDivElement>()
  const get = [...partners.get, partners.referral].filter(Boolean)
  return (
    <section id={partners.id} aria-labelledby="partners-heading" className="hairline-t px-5 py-24 md:px-10 md:py-36">
      <SectionHead id="partners-heading" eyebrow={partners.eyebrow} heading={partners.heading} intro={partners.intro} />
      <div ref={ref} className="grid grid-cols-1 gap-12 md:ml-[264px] xl:grid-cols-[1.3fr_1fr] xl:gap-16">
        <div className="fade-item">
          <h3 className="type-label uppercase tracking-wide text-[#0a0a0a]/70">{partners.whoHeading}</h3>
          <ul className="mt-3 border-t border-[#0a0a0a]">
            {partners.who.map((w) => (
              <li key={w.title} className="border-b border-[#0a0a0a]/20 py-4 text-lg font-semibold leading-snug">
                <strong className="font-extrabold">{w.title}:</strong> {w.body}
              </li>
            ))}
          </ul>
        </div>
        <div className="fade-item flex flex-col gap-8">
          <div>
            <h3 className="type-label uppercase tracking-wide text-[#0a0a0a]/70">{partners.getHeading}</h3>
            <ul className="mt-3 border-t border-[#0a0a0a]">
              {get.map((g) => (
                <li key={g} className="flex gap-3 border-b border-[#0a0a0a]/20 py-4 text-lg font-semibold leading-snug">
                  <span aria-hidden="true" className="font-extrabold">+</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <PillButton
              href="#contact"
              onClick={(e) => {
                e?.preventDefault()
                openContact('Partnership')
              }}
            >
              <RollText text={partners.cta} />
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  )
}
