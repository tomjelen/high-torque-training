// Shared model for the workout chart: the block data shape consumed by
// WorkoutChart and the hardcoded zone palette. Kept separate from the
// component so fast-refresh stays happy and so M2's .zwo parser can target
// these types without importing the component.

export type Zone = 1 | 2 | 3 | 4 | 5 | 6

export type ChartBlock =
  | { kind: 'block'; zone: Zone; power: number; dur: number; cadence?: boolean }
  | {
      kind: 'ramp'
      zone: Zone
      fromPower: number
      toPower: number
      dur: number
      cadence?: boolean
    }

export interface ChartPhase {
  label: string
  startSec: number
  durSec: number
}

export interface ChartWorkout {
  id: string
  title: string
  subtitle?: string
  cadenceLabel?: string
  blocks: ChartBlock[]
  phases?: ChartPhase[]
}

// Zone fill palette. Hardcoded by design (per the visualizations handoff) —
// do not tokenize. Mirrors the ZONE mapping in the handoff's zone table.
export const ZONE_FILL: Record<Zone, string> = {
  1: '#7A7A7A', // recovery / inter-set
  2: '#1AA5DB', // endurance / warmup ramp top
  3: '#3FAE54', // tempo (reserved)
  4: '#F4C430', // threshold
  5: '#E68A2E', // VO2 / sweet-spot (reserved)
  6: '#DC2626', // anaerobic / sprint
}

// Fill for warmup/cooldown ramps. A ramp crosses several power zones, so it
// is deliberately drawn neutral grey rather than zone-coloured — warmup and
// cooldown are the same kind of thing and should read identically. Same grey
// as zone 1 (non-specific intensity), kept as its own constant so the intent
// is explicit and M2's .zwo parser doesn't have to fabricate a ramp zone.
export const RAMP_FILL = '#7A7A7A'

// The cadence (high-torque) accent: an amber hatch over a dark amber ground.
// This is a *data* colour (req. 10) — the single most important mark on the
// chart — so it is hardcoded, not tokenized. Shared by WorkoutChart's accent
// bars/legend and the standalone ChartLegend swatch so the hatch is defined
// once, not duplicated across components.
export const CADENCE_HATCH_LINE = '#BA7517' // diagonal rule
export const CADENCE_HATCH_BG = '#633806' // ground behind the hatch
