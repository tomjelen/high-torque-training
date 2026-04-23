# High Torque Training — Site Redesign Implementation Plan

## Context

The site content is complete; the current layout was never deliberately
designed — it accumulated around pico-css's classless defaults while
features were being added. The redesign, locked in
`site-specification/redesign.md` and wireframed in
`site-specification/Final Wireframes.html`, makes the page **scannable**,
**navigable**, and **trustworthy**: a four-panel collapsible home page
(Intro / Download & install / Adaptation / Collection) arranged in the
user's journey order, a new Session Tracker sidebar that acts as a
load-management guardrail, and a lighter shell rework of `/science` that
leaves its prose unchanged. Desktop-only (≥1280 px); mobile is
deliberately deferred.

Architecturally: **strip pico-css**, rewrite the markup in **Tailwind**,
switch from `#science` hash routing to real paths with a **prerender
step** at build time so `curl https://.../science` returns real HTML.

Out of scope: new content, new workouts, new research, mobile layouts,
workout visualisation, log import/export.

## Architectural decisions

- **Tailwind v4** via `@tailwindcss/vite` (CSS-first config; no PostCSS
  pipeline to wire up).
- **React Router v6** for routing. Real paths `/` and `/science`.
- **Prerender**: custom `scripts/prerender.mjs` using a second
  `vite build --ssr` bundle + `react-dom/server`. Rejected `react-snap`
  (unmaintained, Vite-unfriendly) and plugin alternatives (fight
  `@tailwindcss/vite`). ~50 lines is enough for two routes.
- **TSS**: computed at build time from the `.zwo` XML — emitted into
  `src/generated/tss.ts`. Keeps values traceable to the `.zwo` source
  and matches the attribution-integrity rule. Unknown block types throw
  the build — no silent TSS = 0.
- **State**: Do not migrate, return defaults if read state is garbled.

### New `AppState`

```ts
{
  schemaVersion: "2026-04-21",
  adaptation: { w1?: string, w2?: string, w3?: string },  // ISO timestamps (unchanged)
  panels: {
    intro:      { collapsed: boolean },
    download:   { collapsed: boolean },
    adaptation: { collapsed: boolean },
    collection: { collapsed: boolean },
  },
  log: [{ id: string, workoutId: string, timestamp: string, notes?: string }]
  //  ^ timestamp replaces date — tracker needs half-day rounding from actual times.
}
```

## Sequencing (7 phased commits, site functional throughout)

1. **Infrastructure, no visible change.** Add Tailwind, React Router,
   storage migration, TSS generation wired into `prebuild`. pico still
   imported, existing UI unchanged. Also run the `@tailwindcss/vite` +
   `--ssr` compatibility smoke test described under "Risks and edge
   cases" — catching an incompatibility here is much cheaper than
   discovering it in phase 7. Verifiable: `npm run build` succeeds,
   `vite build --ssr` of a stub `entry-server.tsx` also succeeds,
   `src/generated/tss.ts` exists with values for every Collection
   workout.
2. **Routing flip.** Hash → real paths. `BrowserRouter` with
   `<Route path="/">` and `<Route path="/science">`. Children unchanged.
   Verifiable: `/science` loads directly; back/forward works.
3. **Shell rewrite.** New `Header`, `Footer`, `Panel` primitive (wraps
   `<details>` for keyboard accessibility — same pattern as
   `AdaptationPanel.tsx:53`), home layout skeleton. Existing panel
   components mounted inside (visually mismatched — acceptable for one
   commit). Science adopts the new shell; prose unchanged.
   - `Header` per §4.1: "High Torque Training" on the left (also the
     home link), "Science & Rationale" as a plain link on the right.
     No tagline, no pill/tab styling.
   - `Footer` per §4.7, two lines:
     1. "Tom Jelen" + `mailto:high-torque@jelen.dk` + Strava profile
        link. Icon-forward presentation is fine.
     2. Feedback call-out verbatim from §4.7 (*"Spotted bad info, a
        study I've missed, or have an idea for the site? Email me — I
        want to know."*) with per-page "Last updated" date
        right-aligned on the same row.
   - **Per-page last-updated (§5.3):** hard-coded constant per page —
     `HOME_LAST_UPDATED` lives alongside home composition (e.g. in
     `App.tsx`); `SCIENCE_LAST_UPDATED` in `SciencePage.tsx`. `Footer`
     takes the relevant date as a prop. Bumped manually when *that
     page's content* changes — not on reskins.
4. **Panel content rewrites, one commit each.**
   - 4a. `IntroPanel` (new; content per spec §4.2 — Hebisz 2024 study
     quote + 2 links + "how this site is structured" paragraph).
   - 4b. `DownloadInstallPanel` (migrates `DownloadBar.tsx`; prominent
     "Download All Workouts (.zip)" button; collapsed-state teaser
     with the .zip button still accessible per §4.3).
   - 4c. `AdaptationPanel` rewrite. **Preserve the warning block verbatim**
     (`AdaptationPanel.tsx:61–68`) and the readiness checklist
     (`:88–104`). Auto-collapse-on-all-complete (`:18–23`) preserved.
     New `AdaptationCard` keeps prominent .zwo + Mark Complete per §4.4.
     Title treatment per §5.1: single-line, fixed-height title area;
     ellipsis truncate when it overflows; full title available on hover
     via `title=` attribute.
     Three states: locked (dimmed, Mark Complete disabled, .zwo + Source
     still interactive) / active / complete (Mark Complete → "Completed
     ✓", card stays full-colour).
   - 4d. `CollectionPanel` with:
     - `UsageGuidelines` — carries **all four** content blocks from
       `TiersPanel.tsx` verbatim, none dropped: *Frequency* bullets
       (`:17–21`), *Weekly template* paragraph (`:23–27`), *When to
       progress* table (`:30–55`), and *Signs you are NOT ready to move
       up* list (`:58–67`). Wrapped with the §4.5.1 dual-framing
       explanation of tiers (progression ladder vs hard/easy
       classifier) and the collapsed-header teaser (one-liner along
       the lines of *"1–2 sessions/week, never back-to-back, progress
       by cadence before volume"* — the panel's key rule stays visible
       when folded).
     - `SessionGrid` — one uniform flat grid, tier badges, sort:
       tier → title.
     - `CollectionCard` — tier badge, TSS, demoted .zwo icon, "Did
       this today" action (rendered in this phase as a no-op button;
       wired in phase 5). Title treatment per §5.1 — same as
       `AdaptationCard` above (single-line, ellipsis, `title=` attr).
     - Short knee-safety one-liner alongside `UsageGuidelines` per §4.5.
5. **Session Tracker v2 (full rewrite).** Replace `SessionTracker.tsx`:
   `TrackerCounter` ("X days since last HARD session" — half-day rounded
   from timestamps), `TrackerStrip` (30-day rolling calendar; hard/easy
   markers at actual date positions), `TrackerLog` (recent entries list
   with per-entry gap from previous session *of any kind*),
   `PrivacyPopover` (`?` icon → browser-local state explainer per §4.5.3).
   Wire "Did this today" on `CollectionCard` → appends `{ id, workoutId,
   timestamp: new Date().toISOString() }`. Hard/easy resolved by joining
   `workoutId` → `Workout.tier` (T3/T4 = hard, T1/T2 = easy). No
   denormalised field on log entries.
6. **Strip pico.** Remove `@picocss/pico`, delete import from `main.tsx`,
   delete `src/theme.css`. **Separate commit** — regressions must be
   bisectable here.
7. **Prerender.** Add `src/entry-server.tsx` exporting `render(url)`
   wrapping `<App>` in `<StaticRouter>`. Add `scripts/prerender.mjs`:
   reads `dist/index.html`, injects `renderToString(<App url="/">)` into
   `<div id="root">`, writes back; same for `/science` into
   `dist/science/index.html` (folder form — GH Pages trailing-slash
   reliable). `main.tsx` switches to `hydrateRoot`. Both routes curl to
   full HTML.

## File-level changes

**Rewrite**
- `src/App.tsx` — router + shell, no more hash tab logic.
- `src/main.tsx` — remove pico + theme imports; `hydrateRoot`.
- `src/storage.ts` — v1→v2 migration.
- `src/types.ts` — new `AppState`; `timestamp` on `LogEntry`; optional
  `tier` and `tss` on `Workout`.
- `src/components/AdaptationPanel.tsx` — Tailwind; warning block, readiness
  checklist, auto-collapse preserved.
- `src/components/SessionTracker.tsx` — full rewrite (new composition,
  no form).
- `src/components/WorkoutCard.tsx` — split into `AdaptationCard.tsx` and
  `CollectionCard.tsx` (layouts diverge enough that two files read
  cleaner than a `variant` prop).

**Delete**
- `src/components/TiersPanel.tsx` (content moves to `UsageGuidelines`)
- `src/components/DownloadBar.tsx` (superseded by `DownloadInstallPanel`)
- `src/theme.css` (phase 6)

**Leave / light-touch**
- `src/components/SciencePage.tsx` — prose drop-in; trim the outer
  `<hgroup>` so it doesn't duplicate the new Header.
- `src/components/Cite.tsx`, `SourcesList.tsx` — swap classes for
  Tailwind utilities, no behaviour change.
- `src/data.ts` — add `tier: 1|2|3|4` to each Collection workout; import
  TSS map from `src/generated/tss.ts`. `ADAPTATION_WORKOUTS`, `SOURCES`,
  `SCIENCE_SECTIONS` unchanged.
- `public/`, `prebuild` rsync — unchanged.

**New**
- `src/components/Header.tsx`, `Footer.tsx`, `Panel.tsx`
- `src/components/IntroPanel.tsx`, `DownloadInstallPanel.tsx`,
  `CollectionPanel.tsx`, `UsageGuidelines.tsx`, `CollectionCard.tsx`,
  `AdaptationCard.tsx`
- `src/components/TrackerCounter.tsx`, `TrackerStrip.tsx`,
  `TrackerLog.tsx`, `PrivacyPopover.tsx`
- `src/entry-server.tsx`
- `src/generated/tss.ts` (build output; checked in for reproducibility)
- `site/scripts/generate-tss.mjs`, `site/scripts/prerender.mjs`
  (live under the `site/` npm workspace; bare `scripts/...` references
  elsewhere in this plan — including in `package.json` — are relative
  to `site/`.)
- `src/index.css` with Tailwind v4 CSS-first syntax. **Default Tailwind
  palette, default fonts** — no custom config. Dark theme using stock
  slate/zinc for surfaces and stock green/yellow/orange/red for tier
  badges. No custom fonts, no cursive, no dashed-border chrome.

## TSS generation (`scripts/generate-tss.mjs`)

- Walks `../workouts/**/*.zwo`, parses XML with `fast-xml-parser`.
- Block types present across the current corpus: `Warmup`, `Cooldown`
  (linear ramp `PowerLow`→`PowerHigh`), `SteadyState` (single `Power`),
  `IntervalsT` (`Repeat` × on/off, `OnPower`/`OffPower`). Allowlist
  these explicitly — **throw on anything else** (don't silently
  default to zero).
- Sample each block at 1 Hz → power array.
  `NP = (mean(P_30s_rolling^4))^(1/4)`. `IF = NP` (already FTP-normalised).
  `TSS = duration_hours × IF² × 100`, rounded.
- Emit `src/generated/tss.ts`: `{ workoutId: number }`, keyed by matching
  `.zwo` path to `Workout.file`.
- Runs in `prebuild` after rsync.

## Prerender integration

- `src/entry-server.tsx` — `export function render(url) {
  return renderToString(<StaticRouter location={url}><App/></StaticRouter>)
  }`.
- `scripts/prerender.mjs` — read `dist/index.html`, inject rendered
  markup for `/` into `<div id="root">`, write back. Repeat for
  `/science` → `dist/science/index.html`.
- `main.tsx` — always `hydrateRoot` (both routes prerender).
- `package.json` scripts:
  - `prebuild`: existing rsync + zip, then `node scripts/generate-tss.mjs`.
  - `build`: `tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
  - `postbuild`: `node scripts/prerender.mjs`.

**Hydration trap — localStorage is empty at prerender time.** Strategy:
- Prerender with default state (`collapsed: false`, empty log, empty
  strip). Every panel renders **expanded** in the static HTML — matches
  the SEO/crawler goal.
- After hydration, a `useEffect` in `App.tsx` reads localStorage and
  applies. Users see a brief "everything expanded" flash before their
  persisted collapse state reapplies. Acceptable.
- Tracker strip `Date.now()` — render an empty placeholder during SSR;
  populate after mount. Deterministic placeholder avoids hydration
  mismatch.

## Risks and edge cases

- **GH Pages trailing slash.** Folder form (`dist/science/index.html`)
  works for `/science/`; bare `/science` may 404 depending on config.
  Verify on first deploy; fallback is to also write `dist/science.html`.
- **Adaptation "Mark Complete" must NOT write a log entry.** Updates
  `state.adaptation.w*` only. Log entries only come from Collection
  cards' "Did this today" per §4.6.
- **Empty log state.** Counter reads "No hard sessions yet"; strip is
  empty cells; log list shows a placeholder. First-visit-safe.
- **Garbled localStorage.** `JSON.parse` throw → defaults; preserve the
  raw key for user recovery.
- **"View full log" scope creep.** Keep to a dated list; at most a
  "delete last entry" undo. Import/export is deferred per spec §5.4.
- **Unknown .zwo block.** TSS script must throw, not default to 0.
- **`StaticRouter` import path changed in React Router v6.4+** — comes
  from `react-router-dom/server`.
- **`@tailwindcss/vite` under `--ssr`.** The build invokes vite twice:
  once for the client bundle, once with `--ssr` for `entry-server.tsx`.
  Both passes load the Tailwind Vite plugin. Verify the two-invocation
  path **early, during Phase 1** — before wiring the rest of the app
  around it. Smoke test: after adding Tailwind, create a throwaway
  `src/entry-server.tsx` stub (`export function render() { return '' }`)
  and run `vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
  Both should succeed with no CSS-processing errors.
  Fallbacks in order, if the plugin misbehaves under `--ssr`:
  (a) gate the plugin behind `mode !== 'ssr'` in `vite.config.ts` —
  SSR doesn't need Tailwind-processed CSS, only HTML;
  (b) drop the Vite plugin and use Tailwind v4 via `@import "tailwindcss"`
  in `src/index.css` only (slower HMR but framework-agnostic);
  (c) fall back to Tailwind v3 + PostCSS.

## Verification

**Prerender**
- `curl http://localhost:4173/ | grep -q "Adaptation"` ✓
- `curl http://localhost:4173/science/ | grep -q "Hebisz"` ✓
- View source: `<div id="root">` contains real markup on both routes.

**Hydration**
- React DevTools: no hydration-mismatch warnings on load of either route.

**Storage**
- Seed `ht-v1` with dated log + adaptation timestamps → reload → `ht-v2`
  key present, timestamps at local midnight, panels default expanded,
  `ht-v1` untouched.
- Wipe all keys → first paint shows empty tracker, all panels open,
  no errors.
- Corrupt `ht-v2` (invalid JSON) → app works with defaults, raw key
  retained.

**Interaction**
- Keyboard only: tab reaches each panel summary; Space toggles; focus
  visible against dark background.
- Mark W1 complete → W2 active, W3 locked. `adaptation.w1` ISO in
  localStorage.
- "Did this today" on a T3 card → counter = "0 days since last HARD",
  strip marker at today, log shows the entry. Easy-session gap from a
  previous entry rounds to the nearest 0.5 d per §4.5.3.

**TSS**
- `npm run build` succeeds; inspect `src/generated/tss.ts` — every
  workout has a value. Sanity-check one: `Torque Staple 5×5 @ 0.90 FTP,
  ~75 min ≈ 80 TSS`.
- Inject a fake `FreeRide` block in a test `.zwo` → build fails loudly.
  Revert.

**Visual**
- axe-devtools on both prerendered pages: no contrast / keyboard
  violations.
- Render at 1280 px viewport (spec minimum): tracker fits beside grid
  without overlap.

## Critical files

- `site/src/App.tsx` — router + shell
- `site/src/storage.ts` — v1→v2 migration
- `site/src/data.ts` + new `site/src/generated/tss.ts`
- `site/src/components/AdaptationPanel.tsx` — reference for warning
  (`:61–68`), readiness checklist (`:88–104`), `<details>` pattern
  (`:53`), auto-collapse (`:18–23`)
- `site/src/components/TiersPanel.tsx` — reference for "When to progress"
  table (`:30–55`) before deletion
- `site/package.json` — prebuild TSS gen, postbuild prerender, SSR build,
  Tailwind + Router deps

## Visual language

Use the wireframes for **structure only** (four-panel layout, grid +
sidebar composition, what goes in collapsed-panel teasers, tracker
anatomy). Do **not** port the wireframe's custom palette, cursive
fonts, or dashed-border chrome. Concrete direction:

- **Dark theme**, using stock Tailwind utilities only
  (e.g. `bg-slate-900`, `bg-slate-800`, `text-slate-100`,
  `text-slate-400`). No custom colour variables.
- **Tier badges** use stock Tailwind palette (`bg-green-500`,
  `bg-yellow-500`, `bg-orange-500`, `bg-red-500` for T1/T2/T3/T4).
- **Hard vs easy in the tracker** reuses tier colours (hard = red,
  easy = green) — consistent with badges, no extra palette.
- **Typography**: Tailwind defaults. `font-sans` throughout, `font-mono`
  for numerical stats on cards. No Google Fonts, no `@font-face`.
- **Chrome**: standard rounded borders (`rounded`, `border`,
  `border-slate-700`) — no dashed borders, no notebook aesthetic.

Goal: minimum custom CSS, maximum reuse of Tailwind defaults. If a
style needs a custom value, that's a signal to pick a different
Tailwind utility first.
