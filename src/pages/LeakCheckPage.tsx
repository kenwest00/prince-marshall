import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { site, systems, type SystemsAudience } from '../data/content'
import {
  leakCheck as L,
  SECTIONS,
  buildFlow,
  leakMap,
  labelOf,
  has,
  audienceOf,
  READY_LABEL,
  type Answers,
  type Q,
  type SectionId,
} from '../data/leakCheck'
import LogoTile from '../components/LogoTile'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'
import Footer from '../sections/Footer'
import { SIGNAL } from '../lib/palette'
import { reducedMotion, splitWords } from '../lib/motion'
import { blueprintSVG } from '../lib/blueprint'
import { getSource } from '../lib/source'
import { useHoldToTalk } from '../leak-check/useHoldToTalk'

const FORM_ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined) || `https://formsubmit.co/ajax/${site.formTo}`
const DRAFT_KEY = 'pm-leak-check-v1'
const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (n: number) => Math.round(n).toLocaleString('en-US')
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Screen =
  | { key: 'welcome'; kind: 'welcome' }
  | { key: string; kind: 'section'; sec: SectionId }
  | { key: string; kind: 'q'; q: Q }
  | { key: 'review'; kind: 'review' }
  | { key: 'result'; kind: 'result' }

function screensFor(a: Answers): { list: Screen[]; qs: Q[] } {
  const qs = buildFlow(a)
  const list: Screen[] = [{ key: 'welcome', kind: 'welcome' }]
  let last: SectionId | null = null
  for (const q of qs) {
    if (q.sec !== last) {
      list.push({ key: `sec:${q.sec}`, kind: 'section', sec: q.sec })
      last = q.sec
    }
    list.push({ key: q.id, kind: 'q', q })
  }
  list.push({ key: 'review', kind: 'review' }, { key: 'result', kind: 'result' })
  return { list, qs }
}

/* ---------------- answers ---------------- */

const str = (v: unknown) => (v === undefined || v === null ? '' : String(v))
const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : [])

function isEmpty(q: Q, a: Answers) {
  if (q.type === 'contact') return !str(a.name).trim() || !str(a.email).trim()
  if (q.type === 'multi') return list(a[q.id]).length === 0
  return str(a[q.id]).trim() === ''
}

function problem(q: Q, a: Answers): string {
  if (q.req && isEmpty(q, a)) {
    if (q.type === 'contact') return 'Add your name and work email to continue.'
    if (q.type === 'multi') return 'Pick at least one to continue.'
    if (q.type === 'choice' || q.type === 'scale' || q.type === 'audience') return 'Pick one to continue.'
    return 'Add an answer to continue.'
  }
  if (q.type === 'contact' && str(a.email).trim() && !EMAIL.test(str(a.email).trim())) return 'That email address doesn’t look complete.'
  if (q.other) {
    const on = q.type === 'multi' ? has(a[q.id], '__other') : a[q.id] === '__other'
    if (on && !str(a[`${q.id}_other`]).trim()) return 'Describe your “Other” answer, or unselect it.'
  }
  if (q.type === 'number' && str(a[q.id]) !== '') {
    const n = Number(a[q.id])
    if (!Number.isFinite(n) || n < (q.min ?? -Infinity) || n > (q.maxN ?? Infinity)) return `Enter a number from ${fmt(q.min ?? 0)} to ${fmt(q.maxN ?? 0)}.`
  }
  return ''
}

function answerText(q: Q, a: Answers): string {
  const v = a[q.id]
  if (q.type === 'contact') return [a.name, a.email, a.company].map(str).filter(Boolean).join(' · ')
  if (q.type === 'choice' || q.type === 'audience') {
    if (v === undefined) return ''
    return v === '__other' ? `Other: ${str(a[`${q.id}_other`])}` : labelOf(q.opts, str(v))
  }
  if (q.type === 'multi') return list(v).map((x) => (x === '__other' ? `Other: ${str(a[`${q.id}_other`])}` : labelOf(q.opts, x))).join(', ')
  if (q.type === 'scale') return v ? `${v} of 5` : ''
  if (q.type === 'number') return str(v) === '' ? '' : `${Number(v).toLocaleString('en-US')} ${q.unit ?? ''}`.trim()
  return str(v)
}

/* ---------------- small parts ---------------- */

function Header() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#0a0a0a] bg-white px-5 py-3 md:px-10">
      <div className="flex items-center gap-4 md:gap-6">
        <a href="../../" data-page-link className="flex items-center gap-3" aria-label="prince + marshall home">
          <LogoTile size={40} />
          <span className="type-label hidden sm:inline">prince + marshall</span>
        </a>
        <a href={L.backToSystems.href} data-page-link className="type-label inline-flex min-h-[44px] items-center text-[#0a0a0a]/70 underline-offset-4 hover:text-[#0a0a0a] hover:underline">
          {L.backToSystems.label}
        </a>
      </div>
      <a href="../#contact" data-page-link className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
        {L.cta}
      </a>
    </header>
  )
}

/** Nine sections, one segment each, filling as answers come in. */
function Progress({ fills, current, count }: { fills: number[]; current: number; count: string }) {
  return (
    <div className="grid gap-2 border-b border-[#0a0a0a]/15 bg-white px-5 py-3 md:px-10">
      <div className="flex items-baseline justify-between gap-4">
        <p className="type-label">
          <span className="text-[#0a0a0a]/60">
            {pad(current + 1)} / {pad(SECTIONS.length)}
          </span>{' '}
          · {SECTIONS[current]?.name}
        </p>
        <p className="type-label tabular-nums text-[#0a0a0a]/60">{count}</p>
      </div>
      <ol className="flex gap-1" aria-hidden="true">
        {fills.map((f, i) => (
          <li key={SECTIONS[i].id} className="min-w-0 basis-0" style={{ flexGrow: 1 }}>
            <span className="relative block h-[3px] w-full overflow-hidden bg-[#0a0a0a]/15">
              <span className="absolute inset-0 origin-left bg-[#0a0a0a] transition-transform duration-500 ease-expo" style={{ transform: `scaleX(${f})` }} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

const fieldClass =
  'block w-full min-h-[56px] border border-[#0a0a0a] bg-white px-4 py-3 text-xl font-bold tracking-[-0.01em] text-[#0a0a0a] placeholder:text-[#0a0a0a]/35 rounded-none md:text-2xl'

function OptionCard({ on, letter, label, line, onClick, multi }: { on: boolean; letter: string; label: string; line?: string; onClick: () => void; multi?: boolean }) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={on}
      onClick={onClick}
      className={`lc-fade group flex w-full items-start gap-3 border p-4 text-left transition-colors duration-300 md:p-5 ${on ? 'border-[#0a0a0a] bg-[#0a0a0a] text-white' : 'border-[#0a0a0a]/30 hover:border-[#0a0a0a]'}`}
    >
      <span className="mt-[0.3em] inline-block h-3 w-3 shrink-0 border border-current" style={{ background: on ? SIGNAL : 'transparent' }} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-extrabold leading-snug tracking-[-0.015em]">{label}</span>
        {line && <span className={`mt-1 block font-semibold leading-snug ${on ? 'text-white/75' : 'text-[#0a0a0a]/65'}`}>{line}</span>}
      </span>
      <span className={`type-label shrink-0 pt-0.5 ${on ? 'text-white/60' : 'text-[#0a0a0a]/40 group-hover:text-[#0a0a0a]'}`} aria-hidden="true">
        {letter}
      </span>
    </button>
  )
}

type Voice = { start: () => void; stop: () => void } | null

/** A long answer with hold-to-talk. */
function LongField({ id, value, ph, onChange, register }: { id: string; value: string; ph?: string; onChange: (v: string) => void; register: (v: Voice) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const getBase = useCallback(() => taRef.current?.value ?? '', [])
  const { supported, listening, blocked, start, stop, meterRef } = useHoldToTalk({ getBase, onText: onChange })
  useEffect(() => {
    register(supported ? { start: start, stop: stop } : null)
    return () => register(null)
  }, [register, supported, start, stop])
  useEffect(() => {
    if (!supported && !isTouch) taRef.current?.focus({ preventScroll: true })
  }, [supported])

  return (
    <div className="lc-fade">
      <label htmlFor={`f_${id}`} className="sr-only">
        Your answer
      </label>
      <textarea
        ref={taRef}
        id={`f_${id}`}
        data-lc-field
        rows={5}
        value={value}
        placeholder={ph}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} min-h-[160px] resize-y text-lg leading-snug md:text-xl ${listening ? 'border-2' : ''}`}
      />
      {supported && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            data-lc-mic
            aria-pressed={listening}
            aria-label={listening ? L.voiceListening : isTouch ? L.voiceHintTouch : L.voiceHint}
            onPointerDown={(e) => {
              e.preventDefault()
              ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
              start()
            }}
            onPointerUp={() => stop()}
            onPointerCancel={() => stop()}
            onContextMenu={(e) => e.preventDefault()}
            className={`inline-flex min-h-[48px] select-none items-center gap-3 rounded-full px-5 text-sm font-bold tracking-tight transition-colors duration-300 [touch-action:none] ${listening ? 'bg-[#c8ff2e] text-[#0a0a0a] shadow-[inset_0_0_0_1px_#0a0a0a]' : 'bg-[#0a0a0a] text-white hover:bg-[#c8ff2e] hover:text-[#0a0a0a]'}`}
          >
            <span ref={meterRef} className="flex h-4 items-center gap-[3px] [--lvl:0]" aria-hidden="true">
              {[0.55, 0.85, 1, 0.75, 0.5].map((k, i) => (
                <span
                  key={i}
                  className="block w-[3px] origin-center bg-current"
                  style={{ height: '100%', transform: listening ? `scaleY(calc(0.2 + var(--lvl) * ${k}))` : `scaleY(${0.25 + k * 0.2})`, transition: 'transform 80ms linear' }}
                />
              ))}
            </span>
            {listening ? L.voiceListening : isTouch ? L.voiceHintTouch : L.voiceHint}
          </button>
          {!isTouch && !listening && <span className="type-label text-[#0a0a0a]/55">or just start typing</span>}
        </div>
      )}
      {blocked ? (
        <p className="type-label mt-3 text-[#ff5a4e]">{L.voiceBlocked}</p>
      ) : (
        supported && <p className="type-label mt-3 text-[#0a0a0a]/50">{L.voiceNote}</p>
      )}
    </div>
  )
}

/** Hero visual: fifty hours, some lost (red) then won back (lime), on a slower loop than the Systems page. */
function HourGrid() {
  const lost = [2, 6, 9, 13, 18, 22, 27, 29, 33, 38, 41, 47]
  return (
    <div className="pointer-events-none hidden lg:block" aria-hidden="true">
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 50 }, (_, i) => {
          const k = lost.indexOf(i)
          return (
            <span
              key={i}
              className={`block h-6 w-9 xl:h-7 xl:w-11 ${k >= 0 && !reducedMotion ? 'pm-hour' : ''}`}
              style={{ background: 'rgba(10,10,10,0.06)', animationDelay: k >= 0 ? `${k * 0.32}s` : undefined, animationDuration: k >= 0 ? '8s' : undefined }}
            />
          )
        })}
      </div>
      <p className="type-label mt-3 flex items-center gap-4 text-[#0a0a0a]/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 bg-[#ff5a4e]" />
          Leaking
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5" style={{ background: SIGNAL, outline: '1px solid #0a0a0a' }} />
          Ready to win back
        </span>
      </p>
    </div>
  )
}

/** Five blocks, filled to the score. */
function Blocks({ score, dark = false }: { score: number; dark?: boolean }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => {
        const f = Math.max(0, Math.min(1, score - (n - 1)))
        return (
          <span key={n} className={`relative block h-3 w-7 overflow-hidden ${dark ? 'bg-white/15' : 'bg-[#0a0a0a]/10'}`}>
            <span className="absolute inset-y-0 left-0" style={{ width: `${f * 100}%`, background: SIGNAL, boxShadow: dark ? undefined : 'inset 0 0 0 1px #0a0a0a' }} />
          </span>
        )
      })}
    </span>
  )
}

/* ---------------- page ---------------- */

function loadDraft(): { a: Answers; cur: string } {
  let a: Answers = {}
  let cur = 'welcome'
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')
    if (d && typeof d === 'object' && d.a) {
      a = d.a
      cur = d.cur || 'welcome'
    }
  } catch {
    /* storage blocked: start fresh */
  }
  if (a.audience === undefined && typeof window !== 'undefined') {
    const f = new URLSearchParams(window.location.search).get('for')
    if (f === 'small' || f === 'team' || f === 'enterprise') a = { ...a, audience: f }
  }
  return { a, cur }
}

export default function LeakCheckPage() {
  const init = useMemo(loadDraft, [])
  const [A, setA] = useState<Answers>(init.a)
  const [cur, setCur] = useState(init.cur)
  const [dir, setDir] = useState(1)
  const [err, setErr] = useState('')
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'error'>('idle')
  const voiceRef = useRef<Voice>(null)
  const register = useCallback((v: Voice) => {
    voiceRef.current = v
  }, [])
  const stageRef = useRef<HTMLDivElement>(null)

  const { list: screens, qs } = useMemo(() => screensFor(A), [A])
  let idx = screens.findIndex((s) => s.key === cur)
  if (idx < 0) idx = 0
  const screen = screens[idx]
  if (screen.kind === 'result' && !A._sent) idx = screens.findIndex((s) => s.key === 'review')
  const sc = screens[idx]

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ a: A, cur: sc.key }))
    } catch {
      /* draft is a convenience */
    }
  }, [A, sc.key])

  const set = useCallback((id: string, v: unknown) => {
    setErr('')
    setA((p) => ({ ...p, [id]: v }))
  }, [])

  /* progress */
  const secOf = (s: Screen): number => (s.kind === 'section' ? SECTIONS.findIndex((x) => x.id === s.sec) : s.kind === 'q' ? SECTIONS.findIndex((x) => x.id === s.q.sec) : s.kind === 'welcome' ? 0 : SECTIONS.length - 1)
  const fills = SECTIONS.map((s) => {
    const inSec = qs.filter((q) => q.sec === s.id)
    return inSec.length ? inSec.filter((q) => !isEmpty(q, A)).length / inSec.length : 0
  })
  const qIndex = sc.kind === 'q' ? qs.findIndex((q) => q.id === sc.q.id) : -1

  const notifyStart = (a: Answers) => {
    if (!L.notifyOnStart || a._started) return
    setA((p) => ({ ...p, _started: true }))
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: str(a.name),
        email: str(a.email),
        company: str(a.company),
        audience: labelOf(systems.fork.options.map((o) => ({ v: o.id, l: o.label })), str(a.audience)),
        source: getSource(),
        _replyto: str(a.email),
        _subject: `Leak Check started: ${str(a.company) || str(a.name)}`,
        _template: 'table',
        _captcha: 'false',
      }),
    }).catch(() => {})
  }

  const go = (step: 1 | -1) => {
    if (step > 0 && sc.kind === 'q') {
      const p = problem(sc.q, A)
      if (p) {
        setErr(p)
        return
      }
      if (sc.q.type === 'contact') notifyStart(A)
    }
    const next = Math.max(0, Math.min(screens.length - 1, idx + step))
    if (screens[next].kind === 'result' && !A._sent) return
    voiceRef.current?.stop()
    setErr('')
    setDir(step)
    setCur(screens[next].key)
  }
  const jump = (key: string) => {
    setErr('')
    setDir(-1)
    setCur(key)
  }
  const restart = () => {
    setA({})
    setDir(-1)
    setCur('welcome')
  }

  /* screen-change animation: masked word rise on the heading, then the controls */
  useLayoutEffect(() => {
    const root = stageRef.current
    if (!root) return
    window.scrollTo(0, 0)
    if (reducedMotion) return
    const h = root.querySelector<HTMLElement>('[data-lc-head]')
    const original = h?.innerHTML
    const words = h ? splitWords(h) : []
    const items = Array.from(root.querySelectorAll<HTMLElement>('.lc-fade'))
    const band = root.querySelector<HTMLElement>('[data-lc-band]')
    const ctx = gsap.context(() => {
      if (band) gsap.fromTo(band, { clipPath: dir > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.75, ease: 'power4.inOut' })
      if (words.length) gsap.fromTo(words, { yPercent: dir > 0 ? 110 : -110 }, { yPercent: 0, duration: 0.8, ease: 'power4.out', stagger: 0.035, delay: band ? 0.35 : 0 })
      if (items.length) gsap.fromTo(items, { autoAlpha: 0, y: dir > 0 ? 18 : -18 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.035, delay: band ? 0.5 : 0.15 })
    }, root)
    return () => {
      ctx.revert()
      if (h && original !== undefined) h.innerHTML = original
    }
  }, [sc.key, dir])

  /* focus the first field on screens that need typing (long answers wait, so Space can mean "talk") */
  useEffect(() => {
    if (sc.kind !== 'q' || isTouch) return
    if (sc.q.type === 'number' || sc.q.type === 'contact' || sc.q.type === 'text') {
      const el = stageRef.current?.querySelector<HTMLInputElement>('[data-lc-field]')
      window.setTimeout(() => el?.focus({ preventScroll: true }), 120)
    }
  }, [sc])

  /* keyboard: Enter moves on, letters pick, Space held talks */
  const spaceHeld = useRef(false)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const tag = t?.tagName
      const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      const isMic = !!t?.closest?.('[data-lc-mic]')
      if (e.metaKey || e.ctrlKey || e.altKey) {
        if (e.key === 'Enter' && tag === 'TEXTAREA') {
          e.preventDefault()
          go(1)
        }
        return
      }
      if (sc.kind === 'q' && sc.q.type === 'long' && e.code === 'Space' && (!inField || isMic) && voiceRef.current) {
        e.preventDefault()
        if (!e.repeat && !spaceHeld.current) {
          spaceHeld.current = true
          voiceRef.current.start()
        }
        return
      }
      if (e.key === 'Enter') {
        if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return
        if (sc.kind === 'review' || sc.kind === 'result') return
        e.preventDefault()
        go(1)
        return
      }
      if (inField || e.key.length !== 1) return
      if (sc.kind !== 'q') return
      const q = sc.q
      if (q.type === 'choice' || q.type === 'multi' || q.type === 'audience') {
        const k = e.key.toUpperCase().charCodeAt(0) - 65
        const opts = [...(q.opts ?? []), ...(q.other ? [{ v: '__other', l: 'Other' }] : [])]
        if (k >= 0 && k < opts.length) {
          e.preventDefault()
          pick(q, opts[k].v)
        }
      } else if (q.type === 'scale' && /^[1-5]$/.test(e.key)) {
        e.preventDefault()
        pick(q, e.key)
      } else if (q.type === 'long' && e.key !== ' ') {
        const ta = stageRef.current?.querySelector<HTMLTextAreaElement>('[data-lc-field]')
        if (ta) {
          e.preventDefault()
          ta.focus()
          set(q.id, str(A[q.id]) + e.key)
        }
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spaceHeld.current) {
        spaceHeld.current = false
        voiceRef.current?.stop()
      }
    }
    const blur = () => {
      if (spaceHeld.current) {
        spaceHeld.current = false
        voiceRef.current?.stop()
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  })

  const autoTimer = useRef(0)
  function pick(q: Q, v: string) {
    setErr('')
    if (q.type === 'multi') {
      const opt = q.opts?.find((o) => o.v === v)
      let s = list(A[q.id]).slice()
      if (s.includes(v)) s = s.filter((x) => x !== v)
      else if (opt?.excl) s = [v]
      else {
        s = s.filter((x) => !q.opts?.find((o) => o.v === x)?.excl)
        if (q.max && s.length >= q.max) {
          setErr(`Choose up to ${q.max}. Unselect one to swap it.`)
          return
        }
        s.push(v)
      }
      set(q.id, s)
      return
    }
    set(q.id, v)
    if (v === '__other') return
    window.clearTimeout(autoTimer.current)
    autoTimer.current = window.setTimeout(() => {
      setDir(1)
      setCur((c) => {
        if (c !== q.id) return c
        const s2 = screensFor({ ...A, [q.id]: v }).list
        const i = s2.findIndex((s) => s.key === q.id)
        return s2[Math.min(s2.length - 1, i + 1)].key
      })
    }, 380)
  }
  useEffect(() => () => window.clearTimeout(autoTimer.current), [])

  /* send */
  const result = useMemo(() => leakMap(A), [A])
  const send = async () => {
    const bad = qs.find((q) => problem(q, A))
    if (bad) {
      setErr('Some required answers are missing. Taking you to the first one.')
      window.setTimeout(() => jump(bad.id), 900)
      return
    }
    setSendState('sending')
    const aud = audienceOf(A)
    const leakLines = result.leaks.map((l, i) => `${i + 1}. ${l.label}: ${fmt(l.hoursYear)} h/yr, $${fmt(l.dollarsYear)}/yr, ${READY_LABEL[l.ready]} (${l.reasons.join('; ')})`).join('\n')
    const dimLines = result.dims.map((d) => `${d.name}: ${d.score}/5`).join('\n')
    const fields: Record<string, string> = {}
    qs.forEach((q, i) => {
      if (q.type === 'contact') return
      fields[`${pad(i + 1)} ${q.wf ? `[${q.wf.label}] ` : ''}${q.title}`.slice(0, 120)] = answerText(q, A) || '—'
    })
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: str(A.name),
          email: str(A.email),
          company: str(A.company),
          audience: systems.fork.options.find((o) => o.id === aud)?.label,
          source: getSource(),
          'Leak Map preview': leakLines || 'No workflows chosen',
          'Readiness (preview)': `${result.overall}/5 overall\n${dimLines}`,
          ...fields,
          _replyto: str(A.email),
          _subject: `Leak Check: ${str(A.company) || str(A.name)} (${aud})`,
          _template: 'table',
          _captcha: 'false',
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
    } catch {
      setSendState('error')
      return
    }
    setSendState('idle')
    reveal()
  }
  const reveal = () => {
    const show = () => {
      setA((p) => ({ ...p, _sent: true }))
      setDir(1)
      setCur('result')
    }
    if (reducedMotion) return show()
    const panel = document.createElement('div')
    panel.className = 'pm-leave pm-blueprint'
    panel.setAttribute('aria-hidden', 'true')
    panel.innerHTML = `<div class="pm-blueprint-art">${blueprintSVG(true)}</div>`
    document.body.appendChild(panel)
    window.setTimeout(() => {
      show()
      const anim = panel.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 650, delay: 120, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' })
      anim.onfinish = () => panel.remove()
    }, 1100)
  }

  /* ---------------- views ---------------- */

  const actions = (label = 'OK', extra?: ReactNode) => (
    <div className="lc-fade mt-10 flex flex-wrap items-center gap-5">
      <PillButton onClick={() => go(1)}>
        <RollText text={label} />
      </PillButton>
      {extra ?? (
        <span className="type-label text-[#0a0a0a]/50">
          or press <span className="text-[#0a0a0a]">Enter ↵</span>
        </span>
      )}
    </div>
  )

  const errLine = (
    <p role="alert" className="type-label mt-5 min-h-[1.25rem] text-[#ff5a4e]">
      {err}
    </p>
  )

  const control = (q: Q) => {
    const v = A[q.id]
    if (q.type === 'contact')
      return (
        <div className="lc-fade grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
          <label className="type-label block">
            Your name
            <input data-lc-field className={`${fieldClass} mt-2`} autoComplete="name" value={str(A.name)} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className="type-label block">
            Work email
            <input className={`${fieldClass} mt-2`} type="email" autoComplete="email" inputMode="email" value={str(A.email)} onChange={(e) => set('email', e.target.value)} />
          </label>
          <label className="type-label block md:col-span-2">
            Organization <span className="text-[#0a0a0a]/50">(optional)</span>
            <input className={`${fieldClass} mt-2`} autoComplete="organization" value={str(A.company)} onChange={(e) => set('company', e.target.value)} />
          </label>
        </div>
      )
    if (q.type === 'text' || q.type === 'number')
      return (
        <div className="lc-fade flex max-w-xl items-center gap-4">
          {q.id === 'rate' && <span className="font-display text-3xl">$</span>}
          <input
            data-lc-field
            aria-label="Your answer"
            className={`${fieldClass} tabular-nums`}
            type={q.type === 'number' ? 'number' : 'text'}
            inputMode={q.type === 'number' ? 'decimal' : undefined}
            min={q.min}
            max={q.maxN}
            placeholder={q.ph ?? (q.type === 'number' ? '0' : 'Type your answer')}
            value={str(v)}
            onChange={(e) => set(q.id, e.target.value)}
          />
          {q.unit && <span className="type-label shrink-0 text-[#0a0a0a]/60">{q.unit}</span>}
        </div>
      )
    if (q.type === 'long') return <LongField key={q.id} id={q.id} value={str(v)} ph={q.ph} onChange={(t) => set(q.id, t)} register={register} />
    if (q.type === 'scale')
      return (
        <div className="lc-fade max-w-2xl">
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={q.title}>
            {[1, 2, 3, 4, 5].map((n) => {
              const on = str(v) === String(n)
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pick(q, String(n))}
                  className={`border py-5 font-display text-3xl tabular-nums transition-colors duration-300 ${on ? 'border-[#0a0a0a] bg-[#0a0a0a]' : 'border-[#0a0a0a]/30 hover:border-[#0a0a0a]'}`}
                  style={on ? { color: SIGNAL } : undefined}
                >
                  {n}
                </button>
              )
            })}
          </div>
          <p className="type-label mt-3 flex justify-between gap-6 text-[#0a0a0a]/60">
            <span>1 · {q.lo}</span>
            <span className="text-right">5 · {q.hi}</span>
          </p>
        </div>
      )
    const opts = [...(q.opts ?? []), ...(q.other ? [{ v: '__other', l: 'Other' }] : [])]
    const multi = q.type === 'multi'
    const on = (x: string) => (multi ? has(v, x) : v === x)
    const otherOn = on('__other')
    return (
      <div>
        <div className={`grid grid-cols-1 gap-3 ${q.cols || q.type === 'audience' ? 'md:grid-cols-2' : 'max-w-3xl'} ${q.type === 'audience' ? 'lg:grid-cols-3' : ''}`} role={multi ? 'group' : 'radiogroup'} aria-label={q.title}>
          {opts.map((o, i) => (
            <OptionCard key={o.v} multi={multi} on={on(o.v)} letter={String.fromCharCode(65 + i)} label={o.l} line={'d' in o ? o.d : undefined} onClick={() => pick(q, o.v)} />
          ))}
        </div>
        {q.other && otherOn && (
          <label className="lc-fade mt-4 block max-w-3xl">
            <span className="sr-only">Describe Other</span>
            <input autoFocus className={fieldClass} placeholder="Describe “Other”" value={str(A[`${q.id}_other`])} onChange={(e) => set(`${q.id}_other`, e.target.value)} />
          </label>
        )}
        <p className="lc-fade type-label mt-4 text-[#0a0a0a]/50">
          {multi ? (q.max ? `Choose up to ${q.max}. ` : 'Choose all that apply. ') : ''}
          {!isTouch && `Press ${'A'}–${String.fromCharCode(64 + opts.length)} to choose.`}
        </p>
      </div>
    )
  }

  let body: ReactNode = null
  if (sc.kind === 'welcome') {
    const resume = Object.keys(A).some((k) => !k.startsWith('_') && k !== 'audience')
    body = (
      <section className="grid grid-cols-1 items-center gap-12 px-5 pb-20 pt-12 md:px-10 md:pt-20 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="lc-fade type-label inline-flex items-center gap-2 border border-[#0a0a0a] px-3 py-1.5">
            <span className="inline-block h-2 w-2" style={{ background: SIGNAL, outline: '1px solid #0a0a0a' }} aria-hidden="true" />
            {L.label}
          </p>
          <h1 data-lc-head className="mt-8 max-w-[11ch] font-display text-[clamp(3rem,6.4vw,6.5rem)] leading-[0.92] tracking-[-0.035em]">
            {L.h1}
          </h1>
          <p className="lc-fade mt-8 max-w-2xl text-lg font-semibold leading-snug text-[#0a0a0a]/85 md:text-2xl">{L.sub}</p>
          <p className="lc-fade mt-4 max-w-2xl font-semibold text-[#0a0a0a]/65">{L.promise}</p>
          <dl className="lc-fade mt-10 grid max-w-xl grid-cols-3 border-t border-[#0a0a0a]">
            {L.facts.map((f) => (
              <div key={f.v} className="border-b border-[#0a0a0a]/20 py-3 pr-4">
                <dt className="sr-only">{f.v}</dt>
                <dd className="font-display text-3xl tabular-nums md:text-4xl">{f.k}</dd>
                <dd className="type-label mt-1 text-[#0a0a0a]/65">{f.v}</dd>
              </div>
            ))}
          </dl>
          {actions(
            resume ? L.resume : L.start,
            resume ? (
              <button type="button" onClick={restart} className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
                {L.fresh}
              </button>
            ) : undefined,
          )}
        </div>
        <HourGrid />
      </section>
    )
  } else if (sc.kind === 'section') {
    const i = SECTIONS.findIndex((s) => s.id === sc.sec)
    const s = SECTIONS[i]
    body = (
      <section data-lc-band className="bg-[#0a0a0a] px-5 py-20 text-white md:px-10 md:py-28" style={{ minHeight: 'calc(100svh - 120px)' }}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] md:gap-16">
          <p className="type-label inline-flex items-center gap-2" style={{ color: SIGNAL }}>
            <span className="signal-dot signal-dot--on-dark" aria-hidden="true" />
            Section {pad(i + 1)} / {pad(SECTIONS.length)}
          </p>
          <div>
            <p className="outline-text-white font-display text-[clamp(6rem,18vw,15rem)] leading-[0.8] tracking-[-0.05em]" aria-hidden="true">
              {pad(i + 1)}
            </p>
            <h2 data-lc-head className="mt-6 font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.035em]">
              {s.name}
            </h2>
            <p className="lc-fade mt-6 max-w-2xl text-lg font-semibold leading-snug text-white/80 md:text-2xl">{s.line}</p>
            <div className="lc-fade mt-10 flex flex-wrap items-center gap-5">
              <PillButton inverted onClick={() => go(1)}>
                <RollText text="Continue" />
              </PillButton>
              <span className="type-label text-white/50">
                or press <span className="text-white">Enter ↵</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    )
  } else if (sc.kind === 'q') {
    const q = sc.q
    const s = SECTIONS.find((x) => x.id === q.sec)!
    body = (
      <section className="grid grid-cols-1 gap-6 px-5 py-14 md:grid-cols-[200px_1fr] md:gap-16 md:px-10 md:py-20">
        <div className="lc-fade">
          <p className="type-label text-[#0a0a0a]/70">{s.name}</p>
          {q.wf && (
            <p className="type-label mt-2">
              <span className="px-1.5 py-0.5" style={{ background: SIGNAL, outline: '1px solid #0a0a0a' }}>
                Workflow {q.wf.n} of {q.wf.of}
              </span>
              <span className="mt-2 block text-[#0a0a0a]/70">{q.wf.label}</span>
            </p>
          )}
        </div>
        <div className="min-w-0">
          <h1 data-lc-head className="max-w-[22ch] font-display text-[clamp(2rem,4.2vw,3.75rem)] leading-[0.98] tracking-[-0.03em]">
            {q.title}
            {q.req && (
              <span className="text-[#ff5a4e]" aria-label="required">
                *
              </span>
            )}
          </h1>
          {q.help && <p className="lc-fade mt-5 max-w-2xl text-lg font-semibold leading-snug text-[#0a0a0a]/75">{q.help}</p>}
          <div className="mt-8">{control(q)}</div>
          {errLine}
          {(q.type === 'choice' || q.type === 'audience' || q.type === 'scale') && !(q.other && A[q.id] === '__other') ? null : actions(q.type === 'contact' ? 'Continue' : 'OK', q.type === 'long' && !isTouch ? (
            <span className="type-label text-[#0a0a0a]/50">
              or press <span className="text-[#0a0a0a]">Ctrl + Enter ↵</span>
            </span>
          ) : undefined)}
        </div>
      </section>
    )
  } else if (sc.kind === 'review') {
    const missing = qs.filter((q) => problem(q, A)).length
    body = (
      <section className="grid grid-cols-1 gap-6 px-5 py-14 md:grid-cols-[200px_1fr] md:gap-16 md:px-10 md:py-20">
        <p className="lc-fade type-label text-[#0a0a0a]/70">Last step</p>
        <div className="min-w-0">
          <h1 data-lc-head className="font-display text-[clamp(2.25rem,5.2vw,5rem)] leading-[0.98] tracking-[-0.03em]">
            {L.reviewHeading}
          </h1>
          <p className="lc-fade mt-5 max-w-2xl text-lg font-semibold leading-snug text-[#0a0a0a]/75">
            {missing ? `${missing} required ${missing === 1 ? 'answer is' : 'answers are'} still missing. Use Edit to fill ${missing === 1 ? 'it' : 'them'} in.` : 'Everything required is answered.'}
          </p>
          <div className="mt-10 grid gap-10">
            {SECTIONS.map((s, si) => {
              const inSec = qs.filter((q) => q.sec === s.id)
              if (!inSec.length) return null
              return (
                <div key={s.id} className="lc-fade">
                  <p className="type-label flex items-baseline gap-3">
                    <span className="font-display text-2xl">{pad(si + 1)}</span>
                    {s.name}
                  </p>
                  <ul className="mt-3 border-t border-[#0a0a0a]">
                    {inSec.map((q) => {
                      const t = answerText(q, A)
                      const bad = problem(q, A)
                      return (
                        <li key={q.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1 border-b border-[#0a0a0a]/20 py-4">
                          <p className="font-semibold leading-snug text-[#0a0a0a]/65">
                            {q.wf ? `${q.wf.label} · ` : ''}
                            {q.title}
                          </p>
                          <button type="button" onClick={() => jump(q.id)} className="type-label row-span-2 self-start underline underline-offset-4 hover:no-underline">
                            Edit
                          </button>
                          <p className={`whitespace-pre-wrap break-words font-bold leading-snug ${t ? '' : bad ? 'text-[#ff5a4e]' : 'text-[#0a0a0a]/40'}`}>{t || (bad ? 'Required, not answered' : 'Skipped')}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
          {errLine}
          <div className="lc-fade mt-6 flex flex-wrap items-center gap-5">
            <button
              type="button"
              disabled={sendState === 'sending'}
              onClick={send}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0a0a0a] px-7 py-3 text-sm font-bold tracking-tight text-white transition-colors duration-300 hover:bg-[#c8ff2e] hover:text-[#0a0a0a] disabled:opacity-60"
            >
              <RollText text={sendState === 'sending' ? L.sending : L.send} />
            </button>
            {sendState === 'error' && (
              <p role="status" className="type-label max-w-xl text-[#ff5a4e]">
                {L.sendError}{' '}
                <a className="underline underline-offset-4" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </section>
    )
  } else {
    const { leaks, dims, overall, rate, rateAssumed } = result
    const hours = leaks.reduce((s, l) => s + l.hoursYear, 0)
    const dollars = leaks.reduce((s, l) => s + l.dollarsYear, 0)
    const aud: SystemsAudience = audienceOf(A)
    const offer = systems.offers.items.find((o) => o.id === (aud === 'enterprise' ? 'enterprise' : 'small'))!
    const who = str(A.company) || str(A.name).split(' ')[0]
    body = (
      <>
        <section data-lc-band className="bg-[#0a0a0a] px-5 py-20 text-white md:px-10 md:py-28">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] md:gap-16">
            <p className="type-label inline-flex items-center gap-2" style={{ color: SIGNAL }}>
              <span className="signal-dot signal-dot--on-dark" aria-hidden="true" />
              {L.resultEyebrow}
            </p>
            <div>
              <h1 data-lc-head className="max-w-[18ch] font-display text-[clamp(2.25rem,5.2vw,5rem)] leading-[0.98] tracking-[-0.03em]">
                {who ? `${who}: ` : ''}
                {leaks.length === 1 ? 'one workflow' : `${leaks.length} workflows`}, {fmt(hours)} hours a year.
              </h1>
              <div className="lc-fade mt-10 grid grid-cols-1 gap-8 border-t border-white/25 pt-8 sm:grid-cols-2">
                <div>
                  <p className="type-label text-white/70">Hours these workflows take each year</p>
                  <p className="mt-3 font-display text-[clamp(3rem,8vw,6.5rem)] leading-none tracking-[-0.04em] tabular-nums" style={{ color: SIGNAL }}>
                    {fmt(hours)}
                  </p>
                </div>
                <div>
                  <p className="type-label text-white/70">What that time costs each year</p>
                  <p className="mt-3 font-display text-[clamp(3rem,8vw,6.5rem)] leading-none tracking-[-0.04em] tabular-nums">${fmt(dollars)}</p>
                </div>
              </div>
              <p className="lc-fade mt-6 max-w-2xl text-sm font-semibold text-white/70">
                {L.resultNote} At ${fmt(rate)} an hour{rateAssumed ? ', a typical rate, since you left it blank' : ''}.
              </p>
            </div>
          </div>
        </section>

        <section className="hairline-t grid grid-cols-1 gap-6 px-5 py-16 md:grid-cols-[200px_1fr] md:gap-16 md:px-10 md:py-24">
          <p className="type-label text-[#0a0a0a]/70">Your leaks, ranked</p>
          <ol className="border-t border-[#0a0a0a]">
            {leaks.map((l, i) => (
              <li key={l.id} className="lc-fade grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-[#0a0a0a]/20 py-7 md:grid-cols-[4rem_minmax(0,1fr)_auto]">
                <span className="font-display text-3xl tabular-nums text-[#0a0a0a]/40 md:text-4xl">{pad(i + 1)}</span>
                <div className="min-w-0">
                  <h2 className="font-display text-2xl leading-none tracking-[-0.02em] md:text-3xl">{l.label}</h2>
                  <p className="mt-3 font-semibold leading-snug text-[#0a0a0a]/70">{l.reasons.join(' · ')}</p>
                  <p className="type-label mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 ${l.ready === 'prove' ? 'text-[#ff5a4e] shadow-[inset_0_0_0_1px_#ff5a4e]' : l.ready === 'groundwork' ? 'shadow-[inset_0_0_0_1px_#0a0a0a]' : ''}`}
                      style={l.ready === 'ready' ? { background: SIGNAL, outline: '1px solid #0a0a0a' } : undefined}
                    >
                      {READY_LABEL[l.ready]}
                    </span>
                    {l.first && <span className="text-[#0a0a0a]/60">You’d fix this one first</span>}
                  </p>
                </div>
                <div className="col-start-2 md:col-start-3 md:text-right">
                  <p className="font-display text-3xl tabular-nums tracking-[-0.03em]">{fmt(l.hoursYear)} h</p>
                  <p className="type-label mt-1 tabular-nums text-[#0a0a0a]/60">${fmt(l.dollarsYear)} a year</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="hairline-t grid grid-cols-1 gap-6 px-5 py-16 md:grid-cols-[200px_1fr] md:gap-16 md:px-10 md:py-24">
          <div>
            <p className="type-label text-[#0a0a0a]/70">Readiness</p>
            <p className="mt-3 font-display text-6xl tabular-nums tracking-[-0.04em]">
              {overall.toFixed(1)}
              <span className="text-2xl text-[#0a0a0a]/40"> / 5</span>
            </p>
          </div>
          <ul className="border-t border-[#0a0a0a]">
            {dims.map((d) => (
              <li key={d.id} className="lc-fade grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 border-b border-[#0a0a0a]/20 py-5">
                <p className="text-lg font-extrabold leading-tight tracking-[-0.015em]">{d.name}</p>
                <span className="flex items-center gap-3">
                  <Blocks score={d.score} />
                  <span className="type-label w-8 text-right tabular-nums">{d.score.toFixed(1)}</span>
                </span>
                <p className="col-span-2 font-semibold leading-snug text-[#0a0a0a]/65">{d.line}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-[#0a0a0a] px-5 py-20 text-white md:px-10 md:py-28">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] md:gap-16">
            <p className="type-label" style={{ color: SIGNAL }}>
              What happens next
            </p>
            <div>
              <h2 className="max-w-[16ch] font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.035em]">This is the preview. Fieldwork is the real map.</h2>
              <p className="mt-6 max-w-2xl text-lg font-semibold text-white/80 md:text-xl">
                {L.sentLine} {offer.name}: {offer.price}
              </p>
              <p className="mt-3 flex max-w-2xl gap-2 text-sm font-semibold text-white/70">
                <span aria-hidden="true">✓</span>
                {offer.guarantee}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <a
                  href="../#contact"
                  data-page-link
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold tracking-tight text-[#0a0a0a] transition-colors duration-300 select-none hover:bg-[#ededed]"
                >
                  <RollText text={L.cta} />
                </a>
                <button type="button" onClick={() => jump('review')} className="type-label inline-flex min-h-[44px] items-center underline underline-offset-4 hover:no-underline">
                  Edit my answers
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  const showProgress = sc.kind !== 'welcome' && sc.kind !== 'result'
  return (
    <>
      <a href="#main" className="fixed left-3 top-3 z-[80] -translate-y-20 bg-[#0a0a0a] px-4 py-3 text-sm font-bold text-white focus:translate-y-0">
        Skip to content
      </a>
      <div className="sticky top-0 z-40">
        <Header />
        {showProgress && <Progress fills={fills} current={secOf(sc)} count={qIndex >= 0 ? `Question ${qIndex + 1} of ${qs.length}` : sc.kind === 'review' ? 'Review' : ''} />}
      </div>
      <main id="main" ref={stageRef} key={sc.key} className={sc.kind === 'q' || sc.kind === 'review' ? 'min-h-[calc(100svh-120px)]' : ''}>
        {body}
      </main>
      {sc.kind !== 'q' && sc.kind !== 'section' && <Footer link={{ label: 'p+m Systems', href: '../' }} />}
      {(sc.kind === 'q' || sc.kind === 'section' || sc.kind === 'review') && (
        <nav aria-label="Question navigation" className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+20px)] right-5 z-50 flex gap-2 md:right-10">
          {[
            { d: -1 as const, label: 'Previous question', path: 'M8 13V3M3.5 7.5L8 3l4.5 4.5', disabled: idx <= 0 },
            { d: 1 as const, label: 'Next question', path: 'M8 3v10M3.5 8.5L8 13l4.5-4.5', disabled: sc.kind === 'review' },
          ].map((b) => (
            <button
              key={b.d}
              type="button"
              aria-label={b.label}
              disabled={b.disabled}
              onClick={() => go(b.d)}
              className="grid h-11 w-11 place-items-center rounded-full bg-[#0a0a0a] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.6)] transition-colors duration-300 hover:bg-[#c8ff2e] hover:text-[#0a0a0a] disabled:bg-[#ededed] disabled:text-[#0a0a0a]/30"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d={b.path} />
              </svg>
            </button>
          ))}
        </nav>
      )}
    </>
  )
}
