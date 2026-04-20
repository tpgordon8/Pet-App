import { test, expect } from '@playwright/test'
import { compareVisualState } from '../../helpers/visual-testing'

/**
 * Visual Regression: Baseline Setup
 *
 * These tests capture baseline screenshots for visual regression detection.
 * Run: npm run test:e2e -- tests/e2e/visual/
 *
 * On first run they create baselines in test-results/visual-baselines/.
 * On subsequent runs, compare against those baselines.
 * Review any unexpected differences before accepting new baselines.
 */

test.describe('Visual Regression: Baselines', () => {
  test('should capture home/onboarding page baseline', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Let animations settle
    await page.waitForTimeout(500)

    // Save screenshot as baseline
    await compareVisualState(page, 'home-page')

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should capture dashboard baseline (desktop)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await compareVisualState(page, 'dashboard-desktop')

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should capture dashboard baseline (mobile 375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await compareVisualState(page, 'dashboard-mobile-375')

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should capture dashboard with activity feed section', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Scroll to activity feed
    await page.evaluate(() => window.scrollTo(0, 300))
    await page.waitForTimeout(300)

    await compareVisualState(page, 'activity-feed-section')
  })

  test('should capture an open modal baseline', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Open any modal
    const button = page.locator('button').first()
    if (await button.count() > 0) {
      await button.click()
      await page.waitForTimeout(500)

      await compareVisualState(page, 'modal-open')

      await page.keyboard.press('Escape')
    }
  })
})
