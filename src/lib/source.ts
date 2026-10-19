/**
 * Lead source tag from ?src= (e.g. /kura/?src=deck-oct), sanitised and kept for
 * the visit so it survives moving between pages. Defaults to "web".
 */
const KEY = 'pm-src'

export function getSource(): string {
  if (typeof window === 'undefined') return 'web'
  try {
    const raw = new URLSearchParams(window.location.search).get('src') ?? ''
    const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)
    if (clean) {
      sessionStorage.setItem(KEY, clean)
      return clean
    }
    return sessionStorage.getItem(KEY) || 'web'
  } catch {
    return 'web'
  }
}
