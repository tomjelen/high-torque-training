const DAYS = 30

function getLast30Days(): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

interface Props {
  dayMap: Map<string, 'hard' | 'easy'>
}

export default function TrackerStrip({ dayMap }: Props) {
  const days = getLast30Days()

  return (
    <div className="mb-4">
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
                kind === 'hard'
                  ? 'bg-orange-500'
                  : kind === 'easy'
                    ? 'bg-green-600'
                    : 'bg-slate-800'
              }`}
              title={day}
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-orange-500" />
            hard (T3–T4)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-green-600" />
            easy (T1–T2)
          </span>
        </div>
        <span className="text-xs text-slate-600">today →</span>
      </div>
    </div>
  )
}
