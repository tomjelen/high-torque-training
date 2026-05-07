import type { AppState, PanelState } from './types'

const KEY = 'ht-state'

export const DEFAULT_STATE: AppState = {
  adaptation: {},
  panels: {
    intro: { collapsed: false },
    download: { collapsed: false },
    adaptation: { collapsed: false },
    collection: { collapsed: false },
    usageGuidelines: { collapsed: false },
  },
  log: [],
  adaptationCheckInConfirmed: false,
}

// Initial state for SSR and the client's first hydrate render. All panels
// start collapsed so the prerendered HTML never paints with `<details open>`
// — that's what would flash open-then-closed for returning users whose
// persisted state has them collapsed. Returning users with collapsed panels
// see no flash; first-time visitors and users with mixed state see the
// open panels reveal as the layout effect applies the loaded state.
// See documentation/prerendering.md.
export const PRERENDER_STATE: AppState = {
  ...DEFAULT_STATE,
  panels: {
    intro: { collapsed: true },
    download: { collapsed: true },
    adaptation: { collapsed: true },
    collection: { collapsed: true },
    usageGuidelines: { collapsed: true },
  },
}

function loadPanel(parsed: AppState | null, name: keyof AppState['panels']): PanelState {
  return { collapsed: parsed?.panels?.[name]?.collapsed ?? false }
}

export function loadState(isMobile = false): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      if (!isMobile) return DEFAULT_STATE
      // Mobile first-time visitor: collapse the install panel by default —
      // they can't install workouts on a phone, so the open panel is just
      // wasted vertical scroll before the rest of the content.
      return {
        ...DEFAULT_STATE,
        panels: { ...DEFAULT_STATE.panels, download: { collapsed: true } },
      }
    }
    const parsed = JSON.parse(raw) as AppState | null
    return {
      adaptation: parsed?.adaptation ?? {},
      panels: {
        intro: loadPanel(parsed, 'intro'),
        download: loadPanel(parsed, 'download'),
        adaptation: loadPanel(parsed, 'adaptation'),
        collection: loadPanel(parsed, 'collection'),
        usageGuidelines: loadPanel(parsed, 'usageGuidelines'),
      },
      log: parsed?.log ?? [],
      adaptationCheckInConfirmed: parsed?.adaptationCheckInConfirmed ?? false,
    }
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore quota / privacy-mode errors
  }
}
