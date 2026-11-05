import Cite from './Cite'
import WorkoutParams from './WorkoutParams'
import WorkoutChart from './WorkoutChart'
import { chartWorkoutFor, durationMinFor } from './chart-data'
import { SOURCES } from '../data'
import type { SourceCategory, Workout } from '../types'

// Intensity groups as the research doc splits them: Torque Endurance and
// Threshold at or below threshold; TorqueMax, Rüegg, HIIT and SIT above it.
// SIT stays inside "above threshold" so the "mix" hint and the labels agree.
const KIND_LABELS: Record<Workout['kind'], string> = {
  moderate: 'At or below threshold',
  'above-threshold': 'Above threshold',
  maximal: 'Above threshold (maximal sprints)',
}

// The category describes the source, not the people: Rüegg is a rider whose
// session EF published, so it sits on the source line, not the people line.
// Plain words for a visitor; the trust categories themselves are explained
// on the rationale page.
const CATEGORY_LABELS: Record<SourceCategory, string> = {
  research: 'peer-reviewed study',
  'pro-team': 'pro team / elite coach',
  'coaching-business': 'coaching company',
  media: 'media',
}

interface Props {
  workout: Workout
  onDidThis: () => void
}

export default function CollectionCard({ workout, onDidThis }: Props) {
  const chart = chartWorkoutFor(workout)
  const category = SOURCES[workout.source]?.category

  return (
    <article className="relative flex flex-col rounded border border-slate-700 bg-slate-800 p-4">
      <h3
        className="text-sm font-semibold text-slate-100 truncate m-0 mb-1"
        title={workout.name}
      >
        {workout.name}
      </h3>
      <p className="text-xs text-slate-400 m-0 mb-3">{KIND_LABELS[workout.kind]}</p>

      <WorkoutParams params={workout.params} durationMin={durationMinFor(workout)} tss={workout.tss} />

      {/* Power profile with the high-torque (cadence) mark. Minimal mode: no
          title (the card header already shows it) and no axis labels (the
          card already states intensity + cadence). Rendered at a fixed design
          width and scaled to the card by CSS — keeps cluster geometry stable
          across card sizes. */}
      {chart && (
        <div className="mb-3">
          <WorkoutChart workout={chart} mode="minimal" width={680} showAxisLabels={false} />
        </div>
      )}

      <p className="text-xs text-slate-400 m-0 mb-1">{workout.people.join(', ')}</p>
      <p className="text-xs text-slate-400 m-0 mb-1">
        Source:
        <Cite sourceKey={workout.source} />
        {/* The separator stays with the citation; the line may break only after it. */}
        {category && (
          <>
            <span className="whitespace-nowrap">{'\u00a0·'}</span>{' '}
            <span className="whitespace-nowrap">{CATEGORY_LABELS[category]}</span>
          </>
        )}
      </p>
      {/* What's scaled, picked or estimated: visible, not a hover tooltip
          (invisible on phones). */}
      {workout.sourceNote && <p className="text-xs text-slate-500 m-0 mb-3">{workout.sourceNote}</p>}

      <div className="border-t border-slate-700 pt-3 flex items-center justify-end gap-2">
        <a
          href={`/workouts/${workout.file}`}
          download
          className="inline-flex items-center justify-center min-w-11 min-h-11 sm:min-w-8 sm:min-h-8 text-base text-slate-400 hover:text-slate-200 no-underline rounded"
          title="Download .zwo"
        >
          ⤓
        </a>
        <button
          type="button"
          onClick={onDidThis}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 min-h-11 px-4 sm:min-h-0 sm:px-2 sm:py-1 rounded cursor-pointer"
        >
          ✓ Rode it today
        </button>
      </div>
    </article>
  )
}
