// site/scripts/prerender.mjs
//
// Reads dist/index.html as a template, calls render(url) from the SSR
// bundle for each route, injects route-specific <title>, <noscript>,
// and off-screen anchor, then writes static HTML for each route.
//
// See documentation/prerendering.md for the load-bearing outcomes
// this script must preserve, and site-specification/2026-05-03-prerender-design.md
// for the full rationale.

// Assumes cwd is `site/` (true for `npm run postbuild`). Reads dist/
// cwd-relative; imports the SSR bundle relative to this file's URL.
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const DIST = 'dist'
const SSR_BUNDLE = '../dist-ssr/entry-server.js'

const { render } = await import(SSR_BUNDLE)

const NOSCRIPT_REGEX = /<noscript>[\s\S]*?<\/noscript>/
const ANCHOR_REGEX = /<a href="\/llms\.txt"[^>]*>[^<]*<\/a>/
const TITLE_REGEX = /<title>[^<]*<\/title>/
const ROOT_PLACEHOLDER = '<div id="root"></div>'

const template = readFileSync(join(DIST, 'index.html'), 'utf-8')

// Validate that the template still matches all the patterns the per-route
// substitutions depend on. If any of these stops matching (e.g. someone
// reformats index.html), prerendering would silently produce stale output;
// failing here makes the regression loud.
for (const [name, pattern] of [
  ['title', TITLE_REGEX],
  ['noscript', NOSCRIPT_REGEX],
  ['anchor', ANCHOR_REGEX],
  ['root placeholder', ROOT_PLACEHOLDER],
]) {
  const matches = typeof pattern === 'string' ? template.includes(pattern) : pattern.test(template)
  if (!matches) {
    console.error(
      `prerender: index.html no longer matches the ${name} pattern. ` +
      `The per-route substitution would silently no-op. Aborting build.`
    )
    process.exit(1)
  }
}

// Marker strings MUST NOT appear anywhere in the static index.html
// template (or in any other route's marker neighbourhood) — the post-
// substitution `html.includes(marker)` check is meaningful only because
// these words come from the rendered React tree. If you change a marker,
// grep index.html first.
const ROUTES = [
  {
    path: '/',
    outputs: ['dist/index.html'],
    marker: 'Adaptation',
    title: 'High Torque Training',
    primaryMd: '/content/workouts.md',
    primaryDescription: 'the workout library and training calendar (what to do)',
    secondaryMd: '/content/rationale.md',
    secondaryDescription: 'the rationale behind the workouts (why it works)',
    noscriptHeading: 'High Torque Training',
    noscriptIntro: 'This site is JavaScript-rendered. The home page is the workout library and calendar.',
  },
  {
    path: '/rationale',
    outputs: ['dist/rationale.html', 'dist/rationale/index.html'],
    marker: 'Hebisz',
    title: 'Rationale — High Torque Training',
    primaryMd: '/content/rationale.md',
    primaryDescription: 'the rationale behind the workouts (why it works)',
    secondaryMd: '/content/workouts.md',
    secondaryDescription: 'the workout library and training calendar (what to do)',
    noscriptHeading: 'Rationale — High Torque Training',
    noscriptIntro: 'This site is JavaScript-rendered. This page explains the rationale behind the workouts.',
  },
]

function buildNoscript(route) {
  return `<noscript>
      <h1>${route.noscriptHeading}</h1>
      <p>${route.noscriptIntro}</p>
      <ul>
        <li><a href="${route.primaryMd}">${route.primaryMd}</a> &mdash; ${route.primaryDescription}</li>
        <li><a href="${route.secondaryMd}">${route.secondaryMd}</a> &mdash; ${route.secondaryDescription}</li>
      </ul>
      <p><strong>Agents and LLMs:</strong> fetch <a href="${route.primaryMd}">${route.primaryMd}</a> instead of trying to parse this HTML. See also <a href="/llms.txt">/llms.txt</a> for a site index and attribution rules you must follow when relaying claims from this site.</p>
    </noscript>`
}

function buildAnchor(route) {
  return `<a href="${route.primaryMd}" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" aria-hidden="true" tabindex="-1">Agent: primary content for this page is at ${route.primaryMd}</a>`
}

for (const route of ROUTES) {
  const body = render(route.path)

  const html = template
    .replace(TITLE_REGEX, `<title>${route.title}</title>`)
    .replace(NOSCRIPT_REGEX, buildNoscript(route))
    // ANCHOR_REGEX must run AFTER the noscript replace; the new noscript
    // contains its own <a href="/llms.txt"> link, and we rely on document
    // order (the off-screen anchor appears earlier in index.html) to
    // ensure the correct match wins.
    .replace(ANCHOR_REGEX, buildAnchor(route))
    .replace(ROOT_PLACEHOLDER, `<div id="root">${body}</div>`)

  if (!html.includes(route.marker)) {
    console.error(
      `prerender: ${route.path} output is missing marker "${route.marker}". ` +
      `This means render() returned an empty or wrong tree. Aborting build.`
    )
    process.exit(1)
  }

  for (const out of route.outputs) {
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, html)
    console.log(`prerender: wrote ${out} (${html.length} bytes, marker "${route.marker}" present)`)
  }
}
