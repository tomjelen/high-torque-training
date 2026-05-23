import Panel from './Panel'
import AdaptationCard from './AdaptationCard'
import ChartLegend from './ChartLegend'
import WorkoutChart from './WorkoutChart'
import { chartWorkoutFor } from './chart-data'
import { ADAPTATION_WORKOUTS, COLLECTION_WORKOUTS } from '../data'
import type { AdaptationId, AppState } from '../types'

// Staple 5×5 is the canonical "how to read" example: a clean 5-rep set whose
// high-torque marks read as five clearly separate regions. Title is blanked so
// the workout name ("Staple 5×5") doesn't appear — the user is looking at
// Adaptation workouts and the name means nothing to them here.
const HOW_TO_CHART = (() => {
  const staple = COLLECTION_WORKOUTS.find((w) => w.id === 't2-staple')
  const chart = staple ? chartWorkoutFor(staple) : undefined
  return chart ? { ...chart, title: '' } : undefined
})()

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
      panels: {
        ...s.panels,
        adaptation: { collapsed: true },
        usageGuidelines: { collapsed: false },
      },
    }))
  }

  function onToggle(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, adaptation: { collapsed } } }))
  }

  function onToggleChartExplainer(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, chartExplainer: { collapsed } } }))
  }

  const progressLabel = `${completedCount}/${ORDER.length}`
  const teaser =
    completedCount === ORDER.length
      ? `${progressLabel} complete · expand to review or redo`
      : `${progressLabel} complete`

  return (
    <Panel
      heading={
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

      <details
        open={!state.panels.chartExplainer.collapsed}
        onToggle={(e) => onToggleChartExplainer(!e.currentTarget.open)}
        className="border border-slate-800 rounded bg-slate-950 mb-4 group"
      >
        <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none select-none hover:bg-slate-800/30 text-sm">
          <span className="text-slate-300">
            <strong className="text-slate-200">What is the high-torque block?</strong>
          </span>
          <span className="text-slate-500 text-xs flex-shrink-0 group-open:rotate-180 transition-transform inline-block">▾</span>
        </summary>
        <div className="px-4 pb-4 pt-3 border-t border-slate-800">
          <p className="m-0 mb-3 text-sm text-slate-400">
            Each bar is one interval — height is effort, left to right is time. The amber hatched
            blocks mark where you drop to the low-cadence target: the high-torque work.
          </p>
          {HOW_TO_CHART && (
            <div className="mb-3">
              <WorkoutChart workout={HOW_TO_CHART} mode="full" width={680} showAxisLabels={false} />
            </div>
          )}
          <ChartLegend showZones />
        </div>
      </details>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
