import { useRef, useState } from 'react'
import { contact, kura } from '../data/content'
import KuraRecordScene from './KuraRecordScene'
import PillButton from './PillButton'
import RollText from './RollText'
import { RING_COLORS } from '../lib/palette'
import { openContact } from '../lib/contactEvents'
import { reducedMotion, scrollToTarget } from '../lib/motion'
import { useMediaQuery, useScrollProgress, useStills } from '../lib/scene'

const STAGE_AT = [0.2, 0.37, 0.55, 0.73, 0.93]
const STILLS = [0.03, 0.2, 0.37, 0.55, 0.73, 0.93]

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

  useScrollProgress(ref, pin, (v) => {
    target.current = v
  })
  useStills(
    !pin,
    STILLS,
    (v) => {
      target.current = v
    },
    1500,
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

  const bar = (
    <ol className="grid grid-cols-5 border-t border-white/40">
      {kura.steps.map((s, i) => {
        const on = stage === i
        return (
          <li key={s.name} className={`min-w-0 border-r border-white/15 last:border-r-0 ${on ? 'bg-white text-[#0a0a0a]' : ''}`}>
            <button
              type="button"
              onClick={() => jumpTo(i)}
              aria-current={on ? 'step' : undefined}
              className="relative grid w-full gap-1 px-2.5 py-3 text-left md:px-4 md:py-4"
            >
              <span className="absolute inset-x-0 -top-px h-[3px]" style={{ background: on ? RING_COLORS[i] : 'transparent' }} aria-hidden="true" />
              <span className={`type-label flex items-center gap-1.5 ${on ? 'text-[#0a0a0a]/75' : 'text-white/70'}`}>
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: RING_COLORS[i] }} aria-hidden="true" />
                0{i + 1}
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
      <span className="type-label">
        Record 0{stage + 1} / 05 · {kura.steps[stage]?.name}
      </span>
      <span className="type-label text-white/70">{kura.exampleLabel}</span>
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
              className={`absolute bottom-5 right-5 w-[min(380px,90%)] transition-all duration-500 md:right-10 ${stage === 4 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
              aria-hidden={stage !== 4}
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
