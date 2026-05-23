# Chart UX Iteration — Design Spec
Date: 2026-05-23
Branch: feat/workout-chart (or follow-up branch)

## Context

The WorkoutChart component (M1–M3 done, on `feat/workout-chart`) is working correctly. This spec covers three UX improvements identified after seeing the charts in context on the live page.

The audience for the charts is primarily Zwift riders who already know standard power-profile charts. **The only genuinely novel element is the amber high-torque mark.** Everything else — bar height = intensity, zone colours, ramps — is Zwift vocabulary. This reframe drives all three decisions below.

---

## Issue 1 — Explainer: move to Adaptation panel, collapse by default

### Problem
The "How to read the workout charts" block currently lives in CollectionPanel. But `AdaptationPanel` is rendered first in `App.tsx` — new users encounter charts there without any explanation.

### Decision
- Move the explainer block from `CollectionPanel` to `AdaptationPanel`
- Collapsed by default on return visits, using the same app-state persistence pattern as `UsageGuidelines` (a `panels.chartExplainer.collapsed` key, or similar)
- New users (no persisted state) see it expanded on first load
- `CollectionPanel` loses the explainer block entirely; it keeps only the `ChartLegend` strip

### Explainer content (when expanded)
- **Collapsed label:** "What is the high-torque block?" — not "How to read the workout charts". Respects that the audience knows Zwift; the only thing that needs explaining is the amber mark.
- **Expanded text:** brief, focused on the amber mark only. Something like: "The amber hatched blocks mark where you drop to the low-cadence target — the high-torque work. Everything else is standard Zwift: bar height is effort, left to right is time."
- **Example chart:** the Staple 5×5 full-mode chart moves with the block from Collection to Adaptation. It stays as the canonical "how to read" example.
- The expanded block renders the standard `ChartLegend` strip below the example chart (same single-line format as the panel strip — the text in the block already covers the "what is it" question).

### What CollectionPanel keeps
Just the `ChartLegend` strip, no separate explainer block.

---

## Issue 2 — Chart key: rename + simplify

### Decision
Rename the amber mark label from **"Cadence target"** to **"High-torque block"** everywhere:
- `ChartLegend.tsx` swatch label
- Inline legend inside full-mode `WorkoutChart` SVG
- Aria `<title>` text in `WorkoutChart` (e.g. "…cadence high-torque blocks prescribed")
- `CadenceHatchSwatch.tsx` (used as a standalone swatch)

The shorter form **"Torque block"** is acceptable wherever "High-torque block" is too wide — same meaning, the user has context by the time they see it.

### ChartLegend simplification
The `ChartLegend` component is always-shown (persistent strip in both panels), so it uses the compact single-line format:

```
[amber swatch]  High-torque block — where you drop to the low-cadence target
```

Zone-colour swatches are **removed from `ChartLegend`**. Zwift riders know them; they don't need a key. `ChartLegend` is always single-line — no format prop, no two-tier variant.

### Inline legend inside full-mode WorkoutChart SVG
The two-item legend row at the bottom of the full-mode chart currently reads "Max effort · Cadence target". Update "Cadence target" → "High-torque block" (or "Torque block" if the SVG width is tight).

---

## Issue 3 — Card chart: taller accent strip in minimal mode

### Problem
The `ACCENT_H` constant is 8px at the 680 design width. When the SVG scales down to fit a card (~250px rendered), the strip renders at ~3px — effectively invisible on a retina screen.

### Decision
Use a larger `ACCENT_H` value when `mode="minimal"`. A value of **16px** at the 680 design width renders to ~6px at card scale, which is clearly visible. The full-mode chart keeps `ACCENT_H = 8` (it renders closer to its native size).

Implementation: replace the single constant with two — `ACCENT_H_FULL = 8` and `ACCENT_H_MINIMAL = 16` — and pick based on `mode`. No structural change; no effect on clustering geometry (accent geometry is computed after layout, not fed back into it).

The exact value is tuning, not contract — adjust up or down based on visual result. The requirement (per `documentation/workout-chart.md` req. 3/4) is that the mark is clearly visible and the clustering is correct; the pixel height is incidental.

---

## What does NOT change

- The amber colour values (`CADENCE_HATCH_LINE`, `CADENCE_HATCH_BG`) — hardcoded data colours per req. 10
- The clustering algorithm or threshold — no change to `chart-clustering.ts`
- The `mode="full"` chart in the explainer block — still Staple 5×5, still `width={680}`
- The `mode="minimal"` width in cards — still `width={680}`, CSS-scaled
- SSR purity, no new dependencies — req. 9 unchanged
- The `ChartLegend` in `AdaptationPanel` and the `ChartLegend` in `CollectionPanel` — same component, just simplified content

---

## Files affected

| File | Change |
|---|---|
| `site/src/components/ChartLegend.tsx` | Remove zone swatches; rename label; add inline description |
| `site/src/components/CadenceHatchSwatch.tsx` | No change (swatch itself is correct) |
| `site/src/components/WorkoutChart.tsx` | `ACCENT_H_MINIMAL = 16`; update inline legend label |
| `site/src/components/CollectionPanel.tsx` | Remove the "How to read" block + example chart |
| `site/src/components/AdaptationPanel.tsx` | Add collapsed "What is the high-torque block?" block with example chart + ChartLegend |
| `site/src/types.ts` (or wherever `AppState` lives) | Add `chartExplainer: { collapsed: boolean }` to panels state |
| `site/src/storage.ts` (or wherever state is initialised) | Default `chartExplainer.collapsed = false` (expanded for new users) |

---

## Regression checklist (spot-checks after implementing)

These are in addition to the full `documentation/workout-chart.md` checklist and the existing test suite:

- [ ] Adaptation panel: explainer shows expanded on first load (no persisted state)
- [ ] Adaptation panel: explainer collapses and stays collapsed on reload
- [ ] Collection panel: no explainer block, just ChartLegend strip
- [ ] ChartLegend: shows only the amber swatch + "High-torque block — where you drop to the low-cadence target", no zone swatches
- [ ] Card charts: amber strip clearly visible without squinting (eyeball at 1× and 2× display density)
- [ ] Full-mode chart (Staple 5×5 in explainer): inline legend reads "High-torque block" (or "Torque block")
- [ ] `npm run lint && npm run build && npm test` green
