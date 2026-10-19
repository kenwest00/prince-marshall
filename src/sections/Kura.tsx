import { kura } from '../data/content'
import { useFadeItems, useWordReveal } from '../lib/motion'
import KuraSceneBlock from '../components/KuraSceneBlock'

/** KURA, the flagship: from notebook to record. Black band, KURA's own colours. */
export default function Kura() {
  const headRef = useWordReveal<HTMLHeadingElement>()
  const afterRef = useFadeItems<HTMLDivElement>()

  return (
    <section id={kura.id} aria-labelledby="kura-heading" className="bg-[#0a0a0a] text-white">
      <div className="grid grid-cols-1 gap-6 px-5 pb-10 pt-24 md:grid-cols-[200px_1fr] md:gap-16 md:px-10 md:pb-14 md:pt-36">
        <p className="type-label text-[#c8ff2e]">{kura.flagEyebrow}</p>
        <div>
          <p className="type-label inline-flex items-center gap-2 border border-white/50 px-3 py-1.5">
            <span className="signal-dot signal-dot--on-dark" aria-hidden="true" />
            {kura.status}
          </p>
          <h2
            ref={headRef}
            id="kura-heading"
            className="mt-6 font-display text-[clamp(2.75rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.04em]"
          >
            {kura.heading}
          </h2>
          <p className="mt-6 max-w-3xl text-lg font-semibold leading-snug text-white/85 md:text-xl">{kura.sceneIntro}</p>
        </div>
      </div>

      <KuraSceneBlock pinVh={450} />

      <div ref={afterRef} className="px-5 pb-24 pt-16 md:px-10 md:pb-36 md:pt-24">
        <div className="md:ml-[264px]">
          <ul className="grid grid-cols-1 border-t border-white/40 md:grid-cols-2">
            {kura.outcomes.map((o) => (
              <li key={o.title} className="fade-item border-b border-white/20 py-6 md:pr-10 md:[&:nth-child(odd)]:border-r md:[&:nth-child(even)]:pl-10">
                <h3 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{o.title}</h3>
                <p className="mt-3 max-w-xl font-semibold leading-snug text-white/80">{o.body}</p>
              </li>
            ))}
          </ul>

          {kura.screenshot && (
            <figure className="fade-item mt-14 border border-white/40">
              <img src={kura.screenshot} alt={kura.screenshotAlt} loading="lazy" className="block w-full" />
            </figure>
          )}

          <div className="fade-item mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h3 className="type-label text-white/70">{kura.rulesHeading}</h3>
              <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {kura.rules.map((rule) => (
                  <li key={rule} className="flex gap-3 font-semibold leading-snug text-white/85">
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 bg-[#c8ff2e]" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="fade-item mt-14 flex flex-wrap items-baseline justify-between gap-4 border-t border-white/40 pt-6">
            <p className="text-lg font-bold">{kura.closing}</p>
            <a href={kura.pageLink.href} data-page-link className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
              {kura.pageLink.label} <span aria-hidden="true" className="ml-1">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
