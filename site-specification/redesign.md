# Re-design of the initial site

The building of the inital site focused on adding features and content, not much on design, layout or UX. Now with essential content done, we can focus on making it easier for a user to use.

## Things that a clearly bad in the current design

The following is written after looking at the site in FireFox on a desktop resolution.

- Alignment within the workout cards. For the adaption row, the Download and Mark Complete buttons varies in position.
- Download ZWO does not need to be this prominent. People download them once, and most likely use the download-all button. It could maybe be a small icon.
- Download-all and installation instructions is the first thing people will interact with, and once done, they would collapse it and never look at it again. So it could be moved to the top.
- Not sure what to do with the section "Usage guidelines and progression". It is important, but it takes up so much space right now, that I just feel like collapsing it, so that I can see the actual sessions.
- The section "The high torque collection" looks messy, because each tier stretches the cards differently. I also think the session tracker could sit next to this, as it takes up most space vertically and little horizontally.

## How I think the order of information should be

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

## Additional features to incorporate in the design

- Make it work on desktop/tablet/phone. Not, that the ZWO files are useless on a phone, so they could be less prominent, or disappear completely.
- Some sort of introduction. What is high-torque training (rationale-page has this snippet), and who is it for (someone like me, 10-15hours riding per week, etc.. research doc has both). And a link to the video that gave me the inspiration.
- Typical header/footer information. Like my email/Strava/Zwift. Make it look like a real site.
- Call-out for people to correct false information or improvements. It should show that I care about factual correct information, and that I appreciate sharing the learnings. With luck, I will be able to add comments to the rationale, where some important person has given me an oppinion/suggestion, with a referece back to this person. I think that would help build credibility.
- A date for when this was last updated. That way people can see if I have considered some new research. Maybe that means two dates. One for a minor site update, another for when research was updated.
- Short explanation of that logging/state is browser only. Reasons: Privacy, I dont need to identify users and I dont want to pay for a backend.
- Optional: A workout visualization akin to what Zwift does would be nice to have in the cards.
