import { test, expect } from '@playwright/test'

test.describe('Household Creation Flow', () => {
  test('should allow user to create a new household', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Should show onboarding
    await expect(page.locator('text=Welcome to Tailr')).toBeVisible()

    // Click Get Started
    await page.click('button:has-text("Get Started")')

    // Enter pet name
    await page.fill('input[placeholder*="name"]', 'Luna')
    await page.click('button:has-text("Continue")')

    // Select species
    await page.click('button:has-text("Dog")')

    // Choose emoji (skip for now)
    await page.click('button:has-text("Continue")')

    // Setup household - choose shared
    await page.click('button:has-text("Yes, Set Up Sharing")')

    // Create household
    await page.fill('input[placeholder*="household code"]', 'TEST123')
    await page.fill('input[placeholder*="passcode"]', '1234')
    await page.fill('input[placeholder*="your name"]', 'TestUser')
    await page.click('button:has-text("Create Household")')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/)
  })

  test('should validate household code format', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Navigate to household creation
    await page.click('button:has-text("Get Started")')
    await page.fill('input[placeholder*="name"]', 'Luna')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("Dog")')
    await page.click('button:has-text("Continue")')
    await page.click('button:has-text("Yes, Set Up Sharing")')

    // Try invalid code (too short)
    await page.fill('input[placeholder*="household code"]', 'AB')
    await page.fill('input[placeholder*="passcode"]', '1234')
    await page.fill('input[placeholder*="your name"]', 'TestUser')
    await page.click('button:has-text("Create Household")')

    // Should show error
    await expect(page.locator('text=4-20 characters')).toBeVisible()
  })
})
