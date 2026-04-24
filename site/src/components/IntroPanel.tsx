import { Link } from 'react-router-dom'
import Panel from './Panel'
import { SOURCES } from '../data'
import type { AppState } from '../types'

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

export default function IntroPanel({ state, setState }: Props) {
  function onToggle(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, intro: { collapsed } } }))
  }

  return (
    <Panel
      title="Intro — what, why & who"
      teaser="Hebisz 2024: +8.7% VO2max at low cadence vs +4.6% at freely chosen cadence"
      collapsed={state.panels.intro.collapsed}
      onToggle={onToggle}
    >
      <p className="text-slate-300 mb-0">
        High-torque training is{' '}
        <strong className="text-slate-100">low cadence at high power</strong>. In an 8-week study,
        cyclists doing their high-intensity intervals at 50–70 RPM gained{' '}
        <strong className="text-green-400">+8.7% VO2max</strong> and{' '}
        <strong className="text-green-400">+8.1% max aerobic power</strong>, compared with +4.6% and
        +3.0% for the same intervals at freely chosen cadence above 80 RPM.
      </p>
      <p className="text-slate-500 text-sm mt-3 mb-0">
        I've tried structured training plans. I just don't follow them — a beautiful route always
        beats a TSS target. Then last summer in Andorra, some pros passed me on a climb grinding so
        slowly it looked wrong. Months later I watched{' '}
        <a
          href={SOURCES.roadman.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          a podcast
        </a>
        , understood what they were doing, and something clicked. One structured hour a week. That,
        I could commit to.
      </p>
      <p className="text-slate-500 text-sm mt-3 mb-0">
        For a recreational cyclist who rides for fun, not plans — but who can commit to one
        structured hour a week. It happens to be the most efficient hour you can spend on the bike.{' '}
        <a
          href="https://www.strava.com/athletes/8943272"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          Peek at my Strava to see what kind of cyclist I am.
        </a>
      </p>
      <div className="border-t border-slate-800 mt-4 pt-3 text-sm text-slate-500">
        <p className="mb-0">
          <strong className="text-slate-300">How this site is structured:</strong> start with the
          adaptation phase below to introduce your knees to the load, then use the collection
          weekly. 1–2 sessions per week, never back-to-back.
        </p>
        <p className="mt-3 mb-0">
          <a href={SOURCES.hebisz2024.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → Study (Hebisz &amp; Hebisz, PLOS ONE 2024)
          </a>
          {' · '}
          <a href={SOURCES.roadman.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            The Roadman Podcast on high-torque training
          </a>
          {' · '}
          <Link to="/science" className="text-blue-400 hover:text-blue-300">
            Full rationale and sources
          </Link>
        </p>
      </div>
    </Panel>
  )
}
