# TODOs

## Before releasing v2 (the 12-week build rewrite, Nov 2026)

Check:

- [x] Click the Adam Pulford (CTS) video link in the Sources list once. Its YouTube ID came from a file name, not a saved URL.
- [ ] Optional, not blocking (the Whisper transcript is the record): listen to Fast Talk ep. 125 at about 69:24 and 70:14 (feed mp3). Those Henderson quotes are credited to him from context, because the transcript has no speaker labels. Also optional: 12:00–13:30 and 71:00–71:35, to confirm the three lines we now credit to a co-host.

Do:

- [ ] Run the consistency check: `npm run dev` in `site/`, then `ANTHROPIC_API_KEY=... node site/scripts/check-consistency.mjs`.
- [ ] Ride-test the new and changed workouts in Zwift (TE 3×15 and the SIT files can wait until after week 12).
- [ ] Review, commit and release.
- [ ] After release: delete `explorations/archive-unverified/`.

## UI/UX run-through (separate pass, parked 2026-11-04)

Tom wants a dedicated pass to root out UI/UX issues together, because many are intertwined. Known so far:

- [ ] White text on the orange buttons ("Done, move on", "Download All", "Yes, restart") is 3.6:1 contrast, under the usual 4.5:1 standard. Options: darker orange (orange-700), dark text on the orange, or leave it.
- [ ] The small "how to read the chart" example in the build panel is unreadable on phones (text ~5px). It needs the chart sizing rules in `documentation/workout-chart.md`.
- [ ] On wide screens the About and Rationale pages are a narrow left-hand reading column (768 px) with empty space to the right.
- [ ] The slate-500 helper-text tier is 3.74:1 contrast (tracker "LAST 30 DAYS", helper lines, footnote numbers).
- [ ] The header ".zip" button is hidden on phones (following `site/CLAUDE.md`); check that this is still wanted.

## Follow-ups (not blocking)

- [x] The dev server logs "Hydration failed" on every load (it did this before the rewrite too): `main.tsx` hydrates an empty `#root` in dev. Switch to `createRoot` when `#root` is empty.
- [x] The `activitySaveName` format is a little inconsistent across the 12 `.zwo` files (`x`/`×`, `-`/`–`).
- [x] The `workouts/README.md` cadence notes say "choose the right gear", which clashes with ERG mode ("just drop to this cadence").
- [x] Knee rule 6 ("not on consecutive days") is labelled "ours, anchored on CTS/Rutberg" in the build panel, but not in the research doc (around line 170) or on the Rationale page (around line 464). Make all three match.
- [x] Naming drift: the site calls the adaptation sessions "Weeks 1–2 — 4×4 @ 60–65 rpm", while the calendar and `.zwo` files say "Adaptation weeks 1–2". The weeks 3–4 card shows "80–85% FTP" without the calendar's "(file holds 80%)".
- [x] Test gap: old saved state is only unit-tested. Nothing tests the production path (prerendered page, then hydrate with old localStorage) end to end.
