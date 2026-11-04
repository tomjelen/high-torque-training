const DAYS = 30

export type DayKind = 'session' | 'too-close'

// Local calendar days, the same as todayLocalIso() and the stored log dates.
function getLast30Days(): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    days.push(
      [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'),
    )
  }
  return days
}

interface Props {
  dayMap: Map<string, DayKind>
}

export default function TrackerStrip({ dayMap }: Props) {
  const days = getLast30Days()

  return (
    <div className="mb-4 md:mb-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 m-0">
        Last 30 days
      </p>
      <div className="flex gap-px" style={{ height: '20px' }}>
        {days.map((day) => {
          const kind = dayMap.get(day)
          return (
            <div
              key={day}
              className={`flex-1 rounded-sm ${
                kind === 'too-close'
                  ? 'bg-amber-500'
                  : kind === 'session'
                    ? 'bg-green-600'
                    : 'bg-slate-800'
              }`}
              title={kind === 'too-close' ? `${day}: too close to another session` : day}
            />
          )
        })}
      </div>
      <div className="flex justify-between items-start gap-3 mt-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-green-600" />
            session
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-amber-500" />
            too close (same or next day)
          </span>
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">today →</span>
      </div>
    </div>
  )
}
