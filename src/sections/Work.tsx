import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { work, type Project } from '../data/content'
import { reducedMotion, useWordReveal } from '../lib/motion'
import PillButton from '../components/PillButton'
import RollText from '../components/RollText'

/** Abstract geometric motif per project — pure SVG, no external images. */
function Motif({ index }: { index: string }) {
  const stroke = 'currentColor'
  const common = { stroke, strokeWidth: 2, fill: 'none' as const }
  const motifs: Record<string, ReactNode> = {
    '01': (
      <>
        <circle cx="160" cy="120" r="46" {...common} />
        <circle cx="160" cy="120" r="10" fill="currentColor" />
      </>
    ),
    '02': (
      <>
        <line x1="80" y1="170" x2="240" y2="70" {...common} />
        <line x1="80" y1="70" x2="240" y2="170" {...common} />
        <circle cx="160" cy="120" r="14" fill="currentColor" />
      </>
    ),
    '03': (
      <>
        <rect x="118" y="78" width="84" height="84" {...common} />
        <circle cx="118" cy="78" r="8" fill="currentColor" />
      </>
    ),
    '04': (
      <>
        <path d="M110 170 L160 70 L210 170 Z" {...common} />
        <line x1="128" y1="140" x2="192" y2="140" {...common} />
      </>
    ),
    '05': (
      <>
        <path d="M160 70 A50 50 0 0 1 160 170 Z" fill="currentColor" />
        <circle cx="160" cy="120" r="50" {...common} />
      </>
    ),
    '06': (
      <>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={100 + i * 30} y1="76" x2={100 + i * 30} y2="164" {...common} />
        ))}
      </>
    ),
  }
  return (
    <svg viewBox="0 0 320 240" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {motifs[index]}
    </svg>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const visual = visualRef.current
    const inner = innerRef.current
    if (!card || !visual || !inner || reducedMotion) return

    const ctx = gsap.context(() => {
      // clip-down reveal of the visual
      gsap.fromTo(
        visual,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        }
      )
      // inner visual parallax (scrub)
      gsap.fromTo(
        inner,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: 1 },
        }
      )
    }, card)

    const enter = () =>
      gsap.to(inner, { scale: 1.06, duration: 0.6, ease: 'expo.out', overwrite: 'auto' })
    const leave = () =>
      gsap.to(inner, { scale: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' })
    card.addEventListener('mouseenter', enter)
    card.addEventListener('mouseleave', leave)

    return () => {
      card.removeEventListener('mouseenter', enter)
      card.removeEventListener('mouseleave', leave)
      ctx.revert()
    }
  }, [])

  return (
    <a href="#work" ref={cardRef} className="group block text-[#0a0a0a]" aria-label={project.title}>
      <div ref={visualRef} className="relative aspect-[4/3] w-full overflow-hidden bg-[#ededed] transition-colors duration-300 group-hover:bg-[#0a0a0a] group-hover:text-white">
        <div ref={innerRef} className="absolute inset-0 will-change-transform">
          <span className="absolute left-4 top-3 font-display text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-[-0.03em] md:left-6 md:top-4">
            {project.index}
          </span>
          <span className="absolute inset-0 opacity-40">
            <Motif index={project.index} />
          </span>
          <span className="absolute bottom-3 right-4 type-label md:bottom-4 md:right-6">
            {project.year}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-xl leading-none tracking-[-0.02em] md:text-2xl">
          <RollText text={project.title} />
        </h3>
        <span className="type-label shrink-0 text-[#0a0a0a]/60">{project.tags.join(', ')}</span>
      </div>
    </a>
  )
}

export default function Work() {
  const headingRef = useWordReveal<HTMLHeadingElement>()

  return (
    <section id="work" className="px-5 py-24 md:px-10 md:py-36">
      {/* section header row */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-8 md:pb-12">
        <h2 ref={headingRef} className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-none tracking-[-0.03em]">
          {work.heading}
        </h2>
        <div className="flex items-center gap-6">
          <span className="type-label text-base md:text-lg">{work.years}</span>
          <PillButton href="#work">
            <RollText text={work.allWorksLabel} />
          </PillButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
        {work.projects.map((project) => (
          <ProjectCard key={project.index} project={project} />
        ))}
      </div>
    </section>
  )
}
