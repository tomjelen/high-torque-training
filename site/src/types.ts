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
}

export interface Tier {
  number: number
  name: string
  description: string
  color: string
  workouts: Workout[]
}

export interface ScienceSection {
  id: string
  heading: string
}

export type AdaptationId = 'w1' | 'w2' | 'w3'

export interface LogEntry {
  workoutId: string
  date: string
}

export interface AppState {
  adaptation: Partial<Record<AdaptationId, string>>
  log: LogEntry[]
  adaptationCollapsed?: boolean
}
