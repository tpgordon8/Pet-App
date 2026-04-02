import CONFIG from '../config/agent-config.js';

/**
 * Smart element detection with Vue-aware strategies
 */
export class ElementDetector {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for Vue app to be ready
   */
  async waitForVueReady() {
    try {
      await this.page.waitForFunction(() => {
        const app = document.getElementById('app');
        return app && app.innerHTML.length > 100 && !document.querySelector('.loading');
      }, { timeout: CONFIG.timeouts.elementWait });
    } catch (error) {
      // Continue even if Vue check fails
    }
  }

  /**
   * Find all interactive buttons on the page
   */
  async findButtons() {
    await this.waitForVueReady();

    const buttons = await this.page.evaluate(() => {
      const elements = [];

      // Find all buttons and button-like elements
      const selectors = [
        'button:not([disabled])',
        '[role="button"]:not([disabled])',
        'a.btn',
        '.button:not([disabled])'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            elements.push({
              text: el.textContent?.trim() || el.getAttribute('aria-label') || '',
              selector: selector,
              index: index,
              className: el.className,
              id: el.id,
              visible: rect.width > 0 && rect.height > 0,
              position: { x: rect.x, y: rect.y },
              size: { width: rect.width, height: rect.height }
            });
          }
        });
      });

      return elements;
    });

    return buttons;
  }

  /**
   * Find all input fields
   */
  async findInputs() {
    await this.waitForVueReady();

    const inputs = await this.page.evaluate(() => {
      const elements = [];

      const selectors = [
        'input:not([type="hidden"]):not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          elements.push({
            type: el.type || el.tagName.toLowerCase(),
            name: el.name || '',
            id: el.id || '',
            placeholder: el.placeholder || '',
            selector: selector,
            index: index,
            required: el.required,
            visible: rect.width > 0 && rect.height > 0
          });
        });
      });

      return elements;
    });

    return inputs;
  }

  /**
   * Find activity logging buttons (specific to Pet-App)
   */
  async findActivityButtons() {
    await this.waitForVueReady();

    const activityButtons = await this.page.evaluate(() => {
      const buttons = [];

      // Look for activity buttons with emojis
      const activityEmojis = ['💩', '💧', '🍖', '😴', '💊', '🚶'];

      document.querySelectorAll('button').forEach((btn, index) => {
        const text = btn.textContent || '';
        const hasActivityEmoji = activityEmojis.some(emoji => text.includes(emoji));

        if (hasActivityEmoji) {
          const rect = btn.getBoundingClientRect();
          buttons.push({
            text: text.trim(),
            index: index,
            visible: rect.width > 0 && rect.height > 0,
            className: btn.className
          });
        }
      });

      return buttons;
    });

    return activityButtons;
  }

  /**
   * Find file upload inputs
   */
  async findFileInputs() {
    const fileInputs = await this.page.evaluate(() => {
      const inputs = [];

      document.querySelectorAll('input[type="file"]').forEach((el, index) => {
        inputs.push({
          id: el.id || '',
          name: el.name || '',
          accept: el.accept || '',
          index: index
        });
      });

      return inputs;
    });

    return fileInputs;
  }

  /**
   * Detect error messages on the page
   */
  async detectErrors() {
    const errors = await this.page.evaluate((validationKeywords) => {
      const errorElements = [];

      // Look for elements with error-related classes or roles
      const errorSelectors = [
        '.error',
        '.alert-error',
        '[role="alert"]',
        '.danger',
        '.warning',
        '.toast-error'
      ];

      errorSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent?.trim() || '';
          if (text) {
            // Check if it's a validation error (expected) or unexpected error (bug)
            const isValidationError = validationKeywords.some(keyword =>
              text.toLowerCase().includes(keyword.toLowerCase())
            );

            errorElements.push({
              text: text,
              selector: selector,
              className: el.className,
              isValidationError: isValidationError
            });
          }
        });
      });

      return errorElements;
    }, CONFIG.validationKeywords);

    return errors;
  }

  /**
   * Check for horizontal scroll (mobile UX issue)
   */
  async checkHorizontalScroll() {
    const scrollData = await this.page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });

    return scrollData;
  }

  /**
   * Check for small tap targets (mobile UX issue)
   */
  async checkTapTargets() {
    const smallTargets = await this.page.evaluate((minSize) => {
      const targets = [];

      document.querySelectorAll('button, a, [role="button"]').forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.width < minSize || rect.height < minSize) {
            targets.push({
              element: el.tagName,
              text: el.textContent?.trim() || '',
              size: { width: rect.width, height: rect.height },
              index: index
            });
          }
        }
      });

      return targets;
    }, CONFIG.bugThresholds.minTapTargetSize);

    return smallTargets;
  }

  /**
   * Multi-strategy element click with retries
   */
  async clickElement(selector, index = 0) {
    const strategies = [
      // Strategy 1: Direct selector with index
      async () => {
        const elements = await this.page.$$(selector);
        if (elements[index]) {
          await elements[index].click();
          return true;
        }
        return false;
      },

      // Strategy 2: Text-based
      async () => {
        const element = await this.page.locator(selector).nth(index);
        if (await element.isVisible()) {
          await element.click();
          return true;
        }
        return false;
      },

      // Strategy 3: Force click (for stubborn elements)
      async () => {
        await this.page.click(selector, { force: true });
        return true;
      }
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        const success = await strategies[i]();
        if (success) {
          return true;
        }
      } catch (error) {
        if (i === strategies.length - 1) {
          throw error;
        }
        await this.page.waitForTimeout(500);
      }
    }

    return false;
  }

  /**
   * Fill input with retry logic
   */
  async fillInput(selector, value, index = 0) {
    try {
      const elements = await this.page.$$(selector);
      if (elements[index]) {
        await elements[index].fill(value);
        return true;
      }
      return false;
    } catch (error) {
      // Retry with locator
      try {
        await this.page.locator(selector).nth(index).fill(value);
        return true;
      } catch (retryError) {
        return false;
      }
    }
  }
}

export default ElementDetector;
