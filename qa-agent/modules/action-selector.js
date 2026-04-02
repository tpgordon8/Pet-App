import CONFIG from '../config/agent-config.js';
import logger from '../helpers/logger.js';
import { getTestImagePath } from '../helpers/image-generator.js';

/**
 * Autonomous exploration engine with priority-based action selection
 */
export class ActionSelector {
  constructor(page, elementDetector, stateTracker, bugDetector) {
    this.page = page;
    this.elementDetector = elementDetector;
    this.stateTracker = stateTracker;
    this.bugDetector = bugDetector;
  }

  /**
   * Select next action based on priority
   */
  async selectNextAction() {
    logger.info('Analyzing page state...');

    // Wait for page to be ready
    await this.elementDetector.waitForVueReady();
    await this.page.waitForTimeout(500);

    // Priority 1: Unexplored activity buttons (core functionality)
    const activityAction = await this.selectActivityAction();
    if (activityAction) {
      return activityAction;
    }

    // Priority 2: Photo upload testing
    const photoAction = await this.selectPhotoUploadAction();
    if (photoAction) {
      return photoAction;
    }

    // Priority 3: Unexplored regular buttons
    const buttonAction = await this.selectButtonAction();
    if (buttonAction) {
      return buttonAction;
    }

    // Priority 4: Input fields with adversarial data
    const inputAction = await this.selectInputAction();
    if (inputAction) {
      return inputAction;
    }

    // Priority 5: Random exploration
    const randomAction = await this.selectRandomAction();
    if (randomAction) {
      return randomAction;
    }

    // No actions available
    return null;
  }

  /**
   * Select activity logging action
   */
  async selectActivityAction() {
    const activityButtons = await this.elementDetector.findActivityButtons();

    for (const activity of CONFIG.activityTypes) {
      // Check if we've logged this activity type
      if (!this.stateTracker.hasLoggedActivity(activity.type)) {
        // Find the button for this activity
        const button = activityButtons.find(b => b.text.includes(activity.emoji));

        if (button) {
          return {
            type: 'log-activity',
            target: activity.type,
            emoji: activity.emoji,
            buttonIndex: button.index,
            description: `Log ${activity.type} activity`
          };
        }
      }
    }

    return null;
  }

  /**
   * Select photo upload action
   */
  async selectPhotoUploadAction() {
    // Try to upload photos for activities we haven't tested yet
    for (const activity of CONFIG.activityTypes.slice(0, 2)) { // Test 2 activities with photos
      if (!this.stateTracker.hasUploadedPhoto(activity.type)) {
        const activityButtons = await this.elementDetector.findActivityButtons();
        const button = activityButtons.find(b => b.text.includes(activity.emoji));

        if (button) {
          return {
            type: 'log-activity-with-photo',
            target: activity.type,
            emoji: activity.emoji,
            buttonIndex: button.index,
            photoType: 'standard',
            description: `Log ${activity.type} with photo upload`
          };
        }
      }
    }

    return null;
  }

  /**
   * Select unexplored button
   */
  async selectButtonAction() {
    const buttons = await this.elementDetector.findButtons();

    // Filter out activity buttons and previously clicked buttons
    const unexploredButtons = buttons.filter(button => {
      const selector = `${button.selector}:nth-child(${button.index + 1})`;
      return !this.stateTracker.hasClickedElement(selector);
    });

    if (unexploredButtons.length > 0) {
      const button = unexploredButtons[0];
      const selector = `${button.selector}:nth-child(${button.index + 1})`;

      return {
        type: 'click-button',
        target: button.text || 'Unknown button',
        selector: button.selector,
        index: button.index,
        description: `Click button: "${button.text}"`
      };
    }

    return null;
  }

  /**
   * Select input field for adversarial testing
   */
  async selectInputAction() {
    const inputs = await this.elementDetector.findInputs();

    // Get adversarial inputs we haven't tried yet
    const adversarialValues = Object.values(CONFIG.adversarialInputs);

    for (const input of inputs) {
      for (const value of adversarialValues) {
        const selector = `${input.selector}:nth-child(${input.index + 1})`;

        if (!this.stateTracker.hasFilledInput(selector, value)) {
          return {
            type: 'fill-input',
            target: input.placeholder || input.name || 'Unknown input',
            selector: input.selector,
            index: input.index,
            value: value,
            description: `Fill "${input.placeholder || input.name}" with adversarial input`
          };
        }
      }
    }

    return null;
  }

  /**
   * Select random action (fallback)
   */
  async selectRandomAction() {
    const buttons = await this.elementDetector.findButtons();

    if (buttons.length > 0) {
      const randomIndex = Math.floor(Math.random() * buttons.length);
      const button = buttons[randomIndex];

      return {
        type: 'click-random',
        target: button.text || 'Random button',
        selector: button.selector,
        index: button.index,
        description: `Random click: "${button.text}"`
      };
    }

    return null;
  }

  /**
   * Execute selected action
   */
  async executeAction(action) {
    logger.step(this.stateTracker.currentStep + 1, action.description);

    const startTime = Date.now();
    let success = false;
    let error = null;

    try {
      switch (action.type) {
        case 'log-activity':
          success = await this.executeLogActivity(action);
          break;

        case 'log-activity-with-photo':
          success = await this.executeLogActivityWithPhoto(action);
          break;

        case 'click-button':
        case 'click-random':
          success = await this.executeClickButton(action);
          break;

        case 'fill-input':
          success = await this.executeFillInput(action);
          break;

        default:
          logger.warning(`Unknown action type: ${action.type}`);
          success = false;
      }

      await this.page.waitForTimeout(1000);

    } catch (err) {
      error = err.message;
      logger.error(`Action failed: ${err.message}`);
      success = false;
    }

    const duration = Date.now() - startTime;

    // Record step in state tracker
    this.stateTracker.recordStep({
      action: action.type,
      target: action.target,
      description: action.description,
      success,
      error,
      duration,
      url: this.page.url()
    });

    // Take screenshot
    await this.takeScreenshot(action);

    // Detect bugs after action
    await this.bugDetector.detectAll();

    return success;
  }

  /**
   * Execute log activity action
   */
  async executeLogActivity(action) {
    // Click activity button
    const clicked = await this.elementDetector.clickElement('button', action.buttonIndex);

    if (!clicked) {
      logger.warning('Failed to click activity button');
      return false;
    }

    await this.page.waitForTimeout(1000);

    // Wait for modal or confirmation
    await this.elementDetector.waitForVueReady();

    // Try to add notes
    try {
      const notesInput = await this.page.locator('textarea, input[placeholder*="note" i]').first();
      if (await notesInput.isVisible({ timeout: 2000 })) {
        await notesInput.fill(`Test note for ${action.target}`);
      }
    } catch (error) {
      // Notes field may not exist or be optional
    }

    // Submit (look for Save/Submit button)
    try {
      const submitButton = await this.page.locator('button:has-text("Save"), button:has-text("Submit"), button:has-text("Log")').first();
      if (await submitButton.isVisible({ timeout: 2000 })) {
        await submitButton.click();
      }
    } catch (error) {
      // May have been logged without modal
    }

    // Wait for Firebase sync
    await this.page.waitForTimeout(CONFIG.timeouts.networkIdle);

    // Mark as logged
    this.stateTracker.logActivity(action.target);

    logger.success(`Logged ${action.target} activity`);
    return true;
  }

  /**
   * Execute log activity with photo upload
   */
  async executeLogActivityWithPhoto(action) {
    // Click activity button
    const clicked = await this.elementDetector.clickElement('button', action.buttonIndex);

    if (!clicked) {
      logger.warning('Failed to click activity button');
      return false;
    }

    await this.page.waitForTimeout(1000);

    // Wait for modal
    await this.elementDetector.waitForVueReady();

    // Upload photo
    try {
      const photoPath = getTestImagePath(action.photoType || 'standard');

      // Find file input
      const fileInputs = await this.elementDetector.findFileInputs();

      if (fileInputs.length > 0) {
        const fileInput = await this.page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(photoPath);

        await this.page.waitForTimeout(1500); // Wait for preview

        logger.info(`Uploaded photo: ${action.photoType}`);
      }
    } catch (error) {
      logger.warning(`Photo upload failed: ${error.message}`);
    }

    // Add notes
    try {
      const notesInput = await this.page.locator('textarea, input[placeholder*="note" i]').first();
      if (await notesInput.isVisible({ timeout: 2000 })) {
        await notesInput.fill(`Test note with photo for ${action.target}`);
      }
    } catch (error) {
      // Notes field optional
    }

    // Submit
    try {
      const submitButton = await this.page.locator('button:has-text("Save"), button:has-text("Submit"), button:has-text("Log")').first();
      if (await submitButton.isVisible({ timeout: 2000 })) {
        await submitButton.click();
      }
    } catch (error) {
      logger.warning('Could not find submit button');
    }

    // Wait for Firebase sync
    await this.page.waitForTimeout(CONFIG.timeouts.networkIdle);

    // Mark as uploaded
    this.stateTracker.uploadPhoto(action.target);
    this.stateTracker.logActivity(action.target);

    // Verify photo persisted
    const photosBugs = await this.bugDetector.detectPhotoUploadIssues(action.target);

    logger.success(`Logged ${action.target} with photo`);
    return true;
  }

  /**
   * Execute click button action
   */
  async executeClickButton(action) {
    const selector = `${action.selector}`;
    const clicked = await this.elementDetector.clickElement(selector, action.index);

    if (clicked) {
      this.stateTracker.clickElement(`${selector}:nth-child(${action.index + 1})`);
      logger.success(`Clicked: ${action.target}`);
      return true;
    }

    logger.warning(`Failed to click: ${action.target}`);
    return false;
  }

  /**
   * Execute fill input action
   */
  async executeFillInput(action) {
    const selector = `${action.selector}`;
    const filled = await this.elementDetector.fillInput(selector, action.value, action.index);

    if (filled) {
      this.stateTracker.fillInput(`${selector}:nth-child(${action.index + 1})`, action.value);
      logger.success(`Filled "${action.target}" with: ${action.value.substring(0, 30)}`);
      return true;
    }

    logger.warning(`Failed to fill: ${action.target}`);
    return false;
  }

  /**
   * Take screenshot after action
   */
  async takeScreenshot(action) {
    try {
      const stepNumber = this.stateTracker.currentStep + 1;
      const filename = `step-${stepNumber}-${action.type}-${action.target.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30)}.png`;
      const path = `screenshots/${filename}`;

      await this.page.screenshot({ path, fullPage: false });
    } catch (error) {
      logger.warning(`Screenshot failed: ${error.message}`);
    }
  }
}

export default ActionSelector;
