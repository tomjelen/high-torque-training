// Per-route static HTML emitter (postbuild).
// See documentation/prerendering.md for the load-bearing outcomes.
//
// Assumes cwd is `site/` (true for `npm run postbuild`). Reads dist/
// cwd-relative; imports the SSR bundle relative to this file's URL.
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const DIST = 'dist'
const SSR_BUNDLE = '../dist-ssr/entry-server.js'
const DOMAIN = 'https://high-torque.jelen.dk'

// Read last-updated dates from the authoritative source rather than maintaining
// a separate copy. If the constants are ever renamed, the build will fail loudly.
const appSrc = readFileSync('src/App.tsx', 'utf-8')
function extractDate(name) {
  const m = appSrc.match(new RegExp(`const ${name} = '(\\d{4}-\\d{2}-\\d{2})'`))
  if (!m) { console.error(`prerender: could not find ${name} in src/App.tsx`); process.exit(1) }
  return m[1]
}
const HOME_LAST_UPDATED = extractDate('HOME_LAST_UPDATED')
const RATIONALE_LAST_UPDATED = extractDate('RATIONALE_LAST_UPDATED')

const { render } = await import(SSR_BUNDLE)

const NOSCRIPT_REGEX = /<noscript>[\s\S]*?<\/noscript>/
const ANCHOR_REGEX = /<a href="\/llms\.txt"[^>]*>[^<]*<\/a>/
const TITLE_REGEX = /<title>[^<]*<\/title>/
const META_DESCRIPTION_REGEX = /<meta name="description" content="[^"]*" \/>/
const ROOT_PLACEHOLDER = '<div id="root"></div>'

const template = readFileSync(join(DIST, 'index.html'), 'utf-8')

// Validate that the template still matches all the patterns the per-route
// substitutions depend on. If any of these stops matching (e.g. someone
// reformats index.html), prerendering would silently produce stale output;
// failing here makes the regression loud.
for (const [name, pattern] of [
  ['title', TITLE_REGEX],
  ['meta description', META_DESCRIPTION_REGEX],
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
    description: 'Research-backed Zwift workout library for low-cadence, high-torque cycling training. Downloadable .zwo files with a 12-week training calendar.',
    lastmod: HOME_LAST_UPDATED,
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
    description: 'Why grind a big gear? The science behind high-torque cycling training: muscle fiber recruitment, study findings, and how the workout protocols connect to the research.',
    lastmod: RATIONALE_LAST_UPDATED,
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
    .replace(META_DESCRIPTION_REGEX, `<meta name="description" content="${route.description}" />`)
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(r => `  <url>
    <loc>${DOMAIN}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${r.lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), sitemap)
console.log(`prerender: wrote dist/sitemap.xml (lastmod: home=${HOME_LAST_UPDATED}, rationale=${RATIONALE_LAST_UPDATED})`)
