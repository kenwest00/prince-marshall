import type { Client } from '../data/content'
import { SIGNAL } from './palette'
import apple from '../assets/clients/apple.svg'
import ibm from '../assets/clients/ibm.svg'
import atandt from '../assets/clients/atandt.svg'
import homedepot from '../assets/clients/homedepot.svg'
import connecticut from '../assets/clients/connecticut.svg'
import pepsico from '../assets/clients/pepsico.svg'
import downtownatl from '../assets/clients/downtownatl.svg'
import japanpost from '../assets/clients/japanpost.svg'

export const LOGO_URLS: Record<NonNullable<Client['logo']>, string> = { apple, ibm, atandt, homedepot, connecticut, pepsico, downtownatl, japanpost }

/** Cut the dark parts of a logo out of the tile; light parts stay tile-white. */
function knockLogo(x: CanvasRenderingContext2D, img: HTMLImageElement, s: number) {
  const iw = img.naturalWidth || img.width || 1
  const ih = img.naturalHeight || img.height || 1
  const k = Math.min((s * 0.66) / iw, (s * 0.44) / ih)
  const w = Math.max(1, Math.round(iw * k))
  const h = Math.max(1, Math.round(ih * k))
  const t = document.createElement('canvas')
  t.width = w
  t.height = h
  const tc = t.getContext('2d', { willReadFrequently: true })
  if (!tc) return
  tc.drawImage(img, 0, 0, w, h)
  const d = tc.getImageData(0, 0, w, h)
  const p = d.data
  for (let i = 0; i < p.length; i += 4) {
    const lum = (0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2]) / 255
    p[i + 3] = Math.round(p[i + 3] * (1 - lum))
    p[i] = p[i + 1] = p[i + 2] = 0
  }
  tc.putImageData(d, 0, 0)
  x.save()
  x.globalCompositeOperation = 'destination-out'
  x.drawImage(t, Math.round((s - w) / 2), Math.round(s * 0.52 - h / 2))
  x.restore()
}

/**
 * Client index tiles: a solid square in the p+m tile language, set like a
 * periodic-table element. Index number top left, the client's logo (one
 * colour) or a monogram in the centre, sector tag bottom left, a lime plus
 * top right. Everything is knocked out of the tile.
 */
const FONT = "Archivo, 'Helvetica Neue', Arial, sans-serif"

export function renderTile(client: Client, index: number, size: number, logo?: HTMLImageElement) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const x = c.getContext('2d', { willReadFrequently: true })
  if (!x) return c
  const s = size
  const pad = s * 0.075

  x.fillStyle = '#ffffff'
  x.fillRect(0, 0, s, s)

  x.save()
  x.globalCompositeOperation = 'destination-out'
  x.fillStyle = '#000'
  // index number
  x.textBaseline = 'top'
  x.textAlign = 'left'
  x.font = `700 ${Math.round(s * 0.085)}px ${FONT}`
  x.fillText(String(index + 1).padStart(2, '0'), pad, pad)
  // sector tag
  x.textBaseline = 'alphabetic'
  x.font = `700 ${Math.round(s * 0.062)}px ${FONT}`
  if ('letterSpacing' in x) (x as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${(s * 0.006).toFixed(1)}px`
  x.fillText((client.tag ?? '').toUpperCase(), pad, s - pad)
  if ('letterSpacing' in x) (x as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  x.restore()
  if (logo) knockLogo(x, logo, s)
  x.save()
  x.globalCompositeOperation = 'destination-out'
  x.fillStyle = '#000'
  // monogram, fitted
  const mono = client.mono ?? client.name.slice(0, 2)
  let fs = s * 0.46
  x.font = `800 ${fs}px ${FONT}`
  const w = x.measureText(mono).width
  if (w > s * 0.76) fs = (fs * s * 0.76) / w
  x.font = `800 ${fs}px ${FONT}`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  if (!logo) x.fillText(mono, s / 2 - fs * 0.015, s * 0.52)
  x.restore()

  // the lime plus, as in the p+m mark
  const q = s * 0.1
  const bar = q * 0.3
  const px0 = s - pad - q
  x.fillStyle = SIGNAL
  x.fillRect(px0, pad + (q - bar) / 2, q, bar)
  x.fillRect(px0 + (q - bar) / 2, pad, bar, q)
  return c
}
