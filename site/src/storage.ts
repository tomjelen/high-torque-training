import type { AppState } from './types'

const KEY = 'ht-state'

const DEFAULT: AppState = {
  adaptation: {},
  panels: {
    intro: { collapsed: false },
    download: { collapsed: false },
    adaptation: { collapsed: false },
    collection: { collapsed: false },
  },
  log: [],
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT
    const p = JSON.parse(raw)
    return {
      adaptation: p?.adaptation ?? {},
      panels: {
        intro: { collapsed: p?.panels?.intro?.collapsed ?? false },
        download: { collapsed: p?.panels?.download?.collapsed ?? false },
        adaptation: { collapsed: p?.panels?.adaptation?.collapsed ?? false },
        collection: { collapsed: p?.panels?.collection?.collapsed ?? false },
      },
      log: p?.log ?? [],
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
