import type { ReactNode } from 'react'

interface PillButtonProps {
  children: ReactNode
  href?: string
  onClick?: (e?: React.MouseEvent) => void
  className?: string
  inverted?: boolean
  ariaLabel?: string
}

export default function PillButton({
  children,
  href,
  onClick,
  className = '',
  inverted = false,
  ariaLabel,
}: PillButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold tracking-tight transition-colors duration-300 select-none'
  const palette = inverted
    ? 'bg-white text-[#0a0a0a] hover:bg-[#ededed]'
    : 'bg-[#0a0a0a] text-white hover:bg-[#c8ff2e] hover:text-[#0a0a0a]'

  const cls = `${base} ${palette} ${className}`

  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick} aria-label={ariaLabel}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  )
}
