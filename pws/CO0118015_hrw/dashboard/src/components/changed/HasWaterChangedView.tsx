import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { ContaminantCard } from '../ContaminantCard'
import { ChangedDetailNote } from './ChangedDetailNote'
import { HeroSnapshot } from '../HeroSnapshot'
import { LandingHeader } from '../landing/LandingHeader'
import { PfasDialog } from '../pfas/PfasDialog'
import { TrendPanel } from '../TrendPanel'
import { TrustFooter } from '../TrustFooter'
import {
  heroSafetyStatus,
  measureSummaryCounts,
  overallStatus,
  watchAlertCopy,
} from '../../lib/derive'
import type { EducationPayload, PwsPayload } from '../../types/water'

export function HasWaterChangedView({
  utilityLabel,
  water,
  education,
  onBack,
}: {
  utilityLabel: string
  pwsId: string
  water: PwsPayload
  education: EducationPayload | null
  onBack: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [highlightName, setHighlightName] = useState<string | null>(null)

  const selectedAnalyte = selected
    ? (water.analytes.find((a) => a.analyte_name === selected) ?? null)
    : null

  const tone = overallStatus(water.analytes)
  const safetyTone = heroSafetyStatus(water.analytes)
  const measureSummary = measureSummaryCounts(water.analytes)
  const yearSpan =
    water.years_present?.length && water.years_present.length >= 2
      ? `${water.years_present[0]}–${water.years_present[water.years_present.length - 1]}`
      : water.years_present?.[0]?.toString() ?? '—'

  const openDetail = useCallback((name: string) => {
    setSelected(name)
    setHighlightName(name)
    setDetailOpen(true)
  }, [])

  const closeDetail = useCallback(() => {
    setDetailOpen(false)
  }, [])

  useEffect(() => {
    if (!highlightName) return
    const timer = window.setTimeout(() => setHighlightName(null), 1800)
    return () => window.clearTimeout(timer)
  }, [highlightName])

  if (water.analytes.length === 0) {
    return (
      <div className="changed-page min-h-svh">
        <LandingHeader utilityLabel={utilityLabel} />
        <p className="px-4 py-16 text-center">No monitoring measures are available yet.</p>
      </div>
    )
  }

  return (
    <div className="changed-page min-h-svh">
      <a href="#changed-main" className="landing-skip-link">
        Skip to main content
      </a>
      <LandingHeader utilityLabel={utilityLabel} />

      <main id="changed-main" className="changed-page__main">
        <button type="button" className="obs-back" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to home
        </button>

        <HeroSnapshot
          className="changed-snapshot"
          headingLevel="h1"
          utilityLabel={utilityLabel}
          yearSpan={yearSpan}
          tone={tone}
          safetyTone={safetyTone}
          summary={measureSummary}
          watchCopy={tone === 'watch' ? watchAlertCopy(water.analytes) : undefined}
          onViewAffected={openDetail}
        />

        <div id="changed-results" className="changed-page__results">
          <h2 className="changed-page__heading">Recent monitoring results</h2>
          <p className="changed-page__sub">
            Latest reported values across regulated contaminants. Tap a measure for the
            full trend.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {water.analytes.map((analyte, index) => (
              <ContaminantCard
                key={analyte.analyte_name}
                analyte={analyte}
                selected={selected === analyte.analyte_name}
                highlighted={highlightName === analyte.analyte_name}
                onSelect={() => openDetail(analyte.analyte_name)}
                index={index}
              />
            ))}
          </div>
        </div>

        <TrustFooter />
      </main>

      {detailOpen && selectedAnalyte ? (
        <PfasDialog
          title={`${selectedAnalyte.analyte_name} over time`}
          onClose={closeDetail}
          size="wide"
        >
          <div className="changed-detail">
            <TrendPanel analyte={selectedAnalyte} compact chartHeightClass="h-72" />
            <ChangedDetailNote analyte={selectedAnalyte} education={education} />
          </div>
        </PfasDialog>
      ) : null}
    </div>
  )
}
