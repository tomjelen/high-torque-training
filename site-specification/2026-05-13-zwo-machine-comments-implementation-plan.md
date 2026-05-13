# ZWO machine-readable header comments — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a machine-readable XML header comment to each `.zwo` file (per-file last-updated date plus links back to site/calendar/rationale/llms.txt), and expose a derived `ZWO_WORKOUTS_LAST_UPDATED = max(per-file dates)` for the site to consume.

**Architecture:** Per-file ISO date hand-maintained inside an XML comment between `<?xml ?>` and `<workout_file>`. A new prebuild script reads all `.zwo` files in `workouts/`, computes the max, and writes `site/src/lastUpdated.generated.ts` (gitignored). `App.tsx` re-exports the constant alongside `HOME_LAST_UPDATED`.

**Tech Stack:** Node.js (.mjs script), TypeScript (generated module), Vitest (test), the existing rsync-based prebuild in `site/package.json`.

**Spec:** `site-specification/2026-05-13-zwo-machine-comments-design.md`

---

## File Structure

**New files:**
- `site/scripts/extract-workouts-last-updated.mjs` — Reads all `.zwo` in `../workouts/`, extracts `Last updated:` dates from header comments, writes generated TS module.
- `site/scripts/extract-workouts-last-updated.test.mjs` — Vitest test against fixture directories.
- `site/src/lastUpdated.generated.ts` — Build artefact, gitignored. Exports `ZWO_WORKOUTS_LAST_UPDATED`.

**Modified files:**
- 15 `.zwo` files in `workouts/**/*.zwo` — Add XML header comment with seeded date and link breadcrumbs.
- `site/package.json` — Prepend the extract script to `prebuild`.
- `site/.gitignore` — Ignore `src/lastUpdated.generated.ts`.
- `site/src/App.tsx` — Re-export `ZWO_WORKOUTS_LAST_UPDATED`.
- `site/CLAUDE.md` — Document the new constant and the HOME ≥ ZWO invariant.
- `.claude/skills/zwo/SKILL.md` — Add header-comment requirement + checklist item.
- `CLAUDE.md` (root) — Short pointer in "ZWO file conventions".

---

## Task 1: Add the header comment to one `.zwo` as a pattern reference (Zwift parsing smoke test)

The risk being mitigated: Zwift's XML parser may be non-standard and may choke on comments between the XML declaration and the root element. We add the comment to **one** file first, load it in Zwift, and only proceed to the other 14 once we know it works.

**Files:**
- Modify: `workouts/High Torque - Adaptation/Week1_2x10_65-70rpm.zwo`

- [ ] **Step 1: Get the seed date from git**

```bash
git log -1 --format=%cs -- "workouts/High Torque - Adaptation/Week1_2x10_65-70rpm.zwo"
```

Note the output (an ISO date like `2026-05-10`). This is the seed value for `Last updated:`.

- [ ] **Step 2: Add the header comment**

Edit the file. Between line 1 (`<?xml version="1.0" encoding="UTF-8"?>`) and the next line (`<workout_file>`), insert the comment block. Substitute `<SEED_DATE>` with the date from Step 1:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  High Torque Training — Zwift workout
  Last updated: <SEED_DATE>

  Site:      https://high-torque.jelen.dk/
  Calendar:  https://high-torque.jelen.dk/content/workouts.md
  Rationale: https://high-torque.jelen.dk/content/rationale.md
  LLMs:      https://high-torque.jelen.dk/llms.txt
-->
<workout_file>
```

- [ ] **Step 3: Verify XML still parses**

```bash
xmllint --noout "workouts/High Torque - Adaptation/Week1_2x10_65-70rpm.zwo" && echo "XML OK"
```

Expected: `XML OK`.

If `xmllint` is not installed, fallback:
```bash
node --input-type=module -e "import('fast-xml-parser').then(({XMLParser}) => { const fs=require('fs'); new XMLParser().parse(fs.readFileSync('workouts/High Torque - Adaptation/Week1_2x10_65-70rpm.zwo','utf8')); console.log('XML OK'); })"
```

- [ ] **Step 4: Verify in Zwift**

Copy the file to your Zwift custom workouts folder. Open Zwift, navigate to Custom Workouts, and confirm:

- The workout appears in the list with its correct name.
- Opening it shows the correct intervals (3 blocks at 65-70 rpm, identical to before).
- Starting it runs normally for at least the first interval.

**STOP HERE if Zwift refuses to load the file** or shows a corrupted structure. Revert the edit and investigate — the design assumes XML comments before the root are valid, but Zwift's parser is the authority. If Zwift rejects this, the entire plan needs revisiting (e.g. moving the comment inside `<workout_file>`).

- [ ] **Step 5: Commit**

```bash
git add "workouts/High Torque - Adaptation/Week1_2x10_65-70rpm.zwo"
git commit -m "add machine-readable header comment to Week 1 (pattern reference)"
```

---

## Task 2: Add the header comment to the remaining 14 `.zwo` files

Mechanical repeat of Task 1, parallelised. Each file gets its own git-seeded date.

**Files:**
- Modify: every `.zwo` under `workouts/` except `Week1_2x10_65-70rpm.zwo`

- [ ] **Step 1: Generate the seed-date list**

```bash
find workouts -name '*.zwo' -not -name 'Week1_2x10_65-70rpm.zwo' | sort | while read f; do
  printf "%s  %s\n" "$(git log -1 --format=%cs -- "$f")" "$f"
done
```

Save the output. You should see 14 lines, each `YYYY-MM-DD  workouts/.../File.zwo`.

- [ ] **Step 2: Add the comment block to each file**

For each of the 14 files, add the same block as Task 1 between lines 1 and 2, with `Last updated: <SEED_DATE>` replaced by that file's seed date from Step 1.

The block (same for every file except the date):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  High Torque Training — Zwift workout
  Last updated: <SEED_DATE>

  Site:      https://high-torque.jelen.dk/
  Calendar:  https://high-torque.jelen.dk/content/workouts.md
  Rationale: https://high-torque.jelen.dk/content/rationale.md
  LLMs:      https://high-torque.jelen.dk/llms.txt
-->
<workout_file>
```

- [ ] **Step 3: Verify every file still parses as XML**

```bash
find workouts -name '*.zwo' -print0 | xargs -0 -I{} xmllint --noout "{}" && echo "all XML OK"
```

Expected: `all XML OK` with no error lines above.

- [ ] **Step 4: Verify every file has exactly one `Last updated:` line in the header**

```bash
find workouts -name '*.zwo' | while read f; do
  count=$(grep -c '^  Last updated:' "$f")
  if [ "$count" != "1" ]; then echo "FAIL: $f has $count Last updated lines"; fi
done
echo "check done"
```

Expected: only `check done` printed.

- [ ] **Step 5: Verify all 15 dates are ISO YYYY-MM-DD**

```bash
find workouts -name '*.zwo' | while read f; do
  line=$(grep '^  Last updated:' "$f")
  if ! echo "$line" | grep -qE 'Last updated: [0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
    echo "FAIL: $f → $line"
  fi
done
echo "check done"
```

Expected: only `check done` printed.

- [ ] **Step 6: Commit**

```bash
git add workouts/
git commit -m "add machine-readable header comments to remaining 14 workout files"
```

---

## Task 3: Write the extract-workouts-last-updated.mjs script with a test

TDD: failing test first, then implementation.

**Files:**
- Create: `site/scripts/extract-workouts-last-updated.mjs`
- Create: `site/scripts/extract-workouts-last-updated.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `site/scripts/extract-workouts-last-updated.test.mjs`:

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { extractMaxDate } from './extract-workouts-last-updated.mjs'

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

describe('extractMaxDate', () => {
  let dir
  beforeEach(async () => { dir = await mkdtemp(join(tmpdir(), 'zwo-')) })
  afterEach(async () => { await rm(dir, { recursive: true, force: true }) })

  it('returns the max date across all .zwo files in nested dirs', async () => {
    await mkdir(join(dir, 'A'), { recursive: true })
    await mkdir(join(dir, 'B'), { recursive: true })
    await writeFile(join(dir, 'A', 'one.zwo'), header('2026-01-15'))
    await writeFile(join(dir, 'A', 'two.zwo'), header('2026-05-10'))
    await writeFile(join(dir, 'B', 'three.zwo'), header('2026-03-22'))
    expect(await extractMaxDate(dir)).toBe('2026-05-10')
  })

  it('throws if a .zwo file is missing the Last updated line', async () => {
    await writeFile(join(dir, 'broken.zwo'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<workout_file/>\n`)
    await expect(extractMaxDate(dir)).rejects.toThrow(/Missing or malformed/)
  })

  it('throws if the directory has no .zwo files', async () => {
    await expect(extractMaxDate(dir)).rejects.toThrow(/No \.zwo files/)
  })

  it('ignores non-.zwo files', async () => {
    await writeFile(join(dir, 'real.zwo'), header('2026-04-01'))
    await writeFile(join(dir, 'readme.md'), '# not a workout')
    expect(await extractMaxDate(dir)).toBe('2026-04-01')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd site && npx vitest run scripts/extract-workouts-last-updated.test.mjs
```

Expected: FAIL with "Cannot find module './extract-workouts-last-updated.mjs'" or similar.

- [ ] **Step 3: Write the implementation**

Create `site/scripts/extract-workouts-last-updated.mjs`:

```javascript
#!/usr/bin/env node
// Reads all .zwo files under workouts/, extracts the "Last updated: YYYY-MM-DD"
// line from each header comment, and writes site/src/lastUpdated.generated.ts
// exporting the max date as ZWO_WORKOUTS_LAST_UPDATED.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_WORKOUTS_DIR = join(__dirname, '..', '..', 'workouts')
const OUTPUT_PATH = join(__dirname, '..', 'src', 'lastUpdated.generated.ts')

const LAST_UPDATED_RE = /^\s*Last updated:\s*(\d{4}-\d{2}-\d{2})\s*$/m

async function findZwoFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) files.push(...(await findZwoFiles(p)))
    else if (e.isFile() && e.name.endsWith('.zwo')) files.push(p)
  }
  return files
}

export async function extractMaxDate(workoutsDir = DEFAULT_WORKOUTS_DIR) {
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

async function main() {
  const maxDate = await extractMaxDate()
  const banner = '// AUTO-GENERATED by site/scripts/extract-workouts-last-updated.mjs. Do not edit.'
  const body = `export const ZWO_WORKOUTS_LAST_UPDATED = '${maxDate}'\n`
  await writeFile(OUTPUT_PATH, `${banner}\n${body}`)
  console.log(`Wrote ZWO_WORKOUTS_LAST_UPDATED=${maxDate} to ${OUTPUT_PATH}`)
}

const invokedDirectly = import.meta.url === `file://${process.argv[1]}`
if (invokedDirectly) {
  main().catch((err) => { console.error(err); process.exit(1) })
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd site && npx vitest run scripts/extract-workouts-last-updated.test.mjs
```

Expected: 4 tests PASS.

- [ ] **Step 5: Run the script against the real workouts directory**

```bash
cd site && node scripts/extract-workouts-last-updated.mjs
```

Expected output (date will reflect the max of your real seeded dates):
```
Wrote ZWO_WORKOUTS_LAST_UPDATED=<DATE> to .../site/src/lastUpdated.generated.ts
```

- [ ] **Step 6: Verify the generated file**

```bash
cat site/src/lastUpdated.generated.ts
```

Expected (the date may vary):
```
// AUTO-GENERATED by site/scripts/extract-workouts-last-updated.mjs. Do not edit.
export const ZWO_WORKOUTS_LAST_UPDATED = '<DATE>'
```

- [ ] **Step 7: Commit**

```bash
git add site/scripts/extract-workouts-last-updated.mjs site/scripts/extract-workouts-last-updated.test.mjs
git commit -m "add extract-workouts-last-updated script with vitest coverage"
```

(The generated `.ts` file is intentionally not committed — Task 4 will gitignore it.)

---

## Task 4: Wire the script into prebuild and gitignore the generated module

**Files:**
- Modify: `site/package.json` (the `prebuild` script)
- Modify: `site/.gitignore`

- [ ] **Step 1: Add the generated file to `site/.gitignore`**

Append to `site/.gitignore`:

```
# Generated by scripts/extract-workouts-last-updated.mjs
src/lastUpdated.generated.ts
```

- [ ] **Step 2: Verify the generated file is now ignored**

```bash
cd /home/jelen/code/jelen/high-torque-training && git check-ignore -v site/src/lastUpdated.generated.ts
```

Expected: prints the gitignore line that matches (something like `site/.gitignore:N:src/lastUpdated.generated.ts ...`).

- [ ] **Step 3: Untrack the generated file if it was previously staged**

```bash
git rm --cached site/src/lastUpdated.generated.ts 2>/dev/null || true
```

Safe no-op if it was never tracked.

- [ ] **Step 4: Prepend the extract script to `prebuild` in `site/package.json` and add a `predev` hook**

Edit `site/package.json`. The current `prebuild` line is:

```json
"prebuild": "rsync -a --delete --delete-excluded --include='*/' --include='*.zwo' --exclude='*' ../workouts/ public/workouts && cd public/workouts && zip -r high-torque-workouts.zip . && cd ../.. && mkdir -p public/content && cp ../research/high-torque-training-research.md public/content/rationale.md && cp ../research/training-calendar.md public/content/workouts.md && node scripts/generate-tss.mjs",
```

Replace with (only change: prepend `node scripts/extract-workouts-last-updated.mjs && ` to the value):

```json
"prebuild": "node scripts/extract-workouts-last-updated.mjs && rsync -a --delete --delete-excluded --include='*/' --include='*.zwo' --exclude='*' ../workouts/ public/workouts && cd public/workouts && zip -r high-torque-workouts.zip . && cd ../.. && mkdir -p public/content && cp ../research/high-torque-training-research.md public/content/rationale.md && cp ../research/training-calendar.md public/content/workouts.md && node scripts/generate-tss.mjs",
```

Then add a new `predev` script alongside (between `dev` and `prebuild` is a natural spot):

```json
"predev": "node scripts/extract-workouts-last-updated.mjs",
```

This ensures `npm run dev` works from a fresh checkout where the gitignored generated file doesn't yet exist.

- [ ] **Step 5: Delete the existing generated file and run prebuild end-to-end**

```bash
cd site && rm -f src/lastUpdated.generated.ts && npm run prebuild
```

Expected: prebuild completes without error. Output includes the `Wrote ZWO_WORKOUTS_LAST_UPDATED=...` line.

- [ ] **Step 6: Verify the generated file exists after prebuild**

```bash
cat site/src/lastUpdated.generated.ts
```

Expected: shows the AUTO-GENERATED banner and the export.

- [ ] **Step 7: Commit**

```bash
git add site/package.json site/.gitignore
git commit -m "run extract-workouts-last-updated during prebuild; gitignore the output"
```

---

## Task 5: Re-export `ZWO_WORKOUTS_LAST_UPDATED` from App.tsx

The constant is now generated. Make it consumable from the same place as `HOME_LAST_UPDATED` for future site code.

**Files:**
- Modify: `site/src/App.tsx:15-16`

- [ ] **Step 1: Add the re-export**

Edit `site/src/App.tsx`. Find:

```typescript
export const HOME_LAST_UPDATED = '2026-05-02'
export const RATIONALE_LAST_UPDATED = '2026-04-30'
```

Add immediately after:

```typescript
export { ZWO_WORKOUTS_LAST_UPDATED } from './lastUpdated.generated'
```

- [ ] **Step 2: Verify the build succeeds**

```bash
cd site && npm run build
```

Expected: build completes, no TypeScript errors. (The generated module is created by prebuild, which `npm run build` triggers automatically.)

- [ ] **Step 3: Verify the dev server starts**

```bash
cd site && timeout 6s npm run dev 2>&1 | tee /tmp/dev.log &
sleep 4
curl -s http://localhost:5173/ > /dev/null && echo "dev server responding"
# Wait for timeout to kill the dev server
wait
grep -iE 'error|cannot find' /tmp/dev.log && echo "ERRORS PRESENT" || echo "no errors"
```

Expected: `dev server responding` and `no errors`. (If your dev port is not 5173, adjust.)

- [ ] **Step 4: Commit**

```bash
git add site/src/App.tsx
git commit -m "re-export ZWO_WORKOUTS_LAST_UPDATED from App.tsx"
```

---

## Task 6: Document the convention in `site/CLAUDE.md` and root `CLAUDE.md`

**Files:**
- Modify: `site/CLAUDE.md` (under "Last updated dates")
- Modify: `CLAUDE.md` (root, under "ZWO file conventions")

- [ ] **Step 1: Update `site/CLAUDE.md`**

In `site/CLAUDE.md`, find the bullet list under "## Last updated dates" that ends with:

```markdown
- `RATIONALE_LAST_UPDATED` — rationale page
```

Add immediately after that bullet:

```markdown
- `ZWO_WORKOUTS_LAST_UPDATED` — **generated**, not hand-maintained. Derived as `max()` of the `Last updated:` dates inside each `workouts/*.zwo` header comment. Re-exported from `App.tsx` for site features that need to detect new workouts. Do not edit the generated file (`src/lastUpdated.generated.ts`) — it's a build artefact written by `scripts/extract-workouts-last-updated.mjs` during prebuild.
```

Then, at the bottom of the same "## Last updated dates" section (immediately before the next `##` heading), add:

```markdown
### Invariant: HOME ≥ ZWO

`HOME_LAST_UPDATED` must always be `≥` `ZWO_WORKOUTS_LAST_UPDATED`. The workouts are a strict subset of what the workout-library page shows — any workout edit means the library has changed, so `HOME_LAST_UPDATED` should be bumped at the same time. The reverse is not true: the calendar narrative around the workouts can change without any `.zwo` changing.

The invariant is documented, not code-enforced. If it ever drifts, add an assertion in `scripts/extract-workouts-last-updated.mjs`.
```

- [ ] **Step 2: Update root `CLAUDE.md`**

In `CLAUDE.md` (root), find the section "## ZWO file conventions". Add this bullet at the end of that section's bullet list:

```markdown
- Each `.zwo` file carries a machine-readable XML header comment between `<?xml ?>` and `<workout_file>`, with a hand-maintained `Last updated: YYYY-MM-DD` line and breadcrumb links to the site, calendar, rationale, and `/llms.txt`. **Bump the date on any content edit to that workout** (same semantics as `HOME_LAST_UPDATED` in `site/CLAUDE.md`). The site-level `ZWO_WORKOUTS_LAST_UPDATED` is derived as `max()` of these dates by `site/scripts/extract-workouts-last-updated.mjs` during prebuild.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md site/CLAUDE.md
git commit -m "document ZWO header comment convention and HOME>=ZWO invariant"
```

---

## Task 7: Encode the header-comment rule in the zwo skill

The zwo skill auto-loads whenever a `.zwo` is being edited. This is the load-bearing place to make sure future edits don't forget the comment or the date bump.

**Files:**
- Modify: `.claude/skills/zwo/SKILL.md`

- [ ] **Step 1: Add the "Machine-readable header comment" section**

Edit `.claude/skills/zwo/SKILL.md`. After the "## Author" section (currently lines 12-14, ending with `Always \`<author>Tom Jelen</author>\`.`) and before the "## Naming" section, insert:

```markdown
## Machine-readable header comment (required)

Every `.zwo` file in `workouts/` must carry an XML comment between the `<?xml ?>` declaration and the `<workout_file>` root element:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  High Torque Training — Zwift workout
  Last updated: YYYY-MM-DD

  Site:      https://high-torque.jelen.dk/
  Calendar:  https://high-torque.jelen.dk/content/workouts.md
  Rationale: https://high-torque.jelen.dk/content/rationale.md
  LLMs:      https://high-torque.jelen.dk/llms.txt
-->
<workout_file>
\`\`\`

Constraints:

- The `Last updated:` line is the first content line of the comment. `site/scripts/extract-workouts-last-updated.mjs` depends on its position and the `YYYY-MM-DD` format.
- The four URLs are exactly as above. Do not substitute the HTML pages (`/`, `/rationale`) for the markdown URLs — the markdown URLs are deliberate (primary audience is machines).
- Do not write the literal string "Last updated:" elsewhere in the file (e.g. inside a `<description>` or `<textevent>`), because the extractor uses a multiline regex and would pick up the first match.
```

- [ ] **Step 2: Add the date-bump rule to the validation checklist**

In the same file, find the "## Validation checklist" section and its numbered list ending with item 12. Append item 13:

```markdown
13. **`Last updated:` date is current.** If this edit changed any content of the workout (interval added/removed, duration/cadence/intensity tweaked, description corrected, text-event typo fixed, file renamed), bump the date in the header comment to today's date. Do not bump for cosmetic edits to the header comment itself (e.g. fixing a URL typo). Same semantics as `HOME_LAST_UPDATED` in `site/CLAUDE.md`.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/zwo/SKILL.md
git commit -m "encode required ZWO header comment in zwo skill"
```

---

## Final verification (after all tasks)

- [ ] **Step 1: All 15 .zwo files have a valid header**

```bash
find workouts -name '*.zwo' | wc -l    # expect 15
find workouts -name '*.zwo' | while read f; do
  grep -qE '^  Last updated: [0-9]{4}-[0-9]{2}-[0-9]{2}$' "$f" || echo "FAIL $f"
done
echo "header check done"
```

Expected: `15`, then only `header check done`.

- [ ] **Step 2: Prebuild generates the constant cleanly from a clean state**

```bash
cd site && rm -f src/lastUpdated.generated.ts && npm run prebuild && cat src/lastUpdated.generated.ts
```

Expected: prebuild succeeds, file is regenerated.

- [ ] **Step 3: Build + dev both succeed**

```bash
cd site && npm run build
```

Expected: build completes with no errors.

- [ ] **Step 4: Vitest is green**

```bash
cd site && npx vitest run scripts/extract-workouts-last-updated.test.mjs
```

Expected: 4 tests PASS.

- [ ] **Step 5: Consistency check still passes (if `ANTHROPIC_API_KEY` available)**

```bash
cd site && npm run dev &
sleep 3
ANTHROPIC_API_KEY=... node scripts/check-consistency.mjs
kill %1
```

Expected: exit 0. (Optional — skip if no API key handy. The change touches `.zwo` headers and a generated TS module, not the page content the consistency check compares.)

- [ ] **Step 6: `git status` is clean**

```bash
git status
```

Expected: clean tree, with the generated `.ts` file present locally but ignored.
