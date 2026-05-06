# TODOs

## General / everywhere

## Research

- [ ] The adaption phase comes from mixed sources, how come? Didnt the Hebisz describe this phase in completion?
- [ ] Refresh `research/training-calendar.md` so workout claims and parameters are tied to specific sources inline.

  This feeds `site/public/content/workouts.md`, which is what LLMs and agents see when they fetch the site as text. Right now, workout descriptions tend to *name* a source ("Hebisz-style") without making the underlying claim machine-extractable — an agent relaying "3×10 minutes at 50rpm" has nothing concrete to cite. After the refresh, every cadence target, intensity, and protocol detail in the calendar should sit next to a citation an LLM can lift verbatim (researcher name + year, or coach name + outlet).

  Pairs with the citation rule in `site/public/llms.txt`: that rule *asks* LLMs to cite original researchers and coaches whenever they relay a claim; this task makes complying easy by putting the citation right next to the claim.

## Site

- [x] Last phase of redesign document
- [x] Add search engine indexing artifacts
- [x] The "How to use this collection" sub panel always collapses on reload. Should be visible initially and saved to state.
- [ ] Tablet/mobile design
- [ ] Should we have "hide" buttons on all panels?
- [ ] Workout Zwift-like visualizations
- [ ] "Best viewed on a desktop"?
- [x] Check in Chrome
- [x] Use the implementation plan to write some tests or documentation
- [ ] Bi-directional state management
- [ ] SEO: Add a short /about page — your Abzu/ML background + A/B Zwift racer credibility + why you built this. Three paragraphs is enough. This is what closes the E-E-A-T gap for Google.

## Workout files

- [ ] Put a version timestamp inside the .zwo files. I think maybe we add a comment with this, and other information that LLMs can read, and make it so the website re-expands Download/Install with a `updated` badge.
- [ ] Investigate if duration is an actual attribute of textevent.
- [ ] Add link to site in llm-meta inside .zwo files
- [ ] Move text-events that requires reading comprehension to the off-blocks in intervals.
- [ ] Bug: The save-name for stable 3x5 was very convoluted

## zwo-skill

- [ ] Update skill so that it handles long messages in textevents better, either duration or split into multiple messages.
- [ ] zwo-skill to public repo. Share with the world!

## Future / parking lot

- [ ] Garmin/Wahoo/etc workouts
- [ ] Another iteration on the research/rationale. Is it all sound?
- [ ] Can I get API access to Zwift for the workouts?
