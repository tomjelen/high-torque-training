import { useEffect, useState, type ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import IntroPanel from './components/IntroPanel'
import DownloadInstallPanel from './components/DownloadInstallPanel'
import AdaptationPanel from './components/AdaptationPanel'
import CollectionPanel from './components/CollectionPanel'
import RationalePage from './components/RationalePage'
import AboutPage from './components/AboutPage'
import Header from './components/Header'
import Footer from './components/Footer'
import { loadState, saveState, PRERENDER_STATE } from './storage'
import useIsomorphicLayoutEffect from './lib/useIsomorphicLayoutEffect'
import useGoatCounterPageviews from './lib/useGoatCounterPageviews'
import type { AppState } from './types'

export const HOME_LAST_UPDATED = '2026-06-14'
export const RATIONALE_LAST_UPDATED = '2026-04-30'
export const ABOUT_LAST_UPDATED = '2026-05-15'
export const ZWO_WORKOUTS_LAST_UPDATED = __ZWO_WORKOUTS_LAST_UPDATED__

export const HOME_TITLE = 'High Torque Training — Free Training Plan for Zwift'
export const RATIONALE_TITLE = 'High Torque Training — The Science and Rationale'
export const ABOUT_TITLE = 'High Torque Training — About Tom Jelen'

function PageShell({
  title,
  lastUpdated,
  lastUpdatedTooltip,
  children,
}: {
  title: string
  lastUpdated: string
  lastUpdatedTooltip: string
  children: ReactNode
}) {
  useEffect(() => { document.title = title }, [title])
  return (
    <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-4">
      {children}
      <Footer lastUpdated={lastUpdated} lastUpdatedTooltip={lastUpdatedTooltip} />
    </main>
  )
}

function HomePage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  return (
    <PageShell
      title={HOME_TITLE}
      lastUpdated={HOME_LAST_UPDATED}
      lastUpdatedTooltip="Date of the most recent change to the workout library."
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-6 mb-6">Free training plan for Zwift</h1>
      <IntroPanel state={state} setState={setState} />
      <DownloadInstallPanel state={state} setState={setState} />
      <AdaptationPanel state={state} setState={setState} />
      <CollectionPanel state={state} setState={setState} />
    </PageShell>
  )
}

function RationaleRoute() {
  return (
    <PageShell
      title={RATIONALE_TITLE}
      lastUpdated={RATIONALE_LAST_UPDATED}
      lastUpdatedTooltip="Date of the most recent substantive update to the research and rationale. Typo fixes and wording tweaks don't bump this date."
    >
      <RationalePage />
    </PageShell>
  )
}

function AboutRoute() {
  return (
    <PageShell
      title={ABOUT_TITLE}
      lastUpdated={ABOUT_LAST_UPDATED}
      lastUpdatedTooltip="Date of the most recent update to this page."
    >
      <AboutPage />
    </PageShell>
  )
}

function App() {
  const [state, setState] = useState<AppState>(PRERENDER_STATE)
  useGoatCounterPageviews()

  useIsomorphicLayoutEffect(() => {
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches
    setState(loadState(isMobile))
  }, [])

  useEffect(() => {
    // Skip the save during the brief window between mount and the layout
    // effect's setState — without this guard, PRERENDER_STATE would
    // momentarily overwrite the user's persisted state in localStorage.
    if (state === PRERENDER_STATE) return
    saveState(state)
  }, [state])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage state={state} setState={setState} />} />
        <Route path="/rationale" element={<RationaleRoute />} />
        <Route path="/about" element={<AboutRoute />} />
      </Routes>
    </div>
  )
}

export default App
