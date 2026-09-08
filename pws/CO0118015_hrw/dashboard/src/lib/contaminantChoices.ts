import { latestRowForAnalyte } from './derive'
import type { TopicId } from '../components/TopicsHub'
import type { ConcernId } from './concerns'
import type { PwsPayload } from '../types/water'

const PFAS_NAMES = ['PFOA', 'PFOS', 'PFNA', 'PFHxS', 'PFBS'] as const

export function isPfasAnalyteName(name: string): boolean {
  return (PFAS_NAMES as readonly string[]).includes(name) || /^HFPO/i.test(name)
}

export type ContaminantRoute =
  | { kind: 'guided'; concernId: Extract<ConcernId, 'pfas' | 'lead' | 'arsenic' | 'copper' | 'lithium'> }
  | { kind: 'explore-analyte'; analyteName: string; topic?: TopicId }
  | { kind: 'explore' }

export type ContaminantAvailability = 'data' | 'guidance'

export type ContaminantChoice = {
  id: string
  title: string
  description: string
  tone: 'pink' | 'yellow' | 'green' | 'blue' | 'orange' | 'gray'
  availability: ContaminantAvailability
  route: ContaminantRoute
}

function packUsable(water: PwsPayload, name: string): boolean {
  const pack = water.analytes.find((a) => a.analyte_name === name)
  return !!pack && pack.by_year.length > 0 && latestRowForAnalyte(pack) != null
}

function anyUsable(water: PwsPayload, names: readonly string[]): boolean {
  return names.some((name) => packUsable(water, name))
}

const CANDIDATES: Omit<ContaminantChoice, 'availability'>[] = [
  {
    id: 'pfas',
    title: 'PFAS',
    description: 'Man-made chemicals that can persist in the environment.',
    tone: 'pink',
    route: { kind: 'guided', concernId: 'pfas' },
  },
  {
    id: 'lead',
    title: 'Lead',
    description: 'A metal that can enter water through plumbing.',
    tone: 'yellow',
    route: { kind: 'guided', concernId: 'lead' },
  },
  {
    id: 'arsenic',
    title: 'Arsenic',
    description: 'A naturally occurring element found in rock and soil.',
    tone: 'green',
    route: { kind: 'guided', concernId: 'arsenic' },
  },
  {
    id: 'copper',
    title: 'Copper',
    description: 'A metal that can enter water through household plumbing.',
    tone: 'orange',
    route: { kind: 'guided', concernId: 'copper' },
  },
  {
    id: 'lithium',
    title: 'Lithium',
    description: 'A naturally occurring metal monitored under EPA’s UCMR 5.',
    tone: 'blue',
    route: { kind: 'guided', concernId: 'lithium' },
  },
]

function candidateHasData(water: PwsPayload, id: string): boolean {
  if (id === 'pfas') return anyUsable(water, PFAS_NAMES)
  if (id === 'lead') return packUsable(water, 'Lead')
  if (id === 'arsenic') return packUsable(water, 'Arsenic')
  if (id === 'copper') return true
  if (id === 'lithium') return true
  return false
}

/** Cards for the contaminant picker — availability comes from the extract. */
export function contaminantChoices(water: PwsPayload): ContaminantChoice[] {
  return CANDIDATES.flatMap((candidate) => {
    const hasData = candidateHasData(water, candidate.id)
    if (!hasData) return []
    return [{ ...candidate, availability: 'data' as const }]
  })
}

export const CONTAMINANT_COPY = {
  title: 'What contaminant are you concerned about?',
  lede: 'Choose a contaminant to see the available Highlands Ranch Water data, how it compares with applicable drinking-water standards, and what the results mean.',
  otherTitle: 'Looking for another contaminant?',
  otherBody: 'Open the classic dashboard and choose any published measure from the dropdown.',
  otherAction: 'Browse every measure',
  whyHeading: 'Why look at contaminant data?',
  whyIdeas: [
    {
      title: 'See the actual data',
      body: 'View available measurements and historical trends.',
    },
    {
      title: 'Compare with standards',
      body: 'See how measurements relate to applicable EPA or drinking-water references.',
    },
    {
      title: 'Understand the context',
      body: 'Get a clear explanation of what the numbers mean — and what they do not mean.',
    },
  ],
  trustHeading: 'Built from official sources',
  trustBody:
    'WaterLens uses publicly available information from Highlands Ranch Water, the Colorado Department of Public Health and Environment, and the U.S. EPA. Measurements and regulatory references remain traceable to their original sources.',
  trustAction: 'Learn about our sources',
  note: 'WaterLens explains public water-system monitoring data. It does not test the water at your individual faucet. Household plumbing can affect some contaminants, including lead and copper.',
} as const
