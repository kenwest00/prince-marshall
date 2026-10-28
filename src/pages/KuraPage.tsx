import { contact, kura, kuraPage as k } from '../data/content'
import LogoTile from '../components/LogoTile'
import SectionHead from '../components/SectionHead'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
import KuraSceneBlock from '../components/KuraSceneBlock'
import Contact from '../sections/Contact'
import Footer from '../sections/Footer'
import { RING_COLORS } from '../lib/palette'
import { useFadeItems } from '../lib/motion'
import { openContact } from '../lib/contactEvents'

const section = 'hairline-t px-5 py-20 md:px-10 md:py-32'
const offset = 'md:ml-[264px]'
const walkthrough = () => openContact(contact.form.topicOptions[1])

function Header() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#0a0a0a] bg-white px-5 py-3 md:px-10">
      <div className="flex items-center gap-4 md:gap-6">
        <a href="../" data-page-link className="flex items-center gap-3" aria-label="prince + marshall home">
          <LogoTile size={40} />
          <span className="type-label hidden sm:inline">prince + marshall</span>
        </a>
        <a href="../#studio" data-page-link className="type-label inline-flex min-h-[44px] items-center text-[#0a0a0a]/70 underline-offset-4 hover:text-[#0a0a0a] hover:underline">
          Studio
        </a>
      </div>
      <a
        href="#contact"
        onClick={(e) => {
          e.preventDefault()
          walkthrough()
        }}
        className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline"
      >
        {kura.cta}
      </a>
    </header>
  )
}

function List({ items }: { items: { title: string; body: string }[] }) {
  const ref = useFadeItems<HTMLUListElement>()
  return (
    <ul ref={ref} className={`${offset} border-t border-[#0a0a0a]`}>
      {items.map((i) => (
        <li key={i.title} className="fade-item border-b border-[#0a0a0a]/20 py-5 text-lg font-semibold leading-snug md:text-xl">
          <strong className="font-extrabold">{i.title}:</strong> {i.body}
        </li>
      ))}
    </ul>
  )
}

function Survey() {
  const ref = useFadeItems<HTMLOListElement>()
  return (
    <ol ref={ref} className={`${offset} grid grid-cols-1 border-t border-[#0a0a0a] md:grid-cols-2`}>
      {k.service.survey.map((s, i) => (
        <li
          key={s.title}
          className="fade-item grid grid-cols-[3rem_1fr] gap-x-4 border-b border-[#0a0a0a]/20 py-6 md:pr-10 md:[&:nth-child(even)]:pl-10 md:[&:nth-child(odd)]:border-r"
        >
          <span className="type-label pt-1 text-[#0a0a0a]/70">0{i + 1}</span>
          <div>
            <h3 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{s.title}</h3>
            <p className="mt-3 max-w-xl font-semibold leading-snug text-[#0a0a0a]/80">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Plans() {
  const ref = useFadeItems<HTMLDivElement>()
  const p = k.plans
  return (
    <div ref={ref} className={offset}>
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {p.tiers.map((t) => (
          <li
            key={t.name}
            className={`fade-item flex flex-col border border-[#0a0a0a] p-6 md:p-8 ${t.featured ? 'bg-[#0a0a0a] text-white' : 'bg-white'}`}
          >
            <p className={`type-label mb-3 inline-flex min-h-[1rem] items-center gap-2 ${t.featured ? 'text-[#c8ff2e]' : 'invisible'}`} aria-hidden={!t.featured}>
              <span aria-hidden="true" className="h-2 w-2 bg-[#c8ff2e]" />
              Recommended
            </p>
            <h3 className="font-display text-4xl leading-none tracking-[-0.03em] md:text-5xl">{t.name}</h3>
            <p className={`type-label mt-3 ${t.featured ? 'text-white/70' : 'text-[#0a0a0a]/70'}`}>{t.for}</p>
            <ul className={`mt-6 border-t ${t.featured ? 'border-white/40' : 'border-[#0a0a0a]/30'}`}>
              {t.items.map((it) => (
                <li key={it} className={`flex gap-3 border-b py-3 font-semibold leading-snug ${t.featured ? 'border-white/20 text-white/90' : 'border-[#0a0a0a]/15 text-[#0a0a0a]/85'}`}>
                  <span aria-hidden="true" className={`mt-2 h-2 w-2 shrink-0 ${t.featured ? 'bg-[#c8ff2e]' : 'bg-[#0a0a0a]'}`} />
                  {it}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h3 className="type-label mt-14 text-[#0a0a0a]/70">{p.addonsHeading}</h3>
      <ul className="mt-4 border-t border-[#0a0a0a]">
        {p.addons.map((a) => (
          <li key={a.title} className="fade-item border-b border-[#0a0a0a]/20 py-4 text-lg font-semibold leading-snug md:text-xl">
            <strong className="font-extrabold">{a.title}:</strong> {a.body}
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-3xl font-semibold leading-snug text-[#0a0a0a]/75">{p.partnersNote}</p>
      <div className="mt-10">
        <PillButton
          href="#contact"
          onClick={(e) => {
            e?.preventDefault()
            openContact(contact.form.topicOptions[2])
          }}
        >
          <RollText text={p.cta} />
        </PillButton>
      </div>
    </div>
  )
}

export default function KuraPage() {
  const buying = k.buying.filter((b) => b.value)
  return (
    <>
      <a href="#main" className="fixed left-3 top-3 z-[80] -translate-y-20 bg-[#0a0a0a] px-4 py-3 text-sm font-bold text-white focus:translate-y-0">
        Skip to content
      </a>
      <Header />
      <main id="main">
        {/* Hero */}
        <section aria-labelledby="kura-h1" className="bg-[#0a0a0a] px-5 pb-12 pt-12 text-white md:px-10 md:pb-16 md:pt-20">
          <p className="type-label inline-flex items-center gap-2 border border-white/50 px-3 py-1.5">
            <span className="signal-dot signal-dot--on-dark" aria-hidden="true" />
            {k.label}
          </p>
          <h1 id="kura-h1" className="mt-6 max-w-[14ch] font-display text-[clamp(2.9rem,9vw,8.5rem)] leading-[0.92] tracking-[-0.04em]">
            {k.h1}
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-semibold leading-snug text-white/85 md:text-2xl">{k.sub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <PillButton
              inverted
              href="#contact"
              onClick={(e) => {
                e?.preventDefault()
                walkthrough()
              }}
            >
              <RollText text={kura.cta} />
            </PillButton>
            <a href="#record" className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
              {k.seeHow} <span aria-hidden="true" className="ml-1">↓</span>
            </a>
          </div>
        </section>

        {/* Scene */}
        <section id="record" aria-label={kura.sceneLabel} className="bg-[#0a0a0a] text-white">
          <KuraSceneBlock pinVh={400} />
        </section>

        {/* The service */}
        <section id="service" aria-labelledby="service-h" className={section}>
          <SectionHead id="service-h" eyebrow={k.service.eyebrow} heading={k.service.heading} intro={k.service.intro} />
          <Survey />
          <p className={`${offset} mt-8 max-w-2xl text-lg font-bold leading-snug`}>{k.service.imagesNote}</p>
        </section>

        {/* The catalogue */}
        <section id="catalogue" aria-labelledby="catalogue-h" className={section}>
          <SectionHead id="catalogue-h" eyebrow={k.catalogue.eyebrow} heading={k.catalogue.heading} intro={k.catalogue.intro} />
          <div className={`${offset} grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16`}>
            <div>
              <h3 className="type-label text-[#0a0a0a]/70">{k.catalogue.holdsHeading}</h3>
              <ul className="mt-4 border-t border-[#0a0a0a]">
                {k.catalogue.holds.map((h) => (
                  <li key={h} className="flex gap-3 border-b border-[#0a0a0a]/20 py-4 text-lg font-semibold leading-snug">
                    <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 bg-[#0a0a0a]" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="type-label text-[#0a0a0a]/70">{k.catalogue.useHeading}</h3>
              <ul className="mt-4 border-t border-[#0a0a0a]">
                {k.catalogue.uses.map((u) => (
                  <li key={u.title} className="border-b border-[#0a0a0a]/20 py-4 text-lg font-semibold leading-snug">
                    <strong className="font-extrabold">{u.title}:</strong> {u.body}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* What it replaces */}
        <section aria-labelledby="replaces-h" className={section}>
          <SectionHead id="replaces-h" eyebrow={k.replaces.eyebrow} heading={k.replaces.heading} />
          <List items={k.replaces.items} />
        </section>

        {/* Outcomes */}
        <section aria-labelledby="outcomes-h" className={section}>
          <SectionHead id="outcomes-h" eyebrow={k.outcomesEyebrow} heading={k.outcomesHeading} />
          <ul className={`${offset} grid grid-cols-1 border-t border-[#0a0a0a] md:grid-cols-2`}>
            {kura.outcomes.map((o) => (
              <li key={o.title} className="border-b border-[#0a0a0a]/20 py-6 md:pr-10 md:[&:nth-child(odd)]:border-r md:[&:nth-child(even)]:pl-10">
                <h3 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{o.title}</h3>
                <p className="mt-3 max-w-xl font-semibold leading-snug text-[#0a0a0a]/80">{o.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Anatomy */}
        <section aria-labelledby="anatomy-h" className={section}>
          <SectionHead id="anatomy-h" eyebrow={k.anatomyEyebrow} heading={k.anatomyHeading} />
          <ol className={`${offset} border-t border-[#0a0a0a]`}>
            {kura.pillars.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-[#0a0a0a]/20 py-6 md:grid-cols-[4rem_16rem_1fr] md:gap-x-8" style={{ boxShadow: `inset 4px 0 0 ${RING_COLORS[i]}` }}>
                <span className="type-label pl-4 pt-1 text-[#0a0a0a]/70">0{i + 1}</span>
                <h3 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{p.title}</h3>
                <p className="col-span-2 mt-2 font-semibold leading-snug text-[#0a0a0a]/80 md:col-span-1 md:mt-0 md:text-lg">{p.body}</p>
              </li>
            ))}
          </ol>
          {kura.screenshot && (
            <figure className={`${offset} mt-12 border border-[#0a0a0a]`}>
              <img src={`../${kura.screenshot}`} alt={kura.screenshotAlt} loading="lazy" className="block w-full" />
            </figure>
          )}
        </section>

        {/* Who it is for */}
        <section aria-labelledby="who-h" className={section}>
          <SectionHead id="who-h" eyebrow={k.whoEyebrow} heading={k.whoHeading} />
          <List items={k.who} />
        </section>

        {/* Plans */}
        <section id="plans" aria-labelledby="plans-h" className={section}>
          <SectionHead id="plans-h" eyebrow={k.plans.eyebrow} heading={k.plans.heading} />
          <Plans />
        </section>

        {/* Starter offer: hidden until confirmed */}
        {kura.starterEnabled && (
          <section aria-labelledby="starter-h" className={section}>
            <SectionHead id="starter-h" eyebrow="Start small" heading={k.starter.heading} intro={k.starter.body} />
            <div className={offset}>
              <PillButton
                href="#contact"
                onClick={(e) => {
                  e?.preventDefault()
                  openContact('KÜRA starter import')
                }}
              >
                <RollText text={kura.starter} />
              </PillButton>
            </div>
          </section>
        )}

        {/* Pricing + buying */}
        <section aria-labelledby="buying-h" className={section}>
          <SectionHead id="buying-h" eyebrow={k.buyingEyebrow} heading={k.buyingHeading} />
          <div className={offset}>
            <p className="type-label text-[#0a0a0a]/70">{k.pricingEyebrow}</p>
            <p className="mt-2 max-w-2xl text-xl font-bold leading-snug md:text-2xl">{k.pricing || k.pricingFallback}</p>
            <dl className="mt-10 border-t border-[#0a0a0a]">
              {buying.map((b) => (
                <div key={b.label} className="grid grid-cols-1 gap-1 border-b border-[#0a0a0a]/20 py-4 md:grid-cols-[16rem_1fr] md:gap-8">
                  <dt className="type-label pt-1 text-[#0a0a0a]/70">{b.label}</dt>
                  <dd className="text-lg font-semibold leading-snug">{b.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm font-semibold text-[#0a0a0a]/75">{k.buyingNote}</p>
          </div>
        </section>

        {/* FAQ */}
        {k.faq.length > 0 && (
          <section aria-labelledby="kfaq-h" className={section}>
            <SectionHead id="kfaq-h" eyebrow={k.faqEyebrow} heading={k.faqHeading} />
            <div className={offset}>
              {k.faq.map((item) => (
                <details key={item.q} className="group border-t border-[#0a0a0a]/30 last:border-b">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-baseline justify-between gap-6 py-5 text-lg font-extrabold leading-snug tracking-tight md:text-xl [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span aria-hidden="true" className="text-2xl font-bold transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-3xl pb-6 font-semibold leading-snug text-[#0a0a0a]/80">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Final */}
        <section aria-labelledby="kfinal-h" className="bg-[#0a0a0a] px-5 py-20 text-white md:px-10 md:py-28">
          <h2 id="kfinal-h" className="max-w-[16ch] font-display text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.035em]">
            {k.finalHeading}
          </h2>
          <div className="mt-10">
            <PillButton
              inverted
              href="#contact"
              onClick={(e) => {
                e?.preventDefault()
                walkthrough()
              }}
            >
              <RollText text={kura.cta} />
            </PillButton>
          </div>
        </section>
        <Contact defaultTopic={contact.form.topicOptions[1]} />
      </main>
      <Footer link={k.footerHome} />
    </>
  )
}
