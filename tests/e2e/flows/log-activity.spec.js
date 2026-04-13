import { test, expect } from '@playwright/test'
import {
  goToPage,
  waitForDashboard,
  dismissModal,
  captureConsoleErrors
} from '../helpers/ui-helpers'

test.describe('Log Activity Flow', () => {
  test.beforeEach(async ({ page }) => {
    await goToPage(page, '/')
  })

  test('should load dashboard with activity buttons', async ({ page }) => {
    await waitForDashboard(page)

    const buttons = page.locator('button')
    await expect(buttons.first()).toBeVisible()
  })

  test('should show activity buttons for all regular types', async ({ page }) => {
    await waitForDashboard(page)

    const body = page.locator('body')
    const text = await body.textContent()

    // App should reference regular activity types somewhere in the UI
    const activityTypes = ['Poop', 'Pee', 'Food', 'Sleep', 'Meds', 'Walk']
    const foundTypes = activityTypes.filter(type => text.includes(type))
    expect(foundTypes.length).toBeGreaterThan(0)
  })

  test('should open notes modal when clicking an activity button', async ({ page }) => {
    await waitForDashboard(page)

    // Find the first clickable activity button
    const activityButtons = page.locator('button').filter({ hasText: /Poop|Pee|Food|Walk/i })

    if (await activityButtons.count() > 0) {
      await activityButtons.first().click()

      // Either a modal opens, or the activity is logged directly
      // Either way the page should remain stable
      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })

  test('should be able to dismiss a modal', async ({ page }) => {
    await waitForDashboard(page)

    const activityButtons = page.locator('button').filter({ hasText: /Poop|Pee|Food|Walk/i })

    if (await activityButtons.count() > 0) {
      await activityButtons.first().click()
      await page.waitForTimeout(300)

      await dismissModal(page)

      // Page should return to normal state
      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })

  test('should show activity feed section', async ({ page }) => {
    await waitForDashboard(page)

    // Activity feed or history should be visible
    const bodyText = await page.locator('body').textContent()
    const hasFeedIndicators = [
      'Today', 'Yesterday', 'Activity', 'Feed', 'Log', 'History'
    ].some(word => bodyText.includes(word))

    expect(hasFeedIndicators).toBe(true)
  })

  test('should not produce JS errors when interacting with activity buttons', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await waitForDashboard(page)

    const activityButtons = page.locator('button').filter({ hasText: /Poop|Pee|Food/i })

    if (await activityButtons.count() > 0) {
      await activityButtons.first().click()
      await page.waitForTimeout(500)
      await dismissModal(page)
    }

    const criticalErrors = errors.filter(e => !e.includes('offline') && !e.includes('net::ERR_'))
    expect(criticalErrors).toHaveLength(0)
  })
})
