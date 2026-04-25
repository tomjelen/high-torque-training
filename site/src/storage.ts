import type { AppState, PanelState } from './types'

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
  adaptationCheckInConfirmed: false,
}

function loadPanel(p: unknown, name: keyof AppState['panels']): PanelState {
  return { collapsed: (p as AppState | null)?.panels?.[name]?.collapsed ?? false }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT
    const p = JSON.parse(raw) as unknown
    return {
      adaptation: (p as AppState | null)?.adaptation ?? {},
      panels: {
        intro: loadPanel(p, 'intro'),
        download: loadPanel(p, 'download'),
        adaptation: loadPanel(p, 'adaptation'),
        collection: loadPanel(p, 'collection'),
      },
      log: (p as AppState | null)?.log ?? [],
      adaptationCheckInConfirmed: (p as AppState | null)?.adaptationCheckInConfirmed ?? false,
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
