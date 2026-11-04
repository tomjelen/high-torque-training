import { BUILD_WEEKS } from '../data'
import type { BuildWeek } from '../types'

export const BUILD_LENGTH = 12
export const ADAPTATION_LENGTH = 4

// buildProgress = number of weeks marked done (0-12). The current week is
// the one at index buildProgress; null once all 12 are done. The build never
// writes to the session log: you click Done when the move-on checks pass
// (which can be the day after the ride), and not clicking is the repeat.
export function currentWeek(progress: number): BuildWeek | null {
  return BUILD_WEEKS[progress] ?? null
}

export function moveOn(progress: number): number {
  return Math.min(BUILD_LENGTH, progress + 1)
}

export function undoMoveOn(progress: number): number {
  return Math.max(0, progress - 1)
}

export function resetAdaptation(): number {
  return 0
}

// Back to the start of the build phase (week 5); never moves forward.
export function resetBuild(progress: number): number {
  return Math.min(progress, ADAPTATION_LENGTH)
}

export function isBuildDone(progress: number): boolean {
  return progress >= BUILD_LENGTH
}
