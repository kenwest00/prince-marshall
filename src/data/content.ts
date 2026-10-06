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
  secondaryCta: 'See our method',
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
  /** Optional path under public/, e.g. './clients/apple.svg'. Without it the name is typeset as a wordmark. */
  logo?: string
}

export const clients = {
  id: 'clients',
  eyebrow: 'Clients',
  heading: 'Organizations we have worked with.',
  items: [
    { name: 'Apple' },
    { name: 'IBM' },
    { name: 'The Home Depot' },
    { name: 'AT&T' },
    { name: 'State of Connecticut' },
    { name: 'Japan Post' },
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
  name: 'KURA',
  tagline: 'Full transparency into an art collection.',
  status: 'Collection management platform',
  intro:
    'KURA is a collection management platform for museums, municipalities, universities and private collections that need one trustworthy record of what they hold, where it is, what condition it is in, where it came from and what it is worth.',
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
}

export interface Environment {
  title: string
  different: string
  tools: string
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
      a: 'You own your data and your deliverables. We build with standard exports and clear documentation so you are never locked in. Licenses for our own products, such as KURA, are governed by their own terms.',
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
      q: 'How do I get started with KURA?',
      a: 'Request a walkthrough. We show you KURA with your own kind of collection in mind, then talk through how it would fit your organization, your data and your team.',
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
    topicOptions: ['A project or engagement', 'KURA walkthrough', 'Something else'],
    kuraPrefill: 'I would like a walkthrough of KURA. ',
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
    { number: '03', label: 'KURA', href: '#kura' },
    { number: '04', label: 'Environments', href: '#environments' },
    { number: '05', label: 'Trust', href: '#trust' },
    { number: '06', label: 'Studio', href: '#studio' },
    { number: '07', label: 'Contact', href: '#contact' },
  ],
}
