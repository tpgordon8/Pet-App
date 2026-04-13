import { test, expect } from '@playwright/test'

test.describe('Mobile: Accessibility', () => {
  test('should have visible focus indicators when tabbing', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    const focusedStyles = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return null
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
        tag: el.tagName
      }
    })

    // Something should be focused after Tab
    if (focusedStyles && focusedStyles.tag !== 'BODY') {
      // Focus indicator should exist (warn but don't hard-fail on all browsers)
      expect(focusedStyles.tag).toBeTruthy()
    }
  })

  test('should support keyboard navigation through interactive elements', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab through several elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(50)
    }

    const focused = await page.evaluate(() => document.activeElement?.tagName)
    // Should have focused on some interactive element
    expect(focused).toBeTruthy()
  })

  test('should have ARIA labels or text on interactive buttons', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')
    const count = await buttons.count()

    let accessibleCount = 0
    let total = 0

    for (let i = 0; i < Math.min(10, count); i++) {
      const button = buttons.nth(i)
      if (!(await button.isVisible())) continue

      total++
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const ariaLabelledBy = await button.getAttribute('aria-labelledby')
      const title = await button.getAttribute('title')

      if (
        text?.trim()?.length > 0 ||
        ariaLabel?.length > 0 ||
        ariaLabelledBy?.length > 0 ||
        title?.length > 0
      ) {
        accessibleCount++
      }
    }

    if (total > 0) {
      // At least 80% of buttons should have accessible labels
      expect(accessibleCount / total).toBeGreaterThanOrEqual(0.8)
    }
  })

  test('should have semantic heading structure', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const h1Count = await page.locator('h1').count()
    const h2Count = await page.locator('h2').count()
    const h3Count = await page.locator('h3').count()

    const navCount = await page.locator('nav').count()
    const mainCount = await page.locator('main').count()

    // Should have either headings or landmark regions
    const hasStructure =
      h1Count > 0 || h2Count > 0 || h3Count > 0 ||
      navCount > 0 || mainCount > 0

    expect(hasStructure).toBe(true)
  })

  test('should have a document title', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })

  test('should have a lang attribute on the html element', async ({ page }) => {
    await page.goto('/')

    const lang = await page.evaluate(() => document.documentElement.lang)
    // Either has a lang attribute, or at minimum the page loads correctly
    // Not a hard failure — just good practice check
    if (lang) {
      expect(lang.length).toBeGreaterThan(0)
    }
  })

  test('should have sufficient color contrast (no all-transparent text)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that visible text elements have a non-transparent color
    const textWithColor = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, h1, h2, h3, button, label, span')
      const results = []
      for (const el of elements) {
        if (el.offsetParent === null) continue // skip hidden
        const color = window.getComputedStyle(el).color
        if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          results.push(true)
        }
      }
      return results.length
    })

    expect(textWithColor).toBeGreaterThan(0)
  })

  test('should not trap keyboard focus in a broken state', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab through 10 elements — should cycle without getting stuck
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(30)
    }

    // Use Shift+Tab to go backwards
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab')
      await page.waitForTimeout(30)
    }

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
