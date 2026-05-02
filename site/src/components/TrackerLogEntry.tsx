import type { AnnotatedEntry } from './TrackerLog'

function formatGap(days: number): string {
  const val = days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`
  return `+${val}`
}

interface Props {
  entry: AnnotatedEntry
}

export default function TrackerLogEntry({ entry }: Props) {
  const { name, isHard, dateLabel, gap } = entry
  return (
    <li className="flex items-baseline gap-2 text-xs">
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
  )
}
