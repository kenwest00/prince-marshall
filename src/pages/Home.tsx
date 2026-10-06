import { useCallback, useEffect, useRef, useState } from 'react'
import SideColumn from '../sections/SideColumn'
import Preloader from '../sections/Preloader'
import Hero from '../sections/Hero'
import Statement from '../sections/Statement'
import Method from '../sections/Method'
import Kura from '../sections/Kura'
import Environments from '../sections/Environments'
import Trust from '../sections/Trust'
import Studio from '../sections/Studio'
import Faq from '../sections/Faq'
import StructuredData from '../components/StructuredData'
import Contact from '../sections/Contact'
import Footer from '../sections/Footer'
import MenuOverlay from '../components/MenuOverlay'
import MenuLabel from '../components/MenuLabel'
import ScrollProgress from '../components/ScrollProgress'
import TransitionOverlay, { type TransitionHandle } from '../components/TransitionOverlay'
import PillButton from '../components/PillButton'
import { getLenis, refreshScroll, scrollToTarget, startScroll, stopScroll } from '../lib/motion'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const transitionRef = useRef<TransitionHandle>(null)

  // Smooth scroll infrastructure
  useEffect(() => {
    getLenis()
  }, [])

  // Lock scroll while the preloader runs
  useEffect(() => {
    if (!loaded) {
      stopScroll()
      return
    }
    startScroll()
    refreshScroll()
  }, [loaded])

  // Route in-page anchors through lenis
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.length < 2) return
      if (anchor.closest('[data-no-smooth]')) return
      e.preventDefault()
      scrollToTarget(href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const handlePreloaderDone = useCallback(() => setLoaded(true), [])

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false)
    if (!transitionRef.current?.isActive()) startScroll()
  }, [])

  const handleMenuNavigate = useCallback((href: string) => {
    setMenuOpen(false)
    transitionRef.current?.go(href)
  }, [])

  return (
    <>
      <a
        href="#main"
        data-no-smooth
        className="fixed left-3 top-3 z-[80] -translate-y-20 bg-[#0a0a0a] px-4 py-3 text-sm font-bold text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <StructuredData />
      <Preloader onDone={handlePreloaderDone} />

      <SideColumn />

      {/* Menu button — top right of viewport, label rolls Menu ⇄ Close */}
      <div className="fixed right-5 top-5 z-50 md:right-8 md:top-8">
        <PillButton onClick={() => setMenuOpen((v) => !v)} ariaLabel={menuOpen ? 'Close menu' : 'Open menu'}>
          <MenuLabel open={menuOpen} />
        </PillButton>
      </div>

      <MenuOverlay open={menuOpen} onClose={handleMenuClose} onNavigate={handleMenuNavigate} />

      <TransitionOverlay ref={transitionRef} />

      <ScrollProgress />

      {/* Main content, offset by the fixed left column */}
      <main id="main" className="md:ml-[320px]">
        <Hero active={loaded} />
        <Statement />
        <Method />
        <Kura />
        <Environments />
        <Trust />
        <Studio />
        <Faq />
        <Contact />
        <Footer />
      </main>
    </>
  )
}
