// Deterministic content-consistency checks between the research calendar
// (research/training-calendar.md, the source of truth for *what* to ride),
// the .zwo files under workouts/ and the site's data model (data.ts).
// The site-consistency skill (.claude/skills/site-consistency) covers prose; this covers the
// facts that can be compared exactly.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_WORKOUTS, BUILD_WEEKS, SOURCES, workoutById } from './data'
import { durationMinFor } from './components/chart-data'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')
const WORKOUTS_DIR = join(REPO, 'workouts')
const CALENDAR = readFileSync(join(REPO, 'research', 'training-calendar.md'), 'utf-8')

// Rows of the "## Workout files" table: | Workout | `path` | minutes |
function calendarFileTable(): Map<string, number> {
  const start = CALENDAR.indexOf('## Workout files')
  if (start < 0) throw new Error('training-calendar.md has no "## Workout files" section')
  const rest = CALENDAR.slice(start + 1)
  const end = rest.search(/\n## |\n---/)
  const section = end < 0 ? rest : rest.slice(0, end)
  const rows = new Map<string, number>()
  for (const line of section.split('\n')) {
    const m = line.match(/^\|[^|]*\|\s*`([^`]+\.zwo)`\s*\|\s*(\d+)\s*\|\s*$/)
    if (m) rows.set(m[1], Number(m[2]))
  }
  return rows
}

function zwoFilesOnDisk(dir = WORKOUTS_DIR): string[] {
  const out: string[] = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...zwoFilesOnDisk(p))
    else if (e.isFile() && e.name.endsWith('.zwo')) out.push(relative(WORKOUTS_DIR, p))
  }
  return out
}

const sorted = (xs: Iterable<string>) => [...xs].sort()

describe('calendar ↔ .zwo files ↔ data.ts', () => {
  const table = calendarFileTable()

  it('the calendar lists a non-empty workout-files table', () => {
    expect(table.size).toBeGreaterThan(0)
  })

  it('calendar files = .zwo files on disk = ALL_WORKOUTS files', () => {
    const calendarFiles = sorted(table.keys())
    expect(sorted(zwoFilesOnDisk())).toEqual(calendarFiles)
    expect(sorted(ALL_WORKOUTS.map((w) => w.file))).toEqual(calendarFiles)
  })

  it("each workout's duration (from its .zwo) equals the calendar's Duration", () => {
    for (const w of ALL_WORKOUTS) {
      expect(durationMinFor(w), `${w.id} (${w.file})`).toBe(table.get(w.file))
    }
  })

  it('every BUILD_WEEKS workout file appears in the calendar', () => {
    for (const week of BUILD_WEEKS) {
      for (const id of week.workoutIds) {
        const w = workoutById(id)
        expect(w, `week ${week.week}: unknown workout id ${id}`).toBeDefined()
        expect(table.has(w!.file), `week ${week.week}: ${w!.file} not in calendar`).toBe(true)
      }
    }
  })
})

describe('sources', () => {
  it('every Workout.source exists in SOURCES and has a category', () => {
    for (const w of ALL_WORKOUTS) {
      // 'site' marks a labelled composite of several sources (the adaptation
      // workouts, evidence file A1/A10). "Ours" is not a trust category, so it
      // has no SOURCES entry; it must instead name its people and carry a
      // note saying where each part comes from.
      if (w.source === 'site') {
        expect(w.sourceNote, `${w.id}: composite without a sourceNote`).toBeTruthy()
        expect(w.people.length, `${w.id}: composite without named people`).toBeGreaterThan(0)
        for (const person of ['John Wakefield', 'Neal Henderson', 'Peter Schep']) {
          expect(w.people, `${w.id}: composite does not name ${person}`).toContain(person)
        }
        continue
      }
      const source = SOURCES[w.source]
      expect(source, `${w.id}: source "${w.source}" not in SOURCES`).toBeDefined()
      expect(source!.category, `${w.id}: source "${w.source}" has no category`).toBeTruthy()
    }
  })

  it('every <Cite sourceKey="…"> in the components names a SOURCES entry', () => {
    // Cite renders nothing for an unknown key, so a typo would silently drop
    // a citation from the page.
    const dir = join(HERE, 'components')
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.tsx'))) {
      const text = readFileSync(join(dir, f), 'utf-8')
      for (const m of text.matchAll(/sourceKey="([^"]+)"/g)) {
        expect(SOURCES[m[1]], `${f}: unknown sourceKey "${m[1]}"`).toBeDefined()
      }
    }
  })
})

describe('.zwo safety and authorship', () => {
  const files = zwoFilesOnDisk()

  // Text-event messages only, so the header comment can't satisfy the check.
  const messages = (xml: string) =>
    [...xml.matchAll(/<textevent\b[^>]*\bmessage="([^"]*)"/gi)].map((m) => m[1])

  it.each(files)('%s states "seated" and a knee warning in its text events', (file) => {
    const msgs = messages(readFileSync(join(WORKOUTS_DIR, file), 'utf-8'))
    expect(msgs.some((m) => /seated/i.test(m)), 'no text event says "seated"').toBe(true)
    expect(msgs.some((m) => /knee/i.test(m)), 'no text event mentions the knees').toBe(true)
  })

  it.each(files)('%s has <author>Tom Jelen</author>', (file) => {
    expect(readFileSync(join(WORKOUTS_DIR, file), 'utf-8')).toContain('<author>Tom Jelen</author>')
  })
})
