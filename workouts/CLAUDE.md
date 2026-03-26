# Zwift workouts

## Conventions

- When the calendar uses a cadence range:
  - Use the mid-point as target cadence for these files. This is because we cannot specify the range in the workout file, only a specific target, then Zwift will show this, and the yield warnings at +-5rpm. `cadenceHigh` and `cadenceLow` are lies.
  - Display the actual range in text-events. Display the range before the block starts, and remind about it during the block.
- When the calendar uses a specific target, then use this throughout the block and for all text events.
- No cadence attributes on warmup, cooldown, recovery, or opener segments — the research doesn't prescribe cadence for these. Strip `Cadence=` from those blocks.
- **Warmup/cooldown power continuity** — In ZWO, `PowerLow` is always the **start** of a ramp and `PowerHigh` is always the **end**, regardless of block type. This means:
  - **Warmup:** `PowerLow` = low starting power (e.g. 0.40), `PowerHigh` = higher ending power. `PowerHigh` must match the power of the next block (e.g. if followed by `IntervalsT OnPower="0.80"`, then `PowerHigh="0.80"`). Exception: warmups before blocks at 85%+ FTP intentionally end lower (you don't ramp into threshold/VO2max).
  - **Cooldown:** `PowerLow` = higher starting power, `PowerHigh` = low ending power (e.g. 0.40). `PowerLow` must match the power of the previous block. If preceded by `IntervalsT`, the previous block ends on `OffPower`, so `PowerLow` = `OffPower`.
  - **In short:** Warmup ramps up (PowerLow < PowerHigh). Cooldown ramps down (PowerLow > PowerHigh). The naming is confusing — `Low`/`High` refer to start/end, not magnitude.
- **Workout name length** — keep names to ~30–35 characters max. Longer names cause visual artifacts in Zwift.
- **`activitySaveName`** — always include this element for a descriptive post-ride save name.
- **Countdown timing** — "X seconds left" text events must have `timeoffset = Duration - X`. Off-by-30s errors are noticeable mid-ride.
- **No calendar/logging references in text events** — riders may use these workouts without the calendar. Text events should contain research facts and coach quotes only.

## About text events during workouts

Add text events during the workouts that explains:

- Why high-torque training is good
- Reminders of the warning signals
- Data/conclusions from the studies
- Meaningful quotes from respected coaches

Remember that we want factually correct information, or make it clear when information is anecdotal or lacks evidence.

## ZWO cadence attributes

- **`Cadence="X"`** is the only cadence related attribute that works. It will show the target cadence on the HUD and display warnings when you are off by more than 5 RPM. The attribute is `Cadence` and not `cadence`.
- **`cadenceHigh`** and **`cadenceLow`** seems to have no effect.

There is no official Zwift documentation for the ZWO format. Best community reference: [h4l/zwift-workout-file-reference](https://github.com/h4l/zwift-workout-file-reference). The refence is a result of scraping workout files, meaning there are attributes that do not work. Look at the usage-percentage as a hint.
