import AdaptationPanel from './components/AdaptationPanel'
import TiersPanel from './components/TiersPanel'
import DownloadBar from './components/DownloadBar'

function App() {
  return (
    <>
      <header className="container">
        <h1>High Torque Training</h1>
      </header>
      <main className="container">
        <AdaptationPanel />
        <TiersPanel />
        <DownloadBar />
      </main>
    </>
  )
}

export default App
