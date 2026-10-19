/**
 * Post-build step. Reads the same content.ts that powers the React app and
 * writes a crawler-readable HTML version of the page into #root. React replaces
 * it on load, so people see the interactive site; crawlers and AI answer
 * engines that do not run JavaScript still get the full content.
 * Also writes dist/404.html.
 */
import { buildSync } from 'esbuild'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const tmp = mkdtempSync(join(tmpdir(), 'pm-'))
const out = join(tmp, 'content.mjs')
buildSync({
  entryPoints: [join(root, 'src/data/content.ts')],
  outfile: out,
  bundle: true,
  format: 'esm',
  platform: 'node',
})
const c = await import(pathToFileURL(out).href)

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const li = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`

const html = `
<header><p>${esc(c.site.name)}</p></header>
<main>
  <section id="home">
    <h1>${esc(c.site.name)} — ${c.hero.stackedLines.map((l) => esc(l.text)).join(' ')}</h1>
    <p>${esc(c.hero.statement)}</p>
    <p><a href="#contact">${esc(c.hero.primaryCta)}</a> <a href="${esc(c.hero.secondaryHref)}">${esc(c.hero.secondaryCta)}</a></p>
    <ol>${c.hero.stages.map((s) => `<li><strong>${esc(s.name)}:</strong> ${esc(s.line)}</li>`).join('')}</ol>
  </section>
  <section id="${c.audiences.id}">
    <h2>${esc(c.audiences.label)}</h2>
    ${li(c.audiences.items.map((a) => `<a href="${esc(a.href)}">${esc(a.label)}</a>: ${esc(a.line)}`))}
  </section>
  <section id="statement"><h2>${c.statement.lines.map((l) => esc(l.text)).join(' ')}</h2></section>
  <section id="${c.clients.id}"><h2>${esc(c.clients.heading)}</h2>${li(c.clients.items.map((i) => esc(i.name)))}</section>
  <section id="${c.method.id}">
    <h2>${esc(c.method.heading)}</h2>
    <p>${esc(c.method.intro)}</p>
    <ol>${c.method.steps
      .map((s) => `<li><h3>${esc(s.name)}</h3><p>${esc(s.body)}</p><p>You get: ${esc(s.deliverable)}</p></li>`)
      .join('')}</ol>
  </section>
  <section id="${c.kura.id}">
    <p>${esc(c.kura.flagEyebrow)} · ${esc(c.kura.status)}</p>
    <h2>${esc(c.kura.heading)}</h2>
    <p>${esc(c.kura.sceneIntro)}</p>
    <p>${esc(c.kura.intro)}</p>
    <h3>${esc(c.kura.beforeLabel)}: ${esc(c.kura.before.name)}</h3>
    <p>${esc(c.kura.beforeStatement)}</p>
    ${li(c.kura.scene.problems.map((pr) => esc(pr.text)))}
    <h3>${esc(c.kura.afterLabel)}: ${esc(c.kura.exampleLabel)}</h3>
    ${li(c.kura.card.map((r) => `<strong>${esc(r.label)}:</strong> ${esc(r.value)}`))}
    ${li(c.kura.outcomes.map((o) => `<strong>${esc(o.title)}:</strong> ${esc(o.body)}`))}
    ${li(c.kura.pillars.map((p) => `<strong>${esc(p.title)}:</strong> ${esc(p.body)}`))}
    <h3>${esc(c.kura.rulesHeading)}</h3>
    ${li(c.kura.rules.map(esc))}
    <p>${esc(c.kura.closing)} <a href="${esc(c.kura.pageLink.href)}">${esc(c.kura.pageLink.label)}</a></p>
  </section>
  <section id="${c.environments.id}">
    <h2>${esc(c.environments.heading)}</h2>
    <p>${esc(c.environments.intro)}</p>
    ${c.environments.items
      .map((i) => `<h3>${esc(i.title)}</h3><p>${esc(i.different)}</p><p>Typical tools: ${esc(i.tools)}</p>${i.link ? `<p>${esc(i.link.lead)} <a href="${esc(i.link.href)}">${esc(i.link.label)}</a></p>` : ''}`)
      .join('')}
  </section>
  <section id="${c.trust.id}">
    <h2>${esc(c.trust.heading)}</h2>
    <p>${esc(c.trust.intro)}</p>
    ${li(c.trust.items.map((i) => `<strong>${esc(i.title)}:</strong> ${esc(i.body)}`))}
  </section>
  <section id="${c.studio.id}">
    <h2>${esc(c.studio.heading)}</h2>
    ${c.studio.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
  </section>
  <section id="${c.partners.id}">
    <h2>${esc(c.partners.heading)}</h2>
    <p>${esc(c.partners.intro)}</p>
    <h3>${esc(c.partners.whoHeading)}</h3>
    ${li(c.partners.who.map((w) => `<strong>${esc(w.title)}:</strong> ${esc(w.body)}`))}
    <h3>${esc(c.partners.getHeading)}</h3>
    ${li([...c.partners.get, c.partners.referral].filter(Boolean).map(esc))}
  </section>
  <section id="${c.faq.id}">
    <h2>${esc(c.faq.heading)}</h2>
    ${c.faq.items.map((i) => `<h3>${esc(i.q)}</h3><p>${esc(i.a)}</p>`).join('')}
  </section>
  <section id="${c.contact.id}">
    <h2>${esc(c.contact.heading)}</h2>
    <p><a href="mailto:${esc(c.site.email)}">${esc(c.site.email)}</a></p>
    ${li(c.contact.next.steps.map(esc))}
  </section>
</main>
<footer><p>${esc(c.footer.left)}</p><p><a href="${esc(c.rideAlong.footerLink.href)}">${esc(c.rideAlong.footerLink.label)}</a></p></footer>`

const distIndex = join(root, 'dist/index.html')
const page = readFileSync(distIndex, 'utf8')
if (!page.includes('<div id="root"></div>')) throw new Error('#root placeholder not found in dist/index.html')
const injected = page.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
writeFileSync(distIndex, injected)
writeFileSync(join(root, 'dist/404.html'), injected)
console.log('Injected static content into dist/index.html and wrote dist/404.html')

/* ---------------- /ride-along/ ---------------- */
const r = c.rideAlong
const money = (n) => `$${n.toLocaleString('en-US')}`
const rideHtml = `
<header><p><a href="../">${esc(c.site.name)}</a></p></header>
<main>
  <section id="top">
    <p>${esc(r.hero.label)}</p>
    <h1>${esc(r.hero.h1)}</h1>
    <p>${esc(r.hero.sub)}</p>
    <p><strong>${esc(r.hero.priceStrong)}</strong> ${esc(r.hero.priceRest)}</p>
    <p>${esc(r.hero.under)}</p>
    <p><a href="#note">${esc(r.cta.book)}</a></p>
  </section>
  <section id="why"><h2>${esc(r.why.heading)}</h2>${r.why.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
    ${li(r.why.trades.map((t) => `<strong>${esc(t.title)}:</strong> ${esc(t.body)}`))}</section>
  <section id="calculator"><h2>${esc(r.calculator.heading)}</h2><p>${esc(r.calculator.intro)}</p></section>
  <section id="outcomes"><h2>${esc(r.outcomes.heading)}</h2>
    ${li(r.outcomes.items.map((i) => `<strong>${esc(i.title)}:</strong> ${esc(i.body)}`))}<p>${esc(r.outcomes.closing)}</p></section>
  <section id="how"><h2>${esc(r.how.heading)}</h2><ol>${r.how.steps
    .map((s) => `<li><h3>${esc(s.name)} (${esc(s.when)})</h3><p>${esc(s.body)}</p><p>You get: ${esc(s.deliverable)}</p></li>`)
    .join('')}</ol></section>
  <section id="guarantee"><h2>${esc(r.guarantee.heading)}</h2><p>${esc(r.guarantee.body)}</p><p>${esc(r.guarantee.line)}</p></section>
  <section id="price"><h2>${esc(r.pricing.heading)}</h2><p>${money(r.price)}, ${esc(r.pricing.fixed)}.</p>
    <h3>${esc(r.pricing.includedHeading)}</h3>${li(r.pricing.included.map(esc))}
    <h3>${esc(r.pricing.termsHeading)}</h3>${li([...r.pricing.terms, r.pricing.foundingRate, r.pricing.capacity, r.pricing.referral].filter(Boolean).map(esc))}</section>
  <section id="about"><h2>${esc(r.about.heading)}</h2>${r.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}<p>${esc(r.about.location)}</p></section>
  <section id="questions"><h2>${esc(r.faq.heading)}</h2>${r.faq.items.map((i) => `<h3>${esc(i.q)}</h3><p>${esc(i.a)}</p>`).join('')}</section>
  <section id="note"><h2>${esc(r.final.heading)}</h2><p><a href="mailto:${esc(c.site.email)}">${esc(c.site.email)}</a></p></section>
</main>
<footer><p>${esc(c.footer.left)}</p><p><a href="../">${esc(r.footerHome.label)}</a></p></footer>`

const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`
const rideLd = [
  ld({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'The Ride-Along',
    url: r.url,
    description: r.description,
    serviceType: 'Operations review and setup for trades businesses',
    audience: { '@type': 'BusinessAudience', audienceType: 'HVAC, plumbing and pest control businesses' },
    areaServed: 'US',
    provider: { '@type': 'ProfessionalService', name: c.site.name, url: c.site.url, email: c.site.email },
    offers: { '@type': 'Offer', price: String(r.price), priceCurrency: 'USD', url: r.url },
  }),
  ld({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: r.url,
    mainEntity: r.faq.items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  }),
].join('\n    ')

const rideIndex = join(root, 'dist/ride-along/index.html')
let ridePage = readFileSync(rideIndex, 'utf8')
if (!ridePage.includes('<div id="root"></div>')) throw new Error('#root placeholder not found in dist/ride-along/index.html')
if (!ridePage.includes('<!-- structured-data -->')) throw new Error('structured-data marker not found in dist/ride-along/index.html')
ridePage = ridePage
  .replace('<div id="root"></div>', `<div id="root">${rideHtml}</div>`)
  .replace('<!-- structured-data -->', rideLd)
writeFileSync(rideIndex, ridePage)
console.log('Injected static content and JSON-LD into dist/ride-along/index.html')

/* ---------------- /kura/ ---------------- */
const k = c.kuraPage
const kc = c.kura
const kuraHtml = `
<header><p><a href="../">${esc(c.site.name)}</a></p></header>
<main>
  <section>
    <p>${esc(k.label)}</p>
    <h1>${esc(k.h1)}</h1>
    <p>${esc(k.sub)}</p>
    <p><a href="#contact">${esc(kc.cta)}</a></p>
  </section>
  <section id="record">
    <h2>${esc(kc.beforeLabel)}: ${esc(kc.before.name)}</h2>
    <p>${esc(kc.beforeStatement)}</p>
    ${li(kc.scene.problems.map((pr) => esc(pr.text)))}
    <h2>${esc(kc.afterLabel)}: ${esc(kc.exampleLabel)}</h2>
    ${li(kc.card.map((r) => `<strong>${esc(r.label)}:</strong> ${esc(r.value)}`))}
  </section>
  <section><h2>${esc(k.replaces.heading)}</h2>${li(k.replaces.items.map((i) => `<strong>${esc(i.title)}:</strong> ${esc(i.body)}`))}</section>
  <section><h2>${esc(k.outcomesHeading)}</h2>${li(kc.outcomes.map((o) => `<strong>${esc(o.title)}:</strong> ${esc(o.body)}`))}</section>
  <section><h2>${esc(k.anatomyHeading)}</h2><ol>${kc.pillars.map((p) => `<li><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`).join('')}</ol></section>
  <section><h2>${esc(k.whoHeading)}</h2>${li(k.who.map((i) => `<strong>${esc(i.title)}:</strong> ${esc(i.body)}`))}</section>
  ${kc.starterEnabled ? `<section><h2>${esc(k.starter.heading)}</h2><p>${esc(k.starter.body)}</p></section>` : ''}
  <section>
    <h2>${esc(k.buyingHeading)}</h2>
    <p>${esc(k.pricing || k.pricingFallback)}</p>
    <dl>${k.buying.filter((b) => b.value).map((b) => `<dt>${esc(b.label)}</dt><dd>${esc(b.value)}</dd>`).join('')}</dl>
  </section>
  <section><h2>${esc(k.faqHeading)}</h2>${k.faq.map((i) => `<h3>${esc(i.q)}</h3><p>${esc(i.a)}</p>`).join('')}</section>
  <section id="contact"><h2>${esc(k.finalHeading)}</h2><p><a href="mailto:${esc(c.site.email)}">${esc(c.site.email)}</a></p></section>
</main>
<footer><p>${esc(c.footer.left)}</p><p><a href="../">${esc(k.footerHome.label)}</a></p></footer>`

const kuraLd = [
  ld({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KURA',
    url: k.url,
    description: k.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    publisher: { '@type': 'Organization', name: c.site.name, url: c.site.url, email: c.site.email },
  }),
  ...(k.faq.length
    ? [ld({ '@context': 'https://schema.org', '@type': 'FAQPage', url: k.url, mainEntity: k.faq.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) })]
    : []),
].join('\n    ')

const kuraIndex = join(root, 'dist/kura/index.html')
let kuraFile = readFileSync(kuraIndex, 'utf8')
if (!kuraFile.includes('<div id="root"></div>')) throw new Error('#root placeholder not found in dist/kura/index.html')
if (!kuraFile.includes('<!-- structured-data -->')) throw new Error('structured-data marker not found in dist/kura/index.html')
kuraFile = kuraFile.replace('<div id="root"></div>', `<div id="root">${kuraHtml}</div>`).replace('<!-- structured-data -->', kuraLd)
writeFileSync(kuraIndex, kuraFile)
console.log('Injected static content and JSON-LD into dist/kura/index.html')
