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
- `<author>` tag: "Tom Jelen"
- Each `.zwo` file carries a machine-readable XML header comment between `<?xml ?>` and `<workout_file>`, with a hand-maintained `Last updated: YYYY-MM-DD` line and breadcrumb links to the site, calendar, rationale, and `/llms.txt`. **Bump the date on any content edit to that workout** (same semantics as `HOME_LAST_UPDATED` in `site/CLAUDE.md`). The site-level `ZWO_WORKOUTS_LAST_UPDATED` constant is derived as `max()` of these dates by `site/scripts/extract-workouts-last-updated.mjs` and injected at build time via Vite's `define`.

## Naming

- The project's brand name is "High Torque" / "High Torque Training."
- **Prefer "high torque" over "low cadence" in user-facing copy** (taglines, page titles, meta descriptions, marketing text). "High torque" captures both the low cadence *and* the meaningful intensity that defines this training; plain "low cadence" also covers easy spinning, which is not what this is about. "Low cadence" is fine when describing the mechanical aspect specifically (e.g., "seated, low-cadence intervals" in a workout description) — but the *training modality* is "high-torque training," not "low-cadence training."
- Workout folder names: "High Torque - Phase N ..." or "High Torque - Library"

## Consistency check

After any session that modifies files under `research/` or `site/src/`, run the consistency check to verify the website and source documents still tell the same story:

```
ANTHROPIC_API_KEY=... node site/scripts/check-consistency.mjs
```

Requires a running dev or preview server (`npm run dev` in `site/`) and an `ANTHROPIC_API_KEY`. The script takes full-page screenshots of both site pages, compares them against the markdown source documents using Claude Sonnet vision (5 samples in parallel), and exits non-zero if any sample finds a contradiction.

## Agent / LLM interfacing

The site has a deliberate setup for making its content readable to AI agents (Claude, ChatGPT, Gemini) using `web_fetch`-style tools: a `/llms.txt`, parallel markdown copies of the workout calendar and rationale, and discoverability hints in `index.html`. The design rationale and a full inventory of pieces is in `documentation/agent-interfacing.md`.

**Read `documentation/agent-interfacing.md` before** editing any of:

- `site/public/llms.txt`
- the `<noscript>`, `<link rel="alternate">`, or off-screen agent-index anchor in `site/index.html`
- the `prebuild` script in `site/package.json` (it generates the agent-served markdown)
- `site/scripts/check-consistency.mjs`

Also relevant context when a user asks about LLM/agent behaviour against the deployed site.

## Installing npm dependencies

`sfw` (Socket Firewall) is a `devDependency` in `site/`. When adding a new npm package, run the install through it so install-time scripts and the package itself get scanned:

```
cd site && npx sfw npm install <pkg>      # instead of: npm install <pkg>
```

On a fresh checkout, run a plain `npm install` in `site/` once to pull the dev tooling (including `sfw` itself — it can't bootstrap-scan its own install), then use `npx sfw npm install …` for everything after. `npx sfw` downloads the actual firewall binary on first run, so the first call needs network.

This is a **convention, not an enforced boundary.** We tried automatic interception (PATH shims, a BASH_ENV hook, a command-rewriting hook) and removed all of it: PATH shims can't win against the harness, which re-applies its own PATH after `BASH_ENV` runs, and command-string matching is trivially evaded (`n""pm`, variable indirection, and even a plain `npm install` from `package.json` slip past). A clear instruction everyone can read beats a leaky guard that looks stronger than it is.

`sfw` catches known-bad and AI-flagged packages, not zero-days or freshly-compromised ones. The only real boundary would be environment-level (sandboxing the session, network-egress control) — out of scope unless this work moves into a container.
