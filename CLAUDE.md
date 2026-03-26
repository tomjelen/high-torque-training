# High Torque Training — Project Guidelines

## What this project is

Zwift workout files (.zwo), a research document, and a training calendar for low-cadence/high-torque cycling training. The target audience is a recreational-competitive cyclist doing ~10 hours/week — not a professional athlete.

## Protocol standards

- All training protocols must be grounded in **peer-reviewed research** or **guidance from respected professional coaches** (e.g. Neal Henderson, EF Pro Cycling staff, CTS, EVOQ.BIKE). Do not invent protocols based on general reasoning alone.
- When a protocol comes from a study, cite the study specifically (authors, year, journal). When it comes from coaching practice, name the source.
- All intensity and volume must be **scaled for a non-professional rider doing ~10 hours/week**. Study protocols designed for elite athletes should be adapted down, with the adaptation noted and justified.
- If evidence is weak, limited, or based on a single study, say so explicitly. Do not present tentative findings as established fact.

## Workout attribution — critical rules

These rules exist because a previous refactor introduced invented workouts with false source attributions. This must not happen again.

- **Never invent a workout and attribute it to a source.** Every cadence, intensity, and duration must come from the claimed source. If a value can't be traced, the workout doesn't belong in the library.
- **When scaling a workout**, mark it explicitly (e.g. "EVOQ (scaled — fewer reps)") and explain what was changed and why. The scaling must stay within the spirit of the source — don't change intensity class (e.g. sweet spot → Zone 2) when scaling.
- **When restructuring or refactoring**, verify that cadence and intensity values still match their claimed sources. Values get corrupted during rewrites — a progression-specific value (e.g. a week-6 cadence target) can accidentally become a universal default.
- **The research document's "Source prescription reference" section** lists what each source actually prescribes. Check workouts against it before adding or modifying.
- **The calendar is the source of truth** for which workouts are in the library and their parameters. The research document explains *why*; the calendar says *what*.

## Transparency and traceability

This is the most important principle in the project: **every session, every rule, every recommendation must be traceable to a reason and a source.**

- The research document is the single source of truth for *why* the training works. The workouts and calendar implement it.
- When adding or modifying a workout, the research document should already contain (or be updated to contain) the justification.
- The confidence table in the research document tracks how solid each claim is and what would change it. Keep it current.
- Text events inside ZWO files should include brief context on *why* an interval is structured the way it is — not just what to do. The rider should be able to understand the reasoning mid-session.
- The goal is that any session or recommendation can be challenged and updated when new research or coaching knowledge emerges. Nothing should be "just because."

## ZWO file conventions

- Power targets are fractions of FTP (e.g. `0.88` = 88% FTP)
- All low-cadence intervals are seated — this is non-negotiable and must be stated in text events
- Knee safety warnings must appear in every low-cadence workout
- Workout durations in ZWO files must match the calendar. The calendar is the source of truth for duration.
- `<author>` tag: "High Torque Training"

## Naming

- Low cadence = high torque. The project uses "High Torque" as the brand name. Do not use "Low Torque."
- Workout folder names: "High Torque - Phase N ..." or "High Torque - Library"
