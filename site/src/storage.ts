import type { AppState } from './types'

const KEY = 'ht-v1'

const DEFAULT: AppState = { adaptation: {}, log: [] }

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw)
    return {
      adaptation: parsed?.adaptation ?? {},
      log: parsed?.log ?? [],
      adaptationCollapsed: parsed?.adaptationCollapsed,
    }
  } catch {
    return DEFAULT
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore quota / privacy-mode errors
  }
}
