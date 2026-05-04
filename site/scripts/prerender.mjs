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

const { render } = await import(SSR_BUNDLE)

const ROOT_PLACEHOLDER = '<div id="root"></div>'
const PLACEHOLDERS = [
  '<title><!--app-title--></title>',
  '<!--app-description-->',
  '<!--app-noscript-->',
  '<!--app-agent-anchor-->',
  ROOT_PLACEHOLDER,
]

const template = readFileSync(join(DIST, 'index.html'), 'utf-8')

for (const p of PLACEHOLDERS) {
  if (!template.includes(p)) {
    console.error(`prerender: index.html is missing placeholder "${p}". Aborting build.`)
    process.exit(1)
  }
}

// Build-only data: output paths, render marker, and agent/noscript text.
// Page title, description, and lastmod come from render() in entry-server.tsx.
//
// Marker strings MUST NOT appear anywhere in the static index.html template
// (or in any other route's marker neighbourhood) — the post-substitution
// `html.includes(marker)` check below is meaningful only because these words
// come from the rendered React tree. If you change a marker, grep index.html
// first.
const ROUTES = [
  {
    path: '/',
    outputs: ['dist/index.html'],
    marker: 'Adaptation',
    primaryMd: '/content/workouts.md',
    primaryDescription: 'the workout library and training calendar (what to do)',
    secondaryMd: '/content/rationale.md',
    secondaryDescription: 'the rationale behind the workouts (why it works)',
    noscriptIntro: 'The home page is the workout library and training calendar.',
  },
  {
    path: '/rationale',
    outputs: ['dist/rationale.html', 'dist/rationale/index.html'],
    marker: 'Hebisz',
    primaryMd: '/content/rationale.md',
    primaryDescription: 'the rationale behind the workouts (why it works)',
    secondaryMd: '/content/workouts.md',
    secondaryDescription: 'the workout library and training calendar (what to do)',
    noscriptIntro: 'This page explains the rationale behind the workouts.',
  },
]

function buildNoscript(route, title) {
  return `<noscript>
      <h1>${title}</h1>
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

const sitemapEntries = []

for (const route of ROUTES) {
  const { html: body, title, description, lastmod } = render(route.path)

  const html = template
    .replace('<title><!--app-title--></title>', `<title>${title}</title>`)
    .replace('<!--app-description-->', `<meta name="description" content="${description}" />`)
    .replace('<!--app-noscript-->', buildNoscript(route, title))
    .replace('<!--app-agent-anchor-->', buildAnchor(route))
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

  sitemapEntries.push({ path: route.path, lastmod })
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(({ path, lastmod }) => `  <url>
    <loc>${DOMAIN}${path === '/' ? '/' : path}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), sitemap)
console.log(`prerender: wrote dist/sitemap.xml`)
