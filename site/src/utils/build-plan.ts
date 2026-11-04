import { BUILD_WEEKS } from '../data'
import type { AppState, BuildWeek, LogEntry } from '../types'

export const BUILD_LENGTH = 12
export const ADAPTATION_LENGTH = 4

// buildProgress = number of weeks moved on from (0-12). The current week is
// the one at index buildProgress; null once all 12 are done.
export function currentWeek(progress: number): BuildWeek | null {
  return BUILD_WEEKS[progress] ?? null
}

export function moveOn(progress: number): number {
  return Math.min(BUILD_LENGTH, progress + 1)
}

export function undoMoveOn(progress: number): number {
  return Math.max(0, progress - 1)
}

// Log a session of the current week. advance = "Done, move on": also step
// to the next week and remember the entry id so undo can remove exactly it.
// No-op once the build is done.
export function logBuildSession(state: AppState, entry: LogEntry, advance: boolean): AppState {
  const week = currentWeek(state.buildProgress)
  if (!week || !week.workoutIds.includes(entry.workoutId)) return state
  return {
    ...state,
    buildProgress: advance ? moveOn(state.buildProgress) : state.buildProgress,
    moveOnLogIds: advance ? [...state.moveOnLogIds, entry.id] : state.moveOnLogIds,
    log: [...state.log, entry],
  }
}

// Undo the last "move on": step back a week and drop the log entry that
// move-on created, if it is still there (it may have been deleted in the
// tracker). Repeats and library entries are never touched.
export function undoLastMoveOn(state: AppState): AppState {
  if (state.buildProgress <= 0) return state
  const ids = capMoveOnLogIds(state.moveOnLogIds, state.buildProgress)
  const popped = ids.pop()
  return {
    ...state,
    buildProgress: undoMoveOn(state.buildProgress),
    moveOnLogIds: ids,
    log: popped === undefined ? state.log : state.log.filter((e) => e.id !== popped),
  }
}

// The stack is aligned from the top: its last id is the move-on out of week
// buildProgress. It can be shorter than buildProgress (state from before the
// field existed); then the oldest move-ons simply have no id. Longer than
// buildProgress is invalid, so the oldest extra ids are dropped.
export function capMoveOnLogIds(ids: string[], progress: number): string[] {
  return ids.slice(Math.max(0, ids.length - progress))
}

// Set progress (after a reset): drop the ids of the move-ons being undone.
export function withProgress(state: AppState, progress: number): AppState {
  const dropped = Math.max(0, state.buildProgress - progress)
  const kept = state.moveOnLogIds.slice(0, Math.max(0, state.moveOnLogIds.length - dropped))
  return { ...state, buildProgress: progress, moveOnLogIds: capMoveOnLogIds(kept, progress) }
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
