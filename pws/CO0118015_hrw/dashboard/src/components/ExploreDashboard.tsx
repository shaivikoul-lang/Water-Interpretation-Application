import { motion } from 'framer-motion'
import { LayoutGrid, LineChart as LineChartIcon } from 'lucide-react'
import type { MutableRefObject, RefObject } from 'react'
import { ContaminantCard } from './ContaminantCard'
import { EducationAside } from './EducationAside'
import { HeroSnapshot } from './HeroSnapshot'
import { TopicGuide } from './TopicGuide'
import { TrendPanel } from './TrendPanel'
import { TopicsHub, type TopicId } from './TopicsHub'
import { cn } from '../lib/cn'
import {
  heroSafetyStatus,
  measureSummaryCounts,
  overallStatus,
  watchAlertCopy,
} from '../lib/derive'
import type { AnalytePack, EducationPayload, PwsPayload } from '../types/water'

export type ExploreDashboardProps = {
  water: PwsPayload
  education: EducationPayload | null
  selected: string
  setSelected: (name: string) => void
  mobileTab: 'overview' | 'detail'
  setMobileTab: (tab: 'overview' | 'detail') => void
  activeTopic: TopicId | null
  guideTopic: Extract<TopicId, 'hard-water' | 'taste-odor'> | null
  setGuideTopic: (topic: Extract<TopicId, 'hard-water' | 'taste-odor'> | null) => void
  setActiveTopic: (topic: TopicId | null) => void
  highlightName: string | null
  setHighlightName: (name: string | null) => void
  topicNotice: string | null
  setTopicNotice: (notice: string | null) => void
  handleTopicSelect: (topic: TopicId) => void
  scrollToMeasure: (name: string) => void
  selectedAnalyte: AnalytePack
  dataSectionRef: RefObject<HTMLDivElement | null>
  guideRef: RefObject<HTMLDivElement | null>
  cardRefs: MutableRefObject<Record<string, HTMLButtonElement | null>>
}

export function ExploreDashboard({
  water,
  education,
  selected,
  setSelected,
  mobileTab,
  setMobileTab,
  activeTopic,
  guideTopic,
  setGuideTopic,
  setActiveTopic,
  highlightName,
  topicNotice,
  setTopicNotice,
  handleTopicSelect,
  scrollToMeasure,
  selectedAnalyte,
  dataSectionRef,
  guideRef,
  cardRefs,
}: ExploreDashboardProps) {
  const tone = overallStatus(water.analytes)
  const safetyTone = heroSafetyStatus(water.analytes)
  const measureSummary = measureSummaryCounts(water.analytes)

  const yearSpan =
    water.years_present?.length && water.years_present.length >= 2
      ? `${water.years_present[0]}–${water.years_present[water.years_present.length - 1]}`
      : water.years_present?.[0]?.toString() ?? '—'

  return (
    <>
      <HeroSnapshot
        utilityLabel={water.pws_label}
        yearSpan={yearSpan}
        tone={tone}
        safetyTone={safetyTone}
        summary={measureSummary}
        watchCopy={tone === 'watch' ? watchAlertCopy(water.analytes) : undefined}
        onViewAffected={scrollToMeasure}
      />

      <TopicsHub activeTopic={activeTopic} onSelectTopic={handleTopicSelect} />

      {guideTopic ? (
        <motion.div
          key={`guide-${guideTopic}`}
          ref={guideRef}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-8 scroll-mt-6"
        >
          <TopicGuide
            topic={guideTopic}
            onClose={() => {
              setGuideTopic(null)
              setActiveTopic(null)
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="data-mode"
          ref={dataSectionRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mt-8 space-y-8 scroll-mt-6"
        >
          <div className="flex gap-2 rounded-2xl bg-slate-200/60 p-1 dark:bg-slate-800/80 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab('overview')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition',
                mobileTab === 'overview'
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Overview
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('detail')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition',
                mobileTab === 'detail'
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400',
              )}
            >
              <LineChartIcon className="h-4 w-4" />
              Chart & learn
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(20rem,32%)] lg:items-start">
            <div className="min-w-0 space-y-8">
              <div
                className={cn(
                  mobileTab !== 'overview' && 'hidden',
                  'space-y-6 lg:block',
                )}
              >
                <div>
                  <h2 className="text-left text-lg font-semibold text-slate-900 dark:text-white">
                    Recent monitoring results
                  </h2>
                  <p className="mt-0.5 text-left text-sm text-slate-500 dark:text-slate-400">
                    Latest reported values across regulated contaminants.
                  </p>
                  {topicNotice && (
                    <motion.p
                      key={topicNotice}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-left text-sm font-medium text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200"
                      role="status"
                    >
                      {topicNotice}
                    </motion.p>
                  )}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {water.analytes.map((a, i) => (
                      <ContaminantCard
                        key={a.analyte_name}
                        ref={(el) => {
                          cardRefs.current[a.analyte_name] = el
                        }}
                        analyte={a}
                        selected={selected === a.analyte_name}
                        highlighted={highlightName === a.analyte_name}
                        onSelect={() => {
                          setSelected(a.analyte_name)
                          setMobileTab('detail')
                          setTopicNotice(null)
                        }}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  mobileTab !== 'detail' && 'hidden',
                  'space-y-6 lg:block',
                )}
              >
                <TrendPanel analyte={selectedAnalyte} />
                <div className="lg:hidden">
                  <EducationAside analyte={selectedAnalyte} education={education} />
                </div>
              </div>
            </div>

            <aside className="hidden lg:block lg:sticky lg:top-6 lg:self-start">
              <EducationAside analyte={selectedAnalyte} education={education} sticky={false} />
            </aside>
          </div>
        </motion.div>
      )}
    </>
  )
}
