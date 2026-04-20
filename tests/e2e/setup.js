/**
 * E2E Test Setup - Tailr Pet Activity Logger
 * Shared fixtures and utilities for Playwright tests
 */

// ─── Test Data Fixtures ───────────────────────────────────────────────────────

export const testData = {
  household: {
    code: 'test-home',
    passcode: 'test1234',
    memberName: 'Tara'
  },

  pet: {
    name: 'Luna',
    species: 'Dog',
    emoji: '🐕'
  },

  activities: {
    regular: ['Poop', 'Pee', 'Food', 'Sleep', 'Meds', 'Walk'],
    medical: ['Vet Visit', 'Vaccination', 'Weight Check']
  },

  medicalData: {
    vetVisit: { notes: 'Annual checkup', cost: '150' },
    vaccination: { vaccineName: 'Rabies', notes: 'Booster' },
    weightCheck: { weight: '25', unit: 'lbs' }
  }
}

// ─── Shared Helpers ───────────────────────────────────────────────────────────

export const waitForElement = async (page, selector, timeout = 5000) => {
  await page.waitForSelector(selector, { timeout })
}

export const expectTextVisible = async (page, text) => {
  await page.getByText(text, { exact: false }).waitFor({ state: 'visible', timeout: 5000 })
}

export const expectTextNotVisible = async (page, text) => {
  await page.getByText(text, { exact: false }).waitFor({ state: 'hidden', timeout: 5000 })
}
