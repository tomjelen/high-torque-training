import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App, { HOME_LAST_UPDATED, RATIONALE_LAST_UPDATED } from './App'

interface PageMeta {
  title: string
  description: string
  lastmod: string
}

const ROUTE_META: Record<string, PageMeta> = {
  '/': {
    title: 'High Torque Training',
    description: 'Research-backed Zwift workout library for low-cadence, high-torque cycling training. Downloadable .zwo files with a 12-week training calendar.',
    lastmod: HOME_LAST_UPDATED,
  },
  '/rationale': {
    title: 'Rationale — High Torque Training',
    description: 'Why grind a big gear? The research and coaching evidence behind low-cadence, high-torque cycling training — and how it shapes the workouts.',
    lastmod: RATIONALE_LAST_UPDATED,
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
