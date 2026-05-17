export interface YearRow {
  year: number
  max_concentration: number | null
  avg_concentration?: number | null
  sdwa_limit: number | null
  unit?: string | null
  category?: string
  over_limit?: boolean
  risk_score?: number
  score_available?: boolean
}

export interface AnalytePack {
  analyte_name: string
  summary_latest_year: number
  by_year: YearRow[]
}

export interface ExceedRow {
  analyte_name: string
  year: number
  summary: string
}

export interface PwsPayload {
  lane: string
  pws_label: string
  pws_id_number: string
  county?: string
  generated_at: string
  years_present: number[]
  analytes: AnalytePack[]
  exceedances_all_years: ExceedRow[]
}

export interface EduLink {
  label: string
  url: string
}

export interface EduEntry {
  tier: 'expanded' | 'links_only'
  hook: string
  links: EduLink[]
  expanded?: string[]
}

export interface EducationPayload {
  version: number
  intro: string
  by_analyte_name: Record<string, EduEntry>
}
