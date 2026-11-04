// Trust-scale category (evidence file P15): peer-reviewed research; elite /
// pro-team coaches; coaching businesses; media relay.
export type SourceCategory = 'research' | 'pro-team' | 'coaching-business' | 'media'

export interface Source {
  key: string
  shortName: string
  fullCitation: string
  // Optional: some sources (a podcast episode, a CTS article) have no saved,
  // checked URL. Better no link than a guessed one.
  url?: string
  category: SourceCategory
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
  // Named people behind the workout, as the evidence file credits them.
  people: string[]
  // Intensity class: at or below threshold, above threshold, or all-out.
  kind: 'moderate' | 'above-threshold' | 'maximal'
  tss?: number
}

// One week of the 12-week build. workoutIds is a list (one entry today) so
// choices can be added later without a shape change.
export interface BuildWeek {
  week: number
  phase: 'adaptation' | 'build'
  workoutIds: string[]
}

export interface RationaleSection {
  id: string
  heading: string
}

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
  // Weeks of the 12-week build moved on from (0-12).
  buildProgress: number
  // Stack, one id per "Done, move on": the LogEntry that move-on created.
  // Lets undo remove exactly that entry (paired weeks share a workout id, so
  // matching by workout would hit a repeat). Length <= buildProgress.
  moveOnLogIds: string[]
  panels: {
    intro: PanelState
    download: PanelState
    build: PanelState
    collection: PanelState
    usageGuidelines: PanelState
    chartExplainer: PanelState
  }
  log: LogEntry[]
  // The ZWO_WORKOUTS_LAST_UPDATED value captured when the user last downloaded
  // the zip. null = never downloaded. Drives the "Workouts updated" badge.
  workoutsDownloadedDate: string | null
}
