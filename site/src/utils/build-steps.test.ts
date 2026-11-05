import { describe, expect, it } from 'vitest'
import { BUILD_STEPS, nextLabel, phaseWeek, stepEndsAt, stepIndexForProgress, stepLabel, torquePowerFor, torquePowerLabel, weekRangeLabel } from './build-steps'

describe('BUILD_STEPS', () => {
  it('groups the 12 weeks into six two-week steps, in calendar order', () => {
    expect(BUILD_STEPS.map((s) => [s.workout.id, weekRangeLabel(s), s.phase])).toEqual([
      ['a1', 'Weeks 1–2', 'adaptation'],
      ['a2', 'Weeks 3–4', 'adaptation'],
      ['te-3x8', 'Weeks 1–2', 'build'],
      ['threshold-5x5', 'Weeks 3–4', 'build'],
      ['torquemax', 'Weeks 5–6', 'build'],
      ['hiit-4x4', 'Weeks 7–8', 'build'],
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
    expect(nextLabel(0)).toBe('ride it once more next week')
    expect(nextLabel(1)).toBe('next week: 4×4 @ 50–60 rpm')
    expect(nextLabel(3)).toBe('next week: the build, starting with Torque Endurance 3×8')
    expect(nextLabel(11)).toBe('finish the build')
    expect(nextLabel(12)).toBe('')
  })
})

describe('stepEndsAt', () => {
  it('is true on the second session of each step, where the move-on checks apply', () => {
    expect(Array.from({ length: 12 }, (_, i) => stepEndsAt(i))).toEqual([
      false, true, false, true, false, true, false, true, false, true, false, true,
    ])
    expect(stepEndsAt(12)).toBe(false)
  })
})

describe('two plans', () => {
  it('numbers weeks inside each plan: adaptation 1–4, build 1–8', () => {
    expect(BUILD_STEPS.flatMap((s) => s.weeks.map(phaseWeek))).toEqual([1, 2, 3, 4, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(BUILD_STEPS.map(stepLabel)).toEqual([
      'Adaptation weeks 1–2', 'Adaptation weeks 3–4',
      'Build weeks 1–2', 'Build weeks 3–4', 'Build weeks 5–6', 'Build weeks 7–8',
    ])
  })
})
