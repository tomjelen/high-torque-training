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

// Author + publication facts used in JSON-LD and OG/Twitter meta. Edit here if
// these change — they are deliberately not derived from git so the published
// date is a stable claim, not a live lookup.
const SITE_NAME = 'High Torque Training'
const AUTHOR_NAME = 'Tom Jelen'
// Public profiles that unambiguously identify the author. Emitted as Person.sameAs
// in the Article schema — helps search engines link the rationale's author to a
// real, identifiable person (E-E-A-T signal for health/fitness content).
const AUTHOR_SAMEAS = [
  'https://www.linkedin.com/in/tom-jelen/',
  'https://github.com/tomjelen',
  'https://www.strava.com/athletes/8943272',
]
const OG_IMAGE_URL = `${DOMAIN}/og-image.png`
const OG_IMAGE_ALT = `${SITE_NAME} — free Zwift training plan for high-torque cycling`
const RATIONALE_PUBLISHED = '2026-04-12' // first commit that added the rationale page to the site

// Canonical URL for a route. Keeps the trailing-slash-on-root rule in one place.
const urlFor = (path) => `${DOMAIN}${path === '/' ? '/' : path}`

// Minimal HTML-attribute escape — used for any interpolation that could contain
// user-authored text (titles, descriptions). JSON-LD goes through JSON.stringify
// which already escapes correctly; this is for `<meta content="..." />` only.
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const { render } = await import(SSR_BUNDLE)

const ROOT_PLACEHOLDER = '<div id="root"></div>'
const PLACEHOLDERS = [
  '<title><!--app-title--></title>',
  '<!--app-description-->',
  '<!--app-canonical-->',
  '<!--app-headmeta-->',
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
    ogType: 'website',
    schema: ({ title, description }, canonical) => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonical,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: urlFor('/') },
      about: 'High-torque (low-cadence, seated, hard) cycling training',
    }),
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
    ogType: 'article',
    schema: ({ title, description, lastmod }, canonical) => ({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      url: canonical,
      mainEntityOfPage: canonical,
      image: OG_IMAGE_URL,
      datePublished: RATIONALE_PUBLISHED,
      dateModified: lastmod,
      author: {
        '@type': 'Person',
        name: AUTHOR_NAME,
        ...(AUTHOR_SAMEAS.length > 0 && { sameAs: AUTHOR_SAMEAS }),
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: urlFor('/'),
      },
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: urlFor('/') },
    }),
  },
  {
    path: '/about',
    outputs: ['dist/about.html', 'dist/about/index.html'],
    marker: 'Abzu',
    primaryMd: '/content/about.md',
    primaryDescription: 'about the author and why this site exists',
    secondaryMd: '/content/workouts.md',
    secondaryDescription: 'the workout library and training calendar (what to do)',
    noscriptIntro: "About the author and why this site exists.",
    ogType: 'profile',
    schema: ({ title, description, lastmod }, canonical) => ({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: title,
      description,
      url: canonical,
      dateModified: lastmod,
      mainEntity: {
        '@type': 'Person',
        name: AUTHOR_NAME,
        jobTitle: 'AI/ML Engineer',
        worksFor: { '@type': 'Organization', name: 'Abzu', url: 'https://abzu.ai' },
        ...(AUTHOR_SAMEAS.length > 0 && { sameAs: AUTHOR_SAMEAS }),
      },
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: urlFor('/') },
    }),
  },
]

function buildHeadMeta(route, meta, canonical) {
  const og = [
    `<meta property="og:type" content="${route.ogType}" />`,
    `<meta property="og:site_name" content="${attr(SITE_NAME)}" />`,
    `<meta property="og:title" content="${attr(meta.title)}" />`,
    `<meta property="og:description" content="${attr(meta.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE_URL}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${attr(OG_IMAGE_ALT)}" />`,
  ]
  if (route.ogType === 'article') {
    og.push(`<meta property="article:published_time" content="${RATIONALE_PUBLISHED}" />`)
    og.push(`<meta property="article:modified_time" content="${meta.lastmod}" />`)
    og.push(`<meta property="article:author" content="${attr(AUTHOR_NAME)}" />`)
  }
  const twitter = [
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(meta.title)}" />`,
    `<meta name="twitter:description" content="${attr(meta.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE_URL}" />`,
    `<meta name="twitter:image:alt" content="${attr(OG_IMAGE_ALT)}" />`,
  ]
  const ld = JSON.stringify(route.schema(meta, canonical), null, 2)
  const jsonLd = `<script type="application/ld+json">\n${ld}\n    </script>`
  return [...og, ...twitter, jsonLd].join('\n    ')
}

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

  const canonical = urlFor(route.path)
  const meta = { title, description, lastmod }

  const html = template
    .replace('<title><!--app-title--></title>', `<title>${attr(title)}</title>`)
    .replace('<!--app-description-->', `<meta name="description" content="${attr(description)}" />`)
    .replace('<!--app-canonical-->', `<link rel="canonical" href="${canonical}" />`)
    .replace('<!--app-headmeta-->', buildHeadMeta(route, meta, canonical))
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
    <loc>${urlFor(path)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`).join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), sitemap)
console.log(`prerender: wrote dist/sitemap.xml`)
