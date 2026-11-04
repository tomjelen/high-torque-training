interface Props {
  daysSince: number | null
}

export default function TrackerCounter({ daysSince }: Props) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-5 text-center mb-4 md:mb-0">
      {daysSince === null ? (
        <p className="text-slate-500 text-sm m-0">No sessions logged yet</p>
      ) : (
        <div>
          <div className="text-4xl font-mono font-bold text-green-400 leading-none">
            {daysSince % 1 === 0 ? daysSince : daysSince.toFixed(1)}
          </div>
          <div className="text-slate-400 text-xs mt-2">
            {daysSince === 1 ? 'day' : 'days'} since last session
          </div>
        </div>
      )}
    </div>
  )
}
