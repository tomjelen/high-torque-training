import { test, expect, type Page } from '@playwright/test'
import type { AppState } from '../src/types'

async function logFirstWorkout(page: Page) {
  await page.getByRole('button', { name: '✓ today' }).first().click()
}

async function seedLog(page: Page, log: AppState['log']) {
  // addInitScript runs before any page script on the next navigation, so the
  // seed lands in localStorage before React's loadState/saveState — no race.
  await page.addInitScript((entries) => {
    localStorage.setItem('ht-state', JSON.stringify({ log: entries }))
  }, log)
  await page.goto('/')
}

test.describe('Session tracker — delete and edit date', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('delete: two-step inline confirmation removes the entry', async ({ page }) => {
    await logFirstWorkout(page)

    const log = page.getByRole('region', { name: 'Session tracker log' })
    await expect(log.getByRole('listitem')).toHaveCount(1)

    await log.getByRole('button', { name: 'Delete entry' }).first().click()
    await expect(log.getByRole('button', { name: 'Confirm delete' })).toBeVisible()
    await expect(log.getByRole('button', { name: 'Cancel delete' })).toBeVisible()
    await expect(log.getByRole('listitem')).toHaveCount(1)

    await log.getByRole('button', { name: 'Confirm delete' }).click()
    await expect(log.getByRole('listitem')).toHaveCount(0)
    await expect(log.getByText('No sessions logged yet.')).toBeVisible()
  })

  test('delete: cancel returns the row to idle without deleting', async ({ page }) => {
    await logFirstWorkout(page)
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await log.getByRole('button', { name: 'Delete entry' }).click()
    await log.getByRole('button', { name: 'Cancel delete' }).click()

    await expect(log.getByRole('listitem')).toHaveCount(1)
    await expect(log.getByRole('button', { name: 'Confirm delete' })).not.toBeVisible()
    // toBeVisible() ignores opacity; passes for the opacity-0 idle-mode button.
    await expect(log.getByRole('button', { name: 'Delete entry' })).toBeVisible()
  })

  test('edit date: clicking the date opens an editor; saving updates the row', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-01' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await log.getByRole('button', { name: /Edit date/ }).click()

    const dateInput = log.getByLabel('New date')
    await expect(dateInput).toBeVisible()
    await expect(dateInput).toHaveValue('2026-05-01')

    await dateInput.fill('2026-04-28')
    await log.getByRole('button', { name: 'Save date' }).click()

    await expect(log.getByText('Apr 28')).toBeVisible()
    await expect(log.getByText('May 1')).not.toBeVisible()

    const stored = await page.evaluate(() => localStorage.getItem('ht-state'))
    // The tracker stores local calendar dates (YYYY-MM-DD), no time part.
    expect(stored).toContain('"timestamp":"2026-04-28"')
  })

  test('edit date: cancel discards the draft', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-01' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await log.getByRole('button', { name: /Edit date/ }).click()
    await log.getByLabel('New date').fill('2026-04-01')
    await log.getByRole('button', { name: 'Cancel edit' }).click()

    await expect(log.getByText('May 1')).toBeVisible()
  })

  test('edit date: future dates are blocked via the input max attribute', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-01' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await log.getByRole('button', { name: /Edit date/ }).click()

    const todayIso = await page.evaluate(() => {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })
    await expect(log.getByLabel('New date')).toHaveAttribute('max', todayIso)
  })

  test('edit date: save is disabled when the date input is empty', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-01' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await log.getByRole('button', { name: /Edit date/ }).click()
    await log.getByLabel('New date').fill('')

    await expect(log.getByRole('button', { name: 'Save date' })).toBeDisabled()
  })

  test('edit date: backdating re-sorts the log', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-02' },
      { id: 'b', workoutId: 'torquemax', timestamp: '2026-05-01' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })

    const itemsBefore = await log.getByRole('listitem').allTextContents()
    expect(itemsBefore[0]).toContain('May 2')
    expect(itemsBefore[1]).toContain('May 1')

    // Backdate 'a' (currently top) to Apr 25 → it falls below 'b'.
    await log.getByRole('listitem').nth(0).getByRole('button', { name: /Edit date/ }).click()
    await log.getByLabel('New date').fill('2026-04-25')
    await log.getByRole('button', { name: 'Save date' }).click()

    const itemsAfter = await log.getByRole('listitem').allTextContents()
    expect(itemsAfter[0]).toContain('May 1')
    expect(itemsAfter[1]).toContain('Apr 25')
  })

  test('delete: removing entries below threshold hides the "view full log" toggle', async ({
    page,
  }) => {
    // Seed 6 entries on distinct days so the toggle is initially visible.
    const seed = Array.from({ length: 6 }, (_, i) => ({
      id: `e${i}`,
      workoutId: 'te-3x8',
      timestamp: `2026-04-${String(20 + i).padStart(2, '0')}`,
    }))
    await seedLog(page, seed)
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await expect(log.getByRole('button', { name: /view full log/ })).toBeVisible()

    // Delete two entries → 4 remain → toggle hides.
    for (let i = 0; i < 2; i++) {
      await log.getByRole('button', { name: 'Delete entry' }).first().click()
      await log.getByRole('button', { name: 'Confirm delete' }).click()
    }
    await expect(log.getByRole('listitem')).toHaveCount(4)
    await expect(log.getByRole('button', { name: /view full log/ })).not.toBeVisible()
  })

  test('consecutive days: the newer session (the one that came too soon) shows the warning', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-01' },
      { id: 'b', workoutId: 'torquemax', timestamp: '2026-05-02' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })
    const items = log.getByRole('listitem')

    await expect(items).toHaveCount(2)
    // Newest first; the warning sits on the newer entry of the pair.
    await expect(items.nth(0)).toContainText('Consecutive days. Leave at least a full day between high-torque sessions.')
    await expect(items.nth(1)).not.toContainText(/consecutive days/i)
  })

  test('two days apart: no warning', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-01' },
      { id: 'b', workoutId: 'torquemax', timestamp: '2026-05-03' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await expect(log.getByRole('listitem')).toHaveCount(2)
    await expect(log.getByText(/full day between/)).toHaveCount(0)
  })

  test('same date: the later-logged session is listed first', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-01' },
      { id: 'b', workoutId: 'torquemax', timestamp: '2026-05-01' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })
    const items = log.getByRole('listitem')

    await expect(items.nth(0)).toContainText('TorqueMax')
    await expect(items.nth(1)).toContainText('Torque Endurance 3×8')
    await expect(items.nth(0)).toContainText('Same day. Leave at least a full day between high-torque sessions.')
    await expect(items.nth(1)).not.toContainText(/same day/i)
  })

  test('retired id: an old log entry still renders, under its raw id', async ({ page }) => {
    await seedLog(page, [{ id: 'a', workoutId: 't1-entry', timestamp: '2026-05-01' }])
    const log = page.getByRole('region', { name: 'Session tracker log' })

    await expect(log.getByRole('listitem')).toHaveCount(1)
    await expect(log.getByRole('listitem').first()).toContainText('t1-entry')
  })

  test('build + library on consecutive days: the warning shows', async ({ page }) => {
    await seedLog(page, [
      { id: 'a', workoutId: 'a1', timestamp: '2026-05-01' },
      { id: 'b', workoutId: 'torquemax', timestamp: '2026-05-02' },
    ])
    const log = page.getByRole('region', { name: 'Session tracker log' })
    const items = log.getByRole('listitem')

    await expect(items.nth(0)).toContainText('TorqueMax')
    await expect(items.nth(1)).toContainText('Weeks 1–2')
    await expect(items.nth(0)).toContainText('Consecutive days. Leave at least a full day between high-torque sessions.')
  })

  test('tracker stays visible with the library panel collapsed', async ({ page }) => {
    await seedLog(page, [{ id: 'a', workoutId: 'te-3x8', timestamp: '2026-05-01' }])
    await page.getByRole('heading', { name: 'The High Torque Library' }).click()
    await expect(page.getByRole('button', { name: '✓ today' }).first()).not.toBeVisible()

    const log = page.getByRole('region', { name: 'Session tracker log' })
    await expect(log.getByRole('listitem')).toHaveCount(1)
    await expect(log).toBeVisible()
  })
})
