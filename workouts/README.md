# Zwift Workout Files — Install Instructions

## Folder structure

```
workouts/
  High Torque - Adaptation/   ← 2 workouts (the 4-week adaptation: weeks 1–2 and 3–4)
  High Torque - Library/      ← 10 workouts (the 8-week build, then free choice)
```

The program is two plans, one session a week: a 4-week adaptation, then an 8-week build. The adaptation uses the two files in `High Torque - Adaptation`. The build uses four files from `High Torque - Library`, each ridden twice: Torque Endurance 3×8 (build weeks 1–2), Threshold 5×5 (weeks 3–4), TorqueMax (weeks 5–6) and HIIT 4×4 (weeks 7–8). After the build you pick freely from the whole library. The site (high-torque.jelen.dk) and `research/training-calendar.md` have the full plan and the rule for moving on. Each subfolder becomes a named folder inside Zwift's custom workout menu.

## How to install

1. Find your Zwift workout directory:
   - **Windows:** `%localAppData%\Zwift\Workouts\[your_user_id]\`
   - **macOS:** `~/Documents/Zwift/Workouts/[your_user_id]/`
   - **iOS/Android:** not supported for custom workouts — use a PC/Mac to load them

2. Copy the two `High Torque - ...` folders (including their `.zwo` files) directly into your user workout directory.

3. Restart Zwift. The folders will appear under **Custom Workouts** in the workout selection screen.

## Notes on power targets

All power values in the `.zwo` files are expressed as a **fraction of your FTP** (e.g. `0.88` = 88% of FTP). Zwift reads your FTP from your profile and scales accordingly. Keep your FTP up to date in Zwift for accurate targets.

## Notes on cadence targets

Zwift displays cadence targets as an overlay during the workout. They are guides, not enforcement: Zwift will not change anything to force a cadence.

In ERG mode (the intended setup), the trainer holds the power for you. You don't pick a gear. When a low-cadence interval starts, just drop to the target cadence (for example 50-60 rpm) and the trainer raises the resistance to hold the target power.

If your cadence sags below target, lower the workout intensity (FTP bias) rather than grinding. At low cadence, ERG can spiral: cadence sags, resistance climbs, cadence sags more. See "Riding it in Zwift: ERG and adapting to the day" in the research document.

The max-effort sprints are the exception: they are `FreeRide` blocks, so ERG is off and you do pick a gear (a hard one where the cadence target is 50-60 rpm).

## Zwift vs outdoor

These workouts are designed for Zwift (ERG mode on a smart trainer). For outdoor equivalents, use the power targets as a guide and estimate cadence manually. In ERG mode the resistance adjusts automatically to hold the target power, so you only manage your cadence. Outdoors you choose the gear yourself.
