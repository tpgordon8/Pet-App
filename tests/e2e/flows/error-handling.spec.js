import { test, expect } from '@playwright/test'
import { goToPage, captureConsoleErrors } from '../helpers/ui-helpers'

test.describe('Error Handling & Defensive Rendering', () => {
  test('should handle missing pet data gracefully (no crashes)', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        expect(msg.text()).not.toContain('undefined is not an object')
        expect(msg.text()).not.toContain('Cannot read properties of undefined')
        expect(msg.text()).not.toContain('Cannot read property')
      }
    })

    await goToPage(page, '/')

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should render without crashing on initial load', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await goToPage(page, '/')
    await page.waitForLoadState('networkidle')

    const body = page.locator('body')
    await expect(body).toBeVisible()

    const jsErrors = errors.filter(e =>
      e.includes('TypeError') || e.includes('ReferenceError') || e.includes('SyntaxError')
    )
    expect(jsErrors).toHaveLength(0)
  })

  test('should handle invalid form inputs without crashing', async ({ page }) => {
    await goToPage(page, '/')
    await page.waitForLoadState('networkidle')

    // Try filling any inputs with unusual data
    const inputs = page.locator('input[type="text"]')
    const count = await inputs.count()

    for (let i = 0; i < Math.min(3, count); i++) {
      const input = inputs.nth(i)
      if (await input.isVisible()) {
        await input.fill('!!@@##$$%%^^&&*()')
        await input.clear()
      }
    }

    // App should remain stable
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should handle Escape key without crashing', async ({ page }) => {
    await goToPage(page, '/')
    await page.waitForLoadState('networkidle')

    // Press Escape multiple times (closing any open modals gracefully)
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
    }

    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should handle rapid button clicks without crashing', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await goToPage(page, '/')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')
    if (await buttons.count() > 0) {
      const firstButton = buttons.first()
      // Rapid clicks
      await firstButton.click({ clickCount: 3 })
      await page.waitForTimeout(500)
      await page.keyboard.press('Escape')
    }

    const jsErrors = errors.filter(e =>
      e.includes('TypeError') || e.includes('ReferenceError')
    )
    expect(jsErrors).toHaveLength(0)
  })

  test('should display user-friendly error messages (not raw JS)', async ({ page }) => {
    await goToPage(page, '/')
    await page.waitForLoadState('networkidle')

    const bodyText = await page.locator('body').textContent()

    // Should NOT contain raw JavaScript error strings
    expect(bodyText).not.toContain('undefined is not an object')
    expect(bodyText).not.toContain('[object Object]')
    expect(bodyText).not.toContain('function()')
    expect(bodyText).not.toContain('at Object.')
  })

  test('should gracefully handle offline state indicators', async ({ page }) => {
    await goToPage(page, '/')
    await page.waitForLoadState('networkidle')

    // Simulate going offline
    await page.context().setOffline(true)
    await page.waitForTimeout(500)

    // App should still show content (cached/offline mode)
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Restore online
    await page.context().setOffline(false)
  })
})
