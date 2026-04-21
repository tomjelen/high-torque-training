---
name: ZWO file conventions from Zwift testing
description: Lessons learned from actually riding the workouts in Zwift — cadence display, name length, timing
type: feedback
originSessionId: 19737781-35b8-42dd-8e92-be34304a51ee
---
1. **Cadence must use `Cadence="X"`** — only `Cadence="X"` (capital C) works in Zwift. It shows the target on the HUD and warns at ±5 RPM. `cadenceLow`/`cadenceHigh` have no effect. When the research gives a range (e.g. 60–65 RPM), use the midpoint rounded down (e.g. 62) as the `Cadence` value. Display the actual range in text events.
3. **`IntervalsT` needs both `Cadence` and `CadenceResting`** — `Cadence` applies during `OnDuration`, `CadenceResting` during `OffDuration`. If only `Cadence` is set, Zwift buggy-applies `Cadence+5` on work and `Cadence-5` on rest. If you need one phase to have free cadence, use repeated `<SteadyState>` blocks instead.
2. **No cadence on warmup/cooldown/recovery** — the research doesn't prescribe cadence for these segments. Strip `Cadence=` from Warmup, Cooldown, recovery SteadyState, and openers.
4. **Workout names must be short** — around 30-35 characters max. Longer names cause visual artifacts in Zwift. Use "High Torque" terminology, not "Low Cadence Endurance".
5. **Use activitySaveName** — the ZWO `<activitySaveName>` element provides a descriptive save name for after the ride.
6. **Verify countdown timing** — text events like "30 seconds left" must have `timeoffset = Duration - 30`, not approximate. Off-by-30s errors are noticeable mid-ride.
7. **No calendar/logging references** — text events should contain research facts and coach quotes, not "log this" or "note in the calendar". Someone may use just the workouts without the calendar.
8. **Warmup/cooldown power continuity** — Warmup `PowerHigh` must match the next block's power. Cooldown `PowerLow` must match the previous block's power. Mismatches cause visible jumps in the power graph. Exception: HIIT warmups before jumps to 85%+ are intentionally lower.

**Why:** User rode W1 and noticed these issues in Zwift firsthand. Subsequent review tightened the rules.
**How to apply:** When creating or editing any ZWO workout file, always check these eight things.
