import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Home, Moon, Sun, Table2 } from 'lucide-react'
import { ExploreDashboard } from './components/ExploreDashboard'
import { GuidedView } from './components/GuidedView'
import { TrustFooter } from './components/TrustFooter'
import { type TopicId } from './components/TopicsHub'
import {
  getConcernById,
  isGuidedConcern,
  parseConcernFromSearch,
  PFAS_PRIMARY_ANALYTE,
  TASTE_PRIMARY_ANALYTE,
  LEAD_PRIMARY_ANALYTE,
} from './lib/concerns'
import type { EducationPayload, PwsPayload } from './types/water'

function dataUrl(path: string) {
  const base = import.meta.env.BASE_URL
  const p = base.endsWith('/') ? base : `${base}/`
  return `${p}${path.replace(/^\//, '')}`
}

/** Classic PWS page; avoids `../index.html` from `.../dashboard/dist/` resolving to `dashboard/index.html` (redirect loop). */
function classicLayoutHref(): string {
  if (typeof window === 'undefined') return '../index.html'
  const { pathname, search, hash } = window.location
  const next = pathname.replace(/\/dashboard\/dist\/?(?:index\.html)?\/?$/i, '/index.html')
  return next !== pathname ? `${next}${search}${hash}` : `../index.html${search}${hash}`
}

export default function App() {
  const concernId = useMemo(
    () => parseConcernFromSearch(window.location.search),
    [],
  )
  const guidedConcern = isGuidedConcern(concernId) ? getConcernById(concernId!) : null

  const [water, setWater] = useState<PwsPayload | null>(null)
  const [education, setEducation] = useState<EducationPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [exploreMode, setExploreMode] = useState(!guidedConcern)
  const [selected, setSelected] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'overview' | 'detail'>('overview')
  const [activeTopic, setActiveTopic] = useState<TopicId | null>(null)
  const [guideTopic, setGuideTopic] = useState<
    Extract<TopicId, 'hard-water' | 'taste-odor'> | null
  >(null)
  const [highlightName, setHighlightName] = useState<string | null>(null)
  const [topicNotice, setTopicNotice] = useState<string | null>(null)
  const dataSectionRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const pendingScrollName = useRef<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    if (guideTopic) {
      guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [guideTopic])

  useEffect(() => {
    const name = pendingScrollName.current
    if (!guideTopic && name) {
      pendingScrollName.current = null
      const card = cardRefs.current[name]
      const cardVisible = !!card && card.offsetParent !== null
      const target = cardVisible ? card : dataSectionRef.current
      target?.scrollIntoView({
        behavior: 'smooth',
        block: cardVisible ? 'center' : 'start',
      })
    }
  }, [guideTopic, selected, mobileTab])

  useEffect(() => {
    if (!highlightName) return
    const timer = window.setTimeout(() => setHighlightName(null), 1800)
    return () => window.clearTimeout(timer)
  }, [highlightName])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [wRes, eRes] = await Promise.all([
          fetch(dataUrl('data/output.json')),
          fetch(dataUrl('data/education.json')),
        ])
        if (!wRes.ok) throw new Error('Could not load water data.')
        const w = (await wRes.json()) as PwsPayload
        if (cancelled) return
        setWater(w)
        if (w.analytes[0]) setSelected(w.analytes[0].analyte_name)
        if (eRes.ok) {
          setEducation((await eRes.json()) as EducationPayload)
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedAnalyte = useMemo(() => {
    if (!water || !selected) return null
    return water.analytes.find((a) => a.analyte_name === selected) ?? null
  }, [water, selected])

  const classicHref = useMemo(() => classicLayoutHref(), [])

  const scrollToMeasure = useCallback((name: string) => {
    setSelected(name)
    setMobileTab('overview')
    setHighlightName(name)
    pendingScrollName.current = name
  }, [])

  const handleTopicSelect = useCallback(
    (topic: TopicId) => {
      setActiveTopic(topic)

      if (topic === 'hard-water' || topic === 'taste-odor') {
        setGuideTopic(topic)
        setTopicNotice(null)
        setHighlightName(null)
        return
      }

      setGuideTopic(null)
      const analyte =
        topic === 'pfas'
          ? (water?.analytes.find((a) => a.analyte_name === 'PFOA') ??
            water?.analytes.find((a) => a.analyte_name.startsWith('PF')))
          : (water?.analytes.find((a) => a.analyte_name === 'Lead') ??
            water?.analytes.find((a) => a.analyte_name === 'Copper'))

      if (analyte) {
        setSelected(analyte.analyte_name)
        const isMobile = window.matchMedia('(max-width: 1023px)').matches
        setMobileTab(isMobile ? 'detail' : 'overview')
        setTopicNotice(
          topic === 'pfas'
            ? 'Showing PFAS-related measures'
            : 'Showing Lead & Copper-related measures',
        )
        setHighlightName(analyte.analyte_name)
        pendingScrollName.current = analyte.analyte_name
      }
    },
    [water?.analytes],
  )

  const handleExploreHandoff = useCallback(
    (clarifyId: string) => {
      const concern = guidedConcern?.id
      setExploreMode(true)
      setGuideTopic(null)

      if (concern === 'taste') {
        setSelected(TASTE_PRIMARY_ANALYTE)
        setActiveTopic('taste-odor')
        setTopicNotice('Showing taste & odor–related measures')
        setHighlightName(TASTE_PRIMARY_ANALYTE)
        pendingScrollName.current = TASTE_PRIMARY_ANALYTE
        setMobileTab('detail')
      } else if (concern === 'pfas') {
        setSelected(PFAS_PRIMARY_ANALYTE)
        setActiveTopic('pfas')
        setTopicNotice('Showing PFAS-related measures')
        setHighlightName(PFAS_PRIMARY_ANALYTE)
        pendingScrollName.current = PFAS_PRIMARY_ANALYTE
        setMobileTab('detail')
      } else if (concern === 'lead') {
        setSelected(LEAD_PRIMARY_ANALYTE)
        setActiveTopic('lead-copper')
        setTopicNotice('Showing Lead & Copper-related measures')
        setHighlightName(LEAD_PRIMARY_ANALYTE)
        pendingScrollName.current = LEAD_PRIMARY_ANALYTE
        setMobileTab('detail')
      } else if (concern === 'changes' && clarifyId === 'specific') {
        setSelected(PFAS_PRIMARY_ANALYTE)
        setActiveTopic('pfas')
        setTopicNotice('Showing PFAS-related measures')
        setHighlightName(PFAS_PRIMARY_ANALYTE)
        pendingScrollName.current = PFAS_PRIMARY_ANALYTE
        setMobileTab('detail')
      } else if (concern === 'changes' && clarifyId === 'taste-changes') {
        setSelected(TASTE_PRIMARY_ANALYTE)
        setActiveTopic('taste-odor')
        setTopicNotice('Showing taste & odor–related measures')
        setHighlightName(TASTE_PRIMARY_ANALYTE)
        pendingScrollName.current = TASTE_PRIMARY_ANALYTE
        setMobileTab('detail')
      } else {
        setTopicNotice(null)
        setHighlightName(null)
        setActiveTopic(null)
        setMobileTab('overview')
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [guidedConcern?.id],
  )

  const exploreTopBar = (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={classicHref}
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#005ea2] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004880] dark:bg-sky-600 dark:hover:bg-sky-500"
          title="Open the tables view (same as the classic layout)"
        >
          <Table2 className="h-4 w-4 shrink-0" aria-hidden />
          Classic view
        </a>
        <a
          href="../../../../index.html"
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#005ea2] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004880] dark:bg-sky-600 dark:hover:bg-sky-500"
          title="Back to the home page"
        >
          <Home className="h-4 w-4 shrink-0" aria-hidden />
          Home page
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="https://forms.gle/2s4VAYnTX4EzFsvy5"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Share feedback about this tool"
        >
          Share feedback
        </a>
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-svh font-sans text-[15px] leading-relaxed">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {exploreMode && exploreTopBar}
          <div className="flex min-h-[50vh] items-center justify-center p-6">
            <p className="max-w-md text-center text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!water) {
    return (
      <div className="min-h-svh font-sans text-[15px] leading-relaxed">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {exploreMode && exploreTopBar}
          <div className="flex min-h-[50vh] items-center justify-center p-6">
            <p className="animate-pulse text-slate-500">Loading snapshot…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!exploreMode && guidedConcern) {
    return (
      <>
        <GuidedView
          concern={guidedConcern}
          water={water}
          education={education}
          onExplore={handleExploreHandoff}
        />
        <div className="guided-canvas bg-[var(--canvas)]">
          <div className="mx-auto max-w-2xl px-5 pb-16 sm:px-8">
            <TrustFooter />
          </div>
        </div>
      </>
    )
  }

  if (!selectedAnalyte) {
    return (
      <div className="min-h-svh font-sans text-[15px] leading-relaxed">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {exploreTopBar}
          <div className="flex min-h-[50vh] items-center justify-center p-6">
            <p className="animate-pulse text-slate-500">Loading snapshot…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh font-sans text-[15px] leading-relaxed">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {exploreTopBar}

        <ExploreDashboard
          water={water}
          education={education}
          selected={selected!}
          setSelected={setSelected}
          mobileTab={mobileTab}
          setMobileTab={setMobileTab}
          activeTopic={activeTopic}
          guideTopic={guideTopic}
          setGuideTopic={setGuideTopic}
          setActiveTopic={setActiveTopic}
          highlightName={highlightName}
          setHighlightName={setHighlightName}
          topicNotice={topicNotice}
          setTopicNotice={setTopicNotice}
          handleTopicSelect={handleTopicSelect}
          scrollToMeasure={scrollToMeasure}
          selectedAnalyte={selectedAnalyte}
          dataSectionRef={dataSectionRef}
          guideRef={guideRef}
          cardRefs={cardRefs}
        />

        <TrustFooter />
      </div>
    </div>
  )
}
