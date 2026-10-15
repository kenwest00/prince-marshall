import { reducedMotion } from './motion'

/**
 * Cross-page transition between the homepage and /ride-along/.
 * Leaving: a black panel wipes up over the page, then the browser navigates.
 * Arriving: an inline script in each HTML <head> sees the flag and starts a
 * black cover that wipes away upward (see the <style> block in index.html and
 * ride-along/index.html), so both pages feel like one site.
 */
const ARRIVE_KEY = 'pm-arrive'

export function leaveTo(href: string) {
  try {
    sessionStorage.setItem(ARRIVE_KEY, '1')
    // Someone moving between pages has already "entered" the site: skip the homepage intro.
    sessionStorage.setItem('pm-intro-seen', '1')
  } catch {
    /* storage blocked: navigate without the arrival wipe */
  }
  if (reducedMotion) {
    window.location.href = href
    return
  }
  const panel = document.createElement('div')
  panel.className = 'pm-leave'
  panel.setAttribute('aria-hidden', 'true')
  document.body.appendChild(panel)
  let gone = false
  const go = () => {
    if (gone) return
    gone = true
    window.location.href = href
  }
  panel.addEventListener('animationend', go, { once: true })
  window.setTimeout(go, 800)
}

/** Any <a data-page-link> becomes a transitioned page link (modifier-clicks still open normally). */
export function installPageLinks() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-page-link]')
    if (!a) return
    e.preventDefault()
    leaveTo(a.href)
  })
  // Back/forward cache restores the page with the panel still on it.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) document.querySelectorAll('.pm-leave').forEach((n) => n.remove())
  })
}
