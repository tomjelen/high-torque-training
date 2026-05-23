---
name: zwo
description: Use when creating or editing .zwo files in the High Torque Training project — applies to source attribution, display text, text event content and timing, message complexity during intervals, and the post-edit validation checklist.
paths: "**/*.zwo"
allowed-tools: Read, Edit, Write, Grep, Glob
---

# High Torque Training — ZWO Conventions

Project-specific rules for `.zwo` files in the High Torque Training library. For ZWO format basics (XML structure, power ramp semantics, cadence attributes), see the **zwo-format** skill.

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

- `<name>` — prefix with `HT`. Example: `HT Torque Entry 80%`.
- `<activitySaveName>` — format: `High Torque Tier N: Name - XxYmin Z% FTP R rpm`. Use **source prescription ranges**, not ZWO-fixed values.

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

Never show "80% FTP" when the source says "80-85% FTP". The ZWO format forced us to pick a value — the rider should see the real prescription.

## Cadence placement

No cadence attributes on warmup, cooldown, recovery, or opener segments. Only on interval blocks where the research prescribes a specific cadence.

## Interval structure — no trailing recovery

High Torque interval sessions are built from repeated `<SteadyState>` blocks rather than `IntervalsT`, because the recovery phase needs free (unspecified) cadence and `IntervalsT` can't do that without the ±5 rpm bug (see `zwo-format`).

When emulating this way, write **N work blocks and N−1 recovery blocks** — recovery sits *between* intervals only. After the final work block, go **straight to the `Cooldown`**. Do not append a trailing recovery block: it has no interval to bridge to, it just duplicates the cooldown, and it inflates the workout duration. (A faithful copy of `IntervalsT`'s on/off pairing produces exactly this orphan — that's the trap to avoid.)

## Warmup / cooldown power exceptions

Two intentional breaks from the `zwo-format` power-continuity rule:

- **Warmup before a hard block.** Warmups before blocks at 85%+ FTP intentionally end lower — you don't ramp into threshold/VO2max.
- **Cooldown after a work interval.** Because interval sessions end on the final work block and drop straight into the cooldown (see "Interval structure" above), keep the `Cooldown` `PowerLow` at the easy/recovery level (~0.50) regardless of the higher work power before it. A cooldown is meant to start easy; the downward step into it is correct — the mirror of the warmup exception. Do **not** raise `PowerLow` to match the work interval.

## Text event requirements

### Source attribution in warmup
Every workout must have a text event early in the warmup (~30s) stating:
- The source (e.g. "Source: EVOQ.BIKE staple torque session" or "Source: Hebisz & Hebisz (2024), weeks 1-4")
- Brief context on why this prescription exists

Then a second event at ~60-90s with a site tidbit (pick one, rotate across workouts):
1. "Full research and protocol rationale at high-torque.jelen.dk"
2. "Log this session at high-torque.jelen.dk — track your progression over the weeks"
3. "Want to go deeper on the science? high-torque.jelen.dk/rationale"
4. "Session logger and full workout calendar at high-torque.jelen.dk"
5. "All the research behind this program: high-torque.jelen.dk"

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

### SEATED reminder
All low-cadence intervals are seated — non-negotiable. State "SEATED" or "Stay seated" prominently in or before every interval block. Standing lets you use body weight on the pedals, bypassing the forced muscular contraction that makes torque training work.

### Research facts and coach quotes
Text events should include:
- Why the interval is structured this way
- Study findings and data (with citations)
- Meaningful quotes from coaches (Henderson, EVOQ, Schep)

Place these in recovery or rest blocks, not during high-intensity work phases.

### What NOT to include
- No references to the training calendar or logging — riders may use these workouts without the calendar.
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
6. `<name>` is under ~35 characters.
7. Source attribution text event in the warmup.
8. Knee safety warning present.
9. SEATED reminder in or before every low-cadence interval.
10. Countdown timing: `timeoffset = Duration - X` for "X seconds left" messages.
11. `<author>Tom Jelen</author>`.
12. All displayed values show source prescription ranges, not ZWO-fixed values.
13. **`Last updated:` date is current.** If this edit changed any content of the workout (interval added/removed, duration/cadence/intensity tweaked, description corrected, text-event typo fixed, file renamed), bump the date in the header comment to today's date. Do not bump for cosmetic edits to the header comment itself (e.g. fixing a URL typo). Same semantics as `HOME_LAST_UPDATED` in `site/CLAUDE.md`.
14. **No trailing recovery before the cooldown.** The block immediately before `<Cooldown>` is the final work interval, not a recovery block (see "Interval structure"). If the workout's duration must match the calendar, recompute the total after removing/adding any recovery.
