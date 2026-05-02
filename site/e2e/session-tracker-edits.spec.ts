import { test, expect, type Page } from '@playwright/test'

async function logFirstWorkout(page: Page) {
  await page.getByRole('button', { name: '✓ today' }).first().click()
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
})
