# Launch checklist — items only the owner can confirm

Do not publish until each item is confirmed or the related copy is removed.

## Facts and claims
- [ ] Studio bio (Studio section): confirm you are comfortable with "UX research leader who has run research and roadmaps for civic technology programs" and "Fortune 500 teams across retail, consumer goods, insurance and hospitality." Names of employers/clients are intentionally NOT used. Check your State of Connecticut outside-activity policy and any client NDAs before adding names.
- [ ] Commitments on the site: reply within two business days; 30-minute intro call; "no obligation" proposal; WCAG 2.1 AA testing; plain-language security documentation / questionnaire support; "we do not put your data into AI tools without written approval." Keep only what you will honor.
- [ ] KURA chip reads "Collection management platform" and the FAQ invites a walkthrough. Make sure the walkthrough you give matches what the site says. The five pillars describe the product specification; only publish pillars that are built and demonstrable by the time buyers visit.
- [ ] No certifications (SOC 2, ISO 27001, VPAT) are claimed. Do not add any until you hold them.
- [ ] Data ownership FAQ answer: have counsel review before using in contracts.

## Infrastructure
- [ ] Confirm hello@princeandmarshall.com exists and is monitored (or change `site.email` in `src/data/content.ts`).
- [ ] Point a custom domain at the site, then update `site.url`, the canonical/OG URLs in `index.html`, `public/robots.txt` and `public/sitemap.xml`.
- [ ] Set `VITE_FORM_ENDPOINT` (e.g. Formspree) so inquiries do not depend on the visitor's email app.
- [ ] Add privacy-respecting analytics and a short privacy statement if you collect form data.
- [ ] Replace `public/og-image.png` with a branded image if desired.

## Content to add as it becomes available
- [ ] Real KURA screenshots (use only data you are willing to show; avoid sample valuations that look genuine).
- [ ] One or more case studies with permission: problem, approach, outcome, and a measurable result.
- [ ] A named testimonial or reference from a real client.
