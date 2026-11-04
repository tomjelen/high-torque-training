import { test, expect } from '@playwright/test'

// Runs against the production build (prerendered HTML + hydration), not dev.
// Old saved state with retired ids must load without errors.

test('old saved state loads on the production build', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })

  await page.addInitScript(() => {
    if (localStorage.getItem('ht-state')) return
    localStorage.setItem(
      'ht-state',
      JSON.stringify({
        adaptation: { w1: '2026-01-01T00:00:00Z' },
        adaptationCheckInConfirmed: true,
        panels: {},
        log: [{ id: 'x', workoutId: 't2-staple', timestamp: '2026-01-02T00:00:00Z' }],
      }),
    )
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: '12-week build · week 1 of 12' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Session tracker log' })).toContainText('t2-staple')
  expect(errors).toEqual([])
})
