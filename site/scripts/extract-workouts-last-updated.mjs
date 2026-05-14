// Reads every .zwo file under workoutsDir and returns the max
// "Last updated: YYYY-MM-DD" date found in their header comments.
// Used by vite.config.ts to inject ZWO_WORKOUTS_LAST_UPDATED at build time.
import { readFile } from 'node:fs/promises'
import { findZwoFiles, WORKOUTS_DIR } from './zwo-files.mjs'

const LAST_UPDATED_RE = /^\s*Last updated:\s*(\d{4}-\d{2}-\d{2})\s*$/m

export async function getZwoWorkoutsLastUpdated(workoutsDir = WORKOUTS_DIR) {
  const files = await findZwoFiles(workoutsDir)
  if (files.length === 0) throw new Error(`No .zwo files found in ${workoutsDir}`)
  let max = null
  for (const f of files) {
    const content = await readFile(f, 'utf8')
    const m = content.match(LAST_UPDATED_RE)
    if (!m) throw new Error(`Missing or malformed "Last updated:" line in ${f}`)
    const date = m[1]
    if (max === null || date > max) max = date
  }
  return max
}
