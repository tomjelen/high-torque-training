# TODOs

## General / everywhere

## Research

- [ ] The adaption phase comes from mixed sources, how come? Didnt the Hebisz describe this phase in completion?
- [ ] Refresh `research/training-calendar.md` so workout claims and parameters are tied to specific sources inline.

  This feeds `site/public/content/workouts.md`, which is what LLMs and agents see when they fetch the site as text. Right now, workout descriptions tend to *name* a source ("Hebisz-style") without making the underlying claim machine-extractable — an agent relaying "3×10 minutes at 50rpm" has nothing concrete to cite. After the refresh, every cadence target, intensity, and protocol detail in the calendar should sit next to a citation an LLM can lift verbatim (researcher name + year, or coach name + outlet).

  Pairs with the citation rule in `site/public/llms.txt`: that rule *asks* LLMs to cite original researchers and coaches whenever they relay a claim; this task makes complying easy by putting the citation right next to the claim.

## Site

- [x] No reason for collapsible installation instructions
- [ ] Verify knee safety warning
- [ ] Session tracker. Delete and edit date.
- [ ] Last phase of redesign document
- [ ] Feels like we have two styles of warnings. Work it out.
- [ ] Check table/mobile
- [ ] Bi-directional state management
- [ ] Find a way to check firefox/chromium compatability. FF first, but I realize most people use Chrome.
- [ ] Use the implementation plan to write some tests or documentation

## Workout files

- [ ] Put a version timestamp inside the .zwo files. I think maybe we add a comment with this, and other information that LLMs can read, and make it so the website re-expands Download/Install with a `updated` badge.
- [ ] Investigate if duration is an actual attribute of textevent.
- [ ] Add link to site in llm-meta inside .zwo files
- [ ] Move text-events that requires reading comprehension to the off-blocks in intervals.
- [ ] Bug: The save-name for stable 3x5 was very convoluted

## zwo-skill

- [ ] Update skill so that it handles long messages in textevents better, either duration or split into multiple messages.
- [ ] zwo-skill to public repo. Share with the world!
