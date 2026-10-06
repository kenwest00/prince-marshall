import { footer, site } from '../data/content'
import { useWordReveal } from '../lib/motion'

export default function Footer() {
  const wordmarkRef = useWordReveal<HTMLParagraphElement>({ stagger: 0.08 })

  return (
    <footer className="hairline-t px-5 pb-24 pt-6 md:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="type-label">{footer.left}</p>
        <p className="type-label text-[#0a0a0a]/70">{footer.right}</p>
      </div>

      <div className="mt-8 overflow-hidden md:mt-12" aria-hidden="true">
        <p
          ref={wordmarkRef}
          className="outline-text whitespace-nowrap text-center font-display text-[clamp(3rem,12.5vw,13rem)] leading-[0.9] tracking-[-0.03em]"
        >
          {footer.wordmark}
        </p>
      </div>

      <span className="sr-only">{site.name}</span>
    </footer>
  )
}
