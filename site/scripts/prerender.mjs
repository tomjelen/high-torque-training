// site/scripts/prerender.mjs
//
// Reads dist/index.html as a template, calls render(url) from the SSR
// bundle for each route, injects route-specific <title>, <noscript>,
// and off-screen anchor, then writes static HTML for each route.
//
// See documentation/prerendering.md for the load-bearing outcomes
// this script must preserve, and site-specification/2026-05-03-prerender-design.md
// for the full rationale.

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const DIST = 'dist'
const SSR_BUNDLE = '../dist-ssr/entry-server.js'

const { render } = await import(SSR_BUNDLE)

const template = readFileSync(join(DIST, 'index.html'), 'utf-8')

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

const NOSCRIPT_REGEX = /<noscript>[\s\S]*?<\/noscript>/
const ANCHOR_REGEX = /<a href="\/llms\.txt"[^>]*>[^<]*<\/a>/
const TITLE_REGEX = /<title>[^<]*<\/title>/
const ROOT_PLACEHOLDER = '<div id="root"></div>'

for (const route of ROUTES) {
  const body = render(route.path)

  const html = template
    .replace(TITLE_REGEX, `<title>${route.title}</title>`)
    .replace(NOSCRIPT_REGEX, buildNoscript(route))
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
