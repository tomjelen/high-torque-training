# Site

The website at [high-torque.jelen.dk](https://high-torque.jelen.dk/): React + TypeScript + Vite + Tailwind, prerendered to static HTML at build time and deployed to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

## Commands

Node version: see `.nvmrc`. Run from this folder.

```
npm install          # once, on a fresh checkout (pulls in sfw, see the root CLAUDE.md)
npm run dev          # dev server
npm run build        # prebuild (copies .zwo files and research markdown) + type-check + build + prerender
npm run preview      # serve the built site
npm test             # unit tests, incl. the content-consistency test against research/*.md
npm run test:e2e     # Playwright end-to-end tests
```

Add new npm packages through Socket Firewall: `npx sfw npm install <pkg>`.

## Where things are documented

- `CLAUDE.md` (this folder): UX scope, last-updated date rules.
- `../documentation/decisions.md`: design decisions still in force, and which ones were superseded.
- `../documentation/prerendering.md`, `workout-chart.md`, `agent-interfacing.md`: how those subsystems work.
- `../research/`: the training content the site renders (the calendar is the source of truth for what to ride).
