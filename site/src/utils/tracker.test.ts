import { describe, test, expect } from 'vitest'
import { calcGap, formatGap, formatGapTitle } from './tracker'

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

describe('formatGap', () => {
  test('newest entry on today renders as "today"', () => {
    expect(formatGap(0, true)).toBe('today')
  })
  test('newest entry N days ago renders as "+Nd"', () => {
    expect(formatGap(3, true)).toBe('+3d')
  })
  test('older entry on the same day as the next session renders as "0d"', () => {
    expect(formatGap(0, false)).toBe('0d')
  })
  test('older entry N days before the next session renders as "+Nd"', () => {
    expect(formatGap(7, false)).toBe('+7d')
  })
})

describe('formatGapTitle', () => {
  test('newest entry on today → "Today!"', () => {
    expect(formatGapTitle(0, true)).toBe('Today!')
  })
  test('newest entry 1 day ago is singular', () => {
    expect(formatGapTitle(1, true)).toBe('1 day since this session')
  })
  test('newest entry several days ago is plural', () => {
    expect(formatGapTitle(5, true)).toBe('5 days since this session')
  })
  test('older entry on the same day as the next session → "Same day"', () => {
    expect(formatGapTitle(0, false)).toBe('Same day. Don\'t do HT sessions back-to-back!')
  })
  test('older entry 1 day before the next session is singular', () => {
    expect(formatGapTitle(1, false)).toBe('1 day between this and the following session')
  })
  test('older entry several days before the next session is plural', () => {
    expect(formatGapTitle(7, false)).toBe('7 days between this and the following session')
  })
})
