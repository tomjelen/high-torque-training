import { test, expect, type Page } from '@playwright/test'
import type { AppState } from '../src/types'

// The 12-week build panel. Progress counts sessions moved on from, not
// calendar weeks; each button press also logs the session to the tracker.

async function moveOn(page: Page, times: number) {
  for (let i = 0; i < times; i++) {
    await page.getByRole('button', { name: 'Done, move on', exact: true }).click()
  }
}

function heading(page: Page, week: number) {
  return page.getByRole('heading', { name: `12-week build · week ${week} of 12` })
}

function thisWeek(page: Page) {
  return page.getByRole('region', { name: 'This week' })
}

async function restart(page: Page, which: 'adaptation' | 'build') {
  const label = which === 'adaptation' ? 'Restart adaptation (weeks 1–4)' : 'Restart build (weeks 5–12)'
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.getByRole('button', { name: `Yes, restart ${which}`, exact: true }).click()
}

function trackerLog(page: Page) {
  return page.getByRole('region', { name: 'Session tracker log' })
}

async function storedState(page: Page): Promise<AppState> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('ht-state') ?? '{}'))
}

test.describe('Build plan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('fresh visit shows week 1 of 12', async ({ page }) => {
    await expect(heading(page, 1)).toBeVisible()
  })

  test('"Done, move on" ×4 shows week 5 with Torque Endurance 3×8', async ({ page }) => {
    await moveOn(page, 4)
    await expect(heading(page, 5)).toBeVisible()
    await expect(thisWeek(page).getByRole('heading', { name: 'Torque Endurance 3×8' })).toBeVisible()
  })

  test('"Done, repeat next week" at week 5 stays on week 5 and logs each session', async ({ page }) => {
    await moveOn(page, 4)
    const repeat = page.getByRole('button', { name: 'Done, repeat next week', exact: true })
    await repeat.click()
    await repeat.click()
    await expect(heading(page, 5)).toBeVisible()

    const log = page.getByRole('region', { name: 'Session tracker log' })
    await log.getByRole('button', { name: /view full log/ }).click()
    await expect(log.getByRole('listitem').filter({ hasText: 'Torque Endurance 3×8' })).toHaveCount(2)
  })

  test('"Restart build" at week 7 goes back to week 5', async ({ page }) => {
    await moveOn(page, 6)
    await expect(heading(page, 7)).toBeVisible()
    await restart(page, 'build')
    await expect(heading(page, 5)).toBeVisible()
  })

  test('"Restart build" at week 3 is disabled and week 3 stays', async ({ page }) => {
    await moveOn(page, 2)
    await expect(heading(page, 3)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Restart build (weeks 5–12)', exact: true })).toBeDisabled()
    await expect(heading(page, 3)).toBeVisible()
  })

  test('reset confirm: focus on Cancel; Cancel and Escape do not reset', async ({ page }) => {
    await moveOn(page, 6)
    const open = page.getByRole('button', { name: 'Restart adaptation (weeks 1–4)', exact: true })
    await open.click()
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(heading(page, 7)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Yes, restart adaptation', exact: true })).toHaveCount(0)

    await open.click()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Yes, restart adaptation', exact: true })).toHaveCount(0)
    await expect(heading(page, 7)).toBeVisible()
  })

  test('reset confirm: focus returns to the restart button when the row closes', async ({ page }) => {
    await moveOn(page, 6)
    const adaptation = page.getByRole('button', { name: 'Restart adaptation (weeks 1–4)', exact: true })
    const build = page.getByRole('button', { name: 'Restart build (weeks 5–12)', exact: true })

    await adaptation.click()
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    await expect(adaptation).toBeFocused()

    await build.click()
    await page.keyboard.press('Escape')
    await expect(build).toBeFocused()

    // Restarting the build disables its own button, so focus goes to the other one.
    await build.click()
    await page.getByRole('button', { name: 'Yes, restart build', exact: true }).click()
    await expect(build).toBeDisabled()
    await expect(adaptation).toBeFocused()
  })

  test('"Restart adaptation" goes back to week 1', async ({ page }) => {
    await moveOn(page, 6)
    await restart(page, 'adaptation')
    await expect(heading(page, 1)).toBeVisible()
  })

  test('12× "Done, move on" shows Build done and no week 13', async ({ page }) => {
    await moveOn(page, 12)
    await expect(page.getByRole('heading', { name: '12-week build · done', exact: true })).toBeVisible()
    await expect(page.getByText(/^Build done\./)).toBeVisible()
    await expect(page.getByText(/week 13/i)).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Done, move on', exact: true })).toHaveCount(0)
  })

  test('"Undo last move-on" steps back a week and removes its session', async ({ page }) => {
    await moveOn(page, 5)
    await expect(heading(page, 6)).toBeVisible()
    await page.getByRole('button', { name: 'Undo last move-on', exact: true }).click()
    await expect(heading(page, 5)).toBeVisible()
    const log = trackerLog(page)
    // Positive control: the four adaptation sessions are still logged.
    await expect(log.getByRole('listitem')).toHaveCount(4)
    await expect(log.getByRole('listitem').filter({ hasText: 'Weeks 1–2' })).toHaveCount(2)
    await expect(log.getByRole('listitem').filter({ hasText: 'Weeks 3–4' })).toHaveCount(2)
    await expect(log.getByRole('listitem').filter({ hasText: 'Torque Endurance 3×8' })).toHaveCount(0)
  })

  test('repeat then undo: keeps the repeat, removes the move-on entry', async ({ page }) => {
    await moveOn(page, 5)
    await expect(heading(page, 6)).toBeVisible()
    await page.getByRole('button', { name: 'Done, repeat next week', exact: true }).click()
    await expect(heading(page, 6)).toBeVisible()

    const before = await storedState(page)
    const moveOnId = before.moveOnLogIds.at(-1)!
    const repeatId = before.log.at(-1)!.id
    expect(before.log.find((e) => e.id === moveOnId)?.workoutId).toBe('te-3x8')

    await page.getByRole('button', { name: 'Undo last move-on', exact: true }).click()
    await expect(heading(page, 5)).toBeVisible()

    const after = await storedState(page)
    expect(after.log.map((e) => e.id)).toContain(repeatId)
    expect(after.log.map((e) => e.id)).not.toContain(moveOnId)

    const log = trackerLog(page)
    await expect(log.getByRole('listitem')).toHaveCount(5)
    await expect(log.getByRole('listitem').filter({ hasText: 'Torque Endurance 3×8' })).toHaveCount(1)
  })

  test('progress survives a reload', async ({ page }) => {
    await moveOn(page, 3)
    await expect(heading(page, 4)).toBeVisible()
    await page.reload()
    await expect(heading(page, 4)).toBeVisible()
  })
})
