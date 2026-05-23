// The brittle seam M3 introduces: every site Workout joins to its parsed .zwo
// chart geometry by `Workout.file` → __ZWO_WORKOUTS_BLOCKS__[file]. If a file
// is renamed on one side only, the card silently renders no chart. These tests
// lock the join — and the three-layer read (geometry from .zwo, label from
// data.ts) — so drift fails the build instead of shipping silently.
import { describe, it, expect, beforeAll } from 'vitest'
import { COLLECTION_WORKOUTS, ADAPTATION_WORKOUTS } from '../data'
import { chartWorkoutFor, cadenceLabelFor, durationMinFor } from './chart-data'
import { getChartBlocksMap } from '../../scripts/compute-chart-blocks.mjs'
import type { Workout } from '../types'
import type { ChartWorkout } from './chart-model'

const ALL_WORKOUTS: Workout[] = [...COLLECTION_WORKOUTS, ...ADAPTATION_WORKOUTS]

describe('chart data join (Workout.file → parsed .zwo blocks)', () => {
  // The parsed .zwo map keyed by path — the *independent* source the join
  // reads from, so assertions compare against it rather than re-deriving from
  // chartWorkoutFor's own output.
  let parsed: Record<string, ChartWorkout>
  beforeAll(async () => {
    parsed = (await getChartBlocksMap()) as Record<string, ChartWorkout>
  })

  it('every workout resolves to a chart with blocks', () => {
    for (const w of ALL_WORKOUTS) {
      const chart = chartWorkoutFor(w)
      expect(chart, `no chart for ${w.id} (${w.file})`).toBeDefined()
      expect(chart!.blocks.length, `empty blocks for ${w.id}`).toBeGreaterThan(0)
    }
  })

  it('every parsed .zwo is surfaced in data.ts (no orphan workout hidden from the site)', () => {
    // The reverse direction. With the dev gallery gone, a .zwo present in
    // workouts/ (parsed, downloadable by raw path) but absent from data.ts
    // would appear on no card and fail no other test.
    const dataFiles = new Set(ALL_WORKOUTS.map((w) => w.file))
    for (const key of Object.keys(parsed)) {
      expect(dataFiles.has(key), `orphan .zwo not referenced by any data.ts workout: ${key}`).toBe(true)
    }
  })

  it('title is the site-facing data.ts name, overriding the .zwo <name>', () => {
    for (const w of ALL_WORKOUTS) {
      expect(chartWorkoutFor(w)!.title).toBe(w.name)
    }
    // Teeth: the override is load-bearing only if the .zwo <name> actually
    // differs from the site name for at least one workout. It does — the .zwo
    // uses ASCII "x" (Staple 5x5) where data.ts uses "×" (Staple 5×5).
    const overrideMatters = ALL_WORKOUTS.some(
      (w) => parsed[w.file] && parsed[w.file].title !== w.name,
    )
    expect(overrideMatters, 'expected at least one .zwo <name> to differ from its data.ts name').toBe(true)
  })

  it('cadence label comes from data.ts; the .zwo point cadence value never reaches the chart', () => {
    for (const w of ALL_WORKOUTS) {
      const chart = chartWorkoutFor(w)!
      // Label is the data.ts param (the un-collapsed range like "50–60 rpm").
      const dataParam = w.params.find((p) => p.label === 'Cadence')?.value
      expect(chart.cadenceLabel).toBe(dataParam)
      // Blocks carry only a boolean `cadence` flag — there is structurally no
      // field for the .zwo's Cadence="55" point value, so it cannot leak.
      for (const b of chart.blocks) {
        const flag = (b as { cadence?: boolean }).cadence
        expect(flag === undefined || typeof flag === 'boolean').toBe(true)
        expect(b).not.toHaveProperty('cadenceValue')
      }
    }
  })

  it('durationMinFor returns the .zwo total rounded to the nearest 5 minutes', () => {
    for (const w of ALL_WORKOUTS) {
      const min = durationMinFor(w)
      expect(min, `no duration for ${w.id} (${w.file})`).toBeDefined()
      expect(min! % 5, `${w.id} duration not a multiple of 5`).toBe(0)
      // Cross-check against the independent parsed map, not the helper's own
      // read: the displayed value must be the rounded sum of block durations.
      const totalSec = parsed[w.file].blocks.reduce((s, b) => s + b.dur, 0)
      expect(min).toBe(Math.round(totalSec / 60 / 5) * 5)
    }
    // Teeth: a concrete known value. Staple 5×5 = 15 min warmup + 5×5 min work
    // + 4×5 min recovery + 10 min cooldown = 4200s = exactly 70 min.
    const staple = COLLECTION_WORKOUTS.find((w) => w.id === 't2-staple')!
    expect(durationMinFor(staple)).toBe(70)
  })

  it('the Collection how-to example workout id (t2-staple) still exists', () => {
    // CollectionPanel hardcodes this id for the "how to read the chart"
    // example; a rename would silently drop the example chart. Guard it here.
    expect(
      COLLECTION_WORKOUTS.find((w) => w.id === 't2-staple'),
      'CollectionPanel HOW_TO_CHART id t2-staple not found in data.ts',
    ).toBeDefined()
  })

  it('cadence flag and label agree in both directions (req. 3)', () => {
    for (const w of ALL_WORKOUTS) {
      const chart = chartWorkoutFor(w)!
      const hasFlag = chart.blocks.some((b) => b.cadence)
      const hasLabel = Boolean(cadenceLabelFor(w))
      // forward: a prescribed cadence must produce at least one flagged block
      if (hasLabel) {
        expect(hasFlag, `${w.id} prescribes cadence but no block is flagged`).toBe(true)
      }
      // converse: a flagged high-torque mark must have a label explaining it,
      // otherwise the chart shows a mark the rider can't interpret
      if (hasFlag) {
        expect(hasLabel, `${w.id} has a high-torque mark but no cadence label`).toBe(true)
      }
    }
  })
})
