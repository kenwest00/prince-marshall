import { useEffect, useState } from 'react'
import { getLenis } from '../lib/motion'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0
      setProgress(Math.round(pct))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    const lenis = getLenis()
    if (lenis) {
      lenis.on('scroll', schedule)
    } else {
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
    }
    return () => {
      if (lenis) lenis.off('scroll', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-5 z-[55] hidden mix-blend-difference md:right-8 md:block" aria-hidden="true">
      <span className="type-label text-white">{progress}%</span>
    </div>
  )
}
