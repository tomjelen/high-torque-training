// Joins a site `Workout` (data.ts) to the chart geometry parsed from its
// `.zwo` at build time (`__ZWO_WORKOUTS_BLOCKS__`, keyed by `.zwo` path).
//
// The three-layer read documented in documentation/workout-chart.md:
//   - geometry (blocks)        ← the parsed .zwo (the only machine-readable form)
//   - high-torque flag         ← the parsed .zwo's Cadence-attr presence
//   - displayed cadence label  ← data.ts params (the un-collapsed "50–60 rpm")
// The .zwo's point cadence (e.g. Cadence="55") is never displayed; the label
// shown to the rider / assistive tech comes from data.ts.
import type { ChartWorkout } from './chart-model'
import type { Workout } from '../types'

const BLOCKS = __ZWO_WORKOUTS_BLOCKS__

// The rider-facing cadence prescription (a range like "50–60 rpm"), read from
// the workout's "Cadence" param. Shared with AdaptationCard so the lookup
// isn't duplicated.
export function cadenceLabelFor(workout: Workout): string | undefined {
  return workout.params.find((p) => p.label === 'Cadence')?.value
}

// Resolve the ChartWorkout for a card. Returns undefined if the workout's
// `.zwo` has no parsed entry (a broken join — caught by chart-data.test.ts so
// it never ships, but the card simply renders no chart rather than throwing).
export function chartWorkoutFor(workout: Workout): ChartWorkout | undefined {
  const parsed = BLOCKS[workout.file]
  if (!parsed) return undefined
  return {
    ...parsed,
    title: workout.name, // site-facing name, not the .zwo <name>
    cadenceLabel: cadenceLabelFor(workout),
  }
}
