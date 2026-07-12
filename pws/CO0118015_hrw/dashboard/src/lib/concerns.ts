export type ConcernId = 'taste' | 'pfas' | 'lead' | 'report' | 'changes'

export type ClarifyOption = {
  id: string
  label: string
}

export type ConcernDef = {
  id: ConcernId
  enabled: boolean
  landingLabel: string
  clarifyQuestion: string
  clarifyHint: string
  clarifyOptions: ClarifyOption[]
  insightTitle: string
  /** Default analyte when branch does not override */
  primaryAnalyteName: string
}

export const TASTE_PRIMARY_ANALYTE = 'TTHM (total trihalomethanes)'
export const TASTE_SECONDARY_ANALYTE = 'HAA5 (haloacetic acids)'
export const PFAS_PRIMARY_ANALYTE = 'PFOA'
export const LEAD_PRIMARY_ANALYTE = 'Lead'

export const TASTE_CONCERN: ConcernDef = {
  id: 'taste',
  enabled: true,
  landingLabel: 'My water tastes or smells different',
  clarifyQuestion: 'What are you noticing?',
  clarifyHint: 'Choose the closest match.',
  clarifyOptions: [
    { id: 'chlorine', label: 'Chlorine or chemical smell' },
    { id: 'metallic', label: 'Metallic taste' },
    { id: 'musty', label: 'Musty or earthy' },
    { id: 'unsure', label: "I'm not sure" },
  ],
  insightTitle: 'Should you worry?',
  primaryAnalyteName: TASTE_PRIMARY_ANALYTE,
}

export const PFAS_CONCERN: ConcernDef = {
  id: 'pfas',
  enabled: true,
  landingLabel: 'I heard about PFAS',
  clarifyQuestion: 'What do you want to know?',
  clarifyHint: 'Choose the closest match.',
  clarifyOptions: [
    { id: 'filter', label: 'Whether a filter would help' },
    { id: 'health', label: 'Health effects and safety' },
    { id: 'news', label: 'What the news means for my water' },
    { id: 'levels', label: 'What PFAS levels look like here' },
  ],
  insightTitle: 'Should you worry?',
  primaryAnalyteName: PFAS_PRIMARY_ANALYTE,
}

export const LEAD_CONCERN: ConcernDef = {
  id: 'lead',
  enabled: true,
  landingLabel: "I'm worried about lead",
  clarifyQuestion: 'What do you want to know?',
  clarifyHint: 'Choose the closest match.',
  clarifyOptions: [
    { id: 'children', label: "Whether it's safe for young children" },
    { id: 'plumbing', label: 'What older plumbing means for lead' },
    { id: 'read-report', label: 'How to read lead results in a report' },
    { id: 'overview', label: 'A general overview' },
  ],
  insightTitle: 'Should you worry?',
  primaryAnalyteName: LEAD_PRIMARY_ANALYTE,
}

export const REPORT_CONCERN: ConcernDef = {
  id: 'report',
  enabled: true,
  landingLabel: "I don't understand my water report",
  clarifyQuestion: 'What would help most?',
  clarifyHint: 'Choose the closest match.',
  clarifyOptions: [
    { id: 'units', label: 'Help with numbers and units' },
    { id: 'limits', label: 'Help understanding limits' },
    { id: 'monitoring', label: 'What gets monitored and why' },
    { id: 'overview', label: 'A plain-language overview' },
  ],
  insightTitle: "Here's the big picture",
  primaryAnalyteName: '',
}

export const CHANGES_CONCERN: ConcernDef = {
  id: 'changes',
  enabled: true,
  landingLabel: 'Has anything changed over the years?',
  clarifyQuestion: 'What do you want to check?',
  clarifyHint: 'Choose the closest match.',
  clarifyOptions: [
    { id: 'taste-changes', label: 'Whether taste or smell has changed' },
    { id: 'specific', label: 'Whether a specific contaminant has changed' },
    { id: 'worse', label: 'Whether anything has gotten worse overall' },
    { id: 'overview', label: 'A general trends overview' },
  ],
  insightTitle: 'Has anything changed?',
  primaryAnalyteName: TASTE_PRIMARY_ANALYTE,
}

export const ALL_CONCERNS: ConcernDef[] = [
  TASTE_CONCERN,
  PFAS_CONCERN,
  LEAD_CONCERN,
  REPORT_CONCERN,
  CHANGES_CONCERN,
]

export const LANDING_CONCERNS = ALL_CONCERNS.filter((c) => c.enabled)

export function getConcernById(id: ConcernId): ConcernDef | undefined {
  return ALL_CONCERNS.find((c) => c.id === id)
}

export function parseConcernFromSearch(search: string): ConcernId | null {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  const raw = params.get('concern')
  if (!raw) return null
  const concern = ALL_CONCERNS.find((c) => c.id === raw)
  return concern ? concern.id : null
}

export function isGuidedConcern(id: ConcernId | null): boolean {
  if (!id) return false
  const concern = getConcernById(id)
  return !!concern?.enabled
}
