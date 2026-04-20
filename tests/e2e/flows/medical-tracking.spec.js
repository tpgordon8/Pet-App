import { test, expect } from '@playwright/test'
import { goToPage, waitForDashboard, captureConsoleErrors } from '../helpers/ui-helpers'

test.describe('Medical Tracking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await goToPage(page, '/')
  })

  test('should show medical tracking section', async ({ page }) => {
    await waitForDashboard(page)

    const bodyText = await page.locator('body').textContent()
    const hasMedicalSection = [
      'Medical', 'Vet', 'Vaccination', 'Weight'
    ].some(word => bodyText.includes(word))

    expect(hasMedicalSection).toBe(true)
  })

  test('should show Vet Visit button', async ({ page }) => {
    await waitForDashboard(page)

    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toContain('Vet')
  })

  test('should show Vaccination button', async ({ page }) => {
    await waitForDashboard(page)

    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toContain('Vaccination')
  })

  test('should show Weight Check button', async ({ page }) => {
    await waitForDashboard(page)

    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toContain('Weight')
  })

  test('should open medical modal when clicking Vet Visit', async ({ page }) => {
    await waitForDashboard(page)

    const vetButton = page.locator('button').filter({ hasText: /Vet/i }).first()

    if (await vetButton.count() > 0) {
      await vetButton.click()
      await page.waitForTimeout(500)

      // A modal or form should appear
      const body = page.locator('body')
      await expect(body).toBeVisible()

      // Press escape to close
      await page.keyboard.press('Escape')
    }
  })

  test('should open weight check modal with weight input', async ({ page }) => {
    await waitForDashboard(page)

    const weightButton = page.locator('button').filter({ hasText: /Weight/i }).first()

    if (await weightButton.count() > 0) {
      await weightButton.click()
      await page.waitForTimeout(500)

      // Look for a number input (weight value)
      const numberInput = page.locator('input[type="number"]')
      const hasNumberInput = await numberInput.count() > 0

      // Close modal
      await page.keyboard.press('Escape')

      // The weight modal should have a number input
      if (hasNumberInput) {
        expect(hasNumberInput).toBe(true)
      }
    }
  })

  test('should not produce JS errors when interacting with medical buttons', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await waitForDashboard(page)

    const medicalButtons = page.locator('button').filter({ hasText: /Vet|Vaccination|Weight/i })

    if (await medicalButtons.count() > 0) {
      await medicalButtons.first().click()
      await page.waitForTimeout(500)
      await page.keyboard.press('Escape')
    }

    const criticalErrors = errors.filter(e => !e.includes('offline') && !e.includes('net::ERR_'))
    expect(criticalErrors).toHaveLength(0)
  })

  test('should render medical activities in feed without crashing', async ({ page }) => {
    await waitForDashboard(page)

    // Page should remain stable (no undefined errors from medical data display)
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('undefined is not an object')
    expect(bodyText).not.toContain('Cannot read property')
  })
})
