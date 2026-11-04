import { useState } from 'react'
import type { AnnotatedEntry } from './TrackerLog'
import { todayLocalIso, formatGap, formatGapTitle } from '../utils/tracker'


interface Props {
  entry: AnnotatedEntry
  onDelete: (id: string) => void
  onSetDate: (id: string, isoDate: string) => void
}

type Mode = 'idle' | 'confirming-delete' | 'editing-date'

export default function TrackerLogEntry({ entry, onDelete, onSetDate }: Props) {
  const { id, name, tooClose, warning, dateLabel, isoDate, gap, isFirst } = entry
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
    <li className="group flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
      <span
        className={`flex-shrink-0 w-2 h-2 rounded-full mt-0.5 ${
          tooClose ? 'bg-amber-500' : 'bg-green-500'
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
          <span className="text-slate-300 break-words flex-1 min-w-0">{name}</span>
          <button
            type="button"
            aria-label="Save date"
            onClick={saveDate}
            disabled={!draftDate}
            className="flex-shrink-0 px-1 sm:px-0 min-h-11 sm:min-h-0 text-green-400 enabled:hover:text-green-300 cursor-pointer disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            save
          </button>
          <button
            type="button"
            aria-label="Cancel edit"
            onClick={() => setMode('idle')}
            className="flex-shrink-0 px-1 sm:px-0 min-h-11 sm:min-h-0 text-slate-400 hover:text-slate-200 cursor-pointer"
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
            className="text-slate-400 hover:text-slate-200 flex-shrink-0 w-12 min-h-11 sm:min-h-0 text-left cursor-pointer"
          >
            {dateLabel}
          </button>
          <span className="text-slate-300 break-words flex-1 min-w-0">{name}</span>

          {mode === 'idle' && (
            <span
              title={formatGapTitle(gap, isFirst)}
              className="flex-shrink-0 font-mono cursor-default text-slate-400"
            >
              {formatGap(gap, isFirst)}
            </span>
          )}

          {mode === 'idle' && (
            <button
              type="button"
              aria-label="Delete entry"
              onClick={() => setMode('confirming-delete')}
              className="flex-shrink-0 min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 text-slate-500 hover:text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity cursor-pointer"
            >
              ✕
            </button>
          )}

          {/* Visible text, not only the tooltip: tooltips don't show on touch screens. */}
          {mode === 'idle' && warning && (
            <p className="basis-full m-0 pl-4 text-amber-400">
              <span aria-hidden="true" className="font-mono">⚠ </span>
              {warning}
            </p>
          )}

          {mode === 'confirming-delete' && (
            <span className="flex-shrink-0 flex items-center gap-2">
              <button
                type="button"
                aria-label="Confirm delete"
                onClick={() => onDelete(id)}
                className="px-1 sm:px-0 min-h-11 sm:min-h-0 text-red-400 hover:text-red-300 cursor-pointer"
              >
                delete?
              </button>
              <button
                type="button"
                aria-label="Cancel delete"
                onClick={() => setMode('idle')}
                className="px-1 sm:px-0 min-h-11 sm:min-h-0 text-slate-400 hover:text-slate-200 cursor-pointer"
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
