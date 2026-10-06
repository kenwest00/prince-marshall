import { site } from '../data/content'
import Totem from '../components/Totem'

/**
 * Fixed left meta column, separated by a 1px hairline.
 * Collapses to a top bar on mobile.
 */
export default function SideColumn() {
  return (
    <>
      {/* Desktop: fixed left column */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[320px] flex-col justify-between border-r border-[#0a0a0a] bg-white px-8 py-8 md:flex">
        <a href="#home" aria-label="prince + marshall — home">
          <Totem variant="dark" className="h-44 w-auto xl:h-56" wobble intro />
        </a>
        <p className="type-label">
          <span className="block">Research-led</span>
          <span className="block">enterprise tools</span>
        </p>
      </aside>

      {/* Mobile: top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-[#0a0a0a] bg-white px-5 py-4 md:hidden">
        <a href="#home" className="flex items-center gap-3" aria-label="prince + marshall — home">
          <Totem variant="dark" className="h-10 w-auto" />
          <span className="type-label">{site.label}</span>
        </a>
      </header>
    </>
  )
}
