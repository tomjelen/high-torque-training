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
      title="Intro — what & why"
      teaser="Hebisz 2024: +8.7% VO2max at low cadence vs +4.6% at freely chosen cadence"
      collapsed={state.panels.intro.collapsed}
      onToggle={onToggle}
    >
      <p className="text-slate-300 mb-3">
        High-torque training is{' '}
        <strong className="text-slate-100">low cadence at high power</strong>. In an 8-week study,
        cyclists doing their high-intensity intervals at 50–70 RPM gained{' '}
        <strong className="text-green-400">+8.7% VO2max</strong> and{' '}
        <strong className="text-green-400">+8.1% max aerobic power</strong>, compared with +4.6% and
        +3.0% for the same intervals at freely chosen cadence above 80 RPM.
      </p>
      <p className="text-slate-500 text-sm mb-4">
        →{' '}
        <a
          href={SOURCES.hebisz2024.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          Study (Hebisz &amp; Hebisz, PLOS ONE 2024)
        </a>
        {' · '}
        <a
          href={SOURCES.henderson.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          Podcast that inspired this
        </a>
      </p>
      <p className="text-slate-400 text-sm border-t border-slate-800 pt-3 mb-0">
        <strong className="text-slate-300">How this site is structured:</strong> start with the
        adaptation phase below to introduce your knees to the load, then use the collection weekly.
        1–2 sessions per week, never back-to-back.
      </p>
    </Panel>
  )
}
