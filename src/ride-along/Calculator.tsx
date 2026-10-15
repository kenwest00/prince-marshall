import { useId, useState } from 'react'
import { rideAlong } from '../data/content'

type Field = { label: string; value: number; min: number; max: number; step: number; help?: string }

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const money = (n: number) => `$${n.toLocaleString('en-US')}`

function Stepper({ field, value, onChange }: { field: Field; value: number; onChange: (n: number) => void }) {
  const id = useId()
  const helpId = `${id}-help`
  const set = (n: number) => onChange(clamp(Number.isFinite(n) ? n : 0, field.min, field.max))
  const btn =
    'flex h-12 w-12 shrink-0 items-center justify-center border border-[#0a0a0a] bg-white text-2xl font-bold leading-none transition-colors hover:bg-[#0a0a0a] hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0a0a0a]'
  return (
    <div>
      <label htmlFor={id} className="type-label block">
        {field.label}
      </label>
      <div className="mt-2 flex items-stretch">
        <button
          type="button"
          className={btn}
          onClick={() => set(value - field.step)}
          disabled={value <= field.min}
          aria-label={`Decrease: ${field.label}`}
        >
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value.toLocaleString('en-US')}
          onChange={(e) => set(Number(e.target.value.replace(/[^0-9]/g, '')))}
          aria-describedby={field.help ? helpId : undefined}
          className="h-12 w-full min-w-0 rounded-none border-y border-[#0a0a0a] bg-white px-3 text-center font-display text-2xl tracking-[-0.02em]"
        />
        <button
          type="button"
          className={btn}
          onClick={() => set(value + field.step)}
          disabled={value >= field.max}
          aria-label={`Increase: ${field.label}`}
        >
          +
        </button>
      </div>
      {field.help && (
        <p id={helpId} className="mt-2 text-sm font-semibold leading-snug text-[#0a0a0a]/75">
          {field.help}
        </p>
      )}
    </div>
  )
}

/** Missed-call calculator: the owner's own numbers, computed in the browser only. */
export default function Calculator() {
  const c = rideAlong.calculator
  const [missed, setMissed] = useState(c.missed.value)
  const [booked, setBooked] = useState(c.booked.value)
  const [job, setJob] = useState(c.job.value)

  const yearly = Math.round((missed * (booked / 10) * job * 52) / 100) * 100
  const jobs = job > 0 ? Math.ceil(rideAlong.price / job) : 0

  return (
    <div className="grid grid-cols-1 border border-[#0a0a0a] lg:grid-cols-2">
      <div className="space-y-7 p-5 md:p-8">
        <Stepper field={c.missed} value={missed} onChange={setMissed} />
        <Stepper field={c.booked} value={booked} onChange={setBooked} />
        <Stepper field={c.job} value={job} onChange={setJob} />
      </div>
      <div
        className="flex flex-col justify-between gap-8 border-t border-[#0a0a0a] bg-[#0a0a0a] p-5 text-white md:p-8 lg:border-l lg:border-t-0"
        aria-live="polite"
      >
        <div>
          <p className="text-xl font-bold leading-snug md:text-2xl">
            {c.resultPre}{' '}
            <span className="block py-2 font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] tracking-[-0.035em]">
              <span className="border-b-4 border-[#c8ff2e] pb-1">{money(yearly)}</span>
            </span>
            {c.resultPost}
          </p>
          {jobs > 0 && (
            <p className="mt-6 text-lg font-semibold leading-snug text-white/90">
              {c.paybackPre} <strong className="font-extrabold text-white">{jobs}</strong>{' '}
              {jobs === 1 ? c.paybackOne : c.paybackPost}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold leading-snug text-white/75">{c.fine}</p>
      </div>
    </div>
  )
}
