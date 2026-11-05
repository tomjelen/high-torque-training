import Cite from './Cite'
import WorkoutParams from './WorkoutParams'
import WorkoutChart from './WorkoutChart'
import { chartWorkoutFor, durationMinFor } from './chart-data'
import type { BuildWeek, Workout } from '../types'

type Props = {
  week: BuildWeek
  workout: Workout
  // Shown top right instead of "Week N", e.g. "Weeks 7–8".
  weekLabel?: string
} & (
  | {
      mode: 'current'
      onDone: () => void
      // The rest of the button's sentence, e.g. "ride it once more next week".
      nextLabel: string
      // Done leads to a new workout (second session of a step, or the end):
      // the three move-on checks apply. Otherwise only the knee rule does.
      stepEnds: boolean
      // Step back a week (a mistaken click, or wrecked the day after).
      onBackOneWeek?: () => void
    }
  // Another step of the build, opened from the overview: what it is, but no
  // Done button (Done always marks the current week).
  | { mode: 'preview'; statusText: string; onBack?: () => void; backLabel?: string }
)

// One session of the 12-week build: what to ride and, for the current week,
// one Done button. Done means "the move-on checks passed", which you may only
// know the day after; not clicking is the repeat. The build doesn't write to
// the session log.
export default function BuildWeekCard(props: Props) {
  const { week, workout, weekLabel } = props
  const chart = chartWorkoutFor(workout)
  const isCurrent = props.mode === 'current'

  return (
    <section
      aria-label={isCurrent ? 'This week' : workout.name}
      className={`flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8 rounded border p-4 bg-slate-800 ${
        isCurrent ? 'border-orange-700/60' : 'border-slate-600'
      }`}
    >
      {/* Wide screens: what to ride on the left, how to record it on the
          right, so the params and chart don't stretch across the whole page. */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-100 m-0">{workout.name}</h3>
          <span className="flex-shrink-0 text-xs font-mono text-slate-400">{weekLabel ?? `Week ${week.week}`}</span>
        </div>

        <WorkoutParams params={workout.params} durationMin={durationMinFor(workout)} />

        {chart && (
          <div className="mb-3">
            <WorkoutChart workout={chart} mode="minimal" width={680} showAxisLabels={false} />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-3">
          <small className="text-slate-400 text-xs">
            Source:{' '}
            {workout.source === 'site' ? (
              <span title={workout.sourceNote}>my combination of advice from three coaches (Wakefield, Henderson, Schep)</span>
            ) : (
              <Cite sourceKey={workout.source} note={workout.sourceNote} />
            )}
          </small>
          <a
            href={`/workouts/${workout.file}`}
            download
            className="flex-shrink-0 inline-flex items-center min-h-11 sm:min-h-0 text-xs text-slate-400 hover:text-slate-200 font-mono no-underline border border-slate-700 hover:border-slate-500 px-3 sm:px-2 py-0.5 rounded"
          >
            ⤓ .zwo
          </a>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-3 mt-auto lg:border-t-0 lg:pt-0 lg:mt-0 lg:border-l lg:pl-8 lg:flex lg:flex-col lg:justify-center">
        {props.mode === 'preview' ? (
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <p className="m-0 text-slate-300 font-semibold">{props.statusText}</p>
            {props.onBack && (
              <button
                type="button"
                onClick={props.onBack}
                className="w-full text-sm font-semibold border border-slate-600 hover:border-slate-400 text-slate-200 cursor-pointer rounded py-3 sm:py-1.5 transition-colors"
              >
                {props.backLabel ?? '← Back to this week'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            {/* The calendar's move-on rule: the three checks gate the step
                change (after its second session); knee pain stops you after
                any session. */}
            {props.stepEnds ? (
              <div>
                <p className="m-0 mb-1 text-slate-300 font-semibold">
                  Before moving on to a new workout, click Done when all three were fine. You can click it the day after, once you know:
                </p>
                <ul className="m-0 pl-4 space-y-0.5 list-disc">
                  <li>knees fine, during and after</li>
                  <li>cadence held</li>
                  <li>not wrecked the next day</li>
                </ul>
              </div>
            ) : (
              <p className="m-0 text-slate-300 font-semibold">
                Click Done when your knees were fine, during and after. You can click it the day after, once you know.
              </p>
            )}
            <button
              type="button"
              onClick={props.onDone}
              className="w-full text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white cursor-pointer rounded py-3 sm:py-1.5 transition-colors"
            >
              Done ✓ <span className="font-normal">— {props.nextLabel}</span>
            </button>
            <p className="m-0">
              {props.stepEnds ? 'Not all three?' : 'Knee pain?'} Don't click: ride it again next week. Knee pain
              that keeps coming back → stop torque work and see a professional.
            </p>
            {week.phase === 'adaptation' && (
              <p className="m-0">Controlled: steady, below your threshold. Heavy legs are normal.</p>
            )}
            {props.onBackOneWeek && (
              <button
                type="button"
                onClick={props.onBackOneWeek}
                className="self-start min-h-11 sm:min-h-0 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 sm:px-2 py-1 rounded cursor-pointer"
              >
                ← Back one week <span className="text-slate-500">(clicked by mistake, or wrecked the day after)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
