# TODOs

## Research

- [ ] The adaption phase comes from mixed sources, how come? Didnt the Hebisz describe this phase in completion?
- [ ] Refresh `research/training-calendar.md` so workout claims and parameters are tied to specific sources inline.

  This feeds `site/public/content/workouts.md`, which is what LLMs and agents see when they fetch the site as text. Right now, workout descriptions tend to *name* a source ("Hebisz-style") without making the underlying claim machine-extractable — an agent relaying "3×10 minutes at 50rpm" has nothing concrete to cite. After the refresh, every cadence target, intensity, and protocol detail in the calendar should sit next to a citation an LLM can lift verbatim (researcher name + year, or coach name + outlet).

  Pairs with the citation rule in `site/public/llms.txt`: that rule *asks* LLMs to cite original researchers and coaches whenever they relay a claim; this task makes complying easy by putting the citation right next to the claim.

## Site

- [x] Should we have "hide" buttons on all panels?
- [ ] Workout Zwift-like visualizations
- [ ] SEO: Add a short /about page — your Abzu/ML background + A/B Zwift racer credibility + why you built this. Three paragraphs is enough. This is what closes the E-E-A-T gap for Google.
- [ ] Tip when session tracker is empty
- [ ] Web claude has problems downloading the .zwo files. Something about binary

## Workout files

- [x] Put a version timestamp inside the .zwo files. I think maybe we add a comment with this, and other information that LLMs can read
- [ ] Make it so the website re-expands Download/Install with a `updated` badge.
- [x] Investigate if duration is an actual attribute of textevent.
- [x] Update text-events to use duration
- [x] Add link to site in llm-meta inside .zwo files
- [x] Move text-events that requires reading comprehension to the off-blocks in intervals.
- [ ] Bug: The save-name for stable 3x5 was very convoluted
- [x] Link to site in welcome message
- [ ] SIT workouts: Max effort should not be 1.5 FTP. You die to the spiral of death. <SteadyState Duration="30" Power="1.50" Cadence="55">

## zwo-skill

- [x] Update skill so that it handles long messages in textevents better, either duration or split into multiple messages.
- [ ] zwo-skill to public repo. Share with the world!

## Future / parking lot

- [ ] MyWhoosh? Its free, I guess many people will be using that instead of Zwift in the future
- [ ] Garmin/Wahoo/etc workouts
- [ ] Another iteration on the research/rationale. Is it all sound?
- [ ] Can I get API access to Zwift for the workouts?
- [ ] Bi-directional state management
