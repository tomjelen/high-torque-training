import { BUILD_WEEKS, workoutById } from '../data'
import { ADAPTATION_LENGTH, BUILD_LENGTH } from './build-plan'
import { chartWorkoutFor } from '../components/chart-data'
import type { Zone } from '../components/chart-model'
import type { BuildWeek, Workout } from '../types'

// A "step" is one workout of the 12-week build, ridden in consecutive weeks
// (two per workout today). BUILD_WEEKS stays the source of truth; steps are
// derived by grouping consecutive weeks that share a workout.
// `torque` and `torqueLabel` are read from the .zwo once, here, since they
// never change (see torquePowerFor / torquePowerLabel below).
export interface BuildStep {
  index: number
  phase: BuildWeek['phase']
  weeks: BuildWeek[]
  workout: Workout
  torque: { power: number; zone: Zone } | undefined
  torqueLabel: string | undefined
}

export const BUILD_STEPS: BuildStep[] = BUILD_WEEKS.reduce<BuildStep[]>((steps, week) => {
  const last = steps[steps.length - 1]
  if (last && last.workout.id === week.workoutIds[0]) {
    last.weeks.push(week)
    return steps
  }
  const workout = workoutById(week.workoutIds[0])
  if (!workout) throw new Error(`BUILD_WEEKS week ${week.week}: unknown workout ${week.workoutIds[0]}`)
  const torque = torquePowerFor(workout)
  steps.push({
    index: steps.length,
    phase: week.phase,
    weeks: [week],
    workout,
    torque,
    torqueLabel: torquePowerLabel(workout, torque),
  })
  return steps
}, [])

// The step holding the week at index `progress`; null once the build is done.
export function stepIndexForProgress(progress: number): number | null {
  const week = BUILD_WEEKS[progress]
  if (!week) return null
  return BUILD_STEPS.findIndex((s) => s.weeks.includes(week))
}

// The plan is two plans: a 4-week adaptation, then an 8-week build. Week
// numbers restart at 1 in each (BUILD_WEEKS keeps one running 1–12 count,
// which is also what buildProgress counts).
export function phaseName(phase: BuildWeek['phase']): string {
  return phase === 'adaptation' ? 'Adaptation' : 'Build'
}

export function phaseLength(phase: BuildWeek['phase']): number {
  return phase === 'adaptation' ? ADAPTATION_LENGTH : BUILD_LENGTH - ADAPTATION_LENGTH
}

// The steps of one plan, in order.
export function stepsForPhase(phase: BuildWeek['phase']): BuildStep[] {
  return BUILD_STEPS.filter((s) => s.phase === phase)
}

// Where `progress` stands against one plan: not started, the plan you're on,
// or done. The build is "upcoming" until the adaptation is done.
export type PhaseStatus = 'upcoming' | 'current' | 'done'
export function phaseStatus(phase: BuildWeek['phase'], progress: number): PhaseStatus {
  const start = phase === 'adaptation' ? 0 : ADAPTATION_LENGTH
  const end = start + phaseLength(phase)
  return progress >= end ? 'done' : progress >= start ? 'current' : 'upcoming'
}

// The first step of the 8-week build.
export const FIRST_BUILD_STEP: BuildStep = BUILD_STEPS.find((s) => s.phase === 'build')!

// A week (by its running 1–12 number) against progress: done, the one you're
// on, or later.
export type WeekStatus = 'done' | 'current' | 'later'
export function weekStatus(week: BuildWeek, progress: number): WeekStatus {
  const index = week.week - 1
  return index < progress ? 'done' : index === progress ? 'current' : 'later'
}

export function isStepDone(step: BuildStep, progress: number): boolean {
  return step.weeks.every((w) => weekStatus(w, progress) === 'done')
}

// The week's number inside its own plan: adaptation 1–4, build 1–8.
export function phaseWeek(week: BuildWeek): number {
  return week.phase === 'adaptation' ? week.week : week.week - ADAPTATION_LENGTH
}

// "Weeks 1–2" (inside its plan; for places where the plan is already shown).
export function weekRangeLabel(step: BuildStep): string {
  const first = phaseWeek(step.weeks[0])
  const last = phaseWeek(step.weeks[step.weeks.length - 1])
  return first === last ? `Week ${first}` : `Weeks ${first}–${last}`
}

// "Build weeks 1–2": the step with its plan named.
export function stepLabel(step: BuildStep): string {
  return `${phaseName(step.phase)} ${weekRangeLabel(step).toLowerCase()}`
}

// The power of the high-torque (cadence-prescribed) work in a workout, read
// from its parsed .zwo, so the progression chart can't drift from the files.
// Highest power among cadence-marked blocks; undefined if the .zwo has none.
export function torquePowerFor(workout: Workout): { power: number; zone: Zone } | undefined {
  const chart = chartWorkoutFor(workout)
  if (!chart) return undefined
  let best: { power: number; zone: Zone } | undefined
  for (const b of chart.blocks) {
    if (!b.cadence) continue
    const power = b.kind === 'block' ? b.power : Math.max(b.fromPower, b.toPower)
    if (!best || power > best.power) best = { power, zone: b.zone }
  }
  return best
}

// "120% FTP", or "~120% FTP" when the workout's own params write it as an
// estimate (HIIT's ~120% is our estimate from the paper; keep the "~").
export function torquePowerLabel(workout: Workout, torque = torquePowerFor(workout)): string | undefined {
  if (!torque) return undefined
  const pct = Math.round(torque.power * 100)
  const approx = workout.params.some((p) => p.value.includes(`~${pct}%`))
  return `${approx ? '~' : ''}${pct}%`
}

// The adaptation workouts are named after their weeks ("Weeks 1–2 — 4×4 @ …");
// where the week range is already shown, drop the duplicate prefix.
export function stepTitle(step: BuildStep): string {
  return step.workout.name.replace(/^Weeks? [\d–]+ — /, '')
}

// True when Done at week index `progress` leads to a new workout (or ends the
// build), i.e. this is the last session of its step.
export function stepEndsAt(progress: number): boolean {
  const step = stepIndexForProgress(progress)
  return step !== null && stepIndexForProgress(progress + 1) !== step
}

// What "Done" leads to from the week at index `progress`, as the rest of the
// button's sentence ("Done — …"). Plain words, no counters: "session 2 of 2"
// on a button read as "done with session 2 of 2".
export function nextLabel(progress: number): string {
  const step = stepIndexForProgress(progress)
  if (step === null) return ''
  const next = stepIndexForProgress(progress + 1)
  if (next === null) return 'finish the build'
  if (next === step) return 'ride it once more next week'
  if (BUILD_STEPS[next].phase !== BUILD_STEPS[step].phase)
    return `next week: the build, starting with ${stepTitle(BUILD_STEPS[next])}`
  return `next week: ${stepTitle(BUILD_STEPS[next])}`
}
