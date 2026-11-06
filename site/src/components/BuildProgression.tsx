import WorkoutChart from './WorkoutChart'
import { chartWorkoutFor, cadenceLabelFor } from './chart-data'
import { POWER_SCALE_TOP, ZONE_FILL } from './chart-model'
import {
  STEPS_BY_PHASE,
  isStepDone,
  phaseName,
  phaseWeek,
  stepTitle,
  weekRangeLabel,
  weekStatus,
  type BuildStep,
} from '../utils/build-steps'
import type { BuildWeek } from '../types'

// One plan (adaptation or build) at a glance: the step cards, and for the
// build a progression chart above them (one bar per week, height = %FTP of
// the high-torque intervals, read from the .zwo files). Chart and cards share
// one full-width grid with a column per step, so on wide screens each card
// sits under its own two weeks. The adaptation has no bar chart: both its
// workouts are at 80% FTP, so the bars said nothing the cards don't (Tom,
// 2026-11-06). Phones: chart on top, steps as a vertical list.

// Bar scale: the same top as WorkoutChart.
const FTP_LINE_PCT = (1 / POWER_SCALE_TOP) * 100

interface Props {
  phase: BuildWeek['phase']
  progress: number
  shownStep: number | null
  currentStep: number | null
  onSelect: (index: number) => void
  detailId: string
}

// Column count comes from the --steps variable set on the wrapper, shared
// with the card list so each card sits under its own two weeks. (The card
// list's lg: copy is written out in full: Tailwind only sees literal class
// names.)
const STEP_COLUMNS = 'grid-cols-[repeat(var(--steps),minmax(0,1fr))]'

function ProgressionChart({ steps, progress }: { steps: BuildStep[]; progress: number }) {
  return (
    <div aria-hidden="true">
      <div className="relative h-28 sm:h-32">
        {/* FTP reference line */}
        <div
          className="absolute inset-x-0 border-t border-dashed border-slate-600"
          style={{ bottom: `${FTP_LINE_PCT}%` }}
        >
          <span className="absolute -top-4 left-0 text-[10px] text-slate-500">FTP</span>
        </div>
        <div className={`absolute inset-0 grid gap-2 ${STEP_COLUMNS}`}>
          {steps.map((step) => {
            const { torque } = step
            const heightPct = torque ? (Math.min(torque.power, POWER_SCALE_TOP) / POWER_SCALE_TOP) * 100 : 0
            return (
              <div key={step.index} className="flex flex-col justify-end min-w-0">
                <div className="text-center text-[11px] font-mono text-slate-300 mb-0.5">
                  {step.torqueLabel ?? ''}
                </div>
                <div className="flex items-end justify-center gap-1.5" style={{ height: `${heightPct}%` }}>
                  {step.weeks.map((w) => {
                    const status = weekStatus(w, progress)
                    return (
                      <div
                        key={w.week}
                        className={`w-1/3 max-w-9 h-full rounded-t-sm ${
                          status === 'later' ? 'opacity-50' : ''
                        } ${status === 'current' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                        style={{ backgroundColor: torque ? ZONE_FILL[torque.zone] : undefined }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Week numbers and cadence under each pair of bars */}
      <div className={`grid gap-2 mt-1 border-t border-slate-700 pt-1 ${STEP_COLUMNS}`}>
        {steps.map((step) => (
          <div key={step.index} className="min-w-0 text-center">
            <div className="flex justify-center gap-1.5 text-[10px] font-mono text-slate-500">
              {step.weeks.map((w) => (
                <span
                  key={w.week}
                  className={`w-1/3 max-w-9 ${weekStatus(w, progress) === 'current' ? 'text-orange-300 font-semibold' : ''}`}
                >
                  {phaseWeek(w)}
                </span>
              ))}
            </div>
            <div className="text-[10px] sm:text-[11px] text-amber-500/90 truncate">
              {/* Phones: just the range, so it fits under its two bars. */}
              <span className="sm:hidden">{cadenceLabelFor(step.workout)?.replace(/\s*rpm$/, '')}</span>
              <span className="hidden sm:inline">{cadenceLabelFor(step.workout)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeekDots({ step, progress }: { step: BuildStep; progress: number }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {step.weeks.map((w) => {
        const status = weekStatus(w, progress)
        return (
          <span
            key={w.week}
            className={`inline-block w-2 h-2 rounded-full ${
              status === 'done'
                ? 'bg-green-500'
                : status === 'current'
                  ? 'bg-orange-500 ring-2 ring-orange-300/40'
                  : 'border border-slate-600'
            }`}
          />
        )
      })}
    </span>
  )
}

function stepStatusText(step: BuildStep, progress: number): string {
  if (isStepDone(step, progress)) return 'done'
  const statuses = step.weeks.map((w) => weekStatus(w, progress))
  if (statuses.includes('current')) {
    const n = statuses.indexOf('current') + 1
    return `current, session ${n} of ${step.weeks.length}`
  }
  return 'coming up'
}

// What the overview says about each plan. Sources: research/training-calendar.md
// ("One torque session a week") and the intro's footnote on the adaptation.
const INTRO: Record<BuildWeek['phase'], string> = {
  adaptation:
    'Four weeks, one torque session a week; all other rides at normal cadence. Controlled, below threshold: the power stays at 80% FTP and the cadence drops. The sessions combine three coaches\' advice for riders new to torque work (Wakefield, Henderson, Schep); the combination and the four-week arrangement are mine. Progress counts sessions done, not calendar weeks.',
  build:
    'Eight weeks after the adaptation, one torque session a week; all other rides at normal cadence. The order comes from the coaches (Schep, EVOQ, Henderson for sustained efforts, CTS); two weeks per workout is my arrangement. Bar height is the power of the high-torque intervals (%FTP, from the workout files); the cadence is under each pair. Progress counts sessions done, not calendar weeks.',
}

export default function BuildProgression({ phase, progress, shownStep, currentStep, onSelect, detailId }: Props) {
  const steps = STEPS_BY_PHASE[phase]
  const headingId = `${phase}-glance-heading`
  // Two steps (the adaptation) leave wide cards: keep text and chart side by
  // side instead of stacking a stretched chart under the text.
  const wide = steps.length <= 2
  return (
    <section aria-labelledby={headingId} className="mb-4">
      <h3 id={headingId} className="text-sm font-semibold text-slate-200 m-0 mb-1">
        The {phaseName(phase).toLowerCase()} at a glance
      </h3>
      <p className="m-0 mb-4 text-xs text-slate-500">
        {INTRO[phase]}
      </p>

      <div style={{ '--steps': steps.length } as React.CSSProperties}>
        {phase === 'build' && (
          <div className="mb-3">
            <ProgressionChart steps={steps} progress={progress} />
          </div>
        )}

        <ol
          className={`m-0 p-0 list-none grid grid-cols-1 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] gap-2 ${
            wide ? 'lg:[&_button]:flex-row lg:[&_button]:items-center lg:[&_button]:gap-3' : ''
          }`}
        >
          {steps.map((step) => {
            const chart = chartWorkoutFor(step.workout)
            const selected = shownStep === step.index
            const isCurrent = currentStep === step.index
            const status = stepStatusText(step, progress)
            return (
              <li key={step.index} className="min-w-0">
                <button
                  type="button"
                  onClick={() => onSelect(step.index)}
                  aria-pressed={selected}
                  aria-controls={detailId}
                  className="w-full h-full text-left rounded border px-3 py-2 cursor-pointer transition-colors flex lg:flex-col gap-3 lg:gap-1 items-center lg:items-stretch border-slate-800 bg-slate-950 hover:border-slate-600 aria-pressed:border-orange-600 aria-pressed:bg-slate-800 aria-pressed:hover:border-orange-600"
                >
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-mono ${isCurrent ? 'text-orange-300' : 'text-slate-500'}`}
                      >
                        {weekRangeLabel(step)}
                      </span>
                      <WeekDots step={step} progress={progress} />
                    </span>
                    <span className="text-sm font-semibold text-slate-100 truncate" title={step.workout.name}>
                      {stepTitle(step)}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {step.torqueLabel} FTP · {cadenceLabelFor(step.workout)}
                    </span>
                    <span className="sr-only"> ({status})</span>
                  </span>
                  {chart && (
                    <span
                      className={`block flex-shrink-0 w-24 sm:w-40 ${wide ? 'lg:w-80' : 'lg:w-full lg:mt-1'}`}
                      aria-hidden="true"
                    >
                      <WorkoutChart workout={{ ...chart, title: '' }} mode="minimal" width={680} showAxisLabels={false} />
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
