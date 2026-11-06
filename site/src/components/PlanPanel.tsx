import { useEffect, useId, useRef, useState } from 'react'
import Panel from './Panel'
import BuildWeekCard from './BuildWeekCard'
import BuildProgression from './BuildProgression'
import KneeRules from './KneeRules'
import UsageGuidelines from './UsageGuidelines'
import ChartLegend from './ChartLegend'
import WorkoutChart from './WorkoutChart'
import { chartWorkoutFor } from './chart-data'
import { workoutById } from '../data'
import { confettiBurst } from '../lib/confetti'
import {
  BUILD_STEPS,
  FIRST_BUILD_STEP,
  isStepDone,
  nextLabel,
  phaseLength,
  phaseName,
  phaseStatus,
  phaseWeek,
  stepEndsAt,
  stepIndexForProgress,
  stepLabel,
  stepsForPhase,
  stepTitle,
} from '../utils/build-steps'
import {
  ADAPTATION_LENGTH,
  currentWeek,
  moveOn,
  undoMoveOn,
  resetAdaptation,
  resetBuild,
  isBuildDone,
} from '../utils/build-plan'
import type { AppState, BuildWeek } from '../types'

// TE 4×8 is the canonical "how to read" example: a clean 4-rep set whose
// high-torque marks read as four clearly separate regions. Title is blanked so
// the workout name doesn't distract from the chart explanation.
const HOW_TO_CHART = (() => {
  const example = workoutById('te-4x8')
  const chart = example ? chartWorkoutFor(example) : undefined
  return chart ? { ...chart, title: '' } : undefined
})()

type Phase = BuildWeek['phase']

interface Props {
  phase: Phase
  state: AppState
  setState: React.Dispatch<React.SetStateAction<AppState>>
}

// Element ids of the two panels, for the scroll from adaptation to build.
export const PLAN_PANEL_ID: Record<Phase, string> = { adaptation: 'plan-adaptation', build: 'plan-build' }

const RESET_LABEL: Record<Phase, string> = {
  adaptation: 'Restart adaptation',
  build: 'Restart build',
}

const RESET_CONFIRM_LABEL: Record<Phase, string> = {
  adaptation: 'Yes, restart adaptation',
  build: 'Yes, restart build',
}

// The green "Adaptation done ✓" / "Build done ✓" lines.
const DONE_NOTE = 'm-0 mb-4 border-l-4 border-green-700 pl-4 py-1 text-sm text-slate-300'

// One of the two plans, in its own panel: the 4-week adaptation or the 8-week
// build. Both read the one running `buildProgress` (0–12). The plan you're on
// holds this week's card, the knee rules, the chart explainer and the rules
// for the plan; once the build is done, the build panel keeps them.
export default function PlanPanel({ phase, state, setState }: Props) {
  const progress = state.buildProgress
  const status = phaseStatus(phase, progress)
  const steps = stepsForPhase(phase)
  const buildDone = isBuildDone(progress)
  const active = status === 'current' || (phase === 'build' && buildDone)
  const week = status === 'current' ? currentWeek(progress) : null
  const workout = week ? workoutById(week.workoutIds[0]) : undefined
  const currentStep = status === 'current' ? stepIndexForProgress(progress) : null

  // A step opened from the overview. null = follow the current week. Local,
  // not persisted, and reset whenever progress changes (move on, undo,
  // restart, and the load of saved state after the prerendered first paint),
  // so the panel always comes back to the week you're on.
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  useEffect(() => setSelectedStep(null), [progress])
  const shownStep = selectedStep ?? currentStep
  const shown = shownStep !== null && shownStep !== currentStep ? BUILD_STEPS[shownStep] : null
  const detailId = useId()
  const doneId = useId()

  const [confirming, setConfirming] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const restartRef = useRef<HTMLButtonElement>(null)
  // Give focus back to the restart button once the confirm row closes;
  // without this, focus falls to <body> because the focused button unmounts.
  const returnFocus = useRef(false)
  useEffect(() => {
    if (confirming) {
      cancelRef.current?.focus()
      return
    }
    if (!returnFocus.current) return
    returnFocus.current = false
    if (restartRef.current && !restartRef.current.disabled) restartRef.current.focus()
  }, [confirming])

  function closeConfirm() {
    returnFocus.current = true
    setConfirming(false)
  }

  function setPanels(panels: Partial<AppState['panels']>) {
    setState((s) => ({ ...s, panels: { ...s.panels, ...panels } }))
  }

  function scrollToPanel(target: Phase) {
    requestAnimationFrame(() =>
      document.getElementById(PLAN_PANEL_ID[target])?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  function backOneWeek() {
    setState((prev) => ({ ...prev, buildProgress: undoMoveOn(prev.buildProgress) }))
  }

  function onDone() {
    const next = moveOn(progress)
    setState((prev) => ({ ...prev, buildProgress: moveOn(prev.buildProgress) }))
    // Finishing the adaptation: close its panel, open the build and go there.
    if (next === ADAPTATION_LENGTH && phase === 'adaptation') {
      setPanels({ adaptation: { collapsed: true }, build: { collapsed: false } })
      scrollToPanel('build')
    }
    // Finishing week 12: confetti (Tom's request), and bring the "Build done"
    // line into view, since this card disappears.
    if (isBuildDone(next)) {
      confettiBurst()
      requestAnimationFrame(() =>
        document.getElementById(doneId)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      )
    }
  }

  function confirmReset() {
    if (phase === 'adaptation') {
      setState((s) => ({
        ...s,
        buildProgress: resetAdaptation(),
        panels: { ...s.panels, adaptation: { collapsed: false }, build: { collapsed: true } },
      }))
    } else {
      setState((s) => ({ ...s, buildProgress: resetBuild(s.buildProgress) }))
    }
    closeConfirm()
  }

  // "After the build" sits inside the library panel, which may be collapsed:
  // open it first, then scroll (a bare #after-build jump into a closed
  // <details> does nothing in some browsers).
  function goToAfterBuild(e: React.MouseEvent) {
    e.preventDefault()
    setPanels({ collection: { collapsed: false } })
    requestAnimationFrame(() =>
      document.getElementById('after-build')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  function goToBuild(e: React.MouseEvent) {
    e.preventDefault()
    setPanels({ build: { collapsed: false } })
    scrollToPanel('build')
  }

  const headingStatus =
    status === 'done'
      ? 'done ✓'
      : status === 'upcoming'
        ? `${phaseLength(phase)} weeks, after the adaptation`
        : week
          ? `week ${phaseWeek(week)} of ${phaseLength(phase)}`
          : ''
  // A finished plan's overview and card fade (back to full on hover/focus).
  // Two wrappers, because the knee box between them never fades.
  const fade = status === 'done' ? 'opacity-50 hover:opacity-100 focus-within:opacity-100 transition-opacity' : ''
  // Restart only means something once the plan has started.
  const canRestart = phase === 'adaptation' ? progress > 0 : progress > ADAPTATION_LENGTH

  return (
    <Panel
      id={PLAN_PANEL_ID[phase]}
      heading={`${phaseName(phase)} · ${headingStatus}`}
      collapsed={state.panels[phase].collapsed}
      onToggle={(collapsed) => setPanels(phase === 'adaptation' ? { adaptation: { collapsed } } : { build: { collapsed } })}
    >
      {phase === 'build' && buildDone && (
        <p id={doneId} className={DONE_NOTE}>
          <strong className="text-slate-100">Build done ✓</strong> Adaptation and build ridden.{' '}
          <a href="#after-build" onClick={goToAfterBuild} className="text-blue-400 hover:text-blue-300">
            What's next: after the build ↓
          </a>{' '}
          <button type="button" onClick={backOneWeek} className="ml-2 min-h-11 sm:min-h-0 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 sm:px-2 py-1 rounded cursor-pointer">
            ← Back one week
          </button>
        </p>
      )}

      {phase === 'adaptation' && status === 'done' && (
        <p className={DONE_NOTE}>
          <strong className="text-slate-100">Adaptation done ✓</strong> On to the build: 8 weeks, starting with{' '}
          {stepTitle(FIRST_BUILD_STEP)}.{' '}
          <a href={`#${PLAN_PANEL_ID.build}`} onClick={goToBuild} className="text-blue-400 hover:text-blue-300">
            Go to the build ↓
          </a>
        </p>
      )}

      {/* Order: the plan at a glance, then (in the plan you're on) the knee
          rules right above this week's card, where you act, then the card. */}
      <div className={fade}>
        <BuildProgression
          phase={phase}
          steps={steps}
          progress={progress}
          shownStep={shownStep}
          currentStep={currentStep}
          onSelect={(i) => {
            setSelectedStep(i === currentStep ? null : i)
            // Phones: the details sit below the step list, so bring them into
            // view; otherwise a tap looks like it did nothing.
            const el = document.getElementById(detailId)
            if (el && el.getBoundingClientRect().top > window.innerHeight * 0.6) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
          detailId={detailId}
        />
      </div>

      {active && <KneeRules />}

      {active && (
        <details
          open={!state.panels.chartExplainer.collapsed}
          onToggle={(e) => setPanels({ chartExplainer: { collapsed: !e.currentTarget.open } })}
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
      )}

      <div className={fade}>
        <div id={detailId} className="scroll-mt-20">
          {shown ? (
            <div className="mb-4">
              <BuildWeekCard
                mode="preview"
                week={shown.weeks[0]}
                workout={shown.workout}
                weekLabel={stepLabel(shown)}
                statusText={
                  isStepDone(shown, progress)
                    ? `Done · ${stepLabel(shown).toLowerCase()}`
                    : `Coming up in ${stepLabel(shown).toLowerCase()}`
                }
                onBack={() => setSelectedStep(null)}
                backLabel={currentStep === null ? 'Close' : '← Back to this week'}
              />
            </div>
          ) : (
            week &&
            workout && (
              <div className="mb-4">
                <BuildWeekCard
                  mode="current"
                  weekLabel={`${phaseName(week.phase)} week ${phaseWeek(week)}`}
                  week={week}
                  workout={workout}
                  onDone={onDone}
                  nextLabel={nextLabel(progress)}
                  stepEnds={stepEndsAt(progress)}
                  onBackOneWeek={progress > 0 ? backOneWeek : undefined}
                />
              </div>
            )
          )}
        </div>

        {(canRestart || active) && (
          <div className="flex flex-col gap-3 text-sm">
            {canRestart && (
              <div className="flex flex-wrap items-center gap-2">
                {confirming ? (
                  <span
                    className="flex flex-wrap items-center gap-2 text-xs text-slate-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') closeConfirm()
                    }}
                  >
                    {/* Phones: the question on its own line, the two answers together below it. */}
                    <span className="basis-full sm:basis-auto">{RESET_LABEL[phase]}?</span>
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={confirmReset}
                        aria-label={RESET_CONFIRM_LABEL[phase]}
                        className="whitespace-nowrap min-h-11 sm:min-h-0 bg-orange-600 hover:bg-orange-500 text-white px-3 sm:px-2 py-1 rounded cursor-pointer"
                      >
                        Yes, restart
                      </button>
                      <button ref={cancelRef} type="button" onClick={closeConfirm} className="min-h-11 sm:min-h-0 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 sm:px-2 py-1 rounded cursor-pointer">
                        Cancel
                      </button>
                    </span>
                  </span>
                ) : (
                  <button ref={restartRef} type="button" onClick={() => setConfirming(true)} className="min-h-11 sm:min-h-0 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 px-3 sm:px-2 py-1 rounded cursor-pointer">
                    {RESET_LABEL[phase]}
                  </button>
                )}
              </div>
            )}
            {active && (
              <>
                <p className="m-0 text-xs text-slate-500">
                  After a long break, restart the adaptation or the build, as you see fit.
                </p>
                <p className="m-0 text-xs text-slate-500">
                  After a break (illness, travel): the adaptation weeks 3–4 session is a good one to come back with (a
                  suggestion of mine).
                </p>
              </>
            )}
          </div>
        )}

        {active && (
          <div className="mt-4">
            <UsageGuidelines
              collapsed={state.panels.usageGuidelines.collapsed}
              onToggle={(collapsed) => setPanels({ usageGuidelines: { collapsed } })}
            />
          </div>
        )}
      </div>
    </Panel>
  )
}
