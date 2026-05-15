import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App, {
  HOME_LAST_UPDATED, RATIONALE_LAST_UPDATED, ABOUT_LAST_UPDATED,
  HOME_TITLE, RATIONALE_TITLE, ABOUT_TITLE,
} from './App'

interface PageMeta {
  title: string
  description: string
  lastmod: string
}

// SEO note: the descriptions below deliberately include "low-cadence" alongside
// "high torque". Per CLAUDE.md → Naming, "high torque" is the preferred term in
// user-facing copy because it's more accurate (it captures the *intensity*, not
// just the rpm). But cyclists frequently search for "low cadence training" —
// meta descriptions feed search engines, not readers, so we keep both terms
// here to match either query.
const ROUTE_META: Record<string, PageMeta> = {
  '/': {
    title: HOME_TITLE,
    description: 'Free Zwift training plan for high torque, low-cadence cycling — research-backed workouts with a 12-week calendar.',
    lastmod: HOME_LAST_UPDATED,
  },
  '/rationale': {
    title: RATIONALE_TITLE,
    description: 'Why grind a big gear? The research and coaching evidence behind low-cadence, high-torque cycling training — and how it shapes the workouts.',
    lastmod: RATIONALE_LAST_UPDATED,
  },
  '/about': {
    title: ABOUT_TITLE,
    description: 'About Tom Jelen — AI/ML engineer and A/B-category Zwift racer who built this site as a methodical, research-grounded learning project on high-torque, low-cadence cycling training.',
    lastmod: ABOUT_LAST_UPDATED,
  },
}

export function render(url: string): { html: string } & PageMeta {
  const meta = ROUTE_META[url]
  if (!meta) throw new Error(`prerender: no route metadata defined for "${url}"`)
  return {
    html: renderToString(
      <StrictMode>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </StrictMode>,
    ),
    ...meta,
  }
}
