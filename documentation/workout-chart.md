# WorkoutChart — the workout visualization

`site/src/components/WorkoutChart.tsx` (+ `chart-model.ts`) draws one Zwift
workout as a single picture so a rider can grasp the shape of a session at a
glance — and, above all, **see where the high-torque (prescribed-cadence) work
is**. That last point is the whole reason this component exists and is not a
generic power-profile chart.

The audience for this doc is **a future Claude (or human) recreating,
refactoring, or extending this component**. It records *what the chart must
communicate and why*, separated from *how it currently happens to look*. Use it
to decide whether a proposed change violates a requirement or merely changes an
incidental. If a change keeps every requirement below true, it is safe no matter
how different the result looks.

The rule of thumb the requirements are written to support: **the exact RGB of
grey doesn't matter, the exact dimensions don't matter, horizontal vs vertical
doesn't matter. What matters is that the meaning survives.**

## What it's for

The project is about low-cadence, high-torque, seated cycling intervals. A rider
about to do a session needs to answer, before clipping in:

- How long and how hard is this, roughly, and how is it broken up?
- **Where in the session am I supposed to be grinding a big gear at low
  cadence?** (vs. just spinning easy / warming up / recovering)

A generic power chart answers the first. The cadence accent answers the second,
which is the one this site uniquely cares about.

## Requirements — preserve these

Any reimplementation must keep all of these true. They are stated in terms of
*what the reader can perceive*, not pixels.

1. **One workout, time-ordered, proportionally.** The chart shows exactly one
   session as its blocks in their real order, each block's extent proportional
   to its share of total session time. A long interval looks long; a 30 s sprint
   looks short. The whole session is visible at once with no scroll and no
   overflow of its container.

2. **High vs. low intensity is distinguishable, and ordered.** A reader can tell
   hard efforts from easy ones and roughly rank them. FTP is the reference
   threshold: efforts above FTP vs. below FTP are distinguishable, because
   "over/under threshold" is a meaningful training distinction. The *encoding*
   (bar height, colour, both, something else) is replaceable; the
   *distinguishability and ordering* are not.

3. **High-torque prescription is positively marked; its absence carries no
   claim.** Intervals where a specific cadence is prescribed are marked with a
   distinct, consistent signal (today: an amber hatched rule). Intervals with no
   cadence prescription get *nothing*. This asymmetry is deliberate: absence of
   the mark means "nothing prescribed here" (warmup, cooldown, recoveries,
   free-cadence efforts), **not** "free cadence is prescribed here." Never add a
   positive "free cadence" marker — it would falsely imply a prescription the
   workout doesn't make. The cadence mark is the single most important element
   of the chart; if a change makes it hard to find or ambiguous, that's a
   regression.

4. **A set reads as one high-torque region, not a barcode.** Sprint/interval
   sets produce many short alternating work/rest blocks (e.g. SIT 3×(4×30 s) =
   24 blocks). The cadence mark must collapse a *set* into one continuous region:
   adjacent cadence blocks separated only by *short* rests are one mark; sets
   separated by *long* rests are separate marks. The rider should see "a chunk
   of high-torque work here, then a long break, then another chunk," not a
   strobing fence. The concrete, testable expression of this (from the original
   design handoff — keep these as sanity checks):

   | Workout | Expected high-torque regions |
   |---|---|
   | Staple 5×5 (3-min rests) | **5** separate marks (rests too long to merge) |
   | SIT 3×(4×30 s) | **3** marks (one per set; intra-set rests merge) |
   | Rüegg 3×(5 min @110% + 1 min sprint) | **3** marks (the embedded sprints carry no cadence flag, so they don't split the set) |

   The pixel threshold that defines "short" is incidental; the *grouping
   behaviour these counts encode* is the requirement.

5. **Warmup/cooldown ramps are neutral, not intensity-coded.** A ramp sweeps
   across several intensity zones, so colouring it as any one zone is arbitrary
   and would make warmup and cooldown — the same kind of thing — look different.
   Ramps must read as "transition / non-specific," and warmup and cooldown must
   read as the same kind of element. The specific neutral colour is incidental.

6. **Adjacent blocks are visually separable, including same-coloured ones.** A
   reader can always tell where one block ends and the next begins, even when
   neighbours share a fill (warmup ramp into an endurance block; a grey work
   block into a grey cooldown). The *mechanism* for this has changed several
   times (overlay line → per-block outline → background gap) and is fully
   incidental — **but** whatever mechanism is used must not corrupt requirement 4:
   block separation must be cosmetic only and must not shift the true block
   geometry that clustering and the cadence marks are computed from. (Today:
   marks are computed from untouched layout; only the *drawn* width is shrunk.)

7. **Two presentation contexts.** The chart works *embedded* in a host card that
   already shows the workout's title and cadence (it must not duplicate that
   chrome) and *standalone* as a self-explanatory "how to read this" example
   (it must then carry enough labelling — title, a key for the marks — to be
   understood alone). The exact contents of each mode are negotiable; the
   no-duplication-when-embedded and self-explanatory-when-standalone properties
   are not.

8. **It is accessible as an image.** Assistive tech gets at least the session
   identity and whether/what cadence is prescribed. It is never an unlabelled
   graphic. The host card header is the primary reader; this is the fallback.

9. **No new runtime dependencies; pure, SSR-safe render.** The chart is a pure
   function of its props — no data fetching, no effects, no `window`, no
   animation state. It renders identically on the server and client (the site
   prerenders — see `prerendering.md`). Adding a charting library, or making the
   component stateful/effectful, is a requirement violation, not an upgrade.

10. **Semantic colours are theme-invariant; chrome is themeable.** The colours
    that carry workout *meaning* (intensity zones, the cadence accent) are
    intentionally fixed so a given workout looks the same everywhere, including
    in print. Non-data chrome (axis text, baseline, labels) uses theme tokens so
    it can adapt (e.g. a future dark→light print override). Don't tokenize the
    data colours; don't hardcode the chrome colours.

## Explicitly incidental — change freely

None of these are requirements. Changing any of them, alone, is not a
regression, provided the requirements above still hold:

- **Exact colours** — the specific greys, the amber hue, the zone palette
  values. Only their *distinctness, consistency, and theme-invariance* (req. 2,
  3, 5, 10) matter.
- **Exact dimensions and constants** — chart height, the FTP-baseline position,
  the ~130% clamp ceiling, hatch spacing, accent-strip thickness
  (`ACCENT_H_FULL` / `ACCENT_H_MINIMAL` — two values, one per mode), axis-gutter
  width, the narrow-width breakpoint, the cluster pixel threshold. These are
  tuning, not contract. (The clamp exists only so a 150% sprint doesn't blow out
  the scale while staying visibly the tallest thing — any approach with that
  outcome is fine.)
- **Orientation** — horizontal time axis is incidental; a vertical layout that
  preserved every requirement would be equally valid.
- **Rendering tech** — SVG is incidental; canvas or anything else that stays
  dependency-free, SSR-safe, and accessible (req. 8, 9) is fine.
- **The block-separation mechanism** — gap vs. border vs. whatever (req. 6 only
  constrains the *outcome* and the don't-corrupt-geometry rule).
- **What exactly each presentation mode contains** — within the constraints of
  req. 7.
- **Whether the neutral ramp colour is literally the zone-1 grey or a dedicated
  constant** — req. 5 only needs "neutral and consistent."

## Data model and data contract

The chart consumes a `ChartWorkout`: an ordered list of `ChartBlock`s
(`chart-model.ts`). A block is either a steady `block` or a `ramp`
(warmup/cooldown), with a power level as a fraction of FTP, a duration in
seconds, an intensity `zone`, and an optional **`cadence` flag** — the single
most important field, since it drives requirement 3/4.

The data is parsed from the real `.zwo` files at build time by
`site/scripts/compute-chart-blocks.mjs` and injected as the
`__ZWO_WORKOUTS_BLOCKS__` global via Vite's `define` (see `site/vite.config.ts`,
mirroring the existing `__ZWO_WORKOUTS_TSS__` map). The parser reuses
`compute-tss.mjs`'s regex `.zwo` reader — there is one parser in the
codebase, not two, and no XML dependency.

These are **requirements on that parser, derived from the requirements above** —
a parser that breaks them breaks the chart's meaning:

- Set `cadence: true` for any `.zwo` block specifying `Cadence`, `CadenceLow`,
  or `CadenceHigh`; omit it otherwise. (Drives req. 3; getting this wrong moves
  or deletes the high-torque marks — the worst possible regression.)
- Do **not** assign warmup/cooldown ramps a "real" intensity zone for colour
  purposes — they are neutral by design (req. 5). The parser stores a
  placeholder `zone: 1` that the component ignores in favour of `RAMP_FILL`.
- Embedded sprints inside a cadence set that are themselves at free cadence must
  *not* carry the flag, so they don't split the set (req. 4, the Rüegg case).
  This falls out of the previous rule: the embedded `MaxEffort` sprints in
  Rüegg carry no `Cadence` attribute, so they're unflagged automatically.
- Key parsed data by `.zwo` file path relative to `workouts/`, mirroring the
  existing build-time TSS map. The site's workout ids (`data.ts`) are *not*
  the join key — they're a display concern; the `.zwo` path is the stable join.

### Where the chart's data comes from — three layers, read for three things

A natural-but-wrong assumption (it tripped up a reviewing Claude) is that the
`.zwo` file is the chart's source of truth. It is not. **The calendar
(`research/training-calendar.md`, surfaced in the site as `site/src/data.ts`) is
the source of truth** (root `CLAUDE.md`); the `.zwo` is a *lossy projection* of
it. Two known losses:

- **Cadence ranges collapse to a point.** The prescription is `50–60 rpm`; the
  `.zwo` can only carry `Cadence="55"` (the format has no range). The single
  value is an artifact of the format, not the real target.
- **Sets are expanded into repetition.** A cleaner `IntervalsT` element exists,
  but it can't carry a different cadence on its on/off blocks, so a set is
  written as repeated `SteadyState` blocks (with `<!-- Set N -->` comments).

Because of this, the chart reads **each layer for only the thing that layer
represents faithfully**:

| What the chart needs | Read from | Why this layer |
|---|---|---|
| **Geometry** — block durations, powers, order | the `.zwo` | The only *machine-readable* form. `data.ts` has it as prose (`'4×4 min @ 80–85% FTP'`). M2 verifies Σ block-durations == the calendar duration, so the projection can't silently drift on duration. |
| **High-torque flag** (req. 3/4) | `.zwo` `Cadence`-attr *presence* | The lossiness is irrelevant here: the chart reads only *whether* a cadence is prescribed, never its value. `Cadence="55"` vs. the true `50–60` makes no difference to a boolean. |
| **Displayed cadence label** (a11y title, full-mode key) | `data.ts` params | This is where the un-collapsed `50–60 rpm` lives. The `.zwo`'s point value is **never displayed** — it would misreport the prescription. |

Two consequences worth stating so a later change doesn't undo them:

- **The `<!-- Set N -->` comments are not parser inputs and must not become
  load-bearing.** Set structure is recovered geometrically by the clusterer
  (req. 4 table), which is robust to how the `.zwo` happens to be authored.
  Driving set detection off comments (or off parsing `data.ts` prose like
  `'4×4'`) would couple rendering to copy-editing — a drift surface the current
  design deliberately avoids.
- **This three-layer read is the deliberate trade-off, not an accident.**
  Pulling definitions from several places has a cost; the alternative —
  promoting the `.zwo` into a fully structured representation of the calendar —
  was considered and deferred until a second workout platform makes it a real
  need. Until then, read geometry from the `.zwo`, the flag from its
  `Cadence`-presence, and the label from `data.ts`.

## Integration surface — where the chart lives in the app

The component is consumed in three places. None of them is incidental; if you
move the chart elsewhere, preserve the embedded/standalone split (req. 7) and
the data-join contract below.

**On every workout card (minimal mode):**

- `site/src/components/CollectionCard.tsx` (the tier 1–4 library cards)
- `site/src/components/AdaptationCard.tsx` (the W1–W3 onboarding cards)

Both pass `mode="minimal"` and `showAxisLabels={false}`. Minimal mode suppresses
the chart's title and axis labels because the surrounding card already shows
the workout name, the intensity prescription, and the cadence label — repeating
them in the SVG would violate req. 7 (no-duplication-when-embedded).

**One full-mode "how to read" example in the Adaptation panel:**

`site/src/components/AdaptationPanel.tsx` renders a collapsible "What is the
high-torque block?" block containing a full-mode chart of the Staple 5×5
workout. It is collapsed by default on return visits (persisted as
`panels.chartExplainer` in app state) and expanded for new users. The choice
is hardcoded by site id (`t2-staple`); `chart-data.test.ts` guards that id so
a rename fails the build instead of silently dropping the example. The
Collection panel no longer contains an explainer block — it shows only the
`ChartLegend` strip.

**One chart key per section:**

`site/src/components/ChartLegend.tsx` is a static HTML legend rendered once at
the top of each section (Collection panel and Adaptation panel). It shows only
the amber high-torque-block swatch — zone colours are standard Zwift vocabulary
and are intentionally omitted. Label: "High-torque block — where you drop to
the low-cadence target." The cadence swatch is its own
component, `CadenceHatchSwatch.tsx`, so any future surface that needs the
swatch in isolation can drop it in without redefining the hatch. The hatch
colours (`CADENCE_HATCH_LINE`, `CADENCE_HATCH_BG`) live in `chart-model.ts`
alongside the zone palette and are imported by both `WorkoutChart`'s in-SVG
accent/legend and `CadenceHatchSwatch` — these are *data* colours and are
deliberately not tokenised (req. 10).

### The data join — `chart-data.ts`

`site/src/components/chart-data.ts` is the one place that joins a site
`Workout` to its parsed `.zwo` chart geometry. Everything else reads
`ChartWorkout`, never the raw `__ZWO_WORKOUTS_BLOCKS__` global.

- `chartWorkoutFor(workout)` looks up the parsed blocks by `workout.file`,
  overrides the `.zwo`'s `<name>` with the site-facing `workout.name`, and
  attaches the `cadenceLabel` from `data.ts`'s "Cadence" param. Returns
  `undefined` if the join misses (host card then renders no chart, not a
  crash).
- `cadenceLabelFor(workout)` is shared with `AdaptationCard.tsx` so the
  "Cadence" param lookup isn't duplicated.

`chart-data.test.ts` is the join contract test and the regression surface for
the three-layer read: every `Workout.file` resolves, every parsed `.zwo` is
referenced (no orphan `.zwo` shipped to Zwift but invisible on the site),
`title` and `cadenceLabel` come from `data.ts` (not the `.zwo`), no `.zwo`
point cadence value leaks into a block, the cadence flag and label agree in
*both* directions, and the hardcoded `t2-staple` how-to id exists. A `.zwo`
edit that drifts from `data.ts` (or vice versa) fails this test.

### Sizing and SSR

The chart renders at a fixed design `width={680}` everywhere on the site and
scales to the host card via CSS — the SVG carries
`style={{ width: '100%', height: 'auto', maxWidth: svgW }}` and a fixed
`viewBox`. This is the simplest path that keeps every requirement true:

- Cluster geometry (req. 4) is computed at the design width, so the cluster
  counts on live cards match `workout-chart-clustering.test.ts` (also at 680px)
  *by construction*. A future change that varies the runtime width per card
  must ensure cluster counts still match the sanity table at every used width.
- No `ResizeObserver`, no `useEffect`, no measured width. `WorkoutChart` stays
  a pure function of its props (req. 9) and prerenders identically on server
  and client (see `prerendering.md`).
- `maxWidth: svgW` prevents upscaling past the design width — the chart never
  blurs by stretching beyond its native resolution on a wide container.

The narrow-width branch in `WorkoutChart` (`width < 380` → tighter clustering,
axis labels drop) is preserved as an incidental capability for any caller that
chooses to pass a narrow width directly; the in-tree consumers all pass 680.

### Print

`site/src/index.css` adds an `@media print` block that flips the four
`--color-*` chart-chrome variables to a dark-on-light palette so axis labels
and baselines read on white paper. The chart's *data* colours (zone palette
and the amber cadence accent) are intentionally untouched — req. 10 mandates
theme-invariance so a printed workout looks the same as the on-screen one
where it matters. The surrounding card chrome (Tailwind `bg-slate-*` /
`text-slate-*` utilities) is *not* covered by this override; printing converts
the chart correctly but leaves the surrounding card in its dark theme. That's
the current scope, deliberately narrow.

## How to tell if a change is a regression

Ask, in order:

1. Does it still show one whole session, time-ordered and proportional? (req. 1)
2. Can you still tell hard from easy, and over- vs. under-FTP? (req. 2)
3. Are the high-torque regions still obvious, still positively-only marked, and
   still one-per-set (run the table in req. 4)? (req. 3, 4)
4. Do warmup and cooldown still look like the same neutral thing? (req. 5)
5. Can you still see every block boundary, with clustering still correct? (req. 6)
6. Does it still behave embedded and standalone? (req. 7)
7. Still labelled for assistive tech, still dependency-free and SSR-safe, still
   theme-correct? (req. 8, 9, 10)

If all yes, the change is safe however different it looks. If any no, it's a
regression even if it looks nicer.

The fastest mechanical checks: `chart-data.test.ts` covers the data-layer
contract (the join, the three-layer read, the how-to id, flag↔label agreement);
`workout-chart-clustering.test.ts` covers the req-4 sanity table on real
parsed data; the rest is a browser eyeball at a normal desktop width plus one
narrow (mobile) check. Run all of `npm run lint && npm run build && npm test`
in `site/` before claiming the build is green — `vite build` runs `tsc -b`
which catches `vite-env.d.ts` mistakes that `vitest` alone misses.
