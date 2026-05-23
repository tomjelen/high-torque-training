# TODOs

## Research

- [ ] The adaption phase comes from mixed sources, how come? Didnt the Hebisz describe this phase in completion?
- [ ] Refresh `research/training-calendar.md` so workout claims and parameters are tied to specific sources inline.

  This feeds `site/public/content/workouts.md`, which is what LLMs and agents see when they fetch the site as text. Right now, workout descriptions tend to *name* a source ("Hebisz-style") without making the underlying claim machine-extractable — an agent relaying "3×10 minutes at 50rpm" has nothing concrete to cite. After the refresh, every cadence target, intensity, and protocol detail in the calendar should sit next to a citation an LLM can lift verbatim (researcher name + year, or coach name + outlet).

  Pairs with the citation rule in `site/public/llms.txt`: that rule *asks* LLMs to cite original researchers and coaches whenever they relay a claim; this task makes complying easy by putting the citation right next to the claim.

## Site

- [x] Workout Zwift-like visualizations
- [ ] Tip when session tracker is empty
- [ ] Web claude has problems downloading the .zwo files. Something about binary

## Workout files

- [ ] Make it so the website re-expands Download/Install with a `updated` badge.
- [x] Fine tune them, now that we have visualizations. Especially the cool-down stuff looks a bit off.

## zwo-skill

- [ ] zwo-skill to public repo. Share with the world!

## Future / parking lot

- [ ] MyWhoosh? Its free, I guess many people will be using that instead of Zwift in the future
- [ ] Garmin/Wahoo/etc workouts
- [ ] Another iteration on the research/rationale. Is it all sound?
- [ ] Can I get API access to Zwift for the workouts?
- [ ] Bi-directional state management
