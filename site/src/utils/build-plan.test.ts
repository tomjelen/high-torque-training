import { describe, test, expect } from 'vitest'
import {
  BUILD_LENGTH,
  ADAPTATION_LENGTH,
  currentWeek,
  moveOn,
  undoMoveOn,
  resetAdaptation,
  resetBuild,
  isBuildDone,
} from './build-plan'
import { BUILD_WEEKS, workoutById } from '../data'

describe('constants', () => {
  test('lengths', () => {
    expect(BUILD_LENGTH).toBe(12)
    expect(ADAPTATION_LENGTH).toBe(4)
  })
})

describe('currentWeek', () => {
  test('week 1 is a1', () => {
    expect(currentWeek(0)?.week).toBe(1)
    expect(currentWeek(0)?.workoutIds).toEqual(['a1'])
  })
  test('progress 4 is te-3x8', () => {
    expect(currentWeek(4)?.workoutIds).toEqual(['te-3x8'])
  })
  test('done is null', () => {
    expect(currentWeek(12)).toBeNull()
  })
})

describe('moveOn / undoMoveOn', () => {
  test('moveOn', () => {
    expect(moveOn(0)).toBe(1)
    expect(moveOn(12)).toBe(12)
  })
  test('undoMoveOn', () => {
    expect(undoMoveOn(0)).toBe(0)
    expect(undoMoveOn(5)).toBe(4)
  })
})

describe('resets', () => {
  test('resetAdaptation', () => {
    expect(resetAdaptation()).toBe(0)
  })
  test('resetBuild goes back to start of build, never forward', () => {
    expect(resetBuild(9)).toBe(4)
    expect(resetBuild(2)).toBe(2)
  })
  test('isBuildDone', () => {
    expect(isBuildDone(12)).toBe(true)
    expect(isBuildDone(11)).toBe(false)
  })
})

describe('BUILD_WEEKS integrity', () => {
  test('ids resolve', () => {
    for (const w of BUILD_WEEKS) for (const id of w.workoutIds) expect(workoutById(id)).toBeDefined()
  })
  test('weeks 1..12 in order; 1-4 adaptation', () => {
    expect(BUILD_WEEKS.map((w) => w.week)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1))
    expect(BUILD_WEEKS.slice(0, 4).every((w) => w.phase === 'adaptation')).toBe(true)
  })
})
