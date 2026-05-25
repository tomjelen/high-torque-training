// Prepares everything under public/ that's derived from sibling source dirs:
// the installable .zwo zip and the agent-readable research markdown copies.
// Runs as the `prebuild` npm step (cwd = site/).
import { execSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

// Mirror the .zwo files (directory structure only — no other files) into
// public/workouts so they're served individually and can be zipped.
run(
  "rsync -a --delete --delete-excluded --include='*/' --include='*.zwo' --exclude='*' ../workouts/ public/workouts",
)

// Drop any stale archives before rebuilding so at most one zip is ever present
// (also clears date-stamped zips left by older builds).
run('rm -f public/workouts/*.zip')

// The zip lives at a stable path/filename. Cache-busting is handled by the
// download panel appending ?v=<date> to the href, and the user-facing saved
// filename is set via the link's `download` attribute — both derived from the
// injected __ZWO_WORKOUTS_LAST_UPDATED__ constant. Keeping the served file
// stable means llms.txt and other references never churn.
run('cd public/workouts && zip -r high-torque-workouts.zip .')

// Agent-readable markdown copies served at /content/* (see agent-interfacing).
mkdirSync('public/content', { recursive: true })
run('cp ../research/high-torque-training-research.md public/content/rationale.md')
run('cp ../research/training-calendar.md public/content/workouts.md')
run('cp ../research/about.md public/content/about.md')
