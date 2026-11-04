import { describe, test, expect } from 'vitest'
import {
  BUILD_LENGTH,
  ADAPTATION_LENGTH,
  currentWeek,
  moveOn,
  undoMoveOn,
  undoLastMoveOn,
  resetAdaptation,
  resetBuild,
  isBuildDone,
  logBuildSession,
  withProgress,
  capMoveOnLogIds,
} from './build-plan'
import { BUILD_WEEKS, workoutById } from '../data'
import { DEFAULT_STATE } from '../storage'
import type { AppState } from '../types'

const stateWith = (
  buildProgress: number,
  log: AppState['log'],
  moveOnLogIds: string[] = [],
): AppState => ({
  ...DEFAULT_STATE,
  buildProgress,
  log,
  moveOnLogIds,
})

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

describe('undoLastMoveOn', () => {
  test('removes the log entry the last move-on created', () => {
    const log = [
      { id: '1', workoutId: 'a2', timestamp: '2026-01-01' },
      { id: '2', workoutId: 'te-3x8', timestamp: '2026-01-08' },
    ]
    const out = undoLastMoveOn(stateWith(5, log, ['x1', 'x2', 'x3', '1', '2']))
    expect(out.buildProgress).toBe(4)
    expect(out.log).toEqual([log[0]])
    expect(out.moveOnLogIds).toEqual(['x1', 'x2', 'x3', '1'])
  })
  test('empty stack (old state): just decrements', () => {
    const log = [{ id: '1', workoutId: 'te-3x8', timestamp: '2026-01-08' }]
    const out = undoLastMoveOn(stateWith(5, log, []))
    expect(out.buildProgress).toBe(4)
    expect(out.log).toEqual(log)
  })
  test('same-date tie: removes the stacked entry (id2), keeps id1', () => {
    const log = [
      { id: 'id1', workoutId: 'te-3x8', timestamp: '2026-01-08' },
      { id: 'id2', workoutId: 'te-3x8', timestamp: '2026-01-08' },
    ]
    const out = undoLastMoveOn(stateWith(5, log, ['x1', 'x2', 'x3', 'x4', 'id2']))
    expect(out.buildProgress).toBe(4)
    expect(out.log).toEqual([log[0]])
  })
  test('same-date tie: an entry from a different week is untouched', () => {
    const log = [
      { id: 'id1', workoutId: 'te-3x8', timestamp: '2026-01-08' },
      { id: 'id2', workoutId: 'te-3x8', timestamp: '2026-01-08' },
      { id: 'other', workoutId: 'a2', timestamp: '2026-01-08' },
    ]
    const out = undoLastMoveOn(stateWith(5, log, ['x1', 'x2', 'x3', 'other', 'id2']))
    expect(out.log).toEqual([log[0], log[2]])
  })
  test('a later repeat of the same workout is kept; the move-on entry goes', () => {
    const log = [
      { id: 'm1', workoutId: 'te-3x8', timestamp: '2026-01-01' },
      { id: 'r1', workoutId: 'te-3x8', timestamp: '2026-01-08' },
    ]
    const out = undoLastMoveOn(stateWith(5, log, ['x1', 'x2', 'x3', 'x4', 'm1']))
    expect(out.buildProgress).toBe(4)
    expect(out.log).toEqual([log[1]])
  })
  test('stacked id no longer in the log: decrements, log unchanged', () => {
    const log = [{ id: 'r1', workoutId: 'te-3x8', timestamp: '2026-01-08' }]
    const out = undoLastMoveOn(stateWith(5, log, ['x1', 'x2', 'x3', 'x4', 'gone']))
    expect(out.buildProgress).toBe(4)
    expect(out.log).toEqual(log)
    expect(out.moveOnLogIds).toEqual(['x1', 'x2', 'x3', 'x4'])
  })
  test('progress 0 unchanged', () => {
    const s = stateWith(0, [{ id: '1', workoutId: 'a1', timestamp: '2026-01-01' }])
    expect(undoLastMoveOn(s)).toEqual(s)
  })
})

describe('logBuildSession', () => {
  const entry = { id: 'e1', workoutId: 'te-3x8', timestamp: '2026-01-08' }
  test('move on: logs, advances, stacks the entry id', () => {
    const out = logBuildSession(stateWith(4, [], ['a', 'b', 'c', 'd']), entry, true)
    expect(out.buildProgress).toBe(5)
    expect(out.log).toEqual([entry])
    expect(out.moveOnLogIds).toEqual(['a', 'b', 'c', 'd', 'e1'])
  })
  test('repeat: logs, progress and stack unchanged', () => {
    const out = logBuildSession(stateWith(4, [], ['a', 'b', 'c', 'd']), entry, false)
    expect(out.buildProgress).toBe(4)
    expect(out.log).toEqual([entry])
    expect(out.moveOnLogIds).toEqual(['a', 'b', 'c', 'd'])
  })
  test('no-op when the build is done or the workout is not this week', () => {
    const done = stateWith(12, [])
    expect(logBuildSession(done, entry, true)).toBe(done)
    const wk1 = stateWith(0, [])
    expect(logBuildSession(wk1, entry, true)).toBe(wk1)
  })
})

describe('withProgress (resets)', () => {
  test('restart build from week 7 drops the two newest ids', () => {
    const out = withProgress(stateWith(6, [], ['1', '2', '3', '4', '5', '6']), resetBuild(6))
    expect(out.buildProgress).toBe(4)
    expect(out.moveOnLogIds).toEqual(['1', '2', '3', '4'])
  })
  test('restart adaptation clears the stack', () => {
    expect(withProgress(stateWith(6, [], ['1', '2', '3', '4', '5', '6']), 0).moveOnLogIds).toEqual([])
  })
  test('short stack (old state) drops from the top', () => {
    // progress 7 but only the last two move-ons have ids: both are for weeks 6-7.
    const out = withProgress(stateWith(7, [], ['m6', 'm7']), 4)
    expect(out.moveOnLogIds).toEqual([])
  })
  test('keeps the log', () => {
    const log = [{ id: '1', workoutId: 'a1', timestamp: '2026-01-01' }]
    expect(withProgress(stateWith(6, log, []), 0).log).toEqual(log)
  })
})

describe('capMoveOnLogIds', () => {
  test('keeps the newest ids when longer than progress', () => {
    expect(capMoveOnLogIds(['a', 'b', 'c'], 2)).toEqual(['b', 'c'])
    expect(capMoveOnLogIds(['a', 'b'], 0)).toEqual([])
    expect(capMoveOnLogIds(['a'], 3)).toEqual(['a'])
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
