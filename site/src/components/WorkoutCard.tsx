import Cite from './Cite'
import type { Workout } from '../types'

interface WorkoutCardProps {
  workout: Workout
  step?: number
}

export default function WorkoutCard({ workout, step }: WorkoutCardProps) {
  return (
    <article className="workout-card">
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
    </article>
  )
}
