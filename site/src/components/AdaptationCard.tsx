import Cite from './Cite'
import WorkoutParams from './WorkoutParams'
import type { Workout } from '../types'

type CardState = 'locked' | 'active' | 'complete'

interface Props {
  workout: Workout
  step: number
  cardState: CardState
  completedAt?: string
  onComplete: () => void
  onUndo: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const STATE_BADGE: Record<CardState, { label: string; className: string }> = {
  locked: { label: 'LOCKED', className: 'bg-slate-700 text-slate-400' },
  active: { label: 'ACTIVE', className: 'bg-orange-600 text-white' },
  complete: { label: '✓ DONE', className: 'bg-green-700 text-green-100' },
}

export default function AdaptationCard({ workout, step, cardState, completedAt, onComplete, onUndo }: Props) {
  const isLocked = cardState === 'locked'
  const isComplete = cardState === 'complete'
  const badge = STATE_BADGE[cardState]
  const cadence = workout.params.find((p) => p.label === 'Cadence')?.value
  const shortTitle = cadence ? `W${step} — ${cadence}` : `W${step}`

  return (
    <article
      className={`flex flex-col rounded border p-4 bg-slate-800 transition-opacity ${
        isComplete ? 'border-green-800' : 'border-slate-700'
      } ${isLocked ? 'opacity-40' : ''}`}
      aria-disabled={isLocked || undefined}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3
            className="text-sm font-semibold text-slate-100 truncate m-0"
            title={workout.name}
          >
            {shortTitle}
          </h3>
        </div>
        <span className={`flex-shrink-0 text-xs font-mono font-bold px-1.5 py-0.5 rounded ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <WorkoutParams params={workout.params} />

      {isComplete && completedAt && (
        <p className="text-xs text-green-400 mb-2 m-0">✓ Completed {formatDate(completedAt)}</p>
      )}

      <div className="border-t border-slate-700 pt-3 mt-auto">
        <div className="flex items-center justify-between gap-2 mb-2">
          <small className="text-slate-500 text-xs">
            Source: <Cite sourceKey={workout.source} note={workout.sourceNote} />
          </small>
          <a
            href={`/workouts/${workout.file}`}
            download
            className="text-xs text-slate-400 hover:text-slate-200 font-mono no-underline border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded"
          >
            ⤓ .zwo
          </a>
        </div>

        {isComplete ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-green-400 font-semibold">Completed ✓</span>
            <button
              type="button"
              onClick={onUndo}
              className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded font-mono cursor-pointer"
            >
              Undo
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            disabled={isLocked}
            className="w-full text-sm font-semibold bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 text-white cursor-pointer disabled:cursor-not-allowed rounded py-1.5 transition-colors"
          >
            Mark Complete
          </button>
        )}
      </div>
    </article>
  )
}
