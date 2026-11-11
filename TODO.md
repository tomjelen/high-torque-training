# TODOs

## After the v2 release (released 2026-11-05)

- [ ] Ride-test the new and changed workouts in Zwift (TE 3×15 and the SIT files can wait until after the build).
- [ ] Re-download the workout zip: all 12 `.zwo` files changed on 2026-11-11 (text events now in a coach voice).
- [ ] Ride weeks 1–2 again next week with the new text events and note anything that still feels off on the bike (the 2026-11-11 review notes are in `explorations/2026-11-text-event-review-adapt-w1-2.md`, which is git-ignored and local only).
- [ ] Optional, not blocking (the Whisper transcript is the record): listen to Fast Talk ep. 125 at about 69:24 and 70:14 (feed mp3). Those Henderson quotes are credited to him from context, because the transcript has no speaker labels. Also optional: 12:00–13:30 and 71:00–71:35, to confirm the three lines credited to a co-host.
- [ ] Vet the 16 remaining proposed text events in `research/text-event-candidates.md` (#1 approved and in use, 2026-11-11). Several still carry capture labels or asides inside the message itself (#3, #8, #12, #17); reword them into the coach voice when approved. Approved ones get encoded into the `.zwo` files as a separate step.
- [ ] ERG bias review (Tom, 2026-11-11). The site and workouts assume ERG mode is on, because Tom's trainer turns it on automatically for workouts. Riding with ERG off (hitting the targets yourself, by gear and cadence) is an option, maybe a better one for torque work, and a way out of the ERG spiral. Go through the text events ("In ERG mode, just drop to this cadence…", the can't-hold-the-power tip), `workouts/README.md`, the install panel and the rationale's "Riding it in Zwift" section, and present ERG off as a real choice, not only an emergency exit. Already sourced: CTS (Rutberg, written) prefers level/resistance mode to ERG for these intervals and says ERG can help beginners focus on cadence (research doc, "Riding by feel is a fine alternative"). Ride-test ERG off before deciding what to recommend.
- [ ] Delete `explorations/archive-unverified/` (Tom decides when).
- [ ] Dependabot: the vitest, js-yaml 4.3.2 and @humanfs/node bumps are still open; the react-router one is superseded by the v7 upgrade; js-yaml 4.3.0 is merged. Merged local branches `feat/workout-chart`, `prerender`, `review-2026-09` can go.

## UI/UX (open)

- [ ] Redesign session. Start from the four mockup directions on the Design canvas (private to Tom): https://claude.ai/artifact/RAogbuBEpgWn3KcqawdiJo
  - A · "This week" dashboard: the current session is the hero, plan strip and next workouts below.
  - B · Editorial long-read: light paper, serif headlines, the story told in order (why → plan → workouts).
  - C · Training timeline: "12 weeks. One climb." The power staircase is the hero.
  - D · Phone at the trainer: today's session, one big Done button, the knee rules at a glance.
  Pick what to take from each (they can be mixed), then fold in the open items below.

- [ ] White text on the orange buttons ("Done ✓", "Download All", "Yes, restart") is 3.6:1 contrast, under the usual 4.5:1 standard. Options: darker orange (orange-700), dark text on the orange, or leave it.
- [ ] The slate-500 helper-text tier is 3.74:1 contrast (tracker "LAST 30 DAYS", helper lines, footnote numbers).
- [ ] The small "how to read the chart" example is unreadable on phones (text ~5px); it now starts collapsed, and could shrink to a legend line. See `documentation/workout-chart.md`.
- [ ] The header ".zip" button is hidden on phones (following `site/CLAUDE.md`); check that this is still wanted.
- [x] Done in the Nov 2026 UX review: About and Rationale reading column centred; build panel overview; after-the-build card; tracker placement; plain wording and "I / my" voice. See `documentation/decisions.md`.

## Follow-ups (not blocking)

- [x] The dev server logs "Hydration failed" on every load (it did this before the rewrite too): `main.tsx` hydrates an empty `#root` in dev. Switch to `createRoot` when `#root` is empty.
- [x] The `activitySaveName` format is a little inconsistent across the 12 `.zwo` files (`x`/`×`, `-`/`–`).
- [x] The `workouts/README.md` cadence notes say "choose the right gear", which clashes with ERG mode ("just drop to this cadence").
- [x] Knee rule 6 ("not on consecutive days") is labelled "ours, anchored on CTS/Rutberg" in the build panel, but not in the research doc (around line 170) or on the Rationale page (around line 464). Make all three match.
- [x] Naming drift: the site calls the adaptation sessions "Weeks 1–2 — 4×4 @ 60–65 rpm", while the calendar and `.zwo` files say "Adaptation weeks 1–2". The weeks 3–4 card shows "80–85% FTP" without the calendar's "(file holds 80%)".
- [x] Test gap: old saved state is only unit-tested. Nothing tests the production path (prerendered page, then hydrate with old localStorage) end to end.
