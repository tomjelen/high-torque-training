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
// do not tokenize. Zwift's own zone names and colours (Zwift support pages;
// evidence file Z1), so the chart matches what the rider sees in Zwift.
export const ZONE_FILL: Record<Zone, string> = {
  1: '#7A7A7A', // Z1 Recovery, grey (<60% FTP)
  2: '#1AA5DB', // Z2 Endurance, blue (60–75%)
  3: '#3FAE54', // Z3 Tempo, green (76–89%)
  4: '#F4C430', // Z4 Threshold, yellow (90–104%)
  5: '#E68A2E', // Z5 VO2 Max, orange (105–118%)
  6: '#DC2626', // Z6 Anaerobic, red (>118%; also FreeRide/MaxEffort sprints)
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
