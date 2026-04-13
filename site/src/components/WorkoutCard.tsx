import Cite from './Cite'
import type { Workout } from '../types'

interface WorkoutCardProps {
  workout: Workout
  step?: number
  disabled?: boolean
  completedAt?: string
  onComplete?: () => void
  onUndo?: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function WorkoutCard({
  workout,
  step,
  disabled,
  completedAt,
  onComplete,
  onUndo,
}: WorkoutCardProps) {
  const trackable = onComplete !== undefined || onUndo !== undefined
  return (
    <article
      className={`workout-card${disabled ? ' is-disabled' : ''}${completedAt ? ' is-completed' : ''}`}
      aria-disabled={disabled || undefined}
    >
      {step !== undefined && (
        <span className="step-badge">Week {step}</span>
      )}
      <h3>{workout.name}</h3>
      <dl>
        {workout.params.map(({ label, value }) => (
          <div key={label} className="param-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <footer>
        <small>
          Source: <Cite sourceKey={workout.source} note={workout.sourceNote} />
        </small>
        <a
          href={`/workouts/${workout.file}`}
          download
          role="button"
          className="outline"
        >
          Download .zwo
        </a>
      </footer>
      {trackable && (
        <div className="workout-track">
          {completedAt ? (
            <>
              <span className="completed-label">✓ Completed {formatDate(completedAt)}</span>
              {onUndo && (
                <button type="button" className="undo-button" onClick={onUndo}>
                  Undo
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              disabled={disabled}
            >
              Mark Complete
            </button>
          )}
        </div>
      )}
    </article>
  )
}
