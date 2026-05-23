export interface Source {
  key: string
  shortName: string
  fullCitation: string
  url: string
}

export interface WorkoutParam {
  label: string
  value: string
}

export interface Workout {
  id: string
  name: string
  description?: string
  params: WorkoutParam[]
  source: string
  sourceNote?: string
  file: string
  tier?: 1 | 2 | 3 | 4
  tss?: number
}

export interface Tier {
  number: number
  name: string
  description: string
  color: string
  workouts: Workout[]
}

export interface RationaleSection {
  id: string
  heading: string
}

export type AdaptationId = 'w1' | 'w2' | 'w3'

export interface LogEntry {
  id: string
  workoutId: string
  timestamp: string
  notes?: string
}

export interface PanelState {
  collapsed: boolean
}

export interface AppState {
  adaptation: Partial<Record<AdaptationId, string>>
  panels: {
    intro: PanelState
    download: PanelState
    adaptation: PanelState
    collection: PanelState
    usageGuidelines: PanelState
    chartExplainer: PanelState
  }
  log: LogEntry[]
  adaptationCheckInConfirmed: boolean
}
