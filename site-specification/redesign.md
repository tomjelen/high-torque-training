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

### Open questions (in priority order)

1. **Collection card contents.** What fields live on a card? Current: title, intervals, cadence, total time, Source link, Download .zwo button. Redesign calls for demoting the download to a small icon. Also need to decide: does the collection need a Mark Complete button at all, or is completion tracked only via the Session Tracker? (Adaptation is linear and "done" means something; the collection is an indefinite library where "completing" a session once is not meaningful.) And: is there anything new we want on a card — one-line "what this session trains" descriptor, difficulty beyond the tier badge, estimated TSS, etc.?
2. **Session Tracker placement and width.** Redesign.md wants the tracker beside the collection grid. That squeezes horizontal space. Decide: tracker width, whether it slides below the grid at tighter widths, and whether the tracker has a meaningful collapsed state of its own.
3. **Adaptation phase card alignment.** The current Download / Mark Complete button placement is inconsistent across W1/W2/W3 cards. Needs a tidy pattern — and now that collection cards may not have Mark Complete, Adaptation cards might be the only place that button lives, which changes how prominent it should be.
4. **Header and footer content.** Author contact (email / Strava / Zwift), "last updated" date(s) — possibly two dates, one for site changes and one for research updates. A call-out for readers to correct / improve content (supports the transparency principle from the project CLAUDE.md). A short "state is browser-only, here's why" privacy note — likely belongs in the footer.
5. **Workout visualization in cards.** Listed as optional in redesign.md but has already influenced the grid-layout decision ("same-size cards needed for comparison"). Decide in-scope vs out-of-scope for the first mockup pass, and if in-scope, roughly what it renders (power-over-time bars, cadence annotations, etc.).

### First thing to do on resume

Answer open question #1 (card contents + Mark Complete on collection cards + any new fields). That unblocks the card layout, which unblocks the grid sizing, which unblocks the tracker-beside-grid width decision (#2).
