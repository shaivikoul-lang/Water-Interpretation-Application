/**
 * Central registry for explanatory sources shown in guided results.
 * UI components should look up IDs here instead of inlining URLs.
 *
 * Measurements never live here — they come from the official data layer.
 */

export type SourceKind = 'local-guidance' | 'epa-context' | 'data'

export type SourceEntry = {
  id: string
  label: string
  url: string
  kind: SourceKind
}

export const SOURCE_REGISTRY = {
  hrw_water_quality_faq: {
    id: 'hrw_water_quality_faq',
    label: 'Highlands Ranch Water — Water Quality FAQs',
    shortLabel: 'HRW guidance',
    url: 'https://www.highlandsranchwater.org/water-quality-faqs',
    kind: 'local-guidance',
  },
  hrw_water_treatment: {
    id: 'hrw_water_treatment',
    label: 'Highlands Ranch Water — Water Treatment',
    shortLabel: 'HRW treatment',
    url: 'https://www.highlandsranchwater.org/water-treatment',
    kind: 'local-guidance',
  },
  hrw_water_quality_indicators: {
    id: 'hrw_water_quality_indicators',
    label: 'Highlands Ranch Water — Water Quality Indicators',
    shortLabel: 'HRW indicators',
    url: 'https://www.highlandsranchwater.org/water-quality-indicators',
    kind: 'data',
  },
  hrw_report_concern: {
    id: 'hrw_report_concern',
    label: 'Highlands Ranch Water — Report a Water Concern',
    shortLabel: 'Report a water concern',
    url: 'https://www.highlandsranchwater.org/report-a-concern',
    kind: 'local-guidance',
  },
  epa_chloramines: {
    id: 'epa_chloramines',
    label: 'EPA — Chloramines in Drinking Water',
    shortLabel: 'EPA: Chloramines',
    url: 'https://www.epa.gov/dwreginfo/chloramines-drinking-water',
    kind: 'epa-context',
  },
  epa_primary_drinking_water_regulations: {
    id: 'epa_primary_drinking_water_regulations',
    label: 'EPA — National Primary Drinking Water Regulations',
    shortLabel: 'EPA primary regulations',
    url: 'https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations',
    kind: 'epa-context',
  },
  epa_secondary_standards: {
    id: 'epa_secondary_standards',
    label: 'EPA — Secondary Drinking Water Standards: Guidance for Nuisance Chemicals',
    shortLabel: 'EPA aesthetic guidance',
    url: 'https://www.epa.gov/sdwa/secondary-drinking-water-standards-guidance-nuisance-chemicals',
    kind: 'epa-context',
  },
  cdphe_hrw_monitoring: {
    id: 'cdphe_hrw_monitoring',
    label: 'CDPHE public drinking water monitoring — PWS CO0118015',
    shortLabel: 'CDPHE monitoring',
    url: 'https://cdphe.colorado.gov/dwinfo',
    kind: 'data',
  },
  hrw_2025_water_quality_report: {
    id: 'hrw_2025_water_quality_report',
    label: 'Highlands Ranch Water — Water Quality / PFAS monitoring',
    shortLabel: 'HRW PFAS monitoring',
    url: 'https://www.highlandsranchwater.org/water-quality',
    kind: 'data',
  },
  hrw_pfas: {
    id: 'hrw_pfas',
    label: 'Highlands Ranch Water — PFAS',
    shortLabel: 'HRW PFAS',
    url: 'https://www.highlandsranchwater.org/pfas',
    kind: 'local-guidance',
  },
  epa_pfas: {
    id: 'epa_pfas',
    label: 'EPA — PFAS Explained',
    shortLabel: 'EPA: PFAS',
    url: 'https://www.epa.gov/pfas',
    kind: 'epa-context',
  },
  epa_pfas_health: {
    id: 'epa_pfas_health',
    label: 'EPA — Our Current Understanding of the Human Health and Environmental Risks of PFAS',
    shortLabel: 'EPA: PFAS and health',
    url: 'https://www.epa.gov/pfas/our-current-understanding-human-health-and-environmental-risks-pfas',
    kind: 'epa-context',
  },
  epa_pfas_rule: {
    id: 'epa_pfas_rule',
    label: 'EPA — PFAS National Primary Drinking Water Regulation',
    shortLabel: 'EPA PFAS rule',
    url: 'https://www.epa.gov/sdwa/and-polyfluoroalkyl-substances-pfas',
    kind: 'epa-context',
  },
  epa_pfas_2026_proposed_extension: {
    id: 'epa_pfas_2026_proposed_extension',
    label: 'EPA — Proposed PFOA and PFOS compliance-deadline extension (2026)',
    shortLabel: '2026 proposed extension',
    url: 'https://www.epa.gov/sdwa/proposed-pfoa-and-pfos-compliance-extension-rule',
    kind: 'epa-context',
  },
  epa_pfas_2026_proposed_rescission: {
    id: 'epa_pfas_2026_proposed_rescission',
    label: 'EPA — Proposed PFAS rescission rule (PFHxS, PFNA, HFPO-DA, Hazard Index)',
    shortLabel: '2026 proposed rescission',
    url: 'https://www.epa.gov/sdwa/proposed-pfas-rescission-rule',
    kind: 'epa-context',
  },
  hrw_lead_copper_sampling: {
    id: 'hrw_lead_copper_sampling',
    label: 'Highlands Ranch Water — Lead and Copper Sampling',
    shortLabel: 'HRW lead and copper',
    url: 'https://www.highlandsranchwater.org/lead-and-copper-sampling',
    kind: 'local-guidance',
  },
  hrw_2025_ccr: {
    id: 'hrw_2025_ccr',
    label: 'Highlands Ranch Water — 2025 Water Quality Report',
    shortLabel: 'HRW 2025 report',
    url: 'https://www.highlandsranchwater.org/files/40b4774a5/2025+Water+Quality+Report_q.pdf',
    kind: 'data',
  },
  hrw_2026_ccr: {
    id: 'hrw_2026_ccr',
    label: 'Highlands Ranch Water — 2026 Water Quality Report',
    shortLabel: 'HRW 2026 report',
    url: 'https://www.highlandsranchwater.org/files/afaad763a/2026WaterQualityReport-FINAL.pdf',
    kind: 'data',
  },
  epa_lcri: {
    id: 'epa_lcri',
    label: 'EPA — Lead and Copper Rule Improvements',
    shortLabel: 'EPA LCRI',
    url: 'https://www.epa.gov/ground-water-and-drinking-water/lead-and-copper-rule-improvements',
    kind: 'epa-context',
  },
  epa_lead_drinking_water: {
    id: 'epa_lead_drinking_water',
    label: 'EPA — Basic Information about Lead in Drinking Water',
    shortLabel: 'EPA: lead in drinking water',
    url: 'https://www.epa.gov/ground-water-and-drinking-water/basic-information-about-lead-drinking-water',
    kind: 'epa-context',
  },
  epa_arsenic_rule: {
    id: 'epa_arsenic_rule',
    label: 'EPA — Drinking Water Arsenic Rule History',
    shortLabel: 'EPA arsenic rule',
    url: 'https://www.epa.gov/dwreginfo/drinking-water-arsenic-rule-history',
    kind: 'epa-context',
  },
  epa_lithium_factsheet: {
    id: 'epa_lithium_factsheet',
    label: 'EPA — Technical Fact Sheet: Lithium in Drinking Water',
    shortLabel: 'EPA lithium fact sheet',
    url: 'https://www.epa.gov/system/files/documents/2023-11/ucmr5-technical-fact-sheet-lithium-in-drinking-water.pdf',
    kind: 'epa-context',
  },
  epa_ucmr5: {
    id: 'epa_ucmr5',
    label: 'EPA — Fifth Unregulated Contaminant Monitoring Rule (UCMR 5)',
    shortLabel: 'EPA UCMR 5',
    url: 'https://www.epa.gov/dwucmr/fifth-unregulated-contaminant-monitoring-rule',
    kind: 'epa-context',
  },
  epa_ucmr6: {
    id: 'epa_ucmr6',
    label: 'EPA — Proposed Sixth Unregulated Contaminant Monitoring Rule (UCMR 6)',
    shortLabel: 'EPA UCMR 6',
    url: 'https://www.epa.gov/dwucmr/proposed-sixth-unregulated-contaminant-monitoring-rule',
    kind: 'epa-context',
  },
} as const

export type SourceId = keyof typeof SOURCE_REGISTRY

export function getSource(id: SourceId): SourceEntry & { shortLabel: string } {
  return SOURCE_REGISTRY[id]
}

export const HRW_CONTACT = {
  labLabel: 'Call Highlands Ranch Water Quality Lab',
  phoneDisplay: '303-791-2185, ext. 3523',
  phoneHref: 'tel:+13037912185',
  emailLabel: 'Email Highlands Ranch Water',
  email: 'contactus@hrwater.org',
} as const
