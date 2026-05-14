# Site

This is the web site for the high torque training sessions.

Specs, plans and a todo list for this site can be found in ../site-specification.

## Node version

The required Node version is in `.nvmrc`. Tom uses `fnm` to manage Node versions.

## UX scope

Supports mobile, iPad (portrait + landscape), and desktop via Tailwind responsive prefixes (`sm:` 640, `md:` 768, `lg:` 1024). Desktop remains the primary target for layout decisions; new components should still look right at 1440 first, then adapt down.

Mobile users can read everything but **cannot install workouts** (Zwift custom workouts require a desktop or tablet running Zwift). The install panel defaults to collapsed for mobile first-time visitors. Don't surface install-only CTAs in the mobile chrome.

## Last updated dates

Each page has its own "Last updated" date shown in the footer, defined in `src/App.tsx`:

- `HOME_LAST_UPDATED` — home/workouts page
- `RATIONALE_LAST_UPDATED` — rationale page
- `ZWO_WORKOUTS_LAST_UPDATED` — **derived**, not hand-maintained. Computed as `max()` of the `Last updated:` dates inside each `workouts/*.zwo` header comment by `scripts/extract-workouts-last-updated.mjs`, then injected at build time via Vite's `define` option (see `vite.config.ts`). App.tsx exposes it as a string constant for site features that need to detect new workouts.

These dates signal **information freshness**, but the two pages calibrate this differently because they promise different things to the reader:

- **`HOME_LAST_UPDATED` (workouts page)** — a library. Bump on any content edit: a new workout, a tweaked duration, a renamed file, a corrected description. The date answers "when was the library last changed?"
- **`RATIONALE_LAST_UPDATED` (rationale page)** — an evidence review. Bump only when the substance changes: new or revised research, updated coaching input, corrected claims, changed confidence levels. Do **not** bump for typo fixes or wording tweaks that don't change the substance. The date answers "when was the rationale last reviewed?"

Never bump either date for site chrome — footer/header copy, styling, layout, component refactors — since those don't affect what either page promises.

The dates are per-page, not site-wide — don't bump both unless both pages actually qualify.

### Invariant: HOME ≥ ZWO

`HOME_LAST_UPDATED` must always be `≥` `ZWO_WORKOUTS_LAST_UPDATED`. The workouts are a strict subset of what the workout-library page shows — any workout edit means the library has changed, so `HOME_LAST_UPDATED` should be bumped at the same time. The reverse is not true: the calendar narrative around the workouts can change without any `.zwo` changing.

The invariant is documented, not code-enforced. If it ever drifts, add an assertion in `scripts/extract-workouts-last-updated.mjs` or in `vite.config.ts` where the constant is injected.
