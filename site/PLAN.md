# High Torque Training — Site Plan

## Overview

Minimal React + Vite site. Single `App.jsx` with inline styles. Dark theme. Two tabs: Training Tracker and Science & Rationale. Progress tracking via localStorage.

Design reference: `site-mockup/high-torque-mock.jsx`
Content sources: `training-calendar-v2.md` (workout params), `high-torque-training-research-v2.md` (science content)

## Tasks

### Task 1: Scaffold Vite + React project

Create the `site/` directory with a minimal Vite + React setup. **Use `create-vite@5`** (not newer — Node is v18.9.1).

Files to create:
- `site/package.json`
- `site/vite.config.js`
- `site/index.html`
- `site/src/main.jsx` — ReactDOM.createRoot entry point
- `site/src/App.jsx` — empty component placeholder

Run `npm install` to verify it works. Run `npm run dev` to verify the dev server starts.

Create symlink: `cd site/public && ln -s ../../workouts workouts`

**Done when:** `npm run dev` serves a page at localhost:5173.

---

### Task 2: Build the data layer in App.jsx

Add all data constants to the top of `App.jsx`. Everything is derived from the two source documents — do NOT invent values.

#### 2a: SOURCES object

All references from the research document (`high-torque-training-research-v2.md`, "Sources" section). Each entry has a `short` label and `full` citation. Use the mockup's `SOURCES` format as a template, but update to match the current research doc's sources.

#### 2b: PHASES array

Derived from `training-calendar-v2.md`. Structure:

```js
const PHASES = [
  {
    id: "adaptation",
    name: "Adaptation",
    subtitle: "Weeks 1-3",
    color: "#4ade80",
    prerequisite: null,
    description: "One low-cadence session per week. Zone 2 only.",
    workouts: [
      {
        id: "w1",
        name: "W1 — Endurance 65-70rpm",
        reps: 2, duration: "10 min", intensity: "65% FTP",
        cadence: "65-70", recovery: "5 min", total: "50 min",
        file: "High Torque - Adaptation/W1_Endurance_65-70rpm.zwo",
        notes: "First adaptation session"
      },
      // W2, W3...
    ]
  },
  {
    id: "tier1",
    name: "Tier 1 — Entry",
    color: "#86efac",
    prerequisite: "adaptation",
    // ...workouts from calendar
  },
  // tier2 (color: "#fbbf24"), tier3 (color: "#fb923c"), tier4 (color: "#f87171")
];
```

Get ALL workout parameters from the calendar. The `file` field must match the actual filename in `workouts/`.

#### 2c: OVERVIEW_SECTIONS array

Science content for the Science tab. Derive from the research document — do NOT copy the mockup's outdated text. Sections:

1. "What is torque training?" — from "The core idea" section
2. "Why does it work?" — from "The evidence" section (study details, coaching consensus)
3. "Knee safety" — from "Knee safety" section
4. "The adaptation phase" — from "Adaptation" section
5. "How ongoing training works" — from "Ongoing training" section (frequency, progression, fitting into 10hrs/week)

Each section: `{ title, paragraphs: [string] }`. Include inline source references as `[SOURCE_KEY]` markers that the Cite component will render.

#### 2d: PHASE_NOTES array

Per-phase rationale. Derive from the research doc's "Source prescription reference" and "The workout library" sections. Each phase note explains WHY that tier exists and what it targets.

**Done when:** All constants are populated with correct data matching the source documents.

---

### Task 3: Build shared components and layout

In `App.jsx`, build the shell and small reusable components. Follow the mockup's visual style.

#### Components to build:

1. **`Cite`** — inline citation badge. Takes a source key, renders as a small styled `<span>` with the short label. Hover/title shows full citation. Style: small, rounded, semi-transparent background.

2. **`SourcesBox`** — collapsible list of all sources. Expandable via click. Shows all entries from SOURCES.

3. **App shell** — sticky header with:
   - Title: "High Torque Training"
   - Progress: "X / 15" completed count + percentage bar
   - Tab switcher: "TRAINING TRACKER" | "SCIENCE & RATIONALE"

#### Styles (inline, matching mockup):
- Background: `#080810`
- Text: `#e0e0f0`
- Accent: `#FF6B00`
- Font: Barlow (body) + JetBrains Mono (metadata) — load from Google Fonts in index.html
- Container max-width: ~900px, centered

**Done when:** Header renders with tabs that switch content area. Cite and SourcesBox components work.

---

### Task 4: Build the Training Tracker tab

The main tab. Shows phases with workout cards and progress tracking.

#### State:
- `completed`: `Record<workoutId, string|true>` — stored in localStorage key `ht-progress-v2`
- `overrides`: `Record<phaseId, true>` — tier unlock overrides, same localStorage key

#### Phase section:
- Phase header with colored left border (phase color), name, subtitle, description
- Lock state: phase is locked if prerequisite phase's workouts are not all completed AND no override exists. Locked = greyed out (opacity 0.5), with "Unlock anyway →" button.
- Workout cards in responsive grid (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`)

#### Workout card:
- Name (bold)
- Parameter grid: REPS, DURATION, INTENSITY, CADENCE, RECOVERY, TOTAL — in monospace
- Completion toggle button (click to mark done, shows date completed)
- Download .zwo button: `<a href="/workouts/${file}" download>` with download icon or text

#### Zwift install banner:
Show the Zwift custom workout path (from `workouts/README.md`) as a dismissible banner below the header.

**Done when:** All 15 workouts render across 5 phases. Checkboxes persist. Tier unlock works. Downloads work.

---

### Task 5: Build the Science & Rationale tab

Content tab with expandable sections.

#### Structure:
- `OVERVIEW_SECTIONS` rendered as collapsible `<details>` blocks
- Section titles in orange uppercase (matching mockup)
- Paragraphs with `<Cite>` components for inline references
- `PHASE_NOTES` as a separate expandable section ("Phase-by-phase rationale")
- `<SourcesBox>` at the bottom

#### Cite rendering:
In paragraph text, replace `[SOURCE_KEY]` markers with `<Cite source={key} />` components. This can be done with a simple parser function or by structuring paragraph content as arrays of strings and cite objects.

**Done when:** All science content renders with working citations and collapsible sections.

---

### Task 6: Polish and verify

- Test responsive layout at mobile widths (360px)
- Test all 15 .zwo download links
- Test localStorage persistence (reload page, check state preserved)
- Test reset progress button (with confirmation)
- Verify all workout parameters match `training-calendar-v2.md`
- Verify all science content matches `high-torque-training-research-v2.md`
- Verify all source citations are accurate
