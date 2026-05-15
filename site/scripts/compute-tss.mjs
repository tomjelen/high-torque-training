// Computes TSS (Training Stress Score) for every .zwo file under workouts/.
// Used by vite.config.ts to inject the TSS map at build time via Vite's define.
import { readFile } from 'node:fs/promises'
import { relative } from 'node:path'
import { findZwoFiles, WORKOUTS_DIR } from './zwo-files.mjs'

const KNOWN_BLOCK_TYPES = new Set(['Warmup', 'Cooldown', 'SteadyState', 'IntervalsT', 'MaxEffort'])
const BLOCK_TYPE_PATTERN = Array.from(KNOWN_BLOCK_TYPES).join('|')

function parseAttrs(attrsStr) {
  const attrs = {}
  const re = /(\w+)="([^"]*)"/g
  let m
  while ((m = re.exec(attrsStr)) !== null) {
    attrs[m[1]] = m[2]
  }
  return attrs
}

// Extract workout blocks in document order from ZWO XML.
// Returns array of { type, attrs } objects.
function extractBlocks(xml, filePath) {
  const workoutMatch = xml.match(/<workout>([\s\S]*?)<\/workout>/)
  if (!workoutMatch) throw new Error(`No <workout> section in ${filePath}`)

  const workoutXml = workoutMatch[1]
  const blocks = []
  const blockRe = new RegExp(`<(${BLOCK_TYPE_PATTERN})\\s+([^>]*)(?:\\/>|>)`, 'g')
  let m
  while ((m = blockRe.exec(workoutXml)) !== null) {
    blocks.push({ type: m[1], attrs: parseAttrs(m[2]) })
  }

  const unknownRe = /<([A-Z][A-Za-z]+)\s/g
  while ((m = unknownRe.exec(workoutXml)) !== null) {
    if (!KNOWN_BLOCK_TYPES.has(m[1]) && m[1] !== 'textevent') {
      throw new Error(`Unknown ZWO block type: "${m[1]}" in ${filePath}`)
    }
  }

  return blocks
}

// Sample a linear ramp at 1 Hz (start → end over durationSec samples)
function sampleRamp(durationSec, start, end) {
  const samples = []
  for (let t = 0; t < durationSec; t++) {
    const frac = durationSec > 1 ? t / (durationSec - 1) : 0
    samples.push(start + (end - start) * frac)
  }
  return samples
}

function sampleBlock({ type, attrs }) {
  const dur = Math.round(Number(attrs.Duration))
  if (type === 'SteadyState') {
    return Array(dur).fill(Number(attrs.Power))
  }
  if (type === 'Warmup' || type === 'Cooldown') {
    return sampleRamp(dur, Number(attrs.PowerLow), Number(attrs.PowerHigh))
  }
  if (type === 'MaxEffort') {
    // No power attribute — sprint at ~150% FTP (reasonable estimate for TSS purposes)
    return Array(dur).fill(1.5)
  }
  if (type === 'IntervalsT') {
    const repeat = Math.round(Number(attrs.Repeat))
    const onDur = Math.round(Number(attrs.OnDuration))
    const offDur = Math.round(Number(attrs.OffDuration))
    const onP = Number(attrs.OnPower)
    const offP = Number(attrs.OffPower)
    const samples = []
    for (let r = 0; r < repeat; r++) {
      samples.push(...Array(onDur).fill(onP))
      samples.push(...Array(offDur).fill(offP))
    }
    return samples
  }
  throw new Error(`Unhandled block type: ${type}`)
}

function computeTss(powerSamples) {
  const n = powerSamples.length
  if (n === 0) return 0

  const WINDOW = 30
  const rolled = []
  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += powerSamples[i]
    if (i >= WINDOW) sum -= powerSamples[i - WINDOW]
    rolled.push(sum / Math.min(i + 1, WINDOW))
  }

  const mean4th = rolled.reduce((s, v) => s + v ** 4, 0) / n
  const np = mean4th ** 0.25
  const durationHours = n / 3600
  return Math.round(durationHours * np * np * 100)
}

async function computeFileTss(filePath) {
  const xml = await readFile(filePath, 'utf8')
  const blocks = extractBlocks(xml, filePath)
  const allSamples = blocks.flatMap(sampleBlock)
  return computeTss(allSamples)
}

export async function getTssMap() {
  const files = await findZwoFiles()
  const entries = await Promise.all(
    files.map(async (filePath) => {
      const relPath = relative(WORKOUTS_DIR, filePath).replace(/\\/g, '/')
      const tss = await computeFileTss(filePath)
      return [relPath, tss]
    }),
  )
  entries.sort(([a], [b]) => a.localeCompare(b))
  return Object.fromEntries(entries)
}
