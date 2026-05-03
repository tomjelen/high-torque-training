import { useState } from 'react'
import type { AnnotatedEntry } from './TrackerLog'
import { todayLocalIso } from '../utils/tracker'

function formatGap(days: number): string {
  if (days === 0) return 'today'
  return `+${days}d`
}

function formatGapTitle(days: number, isFirst: boolean): string {
  const d = `${days} day${days === 1 ? '' : 's'}`
  if (isFirst) return days === 0 ? 'Today!' : `${d} since this session`
  return `${d} between this and the following session`
}


interface Props {
  entry: AnnotatedEntry
  onDelete: (id: string) => void
  onSetDate: (id: string, isoDate: string) => void
}

type Mode = 'idle' | 'confirming-delete' | 'editing-date'

export default function TrackerLogEntry({ entry, onDelete, onSetDate }: Props) {
  const { id, name, isHard, dateLabel, isoDate, gap, isFirst } = entry
  const [mode, setMode] = useState<Mode>('idle')
  const [draftDate, setDraftDate] = useState(isoDate)

  function startEditing() {
    setDraftDate(isoDate)
    setMode('editing-date')
  }

  function saveDate() {
    if (!draftDate) return
    onSetDate(id, draftDate)
    setMode('idle')
  }

  return (
    <li className="group flex items-baseline gap-2 text-xs">
      <span
        className={`flex-shrink-0 w-2 h-2 rounded-full mt-0.5 ${
          isHard ? 'bg-orange-500' : 'bg-green-500'
        }`}
      />

      {mode === 'editing-date' ? (
        <>
          <label className="sr-only" htmlFor={`date-${id}`}>
            New date
          </label>
          <input
            id={`date-${id}`}
            type="date"
            value={draftDate}
            max={todayLocalIso()}
            onChange={(e) => setDraftDate(e.target.value)}
            className="w-32 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-200 font-mono"
          />
          <span className="text-slate-300 truncate flex-1 min-w-0">{name}</span>
          <button
            type="button"
            aria-label="Save date"
            onClick={saveDate}
            disabled={!draftDate}
            className="flex-shrink-0 text-green-400 enabled:hover:text-green-300 cursor-pointer disabled:text-slate-600 disabled:cursor-not-allowed"
          >
            save
          </button>
          <button
            type="button"
            aria-label="Cancel edit"
            onClick={() => setMode('idle')}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            cancel
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            aria-label={`Edit date for ${name}`}
            onClick={startEditing}
            className="text-slate-500 hover:text-slate-300 flex-shrink-0 w-12 text-left cursor-pointer"
          >
            {dateLabel}
          </button>
          <span className="text-slate-300 truncate flex-1 min-w-0">{name}</span>

          {mode === 'idle' && (
            <span
              title={formatGapTitle(gap, isFirst)}
              className="text-slate-600 flex-shrink-0 font-mono cursor-default"
            >
              {formatGap(gap)}
            </span>
          )}

          {mode === 'idle' && (
            <button
              type="button"
              aria-label="Delete entry"
              onClick={() => setMode('confirming-delete')}
              className="flex-shrink-0 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity cursor-pointer"
            >
              ✕
            </button>
          )}

          {mode === 'confirming-delete' && (
            <span className="flex-shrink-0 flex items-center gap-2">
              <button
                type="button"
                aria-label="Confirm delete"
                onClick={() => onDelete(id)}
                className="text-red-400 hover:text-red-300 cursor-pointer"
              >
                delete?
              </button>
              <button
                type="button"
                aria-label="Cancel delete"
                onClick={() => setMode('idle')}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                cancel
              </button>
            </span>
          )}
        </>
      )}
    </li>
  )
}
