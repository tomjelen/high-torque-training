# Per-Route Prerendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `curl https://high-torque.jelen.dk/` and `curl https://high-torque.jelen.dk/rationale` return fully-rendered HTML containing each page's actual content, with per-route metadata, no user-visible flash on hydration, and durable documentation explaining what's load-bearing vs replaceable.

**Architecture:** Custom `vite build --ssr src/entry-server.tsx` produces a server bundle; a small `scripts/prerender.mjs` invokes its `render(url)` for `/` and `/rationale`, injects per-route `<title>`, `<noscript>`, and off-screen anchor into the shared `dist/index.html` template, and writes static HTML files (with both `dist/rationale.html` and `dist/rationale/index.html` to bypass trailing-slash gambles). Two-phase hydration via `useIsomorphicLayoutEffect` swaps from default state to `localStorage` state synchronously before the browser paints, eliminating flash.

**Tech Stack:** React 18, React Router v6, Vite 8, TypeScript, Tailwind v4 (via `@tailwindcss/vite`), `react-dom/server.renderToString`, plain Node ESM script for orchestration.

**Spec:** `site-specification/2026-05-03-prerender-design.md` — every section/decision below is grounded there.

---

## Phase 1: Rename `/science` → `/rationale` (prerequisite)

This is a logically independent change that the prerender plan assumes is already shipped. Single commit. No prerender machinery touched.

### Task 1: Rename route, label, file, and all references

**Files:**
- Rename: `site/src/components/SciencePage.tsx` → `site/src/components/RationalePage.tsx`
- Modify: `site/src/App.tsx`
- Modify: `site/src/components/Header.tsx`
- Modify: `site/src/components/IntroPanel.tsx`
- Modify: `site/index.html`
- Modify: `site/public/llms.txt`
- Modify: `site/CLAUDE.md`
- Modify: `site/scripts/check-consistency.mjs`
- Modify: `documentation/agent-interfacing.md`

- [ ] **Step 1: Rename the page component file**

```bash
git mv site/src/components/SciencePage.tsx site/src/components/RationalePage.tsx
```

- [ ] **Step 2: Update component name inside the renamed file**

In `site/src/components/RationalePage.tsx`, change the component declaration and the heading text:

```tsx
export default function RationalePage() {
  return (
    <article>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mt-6 mb-1">Rationale</h1>
        <p className="text-slate-400 text-sm m-0">Why these workouts work, what the evidence actually says, and where to push back.</p>
      </div>
      ...
```

(Only the component name and the `<h1>` text change; everything below stays as-is.)

- [ ] **Step 3: Update `site/src/App.tsx`**

Change the import, the constant name, the route function, and the route path:

```tsx
import RationalePage from './components/RationalePage'
import Header from './components/Header'
import Footer from './components/Footer'
import { loadState, saveState } from './storage'
import type { AppState } from './types'

const HOME_LAST_UPDATED = '2026-05-02'
const RATIONALE_LAST_UPDATED = '2026-04-30'
```

```tsx
function RationaleRoute() {
  return (
    <main className="mx-auto max-w-[1440px] px-8 pb-4">
      <RationalePage />
      <Footer
        lastUpdated={RATIONALE_LAST_UPDATED}
        lastUpdatedTooltip="Date of the most recent substantive update to the research and rationale. Typo fixes and wording tweaks don't bump this date."
      />
    </main>
  )
}
```

```tsx
<Routes>
  <Route path="/" element={<HomePage state={state} setState={setState} />} />
  <Route path="/rationale" element={<RationaleRoute />} />
</Routes>
```

- [ ] **Step 4: Update `site/src/components/Header.tsx`**

Replace the `onScience`/`/science` references with `onRationale`/`/rationale` and change the visible label to "Rationale →":

```tsx
import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const { pathname } = useLocation()
  const onRationale = pathname === '/rationale'

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      <div className="mx-auto max-w-[1440px] px-8 py-3 flex items-baseline justify-between">
        <Link to="/" className="font-bold text-lg text-slate-100 no-underline hover:text-white">
          High Torque Training
        </Link>
        <Link
          to={onRationale ? '/' : '/rationale'}
          className="text-sm text-slate-400 no-underline hover:text-slate-200"
        >
          {onRationale ? 'Workouts →' : 'Rationale →'}
        </Link>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Update `site/src/components/IntroPanel.tsx`**

Find the `<Link to="/science">` near the bottom of the file (currently `IntroPanel.tsx:147–149`) and change both the path and the link text:

```tsx
<Link to="/rationale" className="text-blue-400 hover:text-blue-300">
  → Read the full rationale and sources
</Link>
```

- [ ] **Step 6: Update `site/index.html`**

Change the `<link rel="alternate">` `title` attribute that references "Science":

```html
<link rel="alternate" type="text/markdown" href="/content/rationale.md" title="Rationale (markdown)" />
```

(Only that one `title` attribute changes; everything else in `index.html` stays.)

- [ ] **Step 7: Update `site/public/llms.txt`**

In the `## Pages` section, change the URL from `/science` to `/rationale`:

```markdown
- The science and rationale: https://high-torque.jelen.dk/rationale or https://high-torque.jelen.dk/content/rationale.md
```

- [ ] **Step 8: Update `site/CLAUDE.md`**

In the "Last updated dates" section, replace the `SCIENCE_LAST_UPDATED` references with `RATIONALE_LAST_UPDATED` and adjust the prose:

```markdown
- `HOME_LAST_UPDATED` — home/workouts page
- `RATIONALE_LAST_UPDATED` — rationale page
```

```markdown
- **`RATIONALE_LAST_UPDATED` (rationale page)** — an evidence review. Bump only when the substance changes: new or revised research, updated coaching input, corrected claims, changed confidence levels. Do **not** bump for typo fixes or wording tweaks that don't change the substance. The date answers "when was the rationale last reviewed?"
```

- [ ] **Step 9: Update `site/scripts/check-consistency.mjs`**

Three changes inside `takeScreenshots()`:

```js
console.log(`  → ${BASE_URL}/rationale`)
await page.goto(`${BASE_URL}/rationale`)
await page.waitForLoadState('networkidle')
const rationaleShot = await page.screenshot({ fullPage: true })
```

```js
return { homeShot, rationaleShot }
```

In `callClaude` and `main`, rename the parameter and variable from `scienceShot`/`scienceB64` to `rationaleShot`/`rationaleB64`. Inside the prompt text, change "the workout library (home page) and the science/rationale page" to "the workout library (home page) and the rationale page".

- [ ] **Step 10: Update `documentation/agent-interfacing.md`**

In the "How to verify agents can still read the site" section, change the prompt from "What does the science page say?" to "What does the rationale page say?".

- [ ] **Step 11: Verify the rename works in the dev server**

Start the dev server and visit both routes manually:

```bash
cd site && npm run dev
```

Expected: `/` loads as before; `/rationale` loads the rationale page; the header link toggles between "Workouts →" and "Rationale →"; clicking the IntroPanel "→ Read the full rationale and sources" link goes to `/rationale`.

Stop the dev server.

- [ ] **Step 12: Verify the type-check passes**

```bash
cd site && npx tsc -b
```

Expected: clean exit.

- [ ] **Step 13: Run the existing tests**

```bash
cd site && npm test
```

Expected: pass.

- [ ] **Step 14: Commit**

```bash
cd site && git add -A
git commit -m "Rename /science route to /rationale

URL and visible label both become 'Rationale' to match the markdown
counterpart (rationale.md) and the conceptual framing — the page is
a rationale that uses science to justify its claims, not a science
textbook. Pure rename; no behaviour change.

Prerequisite for the per-route prerendering work."
```

---

## Phase 2: SSR build smoke test

The original redesign plan flagged `@tailwindcss/vite` under `--ssr` as the most likely failure mode. Verify it works before building anything around it. (Spec §8.)

### Task 2: Smoke-test `vite build --ssr` with a stub server entry

**Files:**
- Create (temporarily): `site/src/entry-server.tsx`

- [ ] **Step 1: Create the throwaway stub**

```tsx
// site/src/entry-server.tsx
export function render(_url: string): string {
  return ''
}
```

- [ ] **Step 2: Run the dual build**

```bash
cd site && npm run build && npx vite build --ssr src/entry-server.tsx --outDir dist-ssr
```

Expected: both invocations succeed with no CSS-processing errors. `dist-ssr/entry-server.js` exists.

If this fails with a Tailwind-related error, halt and consult the fallback ladder in spec §8 before proceeding (gate the plugin behind `mode !== 'ssr'`, then drop the Vite plugin in favour of CSS `@import "tailwindcss"`, then fall back to v3 + PostCSS).

- [ ] **Step 3: Leave the stub in place**

Don't delete it — Phase 3 fills it in with the real implementation. Do **not** commit yet; the stub is incomplete on its own.

---

## Phase 3: Server entry, prerender script, build wiring

### Task 3: Refactor `App.tsx` to remove the inner router

The current `App.tsx` wraps `<AppShell />` in `<BrowserRouter>`. The router needs to live in the entry files instead, so `entry-server.tsx` can use `<StaticRouter>` and `main.tsx` can use `<BrowserRouter>`.

**Files:**
- Modify: `site/src/App.tsx`

- [ ] **Step 1: Remove the `BrowserRouter` wrapper from `App`**

Replace the bottom of `App.tsx` (currently `App.tsx:61–67`):

```tsx
function App() {
  return <AppShell />
}

export default App
```

Also remove the now-unused `BrowserRouter` import:

```tsx
import { Routes, Route } from 'react-router-dom'
```

- [ ] **Step 2: Verify the type-check still passes**

```bash
cd site && npx tsc -b
```

Expected: clean exit. (`App` is now wrapped externally — temporarily nothing wraps it, but `tsc` doesn't care about runtime router context.)

Don't commit yet — `main.tsx` needs to be updated next, otherwise the dev server crashes.

### Task 4: Update `main.tsx` to wrap in `BrowserRouter` and use `hydrateRoot`

**Files:**
- Modify: `site/src/main.tsx`

- [ ] **Step 1: Replace `main.tsx` contents**

```tsx
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: Verify dev server still works**

```bash
cd site && npm run dev
```

Expected: site loads normally on `/` and `/rationale`. The header link still works. (At this stage the site is still client-rendered; `hydrateRoot` against a non-prerendered template will warn about hydration mismatch — that's fine; this is intermediate state.)

Stop the dev server.

- [ ] **Step 3: Don't commit yet**

The intermediate state (hydrateRoot against an empty template) is broken in the sense that dev-mode warnings appear. Phase 3 ends with a working prerender, so the commit lands at Task 7 with everything coherent.

### Task 5: Implement the real `entry-server.tsx`

**Files:**
- Modify: `site/src/entry-server.tsx` (replace the stub from Task 2)

- [ ] **Step 1: Write the real implementation**

```tsx
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
```

- [ ] **Step 2: Verify the SSR build still produces output**

```bash
cd site && npx vite build --ssr src/entry-server.tsx --outDir dist-ssr
```

Expected: `dist-ssr/entry-server.js` is regenerated and includes the React tree's serialized output.

- [ ] **Step 3: Smoke-test `render()` returns real HTML**

```bash
cd site && node --input-type=module -e "import('./dist-ssr/entry-server.js').then(m => console.log(m.render('/').slice(0, 200)))"
```

Expected: prints HTML containing `<header` or other markup from the home page (not an empty string).

### Task 6: Write the prerender script

**Files:**
- Create: `site/scripts/prerender.mjs`

- [ ] **Step 1: Create the script**

```js
// site/scripts/prerender.mjs
//
// Reads dist/index.html as a template, calls render(url) from the SSR
// bundle for each route, injects route-specific <title>, <noscript>,
// and off-screen anchor, then writes static HTML for each route.
//
// See documentation/prerendering.md for the load-bearing outcomes
// this script must preserve, and site-specification/2026-05-03-prerender-design.md
// for the full rationale.

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const DIST = 'dist'
const SSR_BUNDLE = '../dist-ssr/entry-server.js'

const { render } = await import(SSR_BUNDLE)

const template = readFileSync(join(DIST, 'index.html'), 'utf-8')

const ROUTES = [
  {
    path: '/',
    outputs: ['dist/index.html'],
    marker: 'Adaptation', // sanity check: home page must contain the Adaptation panel
    title: 'High Torque Training',
    primaryMd: '/content/workouts.md',
    primaryDescription: 'the workout library and training calendar (what to do)',
    secondaryMd: '/content/rationale.md',
    secondaryDescription: 'the rationale behind the workouts (why it works)',
    noscriptHeading: 'High Torque Training',
    noscriptIntro: 'This site is JavaScript-rendered. The home page is the workout library and calendar.',
  },
  {
    path: '/rationale',
    outputs: ['dist/rationale.html', 'dist/rationale/index.html'],
    marker: 'Hebisz', // sanity check: rationale page must cite the Hebisz study
    title: 'Rationale — High Torque Training',
    primaryMd: '/content/rationale.md',
    primaryDescription: 'the rationale behind the workouts (why it works)',
    secondaryMd: '/content/workouts.md',
    secondaryDescription: 'the workout library and training calendar (what to do)',
    noscriptHeading: 'Rationale — High Torque Training',
    noscriptIntro: 'This site is JavaScript-rendered. This page explains the rationale behind the workouts.',
  },
]

function buildNoscript(route) {
  return `<noscript>
      <h1>${route.noscriptHeading}</h1>
      <p>${route.noscriptIntro}</p>
      <ul>
        <li><a href="${route.primaryMd}">${route.primaryMd}</a> &mdash; ${route.primaryDescription}</li>
        <li><a href="${route.secondaryMd}">${route.secondaryMd}</a> &mdash; ${route.secondaryDescription}</li>
      </ul>
      <p><strong>Agents and LLMs:</strong> fetch <a href="${route.primaryMd}">${route.primaryMd}</a> instead of trying to parse this HTML. See also <a href="/llms.txt">/llms.txt</a> for a site index and attribution rules you must follow when relaying claims from this site.</p>
    </noscript>`
}

function buildAnchor(route) {
  return `<a href="${route.primaryMd}" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" aria-hidden="true" tabindex="-1">Agent: primary content for this page is at ${route.primaryMd}</a>`
}

const NOSCRIPT_REGEX = /<noscript>[\s\S]*?<\/noscript>/
const ANCHOR_REGEX = /<a href="\/llms\.txt"[^>]*>[^<]*<\/a>/
const TITLE_REGEX = /<title>[^<]*<\/title>/
const ROOT_PLACEHOLDER = '<div id="root"></div>'

for (const route of ROUTES) {
  const body = render(route.path)

  const html = template
    .replace(TITLE_REGEX, `<title>${route.title}</title>`)
    .replace(NOSCRIPT_REGEX, buildNoscript(route))
    .replace(ANCHOR_REGEX, buildAnchor(route))
    .replace(ROOT_PLACEHOLDER, `<div id="root">${body}</div>`)

  if (!html.includes(route.marker)) {
    console.error(
      `prerender: ${route.path} output is missing marker "${route.marker}". ` +
      `This means render() returned an empty or wrong tree. Aborting build.`
    )
    process.exit(1)
  }

  for (const out of route.outputs) {
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, html)
    console.log(`prerender: wrote ${out} (${html.length} bytes, marker "${route.marker}" present)`)
  }
}
```

- [ ] **Step 2: Verify the script runs against the existing build artefacts**

```bash
cd site && node scripts/prerender.mjs
```

Expected output:
```
prerender: wrote dist/index.html (NNNN bytes, marker "Adaptation" present)
prerender: wrote dist/rationale.html (NNNN bytes, marker "Hebisz" present)
prerender: wrote dist/rationale/index.html (NNNN bytes, marker "Hebisz" present)
```

If the marker check fails, that means `render()` is returning an empty or wrong tree — investigate before proceeding.

- [ ] **Step 3: Verify each output contains real content**

```bash
cd site && grep -c "Adaptation" dist/index.html && grep -c "Hebisz" dist/rationale.html && grep -c "Hebisz" dist/rationale/index.html
```

Expected: each grep returns a non-zero count.

- [ ] **Step 4: Verify the per-route metadata was injected**

```bash
cd site && grep "<title>" dist/index.html && grep "<title>" dist/rationale.html
```

Expected:
```
<title>High Torque Training</title>
<title>Rationale — High Torque Training</title>
```

```bash
cd site && grep -o 'href="/content/[a-z]*\.md"[^>]*aria-hidden' dist/index.html dist/rationale.html
```

Expected: `dist/index.html` contains `href="/content/workouts.md"`, `dist/rationale.html` contains `href="/content/rationale.md"`.

### Task 7: Wire the build pipeline in `package.json`

**Files:**
- Modify: `site/package.json`

- [ ] **Step 1: Update the `build` script and add `postbuild`**

In `site/package.json`, replace the `scripts` block:

```json
"scripts": {
  "dev": "vite",
  "prebuild": "rsync -a --delete --delete-excluded --include='*/' --include='*.zwo' --exclude='*' ../workouts/ public/workouts && cd public/workouts && zip -r high-torque-workouts.zip . && cd ../.. && mkdir -p public/content && cp ../research/high-torque-training-research.md public/content/rationale.md && cp ../research/training-calendar.md public/content/workouts.md && node scripts/generate-tss.mjs",
  "build": "tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr",
  "postbuild": "node scripts/prerender.mjs",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 2: Run the full build end-to-end**

```bash
cd site && rm -rf dist dist-ssr && npm run build
```

Expected: build succeeds; final output includes the three "prerender: wrote ..." lines from Task 6.

- [ ] **Step 3: `curl` both routes via preview server**

```bash
cd site && npx vite preview &
sleep 2
curl -s http://localhost:4173/ | grep -c "Adaptation"
curl -s http://localhost:4173/rationale | grep -c "Hebisz"
curl -s http://localhost:4173/rationale/ | grep -c "Hebisz"
kill %1
```

Expected: each `grep -c` returns a non-zero count.

- [ ] **Step 4: Manually open both routes in a browser**

```bash
cd site && npx vite preview
```

Open `http://localhost:4173/` and `http://localhost:4173/rationale`. Open DevTools → Console.

Expected:
- Both pages render the same as in dev mode.
- Console shows hydration-mismatch warnings (we haven't fixed the no-flash mechanism yet — known temporary state, addressed in Phase 4). Note them but don't fix here.
- No JavaScript errors.

Stop the preview server.

- [ ] **Step 5: Commit Phase 2 + Phase 3 together**

```bash
cd site && git add -A
git commit -m "Add per-route prerendering pipeline

- src/entry-server.tsx renders <App> via StaticRouter to a string.
- scripts/prerender.mjs reads dist/index.html as a template, calls
  render() for each route, injects per-route <title>, <noscript>,
  and off-screen agent anchor, writes static HTML.
- Router split: BrowserRouter moves from App.tsx to main.tsx;
  entry-server.tsx uses StaticRouter.
- main.tsx switches createRoot → hydrateRoot.
- package.json: build now also runs vite build --ssr; postbuild
  runs the prerender script.
- Build-time marker assertion: prerender exits non-zero if a route's
  output is missing its marker string (e.g. silent empty-shell
  regression).
- Both /rationale.html and /rationale/index.html are written to
  bypass GitHub Pages trailing-slash ambiguity.

Spec: site-specification/2026-05-03-prerender-design.md §3, §6, §7.

Known issue addressed in the next commit: hydration-mismatch
warnings and a brief flash of default state on first paint."
```

---

## Phase 4: No-flash hydration

After Phase 3, returning users see a brief flash of default state (panels open, empty tracker) before their persisted state takes over, and React logs hydration-mismatch warnings. This phase fixes both. (Spec §3.2.)

### Task 8: Add `useIsomorphicLayoutEffect` hook

**Files:**
- Create: `site/src/lib/useIsomorphicLayoutEffect.ts`

- [ ] **Step 1: Create the hook**

```ts
// site/src/lib/useIsomorphicLayoutEffect.ts
//
// useLayoutEffect on the client (synchronous, pre-paint), useEffect on
// the server (no-op). Used to swap from default state to localStorage
// state before the browser paints, eliminating the user-visible flash
// on first hydrate.
//
// See documentation/prerendering.md for why this matters.

import { useEffect, useLayoutEffect } from 'react'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect
```

### Task 9: Export `DEFAULT_STATE` from `storage.ts`

**Files:**
- Modify: `site/src/storage.ts`

- [ ] **Step 1: Rename and export `DEFAULT`**

In `site/src/storage.ts`, rename the local `DEFAULT` constant to `DEFAULT_STATE` and export it:

```ts
export const DEFAULT_STATE: AppState = {
  adaptation: {},
  panels: {
    intro: { collapsed: false },
    download: { collapsed: false },
    adaptation: { collapsed: false },
    collection: { collapsed: false },
  },
  log: [],
  adaptationCheckInConfirmed: false,
}
```

Update the two internal references (in `loadState`'s short-circuit and catch block) from `DEFAULT` to `DEFAULT_STATE`:

```ts
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    ...
  } catch {
    return DEFAULT_STATE
  }
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
cd site && npx tsc -b
```

Expected: clean exit.

### Task 10: Two-phase load in `AppShell`

**Files:**
- Modify: `site/src/App.tsx`

- [ ] **Step 1: Update `AppShell` to use two-phase load**

Replace the body of `AppShell` (currently `App.tsx:43–59`):

```tsx
function AppShell() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE)

  useIsomorphicLayoutEffect(() => {
    setState(loadState())
  }, [])

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage state={state} setState={setState} />} />
        <Route path="/rationale" element={<RationaleRoute />} />
      </Routes>
    </div>
  )
}
```

Update imports at the top of `App.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import IntroPanel from './components/IntroPanel'
import DownloadInstallPanel from './components/DownloadInstallPanel'
import AdaptationPanel from './components/AdaptationPanel'
import CollectionPanel from './components/CollectionPanel'
import RationalePage from './components/RationalePage'
import Header from './components/Header'
import Footer from './components/Footer'
import { loadState, saveState, DEFAULT_STATE } from './storage'
import useIsomorphicLayoutEffect from './lib/useIsomorphicLayoutEffect'
import type { AppState } from './types'
```

- [ ] **Step 2: Verify type-check**

```bash
cd site && npx tsc -b
```

Expected: clean exit.

- [ ] **Step 3: Run the full build**

```bash
cd site && rm -rf dist dist-ssr && npm run build
```

Expected: build succeeds; prerender output unchanged in shape (still three files written, markers present).

- [ ] **Step 4: Verify hydration cleanliness**

```bash
cd site && npx vite preview
```

Open `http://localhost:4173/` in the browser → DevTools → Console. Reload.

Expected: no hydration-mismatch warnings. (The first hydrate render now uses `DEFAULT_STATE`, which matches the SSR output exactly.)

Visit `http://localhost:4173/rationale` and reload.

Expected: also clean console.

- [ ] **Step 5: Verify the no-flash property manually**

In the same browser:
1. Open `http://localhost:4173/`.
2. Collapse the Adaptation panel.
3. Open DevTools → Performance tab → Throttling → CPU 6× slowdown.
4. Reload the page.

Expected: the Adaptation panel stays collapsed throughout the load. No moment where it appears expanded then snaps closed.

5. Switch to the Network tab → Throttling → "Slow 4G".
6. Reload again.

Expected: same — collapsed panel stays collapsed.

7. Disable throttling.
8. Mark a Collection card via "Did this today", then reload.

Expected: the tracker shows the entry on first paint; no flicker through an empty state.

Stop the preview server.

- [ ] **Step 6: Verify storage edge cases**

In DevTools → Application → Local Storage → `http://localhost:4173`:

1. Delete the `ht-state` key. Reload.

Expected: app loads with all panels expanded, empty tracker, no errors.

2. Set `ht-state` to `not valid json`. Reload.

Expected: app still loads with defaults; no errors in console.

3. Restore real state by interacting with the app, then verify `ht-state` is valid JSON again.

- [ ] **Step 7: Verify the build-time assertion still works**

Temporarily break the SSR render to confirm the assertion catches it:

```bash
cd site && cp src/entry-server.tsx /tmp/entry-server-backup.tsx
```

Edit `src/entry-server.tsx` to return an empty string:

```tsx
export function render(_url: string): string {
  return ''
}
```

```bash
cd site && rm -rf dist dist-ssr && npm run build
```

Expected: build fails with output like:
```
prerender: / output is missing marker "Adaptation". This means render() returned an empty or wrong tree. Aborting build.
```

Restore the file:

```bash
cd site && cp /tmp/entry-server-backup.tsx src/entry-server.tsx && rm /tmp/entry-server-backup.tsx
```

Verify the build now succeeds again:

```bash
cd site && rm -rf dist dist-ssr && npm run build
```

Expected: clean build with the three "prerender: wrote ..." lines.

- [ ] **Step 8: Commit**

```bash
cd site && git add -A
git commit -m "Eliminate hydration flash via two-phase state load

AppShell now initialises with DEFAULT_STATE so the first hydrate render
matches SSR output exactly (no hydration-mismatch warnings). A
useIsomorphicLayoutEffect then synchronously calls loadState() and
setState() before the browser paints, so the user never sees default
state on screen even briefly.

Adds src/lib/useIsomorphicLayoutEffect.ts (useLayoutEffect on client,
useEffect on server). Exports DEFAULT_STATE from src/storage.ts.

Spec: site-specification/2026-05-03-prerender-design.md §3.2."
```

---

## Phase 5: Documentation

### Task 11: Update `documentation/agent-interfacing.md`

**Files:**
- Modify: `documentation/agent-interfacing.md`

- [ ] **Step 1: Replace the deferred §6 with the implemented description**

In `documentation/agent-interfacing.md`, find the section labelled `### 6. Per-route prerendering — *deferred, not yet built*` and replace it with:

```markdown
### 6. Per-route prerendering

**What.** A build-time step (`site/scripts/prerender.mjs`, invoked from
`postbuild`) that emits route-specific HTML — `dist/index.html` for the
home (workouts) page, and both `dist/rationale.html` and
`dist/rationale/index.html` for the rationale page. Each carries its
own `<title>`, `<noscript>` block, and off-screen agent anchor pointing
at its primary markdown counterpart.

**Why.** Without prerendering, `curl https://.../rationale` returns an
empty `<div id="root">`. Crawlers, link previews, reader-mode
browsers, and agents that don't run JS get nothing. The prerender
makes each route's content available in the initial HTML response, and
makes the per-page agent hints (above) addressable per route instead
of being averaged across one shared template.

**Details.** See `documentation/prerendering.md` for the load-bearing
outcomes (what any future refactor must preserve), the components,
and the rationale for collateral choices that can change without
breaking anything.
```

- [ ] **Step 2: Add a new check to "How to verify"**

In the same document, find the `## How to verify agents can still read the site` section. Add a new numbered item before "Test against the deployed site":

```markdown
1. **Static HTML smoke check.** After any change to the prerender
   pipeline, build the site and `curl` both routes against the local
   preview server:

   ```bash
   cd site && npm run build && npx vite preview &
   sleep 2
   curl -s http://localhost:4173/ | grep -q Adaptation && echo "✓ home prerendered"
   curl -s http://localhost:4173/rationale | grep -q Hebisz && echo "✓ rationale prerendered"
   ```

   Both lines should print. If either is silent, the prerender produced
   an empty shell — investigate before deploying.
```

Renumber the subsequent items.

- [ ] **Step 3: Update the "Quick reference" block**

In the `## Quick reference` block, add two lines for the new pieces (alphabetically by path):

```
site/scripts/prerender.mjs              per-route static HTML emitter (postbuild)
site/src/entry-server.tsx               SSR entry: renderToString(<App/>)
```

### Task 12: Write `documentation/prerendering.md`

**Files:**
- Create: `documentation/prerendering.md`

- [ ] **Step 1: Write the document**

```markdown
# Per-route prerendering

The site is a React SPA. Without help, `curl https://.../rationale`
would return an empty `<div id="root">` — crawlers, link previews,
reader-mode browsers, and agents that don't run JS would get nothing
useful. This document describes the prerender pipeline that fixes that
and the no-flash hydration mechanism that keeps it invisible to users.

The audience for this doc is **a future Claude (or human) considering
a refactor**. The aim is to make clear what outcomes are load-bearing
(must be preserved by any refactor) versus what's collateral technical
detail (replaceable without breaking anything).

## Essential outcomes — preserve these

Any refactor must keep these properties true:

1. **`curl` of `/` and `/rationale` returns real HTML containing the
   page's actual content** — not an empty SPA shell. Verifiable with:

   ```bash
   curl -s https://high-torque.jelen.dk/ | grep -q Adaptation
   curl -s https://high-torque.jelen.dk/rationale | grep -q Hebisz
   ```

2. **No user-visible flash of default state on first paint** when the
   user has persisted state in `localStorage`. A returning user with
   collapsed panels must see them collapsed throughout the load —
   never a moment where they appear expanded.

3. **Each route carries its own `<title>`, `<noscript>` block, and
   off-screen agent anchor** pointing at its primary markdown
   counterpart. The home page primarily hints at
   `/content/workouts.md`; the rationale page primarily hints at
   `/content/rationale.md`. Both pages still mention `/llms.txt` for
   the attribution rules.

4. **Build fails loudly if the prerender silently produces an empty
   `<div id="root">`** for any route. The marker-string assertion in
   the prerender script is the safety net against the regression mode
   we most fear: a future change that breaks SSR but ships green.

5. **Both `dist/rationale.html` and `dist/rationale/index.html` are
   written.** GitHub Pages' trailing-slash behaviour for path-style
   URLs varies by config; writing both files makes either form work
   without depending on the host.

If a refactor preserves all five, the implementation can change
freely.

## Components

For each piece: **what** it is and **why** it's there. Listed roughly
in order of how load-bearing each is.

### 1. `site/scripts/prerender.mjs`

**What.** A small Node ESM script invoked from `postbuild`. Reads
`dist/index.html` as a template, imports `render(url)` from the SSR
bundle, and for each configured route: calls `render`, injects
route-specific `<title>` / `<noscript>` / off-screen anchor into the
template via string replacement, asserts the output contains a
known marker string, and writes the result to one or more output
paths.

**Why.** This is the load-bearing component. It's the place that
guarantees outcomes 1, 3, 4, and 5 simultaneously. The route table
inside the script is the single source of truth for per-page
metadata.

### 2. `site/src/entry-server.tsx`

**What.** A small entry file that exports
`render(url) = renderToString(<StaticRouter location={url}><App/></StaticRouter>)`.
Compiled by `vite build --ssr` into `dist-ssr/entry-server.js`.

**Why.** Imports the same `<App />` the client does, so the SSR and
CSR trees can never diverge. Using `<StaticRouter>` here (instead of
`<BrowserRouter>`) is what makes per-URL rendering possible.

### 3. Two-phase hydration in `AppShell`

**What.** `AppShell` initialises with `DEFAULT_STATE` (so the first
hydrate render matches the SSR output exactly), then a
`useIsomorphicLayoutEffect` synchronously calls `loadState()` and
`setState(...)` before the browser paints.

**Why.** This is what guarantees outcome 2 (no flash). The two-phase
pattern matters specifically because:
- Initialising with `loadState()` directly would cause hydration
  mismatch warnings (SSR rendered defaults; client wants user state).
- Loading state in a regular `useEffect` would run *after* paint,
  which is the flash.
- `useLayoutEffect` runs synchronously before paint, but warns under
  SSR — hence the isomorphic wrapper.

Any refactor that swaps SSR frameworks must reproduce this pattern
or its equivalent.

### 4. Build-time marker assertion in `prerender.mjs`

**What.** After each route's HTML is built, the script checks
`html.includes(route.marker)` and `process.exit(1)` if false.
Markers are deliberately chosen as content the page must always
contain (`Adaptation` for home, `Hebisz` for rationale).

**Why.** The most insidious failure mode is "build succeeds but the
output is an empty SPA shell." This guards against it. If the
markers ever become wrong (e.g. a content rewrite removes the word
"Adaptation"), pick a new marker — the *mechanism* is what matters,
not the exact strings.

### 5. Per-route HTML rewriting

**What.** The prerender script does targeted string replacements on
the shared `dist/index.html` template:
- `<title>...</title>` → route-specific title.
- `<noscript>...</noscript>` → route-specific noscript with primary
  markdown link first.
- The off-screen `<a href="/llms.txt" ...>` anchor → a route-specific
  anchor pointing at the page's primary markdown counterpart.
- `<div id="root"></div>` → `<div id="root">{rendered HTML}</div>`.

**Why.** Per-page agent hints (outcome 3) and content (outcome 1).
String replacement is sufficient because the template is
small, the regions are unambiguous, and the cost of a real templating
engine isn't justified for two routes.

### 6. Dual-output for `/rationale`

**What.** Both `dist/rationale.html` and `dist/rationale/index.html`
are written with identical content.

**Why.** GitHub Pages' behaviour for `/rationale` (no trailing slash)
versus `/rationale/` (with) depends on configuration that varies.
Writing both costs one extra `writeFileSync` and eliminates the
question entirely. Outcome 5.

## Collateral choices — replaceable

These are *implementation choices*, not requirements. A refactor can
change them freely as long as the essential outcomes still hold.

- **Custom `vite build --ssr` + a 60-line script.** Could be replaced
  by a Vite SSG plugin (vike, etc.) or by an Astro migration. The
  custom approach was chosen for two routes; if the route count
  grows substantially, the calculus changes.
- **Marker strings (`Adaptation`, `Hebisz`).** Pick anything the page
  must always contain. The strings are an implementation detail of
  the assertion mechanism.
- **Markdown links inside the noscript blocks.** The per-route
  metadata is configuration in the script's route table; updating
  link text or descriptions is safe.
- **Tailwind plugged into the SSR build.** Currently
  `@tailwindcss/vite` runs for both client and SSR builds. If a
  future Tailwind version breaks the SSR pass, gating the plugin
  behind `mode !== 'ssr'` is a safe escape hatch — SSR only needs
  HTML, not Tailwind-processed CSS.
- **`react-dom/server.renderToString`.** Could be `renderToPipeableStream`
  or any equivalent. We don't need streaming for two static routes.
- **String-replace vs. a templating engine.** The four substitutions
  are unambiguous; using `mustache`/`handlebars` would be over-
  engineering. If the substitutions ever grow more complex, switch.

## Rejected alternatives

- **Astro.** Optimised for content-heavy pages with sparse interactive
  islands; this site is the inverse — almost every component is
  interactive (collapsibles, mark-complete, tracker, adaptation
  state). Migrating means turning every component into an island and
  inventing new ways to share state. *More* complexity for two
  routes, not less.
- **vike or similar Vite SSG plugin.** Inherits framework cost
  without giving anything compelling for two routes.
- **react-snap.** Unmaintained and Vite-unfriendly.
- **Inline pre-hydration script** that reads `localStorage` and
  stashes it on `window.__HT_STATE__` before React loads. Considered
  during design. Redundant once `useIsomorphicLayoutEffect` is in
  place — the layout effect runs before paint and can read
  `localStorage` directly. The inline script would have added
  complexity (template insertion point, window-attribute coupling)
  for no behavioural improvement.

## Quick reference

```
site/scripts/prerender.mjs              per-route static HTML emitter (postbuild)
site/src/entry-server.tsx               SSR entry — renderToString(<App/>)
site/src/lib/useIsomorphicLayoutEffect.ts   no-flash hydration helper
site/src/App.tsx                        AppShell two-phase state load
site/src/main.tsx                       hydrateRoot + BrowserRouter
site/package.json                       build runs vite build --ssr; postbuild runs prerender
```

## How to verify it still works

After any change to the prerender pipeline, the SSR build, the
hydration mechanism, or `AppShell`'s state load:

1. **Build and curl:**

   ```bash
   cd site && rm -rf dist dist-ssr && npm run build && npx vite preview &
   sleep 2
   curl -s http://localhost:4173/ | grep -q Adaptation && echo "✓ home"
   curl -s http://localhost:4173/rationale | grep -q Hebisz && echo "✓ rationale"
   curl -s http://localhost:4173/rationale/ | grep -q Hebisz && echo "✓ rationale (slash)"
   ```

   All three should print.

2. **No-flash check.** Open `http://localhost:4173/`, collapse a
   panel, throttle CPU to 6× in DevTools, reload. The collapsed
   panel must remain collapsed throughout — no moment where it
   appears expanded.

3. **Hydration cleanliness.** Open both routes, DevTools → Console
   should be free of hydration-mismatch warnings.

4. **Marker assertion.** Edit `entry-server.tsx` to return `''`,
   run `npm run build` — the build must fail with a clear error.
   Revert.

## Lifespan note

This whole pipeline is about 100 lines of code we own. It exists
because:
- The site is a SPA (so SSR is needed for `curl` to work),
- The site has stateful UI (so two-phase hydration is needed for
  no-flash), and
- The site has only two routes (so a custom script is cheaper than a
  framework migration).

If any of those facts changes, this document and the implementation
should be revisited. For example: if the site grows to many routes,
a framework migration may be worth the cost. If all stateful UI
moves to React Server Components, the flash problem disappears at
the platform level and the layout-effect dance becomes vestigial.

The goal is the essential outcomes, not preserving the workaround.
```

- [ ] **Step 2: Verify the document is internally consistent**

```bash
grep -n "outcome 1\|outcome 2\|outcome 3\|outcome 4\|outcome 5" documentation/prerendering.md
```

Expected: each outcome reference is grounded in the numbered list at the top.

### Task 13: Commit documentation

- [ ] **Step 1: Commit**

```bash
cd /home/jelen/code/jelen/high-torque-training && git add documentation/agent-interfacing.md documentation/prerendering.md
git commit -m "Document the per-route prerendering pipeline

- documentation/prerendering.md: new. Future-refactor-friendly doc
  modelled on agent-interfacing.md, focused on which outcomes are
  load-bearing vs which technical choices are collateral and
  replaceable.
- documentation/agent-interfacing.md §6 changes from 'deferred' to
  'implemented' with a forward-link to the new doc, plus a new
  static-HTML smoke check in 'How to verify'."
```

---

## Phase 6: Final verification before declaring done

### Task 14: End-to-end verification checklist

- [ ] **Step 1: Clean build**

```bash
cd site && rm -rf dist dist-ssr && npm run build
```

Expected: completes cleanly. Final lines include the three "prerender: wrote ..." messages.

- [ ] **Step 2: All static HTML curls pass**

```bash
cd site && npx vite preview &
sleep 2
curl -s http://localhost:4173/ | grep -q Adaptation && echo "✓ home"
curl -s http://localhost:4173/rationale | grep -q Hebisz && echo "✓ rationale (no slash)"
curl -s http://localhost:4173/rationale/ | grep -q Hebisz && echo "✓ rationale (slash)"
```

Expected: all three "✓" lines print.

- [ ] **Step 3: Per-route metadata is present**

```bash
curl -s http://localhost:4173/ | grep -o '<title>[^<]*</title>'
curl -s http://localhost:4173/rationale | grep -o '<title>[^<]*</title>'
curl -s http://localhost:4173/ | grep -o 'href="/content/[a-z]*\.md"[^>]*aria-hidden'
curl -s http://localhost:4173/rationale | grep -o 'href="/content/[a-z]*\.md"[^>]*aria-hidden'
```

Expected:
- Home title: `<title>High Torque Training</title>`
- Rationale title: `<title>Rationale — High Torque Training</title>`
- Home anchor: `href="/content/workouts.md"...aria-hidden`
- Rationale anchor: `href="/content/rationale.md"...aria-hidden`

- [ ] **Step 4: Browser hydration clean on both routes**

Open `http://localhost:4173/` → DevTools → Console → reload. Expected: no hydration warnings, no errors.

Open `http://localhost:4173/rationale` → DevTools → Console → reload. Expected: no hydration warnings, no errors.

- [ ] **Step 5: No-flash with persisted state**

1. On `http://localhost:4173/`, collapse the Adaptation panel and the Intro panel.
2. DevTools → Performance → CPU 6× slowdown.
3. Reload.

Expected: both panels stay collapsed throughout the load.

4. Mark a Collection card via "Did this today".
5. Reload.

Expected: tracker shows the entry on first paint; no flicker.

6. Reset CPU throttling.

- [ ] **Step 6: Storage edge cases handled**

In DevTools → Application → Local Storage:

1. Delete `ht-state` key. Reload. Expected: defaults, no errors.
2. Set `ht-state` to `not valid json`. Reload. Expected: defaults, no errors.

Stop the preview server.

- [ ] **Step 7: Existing test suite still passes**

```bash
cd site && npm test
```

Expected: pass.

```bash
cd site && npx tsc -b
```

Expected: clean.

- [ ] **Step 8: Done**

If all steps above passed, the implementation is complete.

If a step failed:
- Hydration warnings → revisit Phase 4 Task 10 Step 4. The most common cause is a component that uses `Date.now()` or `Math.random()` differently between SSR and client renders.
- `curl` returns an empty shell → run the prerender script in isolation (`node scripts/prerender.mjs`) and check the marker assertion output.
- Flash on reload → confirm `useIsomorphicLayoutEffect` is being used (not `useEffect`) and that `loadState()` is reading from the right key.
