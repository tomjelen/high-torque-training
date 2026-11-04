---
name: site-consistency
description: Use after changes to research/ or site/src/, and before a release, to check that the rendered site (home, /rationale, /about) tells the same story as the research documents, llms.txt and the served markdown. Claude runs it in-session; no API key needed.
---

# Site consistency check

`npm test` already runs `site/src/content-consistency.test.ts`, which compares the exact facts deterministically: the file list, durations, sources, and the seated/knee text. This skill covers what a test can't: whether the **prose** on the rendered pages means the same thing as the source documents.

## Steps

1. **Build.** `cd site && npm run build` (the prebuild copies `research/*.md` to `public/content/`, so the served markdown is current).
2. **Serve.** `npx vite preview --port 4173 --strictPort` in the background (from `site/`). If the port is taken, pick another (e.g. 4180); don't kill a server you didn't start.
3. **View the pages** with the `playwright-cli` skill. For each of `/`, `/rationale` and `/about`, at desktop (`open --browser=chromium`, then `resize 1440 900`) and phone (`open --mobile --browser=chromium`). Pass `--browser=chromium`: the CLI's default browser may not be installed.
   - `playwright-cli goto http://localhost:4173<path>`
   - `playwright-cli screenshot --full-page --filename=.playwright-cli/site-consistency/<page>-<width>.png` (at the repo root; `.playwright-cli/` is gitignored)
   - read the rendered text: `playwright-cli --raw eval "document.querySelector('main')?.innerText ?? document.body.innerText"`. Open collapsed panels (`<details>`, "show more", the install panel) before reading, so hidden text is checked too.
   - On phone, also note text that is cut off, hidden, or missing compared with desktop.
4. **Compare** the rendered text against:
   - `research/high-torque-training-research.md` (rationale page),
   - `research/training-calendar.md` (home page: build, library, move-on rule, after the build),
   - `research/about.md` (about page),
   - `site/public/llms.txt` and the served copies `site/public/content/*.md`, fetched from the preview server (`curl -s http://localhost:4173/content/workouts.md` etc.).

   Look for: numbers (cadence, %FTP, reps, durations, rest), who a session or quote is credited to and its trust label, what is marked "ours", the 12-week order and move-on rule, after-the-build frequency, knee and seated rules, and any claim present in one place but missing or contradicted in another. Wording differences that keep the meaning are fine.
5. **Report** each contradiction as: what the page says, what the source says, the source `file:line`, the component that renders it (`site/src/...:line`, found with grep), and the screenshot path. Say "no contradictions" if there are none. Don't fix anything unless asked; a fix goes in its own commit.
6. **Stop the server** (kill the background preview) and `playwright-cli close`.
