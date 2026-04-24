---
name: zwo
description: High Torque Training project conventions for .zwo workout files. Covers source attribution, display text rules, text event content, and the validation checklist. Works alongside the zwo-format skill.
paths: "**/*.zwo"
allowed-tools: Read, Edit, Write, Grep, Glob
---

# High Torque Training — ZWO Conventions

Project-specific rules for `.zwo` files in the High Torque Training library. For ZWO format basics (XML structure, power ramp semantics, cadence attributes), see `.skills/zwo-format/SKILL.md`.

## Author

Always `<author>Tom Jelen</author>`.

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

## Warmup power exception

Warmups before blocks at 85%+ FTP intentionally end lower — you don't ramp into threshold/VO2max. This overrides the general power continuity rule from `zwo-format`.

## Text event requirements

### Source attribution in warmup
Every workout must have a text event early in the warmup (~30-60s) stating:
- The source (e.g. "Source: EVOQ.BIKE staple torque session" or "Source: Hebisz & Hebisz (2024), weeks 1-4")
- Brief context on why this prescription exists

### Knee safety warning
Every low-cadence workout must include at least one knee warning. Example: "If your knees ache at any point during an interval, stop the interval. Don't push through knee discomfort."

### SEATED reminder
All low-cadence intervals are seated — non-negotiable. State "SEATED" or "Stay seated" prominently in or before every interval block. Standing lets you use body weight on the pedals, bypassing the forced muscular contraction that makes torque training work.

### Research facts and coach quotes
Text events should include:
- Why the interval is structured this way
- Study findings and data (with citations)
- Meaningful quotes from coaches (Henderson, EVOQ, Schep)

### What NOT to include
- No references to the training calendar or logging — riders may use these workouts without the calendar.
- No invented facts. If evidence is anecdotal or limited, say so.

## Source attribution (non-negotiable)

These rules exist because a previous refactor introduced invented workouts with false source attributions.

- **Never invent a workout and attribute it to a source.** Every cadence, intensity, and duration must trace to the claimed source.
- **When scaling**, mark it explicitly: e.g. "EVOQ (scaled - fewer reps)". Explain what changed and why. Scaling must stay within the spirit of the source — don't change intensity class (e.g. sweet spot to Zone 2).
- The calendar (`training-calendar-v2.md`) is the source of truth for which workouts exist and their parameters.
- The research document (`high-torque-training-research-v2.md`) explains *why*. Check the "Source prescription reference" section before creating or modifying any workout.

## Validation checklist

After creating or editing a `.zwo` file, verify:

1. Power continuity: Warmup `PowerHigh` matches next block (exception: 85%+ FTP blocks). Cooldown `PowerLow` matches previous block.
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
