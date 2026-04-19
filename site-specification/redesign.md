# Re-design of the initial site

The building of the inital site focused on adding features and content, not much on design, layout or UX. Now with essential content done, we can focus on making it easier for a user to use.

## My initial thoughts

### Things that a clearly bad in the current design

The following is written after looking at the site in FireFox on a desktop resolution.

- Alignment within the workout cards. For the adaption row, the Download and Mark Complete buttons varies in position.
- Download ZWO does not need to be this prominent. People download them once, and most likely use the download-all button. It could maybe be a small icon.
- Download-all and installation instructions is the first thing people will interact with, and once done, they would collapse it and never look at it again. So it could be moved to the top.
- Not sure what to do with the section "Usage guidelines and progression". It is important, but it takes up so much space right now, that I just feel like collapsing it, so that I can see the actual sessions.
- The section "The high torque collection" looks messy, because each tier stretches the cards differently. I also think the session tracker could sit next to this, as it takes up most space vertically and little horizontally.

### How I think the order of information should be

I like the current idea with collapsible panels, where the state is saved in the browser, so that they remain collapsed on revisits. With that in mind, I think the panels should be the following in the listed order:

- Introduction about the following:
  - What high torque training is and why (the gains from the Hibbz study)
  - Who is it inteded for
  - And explains that there is first some adaption, to avoid injuries, thereafter the "collection" that can be used as ongoing sessions
  - Credit to the video that inspired me to build this
  - Links to the rationale for deeper information
- Download/installation of workouts
- The adaption phase
- The high torque collection
  - At first the "Usage guidelines & progression" is expanded. I want to make sure that people read and internalize this, so that they use the collection to the best. Not sure if that means a collapsible panel is actually bad. Fearing it could lead to "glimse -> go-away -> forget it exists, because its hidden"
  - The catalog of sessions + tiers with the logger on the side. I assume this is the only panel most people will have expanded when they are past adaption.

### Additional features to incorporate in the design

- Make it work on desktop/tablet/phone. Not, that the ZWO files are useless on a phone, so they could be less prominent, or disappear completely.
- Some sort of introduction. What is high-torque training (rationale-page has this snippet), and who is it for (someone like me, 10-15hours riding per week, etc.. research doc has both). And a link to the video that gave me the inspiration.
- Typical header/footer information. Like my email/Strava/Zwift. Make it look like a real site.
- Call-out for people to correct false information or improvements. It should show that I care about factual correct information, and that I appreciate sharing the learnings. With luck, I will be able to add comments to the rationale, where some important person has given me an oppinion/suggestion, with a referece back to this person. I think that would help build credibility.
- A date for when this was last updated. That way people can see if I have considered some new research. Maybe that means two dates. One for a minor site update, another for when research was updated.
- Short explanation of that logging/state is browser only. Reasons: Privacy, I dont need to identify users and I dont want to pay for a backend.
- Optional: A workout visualization akin to what Zwift does would be nice to have in the cards.

## Decisions

This contains further braining with Claude in order to get to a state where we can iterate on some mockups and build a plan.

### Responsive scope

Desktop-first. We mock up and iterate on the desktop layout until it is agreed on, *then* do a separate pass for tablet and phone. Do not try to design all three in parallel — the tracker-beside-collection idea and the ZWO download prominence both need to work differently on narrow screens, and designing for mobile now would constrain the desktop layout for no reason.

This overrides the earlier "make it work on desktop/tablet/phone" line above for the duration of this iteration. `site/CLAUDE.md`'s desktop-only rule still stands until we explicitly lift it.

### CSS framework: Tailwind, full rewrite

Strip out pico-css entirely and rewrite the markup with Tailwind. This is **not a migration** — do not try to preserve the current DOM structure, class hooks, or component boundaries because they were shaped around pico's classless defaults. Restructure the markup however makes the Tailwind version cleanest, and delete the pico-specific scaffolding as you go.

Rationale: pico was the right call for the initial site (semantic HTML that looks decent with zero effort), but this redesign is a layout problem — card grids that don't stretch inconsistently, a sidebar tracker next to a grid, collapsibles, a real header/footer. Tailwind lets us iterate on those directly instead of fighting pico defaults or bolting custom CSS on the side.

### Static HTML at build time (prerendering)

The current SPA renders everything client-side, so `curl https://.../#science` returns just `<div id="root">` with no content. Breaks deep linking, link previews, crawlers, reader-mode browsers.

Decision: **stay with React during the Tailwind rewrite and add a prerender step to the build.** Classic React-SSG pattern — write React as normal; at build time each route renders to a real HTML file; the client hydrates for interactivity.

Concrete choices:

- **Tool:** start with `react-snap` (puppeteer-based, near-zero config, right-sized for a two-route site). Migratable to `vike` later if the site grows or we want route-based prerendering with more control. Decision on which tool is not fully locked in — can be revisited at implementation time, but either way the approach is React + prerender, not a framework switch.
- **Routing:** switch from hash routing (`#science`) to real paths (`/science`). Required for each route to have its own static HTML file. Trivial change given only two routes exist.

Net outcome: `curl https://.../science` returns a fully-rendered HTML document with all the rationale prose. Crawlers, link previews, reader-mode browsers work. The interactivity model does not change — React still owns the interactive bits (collapsibles, Mark Complete, Session Tracker, "Did this today").

Rejected alternatives:

- **Astro** (HTML-first framework with React islands). Cleaner in theory but a framework migration on top of an already-full rewrite. Tom is comfortable with the React-SSG pattern from prior work, and the site is small enough that React-SSG is not a compromise.
- **Hybrid (React SPA for home, static HTML for rationale).** Unclean; two rendering models for two pages.

### Header & navigation structure

The current site uses a two-tab IA ("Workouts" + "Science & Rationale"). Decision: **collapse to a single-page layout with "Science & Rationale" as a plain link.**

Reasons:

- "Workouts" as a tab is tautological — the whole site *is* the workouts page; a tab that's active 99% of the time is UI noise.
- Tabs imply parallel modes of equal weight, but Science & Rationale is a deeper reference document used by a fraction of readers. That's a link, not a tab.
- One fewer element competing for top-of-page real estate, which matters because that's where the Intro panel will anchor.

Concrete header layout:

- **Left:** "High Torque Training" (site title, doubles as a home link so rationale-page readers can navigate back).
- **Right:** "Science & Rationale" as a plain link. No pill, no tab styling.

Things that look header-ish but are not:

- The "Adaptation Phase — Weeks 1-3 0/3" progress indicator that currently sits under the tabs belongs to the Adaptation panel's own header, not the site header. It stays with that panel.

Footer content is still open — see open questions. Tagline and last-updated date placement are resolved:

- **No tagline under the site title.** The Intro panel carries all introductory text; a tagline would be a second, pithier version of the same "what this is" line competing with the Intro's first sentence. Revisitable once prototypes exist if the bare header feels too light in practice.
- **Last-updated date lives in the footer, per-page, not in the header.** See "Last-updated dates" section below.

### Intro panel structure

One panel, two short sections inside it, in this order:

1. **What & why.** Plainly state that high-torque training is low cadence at high power, followed by the key Hibbz-study percentage figures, with a link to the study (for trust) and a link to the podcast that inspired the project (for the reader who wants to go deeper). Not a sales pitch, not a wall of text — the shortest version that lets a curious rider like Tom answer "what is this and why should I care?" without needing to click away first.
2. **How this site is structured.** 2-3 sentences that act as an in-prose table of contents: start with the adaptation phase to avoid injury, then use the collection weekly. This section earns its place by setting up the Adaptation panel directly below it.

Single-panel tradeoff to be aware of: if the intro is collapsible and a returning user collapses it, the "how the site is structured" signposting goes with it. That is probably fine — by the time a user collapses the intro, they already know the structure — but worth keeping in mind if we ever rearrange.

### Usage Guidelines & progression — handling the "forgotten when collapsed" risk

Open question from the original redesign notes: if Usage Guidelines is collapsible, users glance at it once, collapse it, and forget it exists. Two candidate solutions:

Decision: **make the collapsed state carry real content.** The collapsed header is not just a title, it contains a one-line teaser of the key rule (something like "1–2 sessions/week, never back-to-back, progress by cadence before volume"). The reminder is always visible, the user's collapse choice is respected immediately, and we do not have to override their intent. Solves the "forgotten" risk by making the collapsed header do actual work instead of hiding the content entirely.

Usage Guidelines is also where the tier system is explained — what T1/T2/T3/T4 mean, and the frequency/progression story for mixing them (start with T1, progress to T2, then intermix T3 with T1, etc.). That explanation does **not** get duplicated as a legend above the collection grid; the tier badges on the cards carry the label, and a curious reader opens Usage Guidelines for the meaning.

### Collection grid layout

Decision: **one uniform wrapping grid, no tier rows.** Tier becomes a property *on* each card, rendered as a colored T1/T2/T3/T4 badge (reusing the existing green/yellow/etc. scheme from the current design). Cards are all the same fixed size and wrap naturally based on available width, so the layout adapts when the tracker sits beside the grid, or when we later do the mobile pass.

Why this beats the current tier-row layout:

- Cards are always identical in size, which matters once workout visualizations land — you cannot compare two sessions visually if one card is stretched wider than another.
- No more inconsistent stretching across tiers (2 / 3 / 3 / 4 cards each filling the same container width at different card widths).
- Past-adaptation users are using the collection as a *library* — picking a session by today's form, not re-climbing Entry → Advanced every week. A library does not need row structure; it needs scannable metadata on each item, which the tier badge provides.
- The grid reflows naturally when horizontal space changes (tracker-beside-grid, future mobile pass), instead of breaking tier-row assumptions.

**Sort order within the grid:** by tier first (T1 → T4), then by title within each tier. Fixed and consistent; the specific ordering inside a tier does not matter as long as it does not change between visits.

**Tier transitions are not visually marked.** No row dividers, no tier headers inline with the grid. The badges do all the work. A first-time visitor who wants to understand tiers opens Usage Guidelines; a returning visitor scans the badge colors.

### Collection card contents

Fields on each Collection card, in rough visual priority:

- **Title**
- **Tier badge** (colored T1/T2/T3/T4)
- **Intervals** (the structure — e.g. 4 × 8 min)
- **Cadence** target(s)
- **Total time**
- **Estimated TSS.** Computable directly from the .zwo file without knowing the rider's FTP, because power targets are already expressed as fractions of FTP: `TSS = duration_hours × IF² × 100`, where IF is the normalized-power fraction of FTP across the workout. Worth surfacing because the tracker is now a load-management guardrail — having a per-session load number on each card is what makes the "don't stack hard sessions" rule actionable at pick-time.
- **Source link**
- **Small download-.zwo icon** (demoted from the prominent button it is today)
- **Small "Did this today" action** (writes a dated log entry to the Session Tracker)

Explicitly *not* on the card:

- **"What this session trains" descriptor.** Rejected. The underlying sources don't consistently frame their sessions this way — many are HIIT-adjacent torque work without a clean one-line intent — so any descriptor we wrote would risk inventing intent the source didn't claim. Violates the attribution-integrity rule.
- **Difficulty beyond the tier badge.** Redundant; the tier already carries it.
- **Mark Complete.** Resolved above — not meaningful for a library.

**Deferred to a later iteration:** a Zwift-style workout visualization rendered beneath the card metadata — power-over-time bars with a red overlay line showing cadence targets. Not in the first mockup pass, but the uniform card-size decision already anticipates it.

### Adaptation card contents

Fields on each Adaptation card, top-to-bottom:

- **Title** (see "Card title treatment" below). Phrased as "W1 — 65-70 rpm" / "W2 — 65 rpm" / "W3 — 60-65 rpm". Zone 2 is dropped from the title — it already appears in the stats block and is identical across all three weeks, so it carries no information. The RPM drop is the actual progression story and is what the title surfaces.
- **Stats block:** Sets × duration, Intensity, Cadence, Recovery, Total time.
- **Source link.**
- **Download .zwo button — kept prominent** (not demoted to an icon the way Collection cards are). Rationale: Adaptation is the first-time flow. A rider who skimmed or forgot the Download/install panel above should still have an obvious per-week path to get the file. Collection cards serve repeat visitors who have internalised download-all; Adaptation serves users who may still be figuring out the workflow. Different populations, different defaults.
- **Mark Complete button** — prominent, full-width, the defining action of the card. Adaptation is gated and linear; completing a week is meaningful and advances the phase.

**State treatment** (three states):

- **Locked** (e.g. W2 before W1 is marked complete): card is dimmed / reduced opacity, Mark Complete disabled. Matches how the current site already renders W2/W3. Source link and Download .zwo stay interactive — no reason to hide information; a rider may legitimately preview what's coming.
- **Active** (the current week in the phase): full color, full interactivity. Only one card is active at a time. Matches current behavior.
- **Complete** (Mark Complete has been clicked): Mark Complete button is replaced by a non-clickable "Completed ✓" indicator. Card otherwise stays fully visible — completed weeks are not re-dimmed. The "✓" carries the done-ness; dimming completed work would feel punitive and makes look-back harder. All other elements (title, stats, source, download) remain interactive. Marking W*n* complete advances the phase: W*n+1* transitions from locked to active.

### Card title treatment (shared — Adaptation and Collection)

Single-line, fixed-height title area. Titles never wrap.

- Font size chosen so typical titles fit at current card width. At roughly 260-300 px card width, a 14-15 px font fits titles up to ~25 characters comfortably.
- Titles that still exceed at that size get truncated with an ellipsis. Full title remains available on hover via `title=` attribute (or equivalent accessible mechanism).

This keeps rows aligned across every card on the page without per-title hand-tuning, and it scales: Collection card titles like "Rüegg VO2max + Sprint" (22 chars) and "HIIT VO2max 6 reps" fit comfortably; anything longer than that we can truncate rather than reflow the card.

### Session Tracker content

The tracker exists to answer one question at pick-time: *can I do a hard session today, or have I stacked too many recently?* It is composed top-to-bottom as follows:

**1. Counter (top, prominent).** "X days since last hard session." This is the load-bearing read — the single number that tells the user whether the 1-hard-per-week rule is currently satisfied. Everything below is context for this number.

**2. 30-day rolling strip.** A calendar-accurate horizontal timeline of the last 30 days. Each logged session is a dot/mark placed at its actual date position on the strip. A month (not a week) because it gives enough runway to see rhythm over multiple training weeks, spot clusters of hard sessions that formed a mini-block, and notice long gaps. Hard and easy sessions should be visually distinguishable (e.g. shape or color) but both appear on the same strip.

**3. Per-entry gap annotation.** Each entry shows the gap from the previous session *of any kind* (hard or easy) — not the previous hard session. This is distinct from the top counter, which is hard-session-only. The per-entry gaps communicate overall training rhythm and help spot missed weeks or unplanned recovery.

**Half-day rounding for gaps.** Gaps are computed from actual timestamps (not calendar dates) and then rounded to the nearest 0.5 day. So a session Monday 08:00 followed by a session Tuesday 22:00 is 38 hours → 1.5 days, not "1 day." This prevents clock-time accidents from flipping a visibly "2-day gap" into a visibly "3-day gap." Implication: log entries must carry timestamps, not just dates. The small "Did this today" action on a card should write the current timestamp, not midnight-of-today.

**Hard vs easy classification: from the tier, not TSS.** A session is "hard" if it is Tier 3 or Tier 4, and "easy" if it is Tier 1 or Tier 2. This is already how the existing "When to progress" table in `TiersPanel.tsx` frames it (row: "Use Tier 3 as the 'hard' session, Tier 1–2 as the 'easy' one"). No new metadata, no threshold to tune, and it aligns the tracker with language the user has already read in Usage Guidelines.

Tier has a **dual purpose** that is worth calling out in Usage Guidelines so the reader understands why the same label does both jobs: early on it is a *progression ladder* (start at T1, work up through T2, introduce T3, rare T4), and once a rider has settled into the library it becomes a *hard/easy classifier* for weekly load management. Same badges, two reading frames depending on where the rider is in their journey.

### Session Tracker — state & privacy

A small `?` icon sits next to the Session Tracker title. Click opens a popover with:

> Your session log lives in this browser only. No account, no server — I don't want to run (or pay for) a backend, and nobody should need to identify themselves to use this site.
>
> Practical consequence: log on the device you check the tracker from. If you log on the phone after a ride and then open the site on a laptop, the laptop won't see those entries.

Why this lives here rather than in the footer: the note needs a "why" (hosting cost + privacy principle) alongside the "what," which makes it too long for a footer line. Placing it next to the only component with meaningful persisted state also gives the reader context at the moment the question would occur to them, not buried at the bottom of the page.

**No import/export in v1.** The single-device constraint the popover describes is a real limitation — a rider who logs on a turbo-side phone and picks sessions on a laptop will see divergent state. The fix is deferred on the grounds that most users won't hit it, and those who do can surface the need through the footer feedback call-out. If demand appears, the v2 shape is two small buttons on the tracker — Export log / Import log — reading and writing a JSON file. No sync, no cloud, no accounts. Cheap to add when asked for; not worth shipping pre-emptively on a feature most users will never touch.

### Completion semantics: Adaptation vs Collection

Adaptation and the Collection have fundamentally different relationships to "done," and the UI reflects that.

**Adaptation is gated and linear.** You do W1, then W2, then W3, in order, each once. Skipping is actively discouraged ("please don't skip this part"). Each Adaptation card has a prominent **Mark Complete** button, and completion is meaningful — it moves you through the phase.

**Collection is a free-form library.** There is no order, no required mix, no end state. The rule that matters is *frequency*: no more than one hard session per week. "Completing" a Collection session once is not meaningful — you're going to do these repeatedly for as long as you keep riding.

So Collection cards do **not** get a Mark Complete button. Instead, each card has a small, unobtrusive **"Did this today"** action that creates a dated log entry in the Session Tracker. The tracker's purpose shifts accordingly: it is not a completion checklist, it is a **load-management guardrail** — a visual record of recent hard-session frequency that helps the user stay under the 1-per-week ceiling. This reframing has knock-on implications for the tracker's layout and what it needs to show (see open question #2).

### Panel ordering & the tracker's collapse behavior

Panels are arranged chronologically by the user's journey: Intro → Download/install → Adaptation → Collection. As a user graduates past each stage they collapse its panel, and the collapsed state persists across visits. So a returning library-phase user naturally sees the Collection panel at the top of the fold — the earlier panels have already been folded away by the user's own hand, not by any cleverness on our side.

This means the Session Tracker does **not** need its own collapse behavior. It sits inside the Collection panel (as a sidebar beside the grid) and is visible whenever that panel is expanded — which is exactly when the tracker is useful. A rejected alternative was partial-collapse with the counter pinned as a compact pill; rejected because the outer panel already answers the visibility question, and nesting another collapse level inside it is machinery for a problem we do not have.

The same logic applies to why this ordering works: no "smart" progressive disclosure, no automatic hiding, no remembering-where-the-user-is. Just plain collapsibles that persist their state, arranged in the order you would expect to need them once, and then not again.

### Last-updated dates

Decision: **one "Last updated" date per page, displayed in the footer.** Not a site-wide global date, and not two parallel dates (one "site", one "research") side-by-side.

Reasoning:

- **Per-page beats site-wide.** A site-wide date flips to today on cosmetic changes (e.g. a Tailwind re-skin), implicitly signaling "content was revised" when it wasn't. That violates the transparency-and-traceability principle. Per-page dates update only when *that page's content* actually changes: the home page's date moves when workouts or their descriptions change; `/science`'s date moves when the rationale prose is revised.
- **Per-page beats two-dates-per-page.** The original redesign notes argued for two dates to distinguish "is the site alive?" from "has the research been revisited?" Per-page dates capture most of that signal more cleanly: a fresh `/science` date answers the research question; a fresh home-page date answers the workouts question. No need to explain two date labels on the same page to the reader.
- **Footer, not header.** The header is deliberately minimal and the date is low-value-until-you-want-it information. Conventional footer placement matches reader intent.

Implementation note: "per-page" is a maintenance discipline. The starting approach is a manual constant per page (two numbers, bumped when the corresponding content actually changes). Deriving from `git log` at build time is possible later but adds machinery for limited gain on a two-route site.

### Footer

Two-line footer, author-forward.

- **Line 1 — identity + channels.** "Tom Jelen" followed by an email link (`high-torque@jelen.dk`) and a Strava link. Icon-forward presentation is fine; labels alongside icons optional. Tom's Strava profile will be made fully public so the link lands somewhere useful — it lets readers see what kind of rider is writing the site (the most direct answer to "who is this?" that the site needs to provide).
- **Line 2 — feedback call-out + date.** Call-out copy: *"Spotted bad info, a study I've missed, or have an idea for the site? Email me — I want to know."* The per-page "Last updated" date sits on the same row, corner-aligned (right).

Rationale for the call-out wording: it names three things explicitly — factual corrections, missed studies, and feature requests — because all three feed the project's transparency-and-improvement loop. Feature requests were folded in deliberately: it gives latent demand for things like session-log import/export (see "Session Tracker — state & privacy") an actual surface to arrive on, instead of being guessed at pre-emptively.

**What's deliberately not in the footer:**

- **No LinkedIn.** The site argues from citations, not credentials; Strava already answers the only "who is this?" question the site needs to answer (is Tom a real rider with the training volume the site is aimed at?). LinkedIn would invite readers to trust the author because of his day job, which isn't the credibility model here. Revisitable if the rationale document starts drawing readers who want professional-context signal specifically, but not in v1.
- **No Zwift / ZwiftPower / zwiftracing.app.** None carry reader-side meaning: Zwift is the platform the workouts run *in*, not a "follow Tom" surface, and the racing alt-sites don't add to the credibility Strava already provides.
- **No privacy / "state is browser-only" note.** Moved next to the Session Tracker — see "Session Tracker — state & privacy." Reason: that note needs a "why" (hosting cost + privacy principle), not just a "what," which makes it longer than a footer line, and it makes more sense placed next to the only component with meaningful persisted state.

### Device-usage split (note for mobile pass)

The two primary user actions fall on opposite sides of the desktop/mobile boundary: **installing ZWO files happens on desktop** (because Zwift runs on desktop), and **logging sessions happens on mobile/tablet** (because that's the device near the turbo during and after a ride). This is not acted on in the desktop iteration — we are still desktop-first — but it reframes the eventual mobile pass. The mobile design is not "shrink the desktop page"; it is "surface the subset of the site that makes sense on a phone." Concretely: on mobile, the tracker and per-card "Did this today" action become primary, while the download-all button and install instructions can be demoted or hidden entirely. Worth keeping in mind when we make desktop decisions that would be painful to undo later (e.g. coupling the tracker too tightly to sidebar-only rendering).

## Where we are — resume notes

This section is a scratchpad for picking up the redesign conversation across sessions. Keep it current as decisions are made and open questions are resolved.

### What we're doing

Iterating on a desktop-first redesign of the site via back-and-forth conversation. No mockups have been built yet. Once the open questions below are resolved, next concrete step is to strip pico-css out of the site entirely and start a Tailwind rewrite, beginning with HTML mockups we iterate on together before wiring them back up to the React components.

### Decisions locked in so far

- **CSS framework:** full Tailwind rewrite, not a migration. Restructure markup freely; delete pico scaffolding. (See "CSS framework" section above.)
- **Responsive scope:** desktop-first. Mobile/tablet is a separate pass after desktop is agreed on. `site/CLAUDE.md`'s desktop-only rule still applies for this iteration.
- **Panel order** (from the original redesign.md body): Intro → Download/install → Adaptation → High Torque Collection (Usage Guidelines + card grid + session tracker).
- **Intro panel:** one panel, two sections inside. Section 1 = what high-torque training is + Hibbz-study %s + study link + podcast link. Section 2 = 2-3 sentences signposting "adapt first, then use the collection weekly" as a bridge into the Adaptation panel below.
- **Usage Guidelines panel:** collapsible, but the collapsed header carries a real one-line teaser of the key rule (not just a title). Also the home for the T1-T4 tier explanations and the frequency/progression story.
- **Collection grid:** one uniform wrapping grid, no tier rows. Tier is a colored T1/T2/T3/T4 badge on each card. Cards are identical size and wrap with available width. Sorted by tier first, then title within tier. No visual markers for tier transitions.
- **Completion semantics:** Adaptation cards keep a prominent Mark Complete button (phase is gated and linear). Collection cards get a small "Did this today" action that writes a dated log entry. The Session Tracker is reframed as a load-management guardrail (stay under 1 hard session/week), not a completion checklist.
- **Collection card contents:** title, tier badge, intervals, cadence, total time, estimated TSS (computed from IF alone — no FTP needed), source link, small download icon, small "Did this today" action. No "what this session trains" descriptor (attribution risk). Zwift-style power+cadence visualization deferred to a later iteration.
- **Session Tracker content:** three stacked elements — (1) prominent "X days since last hard session" counter, (2) 30-day rolling strip with all logged sessions as dots positioned by date (hard vs easy visually distinct), (3) per-entry gap annotation showing days-since-previous-session-of-any-kind. Gaps rounded to nearest half-day from actual timestamps. Log entries carry timestamps, not just dates.
- **Hard/easy rule:** T3–T4 = hard, T1–T2 = easy (matches the existing "When to progress" table). Tiers are dual-purpose — a progression ladder early on, then a hard/easy classifier once the rider is using the library freely — and Usage Guidelines should name both framings.
- **Session Tracker placement & width:** fixed sidebar beside the Collection grid at all desktop widths. No reflow-to-horizontal-strip layout for narrow desktops. Minimum committed desktop width is **1280 px**; below that we accept some degradation (horizontal scroll / cramped cards) rather than designing a third intermediate layout. Narrow-desktop reflow and full mobile layout are deferred to the post-desktop mobile pass.
- **Session Tracker collapse:** none of its own. The tracker is visible whenever the Collection panel (its parent) is expanded, and hidden when that panel is collapsed. The chronological panel ordering (Intro → Download → Adaptation → Collection) means returning library-phase users have already collapsed the earlier panels themselves, so the Collection panel naturally sits at the top of the fold by their own action. No additional collapse machinery needed. Rejected alternative: partial collapse with the counter pinned as a compact pill. See "Panel ordering & the tracker's collapse behavior" section.
- **Adaptation card contents:** title (see card title treatment), stats block, source link, prominent Download .zwo button, prominent Mark Complete button. Download stays prominent on Adaptation (unlike Collection) because Adaptation is the first-time flow — a skim-reader of the install panel still gets an obvious per-week path. See "Adaptation card contents" section.
- **Card title treatment (shared):** single-line, fixed-height title area. Font size picked so typical titles fit at card width (~14-15 px at ~260-300 px cards fits ~25 chars). Ellipsis truncation with full title on hover for anything that still exceeds. Applies to both Adaptation and Collection cards. See "Card title treatment" section.
- **Adaptation title phrasing:** "W1 — 65-70 rpm" / "W2 — 65 rpm" / "W3 — 60-65 rpm". Zone 2 dropped from titles (already in stats, identical across weeks); RPM drop is the progression story and what the title surfaces.
- **Adaptation card state treatment:** three states. Locked = dimmed opacity + Mark Complete disabled (current-site behavior for W2/W3); Active = full color (current-site behavior for W1); Complete = Mark Complete replaced by a non-clickable "Completed ✓" indicator, card stays fully visible (no re-dimming). Marking W*n* complete advances W*n+1* from locked to active. See "Adaptation card contents" section.
- **Header & navigation:** collapse the two-tab IA to a single-page layout. "High Torque Training" (left, doubles as home link) + "Science & Rationale" (right, plain link, not a tab). The "Workouts" pill is removed entirely — tautological. See "Header & navigation structure" section.
- **Static HTML via prerendering:** stay with React + Tailwind and add a build-step prerender so every route ships as a real HTML file. Start with `react-snap`; migratable to `vike` later. Switch from hash routing to real paths (`/science`). Reason: `curl` / crawlers / link previews currently get an empty `<div id="root">`. Astro was considered and rejected — not a framework-change-sized problem. See "Static HTML at build time" section.
- **Device-usage split (forward-looking note):** logging is mobile/tablet-primary (happens near the turbo), installation is desktop-primary (Zwift runs on desktop). Does not change the desktop design directly, but frames the mobile pass as "surface the subset that makes sense on a phone," not "shrink the desktop layout." See the "Device-usage split" section above.
- **Header tagline:** none. The Intro panel is the site's introduction; a tagline would duplicate its first sentence and re-weight the deliberately minimal header. Revisitable once prototypes exist.
- **Last-updated dates:** one "Last updated" date *per page*, displayed in the footer. Not site-wide (would flip on cosmetic changes, violating transparency), not two-dates-per-page (per-page dates already separate the "workouts changed" signal on home from the "research revised" signal on `/science`). Starting implementation = manual constant per page. See "Last-updated dates" section.
- **Footer:** two-line, author-forward. Line 1 = "Tom Jelen" + email (`high-torque@jelen.dk`) + Strava link. Line 2 = feedback call-out (*"Spotted bad info, a study I've missed, or have an idea for the site? Email me — I want to know."*) with the per-page last-updated date corner-aligned. No LinkedIn, no Zwift / ZwiftPower / zwiftracing.app, no privacy note (moved to the tracker). Call-out names feature requests explicitly so latent demand for things like import/export has a surface to arrive on. See "Footer" section.
- **Session Tracker state/privacy explainer:** a `?` icon next to the tracker title opens a popover explaining state is browser-local (with the *why* — hosting cost + privacy principle) and the single-device practical consequence. No import/export in v1; deferred until user demand appears via the feedback call-out. If asked for, the v2 shape is two small buttons (Export / Import) reading/writing a JSON file — no sync, no cloud, no accounts. See "Session Tracker — state & privacy" section.

### Open questions (all resolved)

Both structural open questions are now closed:

1. **Footer content.** Resolved — see "Footer" section. Author contact = email + Strava (no LinkedIn, no Zwift variants). Feedback call-out extended to invite feature requests alongside corrections and missed studies. Privacy note moved out of the footer and into a `?` popover next to the Session Tracker (see "Session Tracker — state & privacy").
2. **Workout visualization in cards.** Confirmed deferred — out of scope for the first mockup pass. The uniform card-size decision in "Collection grid layout" already anticipates it, so adding it later will not require reworking the grid.

### Session log

- **Session ending 2026-04-17 (morning pass).** Closed: Collection card contents (incl. TSS from IF), Session Tracker content (counter + 30-day strip + per-entry gap + half-day rounding), hard/easy = T3+/T1-2, completion semantics (Mark Complete = Adaptation-only, Collection uses "Did this today"), tier dual-purpose framing. Ended mid-conversation on open question #1's placement sub-part — Tom had just been asked fixed-sidebar vs reflow-on-narrow-desktop and needed to step away before answering.
- **Session ending 2026-04-17 (evening pass).** Closed:
  - **Header tagline: none.** Intro panel already introduces the site; a tagline would duplicate the first sentence and re-weight the minimal header. Revisitable when prototypes exist.
  - **Last-updated dates: one per page, in the footer.** Not site-wide (would flip on cosmetic changes and violate transparency), not two-dates-per-page (per-page dates already separate the "workouts changed" signal on home from the "research revised" signal on `/science`). Starting implementation = manual constant per page; git-log derivation is a later possible refinement.
  
  Ended at: open question #1 now narrowed to just footer content (author contact / correction call-out / privacy note, plus the per-page last-updated date that lives there). Tom stepped away before we picked apart the footer.
- **Session ending 2026-04-19.** Closed the final open questions. Spec is complete.
  - **Footer shape:** two lines (identity + channels; call-out + date). Author contact = email (`high-torque@jelen.dk`) + Strava; LinkedIn rejected (site argues from citations, not credentials — Strava already answers the only "who is this?" question the site needs); Zwift / ZwiftPower / zwiftracing.app rejected (no reader-side meaning beyond what Strava provides).
  - **Feedback call-out** extended to invite three things: factual corrections, missed studies, *and* feature requests. Feature requests folded in deliberately as the surface where demand for things like session-log import/export can arrive.
  - **Privacy note** moved out of the footer and next to the Session Tracker as a `?`-icon popover. Reason: needed a "why" alongside the "what," which made it too long for a footer line, and placing it next to the only persisted-state component gives the reader context at the right moment. Popover copy drafted in the spec verbatim.
  - **Import/export of state: deferred, not rejected.** No user has asked for it yet; shipping pre-emptively bakes complexity for a feature most users will never touch. If demand arrives via the footer call-out, v2 is two buttons reading/writing a JSON file — no sync, no cloud, no accounts.
  - **Workout visualization confirmed deferred.** The uniform card-size decision already anticipates it.

  Next phase: Tailwind mockups — see "What we're doing" and "First thing to do on resume."
- **Session ending 2026-04-17 (afternoon pass).** Closed:
  - Session Tracker placement = fixed sidebar, ≥1280 px committed as the minimum desktop width; narrow-desktop reflow and mobile deferred to a separate pass.
  - Session Tracker collapse = none of its own; inherits visibility from the Collection panel. Chronological panel ordering (Intro → Download → Adaptation → Collection) means returning users see the Collection at top-of-fold by their own hand.
  - Device-usage split noted as a forward-looking constraint for the eventual mobile pass (logging is mobile-primary, installing is desktop-primary).
  - Adaptation card contents: Download .zwo kept prominent (Adaptation is the first-time flow), Mark Complete is the defining action, title phrasing strips Zone 2 and keeps the RPM drop ("W1 — 65-70 rpm").
  - Card title treatment (shared): single-line, fixed-height title area, ~14-15 px font at current card widths, ellipsis for titles that still exceed; full title on hover.
  - Adaptation state treatment: locked (dimmed + disabled, matches current site), active (full color), complete (button replaced by "Completed ✓", card stays fully visible — no re-dimming).
  - Header & navigation: two-tab IA collapsed to single-page + plain link. "High Torque Training" (home link) left; "Science & Rationale" plain link right; the "Workouts" pill is removed entirely.
  - Static HTML via prerendering: stay with React + Tailwind, add a prerender step to the build (`react-snap` to start; `vike` possible later). Switch hash routing to real paths. Astro considered and rejected.
  
  Ended at: open question #1 partially resolved — header polish (tagline?), last-updated date placement, and footer content all still open. Tom stepped away before we picked one of those to start on.

### First thing to do on resume

**The spec is complete.** No open questions remain — see "Decisions locked in so far" above for the consolidated list, and the section-by-section body for the rationale behind each decision.

Next phase: strip pico-css entirely and start the Tailwind rewrite. Do this via static HTML + Tailwind mockups of the desktop home page (Intro → Download/install → Adaptation → Collection with tracker sidebar), iterated on together, *before* wiring them back into the React components. The header and footer are part of the first mockup pass; the `/science` page is a separate pass after the home page shape is agreed on.

If this conversation is picking up in mockup mode rather than spec mode: lead with a single-screen mockup of the desktop home page in front of Tom for reaction. Do not try to write a full implementation plan before getting visual agreement — the spec carries the content and structure decisions; the mockup phase is where layout, spacing, and typography get settled.

Last-resort sanity check before mocking: the spec should answer every content-and-structure question the mockup needs. If you find yourself inventing a structural decision mid-mockup, stop and either (a) resolve it back in the spec first, or (b) flag it explicitly as a mockup-phase decision so the spec/mockup boundary stays clean.
