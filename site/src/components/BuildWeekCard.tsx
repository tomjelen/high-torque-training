import { useEffect, useId, useRef, useState } from 'react'
import Cite from './Cite'
import KneeRules from './KneeRules'
import WorkoutParams from './WorkoutParams'
import WorkoutChart from './WorkoutChart'
import { chartWorkoutFor, durationMinFor } from './chart-data'
import type { BuildWeek, Workout } from '../types'

type Props = {
  week: BuildWeek
  workout: Workout
  // Shown top right, e.g. "Build weeks 3–4".
  weekLabel: string
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
  | { mode: 'preview'; statusText: string; onBack: () => void; backLabel: string }
)

// One session of the 12-week build: what to ride and, for the current week,
// one Done button. Done asks the move-on checks in a dialog, which you may
// only be able to answer the day after; "Yes" moves on, "Not quite" (or not
// clicking) is the repeat. The build doesn't write to
// the session log.
export default function BuildWeekCard(props: Props) {
  const { week, workout, weekLabel } = props
  const chart = chartWorkoutFor(workout)
  const isCurrent = props.mode === 'current'
  // Done opens a confirmation that asks the move-on checks; only "Yes" moves on.
  const [asking, setAsking] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const doneRef = useRef<HTMLButtonElement>(null)
  const dialogHeadingId = useId()
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (asking && !dialog.open) dialog.showModal()
    if (!asking && dialog.open) dialog.close()
  }, [asking])

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
          <span className="flex-shrink-0 text-xs font-mono text-slate-400">{weekLabel}</span>
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
              <Cite sourceKey={workout.source} />
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
        {workout.source !== 'site' && workout.sourceNote && (
          <p className="m-0 mb-3 text-xs text-slate-500">{workout.sourceNote}</p>
        )}
      </div>

      <div className="border-t border-slate-700 pt-3 mt-auto lg:border-t-0 lg:pt-0 lg:mt-0 lg:border-l lg:pl-8 lg:flex lg:flex-col lg:justify-center">
        {props.mode === 'preview' ? (
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <p className="m-0 text-slate-300 font-semibold">{props.statusText}</p>
            <button
              type="button"
              onClick={props.onBack}
              className="w-full text-sm font-semibold border border-slate-600 hover:border-slate-400 text-slate-200 cursor-pointer rounded py-3 sm:py-1.5 transition-colors"
            >
              {props.backLabel}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            {/* Before you ride: the knee rules, right where you act. */}
            <KneeRules />
            {/* The calendar's move-on rule: the three checks gate the step
                change (after its second session); knee pain stops you after
                any session. Done asks them in a dialog. */}
            <p className="m-0 text-slate-300 font-semibold">
              {props.stepEnds
                ? 'Rode it? Done asks three checks: knees, cadence, and how you feel the next day.'
                : 'Rode it? Done asks one check: your knees, during and after.'}{' '}
              <span className="font-normal text-slate-400">You can click it the day after, once you know.</span>
            </p>
            <button
              ref={doneRef}
              type="button"
              onClick={() => setAsking(true)}
              className="w-full text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white cursor-pointer rounded py-3 sm:py-1.5 transition-colors"
            >
              Done ✓ <span className="font-normal">— {props.nextLabel}</span>
            </button>
            <dialog
              ref={dialogRef}
              aria-labelledby={dialogHeadingId}
              onClose={() => {
                setAsking(false)
                doneRef.current?.focus()
              }}
              className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded border border-slate-600 bg-slate-900 p-5 text-sm text-slate-300 backdrop:bg-slate-950/80"
            >
              <h3 id={dialogHeadingId} className="m-0 mb-3 text-base font-semibold text-slate-100">
                {props.stepEnds ? 'Before you move on — were all three fine?' : 'Were your knees fine, during and after?'}
              </h3>
              {props.stepEnds && (
                <ul className="m-0 mb-3 pl-5 space-y-1 list-disc">
                  <li>Knees fine, during and after</li>
                  <li>Cadence held</li>
                  <li>Not wrecked the next day</li>
                </ul>
              )}
              <p className="m-0 mb-4 text-slate-400">
                {props.stepEnds ? 'Any "no"' : 'Knee pain'} → ride this session again next week instead. Knee pain that
                keeps coming back → stop torque work and see a professional.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Close now, not after the re-render, so a double click
                    // can't move on twice.
                    if (!dialogRef.current?.open) return
                    dialogRef.current.close()
                    setAsking(false)
                    props.onDone()
                  }}
                  className="flex-1 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white cursor-pointer rounded px-3 py-3 sm:py-1.5 transition-colors"
                >
                  {props.stepEnds ? 'Yes, all fine — move on' : 'Yes, fine — mark it done'}
                </button>
                <button
                  type="button"
                  onClick={() => setAsking(false)}
                  className="flex-1 text-sm border border-slate-600 hover:border-slate-400 text-slate-200 cursor-pointer rounded px-3 py-3 sm:py-1.5 transition-colors"
                >
                  Not quite — ride it again next week
                </button>
              </div>
            </dialog>
            {week.phase === 'adaptation' && (
              <p className="m-0">Controlled: steady, below your threshold. Heavy legs are normal.</p>
            )}
            {props.onBackOneWeek && (
              <button
                type="button"
                onClick={props.onBackOneWeek}
                className="self-start min-h-11 sm:min-h-0 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 sm:px-2 py-1 rounded cursor-pointer"
              >
                ← Back one week <span className="text-slate-500">(clicked by mistake, or you feel wrecked the day after)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
