import WorkoutChart from './WorkoutChart'
import { chartWorkoutFor, cadenceLabelFor } from './chart-data'
import { ZONE_FILL } from './chart-model'
import { BUILD_STEPS, stepTitle, torquePowerFor, torquePowerLabel, weekRangeLabel, type BuildStep } from '../utils/build-steps'

// The whole 12-week build at a glance: a progression chart (one bar per week,
// height = %FTP of the high-torque intervals, read from the .zwo files) with
// the six step cards underneath. Chart and cards share one 6-column grid, so
// on wide screens each card sits under its own two weeks. Phones: chart on
// top, steps as a vertical list.

// Bar scale: 130% FTP is the top of the chart, like WorkoutChart.
const SCALE_TOP = 1.3
const FTP_LINE_PCT = (1 / SCALE_TOP) * 100

type WeekStatus = 'done' | 'current' | 'later'

interface Props {
  progress: number
  shownStep: number | null
  currentStep: number | null
  onSelect: (index: number) => void
  detailId: string
}

function weekStatus(weekIndex: number, progress: number): WeekStatus {
  return weekIndex < progress ? 'done' : weekIndex === progress ? 'current' : 'later'
}

function PhaseLabels() {
  const adaptation = BUILD_STEPS.filter((s) => s.phase === 'adaptation').length
  const build = BUILD_STEPS.length - adaptation
  return (
    <div className="grid grid-cols-6 gap-2 mb-1 text-[11px] uppercase tracking-wide text-slate-500">
      <div style={{ gridColumn: `span ${adaptation}` }} className="border-b border-slate-700 pb-1">
        Adaptation<span className="hidden sm:inline"> · weeks 1–4</span>
      </div>
      <div style={{ gridColumn: `span ${build}` }} className="border-b border-slate-700 pb-1">
        Build<span className="hidden sm:inline"> · weeks 5–12</span>
      </div>
    </div>
  )
}

function ProgressionChart({ progress }: { progress: number }) {
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
        <div className="absolute inset-0 grid grid-cols-6 gap-2">
          {BUILD_STEPS.map((step) => {
            const torque = torquePowerFor(step.workout)
            const heightPct = torque ? (Math.min(torque.power, SCALE_TOP) / SCALE_TOP) * 100 : 0
            return (
              <div key={step.index} className="flex flex-col justify-end min-w-0">
                <div className="text-center text-[11px] font-mono text-slate-300 mb-0.5">
                  {torquePowerLabel(step.workout) ?? ''}
                </div>
                <div className="flex items-end justify-center gap-1.5" style={{ height: `${heightPct}%` }}>
                  {step.weeks.map((w) => {
                    const status = weekStatus(w.week - 1, progress)
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
      <div className="grid grid-cols-6 gap-2 mt-1 border-t border-slate-700 pt-1">
        {BUILD_STEPS.map((step) => (
          <div key={step.index} className="min-w-0 text-center">
            <div className="flex justify-center gap-1.5 text-[10px] font-mono text-slate-500">
              {step.weeks.map((w) => (
                <span
                  key={w.week}
                  className={`w-1/3 max-w-9 ${w.week - 1 === progress ? 'text-orange-300 font-semibold' : ''}`}
                >
                  {w.week}
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
        const status = weekStatus(w.week - 1, progress)
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
  const statuses = step.weeks.map((w) => weekStatus(w.week - 1, progress))
  if (statuses.every((s) => s === 'done')) return 'done'
  if (statuses.includes('current')) {
    const n = statuses.indexOf('current') + 1
    return `now · session ${n} of ${step.weeks.length}`
  }
  return 'later'
}

export default function BuildProgression({ progress, shownStep, currentStep, onSelect, detailId }: Props) {
  return (
    <section aria-labelledby="build-glance-heading" className="mb-4">
      <h3 id="build-glance-heading" className="text-sm font-semibold text-slate-200 m-0 mb-1">
        The 12 weeks at a glance
      </h3>
      <p className="m-0 mb-4 text-xs text-slate-500">
        One torque session a week; all other rides at normal cadence. Bar height is the power of the high-torque
        intervals (%FTP, from the workout files); the cadence is under each pair. Progress counts sessions done,
        not calendar weeks. The order comes from the coaches (Schep, EVOQ, Henderson for sustained efforts, CTS);
        two weeks per workout is my arrangement.
      </p>

      <PhaseLabels />
      <div className="mb-3">
        <ProgressionChart progress={progress} />
      </div>

      <ol className="m-0 p-0 list-none grid grid-cols-1 lg:grid-cols-6 gap-2">
        {BUILD_STEPS.map((step) => {
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
                    {torquePowerLabel(step.workout)} FTP · {cadenceLabelFor(step.workout)}
                  </span>
                  <span className="sr-only">, {status}</span>
                </span>
                {chart && (
                  <span className="block w-24 sm:w-40 lg:w-full flex-shrink-0 lg:mt-1" aria-hidden="true">
                    <WorkoutChart workout={{ ...chart, title: '' }} mode="minimal" width={680} showAxisLabels={false} />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
