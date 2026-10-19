import { useEffect, useRef, useState } from 'react'
import { contact, kura } from '../data/content'
import KuraRecordScene from './KuraRecordScene'
import PillButton from './PillButton'
import RollText from './RollText'
import { RING_COLORS } from '../lib/palette'
import { openContact } from '../lib/contactEvents'
import { reducedMotion, scrollToTarget } from '../lib/motion'
import { useMediaQuery, useScrollProgress, useStills } from '../lib/scene'

/** stage 0 = before KURA (the ledger), 1-5 = the five parts of the record */
const STAGE_AT = [0.04, 0.22, 0.38, 0.55, 0.73, 0.93]
const STILLS = [0.04, 0.22, 0.38, 0.55, 0.73, 0.93]
const RED = '#ff5a4e'

/**
 * KURA "from notebook to record": pinned scroll scene on desktop, timed still
 * frames on phones and under reduced motion. The calls to action live inside
 * the scene; the record bar and the record card are real HTML.
 */
export default function KuraSceneBlock({ pinVh = 400 }: { pinVh?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const pin = isDesktop && !reducedMotion
  const target = useRef(0)
  const [stage, setStage] = useState(0)
  // Phones: start the still frames only once the scene is actually on screen.
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (pin || seen) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [pin, seen])

  useScrollProgress(ref, pin, (v) => {
    target.current = v
  })
  useStills(
    !pin && seen,
    STILLS,
    (v) => {
      target.current = v
    },
    2000,
  )

  const jumpTo = (i: number) => {
    if (!pin) {
      target.current = STAGE_AT[i]
      return
    }
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    scrollToTarget(top + STAGE_AT[i] * (el.offsetHeight - window.innerHeight))
  }

  const ctas = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <PillButton
        inverted
        href="#contact"
        onClick={(e) => {
          e?.preventDefault()
          openContact(contact.form.topicOptions[1])
        }}
      >
        <RollText text={kura.cta} />
      </PillButton>
      {kura.starterEnabled && (
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            openContact('KURA starter import')
          }}
          className="type-label inline-flex min-h-[44px] items-center text-white underline underline-offset-4 hover:no-underline"
        >
          {kura.starter} <span aria-hidden="true" className="ml-1">→</span>
        </a>
      )}
    </div>
  )

  const cells = [{ ...kura.before, color: RED, num: '00' }, ...kura.steps.map((s, i) => ({ ...s, color: RING_COLORS[i], num: `0${i + 1}` }))]
  const bar = (
    <ol className="grid grid-cols-6 border-t border-white/40">
      {cells.map((s, i) => {
        const on = stage === i
        return (
          <li key={s.name} className={`min-w-0 border-r border-white/15 last:border-r-0 ${on ? 'bg-white text-[#0a0a0a]' : ''}`}>
            <button
              type="button"
              onClick={() => jumpTo(i)}
              aria-current={on ? 'step' : undefined}
              className="relative grid w-full gap-1 px-2.5 py-3 text-left md:px-4 md:py-4"
            >
              <span className="absolute inset-x-0 -top-px h-[3px]" style={{ background: on ? s.color : 'transparent' }} aria-hidden="true" />
              <span className={`type-label flex items-center gap-1.5 ${on ? 'text-[#0a0a0a]/75' : 'text-white/70'}`}>
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                {i === 0 ? (
                  <>
                    <span className="hidden truncate md:inline">{kura.beforeLabel}</span>
                    <span className="md:hidden">{s.num}</span>
                  </>
                ) : (
                  s.num
                )}
              </span>
              <span className="font-display text-sm leading-none tracking-[-0.02em] md:hidden">{s.short}</span>
              <span className="hidden font-display text-xl leading-none tracking-[-0.02em] md:block lg:text-2xl">{s.name}</span>
              <span className={`hidden text-sm font-semibold leading-snug lg:block ${on ? 'text-[#0a0a0a]/75' : 'text-white/70'}`}>{s.line}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )

  const card = (
    <div className="border border-white/40 bg-[#0a0a0a]/90 p-4 md:p-5">
      <p className="type-label text-white/70">{kura.exampleLabel}</p>
      <dl className="mt-3 grid gap-2.5">
        {kura.card.map((row, i) => (
          <div key={row.label} className="grid grid-cols-[1fr] gap-0.5">
            <dt className="type-label flex items-center gap-2 text-white/75">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: RING_COLORS[i] }} aria-hidden="true" />
              {row.label}
            </dt>
            <dd className="text-sm font-semibold leading-snug text-white">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )

  const readout = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {stage === 0 ? (
        <span className="type-label inline-flex items-center gap-2" style={{ color: RED }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: RED }} aria-hidden="true" />
          {kura.beforeLabel} · {kura.before.name}
        </span>
      ) : (
        <span className="type-label">
          {kura.afterLabel} · Record 0{stage} / 05 · {kura.steps[stage - 1]?.name}
        </span>
      )}
      <span className="type-label text-white/70">{kura.exampleLabel}</span>
    </div>
  )

  const statement = (
    <div className="max-w-xl">
      <p className="font-display text-[clamp(1.4rem,2.6vw,2.4rem)] leading-[1.02] tracking-[-0.03em]">{kura.beforeStatement}</p>
      <p className="type-label mt-3 text-white/70">{kura.beforeHint} ↓</p>
    </div>
  )

  if (pin) {
    return (
      <div ref={ref} className="relative" style={{ height: `${pinVh}vh` }}>
        <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
          <div className="relative min-h-0 flex-1">
            <KuraRecordScene target={target} copy={kura.scene} onStage={setStage} label={kura.sceneLabel} />
            <div className="absolute left-0 top-0 grid gap-4 px-5 pt-6 md:px-10">
              {readout}
              {ctas}
            </div>
            <div
              className={`absolute bottom-6 left-5 transition-all duration-500 md:left-10 ${stage === 0 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
              aria-hidden={stage !== 0}
            >
              {statement}
            </div>
            <div
              className={`absolute bottom-5 right-5 w-[min(380px,90%)] transition-all duration-500 md:right-10 ${stage === 5 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
              aria-hidden={stage !== 5}
            >
              {card}
            </div>
          </div>
          {bar}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <div className="px-5 pb-6">
        {statement}
        <ol className="mt-5 grid gap-2">
          {kura.scene.problems.map((pr, i) => (
            <li key={pr.text} className="flex items-start gap-3 text-sm font-semibold leading-snug text-white/85">
              <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-[#0a0a0a]" style={{ background: RED }} aria-hidden="true">
                {i + 1}
              </span>
              {pr.text}
            </li>
          ))}
        </ol>
      </div>
      <div className="relative aspect-[4/5] max-h-[75svh] w-full">
        <KuraRecordScene target={target} copy={kura.scene} onStage={setStage} label={kura.sceneLabel} />
        <div className="absolute inset-x-0 top-0 px-5 pt-4">{readout}</div>
      </div>
      {bar}
      <div className="grid gap-6 px-5 py-8">
        {ctas}
        {card}
      </div>
    </div>
  )
}
