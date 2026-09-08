import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Home, Moon, Sun, Table2 } from 'lucide-react'
import { ExploreDashboard } from './components/ExploreDashboard'
import { GuidedView } from './components/GuidedView'
import { ChlorineSmellResult } from './components/guided/ChlorineSmellResult'
import { CloudyAppearanceResult } from './components/guided/CloudyAppearanceResult'
import { DiscolorationResult } from './components/guided/DiscolorationResult'
import { EarthyMustyResult } from './components/guided/EarthyMustyResult'
import { HardWaterScaleResult } from './components/guided/HardWaterScaleResult'
import { MetallicTasteResult } from './components/guided/MetallicTasteResult'
import { TdsReadingResult } from './components/guided/TdsReadingResult'
import { ArsenicResult } from './components/guided/ArsenicResult'
import { CopperResult } from './components/guided/CopperResult'
import { LeadResult } from './components/guided/LeadResult'
import { LithiumResult } from './components/guided/LithiumResult'
import { PfasEvidenceView } from './components/pfas/PfasEvidenceView'
import { PfasShowcaseResult, type PfasExploreMode } from './components/pfas/PfasShowcaseResult'
import { ContaminantPicker } from './components/guided/ContaminantPicker'
import { ObservationPicker } from './components/guided/ObservationPicker'
import { HasWaterChangedView } from './components/changed/HasWaterChangedView'
import { LandingPage } from './components/landing/LandingPage'
import { AboutPage } from './components/landing/AboutPage'
import type { ContaminantRoute } from './lib/contaminantChoices'
import { TrustFooter } from './components/TrustFooter'
import { type TopicId } from './components/TopicsHub'
import {
  getConcernById,
  isGuidedConcern,
  parseConcernFromSearch,
  PFAS_PRIMARY_ANALYTE,
  TASTE_PRIMARY_ANALYTE,
  LEAD_PRIMARY_ANALYTE,
  type ConcernDef,
  type ConcernId,
} from './lib/concerns'
import type { EducationPayload, PwsPayload } from './types/water'

/** Fixed for this single-system build, so the landing page renders before data loads. */
const UTILITY_LABEL = 'Highlands Ranch Water'
const PWS_ID = 'CO0118015'

type View = 'landing' | 'about' | 'observation' | 'contaminant' | 'guided' | 'explore' | 'tds-reading' | 'changed'

function parseExploreFromSearch(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  return params.get('explore') === '1'
}

function parseAboutFromSearch(search: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  return params.get('about') === '1'
}

function parseFlagFromSearch(search: string, key: string): boolean {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  return params.get(key) === '1'
}

function setPageSearch(search: string) {
  const url = new URL(window.location.href)
  url.search = search
  url.hash = ''
  window.history.pushState({}, '', `${url.pathname}${url.search}`)
}

function dataUrl(path: string) {
  const base = import.meta.env.BASE_URL
  const p = base.endsWith('/') ? base : `${base}/`
  return `${p}${path.replace(/^\//, '')}`
}

/** Classic PWS page; avoids `../index.html` from `.../dashboard/dist/` resolving to `dashboard/index.html` (redirect loop). */
function classicLayoutHref(): string {
  if (typeof window === 'undefined') return '../index.html'
  const { pathname } = window.location
  const next = pathname.replace(/\/dashboard\/dist\/?(?:index\.html)?\/?$/i, '/index.html')
  return next !== pathname ? next : '../index.html'
}

export default function App() {
  const concernId = useMemo(
    () => parseConcernFromSearch(window.location.search),
    [],
  )
  const exploreFromUrl = useMemo(
    () => parseExploreFromSearch(window.location.search),
    [],
  )
  const aboutFromUrl = useMemo(
    () => parseAboutFromSearch(window.location.search),
    [],
  )
  const tdsFromUrl = useMemo(
    () => parseFlagFromSearch(window.location.search, 'tds'),
    [],
  )
  const contaminantFromUrl = useMemo(
    () => parseFlagFromSearch(window.location.search, 'contaminant'),
    [],
  )
  const guidedConcernFromUrl = isGuidedConcern(concernId)
    ? (getConcernById(concernId!) ?? null)
    : null

  const [water, setWater] = useState<PwsPayload | null>(null)
  const [education, setEducation] = useState<EducationPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [activeConcern, setActiveConcern] = useState<ConcernDef | null>(
    guidedConcernFromUrl,
  )
  const [view, setView] = useState<View>(
    guidedConcernFromUrl
      ? guidedConcernFromUrl.id === 'taste'
        ? 'observation'
        : guidedConcernFromUrl.id === 'changes'
          ? 'changed'
          : 'guided'
      : exploreFromUrl
        ? 'explore'
        : tdsFromUrl
          ? 'tds-reading'
          : contaminantFromUrl
            ? 'contaminant'
            : aboutFromUrl
              ? 'about'
              : 'landing',
  )
  const [guidedClarify, setGuidedClarify] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'overview' | 'detail'>('overview')
  const [activeTopic, setActiveTopic] = useState<TopicId | null>(null)
  const [guideTopic, setGuideTopic] = useState<
    Extract<TopicId, 'hard-water' | 'taste-odor'> | null
  >(null)
  const [highlightName, setHighlightName] = useState<string | null>(null)
  const [topicNotice, setTopicNotice] = useState<string | null>(null)
  const [pfasExploreMode, setPfasExploreMode] = useState<PfasExploreMode>('results')
  const dataSectionRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const pendingScrollName = useRef<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    function onPopState() {
      if (parseAboutFromSearch(window.location.search)) setView('about')
      else if (parseExploreFromSearch(window.location.search)) setView('explore')
      else setView('landing')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

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

  const handleLandingGuided = useCallback((id: ConcernId) => {
    setActiveConcern(id === 'changes' ? null : (getConcernById(id) ?? null))
    setGuidedClarify(null)
    setView(id === 'taste' ? 'observation' : id === 'changes' ? 'changed' : 'guided')
    window.scrollTo({ top: 0 })
  }, [])

  const handleObservationClarify = useCallback((clarifyId: string) => {
    setGuidedClarify(clarifyId)
    setView('guided')
    window.scrollTo({ top: 0 })
  }, [])

  const handleBackHome = useCallback(() => {
    setPageSearch('')
    setView('landing')
    setActiveConcern(null)
    setGuidedClarify(null)
    window.scrollTo({ top: 0 })
  }, [])

  const handleAbout = useCallback(() => {
    setPageSearch('about=1')
    setView('about')
    window.scrollTo({ top: 0 })
  }, [])

  const handleLandingTdsReading = useCallback(() => {
    setView('tds-reading')
    window.scrollTo({ top: 0 })
  }, [])

  const handleLandingContaminant = useCallback(() => {
    setView('contaminant')
    window.scrollTo({ top: 0 })
  }, [])

  const handleContaminantSelect = useCallback((route: ContaminantRoute) => {
    if (route.kind === 'guided') {
      setActiveConcern(getConcernById(route.concernId) ?? null)
      setGuidedClarify(null)
      setView('guided')
      window.scrollTo({ top: 0 })
      return
    }
    setView('explore')
    setGuideTopic(null)
    if (route.kind === 'explore-analyte') {
      setSelected(route.analyteName)
      setActiveTopic(route.topic ?? null)
      setTopicNotice(`Showing ${route.analyteName}`)
      setHighlightName(route.analyteName)
      pendingScrollName.current = route.analyteName
      setMobileTab(window.matchMedia('(max-width: 1023px)').matches ? 'detail' : 'overview')
    } else {
      setActiveTopic(null)
      setTopicNotice(null)
      setHighlightName(null)
      setMobileTab('overview')
    }
    window.scrollTo({ top: 0 })
  }, [])

  const handleLandingExplore = useCallback(
    (topic?: TopicId) => {
      setView('explore')
      window.scrollTo({ top: 0 })
      if (topic) handleTopicSelect(topic)
    },
    [handleTopicSelect],
  )

  const handleExploreHandoff = useCallback(
    (clarifyId: string) => {
      const concern = activeConcern?.id
      setView('explore')
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
    [activeConcern?.id],
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

  if (view === 'observation') {
    return (
      <ObservationPicker
        utilityLabel={UTILITY_LABEL}
        pwsId={water?.pws_id_number ?? PWS_ID}
        onBack={handleBackHome}
        onClarify={handleObservationClarify}
      />
    )
  }

  if (view === 'contaminant') {
    return (
      <ContaminantPicker
        utilityLabel={UTILITY_LABEL}
        pwsId={water?.pws_id_number ?? PWS_ID}
        water={water}
        classicHref={classicHref}
        onBack={handleBackHome}
        onSelect={handleContaminantSelect}
      />
    )
  }

  if (view === 'tds-reading') {
    return (
      <TdsReadingResult
        utilityLabel={UTILITY_LABEL}
        pwsId={water?.pws_id_number ?? PWS_ID}
        onBack={handleBackHome}
        onExplore={handleLandingExplore}
      />
    )
  }

  if (view === 'changed' && water) {
    return (
      <HasWaterChangedView
        utilityLabel={UTILITY_LABEL}
        pwsId={water.pws_id_number ?? PWS_ID}
        water={water}
        education={education}
        onBack={handleBackHome}
      />
    )
  }

  if (view === 'landing') {
    return (
      <LandingPage
        utilityLabel={UTILITY_LABEL}
        pwsId={water?.pws_id_number ?? PWS_ID}
        onGuided={handleLandingGuided}
        onExplore={handleLandingExplore}
        onContaminant={handleLandingContaminant}
        onTdsReading={handleLandingTdsReading}
        onHome={handleBackHome}
        onAbout={handleAbout}
      />
    )
  }

  if (view === 'about') {
    return (
      <AboutPage
        utilityLabel={UTILITY_LABEL}
        onHome={handleBackHome}
        onAbout={handleAbout}
      />
    )
  }

  if (error) {
    return (
      <div className="min-h-svh font-sans text-[15px] leading-relaxed">
        <div className="mx-auto max-w-[90rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {view === 'explore' && exploreTopBar}
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
        <div className="mx-auto max-w-[90rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {view === 'explore' && exploreTopBar}
          <div className="flex min-h-[50vh] items-center justify-center p-6">
            <p className="animate-pulse text-slate-500">Loading snapshot…</p>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'guided' && activeConcern?.id === 'taste' && guidedClarify === 'metallic') {
    return (
      <MetallicTasteResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setGuidedClarify(null)
          setView('observation')
          window.scrollTo({ top: 0 })
        }}
        onExplore={handleLandingExplore}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'taste' && guidedClarify === 'chlorine') {
    return (
      <ChlorineSmellResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setGuidedClarify(null)
          setView('observation')
          window.scrollTo({ top: 0 })
        }}
        onExplore={handleLandingExplore}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'taste' && guidedClarify === 'cloudy') {
    return (
      <CloudyAppearanceResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setGuidedClarify(null)
          setView('observation')
          window.scrollTo({ top: 0 })
        }}
        onExplore={handleLandingExplore}
        onExploreAnalyte={(name) => {
          setView('explore')
          setSelected(name)
          setGuideTopic(null)
          setActiveTopic(null)
          setTopicNotice(`Showing ${name}`)
          setHighlightName(name)
          pendingScrollName.current = name
          setMobileTab(window.matchMedia('(max-width: 1023px)').matches ? 'detail' : 'overview')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'taste' && guidedClarify === 'musty') {
    return (
      <EarthyMustyResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setGuidedClarify(null)
          setView('observation')
          window.scrollTo({ top: 0 })
        }}
        onExplore={handleLandingExplore}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'taste' && guidedClarify === 'discoloration') {
    return (
      <DiscolorationResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setGuidedClarify(null)
          setView('observation')
          window.scrollTo({ top: 0 })
        }}
        onExplore={handleLandingExplore}
        onExploreAnalyte={(name) => {
          setView('explore')
          setSelected(name)
          setGuideTopic(null)
          setActiveTopic(null)
          setTopicNotice(`Showing ${name}`)
          setHighlightName(name)
          pendingScrollName.current = name
          setMobileTab(window.matchMedia('(max-width: 1023px)').matches ? 'detail' : 'overview')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'pfas' && water) {
    return (
      <PfasShowcaseResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setActiveConcern(null)
          setView('contaminant')
          window.scrollTo({ top: 0 })
        }}
        onExplore={(topic: TopicId, mode: PfasExploreMode) => {
          setPfasExploreMode(mode)
          handleLandingExplore(topic)
        }}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'lead' && water) {
    return (
      <LeadResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setActiveConcern(null)
          setView('contaminant')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'copper' && water) {
    return (
      <CopperResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setActiveConcern(null)
          setView('contaminant')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'lithium' && water) {
    return (
      <LithiumResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setActiveConcern(null)
          setView('contaminant')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'arsenic' && water) {
    return (
      <ArsenicResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setActiveConcern(null)
          setView('contaminant')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (view === 'guided' && activeConcern?.id === 'taste' && guidedClarify === 'scale') {
    return (
      <HardWaterScaleResult
        utilityLabel={UTILITY_LABEL}
        water={water}
        onBack={() => {
          setGuidedClarify(null)
          setView('observation')
          window.scrollTo({ top: 0 })
        }}
        onExplore={handleLandingExplore}
      />
    )
  }

  if (view === 'guided' && activeConcern) {
    return (
      <>
        <GuidedView
          concern={activeConcern}
          water={water}
          education={education}
          initialClarify={guidedClarify}
          onHome={handleBackHome}
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

  if (view === 'explore' && activeTopic === 'pfas' && water) {
    return (
      <PfasEvidenceView
        utilityLabel={UTILITY_LABEL}
        water={water}
        mode={pfasExploreMode}
        onBackToPfas={() => {
          setActiveConcern(getConcernById('pfas') ?? null)
          setView('guided')
          setActiveTopic(null)
          window.scrollTo({ top: 0 })
        }}
        onSwitchMode={(next) => {
          setPfasExploreMode(next)
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (!selectedAnalyte) {
    return (
      <div className="min-h-svh font-sans text-[15px] leading-relaxed">
        <div className="mx-auto max-w-[90rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
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
      <div className="mx-auto max-w-[90rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
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
