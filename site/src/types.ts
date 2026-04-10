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
  file: string
}
