/**
 * Single source of truth for all site copy.
 * The same data feeds the React sections, the JSON-LD, and the
 * crawler-readable static fallback injected at build time.
 */

export const site = {
  name: 'prince + marshall',
  label: 'Research-led enterprise tools',
  metaTop: ['Independent studio', 'Research-led enterprise tools'],
  email: 'hello@princeandmarshall.com',
  /** Where form submissions are delivered (not shown to visitors). */
  formTo: 'ken.west@princeandmarshall.com',
  url: 'https://princeandmarshall.com/',
  location: 'Metro Atlanta, working nationwide',
  title: 'prince + marshall — We research, design and build enterprise tools',
  description:
    'prince + marshall is an independent studio that researches how people actually work, then designs and builds the enterprise tools they rely on — for museums, public service, healthcare and field operations.',
}

export const hero = {
  nameLine: 'prince + marshall',
  stackedLines: [
    { text: 'We research,', align: 'left' },
    { text: 'design & build', align: 'right' },
    { text: 'enterprise tools.', align: 'left' },
  ] as { text: string; align: 'left' | 'right' }[],
  statement:
    'We study how people actually work — in galleries, clinics, service centers and the field — then design and build the software they rely on. Research first, craft always.',
  primaryCta: 'Start a conversation',
  secondaryCta: 'See KÜRA',
  secondaryHref: '#kura',
  product: {
    eyebrow: 'Our product',
    name: 'KÜRA',
    line: 'Collection management software for art. Know what you hold, where it is, its condition, where it came from and what it is worth.',
    cta: 'See KÜRA',
    href: 'kura/',
  },
  skip: 'Skip',
  sceneLabel: 'The p+m tile being built from survey points through the five Method stages',
  stages: [
    { name: 'Observe', line: 'We watch how your team really works today.' },
    { name: 'Define', line: 'We agree on the problem and what success looks like.' },
    { name: 'Design', line: 'We sketch the solution and test it with your people.' },
    { name: 'Build', line: 'We build it in small pieces you can try as we go.' },
    { name: 'Sustain', line: 'We train your team and keep improving it after launch.' },
  ],
}

/** Four doors from the first screen. `page: true` links leave the homepage. */
export const audiences = {
  id: 'audiences',
  label: 'Where would you like to start?',
  items: [
    { label: 'Getting time back', line: 'p+m Systems: AI that does real work.', href: 'systems/', page: true, dot: false },
    { label: 'Managing a collection', line: 'KÜRA replaces the notebook with one trustworthy record.', href: 'kura/', page: true, dot: true },
    { label: 'Running a trades business', line: 'The Ride-Along, from prince + marshall.', href: 'ride-along/', page: true, dot: false },
    { label: 'Partnering with us', line: 'Consultants, registrars, appraisers, insurers, integrators.', href: '#partners', page: false, dot: false },
  ],
}

export const statement = {
  lines: [
    { text: 'tools should fit', align: 'left' },
    { text: 'the work,', align: 'right' },
    { text: 'not the other way round.', align: 'left' },
  ] as { text: string; align: 'left' | 'right' }[],
}

export interface Client {
  name: string
  /** Sector shown in the client index readout. */
  sector?: string
  /** Monogram set on the client's index tile (our type, never the client's logo). */
  mono?: string
  /** Short sector tag on the tile. */
  tag?: string
  /** Client logo (one-colour, recoloured in VectorCraft) in src/assets/clients. Without it the tile shows the monogram. */
  logo?: 'apple' | 'ibm' | 'atandt' | 'homedepot' | 'connecticut' | 'pepsico' | 'downtownatl' | 'japanpost'
}

export const clients = {
  id: 'clients',
  eyebrow: 'Clients',
  heading: 'Organizations we have worked with.',
  hint: 'Scroll to move through the index',
  items: [
    { name: 'Apple', logo: 'apple', mono: 'A', tag: 'TECH', sector: 'Technology' },
    { name: 'IBM', logo: 'ibm', mono: 'IBM', tag: 'TECH', sector: 'Technology' },
    { name: 'The Home Depot', logo: 'homedepot', mono: 'HD', tag: 'RETAIL', sector: 'Retail' },
    { name: 'AT&T', logo: 'atandt', mono: 'AT&T', tag: 'TELECOM', sector: 'Telecommunications' },
    { name: 'PepsiCo', logo: 'pepsico', mono: 'PEP', tag: 'CONSUMER', sector: 'Consumer goods' },
    { name: 'State of Connecticut', logo: 'connecticut', mono: 'CT', tag: 'STATE GOV', sector: 'State government' },
    { name: 'Downtown ATL', logo: 'downtownatl', mono: 'ATL', tag: 'CIVIC', sector: 'Civic · Downtown Atlanta' },
    { name: 'Japan Post', logo: 'japanpost', mono: 'JP', tag: 'POSTAL', sector: 'Postal and logistics' },
  ] as Client[],
}

export interface MethodStep {
  number: string
  name: string
  body: string
  deliverable: string
}

export const method = {
  id: 'method',
  eyebrow: 'Method',
  heading: 'From fieldwork to working software.',
  intro:
    'Every engagement follows the same five steps. Each one ends in something you can review, question and sign off — not a slide of intentions.',
  steps: [
    {
      number: '01',
      name: 'Observe',
      body: 'We spend time where the work happens: interviews, shadowing and artifact review with the people who will use — and be accountable for — the tool.',
      deliverable: 'Field notes and an opportunity map',
    },
    {
      number: '02',
      name: 'Define',
      body: 'We turn what we saw into clear requirements, risks and success measures that your leadership can approve.',
      deliverable: 'Requirements brief and success measures',
    },
    {
      number: '03',
      name: 'Design',
      body: 'Prototypes are tested with real users before any production code is written, so mistakes are cheap and early.',
      deliverable: 'Tested prototype and design system',
    },
    {
      number: '04',
      name: 'Build',
      body: 'Production software built in short cycles. You get working releases you can use and evaluate, not a big reveal at the end.',
      deliverable: 'Working releases with documentation',
    },
    {
      number: '05',
      name: 'Sustain',
      body: 'Training, support and measured improvement after launch. Your data stays portable and your team stays in control.',
      deliverable: 'Handover materials and a living roadmap',
    },
  ] as MethodStep[],
}

export interface Pillar {
  title: string
  body: string
}

export const kura = {
  id: 'kura',
  eyebrow: 'Featured product',
  name: 'KÜRA',
  tagline: 'Full transparency into an art collection.',
  status: 'Collection management platform',
  intro:
    'KÜRA is a collection management platform for museums, municipalities, universities and private collections that need one trustworthy record of what they hold, where it is, what condition it is in, where it came from and what it is worth.',
  pillars: [
    {
      title: 'What you hold',
      body: 'Catalogue records structured to museum standards, with controlled vocabularies instead of free text.',
    },
    {
      title: 'Where it is',
      body: 'A movement log, floor plans and inventory audits, so any object’s location can be reconstructed for any past date.',
    },
    {
      title: 'What condition it is in',
      body: 'Structured condition reports, treatment workflows and environmental monitoring, with photos compared over time.',
    },
    {
      title: 'Where it came from',
      body: 'Ordered provenance chains that flag gaps, plus a due-diligence checklist recording who checked what, and when.',
    },
    {
      title: 'What it is worth',
      body: 'Valuations that are never overwritten, insurance schedules of values, and loan and exhibition tracking.',
    },
  ] as Pillar[],
  rulesHeading: 'Built on four rules',
  rules: [
    'Every change is logged: who, what, when, and why.',
    'Records are never hard-deleted — only archived with a reason.',
    'Sensitive fields are visible only to the roles that need them.',
    'Your data leaves as easily as it arrives: open exports, no lock-in.',
  ],
  cta: 'Request a walkthrough',
  visualLabel: 'One object, five orbits of record — explore the rings',
  ringLabels: ['What you hold', 'Where it is', 'Condition', 'Provenance', 'Worth'],

  /* --- Release 1: "From notebook to record" --- */
  flagEyebrow: 'Flagship · KÜRA',
  definition: 'Collection management software for art.',
  definitionBody:
    'For museums, cities, universities and private collectors: one trustworthy record of every work, from what it is and where it hangs to its condition, provenance and value.',
  heading: 'From notebook to record.',
  sceneIntro:
    'Most collections still live in a ledger, a spreadsheet and the memory of whoever has been there longest. That is the problem KÜRA solves. Scroll to watch one entry become a trustworthy record.',
  beforeLabel: 'Before KÜRA',
  afterLabel: 'With KÜRA',
  before: { name: 'The ledger', short: 'Before', line: 'One notebook. One copy. Open questions.' },
  beforeStatement: 'Before KÜRA, the record is a notebook: one copy, no history, and questions nobody can answer.',
  beforeHint: 'Keep scrolling. One entry becomes a record.',
  sceneLabel: 'A handwritten ledger entry breaks into particles that assemble into a portrait after Leonardo da Vinci’s Mona Lisa, then gathers five orbits of record: what you hold, where it is, condition, provenance and worth',
  exampleLabel: 'Example record',
  steps: [
    { name: 'What you hold', short: 'Object', line: 'The entry becomes a catalogued work.' },
    { name: 'Where it is', short: 'Place', line: 'On the floor plan, down to the wall.' },
    { name: 'Condition', short: 'State', line: 'Every inspection, dated.' },
    { name: 'Provenance', short: 'Origin', line: 'Every custodian, in order.' },
    { name: 'Worth', short: 'Value', line: 'Insured value and when it was reviewed.' },
  ],
  scene: {
    notebook: [
      'No. 211 · watercolour, harbour · Annex store · good',
      'No. 212 · oak bench (memorial) · Elm St. · weathered',
      'No. 213 · mural study · framed · Hall B',
      'No. 214 · portrait, after Leonardo · Gallery 2 · fair',
      'No. 215 · ceramic tiles (set of 9) · library',
      'No. 216 · steel arch · transit plaza · ?',
    ],
    entry: 3,
    /** Red-pen marks on the ledger: the gaps KÜRA closes. line -1 = the page itself. */
    problems: [
      { line: -1, word: '', text: 'One copy. No backup.' },
      { line: 1, word: 'weathered', text: 'Condition since when? Checked by whom?' },
      { line: 2, word: 'Hall B', text: 'Still in Hall B? No movement log.' },
      { line: 3, word: 'fair', text: 'No value. No provenance. No photo.' },
      { line: 5, word: '?', text: 'Location unknown.' },
    ],
    tags: [
      'P-214 · Study after Leonardo, Mona Lisa · oil on panel · 77 × 53 cm',
      'Main building · Gallery 2 · east wall',
      'Inspected 12 Sep 2026 · varnish yellowing, stable',
      '4 events · 1911 → 2024',
      'Insured $85,000 · appraised Mar 2026',
    ],
    mapLabel: 'MAIN BUILDING · FLOOR PLAN (EXAMPLE)',
    conditionMark: 'VARNISH · YELLOWING',
    provenance: [
      { year: '1911', label: 'Painted (study copy)' },
      { year: '1958', label: 'Bequeathed' },
      { year: '1994', label: 'Lent' },
      { year: '2024', label: 'Conserved' },
    ],
  },
  /** Shown as a DOM card at the Worth stage. */
  card: [
    { label: 'What you hold', value: 'P-214 · Study after Leonardo’s Mona Lisa · oil on panel, 77 × 53 cm' },
    { label: 'Where it is', value: 'Main building · Gallery 2 · east wall' },
    { label: 'Condition', value: 'Varnish yellowing, stable · inspected 12 Sep 2026' },
    { label: 'Provenance', value: 'Painted 1911 · bequeathed 1958 · lent 1994 · conserved 2024' },
    { label: 'Worth', value: 'Insured $85,000 · appraised Mar 2026' },
  ],
  starter: 'Start with 25 records',
  /** [confirm offer] Ken must confirm before this renders anywhere. */
  starterEnabled: false,
  /** Restate capabilities already published in `pillars` and `rules` above. */
  outcomes: [
    { title: 'Audit-ready', body: 'Inventory audits and a movement log show what you hold and where it was on any date.' },
    { title: 'Insurable', body: 'Valuations are never overwritten, and insurance schedules of values come straight from the record.' },
    { title: 'Loan- and conservation-ready', body: 'Loan and exhibition tracking, condition reports and treatment history sit on the same record.' },
    { title: 'Survives turnover', body: 'Every change is logged with who, what, when and why, so the record stays when people leave.' },
  ],
  /** Path under public/, e.g. 'kura/record.png'. Empty = block hidden. */
  screenshot: '',
  screenshotAlt: 'A KÜRA record screen',
  closing: 'For museums, municipalities, universities and private collections.',
  pageLink: { label: 'Everything about KÜRA', href: 'kura/' },
}

/** The /kura/ page. Empty or disabled fields render nothing. */
export const kuraPage = {
  url: 'https://princeandmarshall.com/kura/',
  title: 'KÜRA: collection management for museums and public art | prince + marshall',
  description:
    'KÜRA replaces notebooks and spreadsheets with one trustworthy record of every work: what you hold, where it is, condition, provenance and worth.',
  label: 'KÜRA, from prince + marshall',
  h1: 'From notebook to record.',
  sub: 'One trustworthy record of what you hold, where it is, its condition, where it came from and what it is worth. Built for museums, municipalities, universities and private collections.',
  seeHow: 'See how it works',
  replaces: {
    eyebrow: 'Where collections start',
    heading: 'If your collection lives in a notebook, you are not alone.',
    items: [
      { title: 'The notebook', body: 'one copy, one handwriting, one leak away from gone.' },
      { title: 'The spreadsheet', body: 'a column for everything except the history.' },
      { title: 'Memory', body: 'accurate until the person who knows retires.' },
    ],
  },
  outcomesEyebrow: 'What a record gives you',
  outcomesHeading: 'Answers you can hand to anyone who asks.',
  anatomyEyebrow: 'Anatomy of a record',
  anatomyHeading: 'Five parts. One record.',
  whoEyebrow: 'Who it is for',
  whoHeading: 'Built for the people who answer for a collection.',
  who: [
    { title: 'Museums and historical societies', body: 'catalogue, location and condition for every object, on and off view.' },
    { title: 'Municipal public-art programs', body: 'works in parks, plazas and buildings, with location and maintenance history.' },
    { title: 'Universities', body: 'collections spread across departments, buildings and decades.' },
    { title: 'Private collections and estates', body: 'insurance, loans and succession with nothing left to memory.' },
  ],
  starter: {
    heading: 'Start with 25 records.',
    body: 'Send us 25 entries from your notebook or spreadsheet. We will show them back to you as KÜRA records, free, so you can judge it with your own collection.',
  },
  /** [confirm] e.g. 'Priced by collection size, from $___ a month, onboarding included.' */
  pricing: '',
  pricingFallback: 'Ask for a quote. We price KÜRA around your collection and your team.',
  pricingEyebrow: 'Pricing',
  buyingEyebrow: 'For procurement',
  buyingHeading: 'Buying KÜRA.',
  buyingNote: 'More detail for procurement and IT reviewers is available on request.',
  /** Rows with an empty value do not render. Fill the [confirm] rows when verified. */
  buying: [
    { label: 'Data ownership', value: 'Your data leaves as easily as it arrives: open exports, no lock-in.' },
    { label: 'Audit trail', value: 'Every change is logged: who, what, when, and why. Records are archived with a reason, never hard-deleted.' },
    { label: 'Access', value: 'Sensitive fields are visible only to the roles that need them.' },
    { label: 'Hosting', value: '' },
    { label: 'Security', value: '' },
    { label: 'Accessibility', value: '' },
    { label: 'Insurance', value: '' },
    { label: 'How to buy', value: '' },
    { label: 'Registrations and certifications', value: '' },
  ],
  faqEyebrow: 'Questions',
  faqHeading: 'Straight answers.',
  /** Only confirmed answers. Add the [confirm] questions from the build prompt once verified. */
  faq: [
    {
      q: 'How do I get started with KÜRA?',
      a: 'Request a walkthrough. We show you KÜRA with your own kind of collection in mind, then talk through how it would fit your organization, your data and your team.',
    },
    {
      q: 'Who owns our data?',
      a: 'You do. Your data leaves as easily as it arrives: open exports, no lock-in.',
    },
  ],
  finalHeading: 'Every collection deserves a record.',
  footerHome: { label: 'Back to prince + marshall', href: '../' },
}

export const partners = {
  id: 'partners',
  eyebrow: 'Partners',
  heading: 'Work with us.',
  intro:
    'We are a senior studio, and we partner by design. If you serve collections, cities or field teams, there is probably a way we make each other’s work better.',
  whoHeading: 'Who we partner with',
  who: [
    { title: 'Collection consultants and registrars', body: 'you bring the collection, we bring the record.' },
    { title: 'Appraisers and art insurers', body: 'valuations and review dates live in the KÜRA record.' },
    { title: 'Conservators', body: 'condition history, dated and attached to the work.' },
    { title: 'Public-art administrators', body: 'inventory, location and maintenance for works in public space.' },
    { title: 'Systems integrators and studios', body: 'research and design capacity for your enterprise clients.' },
    { title: 'Chambers and associations', body: 'practical help for your members, starting with the Ride-Along.' },
  ],
  getHeading: 'What partners get',
  get: [
    'Co-delivery on research, design and build.',
    'Open exports from KÜRA, so collection data moves cleanly between your tools and ours.',
  ],
  /** [only if true] e.g. 'Referral terms for introductions that become work.' */
  referral: '',
  cta: 'Talk partnerships',
}

export interface Environment {
  title: string
  different: string
  tools: string
  /** Optional pointer to a related page. */
  link?: { lead: string; label: string; href: string }
}

export const environments = {
  id: 'environments',
  eyebrow: 'Environments',
  heading: 'Designed for the place the work happens.',
  intro:
    'A tool that works in a conference room can fail on a gallery floor, a service counter or a loading dock. We design for the real environment first.',
  items: [
    {
      title: 'Museums & collections',
      different: 'Objects outlast staff. Records have to survive turnover, audits, loans and insurance reviews.',
      tools: 'Collection records, condition and movement tracking, loan and valuation workflows.',
    },
    {
      title: 'Civic & public service',
      different: 'People do not choose their agency. Tools must be plain-language, accessible and workable inside procurement rules.',
      tools: 'Service-center workflows, payment and case experiences, public-facing dashboards.',
    },
    {
      title: 'Healthcare & practice management',
      different: 'Small teams, high stakes, very little time between patients and paperwork.',
      tools: 'Practice dashboards, intake and scheduling, reporting that explains itself.',
    },
    {
      title: 'Facilities & field operations',
      different: 'Work happens on foot, in gloves, with uneven connectivity and constant interruptions.',
      tools: 'Mobile-first capture, offline sync, scan-and-log workflows, compliance records.',
      link: { lead: 'Run a trades business on your own?', label: 'See the Ride-Along', href: 'ride-along/' },
    },
  ] as Environment[],
}

export interface TrustItem {
  title: string
  body: string
}

export const trust = {
  id: 'trust',
  eyebrow: 'Built for procurement',
  heading: 'Enterprise-ready by design.',
  intro:
    'The questions your security, legal, accessibility and finance reviewers ask are design inputs for us, not afterthoughts.',
  items: [
    {
      title: 'Accessible by default',
      body: 'We design and test to WCAG 2.1 AA: keyboard operable, screen-reader friendly, and never dependent on color alone.',
    },
    {
      title: 'Role-based access',
      body: 'Least-privilege roles, with sensitive fields hidden from anyone who does not need them.',
    },
    {
      title: 'Complete audit trails',
      body: 'Every create, update and archive is recorded with the person, time and reason.',
    },
    {
      title: 'Data you own',
      body: 'Standard exports, full backups and documented data models, so you are never locked in.',
    },
    {
      title: 'Documentation for reviewers',
      body: 'Architecture, data flow and security answers written in plain language, ready for your questionnaire.',
    },
    {
      title: 'Responsible use of AI',
      body: 'AI helps us move faster; people review and answer for everything we deliver. We do not put your data into AI tools without written approval.',
    },
  ] as TrustItem[],
}

export const studio = {
  id: 'studio',
  eyebrow: 'Studio',
  heading: 'A senior studio, not a pitch deck.',
  paragraphs: [
    'prince + marshall is led by Ken West, a UX research leader who has run research and roadmaps for civic technology programs and worked with Fortune 500 teams across retail, consumer goods, insurance and hospitality.',
    'We keep the studio small on purpose: the person who does the research is the person who designs and ships the work. AI-assisted workflows let us move at a pace larger teams cannot match, with a human reviewing every deliverable.',
    'Ken is also a documentary photographer and the author of The Beauty of Everyday Thangs — a habit of looking closely that shows up in everything we research.',
  ],
  facts: [
    { label: 'Research-led', body: 'Decisions start from evidence gathered with your users.' },
    { label: 'Senior-only', body: 'No hand-off from the pitch team to a junior team.' },
    { label: 'Independent', body: 'No platform to sell you. We recommend what fits.' },
  ],
}

export interface FaqItem {
  q: string
  a: string
}

export const faq = {
  id: 'faq',
  eyebrow: 'Questions',
  heading: 'What buyers ask first.',
  items: [
    {
      q: 'How does an engagement work?',
      a: 'Most start with a short discovery sprint: fieldwork, requirements and a tested prototype. If the fit is right, we move into build in short cycles with working releases. You see a scoped proposal before committing to either stage.',
    },
    {
      q: 'Who owns the work and the data?',
      a: 'You own your data and your deliverables. We build with standard exports and clear documentation so you are never locked in. Licenses for our own products, such as KÜRA, are governed by their own terms.',
    },
    {
      q: 'Can you work within public-sector procurement and accessibility requirements?',
      a: 'Yes. We design to WCAG 2.1 AA, document our work for review, and can work through purchase orders, statements of work and standard vendor onboarding. Tell us your requirements early and we will plan around them.',
    },
    {
      q: 'How do you use AI?',
      a: 'AI speeds up synthesis, drafting and prototyping. People review and are accountable for everything we deliver, and we do not put your data into AI tools without your written approval.',
    },
    {
      q: 'What size of organization do you work with?',
      a: 'From a single department to a multi-site organization. We are a small studio by design, so we take on a limited number of engagements at a time.',
    },
    {
      q: 'How do I get started with KÜRA?',
      a: 'Request a walkthrough. We show you KÜRA with your own kind of collection in mind, then talk through how it would fit your organization, your data and your team.',
    },
  ] as FaqItem[],
}

export const contact = {
  id: 'contact',
  eyebrow: 'Contact',
  heading: 'Tell us what you are trying to solve.',
  availability: 'Taking a limited number of engagements',
  writeTo: 'Or write directly to:',
  next: {
    heading: 'What happens next',
    steps: [
      'We reply within two business days.',
      'A 30-minute conversation to understand your environment.',
      'If it is a fit, a scoped proposal — no obligation.',
    ],
  },
  form: {
    name: 'Your name',
    email: 'Work email',
    organization: 'Organization',
    topic: 'Reason for contact',
    topicOptions: ['A project or engagement', 'KÜRA walkthrough', 'KÜRA starter import', 'p+m Systems', 'Partnership', 'Ride-Along', 'Something else'],
    kuraPrefill: 'I would like a walkthrough of KÜRA. ',
    environment: 'Environment',
    environmentOptions: [
      'Museum or collection',
      'Civic or public service',
      'Healthcare or practice management',
      'Facilities or field operations',
      'Something else',
    ],
    message: 'What are you trying to solve?',
    timeline: 'Timeline',
    timelineOptions: ['Exploring', 'Within 3 months', 'Within 6 months', 'Already budgeted'],
    submit: 'Send inquiry',
    sending: 'Sending…',
    successMailto: 'Your email app should have opened with your message ready to send. If not, write to us at',
    success: 'Thank you. We will reply within two business days.',
    error: 'Something went wrong. Please email us directly at',
    required: 'Required',
  },
  cta: 'Start a conversation',
}

export const footer = {
  left: 'prince + marshall © 2026 Prince & Marshall. All rights reserved.',
  right: 'Metro Atlanta · Working nationwide',
  wordmark: 'prince + marshall',
}

export const menu = {
  openLabel: 'Menu',
  closeLabel: 'Close',
  items: [
    { number: '01', label: 'Home', href: '#home' },
    { number: '02', label: 'Method', href: '#method' },
    { number: '03', label: 'KÜRA', href: '#kura' },
    { number: '04', label: 'Environments', href: '#environments' },
    { number: '05', label: 'Trust', href: '#trust' },
    { number: '06', label: 'Studio', href: '#studio' },
    { number: '07', label: 'Contact', href: '#contact' },
  ],
  /** A separate page, so it sits apart from the numbered in-page list. */
  offers: [
    { label: 'p+m Systems', note: 'AI that does real work', href: 'systems/' },
    { label: 'KÜRA', note: 'Collection management platform', href: 'kura/' },
    { label: 'The Ride-Along', note: 'For trades businesses', href: 'ride-along/' },
  ],
}

/* ---------------------------------------------------------------------------
 * The Ride-Along — landing page for solo and small trades businesses
 * (served at /ride-along/). Every visible string on that page lives here.
 * Fields left empty ('' / null / []) are hidden on the page until filled.
 * ------------------------------------------------------------------------- */
export const rideAlong = {
  url: 'https://princeandmarshall.com/ride-along/',
  title: "Win the jobs you're already losing | The Ride-Along from prince + marshall",
  description:
    'For HVAC, plumbing and pest control pros. We ride along for a day, find where jobs and money slip away, and set up the fix that wins them back. $2,500, fixed.',

  /** Digits only, e.g. '4045551234'. Empty = text/call buttons fall back to the note form. */
  phone: '',
  smsKeyword: 'RIDE',
  price: 2500,

  header: { home: 'prince + marshall home', studio: 'Studio', studioHref: '../#studio' },

  hero: {
    label: 'The Ride-Along, from prince + marshall',
    h1: "Win the jobs you're already losing.",
    sub: 'Every call you miss on a job is a customer calling someone else. We ride along for a day, find where jobs and money slip away, and set up the fix that wins them back.',
    priceStrong: '$2,500, fixed.',
    priceRest: 'If we find nothing worth fixing, we stop, you keep the written answer, and you never pay the second half.',
    under: 'For HVAC, plumbing and pest control pros who work solo or with a small crew. One day of your time. No software to learn.',
  },

  cta: {
    text: 'Text RIDE to',
    call: 'Call',
    note: 'Send a note',
    book: 'Book a ride-along',
  },

  why: {
    eyebrow: 'Why now',
    heading: "Your customers won't wait. Your competitors know it.",
    paragraphs: [
      "A homeowner with a dead AC or a flooded basement calls the first number they find. If you don't pick up, they call the next one, and the job is gone before you're off the ladder.",
      "The pros pulling ahead aren't working harder than you. They text back in seconds, follow up on every quote and ask every happy customer for a review. Every week you run on missed calls and kitchen-table paperwork is work going to someone else.",
    ],
    trades: [
      { title: 'HVAC', body: "peak-season calls you can't take from an attic." },
      { title: 'Plumbing', body: 'emergencies that go to whoever answers first.' },
      { title: 'Pest control', body: 'recurring plans that lapse because nobody followed up.' },
    ],
    /** Only when true for the current season, e.g. 'The summer rush is coming. Fix the phone before it rings nonstop, not during.' */
    season: '',
    /** Only with a named, opened source. */
    stat: null as null | { text: string; source: string; url: string },
  },

  calculator: {
    eyebrow: 'Your numbers',
    heading: 'What is a missed call costing you?',
    intro: 'Your numbers, not ours. Nothing you type leaves this page.',
    missed: { label: 'Calls you miss in a typical week', value: 3, min: 0, max: 50, step: 1 },
    booked: { label: 'Out of 10 of those callers, how many would have booked?', value: 4, min: 0, max: 10, step: 1 },
    job: {
      label: 'Your average job ($)',
      value: 350,
      min: 0,
      max: 20000,
      step: 50,
      help: 'Pest control? Use what a recurring customer is worth in a year, not one visit.',
    },
    resultPre: 'About',
    resultPost: 'a year walking to someone else.',
    paybackPre: 'The Ride-Along pays for itself if it wins back',
    paybackPost: 'jobs.',
    paybackOne: 'job.',
    fine: 'An estimate from the numbers you entered. We work out the real figure with you on the ride-along.',
  },

  outcomes: {
    eyebrow: 'The outcome',
    heading: 'More jobs. Faster money. Your evenings back.',
    items: [
      { title: 'More jobs from the calls you already get', body: 'a missed call gets an instant text back, so the customer waits for you instead of dialing someone else.' },
      { title: 'Quotes that close', body: 'follow-ups go out on their own, so "let me think about it" doesn\'t go cold.' },
      { title: 'Paid faster', body: 'invoices and reminders go out from the job site, not the kitchen table.' },
      { title: 'A reputation that brings the next customer', body: 'every happy customer gets a review request while the job is still fresh.' },
      { title: 'Your nights and weekends', body: 'less admin, more life.' },
    ],
    closing: 'We start with the fix that pays you the most, and we prove it with your numbers before we build anything.',
  },

  how: {
    eyebrow: 'How it works',
    heading: 'One day in your truck. One fix that pays for itself.',
    steps: [
      {
        number: '01',
        name: 'Ride along',
        when: 'Days 1 to 2',
        body: 'We work beside you on real jobs and look at where business actually happens: your phone, texts, quotes and invoices.',
        deliverable: 'A clear picture of where money is leaking, in dollars.',
      },
      {
        number: '02',
        name: 'Decide',
        when: 'Within 3 days',
        body: 'Every leak ranked by what it costs you each month, plus the ones not worth fixing. You see the math before anything is built.',
        deliverable: 'A one-page plan you can read in five minutes.',
      },
      {
        number: '03',
        name: 'Fix',
        when: 'Week 2',
        body: 'We set up the fix that pays best, using tools you already have where we can, and test it with you on a real call.',
        deliverable: 'The fix running, a plain-language how-to, and a check-in at 30 days.',
      },
    ],
  },

  guarantee: {
    eyebrow: 'Our guarantee',
    heading: "If it's not there, we'll say so.",
    body: 'We check the numbers at the Decide step, before any fix is built. If nothing should pay back the fee within 12 months, we stop there. You keep the written answer, and you never pay the second half.',
    line: "We don't invent work. We find money.",
  },

  pricing: {
    eyebrow: 'Price',
    heading: 'One price. Everything included.',
    fixed: 'fixed',
    includedHeading: 'Included',
    included: [
      'One to two days of ride-along on your real jobs',
      'A one-page written plan, every leak ranked by dollars',
      'One fix set up, tested and running',
      'A plain-language how-to for you and anyone who helps you',
      "A 30-day check-in to make sure it's paying",
    ],
    termsHeading: 'Terms',
    terms: [
      'Half to book. Half only once your plan shows a fix worth building.',
      'If a tool has a monthly cost, you see the number before we set anything up.',
      'Keep going within 60 days and the whole fee credits toward your next fix.',
    ],
    /** Only if true. e.g. 'The first 10 businesses get this price. After that it is $3,000.' */
    foundingRate: '',
    /** Only if true. e.g. 'Ken does every ride-along himself, so we take 4 businesses a month.' */
    capacity: '',
    /** Optional. e.g. 'Send us a pro who books, and you get $250 toward your next fix.' */
    referral: '',
  },

  /** Hidden until the first real, permitted testimonial exists. */
  testimonials: [] as { quote: string; name: string; trade: string; town: string }[],
  testimonialsEyebrow: 'Founding clients',
  testimonialsHeading: 'From the first ride-alongs.',

  about: {
    eyebrow: 'Who rides along',
    heading: 'Big-operation experience, one truck at a time.',
    /** Path under public/, e.g. 'ride-along/ken.jpg'. Empty = no photo block. */
    photo: '',
    photoAlt: 'Ken West on a ride-along with a trades business owner',
    paragraphs: [
      'Every ride-along is led by Ken West, founder of prince + marshall. He has spent his career making complicated operations run smoothly, including designing the buy-online-pickup-in-store and ship-to-store fulfillment experiences for The Home Depot\'s digital operation. Now we bring the same thinking to one truck and one phone. Ken does every ride-along himself. There is no hand-off to a junior team.',
      'AI helps us move faster; people review and answer for everything we deliver. Your data never goes into an AI tool without your written approval.',
    ],
    location: 'Based in Metro Atlanta.',
  },

  faq: {
    eyebrow: 'Questions',
    heading: 'Straight answers.',
    items: [
      { q: 'Is this worth it for a one-person shop?', a: "That's who it's built for. When you're the only one on the phone, every missed call is a lost job." },
      { q: "I don't have time for this.", a: "You don't stop working. We ride along while you do your jobs." },
      { q: 'Do I need to know anything about AI?', a: "No. You keep doing the work you're good at. We handle the rest." },
      { q: 'What counts as a fix?', a: 'One part of your business set up to run without you, such as a missed-call text-back, quote follow-ups, invoice reminders, review requests or online booking. Custom software, website rebuilds and hardware are not included.' },
      { q: 'I already use a scheduling or invoicing app.', a: 'Good. We usually make what you already pay for work harder before adding anything.' },
      { q: "Can't I set this up myself?", a: 'Some of it, yes. What we bring is knowing which fix is worth your money, setting it up right the first time, and checking at 30 days that it pays.' },
      { q: 'What do you need from me?', a: 'A look at your texts, call log, quotes and invoices. You decide what we see.' },
      { q: "Will you come into my customers' homes?", a: "Only with your okay and your customer's. On site, we follow your lead." },
      { q: 'What if you find nothing?', a: 'We stop at the Decide step. You keep the written answer, and you never pay the second half.' },
      { q: 'Will a robot answer my phone?', a: 'Only if you want one and the math says it pays. Most fixes are simpler, like a text that goes out the moment you miss a call.' },
      { q: 'Who owns what you set up?', a: 'You do. Every account is in your name.' },
      { q: 'I run a crew.', a: 'The Crew Ride-Along covers 2 to 10 people over about three weeks, for $5,000. Same promise, more ground.' },
    ],
  },

  final: {
    heading: 'The next call is coming. Be the one who answers.',
    formHeading: 'Rather send a note?',
    formHeadingNoPhone: 'Book your ride-along.',
    formIntro: 'Name, number and trade. Ken gets back to you himself.',
    name: 'Your name',
    phone: 'Mobile number',
    trade: 'Your trade',
    tradeOptions: ['HVAC', 'Plumbing', 'Pest control', 'Other'],
    message: 'Anything we should know? (optional)',
    submit: 'Send',
    sending: 'Sending…',
    success: 'Got it. Ken will get back to you within one business day.',
    error: 'Something went wrong. Please email',
    required: 'Required',
    topic: 'Ride-Along',
  },

  sticky: 'Text RIDE',
  stickyNoPhone: 'Book a ride-along',

  footerLink: { label: 'The Ride-Along, for trades', href: 'ride-along/' },
  footerHome: { label: 'Back to prince + marshall', href: '../' },
}

/* ---------------------------------------------------------------------------
 * p+m Systems: build-and-run AI workflows (served at /systems/).
 * Every visible string on that page lives here. Empty fields stay hidden.
 * ------------------------------------------------------------------------- */
export type SystemsAudience = 'small' | 'team' | 'enterprise'

export const systems = {
  url: 'https://princeandmarshall.com/systems/',
  label: 'p+m Systems',
  h1: 'AI that does real work.',
  sub: 'We watch how your team actually works, find the hours that disappear, and build AI systems that give them back. Then we keep them running.',
  cta: 'Book a Fieldwork call',
  seeHow: 'See what you get back',
  topic: 'p+m Systems',

  pains: {
    eyebrow: 'Sound familiar?',
    items: [
      { who: 'Owner', quote: 'I miss calls while I’m on a job.' },
      { who: 'Operations', quote: 'Half my day is copying things from one system to another.' },
      { who: 'Leadership', quote: 'We bought the AI licenses. Nobody uses them.' },
      { who: 'IT', quote: 'Every pilot works in the demo and dies in real life.' },
    ],
    bridge: 'The tools aren’t the problem. Nobody looked at the work first.',
  },

  fork: {
    eyebrow: 'Who is it for?',
    heading: 'Pick the one that sounds like you.',
    options: [
      { id: 'small', label: 'Small business', line: 'You and a small crew. You want time back, not software.' },
      { id: 'team', label: 'Growing team', line: '10 to 200 people. Processes held together by spreadsheets and goodwill.' },
      { id: 'enterprise', label: 'Enterprise and public sector', line: 'Pilots everywhere, results nowhere. Security and adoption matter.' },
    ] as { id: SystemsAudience; label: string; line: string }[],
  },

  /** Scroll scene 1: a week fills with lost hours, then a system gives them back. */
  week: {
    eyebrow: 'What’s in it for you',
    heading: 'Your week, before and after.',
    label: 'A work week whose hours are taken by busywork, then handed back by an automated system',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    leaks: ['Copying data', 'Chasing quotes', 'Missed call', 'Weekly report', 'Finding files', 'Re-keying invoices', 'Status emails', 'Scheduling'],
    stages: [
      { name: 'Your week', line: 'Fifty working hours. Watch where they go.' },
      { name: 'The leak', line: 'Busywork takes 14 of them. Every week.' },
      { name: 'The system', line: 'We build one system around the leaks.' },
      { name: 'Hours back', line: '10 hours a week come back to you. People stay in charge of the rest.' },
    ],
    lostLabel: 'Hours lost this week',
    backLabel: 'Hours back',
    systemLabel: 'p+m system',
    keptLabel: 'Still yours: needs a person',
    exampleNote: 'Example week. Your Fieldwork measures your real numbers.',
    payoff: '10 hours a week is about 500 hours a year.',
    payoffQuestion: 'What would you do with them?',
  },

  calc: {
    eyebrow: 'Do the math',
    heading: 'What are your lost hours worth?',
    hoursLabel: 'Hours lost to busywork each week',
    peopleLabel: 'People who lose them',
    rateLabel: 'What an hour of their time is worth',
    resultLabel: 'Back in your business each year',
    note: 'An estimate from your own numbers, assuming 48 working weeks. Fieldwork measures the real ones.',
    defaults: {
      small: { hours: 10, people: 1, rate: 75 },
      team: { hours: 6, people: 12, rate: 55 },
      enterprise: { hours: 4, people: 80, rate: 70 },
    } as Record<SystemsAudience, { hours: number; people: number; rate: number }>,
  },

  /** Scroll scene 2: a tangled process straightens through Fieldwork, Build, Run. */
  method: {
    eyebrow: 'How it works',
    heading: 'From mess to one clean line.',
    label: 'A tangled process between email, spreadsheets, phone, people and invoices straightens into one clean line',
    nodes: ['Email', 'Phone', 'Spreadsheet', 'You', 'CRM', 'Invoice'],
    steps: [
      { name: 'Fieldwork', time: '1 to 2 weeks', what: 'We sit with your team and map every step, hand-off and workaround. Nothing gets automated until we have seen it.', get: 'A written Leak Map, ranked by hours and dollars. Yours to keep.' },
      { name: 'Build', time: '2 to 6 weeks', what: 'We build the one or two systems worth building, test them with the people who will use them, and switch them on.', get: 'A working system, with a person approving every step that matters.' },
      { name: 'Run', time: 'Monthly', what: 'We watch it, fix it, improve it and report what it gave back. If something breaks, it is our problem, not yours.', get: 'A monthly Hours Back report. Cancel any time.' },
    ],
  },

  examples: {
    eyebrow: 'What we automate',
    heading: 'Before. After.',
    items: [
      { title: 'Intake and quoting', before: 'Requests by phone, web and email, answered when someone gets a minute.', after: 'Every request logged, a quote drafted and followed up automatically.', for: ['small', 'team'] },
      { title: 'Missed calls', before: 'A missed call is a customer calling someone else.', after: 'Every missed call gets a text back in seconds, and a booking link.', for: ['small'] },
      { title: 'Documents', before: 'Contracts, invoices and forms read and re-keyed by hand.', after: 'Read, checked and filed, with a person approving anything unusual.', for: ['team', 'enterprise'] },
      { title: 'Reporting', before: 'A weekly report built by hand every Friday afternoon.', after: 'A report that writes itself on Monday at 7am.', for: ['small', 'team', 'enterprise'] },
      { title: 'Team knowledge', before: '“Ask Sandra, she knows.”', after: 'An assistant that answers from your own documents, and says when it doesn’t know.', for: ['team', 'enterprise'] },
      { title: 'AI adoption', before: 'Licenses bought, a pilot demoed, nothing changed.', after: 'One workflow in production and used every week, with numbers to show for it.', for: ['enterprise'] },
      { title: 'Accessibility', before: 'A compliance deadline and no idea where to start.', after: 'Audits on a schedule, fixes tracked, a record you can show.', for: ['enterprise'] },
    ] as { title: string; before: string; after: string; for: SystemsAudience[] }[],
  },

  offers: {
    eyebrow: 'Two ways to start',
    heading: 'Pick your starting line.',
    items: [
      {
        id: 'small',
        name: 'The Time-Back Build',
        for: 'For owners and teams under 50',
        promise: 'We find the hours your business loses every week, build the systems that win them back, and run them for you.',
        stack: [
          'A Fieldwork day with you and your team: we measure where time and money slip away',
          'Your Leak Map: every leak in plain English, ranked by hours and dollars',
          'Your first systems, built and switched on',
          'Run included while it settles in: we watch it, fix it and tune it',
          'A one-page Hours Back report every month',
          'A short recorded walkthrough, so nobody has to learn software',
        ],
        price: 'Starts with a $2,500 Fieldwork. Build and Run are fixed prices, agreed before we start.',
        guarantee: 'If Fieldwork finds nothing worth fixing, we stop there and you keep the written answer.',
        tradesLink: { label: 'Run a trades business? The Ride-Along is built for you', href: '../ride-along/' },
      },
      {
        id: 'enterprise',
        name: 'Pilot to Production',
        for: 'For corporate teams and public bodies',
        promise: 'One real workflow, in production and used every week by your people, with the numbers to prove it.',
        stack: [
          'A two-week Fieldwork Sprint: observation, interviews and baseline numbers',
          'An opportunity map and a business case your sponsor can take upstairs',
          'Build and integration inside the tools you already use',
          'An adoption plan: champions, short training, office hours',
          'A governance pack: usage policy, data handling and an accessibility check',
          'A results readout with measured hours and the next three opportunities',
        ],
        price: 'Fixed-price Fieldwork, then a scoped build. Works with purchase orders and small-purchase thresholds.',
        guarantee: 'If Fieldwork finds nothing worth building, we say so in writing and you keep the map.',
        tradesLink: null,
      },
    ] as { id: SystemsAudience; name: string; for: string; promise: string; stack: string[]; price: string; guarantee: string; tradesLink: { label: string; href: string } | null }[],
    /** Fill in to show the time-back guarantee (left empty until the terms are confirmed). */
    timeBackGuarantee: '',
    /** e.g. 'We take three builds a month.' Empty = hidden. */
    capacity: '',
  },

  why: {
    eyebrow: 'Why p+m',
    heading: 'We look at the work first.',
    items: [
      { title: 'Research first', body: 'We watch the work before we touch a tool. That is why our systems get used.' },
      { title: 'People stay in charge', body: 'Every system has a person approving the steps that matter.' },
      { title: 'Your data stays yours', body: 'Open exports, no lock-in, and nothing used to train anyone’s model.' },
      { title: 'We stay', body: 'Run means someone is responsible after launch, not just a handover document.' },
    ],
  },

  faq: {
    eyebrow: 'Questions',
    heading: 'Fair questions.',
    items: [
      { q: 'Do I have to learn new software?', a: 'No. We build around the tools you already use, and we record a short walkthrough for anything new.', for: ['small', 'team'] },
      { q: 'Will this replace people?', a: 'It replaces busywork. The hours come back to the people doing the work, for the parts that need a person.', for: ['team', 'enterprise'] },
      { q: 'Which AI models do you use, and where does our data go?', a: 'We choose models for the job and your rules, document where data goes, and can work inside your existing Microsoft, Google or vendor setup.', for: ['enterprise'] },
      { q: 'What if Fieldwork finds nothing worth automating?', a: 'We tell you, in writing, and you keep the map. That is a useful answer too.', for: ['small', 'team', 'enterprise'] },
      { q: 'What happens if it breaks?', a: 'While you are on Run, it is ours to fix. You get a monthly report either way.', for: ['small', 'team', 'enterprise'] },
      { q: 'Can we stop Run?', a: 'Yes, any month. You keep everything we built and the documentation for it.', for: ['small', 'team', 'enterprise'] },
    ] as { q: string; a: string; for: SystemsAudience[] }[],
  },

  final: { heading: 'Show us one process that eats your week.', sub: 'A 30-minute call. No pitch deck. If it is not a fit, we will say so.' },
  footerHome: { label: 'Systems is one of four ways to work with prince + marshall', href: '../' },
}
