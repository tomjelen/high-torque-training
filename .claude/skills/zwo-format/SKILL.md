---
name: zwo-format
description: Use when creating, editing, or reviewing .zwo Zwift workout files — especially for power ramp direction (Warmup/Cooldown), IntervalsT cadence attributes, textevent timing and duration, workout naming limits, or max effort/sprint blocks (FreeRide element).
paths: "**/*.zwo"
allowed-tools: Read, Edit, Write, Grep, Glob
---

# ZWO File Format

Rules for the Zwift `.zwo` XML format. These come from testing against Zwift and community documentation — not from official docs (there are none).

## XML structure

```xml
<workout_file>
    <author>Author Name</author>
    <name>Short Name (max ~35 chars)</name>
    <activitySaveName>Descriptive post-ride save name</activitySaveName>
    <description>Full workout description.</description>
    <sportType>bike</sportType>
    <tags/>
    <workout>
        <Warmup Duration="900" PowerLow="0.40" PowerHigh="0.75">
            <textevent timeoffset="30" duration="10" message="Text shown during warmup."/>
        </Warmup>

        <SteadyState Duration="300" Power="0.88" Cadence="55">
            <textevent timeoffset="0" message="Text shown during steady state."/>
        </SteadyState>

        <IntervalsT Repeat="4" OnDuration="240" OffDuration="240" OnPower="0.90" OffPower="0.50" Cadence="55" CadenceResting="85">
            <textevent timeoffset="10" message="Text shown during each interval cycle."/>
        </IntervalsT>

        <FreeRide Duration="30" FlatRoad="1">
            <textevent timeoffset="0" message="GO. Maximal effort — ERG is off, just gear up."/>
        </FreeRide>

        <Cooldown Duration="600" PowerLow="0.50" PowerHigh="0.40">
            <textevent timeoffset="30" message="Text shown during cooldown."/>
        </Cooldown>
    </workout>
</workout_file>
```

## Power targets

All power values can have fractions of FTP: `0.88` = 88% FTP.

### Max effort blocks — use `FreeRide`, not `MaxEffort` or `SteadyState`

For all-out sprint blocks where the rider should go as hard as possible, use `FreeRide`:

```xml
<FreeRide Duration="30" FlatRoad="1">
    <textevent timeoffset="0" message="GO. Maximal effort." />
</FreeRide>
```

- **Do not** use `SteadyState Power="1.50"` (or any high fraction): ERG mode caps output at the target, preventing a true all-out sprint.
- **Do not** use `MaxEffort` either. It is *supposed* to disable ERG, but it is barely-supported (the format reference documents only a `Duration` attribute, no child elements) and in practice ERG stays engaged on real setups — producing the cadence/resistance "spiral of death" during the sprint. This was hit empirically in the High Torque SIT and Rüegg workouts (2026-06-14).
- `FreeRide` is the native block that **automatically turns ERG off** for its duration and back on afterward, with no rider intervention. It supports nested text events and a `Cadence` attribute.
- `FlatRoad="1"` gives flat, controlled resistance the rider gears against, instead of following the in-game gradient.
- Most sprints are free-cadence — omit `Cadence` (as above). Add it only when the source prescribes a specific sprint cadence (it drives the HUD target); e.g. the High Torque SIT sprints are 50-60 rpm, so they carry `Cadence="55"`.
- Drop `Power` entirely — a free-ride block has no target.

### Power continuity (critical — this is the most common mistake)

`PowerLow` is always the **start** of a ramp and `PowerHigh` is always the **end**, regardless of block type. The names `Low`/`High` refer to start/end position, NOT to magnitude.

- **Warmup** ramps UP: `PowerLow` (start, low) < `PowerHigh` (end, high). `PowerHigh` should match the power of the next block for a smooth transition.
  - Example: if followed by `IntervalsT OnPower="0.80"`, then `PowerHigh="0.80"`.
- **Cooldown** ramps DOWN: `PowerLow` (start, high) > `PowerHigh` (end, low). `PowerLow` should match the power of the previous block. Yes, its counter-intuitive, PowerLow means start, which means the HIGHER power value.
  - If preceded by `IntervalsT`, the block ends on `OffPower`, so `PowerLow` = `OffPower`.
  - **Exception — cooldown straight after a work block.** When intervals end on the final work block with no trailing recovery (see "Don't reproduce the trailing recovery" below), keep `PowerLow` at the easy/recovery level (e.g. `0.50`), **not** the work power. A cooldown is meant to start easy; the downward step from the work interval into the cooldown is intended — the mirror of a warmup not ramping all the way into a hard block.

**Verify after every edit:**
- Warmup: `PowerLow < PowerHigh`
- Cooldown: `PowerLow > PowerHigh`
- Adjacent blocks have matching power at their shared boundary — except a deliberate step *down* into a recovery or cooldown block (a cooldown after a work interval starts at the easy ~0.50 level, not the work power).

## Cadence attributes

- **`Cadence="X"`** (capital C) is the only working cadence attribute. Shows target on HUD, warns at +/-5 rpm.
- **`cadenceHigh`** and **`cadenceLow`** have no effect. Do not use them.
- When the source gives a range, use the midpoint as the attribute value and display the actual range in text events.

### `IntervalsT` cadence — requires both attributes

`IntervalsT` has two cadence attributes that map to the two phases:

- **`Cadence`** — applied during `OnDuration` (the work interval).
- **`CadenceResting`** — applied during `OffDuration` (the recovery interval).

**Always specify both.** If only `Cadence` is set (no `CadenceResting`), Zwift exhibits a bug: it applies `Cadence+5` during `OnDuration` and `Cadence-5` during `OffDuration`. This is not documented anywhere — it was found through testing.

If you need one of the phases to have free/unspecified cadence, you cannot do that with `IntervalsT`. Use repeated `<SteadyState>` blocks instead.

### Don't reproduce the trailing recovery

`IntervalsT Repeat="N"` expands to N work phases **and** N recovery phases — it always ends on an `OffDuration` recovery. When you emulate intervals with repeated `<SteadyState>` blocks (e.g. because the recovery phase needs free cadence, per above), it's tempting to copy that on/off pairing for every rep. That leaves an **orphan recovery block** before the `Cooldown`: it has no following work interval to bridge to, it just duplicates the cooldown, and it inflates the workout's total duration.

Build interval sets as **N work blocks and N−1 recovery blocks** — recovery sits *between* intervals only — then go straight to the `Cooldown`. With native `IntervalsT`, get the same shape with `Repeat="N-1"` plus a standalone final work block before the `Cooldown`. The cooldown absorbs the post-final-interval recovery; see the power-continuity exception above for the intended power step.

## Naming

- **`<name>`** — max ~30-35 characters. Longer names cause visual artifacts in Zwift's UI.
- **`<activitySaveName>`** — always include. This is the name saved to your activity history after the ride.

## Text events

- `<textevent timeoffset="X" message="..."/>` — `timeoffset` is seconds from the start of the containing block.
- **`duration`** attribute (seconds) — controls how long the message is displayed. If omitted, Zwift uses a default display time.
- **Countdown timing** — "X seconds left" messages must have `timeoffset = Duration - X`. Example: 240s block, "30 seconds left" = `timeoffset="210"`.
- Text events in `IntervalsT` repeat with each interval cycle. Offsets are relative to the start of each cycle (on + off combined).

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Cooldown `PowerLow < PowerHigh` | `PowerLow` = start (high), `PowerHigh` = end (low) — opposite of what the names suggest |
| Adjacent blocks with mismatched power | `PowerHigh` of Warmup must equal `OnPower`/`Power` of next block; `PowerLow` of Cooldown must equal `OffPower` of preceding IntervalsT |
| `IntervalsT` with only `Cadence` set | Always set both `Cadence` and `CadenceResting`; Zwift bugs to ±5 rpm offset if only one is set |
| Using `cadenceHigh`/`cadenceLow` | These have no effect — use `Cadence` only |
| `<name>` over ~35 chars | Causes UI artifacts in Zwift |
| Countdown offset wrong | `timeoffset = Duration - X` (not X) |
| `SteadyState Power="1.50"` or `MaxEffort` for a sprint | Use `FreeRide Duration="..." FlatRoad="1"` — `SteadyState` ERG-caps the effort; `MaxEffort` is supposed to disable ERG but doesn't reliably, causing the spiral of death. `FreeRide` toggles ERG off and back on automatically. |

## Reference

There is no official Zwift documentation for the ZWO format. Best community reference: [h4l/zwift-workout-file-reference](https://github.com/h4l/zwift-workout-file-reference). Built by scraping workout files — some documented attributes don't work. Check usage percentages as a reliability hint.
