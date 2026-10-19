import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/archivo/500.css'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/800.css'
import '@fontsource-variable/space-grotesk'
import '../index.css'
import KuraPage from '../pages/KuraPage'

import { installGrain } from '../lib/grain'
import { installPageLinks } from '../lib/pageTransition'

installPageLinks()
installGrain()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KuraPage />
  </StrictMode>,
)
