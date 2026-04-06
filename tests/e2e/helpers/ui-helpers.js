/**
 * UI Helper Functions for Tailr E2E Tests
 * Reusable Playwright utilities for interacting with the app
 */

// ─── Navigation ───────────────────────────────────────────────────────────────

export async function goToPage(page, path = '/') {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

export async function waitForVueApp(page, timeout = 5000) {
  await page.waitForFunction(
    () => {
      const app = document.getElementById('app')
      return app && app.innerHTML.length > 100
    },
    { timeout }
  )
}

export async function getCurrentUrl(page) {
  return page.url()
}

export async function expectUrlContains(page, segment) {
  const url = page.url()
  return url.includes(segment)
}

// ─── Interactions ─────────────────────────────────────────────────────────────

export async function clickButton(page, text) {
  await page.click(`button:has-text("${text}")`)
}

export async function clickByAriaLabel(page, label) {
  await page.click(`[aria-label="${label}"]`)
}

export async function fillInput(page, placeholder, value) {
  await page.fill(`input[placeholder="${placeholder}"]`, value)
}

export async function fillTextarea(page, placeholder, value) {
  await page.fill(`textarea[placeholder="${placeholder}"]`, value)
}

export async function selectOption(page, selector, value) {
  await page.selectOption(selector, value)
}

// ─── Assertions ───────────────────────────────────────────────────────────────

export async function expectTextVisible(page, text, timeout = 5000) {
  await page.getByText(text, { exact: false }).waitFor({ state: 'visible', timeout })
}

export async function expectTextNotVisible(page, text) {
  await page.getByText(text, { exact: false }).waitFor({ state: 'hidden', timeout: 3000 })
}

export async function expectInputValue(page, placeholder, expected) {
  const value = await page.inputValue(`input[placeholder="${placeholder}"]`)
  return value === expected
}

// ─── App-Specific Helpers ─────────────────────────────────────────────────────

/**
 * Wait for the dashboard to be fully loaded
 */
export async function waitForDashboard(page) {
  await waitForVueApp(page)
  // Dashboard is ready when activity buttons are visible
  await page.waitForSelector('button', { timeout: 10000 })
}

/**
 * Click an activity log button by its label text
 */
export async function clickActivityButton(page, activityName) {
  // Activity buttons are identified by their text content
  const button = page.locator('button').filter({ hasText: activityName }).first()
  await button.waitFor({ state: 'visible', timeout: 5000 })
  await button.click()
}

/**
 * Get all visible activity buttons and their states
 */
export async function getActivityButtons(page) {
  return await page.evaluate(() => {
    const buttons = document.querySelectorAll('[data-testid="activity-button"], button')
    return Array.from(buttons)
      .filter(btn => btn.textContent.trim().length > 0)
      .map(btn => ({
        text: btn.textContent.trim(),
        disabled: btn.disabled,
        visible: !btn.closest('[style*="display: none"]')
      }))
  })
}

/**
 * Get the count badge on an activity button
 */
export async function getActivityCount(page, activityName) {
  const button = page.locator('button').filter({ hasText: activityName }).first()
  const countEl = button.locator('[data-testid="activity-count"], .count, .badge').first()
  if (await countEl.count() > 0) {
    return await countEl.textContent()
  }
  return null
}

/**
 * Dismiss a modal by pressing Escape or clicking outside
 */
export async function dismissModal(page) {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
}

/**
 * Check if a toast notification is visible
 */
export async function isToastVisible(page, text = null) {
  const toastSelector = '[role="status"], [data-testid="toast"], .toast'
  const toast = page.locator(toastSelector).first()
  const visible = await toast.isVisible().catch(() => false)
  if (!visible || !text) return visible
  const content = await toast.textContent()
  return content.toLowerCase().includes(text.toLowerCase())
}

/**
 * Take a screenshot with a name for test artifacts
 */
export async function takeScreenshot(page, name) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  })
}

/**
 * Capture console errors during a test
 */
export function captureConsoleErrors(page) {
  const errors = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

/**
 * Scroll to the bottom of the page
 */
export async function scrollToBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
}
