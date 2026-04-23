import TierBadge from './TierBadge'
import Cite from './Cite'
import WorkoutParams from './WorkoutParams'
import type { Workout } from '../types'

interface Props {
  workout: Workout
  onDidThis: () => void
}

export default function CollectionCard({ workout, onDidThis }: Props) {
  const tier = workout.tier!

  return (
    <article className="relative flex flex-col rounded border border-slate-700 bg-slate-800 p-4">
      <TierBadge tier={tier} className="absolute top-3 right-3" />

      <h3
        className="text-sm font-semibold text-slate-100 truncate m-0 mb-3 pr-10"
        title={workout.name}
      >
        {workout.name}
      </h3>

      <WorkoutParams params={workout.params} tss={workout.tss} />

      <div className="border-t border-slate-700 pt-3 flex items-center justify-between gap-2">
        <small className="text-slate-500 text-xs">
          <Cite sourceKey={workout.source} note={workout.sourceNote} />
        </small>
        <div className="flex items-center gap-2">
          <a
            href={`/workouts/${workout.file}`}
            download
            className="text-xs text-slate-500 hover:text-slate-300 no-underline"
            title="Download .zwo"
          >
            ⤓
          </a>
          <button
            type="button"
            onClick={onDidThis}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded"
          >
            ✓ today
          </button>
        </div>
      </div>
    </article>
  )
}
