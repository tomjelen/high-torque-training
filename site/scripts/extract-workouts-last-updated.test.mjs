import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getZwoWorkoutsLastUpdated } from './extract-workouts-last-updated.mjs'

const header = (date) => `<?xml version="1.0" encoding="UTF-8"?>
<!--
  High Torque Training — Zwift workout
  Last updated: ${date}

  Site:      https://high-torque.jelen.dk/
-->
<workout_file>
  <name>Test</name>
</workout_file>
`

describe('getZwoWorkoutsLastUpdated', () => {
  let dir
  beforeEach(async () => { dir = await mkdtemp(join(tmpdir(), 'zwo-')) })
  afterEach(async () => { await rm(dir, { recursive: true, force: true }) })

  it('returns the max date across all .zwo files in nested dirs', async () => {
    await mkdir(join(dir, 'A'), { recursive: true })
    await mkdir(join(dir, 'B'), { recursive: true })
    await writeFile(join(dir, 'A', 'one.zwo'), header('2026-01-15'))
    await writeFile(join(dir, 'A', 'two.zwo'), header('2026-05-10'))
    await writeFile(join(dir, 'B', 'three.zwo'), header('2026-03-22'))
    expect(await getZwoWorkoutsLastUpdated(dir)).toBe('2026-05-10')
  })

  it('throws if a .zwo file is missing the Last updated line', async () => {
    await writeFile(join(dir, 'broken.zwo'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<workout_file/>\n`)
    await expect(getZwoWorkoutsLastUpdated(dir)).rejects.toThrow(/Missing or malformed/)
  })

  it('throws if the directory has no .zwo files', async () => {
    await expect(getZwoWorkoutsLastUpdated(dir)).rejects.toThrow(/No \.zwo files/)
  })

  it('ignores non-.zwo files', async () => {
    await writeFile(join(dir, 'real.zwo'), header('2026-04-01'))
    await writeFile(join(dir, 'readme.md'), '# not a workout')
    expect(await getZwoWorkoutsLastUpdated(dir)).toBe('2026-04-01')
  })
})
