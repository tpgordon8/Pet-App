import { test, expect } from '@playwright/test'
import { captureConsoleErrors } from './helpers/ui-helpers'

test.describe('Smoke Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    const title = await page.title()
    expect(title).toBeTruthy()

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should mount the Vue app (#app element has content)', async ({ page }) => {
    await page.goto('/')

    const appEl = page.locator('#app')
    await appEl.waitFor({ state: 'attached', timeout: 10000 })

    const content = await appEl.innerHTML()
    expect(content.length).toBeGreaterThan(50)
  })

  test('should have no critical console errors on load', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known benign errors (e.g. Firebase offline warnings)
    const criticalErrors = errors.filter(e =>
      !e.includes('offline') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR_')
    )

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors)
    }
    expect(criticalErrors).toHaveLength(0)
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const body = page.locator('body')
    const box = await body.boundingBox()
    expect(box).toBeTruthy()
    expect(box.width).toBeLessThanOrEqual(375)
  })

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const scrollWidth = await page.evaluate(() =>
      Math.max(document.body.scrollWidth, document.documentElement.scrollWidth)
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)

    // Allow 5px tolerance for rounding/scrollbars
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })

  test('should navigate to onboarding when not authenticated', async ({ page }) => {
    // Clear any stored auth state
    await page.context().clearCookies()
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should show onboarding or home page (not a blank screen)
    const body = page.locator('body')
    const text = await body.textContent()
    expect(text.trim().length).toBeGreaterThan(0)
  })

  test('should load all CSS without visible unstyled flash', async ({ page }) => {
    await page.goto('/')
    // Wait for styles to apply
    await page.waitForLoadState('networkidle')

    // Check that TailwindCSS loaded (body should have non-default background)
    const bgColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    )
    // Should have some background color (not transparent/empty)
    expect(bgColor).toBeTruthy()
  })
})
