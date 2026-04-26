import { test, expect, type Page } from '@playwright/test'

async function completeAllWorkouts(page: Page) {
  // Buttons unlock sequentially — at any moment exactly one "Mark Complete" is enabled.
  // Clicking nth(0) three times picks up W1, then W2, then W3.
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Mark Complete' }).nth(0).click()
  }
}

test.describe('Adaptation check-in', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('shows warning and Got it button when all workouts are complete', async ({ page }) => {
    await completeAllWorkouts(page)

    await expect(page.getByRole('heading', { name: 'Before starting ongoing training' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Got it' })).toBeVisible()
    await expect(page.getByText('expand to review or redo')).not.toBeVisible()
  })

  test.describe('after confirming check-in', () => {
    test.beforeEach(async ({ page }) => {
      await completeAllWorkouts(page)
      await page.getByRole('button', { name: 'Got it' }).click()
    })

    test('collapses the panel and removes the warning', async ({ page }) => {
      await expect(page.getByText('expand to review or redo')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Before starting ongoing training' })).not.toBeVisible()
    })

    test('re-expanding the panel does not re-show the warning', async ({ page }) => {
      await page.locator('summary').filter({ hasText: 'Adaptation Phase' }).click()

      await expect(page.getByRole('heading', { name: 'Before starting ongoing training' })).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'Undo' }).first()).toBeVisible()
    })

    test('confirmation survives a page reload', async ({ page }) => {
      await page.reload()

      await expect(page.getByText('expand to review or redo')).toBeVisible()
      await page.locator('summary').filter({ hasText: 'Adaptation Phase' }).click()
      await expect(page.getByRole('heading', { name: 'Before starting ongoing training' })).not.toBeVisible()
    })

    test('un-checking a workout resets confirmation — re-completing re-shows warning', async ({ page }) => {
      await page.locator('summary').filter({ hasText: 'Adaptation Phase' }).click()
      await page.getByRole('button', { name: 'Undo' }).last().click()
      await expect(page.getByRole('heading', { name: 'Before starting ongoing training' })).not.toBeVisible()

      await page.getByRole('button', { name: 'Mark Complete' }).nth(0).click()
      await expect(page.getByRole('heading', { name: 'Before starting ongoing training' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Got it' })).toBeVisible()
    })
  })
})
