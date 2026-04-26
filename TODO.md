# TODOs

## General / everywhere

- [X] For consistency, make sure we use rpm instead of RPM throughout.

## Research

- [X] Double check the Henderson references. I did not see the tier 1 workout in the transcript. Maybe im wrong though.
- [ ] The adaption phase comes from mixed sources, how come? Didnt the Hebisz describe this phase in completion?
- [X] There is something about the tier 1 workouts. Almost identical, even though they are from different sources.

## Site

- [X] Some sort of introduction. What is high-torque training, and who is it for (research doc has both).
  - [X] Missing who it is for
  - [X] Link to the video that gave me the inspiration. (Currently wrong)
- [X] Site: Something about the UX. For now get content/features on the site, then make it user-friendly after. Ordering of panels, what is shown by default, etc..
- [X] Site: Typical header/footer information. Like my email/Strava/Zwift. Make it look like a real site.
- [/] Site - rationale page: In the section "Ongoing training framework", I think it would be good to point out that this is designed for people like me, that will keep it going, instead of trying to peak. Then maybe shortly outline what the plan would be, if you have a race season (only once a month, yada yada), and then link to articles/papers that goes into details. Later, if interest is here, I can expand the site to cater to this group also. That should be easier, as there is plenty of data/recommendation for this.
- [X] Call-out for people to correct false information or improvements. It should show that I care about factual correct information, and that I appreciate sharing the learnings. With luck, I will be able to add comments to the rationale, where some important person has given me an oppinion/suggestion, with a referece back to this person. I think that would help build credibility.
- [X] A date for when this was last updated. That way people can see if I have considered some new research. Maybe that means two dates. One for a minor site update, another for when research was updated.
- [X] Maybe there should be a longer "who am i" part, that the introduction can link to. Also with a link to my activities in Strava to gauge if you look somewhat like me.
- [ ] Find a way to check firefox/chromium compatability. FF first, but I realize most people use Chrome.
- [ ] Use the implementation plan to write some tests
- [ ] No reason for collapsible installation instructions
- [ ] Verify knee safety warning
- [ ] Feels like we have two styles of warnings. Work it out.
- [ ] Session tracker. Delete and edit date.
- [X] "Before starting ongoing training" is show on completion of last adaption workout, but then the entire panel is collapsed. Lets just always show it
- [ ] Many buttons dont have hands
- [ ] Check table/mobile
- [ ] Last phase of redesign document
- [X] Add a favicon

## Workout files

- [ ] Put a version timestamp inside the .zwo files. I think maybe we add a comment with this, and other information that LLMs can read, and make it so the website re-expands Download/Install with a `updated` badge.
- [ ] Investigate if duration is an actual attribute of textevent.
- [ ] Add link to site in llm-meta inside .zwo files

## zwo-skill

- [ ] Update skill so that it handles long messages in textevents better, either duration or split into multiple messages.
- [ ] zwo-skill to public repo. Share with the world!

## Skills to explore

- [X] Use playwright-cli
- [X] Try with a Playwright-cli skill. Because Claude keeps retarding when using it
- [X] simplify
