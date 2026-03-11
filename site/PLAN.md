# High Torque Training — Website Implementation Plan

## Overview

Build a single-page React app that replaces `training-calendar.md`. Users can track session completion and download all workout files. No backend — progress stored in `localStorage`.

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Pico CSS** (`@picocss/pico`) — classless CSS framework. Write semantic HTML, it looks good automatically. No utility classes. Use the default theme (light/dark auto based on system preference).
- **No other dependencies.** No router, no state library, no charting library.

## Project structure

```
site/
├── public/
│   ├── workouts/                    # all .zwo files organized by folder
│   │   ├── High Torque - Phase 1 Adaptation/
│   │   ├── High Torque - Phase 2 Build/
│   │   ├── High Torque - Phase 3 Protocol/
│   │   └── High Torque - Library/
│   └── high-torque-workouts.zip     # pre-built zip of all workouts
├── src/
│   ├── data/
│   │   └── workouts.ts              # all workout data (see "Data model" below)
│   ├── components/
│   │   ├── App.tsx                   # root: header, phase sections, download button
│   │   ├── PhaseSection.tsx          # one phase: title, description, lock state, workout list
│   │   ├── WorkoutCard.tsx           # one workout: name, stats, checkbox, download, profile
│   │   └── WorkoutProfile.tsx        # SVG power/cadence profile visualization
│   ├── hooks/
│   │   └── useLocalStorage.ts        # generic useLocalStorage hook
│   ├── main.tsx                      # ReactDOM.createRoot
│   ├── App.css                       # minimal overrides on top of Pico (if needed)
│   └── index.css                     # Pico CSS import + any CSS custom properties overrides
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Data model (`src/data/workouts.ts`)

All workout data is hardcoded. No build-time parsing. When workouts change, this file is updated manually.

```typescript
// Types

type SegmentType = "warmup" | "steady" | "intervals" | "cooldown";

interface Segment {
  type: SegmentType;
  duration: number;        // seconds (total duration for this segment)
  power: number;           // FTP fraction (for steady/cooldown-end/warmup-end)
  powerLow?: number;       // for warmup/cooldown ramps
  powerHigh?: number;      // for warmup/cooldown ramps
  cadence: number;         // rpm
  // For intervals only:
  repeat?: number;
  onDuration?: number;     // seconds
  offDuration?: number;    // seconds
  onPower?: number;        // FTP fraction
  offPower?: number;       // FTP fraction
  cadenceResting?: number; // rpm during rest
}

type FrequencyGuide = "weekly" | "every-2-3-weeks" | "monthly";

interface Workout {
  id: string;              // unique, stable key for localStorage (e.g. "w1", "w4a", "lib-sweet-spot")
  name: string;            // display name
  description: string;     // one-line summary
  durationMinutes: number; // total workout duration
  powerPercent: number;    // primary interval power as percentage (e.g. 88 for 88% FTP), 0 for Zone 2
  cadence: number;         // primary interval cadence target
  fileName: string;        // .zwo filename for download link
  folderName: string;      // subfolder in public/workouts/
  segments: Segment[];     // ordered list for profile visualization
  frequencyGuide?: FrequencyGuide; // only for library sessions
}

interface Phase {
  id: string;              // "phase-1", "phase-2", "phase-3", "library"
  name: string;            // "Phase 1 — Adaptation"
  subtitle: string;        // "Weeks 1–3"
  description: string;     // scheduling rules, e.g. "One low-cadence session per week..."
  workouts: Workout[];
  locked?: boolean;        // computed at render time, not stored
}
```

### Complete workout data

Below is every workout with its full segment structure. The implementing agent must encode ALL of this into `workouts.ts`.

#### Phase 1 — Adaptation (Weeks 1–3)

**Description:** "One low-cadence session per week. All other rides: normal cadence."

**W1** — id: `"w1"`, name: `"W1 – Low Cadence Endurance"`, description: `"2×10min Zone 2 · 68 rpm"`, duration: 50min, powerPercent: 65 (Zone 2), cadence: 68, fileName: `"W1_Endurance_68rpm.zwo"`, folderName: `"High Torque - Phase 1 Adaptation"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.68, cadence=90
2. steady: 600s, power=0.65, cadence=68
3. steady: 300s, power=0.50, cadence=85
4. steady: 600s, power=0.65, cadence=68
5. cooldown: 600s, powerLow=0.68, powerHigh=0.40, cadence=90

**W2** — id: `"w2"`, name: `"W2 – Low Cadence Endurance"`, description: `"2×15min Zone 2 · 65 rpm"`, duration: 60min, powerPercent: 65 (Zone 2), cadence: 65, fileName: `"W2_Endurance_65rpm.zwo"`, folderName: `"High Torque - Phase 1 Adaptation"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.68, cadence=90
2. steady: 900s, power=0.65, cadence=65
3. steady: 300s, power=0.50, cadence=85
4. steady: 900s, power=0.65, cadence=65
5. cooldown: 600s, powerLow=0.68, powerHigh=0.40, cadence=90

**W3** — id: `"w3"`, name: `"W3 – Low Cadence Endurance"`, description: `"3×10min Zone 2 · 62 rpm"`, duration: 65min, powerPercent: 65 (Zone 2), cadence: 62, fileName: `"W3_Endurance_62rpm.zwo"`, folderName: `"High Torque - Phase 1 Adaptation"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.68, cadence=90
2. steady: 600s, power=0.65, cadence=62
3. steady: 300s, power=0.50, cadence=85
4. steady: 600s, power=0.65, cadence=62
5. steady: 300s, power=0.50, cadence=85
6. steady: 600s, power=0.65, cadence=62
7. cooldown: 600s, powerLow=0.68, powerHigh=0.40, cadence=90

#### Phase 2 — Build (Weeks 4–6)

**Description:** "Two low-cadence sessions per week: one HIIT (A), one endurance (B). Do not do A and B on consecutive days."

**W4A** — id: `"w4a"`, name: `"W4A – HIIT"`, description: `"3×4min @ 85% FTP · 62 rpm"`, duration: 66min, powerPercent: 85, cadence: 62, fileName: `"W4A_HIIT_85pct_62rpm.zwo"`, folderName: `"High Torque - Phase 2 Build"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.72, cadence=90
2. intervals: repeat=3, onDuration=240s, offDuration=480s, onPower=0.85, offPower=0.50, cadence=62, cadenceResting=85
3. cooldown: 900s, powerLow=0.72, powerHigh=0.40, cadence=90

**W4B** — id: `"w4b"`, name: `"W4B – Endurance"`, description: `"2×20min Zone 2 · 68 rpm"`, duration: 70min, powerPercent: 65 (Zone 2), cadence: 68, fileName: `"W4B_Endurance_68rpm.zwo"`, folderName: `"High Torque - Phase 2 Build"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.68, cadence=90
2. steady: 1200s, power=0.65, cadence=68
3. steady: 300s, power=0.50, cadence=85
4. steady: 1200s, power=0.65, cadence=68
5. cooldown: 600s, powerLow=0.68, powerHigh=0.40, cadence=90

**W5A** — id: `"w5a"`, name: `"W5A – HIIT"`, description: `"4×4min @ 88% FTP · 60 rpm"`, duration: 78min, powerPercent: 88, cadence: 60, fileName: `"W5A_HIIT_88pct_60rpm.zwo"`, folderName: `"High Torque - Phase 2 Build"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.72, cadence=90
2. intervals: repeat=4, onDuration=240s, offDuration=480s, onPower=0.88, offPower=0.50, cadence=60, cadenceResting=85
3. cooldown: 900s, powerLow=0.72, powerHigh=0.40, cadence=90

**W5B** — id: `"w5b"`, name: `"W5B – Endurance"`, description: `"2×20min Zone 2 · 65 rpm"`, duration: 70min, powerPercent: 65 (Zone 2), cadence: 65, fileName: `"W5B_Endurance_65rpm.zwo"`, folderName: `"High Torque - Phase 2 Build"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.68, cadence=90
2. steady: 1200s, power=0.65, cadence=65
3. steady: 300s, power=0.50, cadence=85
4. steady: 1200s, power=0.65, cadence=65
5. cooldown: 600s, powerLow=0.68, powerHigh=0.40, cadence=90

**W6A** — id: `"w6a"`, name: `"W6A – HIIT"`, description: `"4×4min @ 90% FTP · 59 rpm"`, duration: 78min, powerPercent: 90, cadence: 59, fileName: `"W6A_HIIT_90pct_59rpm.zwo"`, folderName: `"High Torque - Phase 2 Build"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.75, cadence=90
2. intervals: repeat=4, onDuration=240s, offDuration=480s, onPower=0.90, offPower=0.50, cadence=59, cadenceResting=85
3. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**W6B** — id: `"w6b"`, name: `"W6B – Endurance"`, description: `"3×15min Zone 2 · 63 rpm"`, duration: 80min, powerPercent: 65 (Zone 2), cadence: 63, fileName: `"W6B_Endurance_63rpm.zwo"`, folderName: `"High Torque - Phase 2 Build"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.68, cadence=90
2. steady: 900s, power=0.65, cadence=63
3. steady: 300s, power=0.50, cadence=85
4. steady: 900s, power=0.65, cadence=63
5. steady: 300s, power=0.50, cadence=85
6. steady: 900s, power=0.65, cadence=63
7. cooldown: 600s, powerLow=0.68, powerHigh=0.40, cadence=90

#### Phase 3 — Full Protocol (Weeks 7–8)

**Description:** "Four-day microcycle from the study. Week 8 increases volume. Microcycle order: Day 1 → Day 2 → Day 3 (easy, normal cadence) → Day 4 (rest/recovery)."

**Week 7 Day 1** — id: `"p3-w7d1"`, name: `"Week 7 · Day 1 – SIT"`, description: `"2×(4×30sec max) · 55 rpm"`, duration: 76min, powerPercent: 150, cadence: 55, fileName: `"Day1_SIT_55rpm.zwo"`, folderName: `"High Torque - Phase 3 Protocol"`

Segments:
1. warmup: 1200s, powerLow=0.40, powerHigh=0.75, cadence=90
2. intervals: repeat=4, onDuration=30s, offDuration=90s, onPower=1.50, offPower=0.50, cadence=55, cadenceResting=80
3. steady: 1500s, power=0.55, cadence=85
4. intervals: repeat=4, onDuration=30s, offDuration=90s, onPower=1.50, offPower=0.50, cadence=55, cadenceResting=80
5. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**Week 7 Day 2** — id: `"p3-w7d2"`, name: `"Week 7 · Day 2 – HIIT"`, description: `"4×4min @ 110% FTP · 65 rpm"`, duration: 83min, powerPercent: 110, cadence: 65, fileName: `"Day2_HIIT_65rpm.zwo"`, folderName: `"High Torque - Phase 3 Protocol"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.75, cadence=90
2. steady: 30s, power=1.10, cadence=90 (opener)
3. steady: 120s, power=0.55, cadence=90 (recovery)
4. steady: 30s, power=1.10, cadence=90 (opener)
5. steady: 120s, power=0.55, cadence=90 (recovery)
6. intervals: repeat=4, onDuration=240s, offDuration=480s, onPower=1.10, offPower=0.50, cadence=65, cadenceResting=85
7. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**Week 7 Day 3** — id: `"p3-w7d3"`, name: `"Week 7 · Day 3 – LIT"`, description: `"90–120 min easy ride · normal cadence"`, duration: 105min, powerPercent: 0, cadence: 0, fileName: `""`, folderName: `""`
No ZWO file — this is a free ride. Segments: none (render as a simple text card, no profile).

**Week 7 Day 4** — id: `"p3-w7d4"`, name: `"Week 7 · Day 4 – Recovery"`, description: `"45–60 min easy spin"`, duration: 52min, powerPercent: 0, cadence: 0, fileName: `""`, folderName: `""`
No ZWO file — free ride. Segments: none.

**Week 8 Day 1** — id: `"p3-w8d1"`, name: `"Week 8 · Day 1 – SIT"`, description: `"3×(4×30sec max) · 55 rpm"`, duration: 109min, powerPercent: 150, cadence: 55, fileName: `"W8_Day1_SIT_55rpm.zwo"`, folderName: `"High Torque - Phase 3 Protocol"`

Segments:
1. warmup: 1200s, powerLow=0.40, powerHigh=0.75, cadence=90
2. intervals: repeat=4, onDuration=30s, offDuration=90s, onPower=1.50, offPower=0.50, cadence=55, cadenceResting=80
3. steady: 1500s, power=0.55, cadence=85
4. intervals: repeat=4, onDuration=30s, offDuration=90s, onPower=1.50, offPower=0.50, cadence=55, cadenceResting=80
5. steady: 1500s, power=0.55, cadence=85
6. intervals: repeat=4, onDuration=30s, offDuration=90s, onPower=1.50, offPower=0.50, cadence=55, cadenceResting=80
7. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**Week 8 Day 2** — id: `"p3-w8d2"`, name: `"Week 8 · Day 2 – HIIT"`, description: `"6×4min @ 110% FTP · 65 rpm"`, duration: 107min, powerPercent: 110, cadence: 65, fileName: `"W8_Day2_HIIT_65rpm.zwo"`, folderName: `"High Torque - Phase 3 Protocol"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.75, cadence=90
2. steady: 30s, power=1.10, cadence=90 (opener)
3. steady: 120s, power=0.55, cadence=90 (recovery)
4. steady: 30s, power=1.10, cadence=90 (opener)
5. steady: 120s, power=0.55, cadence=90 (recovery)
6. intervals: repeat=6, onDuration=240s, offDuration=480s, onPower=1.10, offPower=0.50, cadence=65, cadenceResting=85
7. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**Week 8 Day 3** — id: `"p3-w8d3"`, name: `"Week 8 · Day 3 – LIT"`, description: `"90–120 min easy ride · normal cadence"`, duration: 105min, powerPercent: 0, cadence: 0, fileName: `""`, folderName: `""`
No ZWO file. Segments: none.

**Week 8 Day 4** — id: `"p3-w8d4"`, name: `"Week 8 · Day 4 – Recovery"`, description: `"45–60 min easy spin"`, duration: 52min, powerPercent: 0, cadence: 0, fileName: `""`, folderName: `""`
No ZWO file. Segments: none.

#### Library Sessions

**Description:** "Ongoing sessions after the 8-week block. Max 2 low-cadence sessions per week (coach consensus: Henderson, EVOQ, EF Pro Cycling). Pick one harder and one easier."

**Sweet Spot Torque** — id: `"lib-sweet-spot"`, name: `"Sweet Spot Torque"`, description: `"3×12min @ 88% FTP · 60 rpm"`, duration: 84min, powerPercent: 88, cadence: 60, fileName: `"Sweet_Spot_Torque.zwo"`, folderName: `"High Torque - Library"`, frequencyGuide: `"weekly"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.75, cadence=90
2. intervals: repeat=3, onDuration=720s, offDuration=360s, onPower=0.88, offPower=0.50, cadence=60, cadenceResting=85
3. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**Pyramid** — id: `"lib-pyramid"`, name: `"Pyramid"`, description: `"2-4-6-4-2 min @ 88% FTP · 60 rpm"`, duration: 60min, powerPercent: 88, cadence: 60, fileName: `"Pyramid_88pct_60rpm.zwo"`, folderName: `"High Torque - Library"`, frequencyGuide: `"weekly"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.75, cadence=90
2. steady: 120s, power=0.88, cadence=60
3. steady: 180s, power=0.50, cadence=85
4. steady: 240s, power=0.88, cadence=60
5. steady: 180s, power=0.50, cadence=85
6. steady: 360s, power=0.88, cadence=60
7. steady: 180s, power=0.50, cadence=85
8. steady: 240s, power=0.88, cadence=60
9. steady: 180s, power=0.50, cadence=85
10. steady: 120s, power=0.88, cadence=60
11. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**Torque Endurance** — id: `"lib-torque-endurance"`, name: `"Torque Endurance"`, description: `"4×15min @ 75% FTP · 60 rpm"`, duration: 110min, powerPercent: 75, cadence: 60, fileName: `"Torque_Endurance.zwo"`, folderName: `"High Torque - Library"`, frequencyGuide: `"weekly"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.72, cadence=90
2. intervals: repeat=4, onDuration=900s, offDuration=300s, onPower=0.75, offPower=0.50, cadence=60, cadenceResting=85
3. cooldown: 900s, powerLow=0.72, powerHigh=0.40, cadence=90

**Over-Under** — id: `"lib-over-under"`, name: `"Over-Under"`, description: `"3×(4×2/1min) @ 95/78% FTP · 60 rpm"`, duration: 76min, powerPercent: 95, cadence: 60, fileName: `"Over_Under_Torque_60rpm.zwo"`, folderName: `"High Torque - Library"`, frequencyGuide: `"every-2-3-weeks"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.75, cadence=90
2. intervals: repeat=4, onDuration=120s, offDuration=60s, onPower=0.95, offPower=0.78, cadence=60, cadenceResting=60
3. steady: 300s, power=0.50, cadence=85
4. intervals: repeat=4, onDuration=120s, offDuration=60s, onPower=0.95, offPower=0.78, cadence=60, cadenceResting=60
5. steady: 300s, power=0.50, cadence=85
6. intervals: repeat=4, onDuration=120s, offDuration=60s, onPower=0.95, offPower=0.78, cadence=60, cadenceResting=60
7. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**Threshold Block** — id: `"lib-threshold"`, name: `"Threshold Block"`, description: `"2×20min @ 93% FTP · 60 rpm"`, duration: 75min, powerPercent: 93, cadence: 60, fileName: `"Threshold_Block_60rpm.zwo"`, folderName: `"High Torque - Library"`, frequencyGuide: `"every-2-3-weeks"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.75, cadence=90
2. steady: 1200s, power=0.93, cadence=60
3. steady: 300s, power=0.50, cadence=85
4. steady: 1200s, power=0.93, cadence=60
5. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

**TorqueMax (Advanced)** — id: `"lib-torquemax"`, name: `"TorqueMax (Advanced)"`, description: `"6×2min @ 110% FTP · 55 rpm"`, duration: 71min, powerPercent: 110, cadence: 55, fileName: `"TorqueMax_Advanced.zwo"`, folderName: `"High Torque - Library"`, frequencyGuide: `"monthly"`

Segments:
1. warmup: 900s, powerLow=0.40, powerHigh=0.75, cadence=90
2. steady: 30s, power=1.10, cadence=90 (opener)
3. steady: 120s, power=0.55, cadence=90 (recovery)
4. steady: 30s, power=1.10, cadence=90 (opener)
5. steady: 120s, power=0.55, cadence=90 (recovery)
6. intervals: repeat=6, onDuration=120s, offDuration=240s, onPower=1.10, offPower=0.50, cadence=55, cadenceResting=85
7. cooldown: 900s, powerLow=0.75, powerHigh=0.40, cadence=90

## Component specifications

### `App.tsx`

- Renders a `<main>` with `<header>`, phase sections, and a footer
- Header: "High Torque Training" title, one-line tagline ("Low-cadence training for cyclists — based on Hebisz & Hebisz 2024"), and a "Download All Workouts" button linking to `/workouts/high-torque-workouts.zip`
- Renders 4 `PhaseSection` components in order
- Computes lock state: Phase 2 locked until all Phase 1 workouts are checked. Phase 3 locked until all Phase 2 workouts are checked. Library is never locked.
- Footer: brief credit line, link to the research document (could be a future addition — for now just "Based on Hebisz & Hebisz (2024, PLOS One)")

### `PhaseSection.tsx`

Props: phase data, locked boolean, completion state, onToggle callback

- Renders phase name, subtitle, and description
- If locked: show the section visually muted/dimmed with a lock indicator. Show workout names but disable interaction. Keep it simple — CSS opacity + a text note like "Complete Phase N to unlock" is fine.
- If unlocked: renders list of `WorkoutCard` components
- Show progress: "3/6 completed" or similar

### `WorkoutCard.tsx`

Props: workout data, completed boolean, onToggle callback, locked boolean

- Checkbox (or clickable element) to mark complete
- Workout name, description (the one-liner like "4×4min @ 88% FTP · 60 rpm")
- Duration in minutes
- Download button for the individual .zwo file (links to `/workouts/{folderName}/{fileName}`). Hide download button if no fileName (the free-ride sessions in Phase 3).
- Renders `WorkoutProfile` component if the workout has segments
- If completed, show a visual indicator (strikethrough, checkmark, muted, whatever looks clean with Pico)
- If locked, disable the checkbox and download button
- For library sessions: show the frequency guide as a small badge/tag ("Weekly staple", "Every 2–3 weeks", "Monthly")

### `WorkoutProfile.tsx`

Props: segments array, total duration

Renders an SVG visualization of the workout power profile. This is the classic Zwift-style stacked bar chart.

**How to render:**
- SVG with viewBox, responsive width (100% of card width), fixed height (~80-100px)
- X axis = time (0 to total duration). Each segment occupies its proportional width.
- Y axis = power (0 to max power in the workout, e.g. 1.50 FTP)
- For each segment:
  - `warmup`: a trapezoid from powerLow to powerHigh
  - `steady`: a rectangle at the power level
  - `intervals`: for each repeat, draw an "on" rectangle at onPower and an "off" rectangle at offPower, alternating
  - `cooldown`: a trapezoid from powerLow to powerHigh (descending)
- Color the blocks by cadence: use a simple color scale.
  - Low cadence (≤60 rpm): strong accent color (e.g. orange/amber)
  - Medium cadence (61-70 rpm): moderate accent
  - Normal cadence (>70 rpm): neutral/grey
  - This visually shows "where the low-cadence work is" at a glance
- No axes labels, no gridlines, no tooltip. Just the shapes. Keep it dead simple.

### `useLocalStorage.ts`

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void]
```

Standard hook. Reads from localStorage on mount, writes on change. Key prefix: `"ht-"` to namespace (e.g. `"ht-completed"` stores a `Record<string, boolean>` of workout IDs to completion state).

Store all completion state in a single key (`"ht-completed"`) as a JSON object `{ "w1": true, "w4a": true, ... }`. Simpler than one key per workout.

## Styling notes

- Import Pico CSS in `index.css`: `@import '@picocss/pico';`
- Pico provides automatic light/dark theme based on `prefers-color-scheme`. No config needed.
- Use semantic HTML elements: `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<details>`, `<mark>`, etc. Pico styles these automatically.
- Workout cards can be `<article>` elements (Pico styles these as cards with border and padding)
- Locked phases: use `aria-disabled` and CSS `opacity: 0.5` + `pointer-events: none`
- Frequency guide badges: use `<mark>` or `<small>` with a `<kbd>` tag (Pico styles `<kbd>` as a rounded badge)
- The SVG profile should have no Pico styling — it's custom
- `App.css` should be minimal — just layout tweaks:
  - Max width container (Pico's `<main class="container">` handles this)
  - Grid or flexbox for workout cards if desired (optional — stacked cards are fine too)
  - SVG sizing

## Static assets

- Copy all `.zwo` files from `../workouts/` into `site/public/workouts/` maintaining the folder structure
- Create `high-torque-workouts.zip` containing all 4 workout folders with their .zwo files. This is a one-time build artifact checked into `public/`. To create it, run: `cd ../workouts && zip -r ../site/public/high-torque-workouts.zip "High Torque - Phase 1 Adaptation" "High Torque - Phase 2 Build" "High Torque - Phase 3 Protocol" "High Torque - Library" && cd ../site`

## Vercel deployment

- Add `vercel.json` to `site/`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Implementation order

1. Scaffold: `npm create vite@latest . -- --template react-ts` inside `site/`
2. Install Pico: `npm install @picocss/pico`
3. Copy workout files to `public/workouts/` and create the zip
4. Write `src/data/workouts.ts` with all the data from this plan
5. Write `src/hooks/useLocalStorage.ts`
6. Write `src/components/WorkoutProfile.tsx`
7. Write `src/components/WorkoutCard.tsx`
8. Write `src/components/PhaseSection.tsx`
9. Write `src/components/App.tsx`
10. Write `src/index.css` (Pico import)
11. Write `src/App.css` (minimal overrides)
12. Update `src/main.tsx` to render App
13. Test: `npm run dev`, verify all phases render, checkboxes persist, downloads work, profiles look correct
14. Add `vercel.json`

## Things NOT to do

- No routing library — it's one page
- No state management library — useLocalStorage + prop drilling is fine for 4 components
- No charting library — SVG is hand-built
- No build-time file parsing — all data is hardcoded
- No backend, no API, no database
- No user authentication
- No tests (for now)
- Do not modify any files outside `site/` — the workout files and research document are separate concerns
