import Panel from './Panel'
import AdaptationCard from './AdaptationCard'
import { ADAPTATION_WORKOUTS } from '../data'
import type { AdaptationId, AppState } from '../types'

const ORDER: AdaptationId[] = ['w1', 'w2', 'w3']

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

export default function AdaptationPanel({ state, setState }: Props) {
  const completedCount = ORDER.filter((id) => state.adaptation[id]).length

  function markComplete(id: AdaptationId) {
    setState((prev) => ({
      ...prev,
      adaptation: { ...prev.adaptation, [id]: new Date().toISOString() },
    }))
  }

  function undo(id: AdaptationId) {
    setState((prev) => {
      const next = { ...prev.adaptation }
      delete next[id]
      return { ...prev, adaptation: next, adaptationCheckInConfirmed: false }
    })
  }

  function confirmCheckIn() {
    setState((s) => ({
      ...s,
      adaptationCheckInConfirmed: true,
      panels: { ...s.panels, adaptation: { collapsed: true } },
    }))
  }

  function onToggle(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, adaptation: { collapsed } } }))
  }

  const progressLabel = `${completedCount}/${ORDER.length}`
  const teaser =
    completedCount === ORDER.length
      ? `${progressLabel} complete · expand to review or redo`
      : `${progressLabel} complete`

  return (
    <Panel
      title={
        <span>
          Adaptation Phase{' '}
          <span className="text-sm font-normal text-slate-400 font-mono ml-1">
            Weeks 1–3 · {progressLabel}
          </span>
        </span>
      }
      teaser={teaser}
      collapsed={state.panels.adaptation.collapsed}
      onToggle={onToggle}
    >
      <div
        role="alert"
        className="border border-red-900/60 bg-red-950/30 text-red-200 rounded px-4 py-3 text-sm mb-4"
      >
        <strong className="text-red-100">⚠ Knee protection rules — applies to every session, always.</strong>
        <ol className="mt-2 mb-0 pl-5 space-y-1 list-decimal">
          <li>
            <strong className="text-red-100">Always warm up at normal cadence first</strong> (minimum 15 minutes). Don't start a low-cadence interval cold.
          </li>
          <li>
            <strong className="text-red-100">If your knees ache during a set, stop the set.</strong> Don't push through. End the session if it continues.
          </li>
          <li>
            <strong className="text-red-100">Don't go below 50 rpm</strong> unless you have months of established low-cadence work behind you.
          </li>
          <li>
            <strong className="text-red-100">Never do low-cadence sessions on back-to-back days.</strong> The joint needs recovery time.
          </li>
          <li>
            <strong className="text-red-100">All intervals are seated.</strong> Standing removes the training stimulus and changes the load pattern.
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {ADAPTATION_WORKOUTS.map((workout, i) => {
          const id = ORDER[i]
          const prevCompleted = i === 0 ? true : Boolean(state.adaptation[ORDER[i - 1]])
          const thisCompleted = Boolean(state.adaptation[id])
          const cardState = thisCompleted ? 'complete' : prevCompleted ? 'active' : 'locked'
          return (
            <AdaptationCard
              key={workout.id}
              workout={workout}
              step={i + 1}
              cardState={cardState}
              completedAt={state.adaptation[id]}
              onComplete={() => markComplete(id)}
              onUndo={() => undo(id)}
            />
          )
        })}
      </div>

      {completedCount === ORDER.length && !state.adaptationCheckInConfirmed && (
        <div className="mt-4 border-l-4 border-orange-600 pl-4 py-1">
          <h3 className="text-sm font-semibold text-slate-200 mt-0 mb-2">Before starting ongoing training</h3>
          <p className="text-slate-400 text-sm mb-2">
            All three sessions are done. Check in with yourself on each point below before moving on.
            These are reminders, not gates — the site won't enforce them.
          </p>
          <ul className="text-slate-400 text-sm space-y-1 pl-4 mb-2">
            <li>No knee pain during or after any session</li>
            <li>No lingering knee discomfort 24+ hours after any session</li>
            <li>Cadence targets felt achievable (not struggling to stay above target)</li>
            <li>RPE for the intervals was no higher than ~6/10</li>
          </ul>
          <p className="text-slate-400 text-sm mb-3">
            If anything is off, repeat the week that gave you trouble. If knee pain is the issue,
            take a full week off low-cadence work and restart from W1.
          </p>
          <button
            type="button"
            onClick={confirmCheckIn}
            className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded px-3 py-1.5 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      )}
    </Panel>
  )
}
