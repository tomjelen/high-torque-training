# Site and tooling decisions

Short decision records distilled from the old `site-specification/` folder and `docs/superpowers/` (plans and specs), written during the Nov 2026 rewrite so those folders can be deleted. One entry per decision: what, why, date, and the file it came from. Entries marked **Superseded** are kept only so nobody re-introduces them by accident. Both folders were deleted on 2026-11-04; the two never-committed SX files were kept in Tom's private `explorations/2026-07-zwo-skill-extraction/`.

Where a subsystem already has its own document, this file links to it instead of repeating it: `documentation/prerendering.md`, `documentation/workout-chart.md`, `documentation/agent-interfacing.md`, `site/CLAUDE.md`. The *why* of the training itself lives in `research/high-torque-training-research.md`; the *what* lives in `research/training-calendar.md`.

Source abbreviations: **IS** = `site-specification/completed-tasks/0_initial-site/PLAN.md` (2026-03-28). **RD** = `site-specification/redesign.md` (2026-04-15). **IP** = `site-specification/implementation-plan.md` (2026-04-20). **PR** = `site-specification/2026-05-03-prerender-design.md` (+ its implementation plan). **ST** = `site-specification/session-tracker-edits/PLAN.md` (2026-05-02). **ZC** = `site-specification/2026-05-13-zwo-machine-comments-design.md` (+ its implementation plan). **CU** = `site-specification/2026-05-23-chart-ux-iteration.md`. **WV** = `site-specification/Workout-visualizations/PLAN.md` and `HANDOFF-claude-code.md` (2026-05-23). **FR** = `docs/superpowers/plans/2026-06-13-freeride-sprints.md`. **SX** = `docs/superpowers/specs/2026-07-06-zwo-skill-extraction-design.md` and `docs/superpowers/plans/2026-07-07-zwo-skill-extraction.md`. **NOV** = the Nov 2026 rewrite. Its training decisions are recorded in `research/training-calendar.md` and `research/high-torque-training-research.md`; the working notes behind it are Tom's private notes (not in this repo).

## Architecture and build

**Tailwind v4, no pico-css.** The markup is written in Tailwind via `@tailwindcss/vite` (CSS-first config, no PostCSS). Why: the redesign was a layout problem (card grids, sidebar, collapsibles, header/footer); pico's classless defaults fought it. Prefer stock Tailwind utilities over custom CSS. 2026-04-15/20, RD §3, IP. The original pico-css + orange-accent scaffold (IS Task 1) is **superseded**.

**React + build-time prerender, not a framework.** Stay on React; each route is rendered to static HTML at build time (`vite build --ssr` + `scripts/prerender.mjs`) and hydrated on the client. Why: `curl` of any page must return real content (deep links, link previews, crawlers, agents) without a framework migration. Rejected: Astro (this site is almost all interactive, islands fit badly), vike (framework cost for three routes), react-snap (unmaintained, Vite-unfriendly), a hybrid SPA + static page (two rendering models). 2026-04-15 RD §3; tooling choice 2026-05-03 PR §3.1. RD's original pick of react-snap is **superseded** by PR. Detail: `documentation/prerendering.md`.

**Real paths, not hash routing.** Routes are real paths (`/`, `/rationale`, `/about`), so each has its own HTML file. Why: required for per-route prerender. 2026-04-15 RD §3. The `#science` hash tab (IS Task 6) is **superseded**.

**`/science` renamed to `/rationale`.** Label and URL say "Rationale". Why: matches `rationale.md` and the framing (a rationale that uses science, not a textbook). 2026-05-03 PR §4.

**No-flash two-phase hydration.** The first hydrate render uses `DEFAULT_STATE` (matches the SSR output); a `useIsomorphicLayoutEffect` then loads the real state from `localStorage` before paint. Why: clean hydration with no visible flash of default state for returning users, and no inline scripts. 2026-05-03 PR §3.2. The earlier "accept a brief flash" approach (IP) is **superseded**.

**Dual output for non-home routes.** Write both `dist/<route>.html` and `dist/<route>/index.html`. Why: works whether a link uses a trailing slash or not on GitHub Pages. 2026-05-03 PR §3.3 (now also applied to `/about`).

**Build fails if prerender is empty.** The prerender script asserts each output contains a route marker string (e.g. `Adaptation` for `/`, `Hebisz` for `/rationale`) and exits non-zero otherwise. Why: an empty `<div id="root">` must never ship silently. 2026-05-03 PR §3.4.

**Per-route agent hints.** Each route gets its own `<title>`, `<noscript>` and off-screen anchor pointing at its markdown counterpart; `<link rel="alternate">` tags stay shared. 2026-05-03 PR §5. Detail: `documentation/agent-interfacing.md`.

**TSS computed at build time from the `.zwo` files.** Unknown block types throw the build; no silent TSS = 0. Why: keeps the number traceable to the file (attribution rule). 2026-04-20 IP. (It is now injected via Vite `define` rather than a checked-in `src/generated/tss.ts`; the principle stands.)

**Reuse the one regex `.zwo` parser; no XML dependency.** Chart blocks and TSS share `extractBlocks`/`parseAttrs`; both parsers must learn any new block type before a `.zwo` uses it. 2026-05-23 WV M2; 2026-06-13 FR Task 1.

**Build-time globals in `vite-env.d.ts` use `export {}` + `declare global`.** Bare `declare const` silently breaks `tsc -b` under `moduleDetection: "force"`, and vite/vitest don't type-check, so it hides. Always run the full `npm run build`. 2026-05-23 WV M3.

## State and storage

**Browser-only state, no backend, no accounts.** All state lives in `localStorage` under the single key `ht-state`. Why: Tom doesn't want to run or pay for a server, and nobody should have to identify themselves. The tracker's `?` popover explains this and its consequence (log on the device you check from). 2026-04-15 RD §4.5.3, §5.4.

**No migration, no versioning; garbled state returns defaults.** `JSON.parse` failure or a missing key gives defaults. Old state must simply not crash the site. 2026-04-20 IP; reaffirmed NOV (Tom is the only user). The IS-era `ht-v1` key is **superseded**.

**Log import/export: deferred, not rejected.** If asked for via the footer feedback line, add two small buttons reading/writing a JSON file. No sync, no cloud. 2026-04-15 RD §2, §5.4.

**Log entries carry timestamps, not only dates; edited dates are saved at noon UTC.** "✓ Rode it today" (originally "Did this today") writes the current timestamp. Editing an entry's date stores `YYYY-MM-DDT12:00:00.000Z`, which lands on the same calendar day in every populated time zone. 2026-04-15 RD §4.5.3; 2026-05-02 ST.

**Tracker edits: inline two-step delete, clickable date to edit.** First click on ✕ turns the row into "delete? · cancel"; no native dialog. Clicking the date label opens an inline date input with save/cancel; save is disabled when empty. 2026-05-02 ST.

**Every `<button>` has a cursor class.** `cursor-pointer` (or `cursor-not-allowed` when disabled), enforced by `src/button-cursor.test.ts`. 2026-05-02 ST.

## Page structure and content

**Collapsible panels in journey order, collapse state persisted.** Home is a stack of collapsible panels in the order a rider needs them (understand → install → build → library). The user folds what they've outgrown; no "smart" auto-hiding. Collapsed headers may carry a one-line teaser of the key rule. Built on `<details>` for keyboard access. 2026-04-15 RD §4, §5.2. The specific four panels (Intro / Download / Adaptation / Collection) are **superseded** in content by NOV: the adaptation panel is now the 12-week build panel, and the collection is the free-choice library.

**Minimal header, no tagline.** Site title (doubles as home link) plus plain links; no tabs, no pills. Why: "Workouts" as a tab was tautological; the rationale is a reference, not a parallel mode. 2026-04-15 RD §4.1.

**Intro: what and why, shortest version.** Plain statement that high-torque training is low cadence at high power, the key Hebisz 2024 figures, a link to the study and to the inspiration, and a few sentences on how the site is structured. Not a sales pitch. 2026-04-15 RD §4.2. (The figures' exact wording is now governed by the evidence file, not by RD's quote.)

**Download-all .zip is the primary install path.** Prominent in its own panel, still one click away when collapsed; per-workout `.zwo` links stay available. Why: it used to be buried at the bottom of the page. 2026-04-15 RD §4.3; IS Task 5.

**Footer: author-forward, two lines.** "Tom Jelen" + email + Strava; the feedback call-out "Spotted bad info, a study I've missed, or have an idea for the site? Email me — I want to know."; per-page last-updated date. Deliberately no LinkedIn (the site argues from citations, not credentials) and no Zwift/ZwiftPower links (no reader meaning). 2026-04-15 RD §4.7.

**Per-page "Last updated" dates, bumped by hand only for content.** One date per page in the footer, never bumped for reskins. Why: a site-wide date would claim "content revised" when it wasn't. 2026-04-15 RD §5.3; constants in `site/src/App.tsx` (`HOME_`, `RATIONALE_`, `ABOUT_LAST_UPDATED`). Rules: `site/CLAUDE.md`.

**Single-line card titles with ellipsis.** Fixed-height title area, truncate with `title=` for the full name. Why: keeps card rows aligned without per-title tuning. 2026-04-15 RD §5.1.

**The plan panel (Nov 2026 UX review, Tom, 2026-11-04/05).** One block, because the pieces were decided together and several first versions were replaced the same day.

- *Two plans.* A 4-week adaptation, then an 8-week build. Week numbers restart at 1 in each ("Adaptation · week 3 of 4", "Build · week 2 of 8"), and every week reference names its plan. "Build" only ever means the 8 weeks after adaptation; "step" is "two-week block". **Two panels (Tom, 2026-11-06):** "Adaptation · week 3 of 4" and "Build · week 2 of 8" ("Build · 8 weeks, after the adaptation" before it starts), each with its own overview of only its own weeks, its own restart button, and a "done ✓" heading when finished. Why: one panel headed "Adaptation · week 1 of 4" over a chart of all twelve weeks read as a contradiction. The plan you're on holds this week's card, the knee rules line, the chart explainer and "Rules for the plan" (after the build, the build panel keeps them). Finishing adaptation week 4 collapses the adaptation panel, opens the build and scrolls there; a first visit opens the adaptation and leaves the build collapsed. Internally `buildProgress` and `BUILD_WEEKS` keep one running 0–12 count, so saved progress carries over and no `.zwo` changed. Why: a context-free reviewer couldn't tell whether weeks 1–4 were part of "the build".
- *Order.* The plan at a glance first; the knee rules right below it, directly above this week's card where you act, never greyed (its rules apply to library sessions too); then this week's card.
- *Knee rules: one calm line, plus the Done dialog (Tom, 2026-11-06).* The red box became one amber line naming the before-ride rules ("seated · warm up first · stop if your knees ache · not below 50 rpm · not on consecutive days") that opens to the full numbered list with its sources; the library's "Every session" line got the same amber style. The after-ride rule (knee pain → repeat) is asked in the Done dialog every week. Why: the red box was the loudest thing on the page on every visit and read as noise after the first; the dialog puts the stop signal where the decision is made. Tom's own knee episode is why the line stays on screen rather than going entirely. "What is the high-torque block?" starts collapsed: the charts read themselves except for the amber mark, which the legend covers.
- *The plan at a glance.* A bar per week (height = %FTP of the high-torque intervals, read from the `.zwo` files and tested against the calendar; Zwift zone colours; cadence under each pair; the `~` follows each workout's own params), with one card per workout directly under its two weeks. Under each pair, an amber bar shows the cadence range (from the workout params, on one fixed 45–75 rpm scale for both plans; Tom, 2026-11-06): the adaptation stays at 80% FTP, so its cadence drop was invisible on power alone. Power stays the bar height in both plans, so the two charts read the same way. Clicking a card opens it below as a preview without the Done button; the opened card is local state, reset whenever progress changes. Why: the earlier version showed only this week plus a text list; the old site's row of upcoming cards showed the plan better.
- *One Done button, no logging.* "Done ✓ — <what's next>" ("ride it once more next week", "next week: <workout>", "finish the build") opens a confirmation dialog with the checks: the first session of a block asks only about knee pain; the second asks the three move-on checks (the calendar's rule). "Yes" marks the week done, which may be the day after; "Not quite — ride it again next week", Escape, or not clicking is the repeat. (Dialog: Tom, 2026-11-06; before that the checks were grey text beside the button.) "← Back one week" covers a mistaken click and "you feel wrecked the day after". The build writes nothing to the session log (the original site's "Mark Complete writes no log entry" rule, back). Why: "Done, move on" / "Done, repeat next week" weren't self-explanatory, and a dated log entry clashed with a check you can only answer the next day. Cost: no consecutive-day warning between a build session and a library session, and the tracker starts empty after week 12. Confetti on finishing the build.
- *After the build.* The overview and card fade (back to full on hover/focus); a "Build done ✓" line links down to an "After the build" card at the top of the library: Maintain vs Keep going with their sources, the mixing hint, where the evidence ends, and the every-session knee line.
- *Session tracker.* Lives inside "After the build", where library sessions are logged ("✓ Rode it today"). Why: as its own panel between build and library it was off screen in both phases. A sticky side column was prototyped and rejected (Tom: a column of unused space). It hides with the library panel when that is collapsed; that is fine (Tom, 2026-11-05).
- *Rules box.* "How to use" became "Rules for the plan", collapsed by default, at the bottom of the panel: moving on (with sources), breaks, fitting it into ~10 hours, as bulleted lists. The 12-week order, "After the build" and "Every session" were removed as repeats of the chart, the card and the knee box.

Superseded by this block: the "All 12 weeks" text list, the standalone tracker panel, "Done, move on" / "Done, repeat next week", the knee box as the panel's first item, and (2026-11-06) the single "The plan" panel, the red knee box, and the library's red "Every session" line.

**Voice and plain wording (2026-11-05, Tom).** The site speaks as "I / my": "mine" marks the author's own call where no study or coach gives an answer (the intro and the rationale explain who "I" is). The home page is plain: advice is credited by name and role ("coach Neal Henderson", "the coaching company CTS"), "mine" only on real choices, no source-format tags; the full trail (machine transcript, written, abstract only, trust categories) stays on the rationale page. Library cards show their scaling/pick/estimate note as a visible line. The `.zwo` text events use the same voice. Why: two first-time-visitor reviews (one with no project context) found "ours / we" and the inline tags read as insider language.

**Adaptation/build cards keep a prominent `.zwo` download; library cards demote it to an icon.** Why: first-time riders may have skipped the install panel; library users installed the zip long ago. 2026-04-15 RD §4.4, §4.5.2.

**No invented "what this session trains" descriptor on cards.** Why: the sources don't frame their sessions that way, so a descriptor would invent intent (attribution rule). 2026-04-15 RD §4.5.2. **Partly superseded** by NOV: cards now carry an intensity-class label ("At or below threshold", "Above threshold", "Above threshold (maximal sprints)") and the people and source category behind each workout; these are factual classifications, not invented intent, so the principle still applies to anything beyond them.

**Uniform library grid, fixed-size cards.** One wrapping grid of identical cards. Why: comparable charts, no inconsistent stretching. 2026-04-15 RD §4.5.2. Sorting and badges by tier are **superseded** (no tiers since NOV).

**Estimated TSS on library cards.** Computed from the `.zwo` (power is already a fraction of FTP). Why: a per-session load number at pick time. 2026-04-15 RD §4.5.2. Kept in NOV.

**Knee-safety warning prominent in the build/adaptation panel, a short reminder in the library.** Why: Tom had knee pain in an early adaptation week and would have pushed through without the warning. 2026-04-15 RD §4.4, §4.5. Still in force; its form changed 2026-11-06 (one amber line plus the Done dialog, see "The plan panel").

**Scaled workouts are marked where the source is shown.** IS used an asterisk and a tooltip. 2026-03-28 IS Task 7. The principle stands (root `CLAUDE.md`); NOV writes the scaling into the source label itself, e.g. "EVOQ / Housler (scaled: 3 reps instead of 4)".

**Responsive layout.** RD/IP committed to desktop-only (≥1280 px) and deferred mobile. **Superseded**: the site now supports phone, tablet and desktop (`site/CLAUDE.md`, "UX scope"; NOV design pass). Still in force from RD §5.5: installing happens on desktop and logging happens near the trainer, so on phones the tracker matters more and install-only buttons stay out of the mobile chrome.

**Superseded by NOV (no tiers, no hard/easy, no gated W1–W3):**

- Tier 1–4 grouping, tier badges and tier colours (IS Task 3, RD §4.5, IP). Why dropped: the tiers didn't rank knee stress as claimed.
- Tier "dual framing" as progression ladder and hard/easy classifier (RD §4.5.1).
- Sort by tier then title (RD §4.5.2).
- Hard/easy classification (T3–T4 hard) and the "X days since last HARD session" counter (RD §4.5.3, IP). Why dropped: the "one hard + one easy" rule had no source. The counter now counts days since the last session of any kind, and the tracker warns about sessions on the same or consecutive days (our rule, anchored on CTS/Rutberg).
- Three gated adaptation weeks W1–W3 at Zone 2 with "Mark Complete", and the "Mark Complete must not write a log entry" rule (IS Task 2b, RD §4.4, §4.6, IP). Replaced by the 12-week build with "Done, move on" / "Done, repeat next week", which logged every build session so the consecutive-day warning saw it; that in turn was **superseded** 2026-11-04 (see "The plan panel" above, the "One Done button, no logging" bullet).
- The old Session Tracker form with dropdown and notes (IS Task 4).

## Workout chart

**A power-profile chart on every card, with an amber hatched mark where a cadence is prescribed.** Dependency-free SVG, SSR-pure, rendered at a fixed design width of 680 and scaled by CSS. The amber mark is the one novel element; absence means "nothing prescribed", never "free cadence". Sets collapse into one mark when separated by short rests. 2026-05-23 WV, HANDOFF. Full contract: `documentation/workout-chart.md`.

**The amber mark is called "High-torque block"; the explainer is collapsed for returning users.** The "What is the high-torque block?" explainer with one full-mode example chart lives in the build panel; the library shows only the compact legend strip. The card-scale accent strip is taller in minimal mode so it stays visible. 2026-05-23 CU. The example workout (Staple 5×5) is **superseded**: it is now TE 4×8 (`te-4x8`), since the Staples were removed.

**Ramps are neutral grey; data colours are hardcoded, chrome colours are CSS variables with a print override.** 2026-05-23 WV M1/M3.

**Zone colours: superseded twice.** WV's own thresholds (110% drawn in "sprint" red) and CU's "no zone swatches in the legend" are **superseded** by NOV: the chart uses Zwift's zones, names and colours exactly (Z1 <60% grey, Z2 60–75% blue, Z3 76–89% green, Z4 90–104% yellow, Z5 105–118% orange, Z6 >118% red), and the explainer's legend shows the six zone swatches. The cadence mark rule is unchanged.

## ZWO files and tooling

**Machine-readable header comment in every `.zwo`.** Between `<?xml ?>` and `<workout_file>`: a hand-maintained `Last updated: YYYY-MM-DD` and four breadcrumb URLs (site, calendar markdown, rationale markdown, `llms.txt`). Bump the date on any content edit, not on comment-only edits. Why: Tom needs to tell file versions apart on his Zwift PC, the site needs a "new workouts" signal, and a standalone `.zwo` handed to an agent needs a way back to the context. 2026-05-13 ZC. Rules: `.claude/skills/high-torque-zwo/SKILL.md`.

**`ZWO_WORKOUTS_LAST_UPDATED` is derived, never hand-set,** as `max()` of the file dates, and `HOME_LAST_UPDATED ≥ ZWO_WORKOUTS_LAST_UPDATED` is a documented (not enforced) invariant. 2026-05-13 ZC. (Injected via Vite `define` today, not ZC's generated `.ts` module.) The then-future "workouts updated since your download" badge has since been built (`site/src/components/update-badge.ts`).

**Sprints are `FreeRide` blocks with `FlatRoad="1"`, never `MaxEffort`.** `MaxEffort` left ERG engaged on real setups and caused the cadence "spiral of death" (hit 2026-06-13 in SIT and Rüegg). `FreeRide` turns ERG off for the block and back on after; `FlatRoad="1"` gives steady resistance instead of following the in-game gradient. A marker comment before the first sprint says they are deliberate max efforts so nobody "fixes" them back. The chart and TSS treat `FreeRide` exactly like the old `MaxEffort`. Rüegg's 110% blocks stay in ERG (that is what keeps them high-torque); only its sprints are `FreeRide`. The old "ride in slope mode" text events were dropped. 2026-06-13 FR. Still needs Tom's trainer check.

**Generic ZWO format knowledge lives in the `zwift-workout-skills` plugin; this repo consumes it like any user.** Public repo `tomjelen/zwift-workout-skills` (plugin + its own marketplace); the local copy was deleted and the project skill renamed `zwo` → `high-torque-zwo` so "zwo" stops meaning two things. Format edits go in `~/code/jelen/zwift-workout-skills`, Tom pushes, then `/plugin update` here. The plugin's committed `CLAUDE.md` is contributor-facing; Tom's "I commit myself" rule lives in its untracked `CLAUDE.local.md`. Every format claim must say how it was verified in real Zwift. Bump `plugin.json` version on each content change. 2026-07-06/07 SX. Install and update steps: root `CLAUDE.md`.

**Plugin facts verified 2026-07-07** (SX plan, against code.claude.com/docs/en/plugin-marketplaces): `"source": "./"` resolves against the marketplace root and works when users add the marketplace from GitHub; `claude plugin validate .` validates; install is `/plugin install <plugin>@<marketplace>`.

**Phase 2 (not started): a `zwo-authoring` skill.** Move the generalizable authoring guidance out of `high-torque-zwo` into the plugin. Triage agreed 2026-07-06 (SX):

| Generalizable (moves out) | High Torque-specific (stays) |
|---|---|
| Display source ranges, not ZWO-fixed values | Author tag, `HT` name prefix |
| Short cues during work, education during recovery | Header comment with jelen.dk URLs |
| Long messages need a `duration` | Knee-safety + SEATED rules |
| Cadence attributes only where prescribed | Source-attribution policy, calendar/research links |
| FreeRide "deliberate" marker-comment pattern | Site tidbit rotation |

**Plugin distribution (Tom, one-time, no deadline).** Official directory submission, optional awesome-list PRs, optional manual-copy check in a scratch project. 2026-07-07 SX plan Part 3; current status in `.claude/memory/project_zwo_skill_extraction.md`.

## Not decisions (artefacts in the old folders)

These were reference material, not rules: the April 2026 wireframes (`Final Wireframes.html`), the initial-site mock and screenshots, the redesign "observations" notes and screenshots of the pre-redesign site, the chart design mockup (`.html`, `.jsx`, `.png`), and the favicon set (identical copies already in `site/public/`; colours ink `#0E0F12`, orange `#F05A1A`).
