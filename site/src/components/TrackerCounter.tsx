interface Props {
  daysSince: number | null
}

export default function TrackerCounter({ daysSince }: Props) {
  return (
    <div className="bg-slate-900 rounded-lg px-4 py-5 text-center mb-4">
      {daysSince === null ? (
        <p className="text-slate-500 text-sm m-0">No hard sessions logged yet</p>
      ) : (
        <div>
          <div className="text-4xl font-mono font-bold text-green-400 leading-none">
            {daysSince % 1 === 0 ? daysSince : daysSince.toFixed(1)}
          </div>
          <div className="text-slate-400 text-xs mt-2">days since last HARD session</div>
        </div>
      )}
    </div>
  )
}
