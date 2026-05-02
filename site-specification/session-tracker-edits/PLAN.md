# Session Tracker — Edit & Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the rider to delete a log entry and to change the date on an existing log entry, so they can fix mistakes and backdate a session they forgot to log.

**Architecture:** Per-row UI state (delete-confirm pending, edit-mode draft date) lives in a new `TrackerLogEntry` component. The two new mutations on the log (`deleteEntry`, `setEntryDate`) live as handlers in `CollectionPanel` parallel to the existing `handleDidThis`, and pass down through `SessionTracker` → `TrackerLog` → `TrackerLogEntry`. Date semantics: a date pick replaces only the `YYYY-MM-DD` portion of the ISO string and uses noon UTC for the time, which is TZ-safe (noon UTC lands on the same calendar day in every populated time zone, and the existing `formatDateLabel` reads only the UTC date portion).

**Tech Stack:** React 18, TypeScript, Tailwind 4, Vitest, Playwright. Desktop-only — hover-revealed controls are acceptable per `site/CLAUDE.md`.

**UX decisions locked in:**
- **Delete confirmation:** inline two-step (first click on `✕` swaps the row into "click again to delete · cancel" inline state). Matches the in-house popover idiom; no native dialog.
- **Edit affordance:** the date label itself is clickable. On hover the date label gets `cursor-pointer` and a color change to signal it.
- **Date semantics:** date-only. Saved timestamp is `${YYYY-MM-DD}T12:00:00.000Z` (noon UTC). The original time-of-day is discarded — per user instruction, place at mid-day if a time is needed.
- **Buttons:** every new `<button>` must include `cursor-pointer` (or `cursor-not-allowed` when disabled) so it passes `src/button-cursor.test.ts`.

**File structure:**

| File | Responsibility |
|------|----------------|
| `site/src/components/TrackerLogEntry.tsx` (new) | One row in the log. Owns its own per-row UI state (idle / confirming-delete / editing). Receives `entry`, `onDelete(id)`, `onSetDate(id, isoDate)`. |
| `site/src/components/TrackerLog.tsx` (modify) | List shell + "view full log" toggle. Renders `TrackerLogEntry` per visible entry. Forwards handlers. |
| `site/src/components/SessionTracker.tsx` (modify) | Adds `onDeleteEntry`, `onSetEntryDate` props; forwards to `TrackerLog`. |
| `site/src/components/CollectionPanel.tsx` (modify) | Defines `handleDeleteEntry(id)` and `handleSetEntryDate(id, isoDate)` mutators. Passes them to `SessionTracker`. |
| `site/e2e/session-tracker-edits.spec.ts` (new) | Playwright e2e tests for delete + edit-date flow. |

---

## Task 1: Extract `TrackerLogEntry` component (mechanical refactor, no behavior change)

The row gains per-row UI state in Tasks 2 and 3. Extracting it now keeps that state local instead of forcing the parent to track per-id maps.

**Files:**
- Create: `site/src/components/TrackerLogEntry.tsx`
- Modify: `site/src/components/TrackerLog.tsx`

- [ ] **Step 1: Create `TrackerLogEntry.tsx` containing the existing row markup**

```tsx
import type { AnnotatedEntry } from './TrackerLog'

function formatGap(days: number): string {
  const val = days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`
  return `+${val}`
}

interface Props {
  entry: AnnotatedEntry
}

export default function TrackerLogEntry({ entry }: Props) {
  const { name, isHard, dateLabel, gap } = entry
  return (
    <li className="flex items-baseline gap-2 text-xs">
      <span
        className={`flex-shrink-0 w-2 h-2 rounded-full mt-0.5 ${
          isHard ? 'bg-orange-500' : 'bg-green-500'
        }`}
      />
      <span className="text-slate-500 flex-shrink-0 w-12">{dateLabel}</span>
      <span className="text-slate-300 truncate flex-1 min-w-0">{name}</span>
      {gap !== null && (
        <span className="text-slate-600 flex-shrink-0 font-mono">{formatGap(gap)}</span>
      )}
    </li>
  )
}
```

- [ ] **Step 2: Update `TrackerLog.tsx` to delegate row rendering to `TrackerLogEntry`**

Replace the inline `<li>...</li>` block (lines 38–50 of the current file) and remove the now-unused `formatGap` helper.

```tsx
import { useState } from 'react'
import TrackerLogEntry from './TrackerLogEntry'

export interface AnnotatedEntry {
  id: string
  name: string
  isHard: boolean
  dateLabel: string
  gap: number | null
}

const INITIAL_SHOW = 5

interface Props {
  entries: AnnotatedEntry[]
}

export default function TrackerLog({ entries }: Props) {
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? entries : entries.slice(0, INITIAL_SHOW)
  const hasMore = entries.length > INITIAL_SHOW

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 m-0">
        Recent entries
      </p>
      {entries.length === 0 ? (
        <p className="text-slate-600 text-xs italic m-0">No sessions logged yet.</p>
      ) : (
        <>
          <ul className="space-y-2 m-0 p-0 list-none">
            {visible.map((entry) => (
              <TrackerLogEntry key={entry.id} entry={entry} />
            ))}
          </ul>
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showAll ? '↑ show fewer' : `view full log → (${entries.length})`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Activate Node and verify the existing test suite still passes**

Run:

```bash
export FNM_PATH="/home/jelen/.local/share/fnm" && export PATH="$FNM_PATH:$PATH" && eval "$(fnm env --use-on-cd --shell bash)"
cd site && npm test
```

Expected: all vitest tests pass (including `button-cursor.test.ts`, which scans all components).

- [ ] **Step 4: Verify the type checker still passes**

Run:

```bash
cd site && npx tsc -b
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add site/src/components/TrackerLogEntry.tsx site/src/components/TrackerLog.tsx
git commit -m "refactor: extract TrackerLogEntry from TrackerLog"
```

---

## Task 2: Add delete with inline two-step confirmation (TDD via Playwright)

**Files:**
- Create: `site/e2e/session-tracker-edits.spec.ts`
- Modify: `site/src/components/CollectionPanel.tsx`
- Modify: `site/src/components/SessionTracker.tsx`
- Modify: `site/src/components/TrackerLog.tsx`
- Modify: `site/src/components/TrackerLogEntry.tsx`

- [ ] **Step 1: Write the failing e2e test**

```ts
// site/e2e/session-tracker-edits.spec.ts
import { test, expect, type Page } from '@playwright/test'

async function logFirstWorkout(page: Page) {
  await page.getByRole('button', { name: 'Did this!' }).first().click()
}

test.describe('Session tracker — delete and edit date', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('delete: two-step inline confirmation removes the entry', async ({ page }) => {
    await logFirstWorkout(page)

    // Entry now visible in the tracker log.
    const log = page.getByRole('region', { name: 'Session tracker log' })
    await expect(log.getByRole('listitem')).toHaveCount(1)

    // First click: enter confirming state. Entry still present.
    await log.getByRole('button', { name: 'Delete entry' }).first().click()
    await expect(log.getByRole('button', { name: 'Confirm delete' })).toBeVisible()
    await expect(log.getByRole('button', { name: 'Cancel delete' })).toBeVisible()
    await expect(log.getByRole('listitem')).toHaveCount(1)

    // Second click on Confirm: entry removed.
    await log.getByRole('button', { name: 'Confirm delete' }).click()
    await expect(log.getByRole('listitem')).toHaveCount(0)
    await expect(log.getByText('No sessions logged yet.')).toBeVisible()
  })

  test('delete: cancel returns the row to idle without deleting', async ({ page }) => {
    await logFirstWorkout(page)
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await log.getByRole('button', { name: 'Delete entry' }).click()
    await log.getByRole('button', { name: 'Cancel delete' }).click()

    await expect(log.getByRole('listitem')).toHaveCount(1)
    await expect(log.getByRole('button', { name: 'Confirm delete' })).not.toBeVisible()
    await expect(log.getByRole('button', { name: 'Delete entry' })).toBeVisible()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd site && npx playwright test session-tracker-edits.spec.ts
```

Expected: tests fail (the role `region` named "Session tracker log" does not yet exist; no Delete button).

- [ ] **Step 3: Add an `aria-label`'d `<section>` wrapper around the log so tests can scope to it**

Modify `site/src/components/TrackerLog.tsx`. Replace the outer `<div>` with `<section aria-label="Session tracker log">`:

```tsx
return (
  <section aria-label="Session tracker log">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 m-0">
      Recent entries
    </p>
    {/* ...rest unchanged... */}
  </section>
)
```

- [ ] **Step 4: Add `handleDeleteEntry` to `CollectionPanel.tsx` and pass it down**

```tsx
function handleDeleteEntry(id: string) {
  setState((prev) => ({ ...prev, log: prev.log.filter((e) => e.id !== id) }))
}
```

Pass it as a prop to `SessionTracker`:

```tsx
<SessionTracker
  state={state}
  onDeleteEntry={handleDeleteEntry}
/>
```

- [ ] **Step 5: Plumb `onDeleteEntry` through `SessionTracker.tsx`**

Update the `Props` interface and pass it to `TrackerLog`:

```tsx
interface Props {
  state: AppState
  onDeleteEntry: (id: string) => void
}

export default function SessionTracker({ state, onDeleteEntry }: Props) {
  // ...existing memos unchanged...
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
      {/* ...header / counter / strip unchanged... */}
      <TrackerLog entries={annotatedEntries} onDeleteEntry={onDeleteEntry} />
    </div>
  )
}
```

- [ ] **Step 6: Plumb `onDeleteEntry` through `TrackerLog.tsx`**

```tsx
interface Props {
  entries: AnnotatedEntry[]
  onDeleteEntry: (id: string) => void
}

export default function TrackerLog({ entries, onDeleteEntry }: Props) {
  // ...
  {visible.map((entry) => (
    <TrackerLogEntry key={entry.id} entry={entry} onDelete={onDeleteEntry} />
  ))}
  // ...
}
```

- [ ] **Step 7: Implement delete UI in `TrackerLogEntry.tsx`**

Replace the file body with a version that owns `mode` state for the two-step pattern. The `✕` button is hidden by default and revealed via `group-hover:opacity-100` / `group-focus-within:opacity-100`. When `mode === 'confirming'`, the row's right side swaps to inline `Confirm delete` / `Cancel delete` controls.

```tsx
import { useState } from 'react'
import type { AnnotatedEntry } from './TrackerLog'

function formatGap(days: number): string {
  const val = days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`
  return `+${val}`
}

interface Props {
  entry: AnnotatedEntry
  onDelete: (id: string) => void
}

type Mode = 'idle' | 'confirming-delete'

export default function TrackerLogEntry({ entry, onDelete }: Props) {
  const { id, name, isHard, dateLabel, gap } = entry
  const [mode, setMode] = useState<Mode>('idle')

  return (
    <li className="group flex items-baseline gap-2 text-xs">
      <span
        className={`flex-shrink-0 w-2 h-2 rounded-full mt-0.5 ${
          isHard ? 'bg-orange-500' : 'bg-green-500'
        }`}
      />
      <span className="text-slate-500 flex-shrink-0 w-12">{dateLabel}</span>
      <span className="text-slate-300 truncate flex-1 min-w-0">{name}</span>

      {mode === 'idle' && gap !== null && (
        <span className="text-slate-600 flex-shrink-0 font-mono">{formatGap(gap)}</span>
      )}

      {mode === 'idle' && (
        <button
          type="button"
          aria-label="Delete entry"
          onClick={() => setMode('confirming-delete')}
          className="flex-shrink-0 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity cursor-pointer"
        >
          ✕
        </button>
      )}

      {mode === 'confirming-delete' && (
        <span className="flex-shrink-0 flex items-center gap-2">
          <button
            type="button"
            aria-label="Confirm delete"
            onClick={() => onDelete(id)}
            className="text-red-400 hover:text-red-300 cursor-pointer"
          >
            delete?
          </button>
          <button
            type="button"
            aria-label="Cancel delete"
            onClick={() => setMode('idle')}
            className="text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            cancel
          </button>
        </span>
      )}
    </li>
  )
}
```

- [ ] **Step 8: Run the e2e tests to verify they pass**

```bash
cd site && npx playwright test session-tracker-edits.spec.ts
```

Expected: both delete tests pass.

- [ ] **Step 9: Run vitest and tsc to verify no regressions**

```bash
cd site && npm test && npx tsc -b
```

Expected: pass.

- [ ] **Step 10: Commit**

```bash
git add site/e2e/session-tracker-edits.spec.ts \
        site/src/components/CollectionPanel.tsx \
        site/src/components/SessionTracker.tsx \
        site/src/components/TrackerLog.tsx \
        site/src/components/TrackerLogEntry.tsx
git commit -m "feat: delete entries from the session tracker"
```

---

## Task 3: Edit date with inline date picker (TDD via Playwright)

**Files:**
- Modify: `site/e2e/session-tracker-edits.spec.ts`
- Modify: `site/src/components/CollectionPanel.tsx`
- Modify: `site/src/components/SessionTracker.tsx`
- Modify: `site/src/components/TrackerLog.tsx`
- Modify: `site/src/components/TrackerLogEntry.tsx`

- [ ] **Step 1: Write the failing e2e tests**

Append to `site/e2e/session-tracker-edits.spec.ts`. Two helpers added at top of file (see snippet — keep existing `logFirstWorkout`).

```ts
import type { AppState } from '../src/types'

async function seedLog(page: Page, log: AppState['log']) {
  await page.evaluate((entries) => {
    const existing = JSON.parse(localStorage.getItem('ht-state') ?? '{}')
    localStorage.setItem('ht-state', JSON.stringify({ ...existing, log: entries }))
  }, log)
  await page.reload()
}

function isoAtNoon(yyyyMmDd: string): string {
  return `${yyyyMmDd}T12:00:00.000Z`
}
```

Add these tests inside the existing `test.describe`:

```ts
test('edit date: clicking the date opens an editor; saving updates the row', async ({ page }) => {
  await seedLog(page, [
    { id: 'a', workoutId: 't1-entry', timestamp: isoAtNoon('2026-05-01') },
  ])
  const log = page.getByRole('region', { name: 'Session tracker log' })

  await log.getByRole('button', { name: /Edit date/ }).click()

  const dateInput = log.getByLabel('New date')
  await expect(dateInput).toBeVisible()
  await expect(dateInput).toHaveValue('2026-05-01')

  await dateInput.fill('2026-04-28')
  await log.getByRole('button', { name: 'Save date' }).click()

  // Row label updates; persisted via localStorage round-trip.
  await expect(log.getByText('Apr 28')).toBeVisible()
  await expect(log.getByText('May 1')).not.toBeVisible()

  const stored = await page.evaluate(() => localStorage.getItem('ht-state'))
  expect(stored).toContain('"timestamp":"2026-04-28T12:00:00.000Z"')
})

test('edit date: cancel discards the draft', async ({ page }) => {
  await seedLog(page, [
    { id: 'a', workoutId: 't1-entry', timestamp: isoAtNoon('2026-05-01') },
  ])
  const log = page.getByRole('region', { name: 'Session tracker log' })

  await log.getByRole('button', { name: /Edit date/ }).click()
  await log.getByLabel('New date').fill('2026-04-01')
  await log.getByRole('button', { name: 'Cancel edit' }).click()

  await expect(log.getByText('May 1')).toBeVisible()
})

test('edit date: save is disabled when the date input is empty', async ({ page }) => {
  await seedLog(page, [
    { id: 'a', workoutId: 't1-entry', timestamp: isoAtNoon('2026-05-01') },
  ])
  const log = page.getByRole('region', { name: 'Session tracker log' })

  await log.getByRole('button', { name: /Edit date/ }).click()
  await log.getByLabel('New date').fill('')

  await expect(log.getByRole('button', { name: 'Save date' })).toBeDisabled()
})

test('edit date: backdating re-sorts the log', async ({ page }) => {
  await seedLog(page, [
    { id: 'a', workoutId: 't1-entry', timestamp: isoAtNoon('2026-05-02') },
    { id: 'b', workoutId: 't1-staple-short', timestamp: isoAtNoon('2026-05-01') },
  ])
  const log = page.getByRole('region', { name: 'Session tracker log' })

  // Initial order: 'a' (May 2) above 'b' (May 1).
  const itemsBefore = await log.getByRole('listitem').allTextContents()
  expect(itemsBefore[0]).toContain('May 2')
  expect(itemsBefore[1]).toContain('May 1')

  // Backdate 'b' to Apr 25 — should not move (already last).
  // Instead backdate 'a' to Apr 25 → 'a' falls below 'b'.
  await log.getByRole('listitem').nth(0).getByRole('button', { name: /Edit date/ }).click()
  await log.getByLabel('New date').fill('2026-04-25')
  await log.getByRole('button', { name: 'Save date' }).click()

  const itemsAfter = await log.getByRole('listitem').allTextContents()
  expect(itemsAfter[0]).toContain('May 1')
  expect(itemsAfter[1]).toContain('Apr 25')
})

test('delete: removing entries below threshold hides the "view full log" toggle', async ({
  page,
}) => {
  // Seed 6 entries on distinct days so the toggle is initially visible.
  const seed = Array.from({ length: 6 }, (_, i) => ({
    id: `e${i}`,
    workoutId: 't1-entry',
    timestamp: isoAtNoon(`2026-04-${String(20 + i).padStart(2, '0')}`),
  }))
  await seedLog(page, seed)
  const log = page.getByRole('region', { name: 'Session tracker log' })

  await expect(log.getByRole('button', { name: /view full log/ })).toBeVisible()

  // Delete two entries → 4 remain → toggle hides.
  for (let i = 0; i < 2; i++) {
    await log.getByRole('button', { name: 'Delete entry' }).first().click()
    await log.getByRole('button', { name: 'Confirm delete' }).click()
  }
  await expect(log.getByRole('listitem')).toHaveCount(4)
  await expect(log.getByRole('button', { name: /view full log/ })).not.toBeVisible()
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd site && npx playwright test session-tracker-edits.spec.ts
```

Expected: the four new tests fail (`Edit date` button does not exist; `New date` input does not exist; `Save date` / `Cancel edit` do not exist). The "view full log" toggle test will pass for the seeding setup but fail at the post-delete assertion (the toggle currently always renders if `entries.length > INITIAL_SHOW` was ever true — actually it re-renders correctly since it's derived from current `entries.length`. Verify behavior in the next step.)

- [ ] **Step 3: Add `handleSetEntryDate` to `CollectionPanel.tsx` and pass it down**

```tsx
function handleSetEntryDate(id: string, isoDate: string) {
  // isoDate is YYYY-MM-DD from the date input. Replace the date portion of
  // the existing ISO timestamp with `${isoDate}T12:00:00.000Z` (noon UTC).
  // Noon UTC is TZ-safe — same calendar day in every populated time zone —
  // and matches how `formatDateLabel` reads only the UTC date portion.
  setState((prev) => ({
    ...prev,
    log: prev.log.map((e) =>
      e.id === id ? { ...e, timestamp: `${isoDate}T12:00:00.000Z` } : e,
    ),
  }))
}
```

Pass it to `SessionTracker`:

```tsx
<SessionTracker
  state={state}
  onDeleteEntry={handleDeleteEntry}
  onSetEntryDate={handleSetEntryDate}
/>
```

- [ ] **Step 4: Plumb `onSetEntryDate` through `SessionTracker.tsx` and `TrackerLog.tsx`**

`SessionTracker.tsx`:

```tsx
interface Props {
  state: AppState
  onDeleteEntry: (id: string) => void
  onSetEntryDate: (id: string, isoDate: string) => void
}

// inside body:
<TrackerLog
  entries={annotatedEntries}
  onDeleteEntry={onDeleteEntry}
  onSetEntryDate={onSetEntryDate}
/>
```

`TrackerLog.tsx`:

```tsx
interface Props {
  entries: AnnotatedEntry[]
  onDeleteEntry: (id: string) => void
  onSetEntryDate: (id: string, isoDate: string) => void
}

// inside body:
{visible.map((entry) => (
  <TrackerLogEntry
    key={entry.id}
    entry={entry}
    onDelete={onDeleteEntry}
    onSetDate={onSetEntryDate}
  />
))}
```

- [ ] **Step 5: Extend `AnnotatedEntry` and `SessionTracker` to expose the raw ISO date for the entry**

The date input needs a `YYYY-MM-DD` initial value. The cleanest source is the existing entry's ISO string. Add the raw ISO date to the annotated row.

In `TrackerLog.tsx`:

```tsx
export interface AnnotatedEntry {
  id: string
  name: string
  isHard: boolean
  dateLabel: string
  isoDate: string // YYYY-MM-DD
  gap: number | null
}
```

In `SessionTracker.tsx`, populate `isoDate`:

```tsx
const annotatedEntries = useMemo((): AnnotatedEntry[] => {
  return sortedLog.map((entry, i) => {
    const prev = sortedLog[i + 1]
    const gap = prev
      ? roundHalfDay(
          (new Date(entry.timestamp).getTime() - new Date(prev.timestamp).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null
    return {
      id: entry.id,
      name: WORKOUT_META.get(entry.workoutId)?.name ?? entry.workoutId,
      isHard: isHardWorkout(entry.workoutId),
      dateLabel: formatDateLabel(entry.timestamp),
      isoDate: entry.timestamp.slice(0, 10),
      gap,
    }
  })
}, [sortedLog])
```

- [ ] **Step 6: Implement edit-date UI in `TrackerLogEntry.tsx`**

Extend the `Mode` union and add a draft date state. Replace the file body:

```tsx
import { useState } from 'react'
import type { AnnotatedEntry } from './TrackerLog'

function formatGap(days: number): string {
  const val = days % 1 === 0 ? `${days}d` : `${days.toFixed(1)}d`
  return `+${val}`
}

interface Props {
  entry: AnnotatedEntry
  onDelete: (id: string) => void
  onSetDate: (id: string, isoDate: string) => void
}

type Mode = 'idle' | 'confirming-delete' | 'editing-date'

export default function TrackerLogEntry({ entry, onDelete, onSetDate }: Props) {
  const { id, name, isHard, dateLabel, isoDate, gap } = entry
  const [mode, setMode] = useState<Mode>('idle')
  const [draftDate, setDraftDate] = useState(isoDate)

  function startEditing() {
    setDraftDate(isoDate)
    setMode('editing-date')
  }

  function saveDate() {
    if (!draftDate) return
    onSetDate(id, draftDate)
    setMode('idle')
  }

  return (
    <li className="group flex items-baseline gap-2 text-xs">
      <span
        className={`flex-shrink-0 w-2 h-2 rounded-full mt-0.5 ${
          isHard ? 'bg-orange-500' : 'bg-green-500'
        }`}
      />

      {mode === 'editing-date' ? (
        <>
          <label className="sr-only" htmlFor={`date-${id}`}>
            New date
          </label>
          <input
            id={`date-${id}`}
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-200 font-mono"
          />
          <span className="text-slate-300 truncate flex-1 min-w-0">{name}</span>
          <button
            type="button"
            aria-label="Save date"
            onClick={saveDate}
            disabled={!draftDate}
            className={`flex-shrink-0 ${
              draftDate
                ? 'text-green-400 hover:text-green-300 cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            save
          </button>
          <button
            type="button"
            aria-label="Cancel edit"
            onClick={() => setMode('idle')}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            cancel
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            aria-label={`Edit date for ${name}`}
            onClick={startEditing}
            className="text-slate-500 hover:text-slate-300 flex-shrink-0 w-12 text-left cursor-pointer"
          >
            {dateLabel}
          </button>
          <span className="text-slate-300 truncate flex-1 min-w-0">{name}</span>

          {mode === 'idle' && gap !== null && (
            <span className="text-slate-600 flex-shrink-0 font-mono">{formatGap(gap)}</span>
          )}

          {mode === 'idle' && (
            <button
              type="button"
              aria-label="Delete entry"
              onClick={() => setMode('confirming-delete')}
              className="flex-shrink-0 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity cursor-pointer"
            >
              ✕
            </button>
          )}

          {mode === 'confirming-delete' && (
            <span className="flex-shrink-0 flex items-center gap-2">
              <button
                type="button"
                aria-label="Confirm delete"
                onClick={() => onDelete(id)}
                className="text-red-400 hover:text-red-300 cursor-pointer"
              >
                delete?
              </button>
              <button
                type="button"
                aria-label="Cancel delete"
                onClick={() => setMode('idle')}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                cancel
              </button>
            </span>
          )}
        </>
      )}
    </li>
  )
}
```

Notes embedded in this code:
- The date label is now a `<button>` with `aria-label="Edit date for {name}"` so the test selector `name: /Edit date/` matches it.
- The save button uses `cursor-not-allowed` when `draftDate` is empty, satisfying `button-cursor.test.ts`.
- The visible date column width (`w-12`) is kept on the button so the layout doesn't shift when toggling modes.

- [ ] **Step 7: Run the e2e tests to verify they pass**

```bash
cd site && npx playwright test session-tracker-edits.spec.ts
```

Expected: all tests pass (delete + edit + re-sort + threshold).

- [ ] **Step 8: Run vitest and tsc**

```bash
cd site && npm test && npx tsc -b
```

Expected: pass — `button-cursor.test.ts` validates the new `<button>` elements have cursor classes; tsc validates the new prop types are wired through correctly.

- [ ] **Step 9: Manually exercise the feature in a browser**

```bash
cd site && npm run dev
```

In the browser:
1. Click "Did this!" on a workout card and confirm the entry appears in the tracker.
2. Hover the row — the `✕` should appear on the right.
3. Click `✕` → row swaps to `delete? · cancel`. Click `cancel` — row returns to idle. Click `✕` again then `delete?` — row disappears.
4. Click "Did this!" again. Click the date label — date input appears with today's date. Pick a date 3 days back, click `save`. The row's date label updates and (if applicable) the row re-sorts.
5. Reload the page — changes persist via localStorage.

- [ ] **Step 10: Commit**

```bash
git add site/e2e/session-tracker-edits.spec.ts \
        site/src/components/CollectionPanel.tsx \
        site/src/components/SessionTracker.tsx \
        site/src/components/TrackerLog.tsx \
        site/src/components/TrackerLogEntry.tsx
git commit -m "feat: edit the date of session tracker entries"
```

---

## Task 4: Consistency check and final sweep

**Files:** none modified — this task is verification only.

- [ ] **Step 1: Run the consistency check**

The repo CLAUDE.md requires this after `site/src/` changes. The dev server must already be running (from Task 3 manual exercise) and `ANTHROPIC_API_KEY` must be set in the environment.

```bash
cd /home/jelen/code/jelen/high-torque-training && \
  ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY node site/scripts/check-consistency.mjs
```

Expected: exit 0 (no contradictions). The change is purely UI/state and does not alter training claims, so a pass is the expected outcome. If the script fails, read its output and address the specific contradiction; do not bypass.

- [ ] **Step 2: Confirm `HOME_LAST_UPDATED` is current**

`HOME_LAST_UPDATED` in `site/src/App.tsx` is `'2026-05-02'` (today). No bump needed.

- [ ] **Step 3: Run the full test suite once more end-to-end**

```bash
cd site && npm test && npx playwright test && npx tsc -b && npm run lint
```

Expected: all green.

- [ ] **Step 4: Final review of `git status` and `git diff`**

```bash
git status && git diff main..HEAD --stat
```

Confirm the change set is exactly: 1 new component file, 1 new e2e test file, 4 modified component files, no incidental edits.

---

## Self-review notes

- **Spec coverage:** delete (Task 2), edit-date (Task 3), backdating-causes-resort (Task 3 test), persistence (Task 3 step 5 + manual exercise) — all covered.
- **Type consistency:** `onDeleteEntry` / `onSetEntryDate` are the names used at every layer (`CollectionPanel` → `SessionTracker` → `TrackerLog`); the `TrackerLogEntry` props are `onDelete` / `onSetDate` (shorter at the leaf where the rename is unambiguous). Confirmed identical across Steps 4–6 of Task 3.
- **Date semantics:** isoDate is always `YYYY-MM-DD`; persisted timestamp is always `${isoDate}T12:00:00.000Z`; display reads `timestamp.slice(0, 10)`. No `new Date(...)` round-trip on the user-picked date — TZ-safe.
- **No placeholders:** every step contains executable code or commands.
