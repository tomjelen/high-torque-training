import { describe, it, expect, beforeAll } from 'vitest'
import {
  zoneForPower,
  blocksFromZwo,
  getChartBlocksMap,
  MAX_EFFORT_POWER,
} from './compute-chart-blocks.mjs'

const wrap = (inner, name = 'Test Workout') => `<?xml version="1.0" encoding="UTF-8"?>
<workout_file>
  <name>${name}</name>
  <workout>${inner}</workout>
</workout_file>`

describe('zoneForPower', () => {
  // Zwift's power zones (evidence file Z1): Z1 <60%, Z2 60–75%, Z3 76–89%,
  // Z4 90–104%, Z5 105–118%, Z6 >118% of FTP. The last two cases check the
  // round-to-whole-percent step (75.5% → 76% → Z3; float noise stays Z5).
  it.each([[0.59,1],[0.60,2],[0.75,2],[0.76,3],[0.89,3],[0.90,4],[1.04,4],[1.05,5],[1.18,5],[1.19,6],[1.20,6],[1.10,5],[1.45,6],[0.755,3],[1.1800000001,5]])('%f → zone %i', (p, z) => expect(zoneForPower(p)).toBe(z))
})

describe('blocksFromZwo — mapping rules', () => {
  it('maps Warmup to an ascending ramp (PowerLow→PowerHigh), zone unused for colour', () => {
    const { blocks } = blocksFromZwo(
      wrap('<Warmup Duration="900" PowerLow="0.40" PowerHigh="0.75" />'),
      'w.zwo',
    )
    expect(blocks).toEqual([
      { kind: 'ramp', zone: 1, fromPower: 0.4, toPower: 0.75, dur: 900 },
    ])
  })

  it('maps Cooldown to a ramp preserving its descending direction', () => {
    const { blocks } = blocksFromZwo(
      wrap('<Cooldown Duration="600" PowerLow="0.50" PowerHigh="0.40" />'),
      'c.zwo',
    )
    expect(blocks).toEqual([
      { kind: 'ramp', zone: 1, fromPower: 0.5, toPower: 0.4, dur: 600 },
    ])
  })

  it('maps SteadyState with Cadence to a cadence-flagged block at its zone', () => {
    const { blocks } = blocksFromZwo(
      wrap('<SteadyState Duration="300" Power="0.90" Cadence="55" />'),
      's.zwo',
    )
    expect(blocks).toEqual([
      { kind: 'block', zone: 4, power: 0.9, dur: 300, cadence: true },
    ])
  })

  it('maps SteadyState without Cadence to a block with no cadence flag', () => {
    const { blocks } = blocksFromZwo(
      wrap('<SteadyState Duration="300" Power="0.50" />'),
      's.zwo',
    )
    expect(blocks).toEqual([{ kind: 'block', zone: 1, power: 0.5, dur: 300 }])
    expect(blocks[0].cadence).toBeUndefined()
  })

  it('maps MaxEffort to a zone-6 sprint block at the fixed sprint power', () => {
    const { blocks } = blocksFromZwo(
      wrap('<MaxEffort Duration="60" />'),
      'm.zwo',
    )
    expect(blocks).toEqual([
      { kind: 'block', zone: 6, power: MAX_EFFORT_POWER, dur: 60 },
    ])
  })

  it('flags MaxEffort with Cadence (SIT sprints) but not without (Rüegg sprints)', () => {
    const flagged = blocksFromZwo(
      wrap('<MaxEffort Duration="30" Cadence="55" />'),
      'sit.zwo',
    ).blocks[0]
    const unflagged = blocksFromZwo(
      wrap('<MaxEffort Duration="60" />'),
      'ruegg.zwo',
    ).blocks[0]
    expect(flagged.cadence).toBe(true)
    expect(unflagged.cadence).toBeUndefined()
  })

  it('maps FreeRide to a zone-6 sprint block at the fixed sprint power (same as MaxEffort)', () => {
    const { blocks } = blocksFromZwo(
      wrap('<FreeRide Duration="60" FlatRoad="1" />'),
      'fr.zwo',
    )
    expect(blocks).toEqual([
      { kind: 'block', zone: 6, power: MAX_EFFORT_POWER, dur: 60 },
    ])
  })

  it('flags FreeRide with Cadence (SIT sprints) but not without (Rüegg sprints)', () => {
    const flagged = blocksFromZwo(
      wrap('<FreeRide Duration="30" FlatRoad="1" Cadence="55" />'),
      'sit.zwo',
    ).blocks[0]
    const unflagged = blocksFromZwo(
      wrap('<FreeRide Duration="60" FlatRoad="1" />'),
      'ruegg.zwo',
    ).blocks[0]
    expect(flagged.cadence).toBe(true)
    expect(unflagged.cadence).toBeUndefined()
  })

  it('takes the workout title from the .zwo <name>', () => {
    const { title } = blocksFromZwo(wrap('<MaxEffort Duration="30" />', 'Staple 5x5'), 'x.zwo')
    expect(title).toBe('Staple 5x5')
  })
})

describe('getChartBlocksMap — real corpus invariants', () => {
  let map
  beforeAll(async () => {
    map = await getChartBlocksMap()
  })

  const THRESHOLD = 'High Torque - Library/Threshold_5x5_95pct.zwo'
  const RUEGG = 'High Torque - Library/Ruegg_VO2max_Sprint.zwo'

  it('keys workouts by .zwo path relative to the workouts dir (same as the TSS map)', () => {
    expect(map[THRESHOLD]).toBeDefined()
    expect(map[THRESHOLD].id).toBe(THRESHOLD)
    expect(map[THRESHOLD].title).toBe('HT Threshold 5x5')
  })

  it('preserves total session duration: Threshold 5×5 sums to 3600 s (60 min)', () => {
    const total = map[THRESHOLD].blocks.reduce((s, b) => s + b.dur, 0)
    expect(total).toBe(3600)
  })

  it("does not flag Rüegg's embedded FreeRide sprints (they must not split the set)", () => {
    const sprints = map[RUEGG].blocks.filter(
      (b) => b.kind === 'block' && b.power === MAX_EFFORT_POWER,
    )
    expect(sprints.length).toBe(3)
    expect(sprints.every((b) => !b.cadence)).toBe(true)
  })

  it('flags only the cadence-prescribed work blocks in Rüegg (the 3 VO2max blocks)', () => {
    const flagged = map[RUEGG].blocks.filter((b) => b.cadence)
    expect(flagged.length).toBe(3)
    expect(flagged.every((b) => b.kind === 'block' && b.power === 1.1)).toBe(true)
  })
})
