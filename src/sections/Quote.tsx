import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { quote } from '../data/content'
import { reducedMotion, useWordReveal } from '../lib/motion'

function useLiveClock() {
  const [time, setTime] = useState('00:00:00')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`)
    }
    update()
    const id = window.setInterval(update, 1000)
    return () => window.clearInterval(id)
  }, [])

  return time
}

/** A clock group (two digits) that rolls gently whenever its value changes. */
function DigitGroup({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prevRef = useRef(value)

  useEffect(() => {
    if (prevRef.current === value) return
    prevRef.current = value
    if (reducedMotion || !ref.current) return
    gsap.fromTo(
      ref.current,
      { yPercent: 45, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }
    )
  }, [value])

  return (
    <span ref={ref} className="inline-block tabular-nums will-change-transform">
      {value}
    </span>
  )
}

export default function Quote() {
  const time = useLiveClock()
  const [hh, mm, ss] = time.split(':')
  const beforeRef = useWordReveal<HTMLSpanElement>({ stagger: 0.06 })
  const afterRef = useWordReveal<HTMLSpanElement>({ stagger: 0.06 })

  return (
    <section className="px-5 py-28 md:px-10 md:py-48">
      <div className="mx-auto max-w-6xl">
        <p className="type-statement text-left">
          <span ref={beforeRef} className="inline">
            {quote.before}
          </span>{' '}
          <span className="outline-text whitespace-nowrap font-bold">
            (<DigitGroup value={hh} />
            <span className="mx-[0.06em]">:</span>
            <DigitGroup value={mm} />
            <span className="mx-[0.06em]">:</span>
            <DigitGroup value={ss} />)
          </span>{' '}
          <span ref={afterRef} className="inline">
            {quote.after}
          </span>
        </p>
      </div>
    </section>
  )
}
