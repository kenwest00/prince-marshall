import { footer, site } from '../data/content'
import { useWordReveal } from '../lib/motion'

interface FooterProps {
  /** Optional page link shown in the footer's top row. */
  link?: { label: string; href: string }
}

export default function Footer({ link }: FooterProps = {}) {
  const wordmarkRef = useWordReveal<HTMLParagraphElement>({ stagger: 0.08 })

  return (
    <footer className="hairline-t px-5 pb-24 pt-6 md:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="type-label">{footer.left}</p>
        {link && (
          <a href={link.href} className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
            {link.label}
          </a>
        )}
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
