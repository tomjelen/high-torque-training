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

These dates signal **information freshness**, but the two pages calibrate this differently because they promise different things to the reader:

- **`HOME_LAST_UPDATED` (workouts page)** — a library. Bump on any content edit: a new workout, a tweaked duration, a renamed file, a corrected description. The date answers "when was the library last changed?"
- **`RATIONALE_LAST_UPDATED` (rationale page)** — an evidence review. Bump only when the substance changes: new or revised research, updated coaching input, corrected claims, changed confidence levels. Do **not** bump for typo fixes or wording tweaks that don't change the substance. The date answers "when was the rationale last reviewed?"

Never bump either date for site chrome — footer/header copy, styling, layout, component refactors — since those don't affect what either page promises.

The dates are per-page, not site-wide — don't bump both unless both pages actually qualify.
