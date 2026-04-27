/**
 * Manual consistency check: compares full-page screenshots of the site against
 * the source markdown documents using Claude Sonnet vision.
 *
 * Runs 5 parallel calls and reports any that find inconsistencies.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... node scripts/check-consistency.mjs
 *   BASE_URL=http://localhost:4173 ANTHROPIC_API_KEY=... node scripts/check-consistency.mjs
 *
 * Requires a running dev or preview server (default: http://localhost:5173).
 * Start one with: npm run dev  OR  npm run build && npm run preview
 */

import { chromium } from 'playwright'
import { readFileSync } from 'fs'
import { join } from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const API_KEY = process.env.ANTHROPIC_API_KEY
const NUM_SAMPLES = 5
const RESEARCH_DIR = join(import.meta.dirname, '../../research')

if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY is not set.')
  process.exit(1)
}

async function takeScreenshots() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  console.log(`  → ${BASE_URL}/`)
  await page.goto(`${BASE_URL}/`)
  await page.waitForLoadState('networkidle')
  const homeShot = await page.screenshot({ fullPage: true })

  console.log(`  → ${BASE_URL}/science`)
  await page.goto(`${BASE_URL}/science`)
  await page.waitForLoadState('networkidle')
  const scienceShot = await page.screenshot({ fullPage: true })

  await browser.close()
  return { homeShot, scienceShot }
}

async function callClaude(homeB64, scienceB64, rationaleText, calendarText, sampleIndex) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'prompt-caching-2024-07-31',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are auditing a fitness training website for consistency with its source documents.\n\nThe next two images are full-page screenshots of the website — the workout library (home page) and the science/rationale page. After the images are the two source markdown documents the site is based on.\n\nYour task: check whether the website and the source documents tell a consistent story. Look specifically for:\n- Workout parameters: cadence targets, power percentages, interval durations, rep counts\n- Research claims: study names, percentage improvements, protocol descriptions\n- Tier or progression information\n- Any claim on the site that contradicts or is absent from the source documents, or vice versa\n\nStart your response with exactly one of:\n  INCONSISTENCY FOUND: (then list what differs)\n  CONSISTENT: no issues found.\n\nBe precise. Cite specific numbers or claims if you find a mismatch.',
            },
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: homeB64 },
            },
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/png', data: scienceB64 },
            },
            {
              type: 'text',
              // Cache the static markdown content — same across all 5 calls
              cache_control: { type: 'ephemeral' },
              text: `--- SOURCE DOCUMENT 1: Research rationale ---\n\n${rationaleText}\n\n--- SOURCE DOCUMENT 2: Training calendar ---\n\n${calendarText}`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function main() {
  console.log('Taking screenshots...')
  const { homeShot, scienceShot } = await takeScreenshots()

  const homeB64 = homeShot.toString('base64')
  const scienceB64 = scienceShot.toString('base64')
  const rationaleText = readFileSync(join(RESEARCH_DIR, 'high-torque-training-research.md'), 'utf-8')
  const calendarText = readFileSync(join(RESEARCH_DIR, 'training-calendar.md'), 'utf-8')

  console.log(`\nRunning ${NUM_SAMPLES} consistency checks in parallel...`)

  const results = await Promise.all(
    Array.from({ length: NUM_SAMPLES }, (_, i) =>
      callClaude(homeB64, scienceB64, rationaleText, calendarText, i + 1)
        .then(text => ({ sample: i + 1, ok: true, text }))
        .catch(err => ({ sample: i + 1, ok: false, text: `ERROR: ${err.message}` }))
    )
  )

  console.log('\n=== Results ===\n')

  let anyIssue = false
  for (const { sample, ok, text } of results) {
    const isInconsistency = !ok || text.startsWith('INCONSISTENCY FOUND:')
    if (isInconsistency) anyIssue = true
    const marker = isInconsistency ? '⚠ ' : '✓ '
    console.log(`Sample ${sample}: ${marker}${text}\n${'─'.repeat(60)}\n`)
  }

  if (anyIssue) {
    console.log('⚠  One or more samples found issues. Review the output above.')
    process.exit(1)
  } else {
    console.log(`✓  All ${NUM_SAMPLES} samples agree: website and source documents are consistent.`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
