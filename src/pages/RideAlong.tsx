import { useEffect, useRef, useState } from 'react'
import { rideAlong } from '../data/content'
import LogoTile from '../components/LogoTile'
import SectionHead from '../components/SectionHead'
import Footer from '../sections/Footer'
import { useFadeItems } from '../lib/motion'
import ActionButtons from '../ride-along/ActionButtons'
import Calculator from '../ride-along/Calculator'
import NoteForm from '../ride-along/NoteForm'
import { hasPhone, prettyPhone, smsHref } from '../ride-along/contactLinks'

const r = rideAlong
const section = 'hairline-t px-5 py-20 md:px-10 md:py-32'
const offset = 'md:ml-[264px]'
const money = (n: number) => `$${n.toLocaleString('en-US')}`

function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[#0a0a0a] bg-white px-5 py-3 md:px-10">
      <a href="../" className="flex items-center gap-3" aria-label={r.header.home}>
        <LogoTile size={40} />
        <span className="type-label hidden sm:inline">prince + marshall</span>
      </a>
      <a
        href={hasPhone ? smsHref : '#note'}
        className="type-label inline-flex min-h-[44px] items-center text-right underline underline-offset-4 hover:no-underline"
      >
        {hasPhone ? `${r.cta.text} ${prettyPhone}` : r.cta.book}
      </a>
    </header>
  )
}

function Hero({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  return (
    <section ref={heroRef} id="top" aria-labelledby="ride-h1" className="px-5 pb-16 pt-10 md:px-10 md:pb-28 md:pt-20">
      <p className="type-label">
        <span className="signal-dot mr-2" aria-hidden="true" />
        {r.hero.label}
      </p>
      <h1
        id="ride-h1"
        className="mt-5 max-w-[14ch] font-display text-[clamp(2.9rem,10vw,9rem)] leading-[0.92] tracking-[-0.035em]"
      >
        {r.hero.h1}
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="max-w-2xl text-lg font-semibold leading-snug md:text-2xl">{r.hero.sub}</p>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-snug md:text-lg">
            <strong className="bg-[#c8ff2e] px-1.5 font-extrabold">{r.hero.priceStrong}</strong> {r.hero.priceRest}
          </p>
        </div>
        <div className="lg:pt-1">
          <ActionButtons />
          <p className="mt-5 max-w-md text-sm font-semibold leading-snug text-[#0a0a0a]/75">{r.hero.under}</p>
        </div>
      </div>
    </section>
  )
}

function Why() {
  const ref = useFadeItems<HTMLDivElement>()
  const w = r.why
  return (
    <section id="why" aria-labelledby="why-heading" className={section}>
      <SectionHead id="why-heading" eyebrow={w.eyebrow} heading={w.heading} />
      <div ref={ref} className={`${offset} max-w-3xl space-y-6`}>
        {w.paragraphs.map((p) => (
          <p key={p} className="fade-item text-lg font-semibold leading-snug md:text-xl">
            {p}
          </p>
        ))}
        <ul className="fade-item border-t border-[#0a0a0a]">
          {w.trades.map((t) => (
            <li key={t.title} className="border-b border-[#0a0a0a]/20 py-4 text-lg font-semibold leading-snug">
              <strong className="font-extrabold">{t.title}:</strong> {t.body}
            </li>
          ))}
        </ul>
        {w.season && <p className="fade-item text-lg font-extrabold leading-snug">{w.season}</p>}
        {w.stat && (
          <p className="fade-item text-base font-semibold leading-snug text-[#0a0a0a]/80">
            {w.stat.text}{' '}
            <a href={w.stat.url} className="underline underline-offset-4" rel="noopener" target="_blank">
              {w.stat.source}
            </a>
          </p>
        )}
      </div>
    </section>
  )
}

function CalculatorSection() {
  const c = r.calculator
  return (
    <section id="calculator" aria-labelledby="calc-heading" className={section}>
      <SectionHead id="calc-heading" eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} />
      <div className={offset}>
        <Calculator />
        <ActionButtons secondary={false} className="mt-8" />
      </div>
    </section>
  )
}

function Outcomes() {
  const ref = useFadeItems<HTMLUListElement>()
  const o = r.outcomes
  return (
    <section id="outcomes" aria-labelledby="outcomes-heading" className={section}>
      <SectionHead id="outcomes-heading" eyebrow={o.eyebrow} heading={o.heading} />
      <div className={offset}>
        <ul ref={ref} className="border-t border-[#0a0a0a]">
          {o.items.map((i, n) => (
            <li
              key={i.title}
              className="fade-item grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#0a0a0a]/20 py-6 md:grid-cols-[3.5rem_1fr]"
            >
              <span className="type-label pt-1 text-[#0a0a0a]/70">{String(n + 1).padStart(2, '0')}</span>
              <p className="text-lg font-semibold leading-snug md:text-xl">
                <strong className="font-extrabold">{i.title}:</strong> {i.body}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-lg font-extrabold leading-snug md:text-xl">{o.closing}</p>
      </div>
    </section>
  )
}

function How() {
  const ref = useFadeItems<HTMLOListElement>()
  const h = r.how
  return (
    <section id="how" aria-labelledby="how-heading" className={section}>
      <SectionHead id="how-heading" eyebrow={h.eyebrow} heading={h.heading} />
      <ol ref={ref} className={offset}>
        {h.steps.map((s) => (
          <li
            key={s.number}
            className="fade-item grid grid-cols-[3rem_1fr] gap-x-4 gap-y-3 border-b border-[#0a0a0a]/20 py-7 first:border-t first:border-[#0a0a0a] md:grid-cols-[4rem_12rem_1fr_16rem] md:gap-x-8 md:py-9"
          >
            <span className="type-label pt-2 text-[#0a0a0a]/70">{s.number}</span>
            <div>
              <h3 className="font-display text-3xl leading-none tracking-[-0.03em] md:text-4xl">{s.name}</h3>
              <p className="type-label mt-2 text-[#0a0a0a]/70">{s.when}</p>
            </div>
            <p className="col-span-2 text-base font-semibold leading-snug md:col-span-1 md:col-start-3 md:text-lg">
              {s.body}
            </p>
            <p className="type-label col-span-2 md:col-span-1 md:col-start-4">
              <span className="block uppercase tracking-wide text-[#0a0a0a]/70">You get</span>
              {s.deliverable}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Guarantee() {
  const g = r.guarantee
  return (
    <section id="guarantee" aria-labelledby="guarantee-heading" className={section}>
      <SectionHead id="guarantee-heading" eyebrow={g.eyebrow} heading={g.heading} />
      <div className={offset}>
        <p className="max-w-3xl text-lg font-semibold leading-snug md:text-2xl">{g.body}</p>
        <p className="mt-12 font-display text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.035em]">
          {g.line}
        </p>
      </div>
    </section>
  )
}

function Price() {
  const p = r.pricing
  const extras = [p.foundingRate, p.capacity, p.referral].filter(Boolean)
  return (
    <section id="price" aria-labelledby="price-heading" className={section}>
      <SectionHead id="price-heading" eyebrow={p.eyebrow} heading={p.heading} />
      <div className={`${offset} grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]`}>
        <div>
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="bg-[#c8ff2e] px-3 font-display text-[clamp(4rem,11vw,7.5rem)] leading-[1] tracking-[-0.04em]">
              {money(r.price)}
            </span>
            <span className="type-label text-base">{p.fixed}</span>
          </p>
          <ActionButtons className="mt-10" />
        </div>
        <div className="space-y-10">
          <div>
            <h3 className="type-label uppercase tracking-wide text-[#0a0a0a]/70">{p.includedHeading}</h3>
            <ul className="mt-3 border-t border-[#0a0a0a]">
              {p.included.map((i) => (
                <li key={i} className="flex gap-3 border-b border-[#0a0a0a]/20 py-3.5 text-lg font-semibold leading-snug">
                  <span aria-hidden="true" className="font-extrabold">+</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="type-label uppercase tracking-wide text-[#0a0a0a]/70">{p.termsHeading}</h3>
            <ul className="mt-3 space-y-3">
              {[...p.terms, ...extras].map((t) => (
                <li key={t} className="text-base font-semibold leading-snug md:text-lg">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  if (!r.testimonials.length) return null
  return (
    <section id="clients" aria-labelledby="clients-heading" className={section}>
      <SectionHead id="clients-heading" eyebrow={r.testimonialsEyebrow} heading={r.testimonialsHeading} />
      <div className={`${offset} grid grid-cols-1 gap-10 md:grid-cols-2`}>
        {r.testimonials.map((t) => (
          <figure key={t.name} className="border-t border-[#0a0a0a] pt-6">
            <blockquote className="text-xl font-bold leading-snug">“{t.quote}”</blockquote>
            <figcaption className="type-label mt-4 text-[#0a0a0a]/75">
              {t.name}, {t.trade}, {t.town}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function About() {
  const a = r.about
  return (
    <section id="about" aria-labelledby="about-heading" className={section}>
      <SectionHead id="about-heading" eyebrow={a.eyebrow} heading={a.heading} />
      <div className={`${offset} grid grid-cols-1 gap-10 ${a.photo ? 'lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]' : ''}`}>
        {a.photo && (
          <img
            src={`../${a.photo}`}
            alt={a.photoAlt}
            loading="lazy"
            className="aspect-[4/5] w-full border border-[#0a0a0a] object-cover grayscale"
          />
        )}
        <div className="max-w-3xl space-y-6">
          {a.paragraphs.map((p) => (
            <p key={p} className="text-lg font-semibold leading-snug md:text-xl">
              {p}
            </p>
          ))}
          <p className="type-label text-[#0a0a0a]/75">{a.location}</p>
        </div>
      </div>
    </section>
  )
}

function Questions() {
  const ref = useFadeItems<HTMLDivElement>()
  const f = r.faq
  return (
    <section id="questions" aria-labelledby="faq-heading" className={section}>
      <SectionHead id="faq-heading" eyebrow={f.eyebrow} heading={f.heading} />
      <div ref={ref} className={offset}>
        {f.items.map((item) => (
          <details key={item.q} className="fade-item group border-t border-[#0a0a0a]/30 last:border-b">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-baseline justify-between gap-6 py-5 text-lg font-extrabold leading-snug tracking-tight md:text-xl [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden="true" className="text-2xl font-bold transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="max-w-3xl pb-6 font-semibold leading-snug text-[#0a0a0a]/80">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function Final({ finalRef }: { finalRef: React.RefObject<HTMLElement | null> }) {
  const f = r.final
  return (
    <section ref={finalRef} id="note" aria-labelledby="final-heading" className="bg-[#0a0a0a] px-5 py-20 text-white md:px-10 md:py-32">
      <h2
        id="final-heading"
        className="max-w-[16ch] font-display text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.035em]"
      >
        {f.heading}
      </h2>
      {hasPhone && <ActionButtons inverted secondary={false} className="mt-10" />}
      <div className="mt-14 grid grid-cols-1 gap-10 bg-white p-5 text-[#0a0a0a] md:p-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div>
          <h3 className="font-display text-3xl leading-none tracking-[-0.03em] md:text-4xl">
            {hasPhone ? f.formHeading : f.formHeadingNoPhone}
          </h3>
          <p className="mt-4 text-base font-semibold leading-snug text-[#0a0a0a]/80">{f.formIntro}</p>
        </div>
        <NoteForm />
      </div>
    </section>
  )
}

/** Mobile-only bottom bar: appears once the hero is gone, hides at the final call to action. */
function StickyBar({ show }: { show: boolean }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#0a0a0a] bg-white p-3 transition-transform duration-300 md:hidden ${
        show ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      aria-hidden={!show}
    >
      <a
        href={hasPhone ? smsHref : '#note'}
        tabIndex={show ? 0 : -1}
        className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#0a0a0a] text-base font-bold text-white"
      >
        {hasPhone ? `${r.sticky} to ${prettyPhone}` : r.stickyNoPhone}
      </a>
    </div>
  )
}

export default function RideAlong() {
  const heroRef = useRef<HTMLElement>(null)
  const finalRef = useRef<HTMLElement>(null)
  const [heroVisible, setHeroVisible] = useState(true)
  const [finalVisible, setFinalVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === heroRef.current) setHeroVisible(e.isIntersecting)
        if (e.target === finalRef.current) setFinalVisible(e.isIntersecting)
      }
    })
    if (heroRef.current) io.observe(heroRef.current)
    if (finalRef.current) io.observe(finalRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <a
        href="#main"
        className="fixed left-3 top-3 z-[80] -translate-y-20 bg-[#0a0a0a] px-4 py-3 text-sm font-bold text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero heroRef={heroRef} />
        <Why />
        <CalculatorSection />
        <Outcomes />
        <How />
        <Guarantee />
        <Price />
        <Testimonials />
        <About />
        <Questions />
        <Final finalRef={finalRef} />
      </main>
      <Footer link={r.footerHome} />
      <StickyBar show={!heroVisible && !finalVisible} />
    </>
  )
}
