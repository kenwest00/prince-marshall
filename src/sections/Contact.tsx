import { contact, site } from '../data/content'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
import { useWordReveal } from '../lib/motion'

export default function Contact() {
  const labelRef = useWordReveal<HTMLDivElement>({ stagger: 0.05 })

  return (
    <section id="contact" className="hairline-t px-5 py-24 md:px-10 md:py-36">
      <div ref={labelRef} className="type-label">
        <p>{contact.availability}</p>
        <p className="mt-1 text-[#0a0a0a]/50">{contact.writeTo}</p>
      </div>

      <div className="mt-10 md:mt-14">
        <a
          href={`mailto:${site.email}`}
          className="font-display break-words text-[clamp(2rem,6.5vw,7rem)] leading-[0.95] tracking-[-0.03em] underline-offset-8 hover:underline"
        >
          <RollText text={site.email} />
        </a>
        <div className="mt-10">
          <PillButton href={`mailto:${site.email}`}>
            <RollText text={contact.cta} />
          </PillButton>
        </div>
      </div>
    </section>
  )
}
