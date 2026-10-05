export const site = {
  name: 'prince + marshall',
  label: 'Creative & Strategy',
  metaTop: ['Independent consultancy', 'Working w/ ambitious brands'],
  email: 'hello@princeandmarshall.com',
}

export const hero = {
  nameLine: 'prince + marshall',
  stackedLines: [
    { text: 'Creative &', align: 'left' },
    { text: 'Strategy', align: 'left' },
    { text: 'Consultancy,', align: 'right' },
    { text: 'Brand & Digital.', align: 'left' },
  ] as { text: string; align: 'left' | 'right' }[],
  statement:
    'We help ambitious companies find their position, sharpen their story, and build brands that move markets — strategy first, craft always.',
}

export const statement = {
  lines: [
    { text: 'the boldest brands', align: 'left' },
    { text: 'deserve strategy', align: 'right' },
    { text: '& craft.', align: 'left' },
  ] as { text: string; align: 'left' | 'right' }[],
}

export const work = {
  heading: 'Work',
  years: '24–26',
  allWorksLabel: 'All Works',
  projects: [
    { index: '01', title: 'Harbor & Grey', client: 'Harbor & Grey', tags: ['Rebrand'], year: '2026' },
    { index: '02', title: 'Atlas Ventures', client: 'Atlas Ventures', tags: ['Positioning'], year: '2026' },
    { index: '03', title: 'Mirelle', client: 'Mirelle', tags: ['Launch Campaign'], year: '2025' },
    { index: '04', title: 'Northwind', client: 'Northwind', tags: ['Brand System'], year: '2025' },
    { index: '05', title: 'Cartel Coffee', client: 'Cartel Coffee', tags: ['Packaging'], year: '2024' },
    { index: '06', title: 'Vantage', client: 'Vantage', tags: ['Digital Platform'], year: '2024' },
  ] as Project[],
}

export interface Project {
  index: string
  title: string
  client: string
  tags: string[]
  year: string
}

export const recognition = {
  heading: 'Recognition',
  yearGroups: ["'26", "'25", "'24", "'23"],
  rows: [
    { year: "'26", org: 'D&AD', award: 'Wood Pencil' },
    { year: "'26", org: 'Awwwards', award: 'Site of the Day' },
    { year: "'25", org: 'Cannes Lions', award: 'Shortlist' },
    { year: "'25", org: 'Fast Company', award: 'Innovation by Design' },
    { year: "'24", org: 'ADC', award: 'Merit Award' },
    { year: "'24", org: 'The One Show', award: 'Silver Pencil' },
    { year: "'23", org: 'Brand New', award: 'Best Reviewed' },
    { year: "'23", org: 'Communication Arts', award: 'Design Annual' },
  ] as RecognitionRow[],
}

export interface RecognitionRow {
  year: string
  org: string
  award: string
}

export const quote = {
  before: 'Every great brand was once',
  after: 'nothing more than a hunch.',
}

export const contact = {
  availability: 'Available for selected engagements',
  writeTo: 'Write directly to:',
  cta: 'Start a project',
}

export const footer = {
  left: "prince + marshall '26 © All Rights Reserved",
  cheeky: 'made w/ intent',
  wordmark: 'prince + marshall',
}

export const menu = {
  openLabel: 'Menu',
  closeLabel: 'Close',
  items: [
    { number: '01', label: 'Home', href: '#home' },
    { number: '02', label: 'Work', href: '#work' },
    { number: '03', label: 'Recognition', href: '#recognition' },
    { number: '04', label: 'Contact', href: '#contact' },
    { number: '', label: 'Perspectives', href: '#statement' },
  ],
}
