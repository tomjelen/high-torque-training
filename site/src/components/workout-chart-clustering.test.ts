// The req-4 clustering sanity table (documentation/workout-chart.md) run
// against the REAL parsed .zwo data, through the actual production clusterer.
// A set must read as ONE high-torque region, not a barcode: intra-set rests
// merge, long between-set rests split. These three counts are the regression
// test for that behaviour on the real corpus.
import { describe, it, expect, beforeAll } from 'vitest'
import { getChartBlocksMap } from '../../scripts/compute-chart-blocks.mjs'
import { buildClusters } from './chart-clustering'
import type { ChartBlock } from './chart-model'

// Mirror WorkoutChart's layout pass at the gallery's desktop width: each
// block gets width proportional to its share of total session time.
const DESKTOP_W = 680
const DESKTOP_THRESHOLD = 20 // WorkoutChart: non-narrow clusterThresholdPx

function layoutAt(blocks: ChartBlock[], width: number) {
  const total = blocks.reduce((s, b) => s + b.dur, 0)
  const pxPerSec = width / total
  let cursor = 0
  return blocks.map((b) => {
    const w = b.dur * pxPerSec
    const g = { x: cursor, w, b }
    cursor += w
    return g
  })
}

function clusterCount(blocks: ChartBlock[]): number {
  return buildClusters(blocks, layoutAt(blocks, DESKTOP_W), DESKTOP_THRESHOLD)
    .length
}

describe('cadence clustering on real .zwo data (req-4 sanity table)', () => {
  let map: Record<string, { blocks: ChartBlock[] }>
  beforeAll(async () => {
    map = await getChartBlocksMap()
  })

  it('Staple 5×5 → 5 marks (5-min rests too long to merge)', () => {
    expect(
      clusterCount(map['High Torque - Tier 2 Development/Staple_5x5_90pct.zwo'].blocks),
    ).toBe(5)
  })

  it('SIT 2×(4×30 s) → 2 marks (intra-set rests merge, 25-min rest splits)', () => {
    expect(
      clusterCount(map['High Torque - Tier 4 Advanced/SIT_2sets.zwo'].blocks),
    ).toBe(2)
  })

  it('SIT 3×(4×30 s) → 3 marks (intra-set rests merge, 25-min rests split)', () => {
    expect(
      clusterCount(map['High Torque - Tier 4 Advanced/SIT_3sets.zwo'].blocks),
    ).toBe(3)
  })

  it('Rüegg 3×(5 min + sprint) → 3 marks (unflagged sprints do not split the set)', () => {
    expect(
      clusterCount(
        map['High Torque - Tier 3 Challenging/Ruegg_VO2max_Sprint.zwo'].blocks,
      ),
    ).toBe(3)
  })
})
