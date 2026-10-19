import type { Client } from '../data/content'

/**
 * Original sector pictograms for the client index, drawn on a 100 × 100 grid.
 * Bold filled shapes with knockouts, so they read as solids and sample cleanly
 * into tiles. These are generic symbols, never a client's logo.
 */
type Ctx = CanvasRenderingContext2D
type Icon = NonNullable<Client['icon']>

const rr = (c: Ctx, x: number, y: number, w: number, h: number, r = 3) => {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
  c.fill()
}
const cut = (c: Ctx, f: () => void) => {
  c.save()
  c.globalCompositeOperation = 'destination-out'
  f()
  c.restore()
}
const poly = (c: Ctx, pts: number[]) => {
  c.beginPath()
  for (let i = 0; i < pts.length; i += 2) (i ? c.lineTo : c.moveTo).call(c, pts[i], pts[i + 1])
  c.closePath()
  c.fill()
}

const DRAW: Record<Icon, (c: Ctx) => void> = {
  laptop: (c) => {
    rr(c, 18, 20, 64, 46, 5)
    cut(c, () => rr(c, 25, 27, 50, 32, 2))
    poly(c, [8, 70, 92, 70, 86, 80, 14, 80])
    cut(c, () => rr(c, 42, 70, 16, 3, 1))
  },
  chip: (c) => {
    rr(c, 26, 26, 48, 48, 5)
    cut(c, () => rr(c, 33, 33, 34, 34, 2))
    rr(c, 40, 40, 20, 20, 2)
    for (let i = 0; i < 4; i++) {
      const o = 31 + i * 11
      rr(c, o, 12, 5, 12, 1.5)
      rr(c, o, 76, 5, 12, 1.5)
      rr(c, 12, o, 12, 5, 1.5)
      rr(c, 76, o, 12, 5, 1.5)
    }
  },
  home: (c) => {
    poly(c, [50, 10, 92, 46, 80, 46, 50, 21, 20, 46, 8, 46])
    rr(c, 20, 46, 60, 42, 2)
    poly(c, [20, 46, 50, 21, 80, 46])
    cut(c, () => {
      rr(c, 43, 62, 14, 26, 2)
      rr(c, 27, 54, 11, 11, 1.5)
      rr(c, 62, 54, 11, 11, 1.5)
    })
    rr(c, 66, 18, 8, 16, 1)
  },
  tower: (c) => {
    poly(c, [50, 32, 34, 90, 66, 90])
    cut(c, () => poly(c, [50, 48, 42, 90, 58, 90]))
    rr(c, 38, 66, 24, 4, 1)
    c.beginPath()
    c.arc(50, 24, 6, 0, Math.PI * 2)
    c.fill()
    c.lineWidth = 5.5
    c.lineCap = 'round'
    c.strokeStyle = c.fillStyle
    for (const r of [15, 26]) {
      c.beginPath()
      c.arc(50, 24, r, -0.75, 0.75)
      c.stroke()
      c.beginPath()
      c.arc(50, 24, r, Math.PI - 0.75, Math.PI + 0.75)
      c.stroke()
    }
  },
  capitol: (c) => {
    rr(c, 48, 8, 4, 12, 1)
    c.beginPath()
    c.arc(50, 40, 18, Math.PI, 0)
    c.fill()
    rr(c, 30, 38, 40, 5, 1)
    poly(c, [50, 42, 14, 54, 86, 54])
    for (let i = 0; i < 6; i++) rr(c, 19 + i * 11.4, 57, 6, 22, 1)
    rr(c, 12, 80, 76, 5, 1)
    rr(c, 8, 86, 84, 5, 1)
  },
  skyline: (c) => {
    rr(c, 8, 56, 16, 32, 1.5)
    rr(c, 26, 38, 16, 50, 1.5)
    rr(c, 44, 22, 14, 66, 1.5)
    poly(c, [44, 22, 51, 8, 58, 22])
    rr(c, 60, 44, 16, 44, 1.5)
    rr(c, 78, 60, 14, 28, 1.5)
    cut(c, () => {
      for (let y = 44; y < 82; y += 9) {
        rr(c, 30, y, 3, 5, 0.5)
        rr(c, 35, y, 3, 5, 0.5)
      }
      for (let y = 30; y < 82; y += 9) rr(c, 49, y, 4, 5, 0.5)
      for (let y = 50; y < 82; y += 9) {
        rr(c, 64, y, 3, 5, 0.5)
        rr(c, 69, y, 3, 5, 0.5)
      }
    })
    rr(c, 4, 88, 92, 4, 1)
  },
  envelope: (c) => {
    rr(c, 12, 24, 76, 52, 5)
    cut(c, () => {
      c.lineWidth = 6
      c.lineJoin = 'round'
      c.beginPath()
      c.moveTo(14, 28)
      c.lineTo(50, 56)
      c.lineTo(86, 28)
      c.stroke()
    })
  },
}

/** Draws the icon solid white into a new square canvas of `size` px. */
export function renderIcon(icon: Icon, size: number) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const x = c.getContext('2d', { willReadFrequently: true })
  if (!x) return c
  x.scale(size / 100, size / 100)
  x.fillStyle = '#ffffff'
  DRAW[icon](x)
  return c
}
