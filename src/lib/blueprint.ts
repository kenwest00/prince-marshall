/**
 * The page-transition drawing: the p+m tile as a blueprint line drawing
 * (box 1200 × 1200 × 280, the lime plus, dimension lines and a title block).
 * Used three ways: drawn line by line on the leaving panel and the in-page
 * overlay (animated), and as a finished background on the arriving cover
 * (static, inlined into each page's <head> at build time).
 */

const W = 'rgba(255,255,255,0.88)'
const W2 = 'rgba(255,255,255,0.42)'
const W3 = 'rgba(255,255,255,0.6)'
const LIME = '#c8ff2e'
const FONT = "Archivo, 'Helvetica Neue', Arial, sans-serif"

type El = { d: string; stroke: string; width: number; dash?: boolean; delay: number }

const P = (pts: [number, number][], close = false) => 'M' + pts.map((p) => p.join(' ')).join(' L') + (close ? ' Z' : '')

function lines(): El[] {
  // front face, back face offset (40, -28)
  const f: [number, number][] = [[130, 80], [270, 80], [270, 220], [130, 220]]
  const o = (p: [number, number]): [number, number] => [p[0] + 40, p[1] - 28]
  const b = f.map(o)
  // the plus on the front face, centred at (200, 150)
  const cx = 200, cy = 150, a = 46, t = 13
  const plus: [number, number][] = [
    [cx - t, cy - a], [cx + t, cy - a], [cx + t, cy - t], [cx + a, cy - t], [cx + a, cy + t], [cx + t, cy + t],
    [cx + t, cy + a], [cx - t, cy + a], [cx - t, cy + t], [cx - a, cy + t], [cx - a, cy - t], [cx - t, cy - t],
  ]
  const tick = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} L${x2} ${y2}`
  return [
    // hidden edges first, dashed and faint
    { d: P([b[0], b[3]]) + ' ' + P([b[3], b[2]]) + ' ' + P([f[3], b[3]]), stroke: W2, width: 1, dash: true, delay: 0.05 },
    // the visible box
    { d: P(f, true), stroke: W, width: 1.5, delay: 0.1 },
    { d: P([f[0], b[0], b[1], f[1]]), stroke: W, width: 1.5, delay: 0.22 },
    { d: P([b[1], b[2], f[2]]), stroke: W, width: 1.5, delay: 0.3 },
    // the plus
    { d: P(plus, true), stroke: LIME, width: 2, delay: 0.38 },
    // centre lines
    { d: `M${cx - 62} ${cy} L${cx + 62} ${cy} M${cx} ${cy - 62} L${cx} ${cy + 62}`, stroke: W2, width: 0.75, dash: true, delay: 0.42 },
    // dimensions: width, height, depth
    { d: `M130 244 L270 244 ${tick(130, 238, 130, 250)} ${tick(270, 238, 270, 250)}`, stroke: W3, width: 0.9, delay: 0.5 },
    { d: `M106 80 L106 220 ${tick(100, 80, 112, 80)} ${tick(100, 220, 112, 220)}`, stroke: W3, width: 0.9, delay: 0.55 },
    { d: `M282 236 L322 208 ${tick(279, 231, 285, 241)} ${tick(319, 203, 325, 213)}`, stroke: W3, width: 0.9, delay: 0.6 },
  ]
}

/** SVG markup. `animated` adds the line-drawing classes and delays. */
export function blueprintSVG(animated: boolean) {
  const els = lines()
    .map((l) => {
      const dash = l.dash ? ' stroke-dasharray="4 4"' : ''
      if (!animated) return `<path d="${l.d}" fill="none" stroke="${l.stroke}" stroke-width="${l.width}"${dash}/>`
      return l.dash
        ? `<path class="bp-fade" style="animation-delay:${l.delay}s" d="${l.d}" fill="none" stroke="${l.stroke}" stroke-width="${l.width}"${dash}/>`
        : `<path class="bp-line" style="animation-delay:${l.delay}s" pathLength="1" d="${l.d}" fill="none" stroke="${l.stroke}" stroke-width="${l.width}"/>`
    })
    .join('')
  const fade = (delay: number) => (animated ? ` class="bp-fade" style="animation-delay:${delay}s"` : '')
  const text = `
    <g${fade(0.62)} font-family="${FONT}" font-weight="700" fill="${W3}">
      <text x="200" y="262" font-size="9" text-anchor="middle">1200</text>
      <text x="92" y="153" font-size="9" text-anchor="middle" transform="rotate(-90 92 153)">1200</text>
      <text x="314" y="232" font-size="9">280</text>
    </g>
    <g${fade(0.7)} font-family="${FONT}">
      <rect x="232" y="268" width="150" height="26" fill="none" stroke="${W2}" stroke-width="0.75"/>
      <line x1="300" y1="268" x2="300" y2="294" stroke="${W2}" stroke-width="0.75"/>
      <text x="238" y="285" font-size="10" font-weight="800" fill="${W}">p<tspan fill="${LIME}">+</tspan>m</text>
      <text x="306" y="279" font-size="6.5" font-weight="700" fill="${W3}">PRINCE + MARSHALL</text>
      <text x="306" y="289" font-size="6.5" font-weight="700" fill="${W3}">TILE 01 · 1:10</text>
    </g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" aria-hidden="true">${els}${text}</svg>`
}

/** The finished drawing as a CSS url() for the arriving cover. */
export function blueprintDataUri() {
  return `url("data:image/svg+xml,${encodeURIComponent(blueprintSVG(false))}")`
}

/** The drafting grid, as CSS background layers. */
export const BLUEPRINT_GRID =
  'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)'
export const BLUEPRINT_GRID_SIZE = '120px 120px,120px 120px,24px 24px,24px 24px'
