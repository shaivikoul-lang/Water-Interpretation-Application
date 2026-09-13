import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { ContaminantCard } from '../ContaminantCard'
import { ChangedDetailNote } from './ChangedDetailNote'
import { HeroSnapshot } from '../HeroSnapshot'
import { LandingHeader } from '../landing/LandingHeader'
import { PfasDialog } from '../pfas/PfasDialog'
import { TrendPanel } from '../TrendPanel'
import { TrustFooter } from '../TrustFooter'
import {
  overlayOfficialChangedSeries,
  splitChangedAnalytes,
} from '../../lib/changedSeries'
import {
  heroSafetyStatus,
  measureSummaryCounts,
  overallStatus,
  watchAlertCopy,
} from '../../lib/derive'
import type { AnalytePack, EducationPayload, PwsPayload } from '../../types/water'

function ChangedCardGrid({
  analytes,
  selected,
  highlightName,
  onSelect,
  indexOffset = 0,
}: {
  analytes: AnalytePack[]
  selected: string | null
  highlightName: string | null
  onSelect: (name: string) => void
  indexOffset?: number
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {analytes.map((analyte, index) => (
        <ContaminantCard
          key={analyte.analyte_name}
          analyte={analyte}
          selected={selected === analyte.analyte_name}
          highlighted={highlightName === analyte.analyte_name}
          onSelect={() => onSelect(analyte.analyte_name)}
          index={indexOffset + index}
        />
      ))}
    </div>
  )
}

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

  const displayAnalytes = useMemo(
    () => overlayOfficialChangedSeries(water.analytes),
    [water.analytes],
  )
  const { comparable, newerProgram } = useMemo(
    () => splitChangedAnalytes(displayAnalytes),
    [displayAnalytes],
  )

  const selectedAnalyte = selected
    ? (displayAnalytes.find((a) => a.analyte_name === selected) ?? null)
    : null

  const tone = overallStatus(displayAnalytes)
  const safetyTone = heroSafetyStatus(displayAnalytes)
  const measureSummary = measureSummaryCounts(displayAnalytes)
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
          watchCopy={tone === 'watch' ? watchAlertCopy(displayAnalytes) : undefined}
          onViewAffected={openDetail}
        />

        {comparable.length > 0 ? (
          <div id="changed-results" className="changed-page__results">
            <h2 className="changed-page__heading">
              Results we can compare over many years
            </h2>
            <p className="changed-page__sub">
              These are yearly public-system results in the Colorado file, so you can
              see whether the number moved. Tap a measure for the full trend.
            </p>
            <ChangedCardGrid
              analytes={comparable}
              selected={selected}
              highlightName={highlightName}
              onSelect={openDetail}
            />
          </div>
        ) : null}

        {newerProgram.length > 0 ? (
          <div
            id={comparable.length > 0 ? 'changed-results-newer' : 'changed-results'}
            className={
              comparable.length > 0
                ? 'changed-page__results changed-page__results--follow'
                : 'changed-page__results'
            }
          >
            <h2 className="changed-page__heading">
              Newer tests, or a different kind of test
            </h2>
            <p className="changed-page__sub">
              These are official. They just are not a 2000–2025 plant chart. A short
              graph means the public series is short or the rule uses tap samples, not
              that the water was ignored. Tap a measure for the full trend.
            </p>
            <ChangedCardGrid
              analytes={newerProgram}
              selected={selected}
              highlightName={highlightName}
              onSelect={openDetail}
              indexOffset={comparable.length}
            />
          </div>
        ) : null}

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
