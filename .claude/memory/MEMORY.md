# High Torque Training — Project Memory

## Site

- Stack: Vite + React + TypeScript + Pico CSS (classless)
- Located at `site/` inside the repo root
- Node version is v18.9.1 — use `create-vite@5` for scaffolding (not v8+)
- Workout .zwo files served via **symlinks** from `site/public/workouts/` → `../workouts/`
- `site/public/high-torque-workouts.zip` is a checked-in build artifact
- Components: App, ResearchPanel, PhaseSection, WorkoutCard, WorkoutProfile
- Data: `src/data/workouts.ts` — all hardcoded, no build-time parsing
- LocalStorage keys: `ht-completed` (Record<id, bool>), `ht-unlocked` (Record<phaseId, bool>)

## Design decisions

- WorkoutProfile SVG uses **Zwift power zone colors** (by FTP fraction, not cadence)
- Phase unlock: strictly requires all prior-phase boxes checked, but "Unlock anyway →" button allows override
- ResearchPanel: `<details>` accordion after the header — includes study, caveats, knee safety, all 9 sources

## Gotcha: Vite scaffold deletes existing files

`npm create vite@5 . -- --template react-ts` with "Remove existing files" deletes everything in `site/`, including PLAN.md. Restore from git:
```bash
git show <commit>:site/PLAN.md > site/PLAN.md
```

## Running locally

```bash
cd site && npm run dev
# → http://localhost:5173 with hot-reloading
```

## Deployment (deferred)

- Vercel config will go in `site/vercel.json` when ready

## User & Feedback

- [User identity](user_identity.md) — Tom Jelen, ZWO author name
- [ZWO conventions from Zwift testing](feedback_zwo_conventions.md) — Cadence="X" attribute, name length, activitySaveName, countdown timing, power continuity
