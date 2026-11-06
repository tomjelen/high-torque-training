---
name: high-torque-zwo
description: Use when creating or editing .zwo files in the High Torque Training project — applies to source attribution, display text, text event content and timing, message complexity during intervals, and the post-edit validation checklist.
paths: "**/*.zwo"
allowed-tools: Read, Edit, Write, Grep, Glob
---

# High Torque Training — ZWO Conventions

Project-specific rules for `.zwo` files in the High Torque Training library. For ZWO format basics (XML structure, power ramp semantics, cadence attributes), see the **zwo-format** skill, provided by the `zwift-workout-skills` plugin (github.com/tomjelen/zwift-workout-skills).

## Author

Always `<author>Tom Jelen</author>`.

## Machine-readable header comment (required)

Every `.zwo` file in `workouts/` must carry an XML comment between the `<?xml ?>` declaration and the `<workout_file>` root element:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  High Torque Training — Zwift workout
  Last updated: YYYY-MM-DD

  Site:      https://high-torque.jelen.dk/
  Calendar:  https://high-torque.jelen.dk/content/workouts.md
  Rationale: https://high-torque.jelen.dk/content/rationale.md
  LLMs:      https://high-torque.jelen.dk/llms.txt
-->
<workout_file>
```

Constraints:

- The `Last updated:` line should be the first content line of the comment (convention). The parser in `site/scripts/extract-workouts-last-updated.mjs` matches by pattern across the whole file, so the `YYYY-MM-DD` format and the "don't repeat the literal elsewhere" rule below are what's actually enforced.
- The four URLs are exactly as above. Do not substitute the HTML pages (`/`, `/rationale`) for the markdown URLs — the markdown URLs are deliberate (primary audience is machines).
- Do not write the literal string "Last updated:" elsewhere in the file (e.g. inside a `<description>` or `<textevent>`), because the extractor uses a multiline regex and would pick up the first match.

## Naming

- `<name>` — **no prefix.** It is the site's display name (`name:` in `site/src/data.ts`) written in plain characters, e.g. `Threshold 5x5`, `Weeks 1-2 - 4x4 @ 60-65 rpm`, `Rüegg VO2max + Sprint`. Why: in Zwift you browse Custom Workouts → the zip's folders ("High Torque - Adaptation", "High Torque - Library") → the workouts, so the folder already says "High Torque"; a brand prefix only eats the ~35 characters. Tom settled this in commit 8d2ec17 (2026-04-21); an "HT " prefix crept back in the Nov 2026 rewrite and was removed again. Rename a workout on the site and in the `.zwo` together.
- `<name>` and `<activitySaveName>` use plain characters only (Tom's rule: no special characters unless needed): `x` not `×`, `-` not `–` or `—`. Keep `ü` in Rüegg (a name), and keep `~` and `%`. (The site, calendar and research doc keep typographic `×`, `–`, `—`.)
- `<activitySaveName>` — **keeps the `High Torque:` prefix**, because a saved ride sits in Zwift history and on Strava with no folder around it. Shape: `High Torque: <name> <reps>x<duration> <%FTP range> @ <cadence range> rpm`, where `<name>` is exactly the `<name>` element; parts the name already carries are not repeated (the adaptation names hold the reps and cadence, so only `min <%FTP>` is added). A single space between the parts. Examples from the files: `High Torque: Threshold 5x5 min ~95% FTP @ 50-60 rpm`, `High Torque: Weeks 1-2 - 4x4 min 80-85% FTP @ 60-65 rpm`, `High Torque: Rüegg VO2max + Sprint 3x5 min 106-120% FTP @ 50-60 rpm`, `High Torque: SIT (2 sets) 4x30s sprint @ 50-60 rpm`. Use **source prescription ranges**, not ZWO-fixed values. There are no tiers: never put "Tier N" in a name. All 12 files follow this shape.

## Folders

Two folders only: `workouts/High Torque - Adaptation/` (the 4-week adaptation, 2 files) and `workouts/High Torque - Library/` (the 8-week build and the free-choice library, 10 files). A new or moved file must also update the `file:` path in `site/src/data.ts`.

## Display text: always show source prescriptions

ZWO attributes require fixed values, but the rider should see what the source actually prescribes. This applies to `<description>`, `<activitySaveName>`, and all `<textevent>` messages.

| Source prescription | ZWO attribute | What to display |
|---|---|---|
| 80-85% FTP | `OnPower="0.80"` | "80-85% FTP" |
| ~90% FTP | `OnPower="0.90"` | "~90% FTP" |
| ~95% FTP | `OnPower="0.95"` | "~95% FTP" |
| 105-110% FTP | `OnPower="1.10"` | "105-110% FTP" |
| 50-60 rpm | `Cadence="55"` | "50-60 rpm" |
| 60-70 rpm | `Cadence="65"` | "60-70 rpm" |

Never show "80% FTP" when the source says "80-85% FTP". The ZWO format forces a single value — the rider should see the real prescription.

## Cadence placement

No cadence attributes on warmup, cooldown, recovery, or opener segments. Only on interval blocks where the research prescribes a specific cadence.

## Max-effort sprints — `FreeRide`, marked as deliberate

All-out sprints use `FreeRide` (format mechanics: see `zwo-format`). Project rule on top of that:

- **Marker comment.** A `FreeRide` normally means "easy free spin," but these are the opposite — max efforts. Place an XML comment before the first sprint block stating they ARE max-effort sprints authored as `FreeRide` to escape ERG (`MaxEffort` deadlocks ERG — the spiral of death), and to not convert them back. This stops a future refactor from "fixing" them.
- **Cadence follows the source** (same rule as "Cadence placement" above): keep `Cadence` on sprints with a prescribed cadence (SIT's 50-60 rpm → `Cadence="55"`); omit it where the source leaves sprint cadence free (Rüegg).

## Interval structure — no trailing recovery

High Torque interval sessions are built from repeated `<SteadyState>` blocks rather than `IntervalsT`, because the recovery phase needs free (unspecified) cadence and `IntervalsT` can't do that without the ±5 rpm bug (see `zwo-format`).

When emulating this way, write **N work blocks and N−1 recovery blocks** — recovery sits *between* intervals only. After the final work block, go **straight to the `Cooldown`**. Do not append a trailing recovery block: it has no interval to bridge to, it just duplicates the cooldown, and it inflates the workout duration. (A faithful copy of `IntervalsT`'s on/off pairing produces exactly this orphan — that's the trap to avoid.)

## Power conventions for rest blocks

These values are what the files use today. Keep them consistent, and keep the text events honest about where each number comes from.

| Block | Power | Where | How the text events describe it |
|---|---|---|---|
| Recovery between work reps | `0.50` | Adaptation, Torque Endurance, Threshold, TorqueMax, Rüegg | "Easy spin" (e.g. "Recovery: 8 minutes, as long as the rep. Easy spin at any cadence."). The 0.50 is mine: never credit it to a source. |
| Gap after each opener | `0.55` | TorqueMax, HIIT 4×4, HIIT 6×4 | "Easy spin. Opener 2 coming." / "Easy spin. Second opener coming." The openers themselves (2 × 30 s at 110%, normal cadence) are my addition and the files say so. |
| HIIT 8-min active rest, SIT 90-s rests | `0.65` | HIIT 4×4, HIIT 6×4, SIT 2 and 3 sets | "Active rest. 8 minutes at ~65% FTP." / "Active rest. 90 seconds at ~65% FTP." plus the explanation: "The study's rest was 'at an intensity similar to the power achieved at VT1'. By the same arithmetic that is about 65% FTP (my estimate)." |
| SIT 25-min break between sets | `0.65` | SIT 2 and 3 sets | Different grounds from the 90-s rests: "~65% FTP. The study says only 'also at low intensity' for this break; ~65% is my choice, the same level as the 90-second rests." |

Do not fold the SIT set break under "similar to VT1": the study only says "also at low intensity" for it.

## Warmup / cooldown power exceptions

Two intentional breaks from the `zwo-format` power-continuity rule:

- **Warmup before a hard block.** Warmups before blocks at 85%+ FTP intentionally end lower — you don't ramp into threshold/VO2max.
- **Cooldown after a work interval.** Because interval sessions end on the final work block and drop straight into the cooldown (see "Interval structure" above), keep the `Cooldown` `PowerLow` at the easy/recovery level (~0.50) regardless of the higher work power before it. A cooldown is meant to start easy; the downward step into it is correct — the mirror of the warmup exception. Do **not** raise `PowerLow` to match the work interval.

## Voice

Descriptions and text events speak as the author, "I / my", like the site: "my choice", "my estimate", "My rule: …". Never "we / our / ours". Coach and study quotes keep their own words.

## Text event requirements

### Source attribution in warmup
Every workout must have a text event early in the warmup (~30s) stating:
- The source (e.g. "Source: Hebisz and Hebisz (2024), HIIT session, weeks 1-4. 4x4 min at 90-100% of Pmax (maximal aerobic power), 60-70 rpm, 8 min active rest." or "Source: EF Pro Cycling article on Noemi Rüegg's own session. A pro rider's workout, not a research study.")
- Brief context on why this prescription exists

Then a second event at ~60-90s with a site tidbit (pick one, rotate across workouts):
1. "Full research and protocol rationale at high-torque.jelen.dk"
2. "Want to go deeper on the science? high-torque.jelen.dk/rationale"
3. "All the research behind this program: high-torque.jelen.dk"

They point to the research only, never to the plan or the session logger: the workouts may be ridden as part of someone else's plan (Tom, 2026-11-05).

These are longer messages — set a `duration` on them (20s is a reasonable default).

### Message length and duration
- Short messages (a few words, a simple cue) don't need a `duration`.
- Longer messages need a `duration` so the rider has time to read them. Use judgment: a 15-word sentence is fine at 20s; a two-sentence explanation might need 25–30s.
- If splitting a long message into two shorter back-to-back events reads more naturally, that's fine — but set `duration` on each so they don't vanish instantly.
- The goal is readability, not a strict word count. Ask: can a rider on the bike read this comfortably at the speed they're going?

### Message complexity during intervals
- **During work phases** (high-intensity on-intervals in `IntervalsT`, or high-power blocks in hand-rolled intervals, or `SteadyState` at high intensity): keep messages short and simple — one cue only. Examples: "Stay seated. 50-60 rpm.", "Hold the power. Breathe."
- **During recovery/rest phases**: the right place for study findings, citations, coach quotes, and rationale. The rider has headspace to read.

### Knee safety warning
Every low-cadence workout must include at least one knee warning. Example: "If your knees ache at any point during an interval, stop the interval. Don't push through knee discomfort."

The cooldown knee check has two wordings, by folder (Tom, 2026-11-05):

- **Adaptation files:** "Note how your knees feel. Any ache? My rule: next week, repeat this session instead of moving on. If it keeps coming back, stop torque work and see a professional." (knee rule 4, as in the site's knee rules.)
- **Library files:** the same without the "My rule: next week, repeat…" sentence: "Note how your knees feel. Any ache? If it keeps coming back, stop torque work and see a professional." (SIT 2 sets opens with "Knee check: how do they feel now compared to during the sprints?" instead.)

Why: the "repeat instead of moving on" rule only makes sense inside the plan. It was added to all twelve files on 2026-11-05 because it reads right when you think of the workouts through the build plan. But the library files are also ridden as free choice after the build, where there is nothing to move on to, and they may sit in someone else's plan. During the build, the site's Done button asks the knee question and covers the repeat. The adaptation files are only ridden in the adaptation, so they keep the rule. Don't add it back to the library files.

### SEATED reminder
All low-cadence intervals are seated — non-negotiable. State "SEATED" or "Stay seated" prominently in or before every interval block. The warmup's SEATED event gives the sourced reason first, then the author's own: "All intervals are SEATED. Henderson: less joint compression (machine transcript). My added reason: standing lets body weight push the pedal down instead of your muscles." (research doc, knee rule 1).

### Can't-hold-the-power (ERG) event

Every file with a power-targeted low-cadence block carries this event in a recovery block (with a `duration` of 25–30 s), so the rider knows what to do when they can't push the target power at the low cadence (in ERG the resistance then climbs as the cadence drops). It is the author's own tip, from his riding:

- Standard wording (8 files: Torque Endurance ×3, Threshold, TorqueMax, Rüegg, HIIT ×2): "My tip: if you can't hold the power at this cadence, lower the workout intensity (FTP bias) a few percent rather than grinding."
- Adaptation wording (both adaptation files): "My tip: if you can't hold the power at this cadence, lower the workout intensity (FTP bias) a few percent rather than grinding. These weeks are the low-stakes place to learn this."

The SIT files do not carry it, by design: their sprints are `FreeRide` blocks with no power target, so ERG is off and cannot spiral. Use Zwift's own names "workout intensity" / "FTP bias" (±25%, i.e. 75–125%). Never mention "Trainer Difficulty", which is a different setting.

### Fact events

Short, sourced facts shown in a recovery block, so the screen isn't only numbers. Rules: start with "Fact:", cite the source inline, check the wording against the research doc like any other claim, and use each fact in one or two build sessions only. New facts and quotes are vetted in `research/text-event-candidates.md` first: only entries Tom has marked **approved** go into a file, and the entry then records where it is used. The one fact in use today (TE 3×8 and Threshold 5×5, `duration="30"`):

"Fact: even in torque intervals, pedal force stays below about 54% of your maximum (Barranco-Gil 2024). This is endurance work, not strength training."

### Research facts and coach quotes
Text events should include:
- Why the interval is structured this way
- Study findings and data (with citations)
- Meaningful quotes from coaches (Henderson, EVOQ, Schep)

Place these in recovery or rest blocks, not during high-intensity work phases.

### What NOT to include
- No references to the training calendar, the plan's weeks or logging — riders may use these workouts in someone else's plan. (The two adaptation files may name their own weeks.)
- No invented facts. If evidence is anecdotal or limited, say so.

## Source attribution (non-negotiable)

These rules exist because a previous refactor introduced invented workouts with false source attributions.

- **Never invent a workout and attribute it to a source.** Every cadence, intensity, and duration must trace to the claimed source.
- **When scaling**, mark it explicitly: e.g. "EVOQ (scaled - fewer reps)". Explain what changed and why. Scaling must stay within the spirit of the source — don't change intensity class (e.g. sweet spot to Zone 2).
- The calendar (`research/training-calendar.md`) is the source of truth for which workouts exist and their parameters.
- The research document (`research/high-torque-training-research.md`) explains *why*. Check the "Source prescription reference" section before creating or modifying any workout.

## Validation checklist

After creating or editing a `.zwo` file, verify:

1. Power continuity: Warmup `PowerHigh` matches next block (exception: 85%+ FTP blocks). Cooldown `PowerLow` matches the previous block — or stays at the easy recovery level (~0.50) when the cooldown follows a work interval directly (see "Warmup / cooldown power exceptions").
2. Warmup ramps up (`PowerLow < PowerHigh`). Cooldown ramps down (`PowerLow > PowerHigh`).
3. No `Cadence=` on warmup, cooldown, recovery, or opener blocks.
4. `Cadence="X"` (capital C) on all interval blocks.
5. `activitySaveName` present with source prescription ranges.
6. `<name>` is under ~35 characters, has no prefix, and matches the data.ts `name:` in plain characters; `activitySaveName` starts with `High Torque: <name>`.
7. Source attribution text event in the warmup.
8. Knee safety warning present.
9. SEATED reminder in or before every low-cadence interval.
10. Countdown timing: `timeoffset = Duration - X` for "X seconds left" messages.
11. `<author>Tom Jelen</author>`.
12. All displayed values show source prescription ranges, not ZWO-fixed values.
13. **`Last updated:` date is current.** If this edit changed any content of the workout (interval added/removed, duration/cadence/intensity tweaked, description corrected, text-event typo fixed, file renamed), bump the date in the header comment to today's date. Do not bump for cosmetic edits to the header comment itself (e.g. fixing a URL typo). Same semantics as `HOME_LAST_UPDATED` in `site/CLAUDE.md`.
14. **No trailing recovery before the cooldown.** The block immediately before `<Cooldown>` is the final work interval, not a recovery block (see "Interval structure"). If the workout's duration must match the calendar, recompute the total after removing/adding any recovery.
15. **Sprints use `FreeRide`, not `MaxEffort`,** and the first sprint block is preceded by the max-effort marker comment. Keep `Cadence` on cadence-prescribed sprints; omit it on free-cadence sprints.
16. **Rest-block power follows "Power conventions for rest blocks"** (0.50 easy spin, 0.55 after openers, 0.65 in HIIT/SIT) and the text event says where the number comes from (mine / my estimate / the study).
17. **Can't-hold-the-power event present** in every file with a power-targeted low-cadence block (all except SIT), in the exact wording above.
18. **No "Tier" anywhere** (name, `activitySaveName`, description, text events), and the file sits in one of the two folders.
