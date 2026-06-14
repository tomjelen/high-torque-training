# High Torque — workout visualizations integration handoff

Audience: **claude-code**, working in the live `high-torque.jelen.dk`
repo. This adds the cadence-accented power chart to every workout card
on the homepage. Minimal-change brief — touch the workout cards and
nothing else.

## What's in this folder

```
High Torque · workout cards with visualizations.html   ← design mockup
page.jsx                                               ← mock page glue (reference only)
workout-chart.jsx                                      ← THE component to ship
workouts-data.jsx                                      ← shape reference for the block model
HANDOFF-claude-code.md                                 ← you are here
```

`High Torque · workout cards with visualizations.html` is the visual
target. Open it locally to see the intended end state. `workout-chart.jsx`
is the only file you actually ship into the site. `page.jsx` is just the
mockup's React glue — do **not** copy it.

## The component

Single dependency-free SVG component. ~230 lines. Two render modes:

- `mode="minimal"` — for cards in the workout list. No title, no
  legend, no phase labels. The host card supplies title + metadata.
- `mode="full"` — for the "How to read the chart" annotated example
  at the top of the Collection section. Adds title row, optional phase
  labels, and an inline two-item legend.

Required props:

| Prop | Type | Notes |
|---|---|---|
| `workout` | object | `{ id, title, subtitle?, cadenceLabel?, blocks }` |
| `mode` | `'minimal' \| 'full'` | default `'minimal'` |
| `width` | number | inner chart width in px (before left axis gutter) |
| `hatchId` | string | **must be unique per chart on the page** — use the workout id |

Optional:

| Prop | Notes |
|---|---|
| `axisGutter` | auto: 36 px with labels, 6 px without |
| `clusterThresholdPx` | auto: 12 px desktop, 8 px under 380 px wide |
| `showAxisLabels` | auto-off below 380 px width |

The component references `var(--color-text-primary | -secondary |
-tertiary)` and `var(--color-border-tertiary)` for non-bar elements
(axis labels, baseline, title row). The site's dark theme already
defines these on `:root`; double-check the names match. If not, either
rename the variables on the page or drop them in the component for
hardcoded values. **Bar colors and the amber cadence accent are
hardcoded by design** — do not tokenize them yet.

## Where to put the chart

In each workout card, slot the chart **below the metadata grid and above
the source/download row.** Don't add new info — every piece of existing
copy stays:

- Tier badge, title, ACTIVE / LOCKED / ✓ today state
- Metadata fields (Intervals, Cadence, Total time, Est. TSS — or for
  the adaptation phase: Sets × duration, Intensity, Cadence, Recovery,
  Total time)
- Source citation link
- `.zwo` download
- Mark Complete button (adaptation phase only, on ACTIVE)

The mockup makes cards into bordered panels because the chart needs
room — feel free to keep the existing row-style layout if the design
allows the chart at the bottom of each row. The structural goal is
just *one chart per workout, inside the same card-block that already
carries the metadata*.

## Section-level additions

Two new elements, **once per section**, not per card:

1. **Chart key legend** — a thin strip with swatches (endurance,
   recovery, threshold, VO2, sprint, cadence hatch). Place it
   immediately under the section sub-header, before the first card.
   Both the Adaptation Phase and the Collection get one.

2. **"How to read the chart" panel** — a single full-mode chart
   showcasing the Staple 5×5 with title row + mini-legend + short
   prose explaining the amber hatched bar. Place it at the top of the
   Collection section, after the legend, before Tier 1.

See the mockup for the exact layouts.

## Block data model & deriving from `.zwo`

The chart consumes `workout.blocks: Block[]` where:

```ts
type Block =
  | { kind: 'block', zone: 1|2|3|4|5|6, power: number /* fraction of FTP */,
      dur: number /* seconds */, cadence?: boolean }
  | { kind: 'ramp', zone: 1|2|3|4|5|6, fromPower: number, toPower: number,
      dur: number, cadence?: boolean };
```

`workouts-data.jsx` shows the canonical shape for every workout in
the library (15 entries — match the ids to the .zwo filenames).

**Deriving from `.zwo` source:**

- `<Warmup PowerLow=… PowerHigh=… Duration=…>` → `kind: 'ramp'`, zone
  derived from `PowerHigh` (Z2 ≈ ramp top, Z1 for cooldown).
- `<Cooldown …>` → `kind: 'ramp'` with descending power (zone 1).
- `<SteadyState Power=… Duration=…>` → `kind: 'block'`, zone from
  power fraction.
- `<IntervalsT Repeat=… OnDuration=… OffDuration=… OnPower=…
  OffPower=…>` → expand into alternating `block` entries.
- `<FreeRide Duration=… >` or legacy `<MaxEffort Duration=… >` (or `Power >= 1.40`) → zone 6 sprint. Sprints are authored as `FreeRide` to escape ERG; both map identically.

**Zone mapping** (matches `ZONE_FILL` in the chart):

| Zone | Power range (% FTP) | Color | Use |
|---|---|---|---|
| 1 | < 0.60 | `#7A7A7A` | Recovery, inter-set rest |
| 2 | 0.60–0.75 | `#1AA5DB` | Warmup ramp, endurance |
| 3 | 0.76–0.87 | `#3FAE54` | Tempo (reserved) |
| 4 | 0.88–0.95 | `#F4C430` | Threshold (Staple 5×5 etc) |
| 5 | 0.96–1.05 | `#E68A2E` | VO2 / sweet-spot (reserved) |
| 6 | ≥ 1.06 | `#DC2626` | VO2max blocks, sprints |

**The cadence flag.** A `.zwo` block sets `Cadence`, `CadenceLow`, or
`CadenceHigh` when it prescribes RPM. Map any of those → `cadence:
true`. Otherwise omit (defaults to `false`).

The cadence flag is the chart's primary differentiator — get this
right per block and the amber accent appears in exactly the spots
where the prescription kicks in.

## The clustering rule (important)

Sprint sets like SIT 3×(4×30s) produce 16 alternating sprint+rest
blocks. Drawn naïvely the amber accent reads as a barcode. The chart
clusters adjacent cadence blocks separated only by *narrow* rest
blocks (default threshold = 12 px after layout; 8 px under 380 px
wide). Result: **one continuous warm rule per set**, not per sprint.

This is automatic — you do not need to pre-cluster the data. Just
flag `cadence: true` on every sprint block individually and let the
chart's `buildClusters()` collapse them.

Sanity check after wiring up:

- Staple 5×5 → five separate amber bars (3-min rests are too wide
  to cluster).
- SIT 3×(4×30s) → three continuous bars (one per set).
- Rüegg 3×(5 min @ 110% + 1 min sprint) → three bars (embedded
  sprints have `cadence: false` so they don't break the cluster).

## Responsive

The chart's `width` prop drives everything:

| Width | Axis labels | Cluster threshold |
|---|---|---|
| ≥ 380 px | shown | 12 px |
| < 380 px | hidden (auto) | 8 px |

In the live page, measure the card's inner content width and pass it
in. The chart will not overflow. There is no internal scroll.

## Accessibility

Add `role="img"` to the `<svg>` and an `<title>` summarising the
session. Example:

```jsx
<svg role="img" aria-labelledby={`t-${w.id}`}>
  <title id={`t-${w.id}`}>
    {`${w.title} power profile, cadence ${w.cadenceLabel || 'free'}`}
  </title>
  …
</svg>
```

The card header is the primary reader; this is a fallback for
screen readers and image-search.

## Print

Workouts get printed sometimes. Today the chart references
`var(--color-border-tertiary)` (light line on dark) which inverts
poorly. Quick fix: a `@media print` block overriding the four text /
border CSS vars to dark-on-light. Lower priority than shipping the
chart itself.

## File changes summary

```
+ workout-chart.jsx              (or .ts / .tsx, port to whatever the site uses)
~ workout card component         (add chart slot below metadata, keep all copy)
~ workouts-data source           (extend block model or derive on demand from .zwo)
+ Section legend component       (used twice: Adaptation Phase, Collection)
+ "How to read the chart" panel  (Collection top, uses mode="full")
```

No changes to the intro panel, install panel, session tracker, or
footer. No new dependencies.

## Open questions / not in scope

- **Tooltips on hover** for individual blocks / cadence bars — not
  designed; mobile-first audience means probably skip for now.
- **Print stylesheet** — flagged above; ship after the chart.
- **Per-tier color band** on the section headers (Adapt teal → T4 red)
  — design idea, not requested in this round.
- **Phase labels** in full mode currently rely on `workout.phases`
  data; could be derived automatically from the block list. Not
  blocking — the "How to read" panel works without them.

## Reference visuals

The HTML mockup is the canonical visual. Match it pixel-close on the
cards. If anything in the live site's chrome (typography scale,
spacing rhythm, card border radius) differs from the mockup's
assumptions, **defer to the live site** — the mockup approximates the
existing styling but you have the source of truth.
