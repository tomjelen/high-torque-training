# High Torque Training — Site Plan

## Context

The previous site implementation was deleted because it was over-engineered. This plan rebuilds from scratch with feature-oriented tasks — each delivers a visible, testable feature. Data extraction happens within each feature, not as a separate step.

The site is currently empty (just `site/PLAN.md`). Source of truth: `training-calendar-v2.md` (workouts) and `high-torque-training-research-v2.md` (science). 15 .zwo files exist in `workouts/`.

---

## Task 1: Scaffold

Vite + React + TS + Pico CSS (classless, dark theme). Node v18.9.1 → use `create-vite@5`.

- `npm create vite@5 site -- --template react-ts`
- `npm install @picocss/pico`
- Symlink: `site/public/workouts → ../../workouts`
- `index.html`: `<html data-theme="dark">`, title
- `main.tsx`: import Pico CSS
- `App.tsx`: header with "High Torque Training", `<main class="container">`
- Small `theme.css`: override `--pico-primary: #FF6B00` for accent color
- Clean up Vite defaults (App.css, counter example, logos)

**Verify:** `npm run dev` → dark page with orange-accented header at localhost:5173. `/workouts/README.md` accessible via symlink.

---

## Task 2: Adaptation Sessions Overview + Logger

Show W1/W2/W3 as a sequential progression with unlock-style UX.

**Files:** `src/data.ts`, `src/types.ts`, `src/components/AdaptationPanel.tsx`, `src/components/WorkoutCard.tsx`, `src/components/Cite.tsx`

**Data:** Define `SOURCES` (9 entries from research doc) and `ADAPTATION_WORKOUTS` (3 entries from calendar) in `data.ts`.

**localStorage:** Single key `ht-v1` with shape:
```ts
{ adaptation: Record<"w1"|"w2"|"w3", string>, log: LogEntry[], adaptationCollapsed?: boolean }
```

**UX:**
- Wrapped in `<details>` — open by default if incomplete, collapsed when all 3 done
- `<summary>`: "Adaptation Phase — Weeks 1–3" + progress (e.g. "1/3")
- Knee safety warning as a callout/alert at the top of the panel
- Three cards in progression: W1 → W2 → W3
- W2 muted (opacity 0.4) until W1 marked done. W3 muted until W2 done.
- Each card: name, params (reps, duration, intensity, cadence, recovery, total), source via `<Cite>`, download link, "Mark Complete" button
- Completing stores ISO date in localStorage. Completed cards show date + undo option.
- When all 3 done: show readiness checklist (informational, not enforced) from calendar's "Readiness gates" section. Panel auto-collapses.

**Verify:** Mark W1 → W2 activates. Mark all 3 → readiness summary, panel collapses. Reload → state persists.

---

## Task 3: Post-Adaptation Tiers Overview

Show 12 ongoing workouts grouped by tier with guidance.

**Files:** extend `data.ts` with `TIERS` array, create `src/components/TiersPanel.tsx`

**Data:** 4 tiers, 12 workouts total. Each workout: id, name, description (e.g. "4×4 min @ 80–85% FTP"), cadence, total time, source key, file path. All from calendar.

Tier colors: T1 `#86efac`, T2 `#fbbf24`, T3 `#fb923c`, T4 `#f87171`

**UX:**
- No gating between tiers — purely visual
- Each tier: colored left border, name, description, workout cards in responsive grid
- Above tiers: collapsible `<details>` with usage instructions:
  - Frequency: 1–2/week, never >2, never back-to-back days
  - Weekly template: one easier + one harder session
  - Progression guidelines (when to move up a tier, from calendar)
  - Warning signs to back off (from calendar)
- Reuses `WorkoutCard` and `Cite` from Task 2

**Verify:** All 12 workouts render with correct params matching calendar. Tier colors distinct. Instructions readable.

---

## Task 4: Session Logger

Running log for completed ongoing sessions (different UX from adaptation checkboxes).

**Files:** `src/components/SessionLog.tsx`, extend `App.tsx` state

**localStorage:** Entries in `ht-v1.log` array:
```ts
{ id: string, workoutId: string, date: string, notes?: string }
```

**UX:**
- "Log Session" form: workout dropdown (grouped by tier), date picker (default today), optional notes, "Log" button
- Below: list of logged sessions, newest first
- Each entry: relative date ("Today", "3 days ago", "Mar 15"), workout name, tier badge, notes
- Delete button per entry (with confirmation)
- Placed below the tiers panel — always visible, primary ongoing interaction

**Verify:** Log a session → appears in list. Reload → persists. Multiple entries in reverse chronological order. Delete works.

---

## Task 5-a: Workout Downloads - Download all

Download all workouts button + compile-time zip bundle.

**Bundle:**
- `build-zip.ts`: Node script using `archiver` to zip all 15 .zwo files from `../workouts/`
- Runs as `prebuild` script in package.json: `"prebuild": "tsx build-zip.ts"`
- Output: `site/public/high-torque-workouts.zip` (gitignored)

**DownloadBar:**
- "Download All Workouts (.zip)" button
- Collapsible Zwift install instructions (path info from `workouts/README.md`)

**Verify:** There should be a button to download all workouts. `npm run build` generates zip with all files. Install instructions match README.

---

## Task 5-b: Workout Downloads - Individual

Individual .zwo download buttons

**Files:** extend `WorkoutCard` with download link, create `src/components/DownloadBar.tsx`, create `build-zip.ts`

**Individual:** `<a href="/workouts/{file}" download>` on every WorkoutCard (already has file path from data).


**Verify:** Each of 15 cards has working download.

---

## Task 6: Science & Rationale Page

Second tab with research content.

**Files:** extend `data.ts` with `SCIENCE_SECTIONS`, create `src/components/SciencePage.tsx`, `src/components/SourcesList.tsx`

**Tab switching:** State in App.tsx, hash-based (`#science`). Header gets tab buttons.

**Sections** (from research doc):
1. What is torque training? (from "The core idea")
2. Why does it work? (Hebisz study details, coaching consensus)
3. Knee safety (biomechanics, 6 mandatory rules, who should avoid)
4. The adaptation phase (why 3 weeks, why Zone 2)
5. Ongoing training framework (frequency, progression, weekly template)
6. How solid is this evidence? (limitations, confidence)

**UX:**
- Each section as Pico `<details>` with collapsible content
- Inline `<Cite>` badges per paragraph
- `<SourcesList>` at bottom: all 9 sources with full citations + clickable URLs

**Verify:** All sections render, content matches research doc. Citations work. Hash navigation works (`#science` direct link, browser back/forward).

---

## File Structure (Final)

```
site/
  index.html
  package.json
  vite.config.ts
  build-zip.ts
  .gitignore              (includes public/high-torque-workouts.zip)
  public/
    workouts → ../../workouts
  src/
    main.tsx
    App.tsx
    theme.css
    data.ts
    types.ts
    components/
      Cite.tsx
      AdaptationPanel.tsx
      WorkoutCard.tsx
      TiersPanel.tsx
      SessionLog.tsx
      DownloadBar.tsx
      SciencePage.tsx
      SourcesList.tsx
```
