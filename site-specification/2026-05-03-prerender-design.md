# Per-route prerendering — design

Final, deferred phase of the site redesign (`implementation-plan.md` §7).
This document supersedes that section with the design as it stands now,
written after the rest of the redesign has shipped and the constraints are
better understood.

## 1. Goal

Make `curl https://high-torque.jelen.dk/` and
`curl https://high-torque.jelen.dk/rationale` return fully-rendered HTML
containing each page's actual content, so deep links, link previews,
reader-mode browsers, and crawlers all work without running JavaScript.
Each route gets its own `<title>`, `<noscript>` block, and off-screen
agent anchor pointing at that page's primary markdown counterpart.

User experience is the priority: a returning user must not see a flash
of default state (panels open, empty tracker) before their persisted
state takes over. Agent-interfacing documentation is updated to reflect
that the per-route prerender is now built, not deferred.

## 2. Scope

In scope:

- Custom `vite build --ssr` + `scripts/prerender.mjs` writing static HTML
  for both routes.
- A two-phase hydration that prevents the user-visible flash of
  default state.
- Per-page `<title>`, `<noscript>`, and off-screen anchor.
- Renaming `/science` → `/rationale` (visible label and URL) as a
  prerequisite, before the prerender work begins.
- Updating `documentation/agent-interfacing.md`, `site/CLAUDE.md`,
  `site/public/llms.txt`, and any code/script references that mention
  the old route or constant names.

Out of scope: route splitting beyond `/` and `/rationale`, content or
layout changes, mobile, framework migration (Astro, vike, react-snap).

## 3. Architectural decisions

### 3.1 Tooling: custom prerender, no framework

Stick with the original plan's choice — custom
`vite build --ssr src/entry-server.tsx` plus a small
`scripts/prerender.mjs`. Roughly 60 lines of code we own outright,
written once.

Rejected alternatives:

- **Astro.** Optimised for content-heavy pages with sparse interactive
  islands; this site is the inverse, almost every component is
  interactive (collapsibles, mark-complete, tracker, adaptation state).
  An Astro migration would mean turning every component into an island
  and inventing new ways to share state — *more* complexity, not less.
- **vike** (or similar Vite SSG plugin). Inherits framework cost
  without giving anything compelling for two routes.
- **react-snap.** Original plan already rejected as unmaintained and
  Vite-unfriendly. Still true.

### 3.2 No-flash hydration

The flash problem: prerendered HTML carries default state baked in
(every panel `open`, empty tracker, no adaptation progress). Without
intervention, a returning user with collapsed panels would see them
open for one frame before snapping closed when React reads
`localStorage` in a `useEffect`.

**The fix: two-phase load via `useIsomorphicLayoutEffect`.**

- **Phase 1 — first hydrate render uses defaults.** `AppShell`'s
  `useState` initialiser returns `DEFAULT_STATE` (not `loadState()`),
  so the React tree on first hydrate matches the SSR output exactly.
  Clean hydrate, no console warnings.
- **Phase 2 — synchronous swap to real state pre-paint.** An effect
  immediately calls `loadState()` (which reads `localStorage`) and
  `setState(...)`. The catch is *which* effect: `useEffect` runs
  *after* the browser paints — that's the flash. `useLayoutEffect`
  runs synchronously *before* paint, which is what we want, but it
  warns under SSR. The standard fix is a tiny utility hook —
  `useLayoutEffect` on the client, `useEffect` on the server (where
  it's a no-op anyway).

Net result: clean hydration (no warnings), no flash (state swaps
before paint), no inline scripts. One small hook utility (~5 lines)
and a one-line change to how `AppShell` initialises its state.

`storage.ts`'s `loadState()` is unchanged — it already returns
defaults on parse failure or missing key.

### 3.3 Route file shape — both forms

Write both `dist/rationale.html` and `dist/rationale/index.html`.
Eliminates the trailing-slash question entirely; whichever form an
external link uses, it works. Costs one extra `writeFileSync` per
route. The home route is unambiguous (`dist/index.html`).

### 3.4 Build-time assertion

After writing each output file, the prerender script asserts that the
output contains a known marker string for that route — `Adaptation`
for `/`, `Hebisz` for `/rationale`. If the assertion fails (e.g. a
future change silently produces an empty `<div id="root">` again), the
script calls `process.exit(1)` and the build fails loudly.

## 4. The `/science` → `/rationale` rename

The route name should match the markdown file (`rationale.md`) and
the conceptual framing — the page is a rationale that uses science to
justify its claims, not a science textbook. The visible label changes
to "Rationale" everywhere it appears.

The rename is logically independent of prerendering — it works on the
existing SPA. Ship it as a **prerequisite commit** before the
prerender work begins, so the prerender plan can assume `/rationale`
is already the live route. Cleaner blame history; both PRs stay
focused.

Surface to update during the rename:

- **Code**: `src/App.tsx` (route, `SCIENCE_LAST_UPDATED` → `RATIONALE_LAST_UPDATED`,
  `ScienceRoute` → `RationaleRoute`, `SciencePage` import name),
  `src/components/Header.tsx` (path, label, `onScience` → `onRationale`),
  `src/components/IntroPanel.tsx` (link href, link text),
  `src/components/SciencePage.tsx` → `src/components/RationalePage.tsx`
  (file and component rename),
  `site/scripts/check-consistency.mjs` (URL path, variable names,
  prompt text mentioning "science/rationale page" updates to
  "rationale page").
- **HTML/markdown**: `site/index.html` (alternate-link `title`
  attributes referring to "Science"), `site/public/llms.txt`
  (URL `/science` → `/rationale`).
- **Docs**: `site/CLAUDE.md` (`SCIENCE_LAST_UPDATED` constant name and
  the surrounding rationale prose), `documentation/agent-interfacing.md`
  (the §"How to verify" prompt that mentions "the science page"),
  `site-specification/redesign.md` and
  `site-specification/implementation-plan.md` left alone — they're
  historical artefacts of decisions already made.

The rename does **not** change content of the rationale page itself,
nor the markdown file's name (`rationale.md` is already correct).

## 5. Per-page agent hints

Once each route has its own static HTML, the shared `<noscript>` block
and shared off-screen anchor in `index.html` can be split per-page.

**Home page (`/`):**

- `<title>` — *High Torque Training* (unchanged).
- `<noscript>` — names `workouts.md` as the primary, mentions
  `rationale.md` as the companion, includes the imperative phrasing
  the agent-interfacing document defends ("Agents and LLMs: fetch one
  of those URLs instead of trying to parse this HTML").
- Off-screen anchor — points at `/content/workouts.md`.

**Rationale page (`/rationale`):**

- `<title>` — *Rationale — High Torque Training*.
- `<noscript>` — names `rationale.md` as the primary, mentions
  `workouts.md` as the companion, same imperative phrasing.
- Off-screen anchor — points at `/content/rationale.md`.

The `<link rel="alternate">` tags in `<head>` stay shared between both
pages — those advertise *all* alternates regardless of which page
you're on, which is the correct semantic.

The `/llms.txt` reference stays in both `<noscript>` blocks. It carries
the attribution rules; both pages need to point agents at it.

The mechanism: the prerender script reads `dist/index.html` as a
template and does targeted string replacements (`<title>`,
`<noscript>` content, off-screen anchor `href`) before injecting the
rendered React markup into `<div id="root">`. Per-page values live in
a small map at the top of the script.

## 6. Build pipeline shape

`package.json` script changes:

- `prebuild` — unchanged (rsync workouts, zip, copy markdown,
  generate TSS).
- `build` — extends to:
  `tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
  The SSR bundle lands in `dist-ssr/` and is read by the prerender
  script. Gitignored.
- `postbuild` — new:
  `node scripts/prerender.mjs`.

Conceptual flow inside `scripts/prerender.mjs`:

```
template = readFileSync('dist/index.html')
{ render } = await import('../dist-ssr/entry-server.js')

routes = [
  { path: '/',          outputs: ['dist/index.html'],
    marker: 'Adaptation', title: '…', noscript: '…', anchor: '…' },
  { path: '/rationale', outputs: ['dist/rationale.html',
                                  'dist/rationale/index.html'],
    marker: 'Hebisz',     title: '…', noscript: '…', anchor: '…' },
]

for route of routes:
  body = render(route.path)
  html = template
    .replace('<title>…</title>',         route.title)
    .replace('<noscript>…</noscript>',   route.noscript)
    .replace(anchorRegex,                route.anchor)
    .replace('<div id="root"></div>',    `<div id="root">${body}</div>`)
  for output of route.outputs:
    writeFileSync(output, html)
    assert html.includes(route.marker) || process.exit(1)
```

## 7. File-level changes

**New**:

- `src/entry-server.tsx` — exports
  `render(url) = renderToString(<StaticRouter location={url}><App/></StaticRouter>)`.
- `scripts/prerender.mjs` — the orchestrator described above.
- `src/lib/useIsomorphicLayoutEffect.ts` — `useLayoutEffect` on
  client, `useEffect` on server.

**Modified**:

- `src/main.tsx` — `createRoot` → `hydrateRoot`; wraps the tree in
  `BrowserRouter` (the inner `App` no longer does — see router split
  below).
- `src/App.tsx` — two changes:
  - **Router split.** The inner `<App />` no longer wraps in
    `BrowserRouter`. The client entry (`main.tsx`) wraps in
    `BrowserRouter`; `entry-server.tsx` wraps in `StaticRouter`. This
    split is required so both entries can supply the right router for
    their environment.
  - **Two-phase state load in `AppShell`.** `useState(() => loadState())`
    becomes `useState(DEFAULT_STATE)` so the first hydrate render
    matches SSR exactly. A `useIsomorphicLayoutEffect` then calls
    `loadState()` and `setState(...)` once on mount — swapping to the
    user's real state pre-paint. Panel components stay unchanged: they
    keep reading state via props, just the source switches from default
    → real before the first frame is shown.
- `index.html` — keep one shared base template; per-route variation
  (`<title>`, `<noscript>`, off-screen anchor `href`) is injected by
  the prerender script.
- `package.json` — `build` extends, `postbuild` added.

**Documentation** (also part of this work, after the rename has landed):

- `documentation/agent-interfacing.md` §6 changes from "deferred" to
  "implemented" with a description of the resulting per-page hints.
  §"How to verify agents can still read the site" gains an item:
  `curl` both prerendered URLs and confirm the content is in the
  response body.
- `site/CLAUDE.md` — already updated during the rename for the
  constant name change; nothing further here.
- `site/public/llms.txt` — already updated during the rename for the
  URL change; nothing further here.

## 8. Risks and rollback

- **`@tailwindcss/vite` under `--ssr`.** Original plan flagged this as
  "verify early" and that's still the right move. Tailwind in
  production confirms client build works, but the SSR pass hasn't been
  exercised. First implementation step is the smoke test from the
  original plan: stub `entry-server.tsx`, run `vite build --ssr`,
  confirm no CSS errors. Fallback ladder unchanged:
  - (a) gate the plugin behind `mode !== 'ssr'` in `vite.config.ts`;
  - (b) drop the Vite plugin and use Tailwind v4 via
    `@import "tailwindcss"` in `src/index.css` only;
  - (c) fall back to Tailwind v3 + PostCSS.
- **Hydration mismatch warnings.** Mitigated by §3.2's strategy
  (render defaults on first hydrate, swap pre-paint via
  `useIsomorphicLayoutEffect`). If warnings appear from a component
  we missed, test is: Open DevTools → reload → console clean on both
  routes.
- **localStorage corrupted.** `loadState()` already wraps `JSON.parse`
  in `try/catch` and returns defaults on parse failure. The two-phase
  load means the user briefly sees defaults if their state is
  corrupt — same outcome as today, just on a slightly different code
  path.
- **Rollback.** If prerendering misbehaves on first deploy, removing
  `postbuild` from `package.json` and reverting `main.tsx` to
  `createRoot` returns the site to current behavior. `entry-server.tsx`
  and `scripts/prerender.mjs` can stay on disk; without `postbuild`
  invoking them, they're inert.

## 9. Verification

**Per-route static HTML:**

- `curl http://localhost:4173/ | grep -q "Adaptation"` ✓
- `curl http://localhost:4173/rationale | grep -q "Hebisz"` ✓
- `curl http://localhost:4173/rationale/ | grep -q "Hebisz"` ✓
- View source on each: `<div id="root">` contains real markup.
- View source on each: `<title>`, `<noscript>`, and off-screen anchor
  carry the route-specific values.

**Hydration cleanliness:**

- DevTools console clean on first load of `/` and `/rationale` — no
  hydration-mismatch warnings.

**No-flash:**

- Open the site, collapse a panel, reload. Throttle CPU to 6× in
  DevTools to slow hydration. The collapsed panel must remain
  collapsed throughout — no momentary opening.
- Repeat with the tracker after logging an entry: the tracker must
  show the entry on first paint, not flicker through an empty state.

**Storage edge cases:**

- Wipe `ht-state` → first paint shows defaults (everything expanded,
  empty tracker), no errors.
- Corrupt `ht-state` to invalid JSON → app loads with defaults.

**Build-time assertion:**

- Edit `entry-server.tsx` to return an empty string. `npm run build`
  must fail with a clear error referencing the missing marker. Revert.

**Agent reliability** (per `documentation/agent-interfacing.md`'s
existing test):

- After the deploy, run the §"How to verify agents can still read the
  site" prompts in fresh chat sessions and confirm agents reach the
  markdown content and preserve attribution.
