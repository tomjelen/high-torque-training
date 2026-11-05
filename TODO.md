# TODOs

## After the v2 release (released 2026-11-05)

- [ ] Ride-test the new and changed workouts in Zwift (TE 3×15 and the SIT files can wait until after the build).
- [ ] Re-download the workout zip: all 12 `.zwo` files changed on 2026-11-05 (text events now in the "I / my" voice).
- [ ] Optional, not blocking (the Whisper transcript is the record): listen to Fast Talk ep. 125 at about 69:24 and 70:14 (feed mp3). Those Henderson quotes are credited to him from context, because the transcript has no speaker labels. Also optional: 12:00–13:30 and 71:00–71:35, to confirm the three lines credited to a co-host.
- [ ] Vet the 17 proposed text events in `research/text-event-candidates.md` (mark approved / rejected); approved ones get encoded into the `.zwo` files as a separate step.
- [ ] Delete `explorations/archive-unverified/` (Tom decides when).
- [ ] Dependabot: the vitest, js-yaml 4.3.2 and @humanfs/node bumps are still open; the react-router one is superseded by the v7 upgrade; js-yaml 4.3.0 is merged. Merged local branches `feat/workout-chart`, `prerender`, `review-2026-09` can go.

## UI/UX (open)

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
