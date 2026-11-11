---
name: high-torque-zwo
description: Use when creating or editing .zwo files in the High Torque Training project — applies to source attribution, display text, text event content and timing, message complexity during intervals, and the post-edit validation checklist.
paths: "**/*.zwo"
allowed-tools: Read, Edit, Write, Grep, Glob
---

# High Torque Training — ZWO Conventions

Project-specific conventions for the `.zwo` files in `workouts/`. For ZWO format basics (XML structure, power ramp semantics, cadence attributes, ERG and `FreeRide`), see the **zwo-format** skill from the `zwift-workout-skills` plugin.

Two kinds of guidance below:

- **Hard rules** are things other code or a real risk depends on: the header the site parses, names the site matches, the format traps, and source honesty. Follow them exactly.
- **Intent** is what a part of the workout is for. Write it in your own words for each workout. Wording does not have to match across files; the intent does.

## Hard rules

### Source honesty (the most important rule)

A previous refactor invented workouts and credited them to sources. Every cadence, intensity and duration must trace to the source the workout names, checked against the research doc's "Source prescription reference" (`research/high-torque-training-research.md`). The calendar (`research/training-calendar.md`) is the source of truth for which workouts exist and their parameters. When a workout is scaled, the description says so and why ("EVOQ (scaled: 3 reps instead of 4)"), and scaling stays in the same intensity class.

### Header comment

Between `<?xml ?>` and `<workout_file>`:

```xml
<!--
  High Torque Training — Zwift workout
  Last updated: YYYY-MM-DD

  Site:      https://high-torque.jelen.dk/
  Calendar:  https://high-torque.jelen.dk/content/workouts.md
  Rationale: https://high-torque.jelen.dk/content/rationale.md
  LLMs:      https://high-torque.jelen.dk/llms.txt
-->
```

- `site/scripts/extract-workouts-last-updated.mjs` reads the first `Last updated:` match in the file, so never write that literal anywhere else (description, text events).
- **Bump the date to today on any content edit** to the workout (text events, blocks, description). Not for edits to the header itself.
- The URLs are the markdown ones on purpose: the main readers of the header are machines.

### Names and folders

- `<author>Tom Jelen</author>`.
- `<name>`: the site's display name (`name:` in `site/src/data.ts`) in plain characters, no prefix, under ~35 characters. The Zwift folder already says "High Torque". Rename on the site and in the file together.
- `<activitySaveName>`: `High Torque: <name> <reps>x<duration> <%FTP range> @ <cadence range> rpm`, leaving out parts the name already has. It keeps the prefix because a saved ride sits in Zwift history and on Strava with no folder around it.
- Plain characters in both: `x` not `×`, `-` not `–`/`—`. Keep `ü` (Rüegg), `~` and `%`.
- Two folders only: `High Torque - Adaptation/` (2 files) and `High Torque - Library/` (10 files). A new or moved file also updates `file:` in `site/src/data.ts`. No "Tier" anywhere.

### Structure

- **Show the source's range, not the ZWO value.** The format forces one number (`Power="0.80"`), but the rider should see what the source prescribes ("80-85% FTP", "50-60 rpm") in the description, save name and text events.
- **Cadence only on work blocks** with a prescribed cadence, as `Cadence="X"`. None on warm-up, cool-down, recovery or openers: recovery cadence is free.
- **Repeated `SteadyState` blocks, not `IntervalsT`** (free recovery cadence; avoids the ±5 rpm bug). N work blocks, N−1 recoveries, then straight into the `Cooldown`. No trailing recovery.
- **Sprints are `FreeRide`, not `MaxEffort`** (MaxEffort deadlocks ERG). An XML comment before the first sprint says they are max efforts on purpose, so nobody "fixes" them back. Keep `Cadence` where the source prescribes sprint cadence (SIT), leave it out where it doesn't (Rüegg).
- **Power continuity**, with two deliberate exceptions: a warm-up before an 85%+ block ends lower, and a cool-down after a work block starts at ~0.50.
- **Rest-block power** is consistent across files: `0.50` easy spin between reps, `0.55` after openers, `0.65` in HIIT and SIT rests. The 0.50 and 0.55 are my choices; the 0.65 is my estimate of the study's "similar to VT1" (HIIT, SIT 90-s rests) or my choice for the SIT set break (the study only says "also at low intensity"). Never credit these numbers to a source. The openers (2 × 30 s at 110%, normal cadence, in TorqueMax and HIIT) are also my addition.
- **Removing a "my estimate" tag must not move the credit.** Where a message quotes a source and gives my number next to it ("The study's rest was 'similar to VT1' … about 65% FTP"), keep the two visibly apart, e.g. the number in its own sentence. Never let my number read as the source's.

## Text events: a coach talking to you

**Intent.** The rider is on the bike, breathing hard and glancing at the screen. Text events are a one-way conversation with a good coach riding alongside: what to do now, why this session is built this way, what comes next, and now and then a fun fact. Every message should be worth reading at that moment.

**What a good message sounds like:**

- **Spoken, not written.** Plain words a coach would say, using the names the rider sees in Zwift ("workout intensity", not "FTP bias"; "this session", not "weeks 1-2").
- **People credited by name and role**, the way the home page does it: "coach John Wakefield", "Coach Neal Henderson's reason: …", "EVOQ (Landry Bobo): '…'", "A 2024 study on …". No "Source:" headings, no labels for how a source was captured (machine transcript, auto-captions, abstract only, written). That trail lives in the research doc, the rationale page and the workout's `<description>`.
- **No author's bookkeeping.** No "my choice", "my arrangement", "my rule", "my added reason". Where the advice is the author's own, just give it as advice ("Tip: …", "Ready to drop the cadence? …"). Honesty still holds the other way: never put a coach's or study's name on something that is the author's call.
- **Worth knowing.** About this ride, what comes next, or a relevant, interesting fact about high-torque training. A study finding can start with "Fact:" and should be honest about weak evidence in plain words ("in one small study"). Leave out technical bookkeeping, like where a %FTP came from or how it was calculated: that's for the rationale.
- **Fits the moment.** During work blocks: one short cue ("Halfway. Smooth pedal strokes."). Longer things go in recovery blocks and the warm-up. A message longer than a few words gets a `duration` (about 20 s for a sentence, 25–30 s for two); split long ones in two rather than cramming.

**New facts and quotes** are vetted in `research/text-event-candidates.md` before they go in a file. Only entries Tom has approved are used, and each fact appears in one or two workouts at most, so the sessions don't repeat each other.

**Example** (weeks 1–2 warm-up, after the 2026-11-11 ride review):

```
Warm up at your normal cadence. No low cadence until the first interval.
This session comes from coach John Wakefield: when you're new to torque work, start around 60-65 rpm and do four 4-minute reps.
This is the start of a 4-week adaptation: one session a week to get your legs and knees used to high torque.
Stay seated for every interval. Coach Neal Henderson's reason: seated riding puts less compression on your joints.
```

### What every workout covers

Same intent in every file, in words that fit that session. `site/src/content-consistency.test.ts` checks that some text event says "seated" and some mentions the knees.

| Intent | Where | Notes |
|---|---|---|
| Who this session comes from, and the idea behind it | Early in the warm-up (~30 s) | Name the coach, study or rider. |
| Where to read more | ~60–90 s | Point to the research only (`high-torque.jelen.dk`, `/rationale`), never the plan or logger: the workouts may sit in someone else's plan. |
| Stay seated, with the real reason | Warm-up, and a short "STAY SEATED" cue in every low-cadence interval | Non-negotiable. The sourced reason is Henderson's: less joint compression. |
| If your knees hurt, stop | Warm-up, and a reminder later in the session | Plain: if it aches, stop the interval; don't push through. |
| Knee check after the ride | Cool-down | Adaptation files: if they ached, repeat this session next week instead of moving on. Library files: no "moving on" (they are also ridden outside the plan); just "if it keeps coming back, stop torque work and see a professional". |
| Can't hold the power at this cadence? | A recovery block | Lower the workout intensity a few percent rather than grinding (ERG raises the resistance as cadence drops). Zwift shows it as a percentage (100% by default) that you adjust up or down during the ride; call it "workout intensity". Never say "Trainer Difficulty", which is a different setting. Not in the SIT files: their sprints are `FreeRide`, with no power target. |
| What the rest is | Each recovery block | Plain effort ("Easy spin at any cadence", "Active rest, about 65% FTP"). |

The safety points are simple ideas: stop if it hurts, stay seated, build up to low cadence gradually. What matters is that each workout says them clearly, not that the words match.

**Out of bounds:** references to the training calendar, the plan's weeks or logging (riders may use these in someone else's plan). The two adaptation files may describe the 4-week adaptation, since they are only ridden there.

## Validation checklist

After an edit:

1. Every value traces to its source; ranges shown, not ZWO values.
2. Header present, `Last updated:` bumped if content changed.
3. Name, save name, author and folder follow the rules above.
4. `Cadence="X"` on low-cadence work blocks only; no trailing recovery; sprints are `FreeRide` with the marker comment.
5. Warm-up ramps up, cool-down ramps down, power continuity (with the two exceptions), rest-block power as above.
6. "X seconds left" cues sit at `timeoffset = Duration - X`.
7. Every intent in "What every workout covers" is there.
8. Read the text events in order as the rider would: do they sound like a coach talking? Anything a rider wouldn't care about, or wouldn't understand?
9. `cd site && npm test` passes.
