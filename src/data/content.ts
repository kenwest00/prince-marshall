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
  /** A separate page, so it sits apart from the numbered in-page list. */
  offer: { label: 'The Ride-Along', note: 'For trades businesses', href: 'ride-along/' },
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
