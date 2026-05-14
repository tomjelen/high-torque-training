// Shared helpers for scripts that walk the High Torque workouts directory.
import { readdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const WORKOUTS_DIR = join(__dirname, '..', '..', 'workouts')

export async function findZwoFiles(dir = WORKOUTS_DIR) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) files.push(...(await findZwoFiles(p)))
    else if (e.isFile() && e.name.endsWith('.zwo')) files.push(p)
  }
  return files
}
