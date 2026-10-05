import { statement } from '../data/content'
import { useWordReveal } from '../lib/motion'

export default function Statement() {
  const ref = useWordReveal<HTMLHeadingElement>({ stagger: 0.08 })

  return (
    <section id="statement" className="px-5 py-28 md:px-10 md:py-48">
      <div className="mx-auto max-w-6xl">
        <h2 ref={ref} className="type-statement text-left">
          {statement.lines.map((line) => (
            <span key={line.text} className={`block ${line.align === 'right' ? 'text-right' : 'text-left'}`}>
              {line.text}
            </span>
          ))}
        </h2>
      </div>
    </section>
  )
}
