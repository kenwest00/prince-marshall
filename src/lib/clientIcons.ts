import type { Client } from '../data/content'
import { SIGNAL } from './palette'

/**
 * Client index tiles: a solid square in the p+m tile language, set like a
 * periodic-table element. Index number top left, monogram centre, sector tag
 * bottom left, one lime square top right. Type is knocked out of the tile.
 * Our own typography, never a client's logo.
 */
const FONT = "Archivo, 'Helvetica Neue', Arial, sans-serif"

export function renderTile(client: Client, index: number, size: number) {
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
  // monogram, fitted
  const mono = client.mono ?? client.name.slice(0, 2)
  let fs = s * 0.46
  x.font = `800 ${fs}px ${FONT}`
  const w = x.measureText(mono).width
  if (w > s * 0.76) fs = (fs * s * 0.76) / w
  x.font = `800 ${fs}px ${FONT}`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillText(mono, s / 2 - fs * 0.015, s * 0.52)
  x.restore()

  // the lime square
  const q = s * 0.1
  x.fillStyle = SIGNAL
  x.fillRect(s - pad - q, pad, q, q)
  return c
}
