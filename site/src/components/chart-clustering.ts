// Cadence-accent clustering for WorkoutChart. Kept separate from the
// component (like chart-model.ts) so fast-refresh stays happy and so the
// req-4 clustering sanity table can be regression-tested on real parsed
// .zwo data without importing the component.
//
// A "set" = a maximal run of cadence blocks separated only by SHORT rests.
// Width is the only criterion: a wide gap (a long rest or a long
// non-cadence effort) splits the accent so each set reads as one region
// instead of a barcode of per-rep stripes (documentation/workout-chart.md
// req. 4). Block separation must never feed this — clustering is computed
// from untouched layout geometry (req. 6).
import type { ChartBlock } from './chart-model'

export interface LaidOutBlock {
  x: number
  w: number
  b: ChartBlock
}

export interface Cluster {
  x: number
  w: number
  blockIdxs: number[]
}

export function buildClusters(
  blocks: ChartBlock[],
  layout: LaidOutBlock[],
  clusterThresholdPx: number,
): Cluster[] {
  const cadenceIdx = blocks
    .map((b, i) => (b.cadence ? i : -1))
    .filter((i) => i >= 0)

  if (cadenceIdx.length === 0) return []

  // Merge consecutive cadence blocks into one accent when every block
  // between them is narrow (≤ threshold px after layout).
  const clusters: number[][] = []
  let cur: number[] = [cadenceIdx[0]]

  for (let k = 1; k < cadenceIdx.length; k++) {
    const prev = cadenceIdx[k - 1]
    const curIdx = cadenceIdx[k]
    let allNarrow = true
    for (let m = prev + 1; m < curIdx; m++) {
      const g = layout[m]
      if (!g) {
        allNarrow = false
        break
      }
      if (g.w > clusterThresholdPx) {
        allNarrow = false
        break
      }
    }
    if (allNarrow) {
      cur.push(curIdx)
    } else {
      clusters.push(cur)
      cur = [curIdx]
    }
  }
  clusters.push(cur)

  return clusters.map((idxs) => {
    const first = layout[idxs[0]]
    const last = layout[idxs[idxs.length - 1]]
    return { x: first.x, w: last.x + last.w - first.x, blockIdxs: idxs }
  })
}
