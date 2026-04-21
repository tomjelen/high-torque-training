---
name: zwo-format
description: Zwift workout file (.zwo) XML format rules. Covers power ramp semantics, cadence attributes, naming limits, and structural conventions. Universal to any Zwift workout project.
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
            <textevent timeoffset="30" message="Text shown during warmup."/>
        </Warmup>

        <SteadyState Duration="300" Power="0.88" Cadence="55">
            <textevent timeoffset="0" message="Text shown during steady state."/>
        </SteadyState>

        <IntervalsT Repeat="4" OnDuration="240" OffDuration="240" OnPower="0.90" OffPower="0.50" Cadence="55" CadenceResting="85">
            <textevent timeoffset="10" message="Text shown during each interval cycle."/>
        </IntervalsT>

        <Cooldown Duration="600" PowerLow="0.50" PowerHigh="0.40">
            <textevent timeoffset="30" message="Text shown during cooldown."/>
        </Cooldown>
    </workout>
</workout_file>
```

## Power targets

All power values can have fractions of FTP: `0.88` = 88% FTP.

### Power continuity (critical — this is the most common mistake)

`PowerLow` is always the **start** of a ramp and `PowerHigh` is always the **end**, regardless of block type. The names `Low`/`High` refer to start/end position, NOT to magnitude.

- **Warmup** ramps UP: `PowerLow` (start, low) < `PowerHigh` (end, high). `PowerHigh` should match the power of the next block for a smooth transition.
  - Example: if followed by `IntervalsT OnPower="0.80"`, then `PowerHigh="0.80"`.
- **Cooldown** ramps DOWN: `PowerLow` (start, high) > `PowerHigh` (end, low). `PowerLow` should match the power of the previous block. Yes, its counter-intuitive, PowerLow means start, which means the HIGHER power value.
  - If preceded by `IntervalsT`, the block ends on `OffPower`, so `PowerLow` = `OffPower`.

**Verify after every edit:**
- Warmup: `PowerLow < PowerHigh`
- Cooldown: `PowerLow > PowerHigh`
- Adjacent blocks have matching power at their shared boundary.

## Cadence attributes

- **`Cadence="X"`** (capital C) is the only working cadence attribute. Shows target on HUD, warns at +/-5 RPM.
- **`cadenceHigh`** and **`cadenceLow`** have no effect. Do not use them.
- When the source gives a range, use the midpoint as the attribute value and display the actual range in text events.

### `IntervalsT` cadence — requires both attributes

`IntervalsT` has two cadence attributes that map to the two phases:

- **`Cadence`** — applied during `OnDuration` (the work interval).
- **`CadenceResting`** — applied during `OffDuration` (the recovery interval).

**Always specify both.** If only `Cadence` is set (no `CadenceResting`), Zwift exhibits a bug: it applies `Cadence+5` during `OnDuration` and `Cadence-5` during `OffDuration`. This is not documented anywhere — it was found through testing.

If you need one of the phases to have free/unspecified cadence, you cannot do that with `IntervalsT`. Use repeated `<SteadyState>` blocks instead.

## Naming

- **`<name>`** — max ~30-35 characters. Longer names cause visual artifacts in Zwift's UI.
- **`<activitySaveName>`** — always include. This is the name saved to your activity history after the ride.

## Text events

- `<textevent timeoffset="X" message="..."/>` — `timeoffset` is seconds from the start of the containing block.
- **Countdown timing** — "X seconds left" messages must have `timeoffset = Duration - X`. Example: 240s block, "30 seconds left" = `timeoffset="210"`.
- Text events in `IntervalsT` repeat with each interval cycle. Offsets are relative to the start of each cycle (on + off combined).

## Reference

There is no official Zwift documentation for the ZWO format. Best community reference: [h4l/zwift-workout-file-reference](https://github.com/h4l/zwift-workout-file-reference). Built by scraping workout files — some documented attributes don't work. Check usage percentages as a reliability hint.
