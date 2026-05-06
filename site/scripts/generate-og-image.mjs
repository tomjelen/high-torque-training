// Generate the OpenGraph / Twitter share card.
// One-shot: runs Playwright to render the inline HTML below at 1200x630
// and writes a PNG to public/og-image.png. The PNG is committed; this
// script only needs to run when the design changes.
//
// Usage (from site/):
//   node scripts/generate-og-image.mjs
import { chromium } from '@playwright/test'
import { writeFileSync } from 'fs'

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: #0E0F12;
    color: #FFFFFF;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 80px;
    box-sizing: border-box;
  }
  .top { display: flex; align-items: center; gap: 32px; }
  .mark {
    width: 96px;
    height: 96px;
    border-radius: 20px;
    background: #0E0F12;
    border: 2px solid #F05A1A;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mark svg { width: 64px; height: 64px; }
  .brand { font-size: 32px; font-weight: 600; letter-spacing: -0.01em; opacity: 0.9; }
  .title {
    font-size: 96px;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0;
  }
  .tagline {
    font-size: 36px;
    font-weight: 400;
    line-height: 1.3;
    color: #B8BCC4;
    margin-top: 24px;
    max-width: 900px;
  }
  .url {
    font-size: 28px;
    font-weight: 500;
    color: #F05A1A;
    letter-spacing: 0.02em;
  }
  .bottom { display: flex; align-items: flex-end; justify-content: space-between; }
  .accent {
    width: 100px;
    height: 6px;
    background: #F05A1A;
    margin-bottom: 32px;
  }
</style>
</head>
<body>
  <div class="top">
    <div class="mark">
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect x="96" y="136" width="56" height="240" fill="#F05A1A"/>
        <rect x="224" y="136" width="56" height="240" fill="#F05A1A"/>
        <rect x="96" y="228" width="184" height="56" fill="#F05A1A"/>
        <rect x="312" y="136" width="128" height="52" fill="#F05A1A"/>
        <rect x="348" y="188" width="56" height="188" fill="#F05A1A"/>
      </svg>
    </div>
    <div class="brand">High Torque Training</div>
  </div>

  <div>
    <div class="accent"></div>
    <h1 class="title">Grind a big gear.<br/>On purpose.</h1>
    <p class="tagline">Free Zwift training plan for high-torque cycling — research-backed.</p>
  </div>

  <div class="bottom">
    <div class="url">high-torque.jelen.dk</div>
  </div>
</body>
</html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'load' })
const buffer = await page.screenshot({ type: 'png', omitBackground: false })
await browser.close()

const outPath = 'public/og-image.png'
writeFileSync(outPath, buffer)
console.log(`og-image: wrote ${outPath} (${buffer.length} bytes)`)
