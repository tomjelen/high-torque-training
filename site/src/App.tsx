import { useEffect, useState } from 'react'
import AdaptationPanel from './components/AdaptationPanel'
import TiersPanel from './components/TiersPanel'
import DownloadBar from './components/DownloadBar'
import SciencePage from './components/SciencePage'
import SessionTracker from './components/SessionTracker'
import { loadState, saveState } from './storage'
import type { AppState } from './types'

type Tab = 'training' | 'science'

function tabFromHash(): Tab {
  return window.location.hash === '#science' ? 'science' : 'training'
}

function App() {
  const [tab, setTab] = useState<Tab>(tabFromHash)
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function selectTab(next: Tab) {
    if (next === 'science') {
      window.location.hash = 'science'
    } else if (window.location.hash) {
      history.pushState('', '', window.location.pathname + window.location.search)
      setTab('training')
    }
  }

  return (
    <>
      <header className="container">
        <h1>High Torque Training</h1>
        <nav className="tabs">
          <button
            type="button"
            className={`tab-button${tab === 'training' ? ' active' : ''}`}
            onClick={() => selectTab('training')}
          >
            Workouts
          </button>
          <button
            type="button"
            className={`tab-button${tab === 'science' ? ' active' : ''}`}
            onClick={() => selectTab('science')}
          >
            Science &amp; Rationale
          </button>
        </nav>
      </header>
      <main className="container">
        {tab === 'training' ? (
          <>
            <AdaptationPanel state={state} setState={setState} />
            <TiersPanel />
            <SessionTracker state={state} setState={setState} />
            <DownloadBar />
          </>
        ) : (
          <SciencePage />
        )}
      </main>
    </>
  )
}

export default App
