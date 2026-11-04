import { BUILD_WEEKS, workoutById } from '../data'
import { chartWorkoutFor } from '../components/chart-data'
import type { Zone } from '../components/chart-model'
import type { BuildWeek, Workout } from '../types'

// A "step" is one workout of the 12-week build, ridden in consecutive weeks
// (two per workout today). BUILD_WEEKS stays the source of truth; steps are
// derived by grouping consecutive weeks that share a workout.
export interface BuildStep {
  index: number
  phase: BuildWeek['phase']
  weeks: BuildWeek[]
  workout: Workout
}

export const BUILD_STEPS: BuildStep[] = BUILD_WEEKS.reduce<BuildStep[]>((steps, week) => {
  const last = steps[steps.length - 1]
  if (last && last.workout.id === week.workoutIds[0]) {
    last.weeks.push(week)
    return steps
  }
  const workout = workoutById(week.workoutIds[0])
  if (!workout) throw new Error(`BUILD_WEEKS week ${week.week}: unknown workout ${week.workoutIds[0]}`)
  steps.push({ index: steps.length, phase: week.phase, weeks: [week], workout })
  return steps
}, [])

// The step holding the week at index `progress`; null once the build is done.
export function stepIndexForProgress(progress: number): number | null {
  const week = BUILD_WEEKS[progress]
  if (!week) return null
  return BUILD_STEPS.findIndex((s) => s.weeks.includes(week))
}

export function weekRangeLabel(step: BuildStep): string {
  const first = step.weeks[0].week
  const last = step.weeks[step.weeks.length - 1].week
  return first === last ? `Week ${first}` : `Weeks ${first}–${last}`
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
export function torquePowerLabel(workout: Workout): string | undefined {
  const torque = torquePowerFor(workout)
  if (!torque) return undefined
  const pct = Math.round(torque.power * 100)
  const approx = workout.params.some((p) => p.value.includes(`~${pct}%`))
  return `${approx ? '~' : ''}${pct}%`
}
