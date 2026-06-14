# High Torque Training — Project Memory

## Project

- [Task tracking workflow](project_task_tracking.md) — PLAN.md is source of truth; regenerate TODO.md from it, don't maintain by hand; no GitHub Issues (portability)
- [Knee-safety prominence](project_knee_safety_prominence.md) — Tom had W2 knee pain and had to redo; warnings must be loud enough that less-vigilant readers also catch them
- [llms.txt and agent accessibility](project_llms_and_agents.md) — research/ folder, served markdown, consistency script, llms.txt TODO about researcher citation
- [vite-env.d.ts globals + moduleDetection](project_vite_env_globals_moduledetection.md) — build-time `define` globals need `export {} + declare global` (not bare `declare const`) or `tsc -b` silently breaks; run full `npm run build`, not just vitest
- [FreeRide sprint conversion](project_freeride_sprint_conversion.md) — applied to main working tree (unstaged) 2026-06-14, Tom to commit; fixes MaxEffort↔ERG spiral; still needs trainer verification

## User & Feedback

- [User identity](user_identity.md) — Tom Jelen, ZWO author name
- [ZWO conventions from Zwift testing](feedback_zwo_conventions.md) — Cadence="X" attribute, name length, activitySaveName, countdown timing, power continuity
- [Workout attribution integrity](feedback_attribution.md) — Never invent workouts; every value must trace to a named source
- [One question at a time](feedback_one_question.md) — Don't batch 6 questions; ask the most important one first
- [rpm lowercase convention](feedback_rpm_lowercase.md) — Cadence unit is always written "rpm", never "RPM"
- ["High torque" over "low cadence" in user-facing copy](feedback_high_torque_over_low_cadence.md) — Tagline/title/marketing copy: prefer "high torque"; "low cadence" is fine for mechanical descriptions only
- [Tom commits on main, not me](feedback_tom_commits_on_main.md) — Work directly on main; leave changes unstaged; never branch/stage/commit unless Tom says so
