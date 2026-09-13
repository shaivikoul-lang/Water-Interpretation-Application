import type { ConcernId } from './concerns'
import type { TopicId } from '../components/TopicsHub'

/**
 * Where a landing-page interaction sends the resident.
 *
 * `guided`, `explore`, `tds-reading`, and the `changes` concern hand off to
 * existing flows; the landing page never interprets water data itself. `pending`
 * covers features that are not built yet.
 */
export type LandingIntent =
  | { kind: 'guided'; concernId: ConcernId }
  | { kind: 'explore'; topic?: TopicId }
  | { kind: 'contaminant' }
  | { kind: 'tds-reading' }
  | { kind: 'pending'; message: string }

const HOME_READING_INTENT: LandingIntent = { kind: 'tds-reading' }

export const IMPACT_PENDING_MESSAGE =
  'Our community impact page is coming next.'

/** External references used by the footer and nav. */
export const EXTERNAL_LINKS = {
  cdphe: 'https://cdphe.colorado.gov/dwinfo',
  epa: 'https://www.epa.gov/ground-water-and-drinking-water',
  repo: 'https://github.com/shaivikoul-lang/Water-Interpretation-Application',
} as const

/**
 * Deterministic keyword table for the search box. This is a lookup, not a
 * language model: the first rule whose keywords appear in the query wins, and an
 * unmatched query falls through to `null` so the UI can say so plainly.
 *
 * Order matters — more specific intents are listed before broader ones.
 */
const SEARCH_RULES: { keywords: string[]; intent: LandingIntent }[] = [
  {
    keywords: ['tds', 'ppm', 'meter', 'home test', 'test kit', 'test strip', 'my reading'],
    intent: HOME_READING_INTENT,
  },
  { keywords: ['pfas', 'pfoa', 'pfos', 'forever chemical'], intent: { kind: 'guided', concernId: 'pfas' } },
  { keywords: ['lead', 'pipe', 'plumbing'], intent: { kind: 'guided', concernId: 'lead' } },
  { keywords: ['copper'], intent: { kind: 'guided', concernId: 'copper' } },
  { keywords: ['arsenic'], intent: { kind: 'guided', concernId: 'arsenic' } },
  { keywords: ['lithium'], intent: { kind: 'guided', concernId: 'lithium' } },
  {
    keywords: ['chlorine', 'chemical smell', 'bleach', 'pool'],
    intent: { kind: 'guided', concernId: 'taste' },
  },
  {
    keywords: ['metallic', 'metal taste', 'taste', 'smell', 'odor', 'odour', 'cloudy', 'musty', 'earthy', 'color', 'colour'],
    intent: { kind: 'guided', concernId: 'taste' },
  },
  {
    keywords: ['change', 'changed', 'historical', 'history', 'over time', 'trend', 'worse', 'year'],
    intent: { kind: 'guided', concernId: 'changes' },
  },
  {
    keywords: ['ccr', 'consumer confidence', 'water quality report'],
    intent: { kind: 'guided', concernId: 'report' },
  },
  // Named contaminants without a dedicated guided flow open the data explorer.
  {
    keywords: ['nitrate', 'uranium', 'radium', 'atrazine', 'turbidity', 'tthm', 'haa5', 'contaminant'],
    intent: { kind: 'explore' },
  },
]

/** Resolve a free-text query to an existing flow, or `null` when nothing matches. */
export function resolveSearchIntent(query: string): LandingIntent | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  for (const rule of SEARCH_RULES) {
    if (rule.keywords.some((keyword) => q.includes(keyword))) return rule.intent
  }
  return null
}

/** In-app URL for a search hit. Never points at the HRW website. */
export function searchHrefForIntent(intent: LandingIntent): string | null {
  if (intent.kind === 'pending') return null
  if (intent.kind === 'guided') return `?concern=${intent.concernId}`
  if (intent.kind === 'explore') return '?explore=1'
  if (intent.kind === 'tds-reading') return '?tds=1'
  if (intent.kind === 'contaminant') return '?contaminant=1'
  return null
}

export type StartCard = {
  id: string
  title: string
  description: string
  intent: LandingIntent
}

/** "What brought you to WaterLens today?" — four entry points. */
export const START_CARDS: StartCard[] = [
  {
    id: 'noticing',
    title: 'Something tastes, smells, or looks different',
    description: "Start with what you're noticing.",
    intent: { kind: 'guided', concernId: 'taste' },
  },
  {
    id: 'home-reading',
    title: 'I have a home meter or test reading',
    description: 'Understand a reading from your home.',
    intent: HOME_READING_INTENT,
  },
  {
    id: 'contaminant',
    title: "I'm worried about a contaminant",
    description: 'PFAS, lead, arsenic, copper, lithium, and more.',
    intent: { kind: 'contaminant' },
  },
  {
    id: 'changed',
    title: 'Has my water changed?',
    description: 'See what the historical data shows.',
    intent: { kind: 'guided', concernId: 'changes' },
  },
]
