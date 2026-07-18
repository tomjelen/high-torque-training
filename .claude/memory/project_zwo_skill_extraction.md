---
name: project-zwo-skill-extraction
description: zwo-format skill now lives in the published zwift-workout-skills plugin (installed 2026-07-18); this repo consumes it as a plugin; remaining work is distribution + deferred skill test
metadata:
  type: project
---

Done 2026-07-18: `zwo-format` extracted to public repo `tomjelen/zwift-workout-skills`
(plugin + own marketplace + community files), pushed, installed here via
`/plugin install zwift-workout-skills@zwift-workout-skills`, and verified loading.
Local copy deleted; project skill renamed `zwo` → `high-torque-zwo`; root and
`workouts/` CLAUDE.md updated (all left unstaged for Tom). Spec:
`docs/superpowers/specs/2026-07-06-zwo-skill-extraction-design.md`. Plan:
`docs/superpowers/plans/2026-07-07-zwo-skill-extraction.md`.

Standing rules:
- **Format-knowledge changes** are edited in `~/code/jelen/zwift-workout-skills`, Tom pushes, then `/plugin update zwift-workout-skills` here. Never recreate a local zwo-format skill. Bump `version` in plugin.json per its CONTRIBUTING (patch=fix, minor=new claim).
- The plugin repo's committed CLAUDE.md is contributor-facing; Tom's personal rules live in its untracked CLAUDE.local.md ([[feedback-tom-commits-on-main]] applies there too).
- GitHub repo was briefly named `zwift-workout-skills-` (trailing-hyphen typo, renamed same day); if an old clone/URL misbehaves, that's why.

Remaining:
1. Part 3 distribution (Tom, no deadline). Researched 2026-07-18: most skill hubs (SkillsMP, awesomeskill.ai, LobeHub, claudemarketplaces.com) auto-scrape public GitHub — no submission needed, topics/description/README drive ranking. Active submissions worth doing: PR to travisvn/awesome-claude-skills; claudeskills.info (editor-curated); official directory via submission FORM at clau.de/plugin-directory-submission (not a PR — mention their marketplace.json $schema URL 404s, we hit it); skills.sh ranks by installs, no submission.
2. Deferred by Tom to "after publishing" (now unblocked): subagent application test of the skill — writing-skills methodology, neutral sprint-workout prompt, check FreeRide/cadence-attrs/cooldown-PowerLow/name-length compliance.
3. Phase 2 someday: `zwo-authoring` skill (generalizable authoring guidance out of `high-torque-zwo`); triage table is in the spec.
