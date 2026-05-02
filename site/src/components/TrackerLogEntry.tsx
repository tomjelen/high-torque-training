import { useState } from 'react'
import type { AnnotatedEntry } from './TrackerLog'

function formatGap(days: number): string {
  const val = days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`
  return `+${val}`
}

interface Props {
  entry: AnnotatedEntry
  onDelete: (id: string) => void
}

type Mode = 'idle' | 'confirming-delete'

export default function TrackerLogEntry({ entry, onDelete }: Props) {
  const { id, name, isHard, dateLabel, gap } = entry
  const [mode, setMode] = useState<Mode>('idle')

  return (
    <li className="group flex items-baseline gap-2 text-xs">
      <span
        className={`flex-shrink-0 w-2 h-2 rounded-full mt-0.5 ${
          isHard ? 'bg-orange-500' : 'bg-green-500'
        }`}
      />
      <span className="text-slate-500 flex-shrink-0 w-12">{dateLabel}</span>
      <span className="text-slate-300 truncate flex-1 min-w-0">{name}</span>

      {mode === 'idle' && gap !== null && (
        <span className="text-slate-600 flex-shrink-0 font-mono">{formatGap(gap)}</span>
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
    </li>
  )
}
