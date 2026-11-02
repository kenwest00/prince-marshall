import { contact, kuraSwitching as s } from '../data/content'
import LogoTile from '../components/LogoTile'
import SectionHead from '../components/SectionHead'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
import Contact from '../sections/Contact'
import Footer from '../sections/Footer'
import { useFadeItems } from '../lib/motion'
import { openContact } from '../lib/contactEvents'

const section = 'hairline-t px-5 py-20 md:px-10 md:py-32'
const offset = 'md:ml-[264px]'
const ask = () => openContact(contact.form.topicOptions[1])

function Header() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#0a0a0a] bg-white px-5 py-3 md:px-10">
      <a href="../../" data-page-link className="flex items-center gap-3" aria-label="prince + marshall home">
        <LogoTile size={40} />
        <span className="type-label hidden sm:inline">prince + marshall</span>
      </a>
      <a href="../" data-page-link className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
        All about KÜRA
      </a>
    </header>
  )
}

function Steps() {
  const ref = useFadeItems<HTMLOListElement>()
  const steps = s.steps.filter((x) => x.verified)
  if (!steps.length) return null
  return (
    <section aria-labelledby="steps-h" className={section}>
      <SectionHead id="steps-h" eyebrow={s.stepsEyebrow} heading={s.stepsHeading} />
      <ol ref={ref} className={`${offset} border-t border-[#0a0a0a]`}>
        {steps.map((x, i) => (
          <li key={x.title} className="fade-item grid grid-cols-[3rem_1fr] gap-x-4 border-b border-[#0a0a0a]/20 py-6">
            <span className="type-label pt-1 text-[#0a0a0a]/70">0{i + 1}</span>
            <div>
              <h3 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{x.title}</h3>
              <p className="mt-3 max-w-xl font-semibold leading-snug text-[#0a0a0a]/80">{x.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Compare() {
  const ref = useFadeItems<HTMLOListElement>()
  const rows = s.rows.filter((r) => r.verified)
  if (!rows.length) return null
  return (
    <section aria-labelledby="compare-h" className={section}>
      <SectionHead id="compare-h" eyebrow={s.compareEyebrow} heading={s.compareHeading} intro={s.compareIntro} />
      <div className={offset}>
        <ol ref={ref} className="border-t border-[#0a0a0a]">
          {rows.map((r, i) => (
            <li key={r.topic} className="fade-item border-b border-[#0a0a0a]/20 py-8 md:py-10">
              <div className="grid grid-cols-[3rem_1fr] gap-x-4">
                <span className="type-label pt-2 text-[#0a0a0a]/70">0{i + 1}</span>
                <h3 className="font-display text-2xl leading-[1.05] tracking-[-0.02em] md:text-4xl">{r.topic}</h3>
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-6 md:ml-[4rem] md:grid-cols-2 md:gap-10">
                <div>
                  <dt className="type-label text-[#0a0a0a]/70">{s.pastperfectLabel}</dt>
                  <dd className="mt-2 font-semibold leading-snug text-[#0a0a0a]/80">
                    {r.pastperfect}
                    {r.source && (
                      <>
                        {' '}
                        <a href={r.source} rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">
                          {s.sourceLabel}
                        </a>
                      </>
                    )}
                  </dd>
                </div>
                <div className="border-l-4 border-[#c8ff2e] pl-4">
                  <dt className="type-label">{s.kuraLabel}</dt>
                  <dd className="mt-2 text-lg font-bold leading-snug">{r.kura}</dd>
                </div>
              </dl>
              <p className="mt-6 max-w-3xl font-semibold leading-snug md:ml-[4rem]">
                <span className="type-label mr-2 text-[#0a0a0a]/70">{s.mattersLabel}</span>
                {r.matters}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-sm font-semibold text-[#0a0a0a]/75">
          {s.asOfLabel}: {s.asOf}. {s.compareNote}
        </p>
      </div>
    </section>
  )
}

function Keep() {
  const items = s.keep.filter((x) => x.verified)
  if (!items.length) return null
  return (
    <section aria-labelledby="keep-h" className={section}>
      <SectionHead id="keep-h" eyebrow={s.keepEyebrow} heading={s.keepHeading} intro={s.keepIntro} />
      <ul className={`${offset} border-t border-[#0a0a0a]`}>
        {items.map((i) => (
          <li key={i.title} className="border-b border-[#0a0a0a]/20 py-5 text-lg font-semibold leading-snug md:text-xl">
            <strong className="font-extrabold">{i.title}:</strong> {i.body}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function SwitchingPage() {
  return (
    <>
      <a href="#main" className="fixed left-3 top-3 z-[80] -translate-y-20 bg-[#0a0a0a] px-4 py-3 text-sm font-bold text-white focus:translate-y-0">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <section aria-labelledby="sw-h1" className="bg-[#0a0a0a] px-5 pb-12 pt-12 text-white md:px-10 md:pb-16 md:pt-20">
          <p className="type-label inline-flex items-center gap-2 border border-white/50 px-3 py-1.5">
            <span className="signal-dot signal-dot--on-dark" aria-hidden="true" />
            {s.label}
          </p>
          <h1 id="sw-h1" className="mt-6 max-w-[16ch] font-display text-[clamp(2.6rem,8vw,7.5rem)] leading-[0.92] tracking-[-0.04em]">
            {s.h1}
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-semibold leading-snug text-white/85 md:text-2xl">{s.sub}</p>
          <div className="mt-8">
            <PillButton
              inverted
              href="#contact"
              onClick={(e) => {
                e?.preventDefault()
                ask()
              }}
            >
              <RollText text={s.cta} />
            </PillButton>
          </div>
        </section>

        <Compare />
        <Keep />
        <Steps />

        <section aria-labelledby="sw-cta-h" className={section}>
          <SectionHead id="sw-cta-h" eyebrow="Next step" heading={s.ctaHeading} intro={s.ctaBody} />
          <div className={offset}>
            <PillButton
              href="#contact"
              onClick={(e) => {
                e?.preventDefault()
                ask()
              }}
            >
              <RollText text={s.cta} />
            </PillButton>
          </div>
        </section>
        <Contact defaultTopic={contact.form.topicOptions[1]} />
      </main>
      <Footer link={s.footerHome} />
    </>
  )
}
