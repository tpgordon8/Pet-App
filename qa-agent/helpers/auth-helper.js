import CONFIG from '../config/agent-config.js';
import logger from './logger.js';

/**
 * Automate the 7-step onboarding flow to create a test household
 */
export class AuthHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Complete the full onboarding flow
   */
  async createTestHousehold() {
    logger.info('Starting onboarding flow...');

    const timestamp = Date.now();
    const householdCode = `${CONFIG.testHousehold.prefix}${timestamp}`;

    try {
      // Check if already authenticated (dashboard loaded)
      const currentUrl = this.page.url();
      if (currentUrl.includes('/dashboard')) {
        logger.info('Already authenticated, skipping onboarding');
        return { householdCode: 'existing', skippped: true };
      }

      // Step 1: Welcome page - Click "Get Started"
      logger.step(1, 'Welcome page - clicking "Get Started"');
      await this.page.waitForTimeout(1000);

      // Look for "Get Started" button
      const getStartedButton = await this.page.locator('button:has-text("Get Started"), a:has-text("Get Started")').first();
      if (await getStartedButton.isVisible({ timeout: 5000 })) {
        await getStartedButton.click();
        await this.page.waitForTimeout(1000);
      }

      // Step 2: Add Pet
      logger.step(2, 'Adding test pet');
      await this.page.waitForTimeout(1000);

      // Fill pet name
      const petNameInput = await this.page.locator('input[placeholder*="pet" i], input[name="petName"], input[type="text"]').first();
      if (await petNameInput.isVisible({ timeout: 3000 })) {
        await petNameInput.fill(CONFIG.testHousehold.petName);
      }

      // Select species (if dropdown exists)
      try {
        const speciesSelect = await this.page.locator('select, input[placeholder*="species" i]').first();
        if (await speciesSelect.isVisible({ timeout: 2000 })) {
          await speciesSelect.click();
          await this.page.waitForTimeout(500);
          await speciesSelect.fill(CONFIG.testHousehold.petSpecies);
        }
      } catch (error) {
        // Species field may not exist or be optional
      }

      // Click Next/Continue
      await this.clickNextButton();

      // Step 3: Personalization (skip if exists)
      logger.step(3, 'Personalization step (skipping if present)');
      await this.page.waitForTimeout(1000);

      // Try to skip this step
      const skipButton = await this.page.locator('button:has-text("Skip"), button:has-text("Later")').first();
      if (await skipButton.isVisible({ timeout: 2000 })) {
        await skipButton.click();
        await this.page.waitForTimeout(1000);
      } else {
        await this.clickNextButton();
      }

      // Step 4: Create Account
      logger.step(4, 'Creating account with credentials');
      await this.page.waitForTimeout(1000);

      // Fill member name
      const memberNameInput = await this.page.locator('input[placeholder*="name" i], input[name="memberName"]').first();
      if (await memberNameInput.isVisible({ timeout: 3000 })) {
        await memberNameInput.fill(CONFIG.testHousehold.memberName);
      }

      // Fill household code
      const householdInput = await this.page.locator('input[placeholder*="household" i], input[name="householdCode"]').first();
      if (await householdInput.isVisible({ timeout: 3000 })) {
        await householdInput.fill(householdCode);
      }

      // Fill passcode
      const passcodeInput = await this.page.locator('input[type="password"], input[placeholder*="passcode" i]').first();
      if (await passcodeInput.isVisible({ timeout: 3000 })) {
        await passcodeInput.fill(CONFIG.testHousehold.passcode);
      }

      await this.clickNextButton();

      // Step 5: Household Setup
      logger.step(5, 'Household setup - selecting "Just Me"');
      await this.page.waitForTimeout(1000);

      // Select "Just Me" option if available
      const justMeButton = await this.page.locator('button:has-text("Just Me"), button:has-text("Solo")').first();
      if (await justMeButton.isVisible({ timeout: 3000 })) {
        await justMeButton.click();
        await this.page.waitForTimeout(1000);
      }

      await this.clickNextButton();

      // Step 6: Success confirmation
      logger.step(6, 'Success confirmation');
      await this.page.waitForTimeout(1000);

      await this.clickNextButton();

      // Step 7: Redirect to dashboard
      logger.step(7, 'Waiting for dashboard redirect');
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });

      logger.success(`Household created: ${householdCode}`);

      return {
        householdCode,
        passcode: CONFIG.testHousehold.passcode,
        memberName: CONFIG.testHousehold.memberName,
        timestamp
      };

    } catch (error) {
      logger.error(`Onboarding failed: ${error.message}`);

      // Try to complete onboarding anyway by clicking through
      try {
        logger.warning('Attempting fallback onboarding completion...');

        // Click through remaining steps
        for (let i = 0; i < 5; i++) {
          await this.clickNextButton();
          await this.page.waitForTimeout(1500);

          // Check if we reached dashboard
          if (this.page.url().includes('/dashboard')) {
            logger.success('Fallback onboarding completed');
            return { householdCode, fallback: true };
          }
        }
      } catch (fallbackError) {
        // Fallback also failed
      }

      throw new Error(`Failed to complete onboarding: ${error.message}`);
    }
  }

  /**
   * Click Next/Continue/Submit button
   */
  async clickNextButton() {
    const buttonTexts = ['Next', 'Continue', 'Submit', 'Create', 'Finish', 'Done'];

    for (const text of buttonTexts) {
      try {
        const button = await this.page.locator(`button:has-text("${text}")`).first();
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click();
          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (error) {
        // Button not found, try next
      }
    }

    // If no text-based button found, try to find primary button by class
    try {
      const primaryButton = await this.page.locator('button.primary, button.btn-primary, button[type="submit"]').first();
      if (await primaryButton.isVisible({ timeout: 1000 })) {
        await primaryButton.click();
        await this.page.waitForTimeout(1000);
        return true;
      }
    } catch (error) {
      // No primary button found
    }

    return false;
  }

  /**
   * Login to existing household (if needed for future tests)
   */
  async login(householdCode, passcode) {
    logger.info(`Logging in to household: ${householdCode}`);

    try {
      // Navigate to login page
      await this.page.goto(`${CONFIG.baseUrl}/login`);

      // Fill credentials
      await this.page.fill('input[name="householdCode"]', householdCode);
      await this.page.fill('input[type="password"]', passcode);

      // Submit
      await this.page.click('button[type="submit"]');

      // Wait for dashboard
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });

      logger.success('Login successful');
      return true;
    } catch (error) {
      logger.error(`Login failed: ${error.message}`);
      return false;
    }
  }
}

export default AuthHelper;
