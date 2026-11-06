import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/* Minimal typings for the Web Speech API (not in lib.dom for every TS target). */
type SpeechAlt = { transcript: string }
type SpeechResult = { isFinal: boolean; 0: SpeechAlt; length: number }
type SpeechEvent = { resultIndex: number; results: { length: number; [i: number]: SpeechResult } }
type SpeechErrorEvent = { error: string }
interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: SpeechEvent) => void) | null
  onerror: ((e: SpeechErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type RecognitionCtor = new () => Recognition

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export const voiceSupported = !!getCtor()

const join = (base: string, said: string) => {
  const b = base.replace(/\s+$/, '')
  const s = said.trim()
  if (!s) return base
  if (!b) return s.charAt(0).toUpperCase() + s.slice(1)
  const sep = /[.!?]$/.test(b) ? ' ' : b.endsWith('\n') ? '' : ' '
  return b + sep + (/[.!?]$/.test(b) ? s.charAt(0).toUpperCase() + s.slice(1) : s)
}

/**
 * Hold-to-talk dictation. While held, speech streams into the answer
 * (interim words included); letting go keeps the text so it can be edited.
 * The meter element receives a --lvl custom property (0–1) from the mic level.
 */
export function useHoldToTalk({ getBase, onText }: { getBase: () => string; onText: (text: string) => void }) {
  const [listening, setListening] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const recRef = useRef<Recognition | null>(null)
  const baseRef = useRef('')
  const meterRef = useRef<HTMLSpanElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef(0)
  const wantRef = useRef(false)
  const onTextRef = useRef(onText)
  useLayoutEffect(() => {
    onTextRef.current = onText
  }, [onText])

  const stopMeter = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
    meterRef.current?.style.setProperty('--lvl', '0')
  }, [])

  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!wantRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AC()
      ctxRef.current = ctx
      const an = ctx.createAnalyser()
      an.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(an)
      const buf = new Uint8Array(an.fftSize)
      let smooth = 0
      const tick = () => {
        an.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.min(1, Math.sqrt(sum / buf.length) * 4)
        smooth += (rms - smooth) * 0.35
        meterRef.current?.style.setProperty('--lvl', smooth.toFixed(3))
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      /* the meter is decorative; recognition reports permission problems itself */
    }
  }, [])

  const stop = useCallback(() => {
    wantRef.current = false
    try {
      recRef.current?.stop()
    } catch {
      /* already stopped */
    }
    stopMeter()
  }, [stopMeter])

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor || recRef.current) return
    wantRef.current = true
    baseRef.current = getBase()
    const rec = new Ctor()
    rec.lang = navigator.language || 'en-US'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let said = ''
      for (let i = 0; i < e.results.length; i++) said += e.results[i][0].transcript
      onTextRef.current(join(baseRef.current, said))
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setBlocked(true)
    }
    rec.onend = () => {
      recRef.current = null
      setListening(false)
      stopMeter()
    }
    try {
      rec.start()
      recRef.current = rec
      setListening(true)
      setBlocked(false)
      startMeter()
    } catch {
      recRef.current = null
    }
  }, [getBase, startMeter, stopMeter])

  useEffect(
    () => () => {
      wantRef.current = false
      recRef.current?.abort()
      stopMeter()
    },
    [stopMeter],
  )

  return { supported: voiceSupported, listening, blocked, start, stop, meterRef }
}
