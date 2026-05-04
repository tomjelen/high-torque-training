import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import IntroPanel from './components/IntroPanel'
import DownloadInstallPanel from './components/DownloadInstallPanel'
import AdaptationPanel from './components/AdaptationPanel'
import CollectionPanel from './components/CollectionPanel'
import RationalePage from './components/RationalePage'
import Header from './components/Header'
import Footer from './components/Footer'
import { loadState, saveState, PRERENDER_STATE } from './storage'
import useIsomorphicLayoutEffect from './lib/useIsomorphicLayoutEffect'
import type { AppState } from './types'

export const HOME_LAST_UPDATED = '2026-05-02'
export const RATIONALE_LAST_UPDATED = '2026-04-30'

function HomePage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  useEffect(() => { document.title = 'High Torque Training' }, [])
  return (
    <main className="mx-auto max-w-[1440px] px-8 pb-4">
      <IntroPanel state={state} setState={setState} />
      <DownloadInstallPanel state={state} setState={setState} />
      <AdaptationPanel state={state} setState={setState} />
      <CollectionPanel state={state} setState={setState} />
      <Footer
        lastUpdated={HOME_LAST_UPDATED}
        lastUpdatedTooltip="Date of the most recent change to the workout library."
      />
    </main>
  )
}

function RationaleRoute() {
  useEffect(() => { document.title = 'Rationale — High Torque Training' }, [])
  return (
    <main className="mx-auto max-w-[1440px] px-8 pb-4">
      <RationalePage />
      <Footer
        lastUpdated={RATIONALE_LAST_UPDATED}
        lastUpdatedTooltip="Date of the most recent substantive update to the research and rationale. Typo fixes and wording tweaks don't bump this date."
      />
    </main>
  )
}

function App() {
  const [state, setState] = useState<AppState>(PRERENDER_STATE)

  useIsomorphicLayoutEffect(() => {
    setState(loadState())
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
      </Routes>
    </div>
  )
}

export default App
