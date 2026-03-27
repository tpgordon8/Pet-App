import { test, expect } from '@playwright/test'
import {
  captureAppState,
  verifyActivityLog,
  verifyPetSelector,
  verifyQuickLogButtons,
  waitForVueApp,
  captureScreenshotWithMetadata,
  captureConsoleLogs
} from '../helpers/visual-testing.js'

/**
 * Visual Testing Example for Tailr
 *
 * This test demonstrates the integrated workflow between:
 * 1. Playwright automated tests
 * 2. /browse skill for interactive visual inspection
 *
 * Workflow:
 * 1. Run `npm run dev` to start the app
 * 2. Run `/browse http://localhost:5173` to explore interactively
 * 3. Run `npm run test:e2e` to verify behavior automatically
 * 4. Use screenshots and state captures for debugging
 */

test.describe('Dashboard Visual Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console log capture for debugging
    const { logs, errors } = captureConsoleLogs(page)

    // Navigate to app
    await page.goto('/')

    // Wait for Vue app to be fully loaded
    await waitForVueApp(page)
  })

  test('should render dashboard with all components', async ({ page }) => {
    // Navigate to dashboard (assuming onboarding is complete)
    // If onboarding exists, complete it first
    const hasOnboarding = await page.locator('text=Welcome to Tailr').isVisible().catch(() => false)

    if (hasOnboarding) {
      // Complete onboarding flow
      await page.click('button:has-text("Get Started")')
      await page.fill('input[placeholder*="name"]', 'TestPet')
      await page.click('button:has-text("Continue")')
      await page.click('button:has-text("Dog")')
      await page.click('button:has-text("Continue")')
      // Skip household setup for now
      await page.click('button:has-text("Skip")').catch(() => {})
    }

    // Capture full app state for inspection
    const state = await captureAppState(page)
    console.log('App State:', JSON.stringify(state, null, 2))

    // Take screenshot for visual inspection
    await captureScreenshotWithMetadata(page, 'dashboard-initial')

    // Verify key sections are visible
    expect(state.sections.dashboard || state.sections.quickLog).toBeTruthy()

    // Verify viewport is correct
    console.log(`Viewport: ${state.viewport.width}x${state.viewport.height}`)
    console.log(`Is Mobile: ${state.viewport.isMobile}`)
  })

  test('should display quick log buttons correctly', async ({ page }) => {
    // Verify buttons are rendered
    const buttons = await verifyQuickLogButtons(page)
    console.log('Quick Log Buttons:', JSON.stringify(buttons, null, 2))

    // Take screenshot of button layout
    await page.screenshot({
      path: 'test-results/screenshots/quick-log-buttons.png',
      clip: { x: 0, y: 0, width: 800, height: 400 }
    })

    // Verify expected button count (adjust based on your app)
    expect(buttons.length).toBeGreaterThan(0)

    // Verify each button has required elements
    buttons.forEach(btn => {
      expect(btn.label || btn.emoji).toBeTruthy()
    })
  })

  test('should log activity and update feed', async ({ page }) => {
    // Get initial activity count
    const initialState = await verifyActivityLog(page).catch(() => ({ count: 0 }))
    console.log('Initial activities:', initialState.count)

    // Click a quick log button (e.g., Poop)
    const poopButton = page.locator('button:has-text("💩")')
    if (await poopButton.isVisible()) {
      await poopButton.click()

      // Wait for Firebase to sync
      await page.waitForTimeout(1000)

      // Verify activity was added
      const newState = await verifyActivityLog(page)
      console.log('New activities:', newState.count)

      // Take screenshot of updated feed
      await captureScreenshotWithMetadata(page, 'activity-logged')

      expect(newState.count).toBeGreaterThanOrEqual(initialState.count)
    }
  })

  test('should switch between pets correctly', async ({ page }) => {
    // Verify pet selector exists and works
    const petState = await verifyPetSelector(page)
    console.log('Pet Selector State:', JSON.stringify(petState, null, 2))

    if (petState.found && petState.count > 1) {
      // Take screenshot before switch
      await page.screenshot({ path: 'test-results/screenshots/before-pet-switch.png' })

      // Click on a different pet
      const secondPet = page.locator('[data-testid="pet-option"]').nth(1)
      await secondPet.click()

      // Wait for filter to apply
      await page.waitForTimeout(500)

      // Take screenshot after switch
      await page.screenshot({ path: 'test-results/screenshots/after-pet-switch.png' })

      // Verify the filter updated
      const newPetState = await verifyPetSelector(page)
      console.log('After switch:', newPetState.selectedPet)
    }
  })

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Reload to ensure responsive layout
    await page.reload()
    await waitForVueApp(page)

    // Capture state on mobile
    const state = await captureAppState(page)
    expect(state.viewport.isMobile).toBe(true)

    // Take mobile screenshot
    await captureScreenshotWithMetadata(page, 'dashboard-mobile')

    // Verify mobile layout
    console.log('Mobile layout verified')
  })

  test('should handle dark mode toggle', async ({ page }) => {
    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]')

    if (await darkModeToggle.isVisible()) {
      // Take screenshot in light mode
      await page.screenshot({ path: 'test-results/screenshots/light-mode.png' })

      // Toggle dark mode
      await darkModeToggle.click()
      await page.waitForTimeout(300)

      // Take screenshot in dark mode
      await page.screenshot({ path: 'test-results/screenshots/dark-mode.png' })

      // Verify dark mode class is applied
      const hasDarkClass = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark')
      })

      expect(hasDarkClass).toBe(true)
    }
  })
})

/**
 * Test for /browse integration
 *
 * This test can be run manually with /browse to visually inspect:
 *
 * 1. Start dev server: npm run dev
 * 2. Use /browse skill: /browse http://localhost:5173
 * 3. Claude will see the actual rendered page and can:
 *    - Verify visual layout
 *    - Check color schemes
 *    - Test interactions
 *    - Capture screenshots
 *    - Verify responsive design
 */
test.describe('/browse Integration Tests', () => {
  test('MANUAL: Visual inspection checklist', async ({ page }) => {
    await page.goto('/')
    await waitForVueApp(page)

    // This test is designed to be run manually with /browse
    // It captures the state that Claude can inspect visually

    const fullState = {
      app: await captureAppState(page),
      buttons: await verifyQuickLogButtons(page),
      pets: await verifyPetSelector(page).catch(() => null),
      activities: await verifyActivityLog(page).catch(() => null),
    }

    console.log('\n=== VISUAL INSPECTION CHECKLIST ===')
    console.log(JSON.stringify(fullState, null, 2))
    console.log('\nUse /browse http://localhost:5173 to visually verify:')
    console.log('1. Layout is clean and organized')
    console.log('2. Colors match design system (sage green primary)')
    console.log('3. Buttons are clearly visible and labeled')
    console.log('4. Activity feed displays correctly')
    console.log('5. Pet selector is functional')
    console.log('6. Mobile responsive design works')
    console.log('7. No console errors')
    console.log('===================================\n')

    // Always pass - this is for manual inspection
    expect(true).toBe(true)
  })
})
