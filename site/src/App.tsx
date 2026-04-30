import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import IntroPanel from './components/IntroPanel'
import DownloadInstallPanel from './components/DownloadInstallPanel'
import AdaptationPanel from './components/AdaptationPanel'
import CollectionPanel from './components/CollectionPanel'
import SciencePage from './components/SciencePage'
import Header from './components/Header'
import Footer from './components/Footer'
import { loadState, saveState } from './storage'
import type { AppState } from './types'

const HOME_LAST_UPDATED = '2026-04-23'
const SCIENCE_LAST_UPDATED = '2026-04-30'

function HomePage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
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

function ScienceRoute() {
  return (
    <main className="mx-auto max-w-[1440px] px-8 pb-4">
      <SciencePage />
      <Footer
        lastUpdated={SCIENCE_LAST_UPDATED}
        lastUpdatedTooltip="Date of the most recent substantive update to the research and rationale. Typo fixes and wording tweaks don't bump this date."
      />
    </main>
  )
}

function AppShell() {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage state={state} setState={setState} />} />
        <Route path="/science" element={<ScienceRoute />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
