# Redesign — current-site observations

Companion to `../redesign.md`. That doc states *what should change*; this one
records *what the current site actually looks like* so future sessions can
resume without re-screenshotting from scratch.

Screenshots live in `./screens/`. All captured at **1440×900 viewport** in
Playwright's bundled Firefox on 2026-04-14 against the local dev server.

## How to view the site yourself (Claude navigation guide)

These instructions are for you, Claude, when resuming this work in a future
session. The user cannot see rendered web pages — you have to take screenshots
and read them via the Read tool.

### One-time setup (already done)

- `@playwright/cli` is installed globally via `npm i -g @playwright/cli@latest`.
  Binary is `playwright-cli` (not `playwright`).
- Playwright's bundled Firefox is downloaded at `~/.cache/ms-playwright/firefox-*`.
- `site/.playwright-cli/` is gitignored. It is Playwright's scratch workspace
  (session state, auto-snapshots, default screenshot path).
- A full command reference ships with the package at
  `$(npm root -g)/@playwright/cli/skills/playwright-cli/SKILL.md` — read it if
  you need commands not covered here.

### Start the dev server

From `site/`:

```bash
export FNM_PATH="/home/jelen/.local/share/fnm" && export PATH="$FNM_PATH:$PATH" \
  && eval "$(fnm env --use-on-cd --shell bash)" \
  && npm run dev
```

Run it with `run_in_background: true` in the Bash tool. Vite prints
`Local: http://localhost:5173/` when ready (usually under 2s).

### Open a browser session

Use a named session (`-s=htt`) so subsequent commands reuse the same browser:

```bash
playwright-cli -s=htt open http://localhost:5173/ --browser firefox
playwright-cli -s=htt resize 1440 900
```

**Gotcha:** `resize` fails with a bogus CSS-selector error if the session was
opened without `--browser firefox` earlier. Fix: `playwright-cli -s=htt close`
and reopen cleanly. Always run `resize` immediately after `open`.

### Screenshots — file-path restriction

Screenshots can **only** be written under `site/` or `site/.playwright-cli/`.
Writing to `/tmp/...` fails with "File access denied: ... is outside allowed
roots." Save to `.playwright-cli/screens/`, then copy anything worth keeping
into `site-specification/redesign/screens/`.

```bash
# Viewport screenshot (what's currently on screen)
playwright-cli -s=htt screenshot \
  --filename /home/jelen/code/jelen/high-torque-training/site/.playwright-cli/screens/foo.png

# Full-page screenshot (entire scrollable page, stitched)
playwright-cli -s=htt screenshot --full-page \
  --filename .../site/.playwright-cli/screens/foo-full.png
```

Read the resulting PNG with the Read tool — it renders inline as an image.

### Scrolling

```bash
playwright-cli -s=htt eval "() => window.scrollTo(0, 700)"
playwright-cli -s=htt eval "() => window.scrollTo(0, document.body.scrollHeight)"
```

Useful scroll offsets at 1440×900 for the current site (approximate):
- `0` — header, knee-safety warning, W1/W2/W3 phase cards
- `700` — bottom of phase cards, top of "The High Torque Collection" (Entry tier)
- `1400` — Development + Challenging tiers
- `document.body.scrollHeight` — Advanced tier tail, Session Tracker, Download All, install link

### Interacting with elements

Get refs via `snapshot`, then use them:

```bash
playwright-cli -s=htt snapshot
# -> yields e1, e2, ... refs in the output
playwright-cli -s=htt click e15
```

### Cleanup

```bash
playwright-cli -s=htt close      # stop the browser
playwright-cli list              # see running sessions
playwright-cli close-all         # nuke everything
```

The Vite dev server running in background also needs to be stopped via the
Bash tool's kill mechanism if you want a clean slate.

## What the current site looks like

Refer to the screenshots in `./screens/`. Layout, top to bottom:

### 1. Header + phase cards — `screens/01-top.png`

- **"High Torque Training"** heading, with a **"Science & Rationale"** link
  top-right. No tagline, no "what is this / who is this for" intro.
- A tab-like row: **Workouts** (orange pill) + subtext
  **"Adaptation Phase — Weeks 1-3    0/3"**. Implies there may be other tabs
  or the adaptation is a distinct mode — worth confirming when we touch the IA.
- **Knee-safety paragraph** — dense block of prose, no visual separation, hard
  to skim. Important content but buried in wall-of-text form.
- **Three phase cards W1 / W2 / W3**, all Zone 2 at slightly different cadences
  (65-70 / 65 / 60-65 rpm). Each card shows: Sets × duration, Intensity,
  Cadence, Recovery, Total time. Below the stats: `Source: …` link and
  `Download .zwo` outlined button on one row, then `Mark Complete` as a
  full-width filled button below. W1 is active, W2/W3 are faded/disabled.

### 2. "The High Torque Collection" — `screens/02-collection-entry-dev.png`, `screens/03-collection-dev-challenging.png`

- Heading, a subtitle explaining "1–2 sessions per week…", and a small
  "Usage guidelines & progression" link/toggle (matches the redesign.md
  complaint about that section taking too much space — it may already be
  collapsed by default; needs verifying).
- Tiers, each a horizontal row of cards:
  - **Entry** — 2 cards (Torque Entry, Torque Staple 3×5). Cards are *very*
    wide because the row stretches them to fill.
  - **Development** — 3 cards (Torque Staple 5×5, Torque Staple 3×8, HIIT Intro).
  - **Challenging** — 3 cards (Threshold Torque, HIIT VO2max 4 reps, Rüegg
    VO2max + Sprint).
  - **Advanced** — 4 cards (TorqueMax, GT 2 sets, HIIT VO2max 6 reps, GT 3 sets).
  - **Visible problem:** card width is wildly inconsistent tier-to-tier (2 → 3
    → 3 → 4 columns stretching to the same container width). This is the
    "messy" feeling `redesign.md` calls out.
- Each card shows: title, a stats block (Intervals, Cadence, Total time),
  a `Source: …` link, and a `Download .zwo` outlined button. The download
  button is visually prominent on every card even though most users will
  download once and then forget.
- Tier descriptions (e.g. "The bread-and-butter sessions…") sit between tier
  header and the card row.

### 3. Session Tracker + Download-All — `screens/04-bottom-tracker-downloadall.png`

- **Session Tracker** is a full-width vertical form: Workout dropdown, Date
  picker, Notes textarea, Track Session button, then "No sessions tracked yet"
  below. It eats a lot of vertical space but very little horizontal — directly
  supports the redesign.md suggestion to move it next to the collection grid.
- **Download All Workouts (.zip)** button lives at the **very bottom of the
  page**, below the (empty) tracker list. Unstyled emphasis — just a plain
  button. This is the headline "install path" for new users and it is
  invisible without scrolling past everything else.
- **Zwift install instructions** is a single link under the download-all
  button. Also invisible without a full scroll.
- No footer, no author contact, no Strava/Zwift links, no "last updated" date.

### 4. Full-page reference — `screens/00-full-page.png`

Stitched full-page render at 1440 viewport. Useful to see proportions and
total page length at a glance.

## Observations tied back to `../redesign.md`

| Redesign.md claim | Confirmed visually? | Screenshot |
| --- | --- | --- |
| Card-internal button alignment inconsistent (Download / Mark Complete) | Partially — visible on phase cards; needs closer crop on collection cards | `01-top.png` |
| "Download .zwo" too prominent | Yes — outlined button on every card | `02`, `03` |
| Download-all + install instructions buried at bottom | Yes — absolute last elements on the page | `04-bottom-tracker-downloadall.png` |
| Usage guidelines section takes too much space | Unclear — looks already collapsed in this capture; verify on next pass | `02-collection-entry-dev.png` |
| Collection tiers look "messy" from inconsistent stretching | Yes — very obvious at 1440 width | `02`, `03` |
| Session tracker should sit beside collection (vertical vs horizontal mismatch) | Yes — tracker is tall/narrow, collection is wide | `04` + `00-full-page.png` |
| No intro explaining what high-torque training is / who it's for | Confirmed — top jumps straight to knee safety | `01-top.png` |
| No header/footer with author contact / Strava / Zwift | Confirmed — nothing at page bottom | `04-bottom-tracker-downloadall.png` |
| No "last updated" date | Confirmed | `01-top.png`, `04` |

## Open questions for next session

1. Is "Workouts" actually a tab (implying Science & Rationale is a second
   tab)? If so, the header is more IA than it first looks — confirm by
   inspecting the page snapshot or clicking "Science & Rationale".
2. Is "Usage guidelines & progression" already a collapsible, or static text?
   Affects whether the redesign just needs to restyle or actually add
   collapse behavior.
3. What's the right breakpoint plan? `redesign.md` mentions desktop / tablet /
   phone, but `site/CLAUDE.md` says desktop-only for now. Need the user to
   reconcile these two before we spec responsive layouts.
4. Close-up of a single collection card (cropped screenshot via element ref)
   is still missing — take one before proposing specific card-layout changes.

## What to do first on resume

1. Start dev server + open playwright-cli session (see instructions above).
2. Re-screenshot `01-top.png` and `04-bottom-tracker-downloadall.png` to
   confirm nothing has shifted since 2026-04-14.
3. Take the missing close-up of a single collection card.
4. Answer the open questions above, then start drafting the redesign spec.
