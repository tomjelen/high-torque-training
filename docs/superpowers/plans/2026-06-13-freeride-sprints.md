# FreeRide Sprints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unreliable `MaxEffort` sprint blocks (which deadlock against ERG mode — the "spiral of death") with native `FreeRide` blocks that automatically disable ERG for the sprint and re-enable it afterward, with no rider intervention.

**Architecture:** `FreeRide` is the well-supported Zwift construct that turns ERG off for the block's duration and restores it after. The conversion is a pure *mechanism* change — durations, attribution, intensity class, cadence prescription, and all coaching text are preserved. The same one-line shape change is needed in the two build-time `.zwo` parsers (`compute-tss.mjs`, `compute-chart-blocks.mjs`), which currently **throw** on any block type they don't recognize, so the parsers must learn `FreeRide` before the workout files change or the site build breaks.

**Tech Stack:** Zwift `.zwo` XML, Node ES-module build scripts, Vitest, Vite `define`, React/TS site.

---

## Why this is correct (traceability)

- The death spiral needs a **power target** for ERG to chase: cadence drops → ERG raises resistance to hold watts → cadence drops further → lockup. A block with no target physically cannot spiral. Seeing a spiral *during* `MaxEffort` proves it is **not** removing the target on the rider's setup.
- The community format reference documents `MaxEffort` as `Duration`-only (no `Cadence`, no child elements) — barely supported — while our files hang `Cadence` and text events on it. `FreeRide` is widely used, supports `Cadence` + nested text events, and is explicitly "a riding mode without ERG control."
- Sources: [Zwift Insider – ERG mode](https://zwiftinsider.com/erg-mode-in-zwift/), [Slowtwitch – ERG with max sprints](https://forum.slowtwitch.com/t/zwift-erg-mode-with-max-sprints-how-best-to-handle-the-workouts/774701), [h4l/zwift-workout-file-reference](https://github.com/h4l/zwift-workout-file-reference).

## What is NOT changing

- Source attribution (Hebisz & Hebisz 2024; EF Pro Cycling / Schep / Rüegg) — unchanged. This is a mechanism fix, not a protocol or intensity-class change.
- Block durations → `FreeRide Duration` = old `MaxEffort Duration`, 1:1. No calendar/duration impact.
- TSS values → `FreeRide` is modelled at the same 1.5×FTP as `MaxEffort`, so computed TSS is byte-for-byte identical.
- Chart appearance → `FreeRide` maps to the same zone-6 / `MAX_EFFORT_POWER` bar, with the high-torque cadence flag preserved exactly (flagged when `Cadence` present, unflagged for Rüegg). The sprints still render as max efforts — this is the explicit point of the `FreeRide` branch in Task 1.

## Affected blocks (the corpus)

| File | Sprint blocks | Cadence attr? | Becomes |
|---|---|---|---|
| `workouts/High Torque - Tier 4 Advanced/SIT_2sets.zwo` | 8 × `MaxEffort Duration="30" Cadence="55"` | yes | `FreeRide Duration="30" FlatRoad="1" Cadence="55"` |
| `workouts/High Torque - Tier 4 Advanced/SIT_3sets.zwo` | 12 × `MaxEffort Duration="30" Cadence="55"` | yes | `FreeRide Duration="30" FlatRoad="1" Cadence="55"` |
| `workouts/High Torque - Tier 3 Challenging/Ruegg_VO2max_Sprint.zwo` | 3 × `MaxEffort Duration="60"` | no | `FreeRide Duration="60" FlatRoad="1"` |

`FlatRoad="1"` makes each sprint run on flat, controlled resistance the rider gears against, instead of following whatever in-game gradient is under the avatar (which would make the sprint feel random). The parsers ignore `FlatRoad`; it is purely Zwift-side.

`site/public/workouts/` is a **gitignored build artifact** (rsync mirror via `build-public-assets.mjs`) — do not hand-edit it; it regenerates in Task 5.

## RESOLVED DECISIONS

**Rüegg's VO2max blocks stay in ERG** (confirmed by Tom 2026-06-13). ERG holding 110% FTP @ 55 rpm is exactly what keeps the block high-torque; only the 1-min sprint after each VO2max block flips to `FreeRide`. The VO2max `SteadyState` blocks are **not** converted (the chart parser maps every `FreeRide` to a zone-6 max sprint, so converting them would render the VO2max blocks as max sprints and corrupt the chart).

**The "ride in slope/resistance mode" MODE NOTE text events are dropped, not rewritten** (confirmed by Tom 2026-06-13). With `FreeRide` toggling ERG off/on automatically, that instruction is obsolete and confusing. This applies to **all three** workouts — Rüegg *and* both SIT files carry the same now-obsolete note. The "be in a hard gear at 50-60rpm" gear cue already lives in other warmup/recovery text events, so nothing important is lost by deleting the MODE NOTE.

---

### Task 1: Teach the build-time parsers about `FreeRide`

**Files:**
- Modify: `site/scripts/compute-tss.mjs:7` and `:62`
- Modify: `site/scripts/compute-chart-blocks.mjs:69`
- Test: `site/scripts/compute-chart-blocks.test.mjs`

- [ ] **Step 1: Write failing tests for `FreeRide` mapping**

In `site/scripts/compute-chart-blocks.test.mjs`, inside `describe('blocksFromZwo — mapping rules', …)`, add after the existing `MaxEffort` tests:

```js
  it('maps FreeRide to a zone-6 sprint block at the fixed sprint power (same as MaxEffort)', () => {
    const { blocks } = blocksFromZwo(
      wrap('<FreeRide Duration="60" FlatRoad="1" />'),
      'x.zwo',
    )
    expect(blocks).toEqual([
      { kind: 'block', zone: 6, power: MAX_EFFORT_POWER, dur: 60 },
    ])
  })

  it('flags FreeRide with Cadence (SIT sprints) but not without (Rüegg sprints)', () => {
    const flagged = blocksFromZwo(
      wrap('<FreeRide Duration="30" FlatRoad="1" Cadence="55" />'),
      'x.zwo',
    ).blocks
    const unflagged = blocksFromZwo(
      wrap('<FreeRide Duration="60" FlatRoad="1" />'),
      'x.zwo',
    ).blocks
    expect(flagged[0].cadence).toBe(true)
    expect(unflagged[0].cadence).toBeUndefined()
  })
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `cd site && npx vitest run scripts/compute-chart-blocks.test.mjs`
Expected: FAIL — the new tests throw `Unknown ZWO block type: "FreeRide"` (from `compute-tss.mjs` `extractBlocks`, which `compute-chart-blocks.mjs` reuses).

- [ ] **Step 3: Add `FreeRide` to the known block types and its TSS sampling**

In `site/scripts/compute-tss.mjs`, line 7, add `'FreeRide'`:

```js
const KNOWN_BLOCK_TYPES = new Set(['Warmup', 'Cooldown', 'SteadyState', 'IntervalsT', 'MaxEffort', 'FreeRide'])
```

In the same file, `sampleBlock`, change the `MaxEffort` branch (currently line 62) so `FreeRide` shares it (identical 1.5×FTP model → TSS unchanged):

```js
  if (type === 'MaxEffort' || type === 'FreeRide') {
    // No power attribute — sprint at ~150% FTP (reasonable estimate for TSS purposes)
    return Array(dur).fill(1.5)
  }
```

- [ ] **Step 4: Add the `FreeRide` case to the chart parser**

In `site/scripts/compute-chart-blocks.mjs`, change the `MaxEffort` branch (currently line 69) so `FreeRide` shares it. The comment is load-bearing — it records *why* FreeRide is treated as a max sprint so the chart keeps looking like a max effort:

```js
  // FreeRide and MaxEffort both render as the tallest zone-6 sprint bar. Every
  // FreeRide in this library IS a max-effort sprint authored as FreeRide so it
  // escapes ERG (MaxEffort deadlocks ERG — the "spiral of death"). Mapping it to
  // MAX_EFFORT_POWER keeps the chart identical to the old MaxEffort rendering.
  if (type === 'MaxEffort' || type === 'FreeRide') {
    const block = { kind: 'block', zone: 6, power: MAX_EFFORT_POWER, dur }
    if (hasCadence(attrs)) block.cadence = true
    return block
  }
```

- [ ] **Step 5: Run the tests, verify they pass**

Run: `cd site && npx vitest run scripts/compute-chart-blocks.test.mjs`
Expected: PASS, including the two new tests and all existing ones.

- [ ] **Step 6: Commit**

```bash
git add "site/scripts/compute-tss.mjs" "site/scripts/compute-chart-blocks.mjs" "site/scripts/compute-chart-blocks.test.mjs"
git commit -m "Teach .zwo build parsers about FreeRide blocks (maps like MaxEffort)"
```

---

### Task 2: Convert the three workouts to `FreeRide`

**Files:**
- Modify: `workouts/High Torque - Tier 4 Advanced/SIT_2sets.zwo`
- Modify: `workouts/High Torque - Tier 4 Advanced/SIT_3sets.zwo`
- Modify: `workouts/High Torque - Tier 3 Challenging/Ruegg_VO2max_Sprint.zwo`

**The max-effort marker comment.** Each file gets this XML comment placed once, immediately before its **first** `<FreeRide>` sprint block, so a future reader/agent knows these are deliberate max efforts (not recovery free-rides) and won't "fix" them back to `MaxEffort`:

```xml
        <!-- The FreeRide blocks below ARE max-effort sprints. They use FreeRide, not
             MaxEffort, because MaxEffort deadlocks with ERG (the "spiral of death");
             FreeRide auto-releases ERG for the sprint and restores it after. The chart
             parser maps FreeRide -> zone-6 max sprint, so they still render as max
             efforts. Do not convert these back to MaxEffort. -->
```

- [ ] **Step 1: SIT_2sets — replace every sprint block tag + add the marker comment**

In `SIT_2sets.zwo`, replace all 8 occurrences of the opening tag
`<MaxEffort Duration="30" Cadence="55">` with
`<FreeRide Duration="30" FlatRoad="1" Cadence="55">`,
and every matching `</MaxEffort>` with `</FreeRide>`. Leave every nested `<textevent …/>` exactly as-is. Insert the max-effort marker comment (above) immediately before the **first** `<FreeRide>` block (the one under `<!-- Set 1 -->`).

- [ ] **Step 2: SIT_2sets — delete the obsolete MODE NOTE text event**

Delete the entire warmup MODE NOTE line (`timeoffset="1080"`):

`<textevent timeoffset="1080" duration="25" message="MODE NOTE: These sprints are maximal — ERG mode caps effort at the target wattage. Use slope/resistance mode so you can actually go all-out. Gear selection is intentional here." />`

No replacement — `FreeRide` toggles ERG automatically, and the hard-gear / 50-60rpm cue already appears in the warmup ("First sprint in 1 minute. Find your gear. Hard gear.") and recovery events.

- [ ] **Step 3: SIT_2sets — bump the header date**

Change `Last updated: 2026-05-23` to `Last updated: 2026-06-13` (line 4).

- [ ] **Step 4: SIT_3sets — same three edits**

In `SIT_3sets.zwo`: replace all 12 `<MaxEffort Duration="30" Cadence="55">` → `<FreeRide Duration="30" FlatRoad="1" Cadence="55">` and `</MaxEffort>` → `</FreeRide>`; insert the max-effort marker comment before the **first** `<FreeRide>` block; **delete** the MODE NOTE (`timeoffset="1080"`, same obsolete text as SIT_2sets) entirely, no replacement; bump `Last updated: 2026-05-23` → `2026-06-13`.

- [ ] **Step 5: Ruegg — replace the sprint block tags (no Cadence attr)**

In `Ruegg_VO2max_Sprint.zwo`, replace all 3 `<MaxEffort Duration="60">` → `<FreeRide Duration="60" FlatRoad="1">` and `</MaxEffort>` → `</FreeRide>`. Insert the max-effort marker comment before the **first** `<FreeRide>` block (the sprint after Set 1's VO2max block). Leave the three `SteadyState` VO2max blocks untouched (they stay ERG). Leave nested text events as-is.

- [ ] **Step 6: Ruegg — delete the obsolete MODE NOTE text event**

Delete the entire warmup MODE NOTE line (`timeoffset="510"`):

`<textevent timeoffset="510" duration="30" message="MODE NOTE: The sprints reach 150% FTP — ERG mode will not deliver a natural sprint feel at that intensity. Ride this workout in slope/resistance mode and manage gear yourself." />`

No replacement. The VO2max blocks stay in ERG (no instruction needed); the sprint is `FreeRide` (ERG auto-releases); the "shift to a lighter gear" cue for the sprint already appears in the description and the sprint's own text events ("SPRINT. Maximal effort... Any cadence — seated or standing.").

- [ ] **Step 7: Ruegg — bump the header date**

Change `Last updated: 2026-05-23` → `2026-06-13` (line 4).

- [ ] **Step 8: Verify no `MaxEffort` remains, the marker comment is present, and XML is well-formed**

Run:
```bash
for f in "workouts/High Torque - Tier 4 Advanced/SIT_2sets.zwo" "workouts/High Torque - Tier 4 Advanced/SIT_3sets.zwo" "workouts/High Torque - Tier 3 Challenging/Ruegg_VO2max_Sprint.zwo"; do
  echo "$f: MaxEffort=$(grep -c MaxEffort "$f") marker=$(grep -c 'ARE max-effort sprints' "$f")"
  xmllint --noout "$f" && echo "  xmllint OK"
done
```
Expected for each file: `MaxEffort=0`, `marker=1`, `xmllint OK` (every `<FreeRide>` has a matching `</FreeRide>`).

- [ ] **Step 9: Commit**

```bash
git add "workouts/High Torque - Tier 4 Advanced/SIT_2sets.zwo" "workouts/High Torque - Tier 4 Advanced/SIT_3sets.zwo" "workouts/High Torque - Tier 3 Challenging/Ruegg_VO2max_Sprint.zwo"
git commit -m "Convert sprint blocks from MaxEffort to FreeRide (fixes ERG spiral of death)"
```

---

### Task 3: Update both ZWO skills

**Files:**
- Modify: `.claude/skills/zwo-format/SKILL.md` (format mechanics)
- Modify: `.claude/skills/zwo/SKILL.md` (project conventions)

The `zwo-format` skill currently *mandates* `MaxEffort` for sprints; left unchanged, the next session reintroduces the bug. The `zwo` project skill has no sprint guidance at all and must carry the project convention (use `FreeRide`, add the marker comment, why it renders as a max effort). Capture the empirical *why* in both (project transparency rule).

- [ ] **Step 1: Rewrite the frontmatter hint**

Line 3 `description:` — change the trailing clause `or max effort/sprint blocks (MaxEffort element)` to `or max effort/sprint blocks (FreeRide element)`.

- [ ] **Step 2: Rewrite the example block** (lines ~35-37 in the XML structure sample)

```xml
        <FreeRide Duration="30" FlatRoad="1" Cadence="55">
            <textevent timeoffset="0" message="GO. Maximal effort — ERG is off, just gear up."/>
        </FreeRide>
```

- [ ] **Step 3: Rewrite the "Max effort blocks" subsection** (lines ~50-61)

Replace it with:

```markdown
### Max effort blocks — use `FreeRide`, not `MaxEffort` or `SteadyState`

For all-out sprint blocks, use `FreeRide`:

​```xml
<FreeRide Duration="30" FlatRoad="1" Cadence="55">
    <textevent timeoffset="0" message="GO. Maximal effort." />
</FreeRide>
​```

- **Do not** use `SteadyState Power="1.50"` (or any high fraction): ERG caps output at the target, preventing a true all-out sprint.
- **Do not** use `MaxEffort` either. It is *supposed* to disable ERG, but it is barely-supported (the format reference documents only a `Duration` attribute, no child elements) and in practice ERG stays engaged on real setups — producing the cadence/resistance "spiral of death" during the sprint. This was hit empirically in the High Torque SIT and Rüegg workouts (2026-06-13).
- `FreeRide` is the native block that **automatically turns ERG off** for its duration and back on afterward, with no rider intervention. It supports nested text events and a `Cadence` attribute.
- `FlatRoad="1"` gives flat, controlled resistance the rider gears against, instead of following the in-game gradient.
- Keep the `Cadence` attribute when the source prescribes a sprint cadence (it drives the HUD target and the chart's high-torque flag). Omit it when the source leaves sprint cadence unconstrained (e.g. Rüegg).
- Drop `Power` entirely — a free-ride block has no target.
```

- [ ] **Step 4: Fix the Common Mistakes table row** (line ~124)

Change the row to:

```markdown
| `SteadyState Power="1.50"` or `MaxEffort` for a sprint | Use `FreeRide Duration="..." FlatRoad="1"` — `SteadyState` ERG-caps the effort; `MaxEffort` is supposed to disable ERG but doesn't reliably, causing the spiral of death. `FreeRide` toggles ERG off and back on automatically. |
```

- [ ] **Step 5: `zwo` skill — add a "Max-effort sprints" section**

In `.claude/skills/zwo/SKILL.md`, add a new section after "## Cadence placement" (project conventions, distinct from the format mechanics in `zwo-format`):

```markdown
## Max-effort sprints — `FreeRide`, marked as deliberate

All-out sprints use `FreeRide` (format mechanics: see `zwo-format`). Two project rules on top of that:

- **Marker comment.** A `FreeRide` normally means "easy free spin," but ours are the opposite — max efforts. Place an XML comment before the first sprint block stating they ARE max-effort sprints authored as `FreeRide` to escape ERG (`MaxEffort` deadlocks ERG — the spiral of death), and to not convert them back. This stops a future refactor from "fixing" them.
- **Chart rendering.** The chart parser (`site/scripts/compute-chart-blocks.mjs`) maps every `FreeRide` → a zone-6 max sprint at `MAX_EFFORT_POWER`, so sprints still render as the tallest bar — identical to the old `MaxEffort`. Keep the `Cadence` attribute on cadence-prescribed sprints (e.g. SIT 55 rpm) so the chart's high-torque hatch is preserved; omit it where the source leaves cadence free (Rüegg).
```

- [ ] **Step 6: `zwo` skill — add a validation-checklist item**

In the "## Validation checklist" list, append:

```markdown
15. **Sprints use `FreeRide`, not `MaxEffort`,** and the first sprint block is preceded by the max-effort marker comment. Keep `Cadence` on cadence-prescribed sprints; omit it on free-cadence sprints.
```

- [ ] **Step 7: Commit**

```bash
git add ".claude/skills/zwo-format/SKILL.md" ".claude/skills/zwo/SKILL.md"
git commit -m "ZWO skills: prescribe FreeRide over MaxEffort for sprints, with the why"
```

---

### Task 4: Update the chart spec + visualization docs

**Files:**
- Modify: `documentation/workout-chart.md` (around lines 175-177)
- Modify: `site-specification/Workout-visualizations/PLAN.md` (lines ~78-80, 173, 184)
- Modify: `site-specification/Workout-visualizations/HANDOFF-claude-code.md` (line ~118)

These describe the parsing contract; leaving them naming `MaxEffort` makes the docs contradict the code (project traceability rule).

- [ ] **Step 1: `documentation/workout-chart.md`** — in the bullet explaining the Rüegg case, change "the embedded `MaxEffort` sprints in Rüegg carry no `Cadence` attribute" to "the embedded `FreeRide` sprints in Rüegg carry no `Cadence` attribute". If a nearby sentence enumerates handled block types, add `FreeRide` alongside `MaxEffort` (both map identically).

- [ ] **Step 2: `site-specification/Workout-visualizations/PLAN.md`** — at each `MaxEffort` reference (the `power: MAX_EFFORT_POWER` rule, the block-type table row, and the "Rüegg's `MaxEffort` sprints have no Cadence" line), note that `FreeRide` is now the sprint block and maps identically to `MaxEffort`. Keep `MaxEffort` mentioned as the legacy form the parser still accepts.

- [ ] **Step 3: `site-specification/Workout-visualizations/HANDOFF-claude-code.md`** — line ~118, change `<MaxEffort Duration=… >` to `<FreeRide …>` / `<MaxEffort …>` → zone-6 sprint.

- [ ] **Step 4: Commit**

```bash
git add documentation/workout-chart.md site-specification/Workout-visualizations/PLAN.md site-specification/Workout-visualizations/HANDOFF-claude-code.md
git commit -m "Docs: FreeRide is the sprint block type for the chart parser"
```

---

### Task 5: Bump home date, regenerate artifacts, full verification

**Files:**
- Modify: `site/src/App.tsx:16`

- [ ] **Step 1: Bump `HOME_LAST_UPDATED`**

In `site/src/App.tsx`, change `export const HOME_LAST_UPDATED = '2026-05-23'` to `'2026-06-13'`. (Workout library content changed; the `HOME ≥ ZWO` invariant in `site/CLAUDE.md` requires this. `ZWO_WORKOUTS_LAST_UPDATED` derives automatically from the bumped `.zwo` headers.)

- [ ] **Step 2: Run the full site test suite**

Run: `cd site && npx vitest run`
Expected: PASS. The Rüegg corpus tests in `compute-chart-blocks.test.mjs` still pass because the converted `FreeRide` sprints still map to `MAX_EFFORT_POWER` (their `b.power === MAX_EFFORT_POWER` filter is unchanged). If a test *comment* still says "MaxEffort sprints" for the Rüegg case, update the comment to "FreeRide sprints" for accuracy and re-run.

- [ ] **Step 3: Full build — proves both parsers accept `FreeRide` and the date injection works**

Run: `cd site && npm run build`
Expected: success, no `Unknown ZWO block type` / `Unhandled ZWO block type` throw. `prebuild` regenerates `site/public/workouts/` (now containing the `FreeRide` files + refreshed zip), and `tsc -b`/`vite build` inject the derived `ZWO_WORKOUTS_LAST_UPDATED`.

- [ ] **Step 4: Sanity-check the derived date and the artifact**

Run:
```bash
node site/scripts/extract-workouts-last-updated.mjs 2>/dev/null || node -e "import('./site/scripts/extract-workouts-last-updated.mjs').then(m=>m.getZwoWorkoutsLastUpdated().then(d=>console.log('ZWO_WORKOUTS_LAST_UPDATED =', d)))"
grep -c "FreeRide" "site/public/workouts/High Torque - Tier 4 Advanced/SIT_2sets.zwo"
```
Expected: derived date is `2026-06-13`; the regenerated public artifact contains `FreeRide` (8 for SIT_2sets).

- [ ] **Step 5: Commit**

```bash
git add "site/src/App.tsx"
git commit -m "Bump HOME_LAST_UPDATED for the FreeRide sprint conversion"
```

- [ ] **Step 6 (optional): Consistency check**

Per project `CLAUDE.md`, after a `site/src/` change run the consistency check. A date bump won't create contradictions, so this is a low-value confirmation here; run only if convenient (needs `ANTHROPIC_API_KEY` + a running preview server):

```bash
cd site && npm run dev   # in one shell
ANTHROPIC_API_KEY=… node site/scripts/check-consistency.mjs
```

---

## Self-Review

- **Spec coverage:** Diagnosis/why (header) → research already done; parser break + the "still looks like a max effort in the chart" requirement → Task 1; the three workouts + marker comment + MODE NOTE deletions + dates → Task 2; **both** skills (`zwo-format` + `zwo`) that would otherwise re-introduce the bug → Task 3; chart/spec docs → Task 4; home date + regenerate + build/test gate → Task 5. Both decisions (Rüegg VO2max stays ERG; obsolete MODE NOTEs dropped across all three files) are RESOLVED per Tom's input.
- **Two extra asks folded in (Tom, 2026-06-13):** (1) in-file marker comment that these `FreeRide` blocks are really max efforts → Task 2 + verified in Step 8; (2) sprints must still chart as max efforts → already the point of Task 1's `FreeRide`→zone-6 mapping, now documented in the parser comment; (3) update *both* ZWO skills → Task 3.
- **No placeholders:** every code/text change is given verbatim.
- **Type consistency:** `FreeRide` maps to the exact `{ kind:'block', zone:6, power:MAX_EFFORT_POWER, dur, cadence? }` shape `MaxEffort` already produces — no `chart-model.ts` type change, no chart-render change. TSS uses the same 1.5 model — TSS values unchanged.
