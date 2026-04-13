import { useEffect, useRef } from 'react'
import WorkoutCard from './WorkoutCard'
import { ADAPTATION_WORKOUTS } from '../data'
import type { AdaptationId, AppState } from '../types'

const ORDER: AdaptationId[] = ['w1', 'w2', 'w3']

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

export default function AdaptationPanel({ state, setState }: Props) {
  const completedCount = ORDER.filter((id) => state.adaptation[id]).length
  const allDone = completedCount === ORDER.length
  const prevCompletedCount = useRef(completedCount)

  useEffect(() => {
    if (completedCount === ORDER.length && prevCompletedCount.current < ORDER.length) {
      setState((s) => ({ ...s, adaptationCollapsed: true }))
    }
    prevCompletedCount.current = completedCount
  }, [completedCount, setState])

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
      return { ...prev, adaptation: next }
    })
  }

  function onToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    const open = e.currentTarget.open
    if (open === !state.adaptationCollapsed) return
    setState((s) => ({ ...s, adaptationCollapsed: !open }))
  }

  function isEnabled(idx: number) {
    if (idx === 0) return true
    const prevId = ORDER[idx - 1]
    return Boolean(state.adaptation[prevId])
  }

  return (
    <details open={!state.adaptationCollapsed} onToggle={onToggle}>
      <summary>
        Adaptation Phase — Weeks 1–3{' '}
        <span className="progress-count">
          {completedCount}/{ORDER.length}
        </span>
      </summary>

      <div role="alert">
        <strong>Knee safety — read before starting:</strong> All intervals must be done <strong>seated</strong>.
        Warm up at normal cadence for at least 15 minutes before your first low-cadence interval.
        Stop immediately if you feel knee pain — do not push through. Don't go below 50 RPM unless you have months of established low-cadence work behind you.
        Never do low-cadence sessions on back-to-back days.
        If you have a history of patellofemoral pain, patellar tendinopathy, or any knee overuse injury, skip this training entirely.
        Also skip if you are coming off a rest period or injury, or if you already naturally grind at low cadences.
      </div>

      <div className="adaptation-grid">
        {ADAPTATION_WORKOUTS.map((workout, i) => {
          const id = ORDER[i]
          return (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              step={i + 1}
              disabled={!isEnabled(i)}
              completedAt={state.adaptation[id]}
              onComplete={() => markComplete(id)}
              onUndo={() => undo(id)}
            />
          )
        })}
      </div>

      {allDone && (
        <div className="readiness-checklist">
          <h3>Before starting ongoing training</h3>
          <p>
            All three sessions are done. Check in with yourself on each point below before moving on.
            These are reminders, not gates — the site won't enforce them.
          </p>
          <ul>
            <li>No knee pain during or after any session</li>
            <li>No lingering knee discomfort 24+ hours after any session</li>
            <li>Cadence targets felt achievable (not struggling to stay above target)</li>
            <li>RPE for the intervals was no higher than ~6/10</li>
          </ul>
          <p>
            If anything is off, repeat the week that gave you trouble. If knee pain is the issue,
            take a full week off low-cadence work and restart from W1.
          </p>
        </div>
      )}
    </details>
  )
}
