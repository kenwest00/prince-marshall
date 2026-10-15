import { rideAlong } from '../data/content'

const digits = rideAlong.phone.replace(/\D/g, '')

/** True once a real phone number is set in content.ts. */
export const hasPhone = digits.length >= 10

/** (404) 555-1234 style for 10-digit US numbers; raw digits otherwise. */
export const prettyPhone = (() => {
  const d = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : digits
})()

/** Event / chamber tag from ?src=…, sanitised. Defaults to "web". */
export const source = (() => {
  if (typeof window === 'undefined') return 'web'
  const raw = new URLSearchParams(window.location.search).get('src') ?? ''
  const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)
  return clean || 'web'
})()

/** `?&body=` works on both iOS and Android. */
export const smsHref = `sms:${digits}?&body=${encodeURIComponent(`${rideAlong.smsKeyword} ${source}`)}`
export const telHref = `tel:${digits}`
