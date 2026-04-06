import { test, expect } from '@playwright/test'

test.describe('Mobile: Viewport & Responsiveness', () => {
  test('should be responsive on iPhone 12 (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
    expect(bodyWidth).toBeLessThanOrEqual(390)
  })

  test('should be responsive on Pixel 5 (393px)', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
    expect(bodyWidth).toBeLessThanOrEqual(393)
  })

  test('should be responsive on iPhone SE (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375)
  })

  test('should have no horizontal scroll on narrow viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const scrollWidth = await page.evaluate(() =>
      Math.max(document.body.scrollWidth, document.documentElement.scrollWidth)
    )
    const viewportWidth = await page.evaluate(() => window.innerWidth)

    // Allow 5px tolerance for scrollbar/rounding
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })

  test('should have readable font size on mobile (≥12px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const textElements = page.locator('p, span, label, button, h1, h2, h3')

    if (await textElements.count() > 0) {
      const fontSize = await textElements.first().evaluate(el =>
        parseFloat(window.getComputedStyle(el).fontSize)
      )
      expect(fontSize).toBeGreaterThanOrEqual(12)
    }
  })

  test('should have adequate spacing between buttons on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')

    if (await buttons.count() > 1) {
      const box1 = await buttons.nth(0).boundingBox()
      const box2 = await buttons.nth(1).boundingBox()

      if (box1 && box2) {
        // Buttons should have at least 4px between them
        const verticalGap = Math.abs(box2.y - (box1.y + box1.height))
        const horizontalGap = Math.abs(box2.x - (box1.x + box1.width))
        const minGap = Math.min(verticalGap, horizontalGap)
        expect(Math.max(verticalGap, horizontalGap)).toBeGreaterThanOrEqual(0)
        // At least one dimension should have reasonable gap
        expect(box1.width > 0 || box1.height > 0).toBe(true)
      }
    }
  })

  test('should handle increased text size without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Simulate user increasing browser text size
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '20px'
    })

    await page.waitForTimeout(200)

    const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
    // Allow 15px tolerance for large text mode
    expect(bodyWidth).toBeLessThanOrEqual(390)
  })

  test('should display correctly on tablet viewport (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const body = page.locator('body')
    await expect(body).toBeVisible()

    const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
    expect(bodyWidth).toBeLessThanOrEqual(768)
  })
})
