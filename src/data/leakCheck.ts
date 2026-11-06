import { systems, contact, type SystemsAudience } from './content'

/**
 * The Leak Check: a self-serve preview of Fieldwork for /systems/leak-check/.
 * Every question earns its place by feeding the Leak Map preview or the
 * readiness read-out. Copy follows the Systems page: plain, short, "we".
 */

export type Opt = { v: string; l: string; d?: string; excl?: boolean }
export type QType = 'audience' | 'contact' | 'choice' | 'multi' | 'text' | 'long' | 'number' | 'scale'
export type Q = {
  id: string
  sec: SectionId
  type: QType
  title: string
  help?: string
  req?: boolean
  opts?: Opt[]
  other?: boolean
  max?: number
  cols?: boolean
  unit?: string
  min?: number
  maxN?: number
  ph?: string
  lo?: string
  hi?: string
  /** Workflow block this question belongs to. */
  wf?: { n: number; of: number; label: string }
}
export type Answers = Record<string, unknown>

export type SectionId = 'you' | 'work' | 'flows' | 'friction' | 'tools' | 'handoff' | 'data' | 'guard' | 'plan'

export const leakCheck = {
  url: 'https://princeandmarshall.com/systems/leak-check/',
  name: 'The Leak Check',
  label: 'p+m Systems · Leak Check',
  h1: 'Where does your week go?',
  sub: 'Fifteen minutes, nine short sections. We look at how your business actually runs today and send back a Leak Map preview: where the hours go, what they cost, and which leaks are ready to fix.',
  promise: 'Estimates beat blanks. “I don’t know” is a useful answer.',
  facts: [
    { k: '15', v: 'minutes' },
    { k: '09', v: 'sections' },
    { k: '1', v: 'Leak Map preview' },
  ],
  start: 'Start the Leak Check',
  resume: 'Pick up where you left off',
  fresh: 'Start over',
  voiceHint: 'Hold Space to talk',
  voiceHintTouch: 'Press and hold to talk',
  voiceListening: 'Listening… let go to stop',
  voiceNote: 'Your browser turns speech into text. Edit anything before you move on.',
  voiceBlocked: 'Microphone access is off for this site. Type instead, or allow it in your browser settings.',
  reviewHeading: 'Check your answers, then send them.',
  send: 'Send my answers',
  sending: 'Sending…',
  sendError: 'We could not send your answers. Your answers are saved on this device. Try again, or email them to',
  resultEyebrow: 'Leak Map preview',
  resultNote: 'A preview from your own answers. Fieldwork measures the real numbers.',
  sentLine: 'Your answers are with prince + marshall. We reply within two business days.',
  cta: systems.cta,
  backToSystems: { label: 'p+m Systems', href: '../' },
  /** Notify the inbox when someone gets past the contact screen, so a half-finished check is still a lead. */
  notifyOnStart: true,
}

export const SECTIONS: { id: SectionId; name: string; line: string }[] = [
  { id: 'you', name: 'You', line: 'Who we are talking to, and what the work is for.' },
  { id: 'work', name: 'The money', line: 'AI makes a profitable process cheaper. It rarely rescues one that loses money. So we start here.' },
  { id: 'flows', name: 'Workflows', line: 'The repeatable, step-by-step work that turns a request into a paid result. This is where the hours leak.' },
  { id: 'friction', name: 'Friction', line: 'What eats the week, what breaks, and which mistakes cost money.' },
  { id: 'tools', name: 'Tools', line: 'What your team uses now, and how well it knows how AI behaves.' },
  { id: 'handoff', name: 'Hand-offs', line: 'Whether a task can be spelled out well enough for someone, or something, else to do it.' },
  { id: 'data', name: 'Data', line: 'Where your numbers live, and how far you trust them.' },
  { id: 'guard', name: 'Guardrails', line: 'The rules any system we build has to respect.' },
  { id: 'plan', name: 'The plan', line: 'What this should change, and when.' },
]

export const WORKFLOWS: Opt[] = [
  { v: 'intake', l: 'Intake and quoting', d: 'Requests by phone, web and email' },
  { v: 'followup', l: 'Sales follow-up', d: 'Chasing leads and proposals' },
  { v: 'scheduling', l: 'Scheduling and dispatch' },
  { v: 'onboarding', l: 'Onboarding new customers' },
  { v: 'delivery', l: 'Delivering the work', d: 'The service or product itself' },
  { v: 'documents', l: 'Documents', d: 'Contracts, invoices, forms re-keyed by hand' },
  { v: 'billing', l: 'Invoicing and collections' },
  { v: 'reporting', l: 'Reporting', d: 'The weekly report built by hand' },
  { v: 'support', l: 'Customer questions and support' },
  { v: 'knowledge', l: 'Finding answers internally', d: '“Ask Sandra, she knows.”' },
  { v: 'content', l: 'Marketing and content' },
  { v: 'compliance', l: 'Compliance and records' },
]

const audienceOpts: Opt[] = systems.fork.options.map((o) => ({ v: o.id, l: o.label, d: o.line }))
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : [])
export const has = (v: unknown, x: string) => arr(v).includes(x)
export const labelOf = (opts: Opt[] | undefined, v: string) => opts?.find((o) => o.v === v)?.l ?? v

export function audienceOf(a: Answers): SystemsAudience {
  const v = a.audience
  return v === 'small' || v === 'enterprise' ? v : 'team'
}

/** The full question flow for the current answers. Follow-ups appear only when an answer calls for them. */
export function buildFlow(a: Answers): Q[] {
  const F: Q[] = []
  const q = (x: Q) => F.push(x)
  const aud = audienceOf(a)
  const ent = aud === 'enterprise'
  const small = aud === 'small'
  const we = ent ? 'your team' : 'your business'

  /* You */
  q({ id: 'audience', sec: 'you', type: 'audience', title: 'First, which of these sounds like you?', help: 'The questions change to fit.', req: true, opts: audienceOpts })
  q({ id: 'contact', sec: 'you', type: 'contact', title: 'Who should the Leak Map go to?', help: 'We send it to you and nobody else. No newsletter.', req: true })
  q({
    id: 'role', sec: 'you', type: 'choice', title: 'What’s your role?', req: true, other: true,
    opts: ent
      ? [{ v: 'exec', l: 'Executive or sponsor' }, { v: 'ops', l: 'Operations or program lead' }, { v: 'it', l: 'IT, digital or innovation' }, { v: 'dept', l: 'Department or team manager' }]
      : [{ v: 'owner', l: 'Owner or founder' }, { v: 'gm', l: 'General manager' }, { v: 'ops', l: 'Operations lead' }, { v: 'office', l: 'Office or admin lead' }],
  })
  q({ id: 'what', sec: 'you', type: 'long', title: ent ? 'In a sentence or two, what does your team do, and who does it serve?' : 'In a sentence or two, what does the business do, and for whom?', req: true, ph: ent ? 'We process… for…' : 'We sell… to…' })

  /* The money */
  if (ent) {
    q({ id: 'sponsor', sec: 'work', type: 'choice', title: 'Is there a sponsor who would own the result?', help: 'Someone who can approve the work and answer for the outcome.', req: true, opts: [
      { v: 'named', l: 'Yes, and they’re asking for this' }, { v: 'likely', l: 'Probably, once there’s a business case' }, { v: 'none', l: 'Not yet' }, { v: 'me', l: 'That’s me' },
    ] })
    q({ id: 'buying', sec: 'work', type: 'choice', title: 'How is work like this usually bought?', req: true, opts: [
      { v: 'small', l: 'Purchase order under a small-purchase threshold' }, { v: 'vehicle', l: 'An existing contract vehicle' }, { v: 'rfp', l: 'A formal RFP' }, { v: 'internal', l: 'Internal budget, no procurement' }, { v: 'dk', l: 'I don’t know' },
    ] })
  } else {
    q({ id: 'revenue', sec: 'work', type: 'choice', title: 'About how much revenue in the last twelve months?', help: 'A range is enough. It sizes what a fix is worth.', req: true, opts: [
      { v: 'lt250', l: 'Under $250K' }, { v: '250-1m', l: '$250K – $1M' }, { v: '1-5m', l: '$1M – $5M' }, { v: '5-25m', l: '$5M – $25M' }, { v: '25m+', l: 'Over $25M' }, { v: 'na', l: 'Prefer not to say' },
    ] })
    q({ id: 'profit', sec: 'work', type: 'choice', title: 'Is the business profitable today?', req: true, opts: [
      { v: 'healthy', l: 'Yes, comfortably' }, { v: 'thin', l: 'Yes, but the margin is thin' }, { v: 'even', l: 'About break-even' }, { v: 'not', l: 'Not yet' }, { v: 'na', l: 'Prefer not to say' },
    ] })
    if (a.profit === 'thin' || a.profit === 'even' || a.profit === 'not')
      q({ id: 'profit_why', sec: 'work', type: 'long', title: 'Where does the margin go?', help: 'Labor, rework, discounts, a channel that costs more than it earns. Your best guess.', ph: 'Mostly…' })
  }
  q({ id: 'rate', sec: 'work', type: 'number', title: `What’s an hour of ${we}’s time worth, roughly?`, help: 'Loaded cost or billing rate, whichever you know. We use it to put a dollar figure on each leak.', unit: 'per hour', min: 10, maxN: 1000, ph: String(systems.calc.defaults[aud].rate) })

  /* Workflows */
  q({ id: 'wfs', sec: 'flows', type: 'multi', max: 3, title: 'Pick up to three workflows that eat the most time.', help: 'We’ll walk through each one.', req: true, opts: WORKFLOWS, other: true, cols: true })
  const wfs = arr(a.wfs).map((v) => ({ v, l: v === '__other' ? String(a.wfs_other || 'Your other workflow') : labelOf(WORKFLOWS, v) }))
  wfs.forEach((w, i) => {
    const p = `wf_${w.v}_`
    const wf = { n: i + 1, of: wfs.length, label: w.l }
    q({ id: p + 'steps', sec: 'flows', wf, type: 'long', title: `Walk us through ${w.l.toLowerCase()}, start to finish.`, help: 'What starts it, each step, who does it, and the tools they touch. Talking it through is often easier than typing.', req: true, ph: 'It starts when…' })
    q({ id: p + 'hours', sec: 'flows', wf, type: 'number', title: 'How many hours a month does it take, everyone included?', unit: 'hours a month', req: true, min: 0, maxN: 20000 })
    q({ id: p + 'value', sec: 'flows', wf, type: 'choice', title: 'What does it earn or protect?', req: true, opts: [
      { v: 'direct', l: 'It brings in money', d: ent ? 'Revenue, funding or fees depend on it' : 'Customers pay because of it' },
      { v: 'protect', l: 'It protects money', d: 'Skipping it means refunds, fines or lost customers' },
      { v: 'growth', l: 'It grows what comes next', d: 'Pipeline, reputation, new accounts' },
      { v: 'cost', l: 'It’s overhead', d: 'Necessary, but not tied to revenue' },
    ] })
    q({ id: p + 'reps', sec: 'flows', wf, type: 'choice', title: 'How many times has your team done it by hand?', help: 'We automate what’s proven. Work run hundreds of times is ready. Work run twice isn’t.', req: true, opts: [
      { v: 'few', l: 'A handful of times' }, { v: 'dozens', l: 'Dozens of times' }, { v: 'hundreds', l: 'Hundreds of times' }, { v: 'new', l: 'It’s new, we’re still working it out' },
    ] })
    q({ id: p + 'doc', sec: 'flows', wf, type: 'choice', title: 'Is it written down anywhere?', req: true, opts: [
      { v: 'head', l: 'Only in someone’s head' }, { v: 'notes', l: 'Rough notes' }, { v: 'sop', l: 'A written checklist' }, { v: 'sopx', l: 'A checklist with examples of good work' },
    ] })
    q({ id: p + 'check', sec: 'flows', wf, type: 'choice', title: 'How do you know it was done right?', req: true, opts: [
      { v: 'none', l: 'We find out when something breaks' }, { v: 'eyeball', l: 'Someone looks it over' }, { v: 'list', l: 'We run through a checklist' }, { v: 'metric', l: 'A number tells us', d: 'Turnaround time, error rate, close rate' },
    ] })
    q({ id: p + 'pain', sec: 'flows', wf, type: 'choice', title: 'Which part hurts most?', req: true, other: true, opts: [
      { v: 'gather', l: 'Pulling information from different places' }, { v: 'rekey', l: 'Copying data from one system to another' }, { v: 'write', l: 'Writing the same things over and over' }, { v: 'wait', l: 'Waiting on other people' }, { v: 'decide', l: 'Deciding what to do' }, { v: 'review', l: 'Checking for mistakes' },
    ] })
  })

  /* Friction */
  if (wfs.length > 1) q({ id: 'timesink', sec: 'friction', type: 'choice', title: 'Of those, which one would you fix first?', req: true, opts: wfs.map((w) => ({ v: w.v, l: w.l })) })
  q({ id: 'tenhours', sec: 'friction', type: 'long', title: small ? 'If you got ten hours back every week, where would they go?' : 'If your team got ten hours back every week, where would they go?', req: true, ph: 'We’d spend them on…' })
  q({ id: 'away', sec: 'friction', type: 'long', title: small ? 'What stops if you’re out for a week?' : 'What breaks if your most important person is out for a week?', help: 'This shows which knowledge lives with one person.', req: true, ph: 'If they’re out…' })
  q({ id: 'errors', sec: 'friction', type: 'multi', title: 'Which of these cost you money in the last year?', req: true, cols: true, other: true, opts: [
    { v: 'missed', l: 'Missed calls or slow replies' }, { v: 'billing', l: 'Billing errors or late payments' }, { v: 'rework', l: 'Rework or redone jobs' }, { v: 'rekey', l: 'Data entry mistakes' }, { v: 'compliance', l: 'Compliance or audit findings' }, { v: 'churn', l: 'Customers who quietly left' }, { v: 'none', l: 'None that we know of', excl: true },
  ] })
  if (has(a.errors, 'missed')) q({ id: 'missed_detail', sec: 'friction', type: 'long', title: 'Where do calls and replies slip?', help: 'Which hours, which channel, and what happens to those people.', ph: 'They slip when…' })
  if (has(a.errors, 'billing')) q({ id: 'billing_cost', sec: 'friction', type: 'number', title: 'Roughly what did billing errors and late payments cost last year?', unit: 'dollars', min: 0, maxN: 100000000 })
  if (has(a.errors, 'compliance')) q({ id: 'compliance_detail', sec: 'friction', type: 'long', title: 'What was found, and by whom?', ph: 'An auditor found…' })

  /* Tools */
  q({ id: 'aitools', sec: 'tools', type: 'multi', title: 'Which AI tools did your team use in the last month?', req: true, cols: true, other: true, opts: [
    { v: 'chat', l: 'Chat assistants', d: 'Claude, ChatGPT, Copilot, Gemini' }, { v: 'agentic', l: 'Agentic tools', d: 'Claude Code, Codex, Cursor' }, { v: 'auto', l: 'Automation platforms', d: 'n8n, Zapier, Make, Power Automate' }, { v: 'builtin', l: 'AI inside apps you already use', d: 'CRM, email, office suite' }, { v: 'none', l: 'None yet', excl: true },
  ] })
  q({ id: 'ladder', sec: 'tools', type: 'choice', title: 'Which best describes how you use AI today?', req: true, opts: [
    { v: '1', l: 'A few people ask a chat assistant questions' }, { v: '2', l: 'People use it daily, with saved prompts or projects' }, { v: '3', l: 'AI does multi-step work while someone supervises' }, { v: '4', l: 'Some automations run without anyone watching' }, { v: '5', l: 'Systems run in production, and someone monitors them' },
  ] })
  if (Number(a.ladder) >= 4) q({ id: 'auto_detail', sec: 'tools', type: 'long', title: 'Which one runs on its own, and what has broken on it?', req: true, ph: 'The one that runs every day…' })
  if (ent) q({ id: 'pilots', sec: 'tools', type: 'choice', title: 'How have AI pilots gone so far?', req: true, opts: [
    { v: 'none', l: 'We haven’t run one' }, { v: 'stalled', l: 'Pilots ran, none are in use now' }, { v: 'one', l: 'One is in regular use' }, { v: 'several', l: 'Several are in regular use' },
  ] })
  q({ id: 'fluency', sec: 'tools', type: 'multi', title: 'Which of these could you explain to a new hire?', help: 'Be honest. It decides how much the plan has to explain.', opts: [
    { v: 'halluc', l: 'Why AI sometimes states wrong facts with confidence' }, { v: 'context', l: 'Why a model “forgets” what it was told earlier' }, { v: 'tokens', l: 'Why long documents cost more to process' }, { v: 'finetune', l: 'The difference between prompting and training a model' }, { v: 'reason', l: 'What a reasoning model does differently' }, { v: 'none', l: 'None of these yet', excl: true },
  ] })

  /* Hand-offs */
  q({ id: 'brief', sec: 'handoff', type: 'multi', title: 'When someone hands work to AI, what do they usually include?', req: true, opts: [
    { v: 'context', l: 'Context', d: 'Who we are and what it’s for' }, { v: 'goal', l: 'The goal', d: 'The result we want' }, { v: 'great', l: 'What good looks like', d: 'An example or a standard' }, { v: 'verify', l: 'How to check it', d: 'How the work gets verified' }, { v: 'oneline', l: 'Usually a one-line ask', excl: true },
  ] })
  q({ id: 'delegate', sec: 'handoff', type: 'scale', title: 'How well do hand-offs between people go today?', lo: 'Work comes back wrong', hi: 'Hand it off and move on', req: true })
  if (small) q({ id: 'myhours', sec: 'handoff', type: 'number', title: 'How many hours a week do you work in the business?', unit: 'hours a week', min: 0, maxN: 120 })
  else q({ id: 'champion', sec: 'handoff', type: 'choice', title: 'Is there someone who could own this day to day?', help: 'Systems get used when someone inside cares about them.', req: true, opts: [
    { v: 'yes', l: 'Yes, and they have time' }, { v: 'busy', l: 'Yes, but they’re stretched' }, { v: 'no', l: 'Not yet' },
  ] })

  /* Data */
  q({ id: 'systems', sec: 'data', type: 'multi', title: 'Where does the work live today?', req: true, cols: true, other: true, opts: [
    { v: 'crm', l: 'A CRM', d: 'HubSpot, Salesforce, Pipedrive' }, { v: 'jobs', l: 'Job or case management', d: 'Jobber, ServiceTitan, a case system' }, { v: 'accounting', l: 'Accounting software', d: 'QuickBooks, Xero, an ERP' }, { v: 'sheets', l: 'Spreadsheets' }, { v: 'email', l: 'Email inboxes' }, { v: 'paper', l: 'Paper, or people’s heads' },
  ] })
  q({ id: 'baseline', sec: 'data', type: 'choice', title: ent ? 'Do you have baseline numbers for the workflows you picked?' : 'Do you know what a job or order costs you to deliver?', req: true, opts: [
    { v: 'current', l: 'Yes, and they’re current' }, { v: 'stale', l: 'Yes, but they’re over a year old' }, { v: 'rough', l: 'Roughly' }, { v: 'no', l: 'No' },
  ] })
  q({ id: 'trust', sec: 'data', type: 'scale', title: 'How much do you trust your numbers?', lo: 'Mostly guesses', hi: 'We’d show them to an auditor', req: true })
  if (Number(a.trust) > 0 && Number(a.trust) <= 2) q({ id: 'trust_why', sec: 'data', type: 'long', title: 'What makes them hard to trust?', ph: 'The problem is…' })

  /* Guardrails */
  q({ id: 'sensitive', sec: 'guard', type: 'multi', title: 'What sensitive information does the work touch?', req: true, opts: [
    { v: 'pii', l: 'Names, addresses, contact details' }, { v: 'payments', l: 'Payment information' }, { v: 'health', l: 'Health information' }, { v: 'ids', l: 'Government ID numbers' }, { v: 'none', l: 'None of these', excl: true },
  ] })
  if (ent) q({ id: 'reviews', sec: 'guard', type: 'multi', title: 'Which reviews would a new system have to pass?', req: true, cols: true, opts: [
    { v: 'security', l: 'Security' }, { v: 'privacy', l: 'Privacy' }, { v: 'a11y', l: 'Accessibility' }, { v: 'legal', l: 'Legal' }, { v: 'procurement', l: 'Procurement' }, { v: 'labor', l: 'Union or labor relations' }, { v: 'dk', l: 'Not sure', excl: true },
  ] })
  q({ id: 'approval', sec: 'guard', type: 'choice', title: 'How should AI-made work reach customers or the public?', help: 'Every system we build has a person approving the steps that matter. How tight should that be?', req: true, opts: [
    { v: 'never', l: 'It shouldn’t, internal use only' }, { v: 'every', l: 'A person approves every piece' }, { v: 'spot', l: 'Routine work goes out, a person spot-checks' }, { v: 'free', l: 'It can go out freely' },
  ] })

  /* Plan */
  q({ id: 'priority', sec: 'plan', type: 'choice', title: 'What should this change first?', req: true, opts: [
    { v: 'time', l: 'Give people time back' }, { v: 'revenue', l: 'Bring in more revenue' }, { v: 'quality', l: 'Fewer errors and less rework' }, { v: 'service', l: 'Faster answers for customers' }, ...(ent ? [{ v: 'proof', l: 'Prove AI works here' }] : []),
  ] })
  q({ id: 'timeline', sec: 'plan', type: 'choice', title: 'When would you want to start?', req: true, opts: contact.form.timelineOptions.map((t) => ({ v: t, l: t })) })
  q({ id: 'anything', sec: 'plan', type: 'long', title: 'Anything else we should know?', ph: 'Optional' })

  return F
}

/* ---------------- Leak Map preview ---------------- */

export type Leak = { id: string; label: string; hoursYear: number; dollarsYear: number; ready: 'ready' | 'groundwork' | 'prove'; reasons: string[]; first: boolean }
export type Dim = { id: string; name: string; score: number; line: string }

const repsPts: Record<string, number> = { new: 0, few: 1, dozens: 2, hundreds: 3 }
const docPts: Record<string, number> = { head: 0, notes: 1, sop: 2, sopx: 3 }
const checkPts: Record<string, number> = { none: 0, eyeball: 1, list: 2, metric: 3 }

export function leakMap(a: Answers): { leaks: Leak[]; dims: Dim[]; overall: number; rate: number; rateAssumed: boolean } {
  const aud = audienceOf(a)
  const rateIn = Number(a.rate)
  const rateAssumed = !(rateIn > 0)
  const rate = rateAssumed ? systems.calc.defaults[aud].rate : rateIn

  const leaks: Leak[] = arr(a.wfs).map((v) => {
    const p = `wf_${v}_`
    const label = v === '__other' ? String(a.wfs_other || 'Your other workflow') : labelOf(WORKFLOWS, v)
    const hoursYear = Math.max(0, Number(a[p + 'hours']) || 0) * 12
    const r = repsPts[String(a[p + 'reps'])] ?? 0
    const d = docPts[String(a[p + 'doc'])] ?? 0
    const c = checkPts[String(a[p + 'check'])] ?? 0
    const pts = r + d + c
    const reasons: string[] = []
    const ready: Leak['ready'] = r === 0 || pts < 3 ? 'prove' : pts >= 6 && c > 0 ? 'ready' : 'groundwork'
    if (r <= 1) reasons.push(r === 0 ? 'Still being worked out by hand' : 'Run only a handful of times')
    if (d === 0) reasons.push('Only written down in someone’s head')
    else if (d === 1 && ready !== 'ready') reasons.push('Only rough notes so far')
    if (c === 0) reasons.push('No way to check it yet')
    else if (c === 1 && ready !== 'ready') reasons.push('Checked by eye, not by a number')
    if (ready === 'ready') reasons.unshift('Repeated, written down and checkable')
    return { id: v, label, hoursYear, dollarsYear: hoursYear * rate, ready, reasons, first: a.timesink === v }
  })
  const order = { ready: 0, groundwork: 1, prove: 2 }
  leaks.sort((x, y) => y.dollarsYear - x.dollarsYear || order[x.ready] - order[y.ready])

  const clamp = (n: number) => Math.max(1, Math.min(5, Math.round(n * 10) / 10))
  const flowsAvg = leaks.length
    ? leaks.reduce((s, l) => s + (l.ready === 'ready' ? 5 : l.ready === 'groundwork' ? 3 : 1.5), 0) / leaks.length
    : 1
  const money =
    aud === 'enterprise'
      ? ({ named: 5, me: 4.5, likely: 3, none: 1.5 } as Record<string, number>)[String(a.sponsor)] ?? 2
      : ({ healthy: 5, thin: 3.5, even: 2, not: 1.5, na: 3 } as Record<string, number>)[String(a.profit)] ?? 2.5
  const tools = Number(a.ladder) || 1
  const fl = has(a.fluency, 'none') ? 0 : arr(a.fluency).length
  const fluency = [1, 2, 3, 3.5, 4.5, 5][fl] ?? 1
  const briefN = has(a.brief, 'oneline') ? 0 : arr(a.brief).length
  const handoff = ((1 + briefN) + (Number(a.delegate) || 1)) / 2
  const baseline = ({ current: 5, stale: 3.5, rough: 2.5, no: 1 } as Record<string, number>)[String(a.baseline)] ?? 1
  const data = (baseline + (Number(a.trust) || 1)) / 2
  const touchy = arr(a.sensitive).some((x) => x !== 'none')
  const guard = ({ every: 5, spot: touchy ? 3 : 4, never: 3.5, free: touchy ? 1 : 2.5 } as Record<string, number>)[String(a.approval)] ?? 2.5

  const dims: Dim[] = [
    { id: 'money', name: 'The money', score: clamp(money), line: aud === 'enterprise' ? 'Someone owns the result and can pay for it.' : 'The work is profitable before any AI touches it.' },
    { id: 'flows', name: 'Workflows', score: clamp(flowsAvg), line: 'Repeated, written down and checkable.' },
    { id: 'tools', name: 'Tools', score: clamp(tools), line: 'From chat now and then to systems in production.' },
    { id: 'fluency', name: 'Fluency', score: clamp(fluency), line: 'How well the team knows how AI behaves.' },
    { id: 'handoff', name: 'Hand-offs', score: clamp(handoff), line: 'Work can be spelled out well enough to delegate.' },
    { id: 'data', name: 'Data', score: clamp(data), line: 'Numbers you can measure a change against.' },
    { id: 'guard', name: 'Guardrails', score: clamp(guard), line: 'A person approves what matters, matched to the risk.' },
  ]
  const overall = Math.round((dims.reduce((s, d) => s + d.score, 0) / dims.length) * 10) / 10
  return { leaks, dims, overall, rate, rateAssumed }
}

export const READY_LABEL: Record<Leak['ready'], string> = {
  ready: 'Ready to build',
  groundwork: 'Needs groundwork',
  prove: 'Prove it by hand first',
}
