import { describe, it, expect } from 'vitest'
import { shouldShowUpdateBadge } from './update-badge'

describe('shouldShowUpdateBadge', () => {
  it('hides for first-time visitors who never downloaded', () => {
    expect(shouldShowUpdateBadge(null, '2026-05-25')).toBe(false)
  })

  it('shows when workouts are newer than the last download', () => {
    expect(shouldShowUpdateBadge('2026-04-01', '2026-05-25')).toBe(true)
  })

  it('hides when the last download matches the current workouts date', () => {
    expect(shouldShowUpdateBadge('2026-05-25', '2026-05-25')).toBe(false)
  })

  it('hides when the last download is somehow newer (clock skew / downgrade)', () => {
    expect(shouldShowUpdateBadge('2026-06-01', '2026-05-25')).toBe(false)
  })
})
