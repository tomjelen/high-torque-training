# Workout visualizations — PLAN (M1, M2, M3 done · pre-merge gate all but consistency-check)

Three-milestone effort to put a cadence-accented power-profile chart on every
workout card of the site. This file is the durable, pick-up-in-a-new-session
plan. **The requirements/regression contract is `documentation/workout-chart.md`
— read it first; this file does not duplicate it.**

Branch: `feat/workout-chart`. Nothing merges to `main` until all three
milestones are done and the pre-merge gate below is cleared.

---

## Where we are

**M1 (done — commit `ea36028` "add WorkoutChart component", + uncommitted
post-review cleanup on top).** Delivered:

- `site/src/components/chart-model.ts` — `Zone`, `ChartBlock`, `ChartPhase`,
  `ChartWorkout` types; `ZONE_FILL` palette; `RAMP_FILL` (neutral grey for
  ramps).
- `site/src/components/WorkoutChart.tsx` — the SVG chart. Pure render, no deps.
  Self-contained ids via `useId()` (no `hatchId` prop). Block separation is a
  right-edge background gap. Cadence accent clustering is **width-only**.
- `site/src/components/chart-examples.ts` — **placeholder** data (idealised,
  NOT real `.zwo` values), dev-only, to be deleted in M2.
- `site/src/components/ChartGallery.tsx` — dev-only `/dev/charts` gallery
  (prototype legend strip + full-mode "how to read" live here for M3 to
  promote).
- `site/src/App.tsx` — plain `/dev/charts` route (not in `prerender.mjs`
  ROUTES, no nav link). `site/src/index.css` — `:root` block mapping the four
  `--color-*` chrome vars to slate values.
- `documentation/workout-chart.md` — the requirements spec.

**M1 design decisions that constrain M2/M3 (do not silently undo):**

- Ramps render `RAMP_FILL`, never zone-coloured (spec req. 5). M2's parser
  must not depend on a ramp's `zone` for colour.
- Cadence accent clustering is by **pixel width only** — no zone check, no
  rep-count cap. Verified equivalent to the original on the whole corpus. The
  sanity table in the spec is the regression test.
- Data colours (zones, amber) are intentionally hardcoded; chrome colours use
  the `:root` vars so a print/light theme can override just those.
- Block separation must stay cosmetic — it must not alter the geometry
  clustering is computed from (spec req. 6).
- The dev-mode hydration console errors are pre-existing (the SPA hydrates
  against an empty dev-template root; production prerender is fine) — not a
  regression, present on every route.
- The failing e2e test `e2e/session-tracker-edits.spec.ts:57` is **pre-existing
  and unrelated** (verified on clean `main`). Don't chase it as M-work.

**M2 (done — uncommitted on `feat/workout-chart`).** Delivered:

- `site/scripts/compute-chart-blocks.mjs` (+ `.d.mts`) — parses every `.zwo`
  into `{ id, title, blocks }` keyed by `.zwo` path relative to the workouts
  dir (same key as the TSS map). Reuses `compute-tss.mjs`'s `extractBlocks`
  (now `export`ed, alongside `parseAttrs`) — no second parser, no XML dep.
- `site/vite.config.ts` + `site/src/vite-env.d.ts` — `__ZWO_WORKOUTS_BLOCKS__`
  build-time `define`, mirroring `__ZWO_WORKOUTS_TSS__`.
- `site/src/components/chart-clustering.ts` — `buildClusters` extracted out of
  `WorkoutChart.tsx` (pure, no React) so the req-4 sanity table is regression-
  tested on real data and the component file stays fast-refresh-clean.
- `site/src/components/ChartGallery.tsx` — repointed at the parsed map;
  `durMin` from Σ block durations, `tss` from `__ZWO_WORKOUTS_TSS__`, a small
  dev-only path→`{tier,expectedClusters}` lookup. `chart-examples.ts`
  **deleted** (no placeholder left for M3 to trip over).
- Tests: `scripts/compute-chart-blocks.test.mjs` (mapping rules + corpus
  invariants) and `src/components/workout-chart-clustering.test.ts` (the
  req-4 sanity table — Staple 5×5→5, SIT 3-set→3, Rüegg→3 — on **real**
  parsed data through the production clusterer). 74 tests green.

**M2 design decisions that constrain M3 (do not silently undo):**

- `zoneForPower` thresholds are `<0.60`→1, `0.60–0.75`→2, `0.76–0.87`→3,
  `0.88–0.95`→4, `0.96–1.05`→5, `≥1.06`→6. Consequence: **110% blocks render
  zone-6 red**, not the placeholder's zone-5 orange. Intentional, per the
  thresholds; not a bug at M3 visual review.
- `cadence: true` is set **iff** the block has a `Cadence`/`CadenceLow`/
  `CadenceHigh` attr, and never on ramps. Rüegg's `MaxEffort` sprints have no
  `Cadence` attr → unflagged → they don't split the set (verified by test).
- `MaxEffort` → `power: MAX_EFFORT_POWER` (1.45, above the ~130% clamp); ramp
  `zone` is a placeholder `1` (unused — `RAMP_FILL`).
- `buildClusters` now lives in `chart-clustering.ts`; `WorkoutChart.tsx`
  imports it. Don't move it back into the component (re-introduces the
  react-refresh warning).
- The dev gallery now renders **real** data; the M2 verification re-check
  superseded by `workout-chart-clustering.test.ts` (authoritative).

**M3 (done — uncommitted on `feat/workout-chart`).** Delivered:

- `site/src/components/chart-data.ts` — the `Workout.file` → parsed-blocks join
  (`chartWorkoutFor`), plus `cadenceLabelFor` (shared with `AdaptationCard`).
  Title from `data.ts` `name`, cadence label from the `data.ts` "Cadence" param
  (the un-collapsed range), never the `.zwo` point value (three-layer read).
- `site/src/components/CollectionCard.tsx`, `AdaptationCard.tsx` — minimal-mode
  `<WorkoutChart>` slotted below `WorkoutParams`, above the source/download row.
  Rendered at a fixed design `width={680}` (== the clustering test's width, so
  live-card cluster counts are correct by construction) with `showAxisLabels=
  {false}`; the SVG is now fluid (`width:100%`, `height:auto`, `maxWidth:svgW`)
  so it scales to any card without a ResizeObserver and stays SSR-pure (req-9).
- `site/src/components/ChartLegend.tsx` + `CadenceHatchSwatch.tsx` — promoted
  from the gallery's `LegendStrip`; one `<ChartLegend>` per section (Collection
  + Adaptation panels). The amber hatch is now a single shared swatch component;
  hatch colours centralised as `CADENCE_HATCH_LINE/BG` in `chart-model.ts`.
- `site/src/components/CollectionPanel.tsx` — full-mode "how to read the chart"
  panel (Staple 5×5) at the top of the Collection; `AdaptationPanel.tsx` — the
  section legend above its card grid.
- `site/src/index.css` — `@media print` override of the four `--color-*` chrome
  vars (dark-on-light); data colours stay theme-invariant (req-10).
- `site/src/App.tsx` — `/dev/charts` route + `ChartGallery` import removed;
  `ChartGallery.tsx` **deleted**; `HOME_LAST_UPDATED` bumped to `2026-05-23`.
- `site/src/components/chart-data.test.ts` — join-key contract test (every
  `Workout.file` resolves; title/label provenance; every cadence-prescribing
  workout has ≥1 flagged block). 78 tests green.

**M3 build-infra fix (was a latent pre-existing breakage):** `tsc -b` failed —
`vite-env.d.ts`'s build-time globals were declared as bare top-level `declare
const`, but `moduleDetection: "force"` (tsconfig.app/test) treats the `.d.ts`
as a module, so they were module-scoped, not ambient. `vite build`/`vitest`
use esbuild (no typecheck) so dev + tests masked it. Fixed by wrapping them in
`export {}` + `declare global`, and adding `src/vite-env.d.ts` to
`tsconfig.test.json`'s `include` (the test project pulled in global-using code
for the first time via the new contract test). **Don't revert to bare
`declare const` here.**

---

## Pre-merge gate (settle before merging the whole feature)

- [x] `/dev/charts` + `ChartGallery`: **removed** (Tom's call, M3) after
  promoting `LegendStrip` + how-to copy into the real panels. The route block,
  the component, and the App import are gone; the bundle/code-split concern goes
  with them.
- [x] Full spec regression checklist (`documentation/workout-chart.md`) —
  verified on the live cards (browser): proportional/no-overflow (req-1),
  intensity ordering (req-2), positive-only cadence mark (req-3), cluster sanity
  Staple 5×5→5 / SIT 3-set→3 on live cards (req-4), neutral ramps (req-5),
  visible block gaps (req-6), minimal=no-chrome / full=self-explanatory (req-7),
  `<title>` a11y (req-8), SSR prerender clean (req-9), print override (req-10).
- [x] `npm run lint && npm run build && npm test` green; `npm run test:e2e`
  green except the known-unrelated `session-tracker-edits:57` (12 pass, that 1
  fails — matches clean `main`).
- [x] Prerender still emits only `/`, `/rationale`, `/about`; sitemap unchanged.
- [x] `HOME_LAST_UPDATED` bumped to `2026-05-23`.
- [ ] **Consistency check (Tom runs this — needs `ANTHROPIC_API_KEY` + a running
  dev/preview server):** `ANTHROPIC_API_KEY=… node site/scripts/check-
  consistency.mjs`. Required by root `CLAUDE.md` after `site/src/` changes;
  I can't run it without the key.

---

## M2 — `.zwo` → chart data — ✅ DONE (see "Where we are")

The spec below is kept for traceability; what shipped is summarised under
"Where we are" → "M2 (done)".

**Goal:** replace `chart-examples.ts` with `ChartBlock[]` parsed from the real
`.zwo` files, so the chart shows true prescriptions.

**Reuse, do not reinvent.** `site/scripts/compute-tss.mjs` already parses
`.zwo` (`extractBlocks`, `parseAttrs`, `sampleBlock`) and `zwo-files.mjs`
walks the workouts dir. Inject the parsed map at build time via Vite `define`,
exactly like `__ZWO_WORKOUTS_TSS__` (see `vite.config.ts` + `compute-tss.mjs`
→ `getTssMap`). Add a sibling `compute-chart-blocks.mjs` (or extend the
existing module) and a `__ZWO_WORKOUTS_BLOCKS__` define. Keep the regex parser;
don't add an XML dependency.

**Key by `.zwo` file path**, not workout id. The placeholder ids
(`t1-staple-3x5`) do not match the site's ids (`t1-staple-short`); the `.zwo`
path is the stable join key (same as the TSS map; `data.ts` workouts carry
`file`).

**Corpus reality (verified):** only `Warmup`, `Cooldown`, `SteadyState`,
`MaxEffort` appear — **no `IntervalsT`**. Only the `Cadence=` attribute appears
— no `CadenceLow/High`. Handle `IntervalsT`/`CadenceLow/High` only if you want
parity with `compute-tss.mjs`; not required by the current corpus.

**Mapping rules** (cross-check against the spec's "M2 contract" section):

| `.zwo` element | → `ChartBlock` |
|---|---|
| `<Warmup Duration PowerLow PowerHigh>` | `{kind:'ramp', fromPower:PowerLow, toPower:PowerHigh, dur:Duration}` (ascending) |
| `<Cooldown Duration PowerLow PowerHigh>` | `{kind:'ramp', fromPower:PowerLow, toPower:PowerHigh, dur:Duration}` (descending — PowerLow>PowerHigh in the files; preserve direction) |
| `<SteadyState Duration Power [Cadence]>` | `{kind:'block', power:Power, zone:zoneForPower(Power), dur:Duration, cadence: hasCadenceAttr}` |
| `<MaxEffort Duration [Cadence]>` | `{kind:'block', zone:6, power:~1.45, dur:Duration, cadence: hasCadenceAttr}` (no Power attr; pick a fixed sprint value — clamp handles >130%) |

- `zone` for ramps is irrelevant to rendering (RAMP_FILL); set any valid value
  and document that it's unused for colour.
- `zoneForPower` thresholds (handoff/`chart-model.ts`): `<0.60`→1,
  `0.60–0.75`→2, `0.76–0.87`→3, `0.88–0.95`→4, `0.96–1.05`→5, `≥1.06`→6.
- **`cadence: true` iff the block has a `Cadence` attribute.** This is the
  single load-bearing field (spec req. 3/4). It also automatically gives the
  Rüegg result: the embedded 1-min sprints have no `Cadence` attr → no flag →
  they don't split the set. Verify on `Ruegg_VO2max_Sprint.zwo`.
- Ignore `<textevent>` children (the regex parser already does).

**Output:** a `ChartWorkout` per file. `blocks` is the deliverable. `title`
can come from the `.zwo` `<name>`; `cadenceLabel` (used only by the a11y
`<title>` and full mode) from the `.zwo` or left undefined for M2 — M3 will
supply the real label from `data.ts`.

**Verification:**

- The spec's clustering sanity table must hold on the **real** parsed data:
  Staple 5×5 → 5, SIT 3-set → 3, Rüegg → 3 (re-check counts at `/dev/charts`
  after pointing the gallery at the parsed map).
- Sum of block durations per workout == the `.zwo` total == the calendar
  duration (the calendar is source of truth for duration — root `CLAUDE.md`).
- Add a vitest under `scripts/**/*.test.mjs` (pattern:
  `extract-workouts-last-updated.test.mjs`) asserting the mapping rules and the
  three cluster counts.
- `chart-examples.ts` now unused by the gallery → it can be deleted here, or at
  the pre-merge gate with the rest of the dev scaffolding.

---

## M3 — site integration

**Goal:** the chart on every real workout card, plus one section legend per
section and a "how to read" panel.

**Files:**

- `site/src/components/CollectionCard.tsx`, `AdaptationCard.tsx` — slot
  `<WorkoutChart mode="minimal" .../>` below `WorkoutParams`, above the
  source/download row. Minimal mode renders no title (the card already shows
  it) — this satisfies spec req. 7 (no duplicated chrome); keep it that way.
- `site/src/components/CollectionPanel.tsx`, `AdaptationPanel.tsx` — one shared
  `<ChartLegend>` per section (promote `ChartGallery`'s `LegendStrip`). Add a
  full-mode "how to read" panel at the top of the Collection (promote
  `ChartGallery`'s how-to block). Promoting the legend should also extract a
  shared cadence-hatch swatch so the amber hatch isn't defined twice (the open
  `/simplify` reuse note).
- `site/src/index.css` — add the deferred `@media print` override of the four
  `--color-*` vars (dark-on-light) so printed workouts read correctly. Lower
  priority; after the chart is in.

**Data wiring:** each `Workout` in `data.ts` has `file`. Look the M2
file-keyed block map up by `file` to build the `ChartWorkout` per card. Add
`blocks` onto the `Workout` type or resolve at render. `cadenceLabel` for the
a11y title comes from the workout's "Cadence" param.

**Width:** pass the card's inner content width as `width`; the chart never
overflows and auto-handles `<380px` (axis labels drop, tighter clustering).
Check how the cards size (Tailwind responsive vs. a measured width) and pick
the simplest that doesn't need a resize observer if avoidable.

**Verification (in addition to the pre-merge gate):**

- Spec regression checklist, and the cluster sanity table on the **live
  cards** (not just the gallery).
- Run the consistency check — root `CLAUDE.md` requires it after `site/src/`
  changes: `ANTHROPIC_API_KEY=… node site/scripts/check-consistency.mjs`
  (needs a running dev/preview server).
- **Bump `HOME_LAST_UPDATED`** in `site/src/App.tsx`: M3 changes what the
  workout-library page shows, which is a library change per `site/CLAUDE.md`.
  Do **not** bump `RATIONALE_LAST_UPDATED` (no evidence change) or touch
  `ZWO_WORKOUTS_LAST_UPDATED` (derived; no `.zwo` edits).
- Decommission the dev scaffolding per the pre-merge gate.

---

## Pointers

- Requirements/regression contract: `documentation/workout-chart.md`
- Original design handoff + mockups: this folder
  (`HANDOFF-claude-code.md`, `*.html`, `workout-chart.jsx`, `workouts-data.jsx`)
- `.zwo` parsing to reuse: `site/scripts/compute-tss.mjs`, `zwo-files.mjs`
- Build-time inject pattern: `site/vite.config.ts` (`define`)
- Card/panel components to integrate into: `site/src/components/`
