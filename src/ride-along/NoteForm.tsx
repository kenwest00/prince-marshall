import { useState, type FormEvent } from 'react'
import { rideAlong, site } from '../data/content'
import { source } from './contactLinks'

const FORM_ENDPOINT =
  (import.meta.env.VITE_FORM_ENDPOINT as string | undefined) || `https://formsubmit.co/ajax/${site.email}`

const field =
  'mt-2 block w-full min-h-[48px] rounded-none border border-[#0a0a0a] bg-white px-3 py-2.5 text-base font-semibold text-[#0a0a0a] placeholder:text-[#0a0a0a]/70'

type Status = 'idle' | 'sending' | 'sent' | 'error'

/** Short lead form for trades owners: name, phone, trade. Same FormSubmit inbox as the homepage. */
export default function NoteForm() {
  const f = rideAlong.final
  const [status, setStatus] = useState<Status>('idle')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    if (data.website) return
    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          topic: f.topic,
          name: data.name,
          phone: data.phone,
          trade: data.trade,
          message: data.message || '(none)',
          source,
          _subject: `${f.topic}: ${data.name} (${data.trade}, ${source})`,
          _captcha: 'false',
          _template: 'table',
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" aria-describedby="note-status">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <label className="type-label block">
          {f.name} <span className="sr-only">({f.required})</span>
          <input name="name" type="text" required autoComplete="name" className={field} />
        </label>
        <label className="type-label block">
          {f.phone} <span className="sr-only">({f.required})</span>
          <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className={field} />
        </label>
      </div>
      <label className="type-label block">
        {f.trade}
        <select name="trade" className={field} defaultValue={f.tradeOptions[0]}>
          {f.tradeOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <label className="type-label block">
        {f.message}
        <textarea name="message" rows={3} className={field} />
      </label>

      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#0a0a0a] px-8 py-3 text-base font-bold tracking-tight text-white transition-colors duration-300 hover:bg-[#c8ff2e] hover:text-[#0a0a0a] disabled:opacity-60"
      >
        {status === 'sending' ? f.sending : f.submit}
      </button>

      <p id="note-status" role="status" aria-live="polite" className="type-label min-h-[1.25rem]">
        {status === 'sent' && f.success}
        {status === 'error' && (
          <>
            {f.error}{' '}
            <a className="underline underline-offset-4" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </>
        )}
      </p>
    </form>
  )
}
