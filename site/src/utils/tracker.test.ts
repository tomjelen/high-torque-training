import { describe, test, expect } from 'vitest'
import { calcGap } from './tracker'

describe('calcGap', () => {
  // Most recent entry (nextIsoDate = null) — gap is days from entry to today
  test('same day as today → 0', () => {
    expect(calcGap('2026-05-03', null, '2026-05-03')).toBe(0)
  })
  test('yesterday → 1', () => {
    expect(calcGap('2026-05-02', null, '2026-05-03')).toBe(1)
  })
  test('several days ago', () => {
    expect(calcGap('2026-04-28', null, '2026-05-03')).toBe(5)
  })

  // Older entries — gap is days between this session and the next more recent one
  test('2 days between consecutive sessions', () => {
    expect(calcGap('2026-05-01', '2026-05-03', '2026-05-03')).toBe(2)
  })
  test('3 days between sessions, crossing April→May boundary', () => {
    expect(calcGap('2026-04-28', '2026-05-01', '2026-05-03')).toBe(3)
  })

  // Corner cases
  test('year boundary (Dec 31 → Jan 1)', () => {
    expect(calcGap('2025-12-31', null, '2026-01-01')).toBe(1)
  })
  test('time component in timestamp is stripped — 23:59 entry is still yesterday', () => {
    expect(calcGap('2026-05-02T23:59:59', null, '2026-05-03')).toBe(1)
  })
  test('DST spring-forward boundary does not add or lose a day', () => {
    expect(calcGap('2026-03-28', null, '2026-03-29')).toBe(1)
  })
})
