// Parses every .zwo file under workouts/ into the ChartBlock[] shape that
// WorkoutChart consumes (site/src/components/chart-model.ts). Used by
// vite.config.ts to inject the block map at build time via Vite's define,
// mirroring compute-tss.mjs / __ZWO_WORKOUTS_TSS__. Keyed by .zwo path
// relative to the workouts dir — the same stable key as the TSS map, since
// the placeholder workout ids do not match the site's ids.
//
// Reuses compute-tss.mjs's regex .zwo parser (extractBlocks) rather than
// adding a second parser or an XML dependency. The mapping rules below are
// the M2 contract from documentation/workout-chart.md — getting `cadence`
// wrong moves or deletes the high-torque marks, the worst regression.
import { readFile } from 'node:fs/promises'
import { relative } from 'node:path'
import { extractBlocks } from './compute-tss.mjs'
import { findZwoFiles, WORKOUTS_DIR } from './zwo-files.mjs'

// MaxEffort blocks carry no Power attribute. Pick one fixed sprint value
// above the chart's ~130% clamp so every max sprint reads as the tallest,
// equal bar (the clamp handles the rest). The exact value is incidental.
export const MAX_EFFORT_POWER = 1.45

// Intensity zone from power (fraction of FTP). Thresholds from the M2
// contract: <0.60→1, 0.60–0.75→2, 0.76–0.87→3, 0.88–0.95→4, 0.96–1.05→5,
// ≥1.06→6. Only used for steady/sprint block fill colour, never for ramps.
export function zoneForPower(power) {
  if (power < 0.6) return 1
  if (power < 0.76) return 2
  if (power < 0.88) return 3
  if (power < 0.96) return 4
  if (power < 1.06) return 5
  return 6
}

// req. 3: a block is high-torque iff it prescribes a cadence. The corpus
// only uses `Cadence`, but the spec covers `CadenceLow`/`CadenceHigh` too.
function hasCadence(attrs) {
  return (
    attrs.Cadence !== undefined ||
    attrs.CadenceLow !== undefined ||
    attrs.CadenceHigh !== undefined
  )
}

function mapBlock(type, attrs, filePath) {
  const dur = Math.round(Number(attrs.Duration))

  // Warmup/cooldown are neutral ramps (req. 5): the parser must not give
  // them a "real" intensity zone for colour. zone:1 is a valid placeholder;
  // WorkoutChart draws ramps with RAMP_FILL and ignores this field.
  // PowerLow/PowerHigh are preserved as-is so a descending cooldown
  // (PowerLow > PowerHigh in the files) stays descending.
  if (type === 'Warmup' || type === 'Cooldown') {
    return {
      kind: 'ramp',
      zone: 1,
      fromPower: Number(attrs.PowerLow),
      toPower: Number(attrs.PowerHigh),
      dur,
    }
  }

  if (type === 'SteadyState') {
    const power = Number(attrs.Power)
    const block = { kind: 'block', zone: zoneForPower(power), power, dur }
    if (hasCadence(attrs)) block.cadence = true
    return block
  }

  if (type === 'MaxEffort') {
    const block = { kind: 'block', zone: 6, power: MAX_EFFORT_POWER, dur }
    if (hasCadence(attrs)) block.cadence = true
    return block
  }

  throw new Error(`Unhandled ZWO block type for chart: "${type}" in ${filePath}`)
}

function extractName(xml) {
  const m = xml.match(/<name>([\s\S]*?)<\/name>/)
  return m ? m[1].trim() : ''
}

// Parse one .zwo document into { title, blocks }. Pure — no filesystem.
export function blocksFromZwo(xml, filePath) {
  const title = extractName(xml)
  const blocks = extractBlocks(xml, filePath).map(({ type, attrs }) =>
    mapBlock(type, attrs, filePath),
  )
  return { title, blocks }
}

// { [zwoRelPath]: ChartWorkout }. cadenceLabel/subtitle/phases are left
// undefined for M2 — M3 supplies the real cadence label from data.ts.
export async function getChartBlocksMap() {
  const files = await findZwoFiles()
  const entries = await Promise.all(
    files.map(async (filePath) => {
      const relPath = relative(WORKOUTS_DIR, filePath).replace(/\\/g, '/')
      const xml = await readFile(filePath, 'utf8')
      const { title, blocks } = blocksFromZwo(xml, filePath)
      return [relPath, { id: relPath, title, blocks }]
    }),
  )
  entries.sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(entries)
}
