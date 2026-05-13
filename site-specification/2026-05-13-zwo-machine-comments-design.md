# ZWO machine-readable header comments — design

**Status:** spec, awaiting implementation
**Date:** 2026-05-13
**Author:** Tom Jelen (with Claude)

## Problem

Two concrete problems motivate this change:

1. **Workout version disambiguation on the Zwift computer.** Tom routinely experiments with newer and older versions of the same workout side-by-side. When looking at a `.zwo` file on his Zwift PC, there is currently no way to tell which version it is without diffing against the repo. He needs a glanceable "last updated" date inside each file.
2. **Future "new workouts available" UX on the site.** The "Download / install workouts" section should auto-expand and indicate that there are new or updated workouts since the visitor last dismissed the panel or downloaded. The site needs a machine-readable signal — a per-workout date and a derived library-level "last updated" — to power this.

A third, secondary motivation: `.zwo` files travel independently of the website. When an agent (Claude, ChatGPT, Gemini) is fed a `.zwo` file as a standalone artefact, it currently has no path back to the project's broader context — the rationale, the calendar, the attribution rules. A small XML comment with breadcrumbs back to the canonical context fits the project's existing agent-interfacing strategy (see `documentation/agent-interfacing.md`).

## Non-goals

- **No UI changes in this iteration.** The site-level `ZWO_WORKOUTS_LAST_UPDATED` is plumbed but not displayed. The "new workouts since you last visited" UX is a separate, future feature that consumes this plumbing.
- **No automated linting** of date freshness. Hand-maintained means hand-maintained. If discipline rots in practice, a check can be added later.
- **No changes to the canonical authoring workflow** beyond the new "bump the date" rule. Workouts are still hand-edited; this isn't a code-gen project.

## Design

### 1. The XML comment in each `.zwo`

A comment block is added between the XML declaration and the root element. (XML comments cannot precede the `<?xml ?>` declaration.) Concrete shape:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  High Torque Training — Zwift workout
  Last updated: 2026-05-13

  Site:      https://high-torque.jelen.dk/
  Calendar:  https://high-torque.jelen.dk/content/workouts.md
  Rationale: https://high-torque.jelen.dk/content/rationale.md
  LLMs:      https://high-torque.jelen.dk/llms.txt
-->
<workout_file>
  ...
```

Rules:

- The `Last updated:` line is the **first content line** of the comment, so a regex parser can rely on its position.
- Date format is **ISO `YYYY-MM-DD`**, matching `HOME_LAST_UPDATED` and `RATIONALE_LAST_UPDATED` in `site/src/App.tsx`.
- The four URLs are written exactly as above. The calendar and rationale URLs point at the **machine-readable markdown mirrors** (`/content/workouts.md`, `/content/rationale.md`) rather than the HTML pages — the primary audience of the comment is machines, and the existing `<link rel="alternate">` infrastructure on the HTML pages would only get them to the same place anyway.

### 2. Date semantics — hand-maintained

The date is hand-maintained per file. The rule mirrors the existing `HOME_LAST_UPDATED` semantics already documented in `site/CLAUDE.md`:

- **Bump on any content edit to that specific workout** — new interval, tweaked duration/cadence/intensity, corrected description, renamed file, fixed text-event typo.
- **Do not bump for cosmetic comment-only changes** to the header itself (e.g. updating a URL in the comment block, fixing a typo in the breadcrumb).

This rule is documented in `.skills/zwo/SKILL.md` so it appears in the post-edit validation checklist whenever a `.zwo` is being edited.

### 3. Site-level `ZWO_WORKOUTS_LAST_UPDATED` — generated

`ZWO_WORKOUTS_LAST_UPDATED` is **not** maintained by hand. It is derived as `max()` of the per-file dates, so it cannot disagree with the workout library.

Mechanics:

- A new script `site/scripts/extract-workouts-last-updated.mjs` reads every `.zwo` in `../workouts/`, parses each `Last updated: YYYY-MM-DD` line out of the header comment, and computes the max.
- It writes a generated TypeScript module: `site/src/lastUpdated.generated.ts`, exporting:
  ```ts
  export const ZWO_WORKOUTS_LAST_UPDATED = '2026-05-13'
  ```
- `site/src/App.tsx` imports `ZWO_WORKOUTS_LAST_UPDATED` from the generated module. `HOME_LAST_UPDATED` and `RATIONALE_LAST_UPDATED` remain hand-maintained constants in `App.tsx` itself.
- The generated file is **gitignored** — it's a build artefact, not source.
- The script is wired into the `prebuild` step in `site/package.json`, before the rsync of the workouts.

### 4. The "HOME ≥ ZWO" invariant

`HOME_LAST_UPDATED` must always be **≥** `ZWO_WORKOUTS_LAST_UPDATED`. The reasoning: the workouts are a strict subset of the workout library (calendar) content. Any workout edit ipso facto means the library has changed, so `HOME_LAST_UPDATED` should already be bumped at the same time. The reverse isn't true — the calendar can change (e.g. a new note added to a week's narrative) without any `.zwo` changing.

The invariant is documented in `site/CLAUDE.md` alongside the existing `HOME_LAST_UPDATED` / `RATIONALE_LAST_UPDATED` semantics. **Not enforced in code initially** — it's a documented workflow rule. If drift ever happens, a build-time assertion in the extract script is a one-line addition (`assert HOME_LAST_UPDATED >= ZWO_WORKOUTS_LAST_UPDATED`); we don't pay for it before we need it.

### 5. Seeding the initial dates

The 15 canonical workouts already have a history. To avoid lying on day one ("everything was updated today"), each file's initial `Last updated:` value is seeded from `git log -1 --format=%cs <file>` — the date of the most recent commit that touched the file. This means the seed reflects actual history, and the derived `ZWO_WORKOUTS_LAST_UPDATED` is meaningful from the first build.

If a file has been edited as part of this change (e.g. to add the comment), the seed still uses the *prior* commit's date — the comment-only edit shouldn't reset the workout's logical timestamp. (This matches the "don't bump for cosmetic comment-only changes" rule from §2.)

## Files touched

- **15 canonical `.zwo` files** in `workouts/` — add the comment block, with `Last updated:` seeded from each file's prior git commit date.
- **`site/package.json`** — extend the `prebuild` script to invoke the extract script.
- **`site/scripts/extract-workouts-last-updated.mjs`** — new.
- **`site/src/lastUpdated.generated.ts`** — new, gitignored.
- **`.gitignore`** (root or `site/.gitignore`) — add the generated file.
- **`site/src/App.tsx`** — import `ZWO_WORKOUTS_LAST_UPDATED` from the generated module.
- **`site/CLAUDE.md`** — document the HOME ≥ ZWO invariant and the new constant.
- **`.skills/zwo/SKILL.md`** — add the header-comment requirement and the "bump the date" rule to the post-edit checklist.
- **`CLAUDE.md`** (root) — short pointer under "ZWO file conventions".

## Out of scope / future work

- **Site UX for "new workouts available."** The `ZWO_WORKOUTS_LAST_UPDATED` constant is plumbed but unused. The future feature will compare it against a `localStorage` value (last time the user dismissed / downloaded) and auto-expand the install panel with an indicator. Because each `.zwo` carries its own date, a richer UX is possible later: telling the user *which* workouts changed, not just *that* something changed.
- **Per-workout granularity in the served zip.** The zip already includes the stamped files for free (it's built from `public/workouts/` after the rsync), so no further work is needed.
- **Automated date-bump check.** A pre-commit hook or CI lint that warns "this `.zwo` changed but its date didn't" is feasible but deferred — see §2 reasoning.

## Open questions

None at spec-write time. If implementation surfaces something unexpected (e.g. an existing tool that already parses ZWO comments and would conflict with this format), pause and resolve before continuing.
