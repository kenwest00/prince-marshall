import { useEffect, useRef, useState } from 'react'
import { systems as s, type SystemsAudience } from '../data/content'
import LogoTile from '../components/LogoTile'
import SectionHead from '../components/SectionHead'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
import Contact from '../sections/Contact'
import Footer from '../sections/Footer'
import WeekScene from '../components/systems/WeekScene'
import MessScene from '../components/systems/MessScene'
import { MESS_BOUNDS, WEEK_BOUNDS } from '../components/systems/bounds'
import { SIGNAL } from '../lib/palette'
import { reducedMotion, useFadeItems } from '../lib/motion'
import { openContact } from '../lib/contactEvents'
import { clamp01, useMediaQuery, useScrollProgress, useSegmentFlex } from '../lib/scene'

const section = 'hairline-t px-5 py-20 md:px-10 md:py-32'
const offset = 'md:ml-[264px]'
const book = () => openContact(s.topic)

/** Fractional stage (0 = first) from scroll progress and the scene's stage bounds. */
const fracStage = (p: number, bounds: number[]) => {
  const n = bounds.length - 1
  for (let i = 0; i < n; i++) if (p < bounds[i + 1]) return i + clamp01((p - bounds[i]) / (bounds[i + 1] - bounds[i]))
  return n
}

/** Hero visual: a week of hours where some turn red (lost) and then lime (back), on a loop. */
function HeroWeek() {
  const lost = [3, 8, 12, 17, 21, 26, 31, 34, 38, 43, 46, 49]
  return (
    <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden="true">
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 50 }, (_, i) => {
          const k = lost.indexOf(i)
          return (
            <span
              key={i}
              className={`block h-7 w-14 xl:h-9 xl:w-[4.5rem] ${k >= 0 && !reducedMotion ? 'pm-hour' : ''}`}
              style={{ background: 'rgba(10,10,10,0.06)', animationDelay: k >= 0 ? `${k * 0.18}s` : undefined }}
            />
          )
        })}
      </div>
      <p className="type-label mt-3 flex items-center gap-4 text-[#0a0a0a]/60">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 bg-[#ff5a4e]" />Lost to busywork</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5" style={{ background: SIGNAL, outline: '1px solid #0a0a0a' }} />Back to you</span>
      </p>
    </div>
  )
}

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
          book()
        }}
        className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline"
      >
        {s.cta}
      </a>
    </header>
  )
}

/** A pinned, scroll-driven scene with a filling segment bar. Static final frame under reduced motion. */
function ScrollStage({
  pinVh,
  bounds,
  names,
  children,
  side,
  dark = false,
}: {
  pinVh: number
  bounds: number[]
  names: string[]
  children: (target: React.MutableRefObject<number>, setStage: (i: number) => void) => React.ReactNode
  side?: (stage: number) => React.ReactNode
  dark?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const target = useRef(reducedMotion ? 1 : 0)
  const [stage, setStage] = useState(reducedMotion ? names.length - 1 : 0)
  useScrollProgress(ref, !reducedMotion, (v) => {
    target.current = v
  })
  const segRef = useRef<HTMLOListElement>(null)
  useSegmentFlex(segRef, () => fracStage(target.current, bounds), 3)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const bar = (
    <ol ref={segRef} className="flex gap-1" aria-hidden="true">
      {names.map((n) => (
        <li key={n} className="min-w-0 basis-0" style={{ flexGrow: 1 }}>
          <span className={`relative block h-[3px] w-full overflow-hidden ${dark ? 'bg-white/20' : 'bg-[#0a0a0a]/15'}`}>
            <span data-fill className="absolute inset-0 origin-left scale-x-0" style={{ background: dark ? SIGNAL : '#0a0a0a' }} />
          </span>
        </li>
      ))}
    </ol>
  )
  const readout = (
    <p className="type-label">
      <span style={{ color: dark ? SIGNAL : undefined }} className={dark ? '' : 'text-[#0a0a0a]/60'}>
        0{stage + 1} / 0{names.length}
      </span>{' '}
      · {names[stage]}
    </p>
  )

  if (reducedMotion) {
    return (
      <div ref={ref}>
        <div className="px-5 md:px-10">{readout}</div>
        <div className="relative h-[70svh]">{children(target, setStage)}</div>
        {side && <div className="px-5 pb-10 md:px-10">{side(stage)}</div>}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative" style={{ height: `${pinVh}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="grid gap-2 px-5 pt-5 md:px-10 md:pt-8">
          {readout}
          {bar}
        </div>
        {isDesktop && side ? (
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(300px,0.8fr)_2fr]">
            <div className="flex flex-col justify-center px-10">{side(stage)}</div>
            <div className="relative min-h-0">{children(target, setStage)}</div>
          </div>
        ) : (
          <>
            <div className="relative min-h-0 flex-1">{children(target, setStage)}</div>
            {side && <div className="shrink-0 px-5 pb-6">{side(stage)}</div>}
          </>
        )}
      </div>
    </div>
  )
}

function Calculator({ audience }: { audience: SystemsAudience }) {
  const c = s.calc
  const d = c.defaults[audience]
  const [hours, setHours] = useState(d.hours)
  const [people, setPeople] = useState(d.people)
  const [rate, setRate] = useState(d.rate)
  const [lastAudience, setLastAudience] = useState(audience)
  if (lastAudience !== audience) {
    setLastAudience(audience)
    setHours(d.hours)
    setPeople(d.people)
    setRate(d.rate)
  }
  const value = hours * people * rate * 48
  const [shown, setShown] = useState(value)
  const shownRef = useRef(value)
  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    const tick = () => {
      shownRef.current += (value - shownRef.current) * 0.15
      if (Math.abs(value - shownRef.current) < 1) shownRef.current = value
      setShown(shownRef.current)
      if (shownRef.current !== value) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  const slider = (labelText: string, v: number, set: (n: number) => void, min: number, max: number, step: number, fmt: (n: number) => string) => (
    <label className="block border-t border-[#0a0a0a]/20 py-5">
      <span className="flex items-baseline justify-between gap-4">
        <span className="font-semibold leading-snug">{labelText}</span>
        <span className="font-display text-2xl tabular-nums tracking-[-0.02em]">{fmt(v)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => set(Number(e.target.value))}
        className="mt-3 w-full accent-[#0a0a0a]"
      />
    </label>
  )
  return (
    <div className={`${offset} grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16`}>
      <div>
        {slider(c.hoursLabel, hours, setHours, 1, 30, 1, (n) => `${n}h`)}
        {slider(c.peopleLabel, people, setPeople, 1, audience === 'enterprise' ? 500 : 100, 1, (n) => String(n))}
        {slider(c.rateLabel, rate, setRate, 20, 250, 5, (n) => `$${n}`)}
      </div>
      <div className="flex flex-col justify-between bg-[#0a0a0a] p-6 text-white md:p-8" aria-live="polite">
        <p className="type-label text-white/70">{c.resultLabel}</p>
        <p className="mt-4 font-display text-[clamp(3rem,8vw,6.5rem)] leading-none tracking-[-0.04em] tabular-nums" style={{ color: SIGNAL }}>
          ${Math.round(reducedMotion ? value : shown).toLocaleString('en-US')}
        </p>
        <p className="mt-3 text-lg font-bold">
          {(hours * people * 48).toLocaleString('en-US')} hours a year
        </p>
        <p className="mt-6 text-sm font-semibold text-white/70">{c.note}</p>
      </div>
    </div>
  )
}

export default function SystemsPage() {
  const [audience, setAudience] = useState<SystemsAudience>('team')
  const [payoff, setPayoff] = useState(false)
  const painsRef = useFadeItems<HTMLUListElement>()
  const whyRef = useFadeItems<HTMLUListElement>()
  const examples = s.examples.items.filter((e) => e.for.includes(audience))
  const offers = [...s.offers.items].sort((a, b) => (a.id === (audience === 'enterprise' ? 'enterprise' : 'small') ? -1 : b.id === (audience === 'enterprise' ? 'enterprise' : 'small') ? 1 : 0))
  const faq = s.faq.items.filter((f) => f.for.includes(audience))

  const cta = (inverted = false) => (
    <PillButton
      inverted={inverted}
      href="#contact"
      onClick={(e) => {
        e?.preventDefault()
        book()
      }}
    >
      <RollText text={s.cta} />
    </PillButton>
  )

  return (
    <>
      <a href="#main" className="fixed left-3 top-3 z-[80] -translate-y-20 bg-[#0a0a0a] px-4 py-3 text-sm font-bold text-white focus:translate-y-0">
        Skip to content
      </a>
      <Header />
      <main id="main">
        {/* Hero */}
        <section aria-labelledby="sys-h1" className="relative overflow-hidden px-5 pb-16 pt-12 md:px-10 md:pb-24 md:pt-20">
          <HeroWeek />
          <p className="type-label inline-flex items-center gap-2 border border-[#0a0a0a] px-3 py-1.5">
            <span className="inline-block h-2 w-2" style={{ background: SIGNAL, outline: '1px solid #0a0a0a' }} aria-hidden="true" />
            {s.label}
          </p>
          <h1 id="sys-h1" className="relative mt-8 max-w-[12ch] type-hero lg:max-w-[9ch]">
            {s.h1}
          </h1>
          <p className="relative mt-8 max-w-2xl text-lg font-semibold leading-snug text-[#0a0a0a]/85 md:text-2xl lg:max-w-[46%]">{s.sub}</p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            {cta()}
            <a href="#week" className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
              {s.seeHow} <span aria-hidden="true" className="ml-1">↓</span>
            </a>
          </div>
        </section>

        {/* Scene 1: your week */}
        <section id="week" aria-labelledby="week-h" className="hairline-t">
          <div className="px-5 pt-16 md:px-10 md:pt-24">
            <SectionHead id="week-h" eyebrow={s.week.eyebrow} heading={s.week.heading} />
          </div>
          <ScrollStage
            pinVh={420}
            bounds={WEEK_BOUNDS}
            names={s.week.stages.map((x) => x.name)}
            side={(st) => (
              <div className="relative">
                <p className="font-display text-[clamp(1.5rem,2.6vw,2.6rem)] leading-[1.02] tracking-[-0.03em]">{s.week.stages[st]?.line}</p>
                <div className={`mt-5 transition-all duration-700 ${payoff ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`} aria-hidden={!payoff}>
                  <p className="text-lg font-bold">{s.week.payoff}</p>
                  <p className="mt-1 inline-block px-2 font-display text-[clamp(1.6rem,2.8vw,2.8rem)] leading-tight tracking-[-0.03em]" style={{ background: SIGNAL }}>
                    {s.week.payoffQuestion}
                  </p>
                </div>
                <p className="type-label mt-6 text-[#0a0a0a]/55">{s.week.exampleNote}</p>
              </div>
            )}
          >
            {(target, setStage) => (
              <WeekScene
                target={target}
                days={s.week.days}
                leaks={s.week.leaks}
                lostLabel={s.week.lostLabel}
                backLabel={s.week.backLabel}
                systemLabel={s.week.systemLabel}
                keptLabel={s.week.keptLabel}
                label={s.week.label}
                onStage={setStage}
                onPayoff={setPayoff}
              />
            )}
          </ScrollStage>
        </section>

        {/* Pains */}
        <section aria-labelledby="pains-h" className="bg-[#0a0a0a] px-5 py-20 text-white md:px-10 md:py-32">
          <p id="pains-h" className="type-label" style={{ color: SIGNAL }}>
            {s.pains.eyebrow}
          </p>
          <ul ref={painsRef} className="mt-8 grid grid-cols-1 border-t border-white/30 md:grid-cols-2">
            {s.pains.items.map((x) => (
              <li key={x.quote} className="fade-item border-b border-white/20 py-8 md:pr-10 md:[&:nth-child(odd)]:border-r md:[&:nth-child(even)]:pl-10">
                <p className="type-label text-white/55">{x.who}</p>
                <p className="mt-3 font-display text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.02] tracking-[-0.03em]">“{x.quote}”</p>
              </li>
            ))}
          </ul>
          <p className="mt-14 max-w-4xl font-display text-[clamp(2rem,4.6vw,4.25rem)] leading-[0.98] tracking-[-0.035em]">{s.pains.bridge}</p>
        </section>

        {/* Fork + calculator */}
        <section aria-labelledby="fork-h" className={section}>
          <SectionHead id="fork-h" eyebrow={s.fork.eyebrow} heading={s.fork.heading} />
          <div className={`${offset} grid grid-cols-1 gap-3 md:grid-cols-3`} role="radiogroup" aria-label={s.fork.eyebrow}>
            {s.fork.options.map((o) => {
              const on = audience === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setAudience(o.id)}
                  className={`border p-5 text-left transition-colors duration-300 ${on ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white' : 'border-[#0a0a0a]/30 hover:border-[#0a0a0a]'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 border border-current" style={{ background: on ? SIGNAL : 'transparent' }} aria-hidden="true" />
                    <span className="font-display text-2xl leading-none tracking-[-0.02em]">{o.label}</span>
                  </span>
                  <span className={`mt-3 block font-semibold leading-snug ${on ? 'text-white/80' : 'text-[#0a0a0a]/75'}`}>{o.line}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-20">
            <SectionHead eyebrow={s.calc.eyebrow} heading={s.calc.heading} />
            <Calculator audience={audience} />
          </div>
        </section>

        {/* Scene 2: mess to one line */}
        <section aria-labelledby="method-h" className="hairline-t">
          <div className="px-5 pt-16 md:px-10 md:pt-24">
            <SectionHead id="method-h" eyebrow={s.method.eyebrow} heading={s.method.heading} />
          </div>
          <ScrollStage
            pinVh={380}
            bounds={MESS_BOUNDS}
            names={['Today', ...s.method.steps.map((x) => x.name)]}
            side={(st) => {
              const step = s.method.steps[st - 1]
              if (!step)
                return (
                  <p className="font-display text-[clamp(1.5rem,2.6vw,2.6rem)] leading-[1.02] tracking-[-0.03em]">
                    One request. Twelve hand-offs. Most of them back and forth.
                  </p>
                )
              return (
                <div>
                  <p className="type-label text-[#0a0a0a]/60">
                    {step.name} · {step.time}
                  </p>
                  <p className="mt-2 text-base font-semibold leading-snug text-[#0a0a0a]/85 md:text-lg">{step.what}</p>
                  <p className="mt-4 flex items-baseline gap-2 border-t border-[#0a0a0a]/20 pt-3 font-bold">
                    <span className="type-label shrink-0 px-1.5" style={{ background: SIGNAL }}>
                      You get
                    </span>
                    {step.get}
                  </p>
                </div>
              )
            }}
          >
            {(target, setStage) => <MessScene target={target} nodes={s.method.nodes} label={s.method.label} onStage={setStage} />}
          </ScrollStage>
        </section>

        {/* Examples */}
        <section aria-labelledby="ex-h" className={section}>
          <SectionHead id="ex-h" eyebrow={s.examples.eyebrow} heading={s.examples.heading} />
          <ul className={`${offset} grid grid-cols-1 gap-px border border-[#0a0a0a] bg-[#0a0a0a] md:grid-cols-2`}>
            {examples.map((x) => (
              <li key={x.title} className="grid gap-4 bg-white p-6 md:p-8">
                <h3 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{x.title}</h3>
                <p className="grid grid-cols-[4.5rem_1fr] gap-3 font-semibold leading-snug text-[#0a0a0a]/70">
                  <span className="type-label pt-0.5 text-[#ff5a4e]">Before</span>
                  {x.before}
                </p>
                <p className="grid grid-cols-[4.5rem_1fr] gap-3 font-bold leading-snug">
                  <span className="type-label self-start px-1.5 py-0.5" style={{ background: SIGNAL }}>
                    After
                  </span>
                  {x.after}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Offers */}
        <section aria-labelledby="offers-h" className="bg-[#0a0a0a] px-5 py-20 text-white md:px-10 md:py-32">
          <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-[200px_1fr] md:gap-16 md:pb-16">
            <p className="type-label" style={{ color: SIGNAL }}>
              {s.offers.eyebrow}
            </p>
            <h2 id="offers-h" className="font-display text-[clamp(2.25rem,5.2vw,5rem)] leading-[0.98] tracking-[-0.03em]">
              {s.offers.heading}
            </h2>
          </div>
          <div className={`${offset} grid grid-cols-1 gap-6 lg:grid-cols-2`}>
            {offers.map((o, i) => (
              <article key={o.id} className={`flex flex-col p-6 md:p-8 ${i === 0 ? 'bg-white text-[#0a0a0a]' : 'border border-white/40'}`}>
                <p className={`type-label ${i === 0 ? 'text-[#0a0a0a]/60' : 'text-white/60'}`}>{o.for}</p>
                <h3 className="mt-3 font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-[0.95] tracking-[-0.035em]">{o.name}</h3>
                <p className={`mt-4 text-lg font-bold leading-snug ${i === 0 ? '' : 'text-white/90'}`}>{o.promise}</p>
                <ul className="mt-6 grid gap-2.5">
                  {o.stack.map((x) => (
                    <li key={x} className="flex gap-3 font-semibold leading-snug">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0" style={{ background: SIGNAL, outline: i === 0 ? '1px solid #0a0a0a' : undefined }} aria-hidden="true" />
                      <span className={i === 0 ? 'text-[#0a0a0a]/85' : 'text-white/85'}>{x}</span>
                    </li>
                  ))}
                </ul>
                <div className={`mt-auto pt-8 ${i === 0 ? '' : ''}`}>
                  <p className={`border-t pt-4 font-bold ${i === 0 ? 'border-[#0a0a0a]/20' : 'border-white/25'}`}>{o.price}</p>
                  <p className={`mt-3 flex gap-2 text-sm font-semibold ${i === 0 ? 'text-[#0a0a0a]/75' : 'text-white/75'}`}>
                    <span aria-hidden="true">✓</span>
                    {o.guarantee}
                  </p>
                  {o.id === 'small' && s.offers.timeBackGuarantee && <p className="mt-2 text-sm font-bold">{s.offers.timeBackGuarantee}</p>}
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    {cta(i !== 0)}
                    {o.tradesLink && (
                      <a href={o.tradesLink.href} data-page-link className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
                        {o.tradesLink.label} <span aria-hidden="true" className="ml-1">→</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {s.offers.capacity && <p className={`${offset} mt-8 font-bold text-white/80`}>{s.offers.capacity}</p>}
        </section>

        {/* Why */}
        <section aria-labelledby="why-h" className={section}>
          <SectionHead id="why-h" eyebrow={s.why.eyebrow} heading={s.why.heading} />
          <ul ref={whyRef} className={`${offset} grid grid-cols-1 border-t border-[#0a0a0a] md:grid-cols-2`}>
            {s.why.items.map((x) => (
              <li key={x.title} className="fade-item border-b border-[#0a0a0a]/20 py-6 md:pr-10 md:[&:nth-child(odd)]:border-r md:[&:nth-child(even)]:pl-10">
                <h3 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{x.title}</h3>
                <p className="mt-3 max-w-xl font-semibold leading-snug text-[#0a0a0a]/80">{x.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section aria-labelledby="sfaq-h" className={section}>
          <SectionHead id="sfaq-h" eyebrow={s.faq.eyebrow} heading={s.faq.heading} />
          <div className={offset}>
            {faq.map((item) => (
              <details key={item.q} className="group border-t border-[#0a0a0a]/30 last:border-b">
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

        {/* Final */}
        <section aria-labelledby="sfinal-h" className="bg-[#0a0a0a] px-5 py-20 text-white md:px-10 md:py-28">
          <h2 id="sfinal-h" className="max-w-[16ch] font-display text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.035em]">
            {s.final.heading}
          </h2>
          <p className="mt-6 max-w-2xl text-lg font-semibold text-white/80 md:text-xl">{s.final.sub}</p>
          <div className="mt-10">{cta(true)}</div>
        </section>
        <Contact defaultTopic={s.topic} />
      </main>
      <Footer link={s.footerHome} />
    </>
  )
}
