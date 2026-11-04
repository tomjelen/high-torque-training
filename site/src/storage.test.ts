import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadState, saveState, DEFAULT_STATE } from './storage'

const KEY = 'ht-state'

beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    clear: () => store.clear(),
  })
})

afterEach(() => vi.unstubAllGlobals())

describe('loadState', () => {
  test('old-format state does not throw, progress 0, log kept', () => {
    localStorage.setItem(
      KEY,
      '{"adaptation":{"w1":"2026-01-01T00:00:00Z"},"adaptationCheckInConfirmed":true,"panels":{},"log":[{"id":"x","workoutId":"t2-staple","timestamp":"2026-01-02"}]}',
    )
    const s = loadState()
    expect(s.buildProgress).toBe(0)
    expect(s.log).toEqual([{ id: 'x', workoutId: 't2-staple', timestamp: '2026-01-02' }])
  })
  test('buildProgress round-trips', () => {
    saveState({ ...DEFAULT_STATE, buildProgress: 7 })
    expect(loadState().buildProgress).toBe(7)
  })
  test('moveOnLogIds round-trips', () => {
    saveState({ ...DEFAULT_STATE, buildProgress: 3, moveOnLogIds: ['a', 'b', 'c'] })
    expect(loadState().moveOnLogIds).toEqual(['a', 'b', 'c'])
  })
  test('missing moveOnLogIds (old state) loads as []', () => {
    localStorage.setItem(KEY, JSON.stringify({ buildProgress: 5 }))
    expect(loadState().moveOnLogIds).toEqual([])
  })
  test.each([null, 'x', 7, { a: 1 }, ['ok', 3]])('garbage moveOnLogIds %j loads as []', (v) => {
    localStorage.setItem(KEY, JSON.stringify({ buildProgress: 5, moveOnLogIds: v }))
    expect(loadState().moveOnLogIds).toEqual([])
  })
  test('moveOnLogIds longer than buildProgress is truncated to the newest', () => {
    localStorage.setItem(KEY, JSON.stringify({ buildProgress: 2, moveOnLogIds: ['a', 'b', 'c'] }))
    expect(loadState().moveOnLogIds).toEqual(['b', 'c'])
  })
  test.each([-1, 99, 'x', 2.5])('invalid buildProgress %s loads as 0', (v) => {
    localStorage.setItem(KEY, JSON.stringify({ buildProgress: v }))
    expect(loadState().buildProgress).toBe(0)
  })
})
