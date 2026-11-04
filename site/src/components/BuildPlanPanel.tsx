import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import Panel from './Panel'
import BuildWeekCard from './BuildWeekCard'
import BuildProgression from './BuildProgression'
import UsageGuidelines from './UsageGuidelines'
import ChartLegend from './ChartLegend'
import WorkoutChart from './WorkoutChart'
import { chartWorkoutFor } from './chart-data'
import { workoutById } from '../data'
import { BUILD_STEPS, stepIndexForProgress, weekRangeLabel } from '../utils/build-steps'
import {
  ADAPTATION_LENGTH,
  BUILD_LENGTH,
  currentWeek,
  logBuildSession,
  undoLastMoveOn,
  withProgress,
  resetAdaptation,
  resetBuild,
  isBuildDone,
} from '../utils/build-plan'
import { todayLocalIso } from '../utils/tracker'
import type { AppState, LogEntry } from '../types'

// TE 4×8 is the canonical "how to read" example: a clean 4-rep set whose
// high-torque marks read as four clearly separate regions. Title is blanked so
// the workout name doesn't distract from the chart explanation.
const HOW_TO_CHART = (() => {
  const example = workoutById('te-4x8')
  const chart = example ? chartWorkoutFor(example) : undefined
  return chart ? { ...chart, title: '' } : undefined
})()

interface Props {
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
  // The session tracker, shown under this week's card while the build runs.
  trackerSlot?: ReactNode
}

type ResetKind = 'adaptation' | 'build'

const RESET_LABEL: Record<ResetKind, string> = {
  adaptation: 'Restart adaptation (weeks 1–4)',
  build: 'Restart build (weeks 5–12)',
}

const RESET_CONFIRM_LABEL: Record<ResetKind, string> = {
  adaptation: 'Yes, restart adaptation',
  build: 'Yes, restart build',
}

// Same LogEntry shape as CollectionPanel.handleDidThis, so build sessions
// show up in the session tracker like any other logged session.
function logEntryFor(workoutId: string): LogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    workoutId,
    timestamp: todayLocalIso(),
  }
}

// Log the current week's session; optionally move on to the next week.
// Reads the week from prev so rapid clicks never log the wrong workout.
function logSession(prev: AppState, advance: boolean): AppState {
  const workoutId = currentWeek(prev.buildProgress)?.workoutIds[0]
  return workoutId ? logBuildSession(prev, logEntryFor(workoutId), advance) : prev
}

export default function BuildPlanPanel({ state, setState, trackerSlot }: Props) {
  const [confirming, setConfirming] = useState<ResetKind | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const restartRefs = useRef<Record<ResetKind, HTMLButtonElement | null>>({ adaptation: null, build: null })
  // Which restart button gets focus back once the confirm row closes; without
  // this, focus falls to <body> because the focused button unmounts.
  const returnFocusTo = useRef<ResetKind | null>(null)
  useEffect(() => {
    if (confirming) {
      cancelRef.current?.focus()
      return
    }
    const kind = returnFocusTo.current
    if (!kind) return
    returnFocusTo.current = null
    // Restarting the build disables its own button; fall back to the other.
    const own = restartRefs.current[kind]
    const target = own && !own.disabled ? own : restartRefs.current.adaptation
    target?.focus()
  }, [confirming])

  function closeConfirm(kind: ResetKind) {
    returnFocusTo.current = kind
    setConfirming(null)
  }
  const progress = state.buildProgress
  const done = isBuildDone(progress)
  const week = currentWeek(progress)
  const workout = week ? workoutById(week.workoutIds[0]) : undefined
  const currentStep = stepIndexForProgress(progress)

  // A step opened from the overview. null = follow the current week. Local,
  // not persisted, and reset whenever progress changes (move on, undo,
  // restart, and the load of saved state after the prerendered first paint),
  // so the panel always comes back to the week you're on.
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  useEffect(() => setSelectedStep(null), [progress])
  const shownStep = selectedStep ?? currentStep
  const shown = shownStep !== null && shownStep !== currentStep ? BUILD_STEPS[shownStep] : null
  const detailId = useId()

  function onToggle(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, build: { collapsed } } }))
  }

  function onToggleChartExplainer(collapsed: boolean) {
    setState((s) => ({ ...s, panels: { ...s.panels, chartExplainer: { collapsed } } }))
  }

  function confirmReset(kind: ResetKind) {
    setState((s) =>
      withProgress(s, kind === 'adaptation' ? resetAdaptation() : resetBuild(s.buildProgress)),
    )
    closeConfirm(kind)
  }

  const status = done || !week ? 'done ✓' : `week ${week.week} of ${BUILD_LENGTH}`

  return (
    <Panel
      heading={`12-week build · ${status}`}
      collapsed={state.panels.build.collapsed}
      onToggle={onToggle}
    >
      <div
        role="alert"
        className="border border-red-900/60 bg-red-950/30 text-red-200 rounded px-4 py-3 text-sm mb-4"
      >
        <strong className="text-red-100">⚠ Knee protection rules — applies to every session, always.</strong>
        {/* The research doc's "Knee rules", in its order. */}
        <ol className="mt-2 mb-0 pl-5 space-y-1 list-decimal">
          <li>
            <strong className="text-red-100">All low-cadence intervals are seated.</strong> Less joint compression (Henderson, machine transcript); standing lets body weight push the pedal down instead of your muscles (ours).
          </li>
          <li>
            <strong className="text-red-100">Warm up at normal cadence</strong> for about 15 minutes first. Every file does this (ours).
          </li>
          <li>
            <strong className="text-red-100">If your knees ache during an interval, stop the interval.</strong> Don't push through.
          </li>
          <li>
            <strong className="text-red-100">Knee pain after a session → repeat last week's session</strong> instead of moving on. If it keeps coming back, stop torque work and see a professional (ours).
          </li>
          <li>
            <strong className="text-red-100">Not below 50 rpm.</strong> No session in the library goes below 50 (ours).
          </li>
          <li>
            <strong className="text-red-100">Not on consecutive days</strong> (ours, anchored on CTS/Rutberg: beginner and intermediate riders separate muscle-tension workouts by at least a full day). See "After the build".
          </li>
        </ol>
      </div>

      <details
        open={!state.panels.chartExplainer.collapsed}
        onToggle={(e) => onToggleChartExplainer(!e.currentTarget.open)}
        className="border border-slate-800 rounded bg-slate-950 mb-4 group"
      >
        <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none select-none hover:bg-slate-800/30 text-sm">
          <span className="text-slate-300">
            <strong className="text-slate-200">What is the high-torque block?</strong>
          </span>
          <span className="text-slate-500 text-xs flex-shrink-0 group-open:rotate-180 transition-transform inline-block">▾</span>
        </summary>
        <div className="px-4 pb-4 pt-3 border-t border-slate-800">
          <p className="m-0 mb-3 text-sm text-slate-400">
            Each bar is one interval — height is effort, left to right is time. The amber hatched
            blocks mark where you drop to the low-cadence target: the high-torque work.
          </p>
          {HOW_TO_CHART && (
            <div className="mb-3">
              <WorkoutChart workout={HOW_TO_CHART} mode="full" width={680} showAxisLabels={false} />
            </div>
          )}
          <ChartLegend showZones />
        </div>
      </details>

      {done && (
        <p className="m-0 mb-4 border-l-4 border-green-700 pl-4 py-1 text-sm text-slate-300">
          <strong className="text-slate-100">Build done ✓</strong> All 12 weeks ridden.{' '}
          <a href="#after-build" className="text-blue-400 hover:text-blue-300">
            What's next: after the build ↓
          </a>
        </p>
      )}

      {/* Once the build is done it greys out (still readable and usable);
          the knee rules above stay at full strength, they apply to every
          library session too. */}
      <div className={done ? 'opacity-50 hover:opacity-100 focus-within:opacity-100 transition-opacity' : ''}>
      <BuildProgression
        progress={progress}
        shownStep={shownStep}
        currentStep={currentStep}
        onSelect={(i) => {
          setSelectedStep(i === currentStep ? null : i)
          // Phones: the details sit below all six steps, so bring them into
          // view; otherwise a tap looks like it did nothing.
          const el = document.getElementById(detailId)
          if (el && el.getBoundingClientRect().top > window.innerHeight * 0.6) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }}
        detailId={detailId}
      />

      <div id={detailId} className="mb-4 scroll-mt-20">
        {shown ? (
          <BuildWeekCard
            mode="preview"
            week={shown.weeks[0]}
            workout={shown.workout}
            weekLabel={weekRangeLabel(shown)}
            statusText={
              shown.weeks[shown.weeks.length - 1].week - 1 < progress
                ? `Done · ${weekRangeLabel(shown).toLowerCase()}`
                : `Coming up in ${weekRangeLabel(shown).toLowerCase()}`
            }
            onBack={() => setSelectedStep(null)}
            backLabel={done ? 'Close' : '← Back to this week'}
          />
        ) : done ? null : (
          week &&
          workout && (
            <BuildWeekCard
              mode="current"
              week={week}
              workout={workout}
              onMoveOn={() => setState((prev) => logSession(prev, true))}
              onRepeat={() => setState((prev) => logSession(prev, false))}
            />
          )
        )}
      </div>

      {!done && trackerSlot && <div className="mb-4">{trackerSlot}</div>}

      <div className="flex flex-col gap-3 text-sm">
        <div>
          <button
            type="button"
            onClick={() => setState(undoLastMoveOn)}
            disabled={progress <= 0}
            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed min-h-11 sm:min-h-0 px-3 sm:px-2 py-1 rounded font-mono cursor-pointer"
          >
            Undo last move-on
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['adaptation', 'build'] as const).map((kind) =>
            confirming === kind ? (
              <span
                key={kind}
                className="flex flex-wrap items-center gap-2 text-xs text-slate-300"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') closeConfirm(kind)
                }}
              >
                {/* Phones: the question on its own line, the two answers together below it. */}
                <span className="basis-full sm:basis-auto">{RESET_LABEL[kind]}?</span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => confirmReset(kind)}
                    aria-label={RESET_CONFIRM_LABEL[kind]}
                    className="whitespace-nowrap min-h-11 sm:min-h-0 bg-orange-600 hover:bg-orange-500 text-white px-3 sm:px-2 py-1 rounded cursor-pointer"
                  >
                    Yes, restart
                  </button>
                  <button
                    ref={cancelRef}
                    type="button"
                    onClick={() => closeConfirm(kind)}
                    className="min-h-11 sm:min-h-0 text-slate-400 hover:text-slate-200 border border-slate-700 px-3 sm:px-2 py-1 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </span>
              </span>
            ) : (
              <button
                key={kind}
                ref={(el) => {
                  restartRefs.current[kind] = el
                }}
                type="button"
                onClick={() => setConfirming(kind)}
                disabled={kind === 'build' && progress <= ADAPTATION_LENGTH}
                className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed min-h-11 sm:min-h-0 px-3 sm:px-2 py-1 rounded cursor-pointer"
              >
                {RESET_LABEL[kind]}
              </button>
            ),
          )}
        </div>
        <p className="m-0 text-xs text-slate-500">
          After a long break, restart from adaptation or from week 5, as you see fit (ours).
        </p>
        <p className="m-0 text-xs text-slate-500">
          After a break (illness, travel): weeks 3–4 is a good session to come back with (a suggestion, ours).
        </p>
      </div>

      <div className="mt-4">
        <UsageGuidelines
          collapsed={state.panels.usageGuidelines.collapsed}
          onToggle={(collapsed) =>
            setState((s) => ({ ...s, panels: { ...s.panels, usageGuidelines: { collapsed } } }))
          }
        />
      </div>
      </div>
    </Panel>
  )
}
