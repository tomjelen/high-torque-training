import { useMemo } from 'react'
import { workoutById } from '../data'
import { calcGap, formatGapTitle, isTooClose, todayLocalIso } from '../utils/tracker'
import TrackerCounter from './TrackerCounter'
import TrackerStrip from './TrackerStrip'
import TrackerLog from './TrackerLog'
import PrivacyPopover from './PrivacyPopover'
import type { AnnotatedEntry } from './TrackerLog'
import type { DayKind } from './TrackerStrip'
import type { AppState } from '../types'

interface Props {
  state: AppState
  onDeleteEntry: (id: string) => void
  onSetEntryDate: (id: string, isoDate: string) => void
}

// Unknown ids (retired ids still in an old browser's localStorage) fall back
// to the raw id so old log entries still render. They still count as rides.
function workoutName(workoutId: string): string {
  return workoutById(workoutId)?.name ?? workoutId
}

function dayOf(timestamp: string): string {
  return timestamp.slice(0, 10)
}

function formatDateLabel(isoTimestamp: string): string {
  const [y, m, d] = dayOf(isoTimestamp).split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function SessionTracker({ state, onDeleteEntry, onSetEntryDate }: Props) {
  // Newest first. Entries on the same date keep log order reversed: the log
  // is append-only, so a later index is a later click.
  const sortedLog = useMemo(
    () =>
      state.log
        .map((entry, idx) => ({ entry, idx }))
        .sort((a, b) => dayOf(b.entry.timestamp).localeCompare(dayOf(a.entry.timestamp)) || b.idx - a.idx)
        .map(({ entry }) => entry),
    [state.log],
  )

  const todayIso = todayLocalIso()

  // Any session counts, build or library.
  const daysSinceLast = useMemo(() => {
    const last = sortedLog[0]
    return last ? calcGap(last.timestamp, null, todayIso) : null
  }, [sortedLog, todayIso])

  // One colour for a session day; the warning colour when the day holds two
  // sessions or sits next to another session day (not on consecutive days).
  const dayMap = useMemo(() => {
    const days = [...new Set(sortedLog.map((e) => dayOf(e.timestamp)))]
    const map = new Map<string, DayKind>()
    for (const day of days) {
      const count = sortedLog.filter((e) => dayOf(e.timestamp) === day).length
      map.set(day, count > 1 ? 'too-close' : 'session')
    }
    for (let i = 1; i < days.length; i++) {
      if (isTooClose(calcGap(days[i], days[i - 1], todayIso))) {
        map.set(days[i], 'too-close')
        map.set(days[i - 1], 'too-close')
      }
    }
    return map
  }, [sortedLog, todayIso])

  const annotatedEntries = useMemo((): AnnotatedEntry[] => {
    return sortedLog.map((entry, i) => {
      const nextEntry = i === 0 ? null : sortedLog[i - 1]
      const gap = calcGap(entry.timestamp, nextEntry?.timestamp ?? null, todayIso)
      const isFirst = i === 0
      // The warning sits on the newer session of a too-close pair: that is the
      // one that came too soon. Its gap is measured back to the previous session.
      const olderEntry = sortedLog[i + 1]
      const gapToOlder = olderEntry ? calcGap(olderEntry.timestamp, entry.timestamp, todayIso) : null
      const tooClose = gapToOlder !== null && isTooClose(gapToOlder)
      return {
        id: entry.id,
        name: workoutName(entry.workoutId),
        tooClose,
        warning: tooClose ? formatGapTitle(gapToOlder, false) : null,
        dateLabel: formatDateLabel(entry.timestamp),
        isoDate: dayOf(entry.timestamp),
        gap,
        isFirst,
      }
    })
  }, [sortedLog, todayIso])

  // Same frame as the neighbouring panels (Panel.tsx), but always open. On
  // tablets the counter and the 30-day strip share a row with the log below;
  // on wide screens all three sit side by side.
  return (
    <div className="border border-slate-800 rounded bg-slate-900 mb-4">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-4">
        <h2 className="font-semibold text-slate-100 m-0 text-base">Session Tracker</h2>
        <PrivacyPopover />
      </div>
      <div className="px-4 sm:px-5 pb-5 pt-4 border-t border-slate-800 md:grid md:grid-cols-[200px_minmax(0,1fr)] md:gap-x-6 md:gap-y-5 md:items-start lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]">
        <TrackerCounter daysSince={daysSinceLast} />
        <TrackerStrip dayMap={dayMap} />
        <TrackerLog entries={annotatedEntries} onDeleteEntry={onDeleteEntry} onSetEntryDate={onSetEntryDate} />
      </div>
    </div>
  )
}
