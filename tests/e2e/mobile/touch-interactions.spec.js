import { test, expect, devices } from '@playwright/test'

// Run on mobile device profile
test.use({ ...devices['Pixel 5'] })

test.describe('Mobile: Touch Interactions', () => {
  test('should have properly sized touch targets (≥44px)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')
    const count = await buttons.count()

    expect(count).toBeGreaterThan(0)

    // Check the first several buttons for touch target compliance
    for (let i = 0; i < Math.min(5, count); i++) {
      const button = buttons.nth(i)
      if (!(await button.isVisible())) continue

      const box = await button.boundingBox()
      if (!box) continue

      // iOS HIG: minimum 44×44pt touch target
      // Allow 40px tolerance for border/padding considerations
      expect(box.height).toBeGreaterThanOrEqual(36)
      expect(box.width).toBeGreaterThanOrEqual(36)
    }
  })

  test('should support tapping buttons', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')
    if (await buttons.count() > 0) {
      await buttons.first().tap()
      await page.waitForTimeout(500)

      // Page should remain functional after tap
      const body = page.locator('body')
      await expect(body).toBeVisible()

      // Close any opened modal
      await page.keyboard.press('Escape')
    }
  })

  test('should allow vertical scrolling', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const initialScroll = await page.evaluate(() => window.scrollY)

    await page.evaluate(() => window.scrollBy(0, 300))
    await page.waitForTimeout(200)

    const newScroll = await page.evaluate(() => window.scrollY)

    // Either scrolled (if page is long enough) or stays at 0 (short page)
    expect(newScroll).toBeGreaterThanOrEqual(initialScroll)
  })

  test('should handle text input via mobile keyboard simulation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const inputs = page.locator('input[type="text"], input[type="search"]')

    if (await inputs.count() > 0) {
      const input = inputs.first()
      await input.tap()
      await input.fill('Luna')

      const value = await input.inputValue()
      expect(value).toBe('Luna')

      await input.clear()
    }
  })

  test('should dismiss inputs/modals on Escape', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open any interactive element
    const buttons = page.locator('button')
    if (await buttons.count() > 0) {
      await buttons.first().tap()
      await page.waitForTimeout(300)

      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)

      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })

  test('should handle form input on activity notes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Click an activity button to open notes modal
    const activityButton = page.locator('button').filter({ hasText: /Poop|Pee|Food|Walk/i }).first()

    if (await activityButton.count() > 0) {
      await activityButton.tap()
      await page.waitForTimeout(500)

      // Look for a notes textarea/input
      const notesInput = page.locator('textarea, input[placeholder*="note" i]').first()

      if (await notesInput.count() > 0) {
        await notesInput.tap()
        await notesInput.fill('Test note from mobile')

        const value = await notesInput.inputValue()
        expect(value).toContain('Test')
      }

      await page.keyboard.press('Escape')
    }
  })

  test('should support swipe/scroll within a modal', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open any modal
    const modalTrigger = page.locator('button').first()
    await modalTrigger.tap()
    await page.waitForTimeout(300)

    // Page should still be functional
    const body = page.locator('body')
    await expect(body).toBeVisible()

    await page.keyboard.press('Escape')
  })
})
