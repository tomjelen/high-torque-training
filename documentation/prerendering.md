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

4. **Build fails loudly if the prerender silently produces wrong
   output** — empty `<div id="root">`, missing `<noscript>` swap,
   missing `<title>` swap, missing anchor swap. The prerender script
   has two layers of safety: (a) up-front validation that the template
   still matches every substitution pattern, and (b) a per-route
   marker-string assertion after substitution. This is the safety net
   against the regression mode we most fear: a future change that
   breaks SSR or template assumptions but ships green.

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
template via string replacement, asserts the output contains a known
marker string, and writes the result to one or more output paths.

Before processing any route, the script also validates up-front that
the template still matches every substitution pattern — so a future
edit to `index.html` that breaks one of the regexes fails the build
loudly instead of silently producing stale output.

**Why.** This is the load-bearing component. It's the place that
guarantees outcomes 1, 3, 4, and 5 simultaneously. The route table
inside the script is the single source of truth for per-page metadata.

### 2. `site/src/entry-server.tsx`

**What.** A small entry file that exports
`render(url) = renderToString(<StaticRouter location={url}><App/></StaticRouter>)`.
Compiled by `vite build --ssr` into `dist-ssr/entry-server.js`.

**Why.** Imports the same `<App />` the client does, so the SSR and
CSR trees can never diverge. Using `<StaticRouter>` here (instead of
`<BrowserRouter>`) is what makes per-URL rendering possible.

### 3. Two-phase hydration in `AppShell` (SSR-collapsed + layout effect)

**What.** Two pieces working together:

- **SSR / first hydrate render uses `PRERENDER_STATE`** — a constant
  in `storage.ts` that's structurally `DEFAULT_STATE` but with every
  panel `collapsed: true`. So the prerendered HTML and the client's
  first render both have all `<details>` rendered *without* the
  `open` attribute.
- **`useIsomorphicLayoutEffect` then calls `loadState()` and
  `setState(...)`** synchronously before paint of subsequent React
  renders. For returning users, this brings in their persisted state.
  For first-time visitors, `loadState()` returns `DEFAULT_STATE`
  (panels expanded), and the layout effect applies it.

**Why.** This is what guarantees outcome 2 (no flash). The mechanism
specifically addresses the SSR painting problem:

- The browser paints SSR HTML *before* the JS bundle loads. If the
  SSR HTML had panels open (per `DEFAULT_STATE`) and the user has
  collapsed panels in `localStorage`, the user would see panels
  open-then-closed when JS finally hydrates — a jarring
  content-disappears flash.
- Rendering panels collapsed by default in SSR means the worst-case
  flash flips direction: first-time visitors see panels closed, then
  they open as the layout effect runs. That "reveal" direction is
  psychologically benign — content appears, doesn't disappear.
- `useLayoutEffect` (via the isomorphic wrapper) runs before *the
  next* paint after React commits, so the reveal happens in one
  paint cycle once JS is ready.

Returning users with all panels collapsed see zero flash. Returning
users with mixed state see only the panels they had open reveal.
First-time visitors see all panels reveal. The trade-off was
deliberate (see the rejected alternative below).

A subtle implementation detail that's load-bearing for performance:
`loadState()` returns the *same `DEFAULT_STATE` reference* (not a
structural copy) when `localStorage` is empty. React's `setState`
on the same reference bails out, so the no-saved-state path skips an
unnecessary re-render. Correctness is unaffected if someone changes
`return DEFAULT_STATE` to `return {...DEFAULT_STATE}` — but the
bailout disappears.

Any refactor that swaps SSR frameworks must reproduce this pattern
(or its equivalent — a way to render in a "safe" state on the server
that won't flash for the common returning-user case, then load the
real state pre-paint on the client).

**What does still flash:** the tracker entries and adaptation card
completion states populate via the layout effect after hydration.
For returning users with logged sessions or completed adaptation
weeks, those bits of personal content "appear" rather than being
present in the prerender. This is acceptable: it's a reveal of
user-specific data, which feels like progressive enhancement, not a
chrome glitch. Eliminating it would require either server-side
state (impossible on static hosting) or a much larger refactor of
how state mounts.

### 4. Two-layer build-time safety net in `prerender.mjs`

**What.**
- **Pre-loop:** validates that `index.html` still contains each of the
  four substitution patterns (`<title>...`, `<noscript>...`, the
  off-screen `<a href="/llms.txt">` anchor, and the
  `<div id="root"></div>` placeholder). `process.exit(1)` if any
  pattern stops matching.
- **Per route:** after substitution, checks the output contains a
  known marker string (`Adaptation` for home, `Hebisz` for rationale).
  `process.exit(1)` if missing.

Markers are deliberately content the page must always contain.

**Why.** The most insidious failure modes are silent:
- "Build succeeds but the output is an empty SPA shell" — caught by
  the marker assertion.
- "Template was reformatted, regex doesn't match anymore, substitution
  silently no-ops" — caught by the up-front validation.

If markers ever become wrong (e.g. a content rewrite removes the word
"Adaptation"), pick a new marker — the *mechanism* is what matters,
not the exact strings. Same for the patterns: the *mechanism* of
"validate before substituting" is what matters; the exact regexes
adapt to whatever shape `index.html` takes.

### 5. Per-route HTML rewriting

**What.** The prerender script does targeted string replacements on
the shared `dist/index.html` template:

- `<title>...</title>` → route-specific title.
- `<noscript>...</noscript>` → route-specific noscript with primary
  markdown link first.
- The off-screen `<a href="/llms.txt" ...>` anchor → a route-specific
  anchor pointing at the page's primary markdown counterpart.
- `<div id="root"></div>` → `<div id="root">{rendered HTML}</div>`.

Order is load-bearing: the new noscript block contains its own
`<a href="/llms.txt">` link, so the anchor replacement must run
*after* the noscript replacement (and rely on document order to make
sure the right match wins). The script comments this inline.

**Why.** Per-page agent hints (outcome 3) and content (outcome 1).
String replacement is sufficient because the template is small, the
regions are unambiguous, and the cost of a real templating engine
isn't justified for two routes.

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

- **Custom `vite build --ssr` + a 100-line script.** Could be
  replaced by a Vite SSG plugin (vike, etc.) or by an Astro
  migration. The custom approach was chosen for two routes; if the
  route count grows substantially, the calculus changes.
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
- **`typeof window !== 'undefined'` in `useIsomorphicLayoutEffect`.**
  Functionally equivalent to `typeof document !== 'undefined'`.
  Matches what `react-redux` and `framer-motion` use.

## Rejected alternatives

- **Astro.** Optimised for content-heavy pages with sparse interactive
  islands; this site is the inverse — almost every component is
  interactive (collapsibles, mark-complete, tracker, adaptation
  state). Migrating means turning every component into an island and
  inventing new ways to share state. *More* complexity for two routes,
  not less.
- **vike or similar Vite SSG plugin.** Inherits framework cost
  without giving anything compelling for two routes.
- **react-snap.** Unmaintained and Vite-unfriendly.
- **Inline pre-hydration script that mutates `<details>` `open`
  attributes** (the dark-mode-style pattern). Considered during
  design and again during implementation after the first attempt at
  no-flash hydration was found to still flash. Rejected because
  unlike dark mode — where the inline script sets a class on
  `<html>` (which React doesn't render) — the `open` attribute on
  `<details>` is *managed by React's vDOM*. To make the pattern work
  with React-managed attributes you'd need both a DOM mutation in
  the script AND a state-stashing on `window` so React's `useState`
  initialiser sees the persisted state. That doubles the moving
  parts (~40 lines, two coordinated locations) and creates a brittle
  coupling between the HTML script and the React state shape. The
  `Panel.tsx` component compounds this: the collapsed-state teaser
  is conditional on React state, not on the DOM `open` attribute, so
  even with a perfect DOM mutation the teaser would still pop in
  late. Start-collapsed-in-SSR delivers most of the benefit at much
  lower complexity.

- **Inline pre-hydration script that stashes localStorage on
  `window.__HT_STATE__`**, with `useState` initialiser reading from
  it. An older design variant. Doesn't actually fix the flash on
  its own — the JS bundle still has to load before React can use
  any state, so SSR HTML still paints first. Only useful as a
  helper for the script-mutates-DOM approach above.

## Quick reference

```
site/scripts/prerender.mjs                  per-route static HTML emitter (postbuild)
site/src/entry-server.tsx                   SSR entry — renderToString(<App/>)
site/src/lib/useIsomorphicLayoutEffect.ts   no-flash hydration helper
site/src/App.tsx                            AppShell two-phase state load
site/src/main.tsx                           hydrateRoot + BrowserRouter
site/src/storage.ts                         DEFAULT_STATE + PRERENDER_STATE; singleton-ref return enables setState bailout
site/package.json                           build runs vite build --ssr; postbuild runs prerender
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

4. **Marker assertion (silent SSR regression).** Edit
   `entry-server.tsx` to return `''`, run `npm run build` — the build
   must fail with a clear error mentioning the missing "Adaptation"
   marker. Revert.

5. **Pattern validation (silent template regression).** Temporarily
   edit `site/index.html` to rename or remove the `<noscript>` block,
   run `npm run build` — the build must fail with a clear error
   mentioning the `noscript` pattern. Revert.

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
