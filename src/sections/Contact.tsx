import { useEffect, useRef, useState, type FormEvent } from 'react'
import { contact, site } from '../data/content'
import RollText from '../components/RollText'
import SectionHead from '../components/SectionHead'
import { scrollToTarget, useFadeItems } from '../lib/motion'
import { CONTACT_TOPIC_EVENT } from '../lib/contactEvents'
/**
 * Inquiries are POSTed as JSON to FormSubmit (free, no account), which emails
 * them to site.email. Set VITE_FORM_ENDPOINT at build time to use another
 * service (e.g. Formspree) instead.
 */
const FORM_ENDPOINT =
  (import.meta.env.VITE_FORM_ENDPOINT as string | undefined) ||
  `https://formsubmit.co/ajax/${site.email}`

type Status = 'idle' | 'sending' | 'sent' | 'mailto' | 'error'

const fieldClass =
  'mt-2 block w-full min-h-[44px] border border-[#0a0a0a] bg-white px-3 py-2.5 text-base font-semibold text-[#0a0a0a] placeholder:text-[#0a0a0a]/70 rounded-none'

export default function Contact() {
  const f = contact.form
  const [status, setStatus] = useState<Status>('idle')
  const sideRef = useFadeItems<HTMLDivElement>()
  const [topic, setTopic] = useState(f.topicOptions[0])
  const messageRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent<string>).detail
      if (!f.topicOptions.includes(next)) return
      setTopic(next)
      const msg = messageRef.current
      if (msg && !msg.value.trim() && next === f.topicOptions[1]) msg.value = f.kuraPrefill
      scrollToTarget('#contact')
      window.setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>('#contact input[name="name"]')
        el?.focus({ preventScroll: true })
      }, 700)
    }
    window.addEventListener(CONTACT_TOPIC_EVENT, handler)
    return () => window.removeEventListener(CONTACT_TOPIC_EVENT, handler)
  }, [f.topicOptions, f.kuraPrefill])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    // Honeypot: real visitors never fill this in.
    if (data.website) return

    const body = [
      `Reason: ${data.topic}`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Organization: ${data.organization}`,
      `Environment: ${data.environment}`,
      `Timeline: ${data.timeline}`,
      '',
      data.message,
    ].join('\n')

    if (FORM_ENDPOINT) {
      setStatus('sending')
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            ...data,
            _subject: `${data.topic}: ${data.organization || data.name}`,
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
      return
    }

    const subject = encodeURIComponent(`${data.topic}: ${data.organization || data.name}`)
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${encodeURIComponent(body)}`
    setStatus('mailto')
  }

  return (
    <section id={contact.id} aria-labelledby="contact-heading" className="hairline-t px-5 py-24 md:px-10 md:py-36">
      <SectionHead id="contact-heading" eyebrow={contact.eyebrow} heading={contact.heading} />

      <div className="grid grid-cols-1 gap-14 md:ml-[264px] 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] 2xl:gap-14">
        <form onSubmit={onSubmit} noValidate={false} className="space-y-6" aria-describedby="form-status">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="type-label block">
              {f.name} <span className="sr-only">({f.required})</span>
              <input name="name" type="text" required autoComplete="name" className={fieldClass} />
            </label>
            <label className="type-label block">
              {f.email} <span className="sr-only">({f.required})</span>
              <input name="email" type="email" required autoComplete="email" className={fieldClass} />
            </label>
          </div>
          <label className="type-label block">
            {f.topic}
            <select name="topic" className={fieldClass} value={topic} onChange={(e) => setTopic(e.target.value)}>
              {f.topicOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="type-label block">
            {f.organization}
            <input name="organization" type="text" autoComplete="organization" className={fieldClass} />
          </label>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="type-label block">
              {f.environment}
              <select name="environment" className={fieldClass} defaultValue={f.environmentOptions[0]}>
                {f.environmentOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="type-label block">
              {f.timeline}
              <select name="timeline" className={fieldClass} defaultValue={f.timelineOptions[0]}>
                {f.timelineOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="type-label block">
            {f.message} <span className="sr-only">({f.required})</span>
            <textarea ref={messageRef} name="message" required rows={5} className={fieldClass} />
          </label>

          {/* honeypot, hidden from people and assistive tech */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label>
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#0a0a0a] px-7 py-3 text-sm font-bold tracking-tight text-white transition-colors duration-300 hover:bg-[#2a2a2a] disabled:opacity-60"
          >
            <RollText text={status === 'sending' ? f.sending : f.submit} />
          </button>

          <p id="form-status" role="status" aria-live="polite" className="type-label min-h-[1.25rem]">
            {status === 'sent' && f.success}
            {status === 'mailto' && (
              <>
                {f.successMailto}{' '}
                <a className="underline underline-offset-4" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                .
              </>
            )}
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

        <div ref={sideRef} className="space-y-10">
          <div className="fade-item">
            <p className="type-label">{contact.availability}</p>
            <p className="type-label mt-1 text-[#0a0a0a]/70">{contact.writeTo}</p>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 block break-words font-display text-[clamp(1.25rem,2vw,2rem)] leading-[1.05] tracking-[-0.02em] underline underline-offset-8 hover:no-underline"
            >
              {site.email}
            </a>
          </div>
          <div className="fade-item">
            <h3 className="font-display text-2xl leading-none tracking-[-0.02em]">{contact.next.heading}</h3>
            <ol className="mt-5 space-y-3">
              {contact.next.steps.map((s, i) => (
                <li key={s} className="grid grid-cols-[2rem_1fr] gap-3 font-semibold leading-snug">
                  <span className="type-label pt-0.5 text-[#0a0a0a]/70">{String(i + 1).padStart(2, '0')}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
