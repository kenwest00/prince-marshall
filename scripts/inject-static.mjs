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
    <p><a href="#contact">${esc(c.hero.primaryCta)}</a></p>
  </section>
  <section id="statement"><h2>${c.statement.lines.map((l) => esc(l.text)).join(' ')}</h2></section>
  <section id="${c.method.id}">
    <h2>${esc(c.method.heading)}</h2>
    <p>${esc(c.method.intro)}</p>
    <ol>${c.method.steps
      .map((s) => `<li><h3>${esc(s.name)}</h3><p>${esc(s.body)}</p><p>You get: ${esc(s.deliverable)}</p></li>`)
      .join('')}</ol>
  </section>
  <section id="${c.kura.id}">
    <h2>${esc(c.kura.name)} — ${esc(c.kura.tagline)}</h2>
    <p>${esc(c.kura.status)}</p>
    <p>${esc(c.kura.intro)}</p>
    ${li(c.kura.pillars.map((p) => `<strong>${esc(p.title)}:</strong> ${esc(p.body)}`))}
    <h3>${esc(c.kura.rulesHeading)}</h3>
    ${li(c.kura.rules.map(esc))}
  </section>
  <section id="${c.environments.id}">
    <h2>${esc(c.environments.heading)}</h2>
    <p>${esc(c.environments.intro)}</p>
    ${c.environments.items
      .map((i) => `<h3>${esc(i.title)}</h3><p>${esc(i.different)}</p><p>Typical tools: ${esc(i.tools)}</p>`)
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
<footer><p>${esc(c.footer.left)}</p></footer>`

const distIndex = join(root, 'dist/index.html')
const page = readFileSync(distIndex, 'utf8')
if (!page.includes('<div id="root"></div>')) throw new Error('#root placeholder not found in dist/index.html')
const injected = page.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
writeFileSync(distIndex, injected)
writeFileSync(join(root, 'dist/404.html'), injected)
console.log('Injected static content into dist/index.html and wrote dist/404.html')
