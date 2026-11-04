# Zwift Workout Files — Install Instructions

## Folder structure

```
workouts/
  High Torque - Adaptation/   ← 2 workouts (build weeks 1–2 and 3–4)
  High Torque - Library/      ← 10 workouts (build weeks 5–12, then free choice)
```

The program is a 12-week build, one session a week. Weeks 1–4 are adaptation, using the two files in `High Torque - Adaptation`. Weeks 5–12 use four files from `High Torque - Library`, each ridden twice: Torque Endurance 3×8 (weeks 5–6), Threshold 5×5 (weeks 7–8), TorqueMax (weeks 9–10) and HIIT 4×4 (weeks 11–12). After the build you pick freely from the whole library. The site (high-torque.jelen.dk) and `research/training-calendar.md` have the full plan and the rule for moving on. Each subfolder becomes a named folder inside Zwift's custom workout menu.

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

Zwift displays cadence targets as an overlay during the workout. They are guides, not enforcement — Zwift will not change resistance to force a cadence. You control cadence by choosing the right gear. For low-cadence sessions, pick a harder gear than normal and consciously slow your pedaling down to the target.

## Zwift vs outdoor

These workouts are designed for Zwift (ERG mode on a smart trainer). For outdoor equivalents, use the power targets as a guide and estimate cadence manually. ERG mode makes hitting the cadence targets much easier because the resistance adjusts automatically to maintain target power regardless of gear choice.
