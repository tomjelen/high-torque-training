import { describe, expect, it } from 'vitest'
import { BUILD_STEPS, nextLabel, stepIndexForProgress, torquePowerFor, torquePowerLabel, weekRangeLabel } from './build-steps'

describe('BUILD_STEPS', () => {
  it('groups the 12 weeks into six two-week steps, in calendar order', () => {
    expect(BUILD_STEPS.map((s) => [s.workout.id, weekRangeLabel(s), s.phase])).toEqual([
      ['a1', 'Weeks 1–2', 'adaptation'],
      ['a2', 'Weeks 3–4', 'adaptation'],
      ['te-3x8', 'Weeks 5–6', 'build'],
      ['threshold-5x5', 'Weeks 7–8', 'build'],
      ['torquemax', 'Weeks 9–10', 'build'],
      ['hiit-4x4', 'Weeks 11–12', 'build'],
    ])
  })

  it('maps progress to the step holding that week', () => {
    expect([0, 1, 2, 3, 4, 11].map(stepIndexForProgress)).toEqual([0, 0, 1, 1, 2, 5])
    expect(stepIndexForProgress(12)).toBeNull()
  })
})

describe('torquePowerFor', () => {
  // The progression chart's bar heights come from the .zwo files; these are
  // the intensities the calendar prescribes (research/training-calendar.md).
  // If a file changes, this fails before the chart silently drifts.
  it('reads the high-torque interval power of each build step from its .zwo', () => {
    expect(BUILD_STEPS.map((s) => Math.round((torquePowerFor(s.workout)?.power ?? 0) * 100))).toEqual([
      80, 80, 95, 95, 110, 120,
    ])
  })
})

describe('torquePowerLabel', () => {
  // Follows the workout's own params in data.ts, which match the calendar.
  it('keeps the "~" where the workout params write the intensity as approximate', () => {
    expect(BUILD_STEPS.map((s) => torquePowerLabel(s.workout))).toEqual([
      '80%', '80%', '95%', '95%', '110%', '~120%',
    ])
  })
})

describe('nextLabel', () => {
  it('says where Done leads: the second session, the next workout, or the end', () => {
    expect(nextLabel(0)).toBe('session 2 of 2')
    expect(nextLabel(1)).toBe('next: 4×4 @ 50–60 rpm')
    expect(nextLabel(3)).toBe('next: Torque Endurance 3×8')
    expect(nextLabel(11)).toBe('finish the build')
    expect(nextLabel(12)).toBe('')
  })
})
