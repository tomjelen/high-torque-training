import { useState } from 'react'
import TrackerLogEntry from './TrackerLogEntry'

export interface AnnotatedEntry {
  id: string
  name: string
  isHard: boolean
  dateLabel: string
  isoDate: string // YYYY-MM-DD
  gap: number
  isFirst: boolean
}

const INITIAL_SHOW = 5

interface Props {
  entries: AnnotatedEntry[]
  onDeleteEntry: (id: string) => void
  onSetEntryDate: (id: string, isoDate: string) => void
}

export default function TrackerLog({ entries, onDeleteEntry, onSetEntryDate }: Props) {
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? entries : entries.slice(0, INITIAL_SHOW)
  const hasMore = entries.length > INITIAL_SHOW

  return (
    <section aria-label="Session tracker log">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 m-0">
        Recent entries
      </p>
      {entries.length === 0 ? (
        <p className="text-slate-600 text-xs italic m-0">No sessions logged yet.</p>
      ) : (
        <>
          <ul className="space-y-2 m-0 p-0 list-none">
            {visible.map((entry) => (
              <TrackerLogEntry
                key={entry.id}
                entry={entry}
                onDelete={onDeleteEntry}
                onSetDate={onSetEntryDate}
              />
            ))}
          </ul>
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showAll ? '↑ show fewer' : `view full log → (${entries.length})`}
            </button>
          )}
        </>
      )}
    </section>
  )
}
