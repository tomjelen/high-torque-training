import { useMemo } from 'react'
import { COLLECTION_WORKOUTS } from '../data'
import TrackerCounter from './TrackerCounter'
import TrackerStrip from './TrackerStrip'
import TrackerLog from './TrackerLog'
import PrivacyPopover from './PrivacyPopover'
import type { AnnotatedEntry } from './TrackerLog'
import type { AppState } from '../types'

interface Props {
  state: AppState
  onDeleteEntry: (id: string) => void
}

// Module-level: COLLECTION_WORKOUTS is a static constant, no need to recompute per mount
const WORKOUT_META = new Map<string, { tier: number; name: string }>(
  COLLECTION_WORKOUTS.map((w) => [w.id, { tier: w.tier ?? 0, name: w.name }]),
)

function isHardWorkout(workoutId: string): boolean {
  return (WORKOUT_META.get(workoutId)?.tier ?? 0) >= 3
}

function roundHalfDay(days: number): number {
  return Math.round(days * 2) / 2
}

function formatDateLabel(isoTimestamp: string): string {
  const [y, m, d] = isoTimestamp.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function SessionTracker({ state, onDeleteEntry }: Props) {
  const sortedLog = useMemo(
    () => [...state.log].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [state.log],
  )

  const daysSinceLastHard = useMemo(() => {
    const lastHard = sortedLog.find((e) => isHardWorkout(e.workoutId))
    if (!lastHard) return null
    const diffMs = Date.now() - new Date(lastHard.timestamp).getTime()
    return roundHalfDay(diffMs / (1000 * 60 * 60 * 24))
  }, [sortedLog])

  const dayMap = useMemo(() => {
    const map = new Map<string, 'hard' | 'easy'>()
    for (const entry of sortedLog) {
      const day = entry.timestamp.slice(0, 10)
      const hard = isHardWorkout(entry.workoutId)
      if (!map.has(day) || hard) map.set(day, hard ? 'hard' : 'easy')
    }
    return map
  }, [sortedLog])

  const annotatedEntries = useMemo((): AnnotatedEntry[] => {
    return sortedLog.map((entry, i) => {
      const prev = sortedLog[i + 1]
      const gap = prev
        ? roundHalfDay(
            (new Date(entry.timestamp).getTime() - new Date(prev.timestamp).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null
      return {
        id: entry.id,
        name: WORKOUT_META.get(entry.workoutId)?.name ?? entry.workoutId,
        isHard: isHardWorkout(entry.workoutId),
        dateLabel: formatDateLabel(entry.timestamp),
        gap,
      }
    })
  }, [sortedLog])

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider m-0">
          Session Tracker
        </h2>
        <PrivacyPopover />
      </div>
      <TrackerCounter daysSince={daysSinceLastHard} />
      <TrackerStrip dayMap={dayMap} />
      <TrackerLog entries={annotatedEntries} onDeleteEntry={onDeleteEntry} />
    </div>
  )
}
