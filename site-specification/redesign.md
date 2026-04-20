# Site redesign — specification

Desktop-first redesign of the High Torque Training site. Content and
structure decisions are locked in this document; layout, spacing,
typography, and visual language are deferred to the mockup phase.

Companion: `redesign/observations.md` documents the current site's
layout, with reference screenshots in `redesign/screens/` at 1440×900.

## 1. Goals

The initial site focused on adding features and content, not layout or
UX. With the content essentially complete, this redesign is about
making the page scannable, navigable, and trustworthy:

- **Scannable** — once a rider is past adaptation, picking a session
  should take seconds, not scrolling past four panels of text.
- **Navigable** — the ordering matches the user's journey (understand
  → install → adapt → use), and collapsible panels let returning
  users hide what they've internalised.
- **Trustworthy** — credibility via citations, not credentials. A
  real author, real contact channels, visible last-updated dates, and
  an explicit call-out inviting factual corrections.

Out of scope: adding new content, new workouts, new research.

## 2. Scope

### Platforms

**Desktop-first, ≥1280 px committed.** Everything below (laptop,
tablet, phone) is a separate pass after the desktop layout is agreed.
Do not design all three in parallel — the tracker-beside-collection
layout and the ZWO download prominence both need to work differently
on narrow screens, and designing for mobile now would constrain the
desktop layout for no reason. `site/CLAUDE.md`'s desktop-only rule
still stands for this iteration.

### Pages in this pass

Both existing pages are in this iteration; they differ in how much
they change.

- **Home (`/`)** — full redesign. Every section in §4 applies here.
- **Science & Rationale (`/science`)** — **shell in scope, body
  prose unchanged.** The page adopts the new header (§4.1), the new
  footer (§4.7), real-path routing (§3 — `/science` instead of
  `#science`, which is what unblocks deep links, link previews, and
  crawlers), its own per-page "Last updated" date (§5.3), and the
  prerender treatment so `curl https://.../science` returns real
  HTML. The rationale body text itself is *not* being rewritten or
  restructured in this pass — treat the prose as a drop-in.

### Deferred items

- **Mobile / tablet layout.** See §5.5 for the forward-looking note
  about which actions are mobile-primary vs desktop-primary.
- **Workout visualization** (Zwift-style power-over-time bars +
  cadence overlay on cards). The uniform card-size decision in §4.5.2
  already anticipates this; adding it later won't require reworking
  the grid.
- **Session log import / export.** Deferred, not rejected. If demand
  arrives via the footer feedback call-out, v2 shape is two small
  buttons reading / writing a JSON file — no sync, no cloud, no
  accounts.

## 3. Architecture decisions

### CSS framework: Tailwind, full rewrite

Strip out pico-css entirely and rewrite the markup with Tailwind.
This is **not a migration** — do not preserve the current DOM
structure, class hooks, or component boundaries because they were
shaped around pico's classless defaults. Restructure the markup
however makes the Tailwind version cleanest, and delete the
pico-specific scaffolding as you go.

pico was the right call for the initial site (semantic HTML that
looks decent with zero effort); this redesign is a layout problem —
card grids that don't stretch inconsistently, a sidebar tracker next
to a grid, collapsibles, a real header / footer. Tailwind lets us
iterate on those directly instead of fighting pico defaults or
bolting custom CSS on the side.

### Rendering: React + prerender

The current SPA renders everything client-side, so
`curl https://.../science` returns just `<div id="root">` with no
content. Breaks deep linking, link previews, crawlers, reader-mode
browsers.

**Stay with React during the Tailwind rewrite and add a prerender
step to the build.** Classic React-SSG pattern — write React as
normal, at build time each route renders to a real HTML file, the
client hydrates for interactivity.

- **Tool:** start with `react-snap` (puppeteer-based, near-zero
  config, right-sized for a two-route site). Migratable to `vike`
  later if the site grows. Revisitable at implementation time, but
  either way the approach is React + prerender, not a framework
  switch.
- **Routing:** switch from hash routing (`#science`) to real paths
  (`/science`). Required for each route to have its own static HTML
  file. Trivial change given only two routes.

Net outcome: `curl https://.../science` returns a fully-rendered HTML
document. Crawlers, link previews, reader-mode browsers work. React
still owns the interactive bits (collapsibles, Mark Complete, Session
Tracker, "Did this today").

Rejected alternatives:

- **Astro** (HTML-first framework with React islands). Cleaner in
  theory but a framework migration on top of an already-full
  rewrite. Tom is comfortable with the React-SSG pattern from prior
  work, and the site is small enough that React-SSG isn't a
  compromise.
- **Hybrid** (React SPA for home, static HTML for rationale).
  Unclean; two rendering models for two pages.

## 4. Page structure — home (`/`)

Top-to-bottom, the home page is: header, four collapsible panels,
and a footer.

```
Header: "High Torque Training"  |  "Science & Rationale" link
──────────────────────────────────────────────────────────────
Panel 1: Intro
Panel 2: Download & install
Panel 3: Adaptation (knee-safety warning + W1/W2/W3 cards)
Panel 4: Collection
         ├── Usage Guidelines (incl. short knee-safety reminder)
         ├── Session grid
         └── Session Tracker (sidebar, right of grid)
──────────────────────────────────────────────────────────────
Footer: contact + feedback call-out + last-updated date
```

Panels are arranged **chronologically by the user's journey** — you
need to understand the training before installing, install before
adapting, adapt before using the collection. As a user graduates
past each stage they collapse its panel, and the collapsed state
persists across visits. So a returning library-phase user naturally
sees the Collection panel at the top of the fold — the earlier
panels have already been folded away by the user's own hand, not by
any cleverness on our side. No "smart" progressive disclosure, no
automatic hiding, no remembering-where-the-user-is — just plain
collapsibles that persist their state.

### 4.1 Header

Minimal, two elements:

- **Left:** "High Torque Training" (site title; doubles as a home
  link so rationale-page readers can navigate back).
- **Right:** "Science & Rationale" as a plain link. No pill, no tab
  styling.

The current site uses a two-tab IA ("Workouts" + "Science &
Rationale"). **Collapse to a single-page layout with Science &
Rationale as a plain link.** Reasons:

- "Workouts" as a tab is tautological — the whole site *is* the
  workouts page; a tab that's active 99% of the time is UI noise.
- Tabs imply parallel modes of equal weight, but Science & Rationale
  is a deeper reference document used by a fraction of readers.
  That's a link, not a tab.
- One fewer element competing for top-of-page real estate, which
  matters because that's where the Intro panel will anchor.

Things that look header-ish but are not:

- The "Adaptation Phase — Weeks 1-3 0/3" progress indicator that
  currently sits under the tabs belongs to the Adaptation panel's
  own header, not the site header.

**No tagline under the site title.** The Intro panel carries all
introductory text; a tagline would be a second, pithier version of
the same "what this is" line competing with the Intro's first
sentence. Revisitable once prototypes exist if the bare header feels
too light in practice.

### 4.2 Intro panel

One collapsible panel, two short sections inside:

**Section 1 — What & why.** Plainly state that high-torque training
is low cadence at high power, followed by the key Hebisz & Hebisz
(2024) study figures:

> In an 8-week study, cyclists doing their high-intensity intervals
> at 50–70 RPM gained **+8.7% VO2max** and **+8.1% max aerobic
> power**, compared with **+4.6%** and **+3.0%** for the same
> intervals at freely chosen cadence above 80 RPM.

Plus:

- A link to the study itself (PLOS One, 2024) for trust.
- A link to the podcast / video that inspired the project (for the
  reader who wants to go deeper).

Not a sales pitch, not a wall of text — the shortest version that
lets a curious rider answer "what is this and why should I care?"
without having to click away first.

**Section 2 — How this site is structured.** 2–3 sentences acting as
an in-prose table of contents: start with the adaptation phase to
avoid injury, then use the collection weekly. This section earns its
place by setting up the Adaptation panel directly below it.

Single-panel tradeoff: if a returning user collapses the intro, the
"how the site is structured" signposting goes with it. Probably fine
— by the time a user collapses the intro, they already know the
structure — but worth keeping in mind if we ever rearrange.

### 4.3 Download & install panel

Short panel whose job is to get the user's workouts into Zwift once,
then get out of the way.

Contents:

- **One short sentence** explaining that downloading all workouts as
  a zip and dropping them into Zwift's workout folder is the
  canonical install path — you do this once, then collapse this
  panel.
- **Prominent Download All Workouts (.zip) button.** This is the
  headline install action for new users. On the current site it
  sits at the very bottom of the page, invisible without scrolling
  past everything else; the redesign promotes it to this panel's
  primary element.
- **Zwift install instructions** — a link to the step-by-step guide,
  same as today. No need to inline the steps; a first-time installer
  clicks through and follows them, and subsequent visitors won't
  look at this panel again.

**Collapsed-state teaser** (same pattern as Usage Guidelines in
§4.5.1): the collapsed header reads something like *"Download all
workouts (.zip) — install once, then collapse me,"* so the primary
action is still one click away even when the panel is folded.

### 4.4 Adaptation panel

Three week cards (W1 / W2 / W3) arranged in a row.

**Above the cards — prominent knee-safety warning.** Low-torque work
stresses the knees, and during adaptation especially, a rider who
notices a twinge should **stop and redo the week rather than push
through**. This is an integrity-of-content requirement, not
decorative: the site author had knee pain after W2 and had to redo
the week, and would have pushed through without this awareness. The
warning must be visible whenever the Adaptation panel is expanded.

#### Adaptation card contents

Fields, top-to-bottom:

- **Title.** "W1 — 65–70 rpm" / "W2 — 65 rpm" / "W3 — 60–65 rpm".
  Zone 2 is dropped from the title — it already appears in the
  stats block and is identical across all three weeks, so it
  carries no information. The RPM drop is the actual progression
  story and is what the title surfaces.
- **Stats block:** Sets × duration, Intensity, Cadence, Recovery,
  Total time.
- **Source link.**
- **Download .zwo button — kept prominent** (not demoted to an icon
  the way Collection cards are). Adaptation is the first-time flow;
  a rider who skimmed or forgot the Download & install panel above
  should still have an obvious per-week path to get the file.
  Collection cards serve repeat visitors who have internalised
  download-all; Adaptation serves users who may still be figuring
  out the workflow. Different populations, different defaults.
- **Mark Complete button** — prominent, full-width, the defining
  action of the card. Adaptation is gated and linear; completing a
  week is meaningful and advances the phase.

#### Card state treatment

Three states:

- **Locked** (e.g. W2 before W1 is marked complete): card is dimmed
  / reduced opacity, Mark Complete disabled. Matches how the
  current site renders W2 / W3. Source link and Download .zwo stay
  interactive — no reason to hide information; a rider may
  legitimately preview what's coming.
- **Active** (the current week in the phase): full color, full
  interactivity. Only one card is active at a time.
- **Complete** (Mark Complete has been clicked): the Mark Complete
  button is replaced by a non-clickable "Completed ✓" indicator.
  Card otherwise stays fully visible — completed weeks are not
  re-dimmed. The "✓" carries the done-ness; dimming completed work
  would feel punitive and makes look-back harder. Marking W*n*
  complete advances W*n+1* from locked to active.

### 4.5 Collection panel

Three elements inside, in this order from top:

1. Usage Guidelines (§4.5.1)
2. Session grid (§4.5.2) — with the Session Tracker (§4.5.3) as a
   fixed sidebar to the right.

**Short knee-safety reminder** sits alongside Usage Guidelines — less
prominent than the full Adaptation warning (the rider has already
seen it and done the adaptation weeks), but present, because
low-cadence work stays knee-risky forever, not just during
adaptation. A one-liner is enough, e.g. *"Seated only, stop if
anything pulls in a knee."*

#### 4.5.1 Usage Guidelines

Collapsible, but the **collapsed header carries real content** — a
one-line teaser of the key rule (something like *"1–2 sessions/week,
never back-to-back, progress by cadence before volume"*). The
reminder is always visible, the user's collapse choice is respected
immediately, and we don't override their intent. This solves the
"forgotten when collapsed" risk noted in earlier rounds — the
collapsed header does real work instead of hiding the content
entirely.

**Home for the tier system explanation** — what T1 / T2 / T3 / T4
mean, and the frequency / progression story for mixing them (start
with T1, progress to T2, then intermix T3 with T1, etc.). That
explanation does **not** get duplicated as a legend above the
collection grid; the tier badges on the cards carry the label, and a
curious reader opens Usage Guidelines for the meaning.

**Tier dual-purpose framing.** Usage Guidelines should name both
framings explicitly so the reader understands why the same label
does two jobs:

- Early on, tier is a **progression ladder**: start at T1, work up
  through T2, introduce T3, rare T4.
- Once a rider has settled into the library, tier becomes a
  **hard / easy classifier** for weekly load management: T3–T4 =
  hard, T1–T2 = easy (matching the existing "When to progress"
  table in `TiersPanel.tsx`).

Same badges, two reading frames depending on where the rider is in
their journey.

#### 4.5.2 Session grid

**One uniform wrapping grid, no tier rows.** Tier becomes a property
*on* each card, rendered as a colored T1 / T2 / T3 / T4 badge. Cards
are all the same fixed size and wrap naturally based on available
width, so the layout adapts when the tracker sits beside the grid.

Why this beats the current tier-row layout:

- Cards are always identical in size, which matters once workout
  visualizations land — you can't compare two sessions visually if
  one card is stretched wider than another.
- No more inconsistent stretching across tiers (2 / 3 / 3 / 4 cards
  each filling the same container width at different card widths).
- Past-adaptation users treat the collection as a *library* —
  picking a session by today's form, not re-climbing Entry →
  Advanced every week. A library doesn't need row structure; it
  needs scannable metadata on each item, which the tier badge
  provides.
- The grid reflows naturally when horizontal space changes
  (tracker-beside-grid, future mobile pass), instead of breaking
  tier-row assumptions.

**Sort order within the grid:** by tier first (T1 → T4), then by
title within each tier. Fixed and consistent; the specific ordering
inside a tier doesn't matter as long as it doesn't change between
visits.

**Tier transitions are not visually marked.** No row dividers, no
tier headers inline with the grid. The badges do all the work. A
first-time visitor who wants to understand tiers opens Usage
Guidelines; a returning visitor scans the badge colors.

##### Card contents

Fields on each Collection card, in rough visual priority:

- **Title** (see §5.1 for shared title treatment)
- **Tier badge** — colored T1 / T2 / T3 / T4.
- **Intervals** — the structure (e.g. 4 × 8 min).
- **Cadence** target(s).
- **Total time.**
- **Estimated TSS.** Computable directly from the .zwo file without
  knowing the rider's FTP, because power targets are already
  expressed as fractions of FTP:
  `TSS = duration_hours × IF² × 100`, where IF is the
  normalized-power fraction of FTP across the workout. Worth
  surfacing because the tracker is now a load-management guardrail
  — having a per-session load number on each card is what makes the
  "don't stack hard sessions" rule actionable at pick-time.
- **Source link.**
- **Small download-.zwo icon** — demoted from the prominent button
  it is today.
- **Small "Did this today" action** — writes a dated log entry to
  the Session Tracker.

Explicitly *not* on the card:

- **"What this session trains" descriptor.** The underlying sources
  don't consistently frame their sessions this way — many are
  HIIT-adjacent torque work without a clean one-line intent — so
  any descriptor we wrote would risk inventing intent the source
  didn't claim. Violates the project's attribution-integrity rule.
- **Difficulty beyond the tier badge.** Redundant.
- **Mark Complete.** Not meaningful for a library (see §4.6).

**Deferred:** the Zwift-style workout visualization rendered beneath
the card metadata (power-over-time bars with a red overlay line for
cadence). Out of scope for the first mockup pass; the uniform
card-size decision already anticipates it.

#### 4.5.3 Session Tracker

Sidebar beside the Collection grid. Exists to answer one question at
pick-time: *can I do a hard session today, or have I stacked too
many recently?*

**Placement & width:** fixed sidebar beside the grid at all desktop
widths. No reflow-to-horizontal-strip layout for narrow desktops.
Minimum committed desktop width is 1280 px; below that we accept
some degradation (horizontal scroll / cramped cards) rather than
designing a third intermediate layout. Narrow-desktop reflow and
full mobile layout are deferred to the post-desktop mobile pass.

**No collapse behavior of its own.** The tracker is visible whenever
the Collection panel is expanded, and hidden when that panel is
collapsed. Rejected alternative: partial collapse with the counter
pinned as a compact pill — rejected because the outer panel already
answers the visibility question, and nesting another collapse level
inside it is machinery for a problem we don't have.

Top-to-bottom composition:

**(1) Counter (top, prominent).** "X days since last hard session."
The load-bearing read — the single number that tells the user
whether the 1-hard-per-week rule is currently satisfied. Everything
below is context for this number.

**(2) 30-day rolling strip.** A calendar-accurate horizontal
timeline of the last 30 days. Each logged session is a dot or mark
placed at its actual date position on the strip. A month (not a
week) because it gives enough runway to see rhythm over multiple
training weeks, spot clusters of hard sessions that formed a
mini-block, and notice long gaps. Hard and easy sessions are
visually distinguishable (e.g. shape or color) but both appear on
the same strip. Exact visual form (horizontal bar with dots? a thin
calendar grid? something else?) is a mockup-phase decision.

**(3) Per-entry gap annotation.** Each entry shows the gap from the
previous session *of any kind* (hard or easy) — not the previous
hard session. This is distinct from the top counter, which is
hard-session-only. The per-entry gaps communicate overall training
rhythm and help spot missed weeks or unplanned recovery.

**Half-day rounding for gaps.** Gaps are computed from actual
timestamps (not calendar dates) and rounded to the nearest 0.5 day.
So a session Monday 08:00 followed by a session Tuesday 22:00 is 38
hours → 1.5 days, not "1 day." This prevents clock-time accidents
from flipping a visibly "2-day gap" into a visibly "3-day gap."
Implication: log entries must carry timestamps, not just dates. The
small "Did this today" action on a card writes the current
timestamp, not midnight-of-today.

**Hard vs easy classification: from the tier, not TSS.** A session
is "hard" if T3 or T4, "easy" if T1 or T2. Already how the existing
"When to progress" table frames it. No new metadata, no threshold
to tune, and aligns the tracker with language the user has already
read in Usage Guidelines.

**State & privacy explainer.** A small `?` icon sits next to the
tracker title. Click opens a popover with:

> Your session log lives in this browser only. No account, no
> server — I don't want to run (or pay for) a backend, and nobody
> should need to identify themselves to use this site.
>
> Practical consequence: log on the device you check the tracker
> from. If you log on the phone after a ride and then open the site
> on a laptop, the laptop won't see those entries.

Lives here rather than in the footer because the note needs a "why"
(hosting cost + privacy principle) alongside the "what," which makes
it too long for a footer line. Placing it next to the only component
with meaningful persisted state also gives the reader context at the
moment the question would occur to them, not buried at the bottom
of the page.

### 4.6 Completion semantics — why Adaptation and Collection differ

Adaptation and the Collection have fundamentally different
relationships to "done," and the UI reflects that.

**Adaptation is gated and linear.** You do W1, then W2, then W3, in
order, each once. Skipping is actively discouraged. Each Adaptation
card has a prominent **Mark Complete** button, and completion is
meaningful — it moves you through the phase.

**Collection is a free-form library.** There is no order, no
required mix, no end state. The rule that matters is *frequency*:
no more than one hard session per week. "Completing" a Collection
session once is not meaningful — you're going to do these repeatedly
for as long as you keep riding.

So Collection cards do **not** get a Mark Complete button. Instead,
each card has a small, unobtrusive **"Did this today"** action that
creates a dated log entry in the Session Tracker. The tracker's
purpose shifts accordingly: it's not a completion checklist, it's a
**load-management guardrail** — a visual record of recent
hard-session frequency that helps the user stay under the
1-per-week ceiling.

### 4.7 Footer

Two lines, author-forward.

**Line 1 — identity + channels.** "Tom Jelen" followed by an email
link (`high-torque@jelen.dk`) and a Strava link. Icon-forward
presentation is fine; labels alongside icons optional. Tom's Strava
profile will be made fully public so the link lands somewhere useful
— it lets readers see what kind of rider is writing the site (the
most direct answer to "who is this?" that the site needs to
provide).

**Line 2 — feedback call-out + date.** Call-out copy:

> *"Spotted bad info, a study I've missed, or have an idea for the
> site? Email me — I want to know."*

The per-page "Last updated" date sits on the same row,
corner-aligned (right).

**Call-out wording rationale:** it names three things explicitly —
factual corrections, missed studies, and feature requests — because
all three feed the project's transparency-and-improvement loop.
Feature requests were folded in deliberately: it gives latent demand
for things like session-log import / export (see §5.4) an actual
surface to arrive on, instead of being guessed at pre-emptively.

**Deliberately not in the footer:**

- **No LinkedIn.** The site argues from citations, not credentials;
  Strava already answers the only "who is this?" question the site
  needs to answer (is Tom a real rider with the training volume the
  site is aimed at?). LinkedIn would invite readers to trust the
  author because of his day job, which isn't the credibility model
  here. Revisitable if the rationale document starts drawing
  readers who want professional-context signal specifically.
- **No Zwift / ZwiftPower / zwiftracing.app.** None carry
  reader-side meaning: Zwift is the platform the workouts run *in*,
  not a "follow Tom" surface, and the racing alt-sites don't add to
  the credibility Strava already provides.
- **No privacy / "state is browser-only" note.** Moved next to the
  Session Tracker (§4.5.3). The note needs a "why" alongside the
  "what," which makes it longer than a footer line, and it makes
  more sense placed next to the only component with meaningful
  persisted state.

## 5. Cross-cutting concerns

### 5.1 Card title treatment (shared — Adaptation and Collection)

Single-line, fixed-height title area. Titles never wrap.

- Font size chosen so typical titles fit at current card width. At
  roughly 260–300 px card width, a 14–15 px font fits titles up to
  ~25 characters comfortably.
- Titles that still exceed at that size are truncated with an
  ellipsis. Full title available on hover via `title=` attribute or
  equivalent accessible mechanism.

Keeps rows aligned across every card on the page without per-title
hand-tuning, and it scales: Collection card titles like "Rüegg
VO2max + Sprint" (22 chars) and "HIIT VO2max 6 reps" fit
comfortably; anything longer is truncated rather than reflowing the
card.

### 5.2 Collapsible panels

Every top-level panel (Intro, Download & install, Adaptation,
Collection) is collapsible. Collapsed state persists per-panel
across visits.

**Collapsed headers may carry real content** (not just a title +
chevron). Used where the content of the panel is guidance the user
should be reminded of at a glance even when collapsed — Usage
Guidelines (§4.5.1) and Download & install (§4.3) both use this
pattern.

Visual design of the collapsible affordance — chevron placement,
border, background, animation — is a mockup-phase decision.

### 5.3 Last-updated dates

**One "Last updated" date per page, displayed in the footer.** Not
site-wide, not two parallel dates.

- **Per-page beats site-wide.** A site-wide date flips to today on
  cosmetic changes (e.g. a Tailwind re-skin), implicitly signaling
  "content was revised" when it wasn't. That violates the
  transparency-and-traceability principle. Per-page dates update
  only when *that page's content* actually changes: home's date
  moves when workouts or their descriptions change; `/science`'s
  date moves when the rationale prose is revised.
- **Per-page beats two-dates-per-page.** The earlier idea was two
  dates side-by-side to distinguish "is the site alive?" from "has
  the research been revisited?" Per-page dates capture most of that
  signal more cleanly: a fresh `/science` date answers the research
  question; a fresh home-page date answers the workouts question.
  No need to explain two date labels on the same page.
- **Footer, not header.** The header is deliberately minimal and
  the date is low-value-until-you-want-it information. Conventional
  footer placement matches reader intent.

**Implementation:** "per-page" is a maintenance discipline. Starting
approach is a manual constant per page (two numbers, bumped when
the corresponding content actually changes). Deriving from `git log`
at build time is possible later but adds machinery for limited gain
on a two-route site.

### 5.4 Session tracker state & privacy

State is browser-local. No backend, no accounts. Rationale and
reader-facing copy live in §4.5.3 next to the tracker itself.

Import / export of state is deferred (not rejected). If demand
appears via the footer feedback call-out, v2 is two small buttons on
the tracker — Export log / Import log — reading and writing a JSON
file. No sync, no cloud, no accounts. Cheap to add when asked for;
not worth shipping pre-emptively on a feature most users will never
touch.

### 5.5 Device-usage split (forward-looking)

The two primary user actions fall on opposite sides of the
desktop / mobile boundary: **installing ZWO files happens on
desktop** (because Zwift runs on desktop), and **logging sessions
happens on mobile / tablet** (because that's the device near the
turbo during and after a ride).

Not acted on in this iteration — we're desktop-first — but it
reframes the eventual mobile pass. The mobile design isn't "shrink
the desktop page"; it's "surface the subset of the site that makes
sense on a phone." Concretely: on mobile, the tracker and per-card
"Did this today" action become primary, while the download-all
button and install instructions can be demoted or hidden entirely.

Worth keeping in mind when making desktop decisions that would be
painful to undo later (e.g. coupling the tracker too tightly to
sidebar-only rendering).

## 6. First-mockup deliverable

The primary mockup target is **one full desktop home page at
≥1280 px**, showing:

- Header.
- All four panels expanded.
- Collection grid with the Session Tracker sidebar beside it.
- Footer.

That single screen exercises every structural decision in this
spec.

**Science & Rationale (`/science`) in the mockup phase:** the body
prose is unchanged (see §2), so no content-level mockup is needed.
What *is* needed is a second, much lighter mockup or annotated
reference showing how the home page's header and footer sit around
the existing rationale body — enough to confirm the shell treatment
works at the longer page length and that the last-updated date
lands correctly in the footer.

Not required in the first mockup: mobile / tablet layouts, the
Zwift-style workout visualization, and any of the other deferred
items in §2.

**Iterate on layout, spacing, typography, and visual language (tier
badge colors, collapsible chrome, etc.) during the mockup phase.**
These are deliberately not locked in this spec — the content and
structure decisions above should answer every content-and-structure
question the mockup needs; anything else is for the designer.

If a structural decision turns out to be missing mid-mockup, stop
and either (a) resolve it back into this spec first, or (b) flag it
explicitly as a mockup-phase decision so the spec/mockup boundary
stays clean.
