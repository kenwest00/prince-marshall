# prince + marshall — website

Single-page site for prince + marshall, an independent studio that researches, designs and builds enterprise tools.

## Edit the content
All copy lives in `src/data/content.ts`. The React sections, the FAQ structured data, and the crawler-readable static fallback are all generated from that one file.

## Run and build
```bash
npm install
npm run dev      # local preview at http://localhost:3000
npm run build    # type-check, build, then inject the static fallback into dist/
```

## Contact form
By default the form composes an email to the address in `content.ts`. To receive submissions without opening an email app, create a form endpoint (for example at Formspree) and set it at build time:
```bash
VITE_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx npm run build
```

## Before launch
See `LAUNCH-CHECKLIST.md`.
