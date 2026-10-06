import { useWordReveal } from '../lib/motion'

interface SectionHeadProps {
  eyebrow: string
  heading: string
  intro?: string
  id?: string
}

/** Shared section header: small label, large display heading, optional intro. */
export default function SectionHead({ eyebrow, heading, intro, id }: SectionHeadProps) {
  const headingRef = useWordReveal<HTMLHeadingElement>()
  return (
    <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-[200px_1fr] md:gap-16 md:pb-16">
      <p className="type-label text-[#0a0a0a]/70">{eyebrow}</p>
      <div>
        <h2
          ref={headingRef}
          id={id}
          className="font-display text-[clamp(2.25rem,5.2vw,5rem)] leading-[0.98] tracking-[-0.03em]"
        >
          {heading}
        </h2>
        {intro && <p className="mt-6 max-w-2xl text-lg font-semibold leading-snug text-[#0a0a0a]/80 md:text-xl">{intro}</p>}
      </div>
    </div>
  )
}
