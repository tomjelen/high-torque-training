import { useState } from 'react'

export interface AnnotatedEntry {
  id: string
  name: string
  isHard: boolean
  dateLabel: string
  gap: number | null
}

const INITIAL_SHOW = 5

function formatGap(days: number): string {
  const val = days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`
  return `+${val}`
}

interface Props {
  entries: AnnotatedEntry[]
}

export default function TrackerLog({ entries }: Props) {
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? entries : entries.slice(0, INITIAL_SHOW)
  const hasMore = entries.length > INITIAL_SHOW

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 m-0">
        Recent entries
      </p>
      {entries.length === 0 ? (
        <p className="text-slate-600 text-xs italic m-0">No sessions logged yet.</p>
      ) : (
        <>
          <ul className="space-y-2 m-0 p-0 list-none">
            {visible.map(({ id, name, isHard, dateLabel, gap }) => (
              <li key={id} className="flex items-baseline gap-2 text-xs">
                <span
                  className={`flex-shrink-0 w-2 h-2 rounded-full mt-0.5 ${
                    isHard ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                />
                <span className="text-slate-500 flex-shrink-0 w-12">{dateLabel}</span>
                <span className="text-slate-300 truncate flex-1 min-w-0">{name}</span>
                {gap !== null && (
                  <span className="text-slate-600 flex-shrink-0 font-mono">{formatGap(gap)}</span>
                )}
              </li>
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
    </div>
  )
}
