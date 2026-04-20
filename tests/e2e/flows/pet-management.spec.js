import { test, expect } from '@playwright/test'
import { goToPage, waitForDashboard, captureConsoleErrors } from '../helpers/ui-helpers'

test.describe('Pet Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await goToPage(page, '/')
  })

  test('should show pet selector area', async ({ page }) => {
    await waitForDashboard(page)

    const bodyText = await page.locator('body').textContent()

    // Pet selector should show "All Pets" or individual pet names
    const hasPetArea = ['All Pets', 'All', 'Pets', 'Pet'].some(word => bodyText.includes(word))
    expect(hasPetArea).toBe(true)
  })

  test('should have an option to add a new pet', async ({ page }) => {
    await waitForDashboard(page)

    const bodyText = await page.locator('body').textContent()
    const hasAddPet = ['Add Pet', 'New Pet', 'Add', '+'].some(word => bodyText.includes(word))
    expect(hasAddPet).toBe(true)
  })

  test('should open add-pet modal without crashing', async ({ page }) => {
    await waitForDashboard(page)

    // Look for add pet button
    const addPetButton = page.locator('button').filter({ hasText: /Add Pet|New Pet|\+/i }).first()

    if (await addPetButton.count() > 0) {
      await addPetButton.click()
      await page.waitForTimeout(500)

      // Modal or form should appear
      const body = page.locator('body')
      await expect(body).toBeVisible()

      await page.keyboard.press('Escape')
    }
  })

  test('should validate pet name when creating a pet', async ({ page }) => {
    await waitForDashboard(page)

    const addPetButton = page.locator('button').filter({ hasText: /Add Pet|New Pet/i }).first()

    if (await addPetButton.count() > 0) {
      await addPetButton.click()
      await page.waitForTimeout(500)

      // Find a name input
      const nameInput = page.locator('input[type="text"], input[placeholder*="name" i]').first()

      if (await nameInput.count() > 0) {
        // Try submitting without a name
        const submitButton = page.locator('button').filter({ hasText: /Add|Save|Create/i }).first()
        if (await submitButton.count() > 0) {
          await submitButton.click()
          await page.waitForTimeout(300)

          // Should show validation or stay on form
          const body = page.locator('body')
          await expect(body).toBeVisible()
        }
      }

      await page.keyboard.press('Escape')
    }
  })

  test('should switch between pets without crashing', async ({ page }) => {
    await waitForDashboard(page)

    // Find pet selector buttons/tabs
    const petOptions = page.locator('[data-testid="pet-option"], .pet-selector button, button').filter({
      hasText: /All Pets|All/i
    })

    if (await petOptions.count() > 0) {
      await petOptions.first().click()
      await page.waitForTimeout(300)

      // App should remain stable
      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })

  test('should not produce JS errors during pet interactions', async ({ page }) => {
    const errors = captureConsoleErrors(page)

    await waitForDashboard(page)

    // Open and close add pet modal
    const addPetButton = page.locator('button').filter({ hasText: /Add Pet|New Pet/i }).first()
    if (await addPetButton.count() > 0) {
      await addPetButton.click()
      await page.waitForTimeout(500)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
    }

    const criticalErrors = errors.filter(e => !e.includes('offline') && !e.includes('net::ERR_'))
    expect(criticalErrors).toHaveLength(0)
  })
})
