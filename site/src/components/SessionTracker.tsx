import { useMemo, useState } from 'react'
import { TIERS } from '../data'
import type { AppState, LogEntry, Tier, Workout } from '../types'

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

interface WorkoutIndex {
  workout: Workout
  tier: Tier
}

function buildWorkoutIndex(): Map<string, WorkoutIndex> {
  const map = new Map<string, WorkoutIndex>()
  for (const tier of TIERS) {
    for (const workout of tier.workouts) {
      map.set(workout.id, { workout, tier })
    }
  }
  return map
}

function todayIso() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatRelative(dateStr: string): string {
  // dateStr is YYYY-MM-DD, parse as local date
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return dateStr
  const then = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((today.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
  return then.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function newId() {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function SessionTracker({ state, setState }: Props) {
  const workoutIndex = useMemo(buildWorkoutIndex, [])
  const [workoutId, setWorkoutId] = useState<string>(() => TIERS[0]?.workouts[0]?.id ?? '')
  const [date, setDate] = useState<string>(todayIso)
  const [notes, setNotes] = useState<string>('')

  const sortedEntries = useMemo(
    () =>
      [...state.log].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1
        return a.id < b.id ? 1 : -1
      }),
    [state.log],
  )

  function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (!workoutId || !date) return
    const entry: LogEntry = {
      id: newId(),
      workoutId,
      date,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    }
    setState((prev) => ({ ...prev, log: [...prev.log, entry] }))
    setNotes('')
    setDate(todayIso())
  }

  function handleDelete(id: string) {
    const entry = state.log.find((e) => e.id === id)
    const label = entry ? workoutIndex.get(entry.workoutId)?.workout.name ?? 'this entry' : 'this entry'
    if (!window.confirm(`Delete entry for ${label}?`)) return
    setState((prev) => ({ ...prev, log: prev.log.filter((e) => e.id !== id) }))
  }

  return (
    <section className="session-tracker">
      <h2>Session Tracker</h2>
      <p>Track your ongoing torque sessions. Entries persist in this browser.</p>

      <form className="tracker-form" onSubmit={handleTrack}>
        <div className="tracker-form-row">
          <label>
            Workout
            <select value={workoutId} onChange={(e) => setWorkoutId(e.target.value)}>
              {TIERS.map((tier) => (
                <optgroup key={tier.number} label={`T${tier.number} — ${tier.name}`}>
                  {tier.workouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={date}
              max={todayIso()}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
        <label>
          Notes <span className="tracker-optional">(optional)</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="RPE, how your knees felt, what to change next time…"
          />
        </label>
        <button type="submit">Track Session</button>
      </form>

      {sortedEntries.length === 0 ? (
        <p className="tracker-empty">No sessions tracked yet.</p>
      ) : (
        <ul className="tracker-entries">
          {sortedEntries.map((entry) => {
            const info = workoutIndex.get(entry.workoutId)
            return (
              <li key={entry.id} className="tracker-entry">
                <div className="tracker-entry-head">
                  <span className="tracker-entry-date">{formatRelative(entry.date)}</span>
                  {info && (
                    <span
                      className="tier-badge"
                      style={{ backgroundColor: info.tier.color }}
                    >
                      T{info.tier.number}
                    </span>
                  )}
                  <span className="tracker-entry-name">
                    {info?.workout.name ?? `Unknown workout (${entry.workoutId})`}
                  </span>
                  <button
                    type="button"
                    className="tracker-delete"
                    onClick={() => handleDelete(entry.id)}
                    aria-label="Delete entry"
                  >
                    ×
                  </button>
                </div>
                {entry.notes && <p className="tracker-entry-notes">{entry.notes}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
