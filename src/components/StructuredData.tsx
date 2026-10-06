import { useEffect } from 'react'
import { faq, site } from '../data/content'

/** Injects FAQPage JSON-LD built from the same data that renders the FAQ. */
export default function StructuredData() {
  useEffect(() => {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'ld-faq'
    el.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      url: site.url,
      mainEntity: faq.items.map((i) => ({
        '@type': 'Question',
        name: i.q,
        acceptedAnswer: { '@type': 'Answer', text: i.a },
      })),
    })
    document.head.appendChild(el)
    return () => el.remove()
  }, [])
  return null
}
