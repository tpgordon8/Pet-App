/**
 * Visual Testing Helper for Tailr
 *
 * This module provides utilities for visual testing using both:
 * 1. /browse skill (interactive exploration)
 * 2. Playwright (automated verification)
 *
 * Usage:
 *   import { captureAppState, verifyActivityLog, verifyPetSelector } from './helpers/visual-testing.js'
 */

/**
 * Capture the current state of the app for visual inspection
 * Works with both /browse and Playwright
 */
export async function captureAppState(page) {
  return await page.evaluate(() => {
    const state = {
      url: window.location.href,
      title: document.title,

      // Check if Vue app is mounted
      vueMounted: !!document.getElementById('app')?.innerHTML,

      // Visible sections
      sections: {
        onboarding: !!document.querySelector('[data-testid="onboarding"]') ||
                   !!document.querySelector('text=Welcome to Tailr'),
        dashboard: !!document.querySelector('[data-testid="dashboard"]') ||
                  !!document.querySelector('.dashboard'),
        activityFeed: !!document.querySelector('[data-testid="activity-feed"]'),
        petSelector: !!document.querySelector('[data-testid="pet-selector"]'),
        quickLog: !!document.querySelector('[data-testid="quick-log"]'),
      },

      // Count visible elements
      counts: {
        activityButtons: document.querySelectorAll('[data-testid="activity-button"]').length,
        activityItems: document.querySelectorAll('[data-testid="activity-item"]').length,
        petOptions: document.querySelectorAll('[data-testid="pet-option"]').length,
      },

      // Text content samples
      textContent: {
        headings: Array.from(document.querySelectorAll('h1, h2, h3'))
          .map(h => h.textContent.trim())
          .filter(Boolean),
        buttons: Array.from(document.querySelectorAll('button'))
          .map(b => b.textContent.trim())
          .filter(Boolean)
          .slice(0, 10), // First 10 buttons
      },

      // Console errors (if any captured)
      hasErrors: !!document.querySelector('.error-message'),

      // Viewport info
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
      }
    }

    return state
  })
}

/**
 * Verify the activity log is displaying correctly
 */
export async function verifyActivityLog(page, expectedCount = null) {
  const state = await page.evaluate(() => {
    const feed = document.querySelector('[data-testid="activity-feed"]') ||
                 document.querySelector('.activity-feed')

    if (!feed) return { found: false }

    const items = feed.querySelectorAll('[data-testid="activity-item"]') ||
                  feed.querySelectorAll('.activity-item')

    return {
      found: true,
      count: items.length,
      firstItem: items[0] ? {
        type: items[0].querySelector('[data-testid="activity-type"]')?.textContent,
        time: items[0].querySelector('[data-testid="activity-time"]')?.textContent,
        emoji: items[0].querySelector('[data-testid="activity-emoji"]')?.textContent,
      } : null
    }
  })

  if (expectedCount !== null && state.count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} activities, found ${state.count}`)
  }

  return state
}

/**
 * Verify the pet selector is working
 */
export async function verifyPetSelector(page) {
  const state = await page.evaluate(() => {
    const selector = document.querySelector('[data-testid="pet-selector"]')
    if (!selector) return { found: false }

    const selectedPet = selector.querySelector('[data-testid="selected-pet"]') ||
                       selector.querySelector('.selected')

    const petOptions = Array.from(
      selector.querySelectorAll('[data-testid="pet-option"]') ||
      selector.querySelectorAll('.pet-option')
    )

    return {
      found: true,
      selectedPet: selectedPet?.textContent.trim(),
      availablePets: petOptions.map(opt => opt.textContent.trim()),
      count: petOptions.length
    }
  })

  return state
}

/**
 * Verify quick log buttons are functional
 */
export async function verifyQuickLogButtons(page) {
  const state = await page.evaluate(() => {
    const buttons = Array.from(
      document.querySelectorAll('[data-testid="activity-button"]') ||
      document.querySelectorAll('.activity-button')
    )

    return buttons.map(btn => ({
      label: btn.querySelector('[data-testid="activity-label"]')?.textContent.trim() ||
             btn.textContent.trim(),
      emoji: btn.querySelector('[data-testid="activity-emoji"]')?.textContent.trim(),
      count: btn.querySelector('[data-testid="activity-count"]')?.textContent.trim(),
      disabled: btn.disabled
    }))
  })

  return state
}

/**
 * Take a screenshot with metadata
 * Useful for visual regression testing
 */
export async function captureScreenshotWithMetadata(page, name) {
  const metadata = await captureAppState(page)
  const screenshot = await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  })

  return {
    screenshot,
    metadata,
    timestamp: new Date().toISOString()
  }
}

/**
 * Wait for Vue app to be fully loaded and hydrated
 */
export async function waitForVueApp(page, timeout = 5000) {
  await page.waitForFunction(
    () => {
      const app = document.getElementById('app')
      return app && app.innerHTML.length > 100 && !document.querySelector('.loading')
    },
    { timeout }
  )
}

/**
 * Get all console logs and errors from the page
 * Useful for debugging
 */
export function captureConsoleLogs(page) {
  const logs = []
  const errors = []

  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    }

    logs.push(logEntry)

    if (msg.type() === 'error') {
      errors.push(logEntry)
    }
  })

  return { logs, errors }
}

/**
 * Verify Firebase real-time sync is working
 * Opens two pages and verifies data syncs between them
 */
export async function verifyRealtimeSync(context) {
  const page1 = await context.newPage()
  const page2 = await context.newPage()

  await page1.goto('http://localhost:5173/dashboard')
  await page2.goto('http://localhost:5173/dashboard')

  await waitForVueApp(page1)
  await waitForVueApp(page2)

  // Get initial count from page 2
  const initialCount = await page2.evaluate(() => {
    return document.querySelectorAll('[data-testid="activity-item"]').length
  })

  // Add activity on page 1
  await page1.click('[data-testid="activity-button"][data-type="Poop"]')

  // Wait for sync (Firebase should update page 2)
  await page2.waitForTimeout(2000)

  const newCount = await page2.evaluate(() => {
    return document.querySelectorAll('[data-testid="activity-item"]').length
  })

  await page1.close()
  await page2.close()

  return {
    synced: newCount > initialCount,
    initialCount,
    newCount
  }
}

/**
 * Visual comparison helper
 * Captures screenshots for visual regression testing
 */
export async function compareVisualState(page, name, options = {}) {
  const screenshot = await page.screenshot({
    fullPage: options.fullPage ?? true,
    ...options
  })

  // In a real setup, you'd compare with baseline images
  // For now, just save the screenshot
  const fs = await import('fs')
  const path = `test-results/visual-baselines/${name}.png`

  if (!fs.existsSync('test-results/visual-baselines')) {
    fs.mkdirSync('test-results/visual-baselines', { recursive: true })
  }

  fs.writeFileSync(path, screenshot)

  return {
    saved: true,
    path,
    timestamp: new Date().toISOString()
  }
}
