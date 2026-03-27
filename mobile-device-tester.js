/**
 * Mobile Device Testing Suite for Tailr
 * Uses manually downloaded Chromium binary to bypass network restrictions
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

// Device configurations
const DEVICES = [
  {
    name: 'iPhone SE',
    viewport: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'iPhone 12 Pro',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    name: 'Pixel 5',
    viewport: { width: 393, height: 851, deviceScaleFactor: 2.75, isMobile: true },
    userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36'
  },
  {
    name: 'iPad',
    viewport: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  }
];

const CHROMIUM_PATH = '/tmp/chromium/chromium';
const APP_URL = 'http://localhost:3001';
const SCREENSHOTS_DIR = '/tmp/mobile_screenshots';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

class MobileDeviceTester {
  constructor() {
    this.browser = null;
    this.results = [];
  }

  async initialize() {
    console.log('🚀 Initializing Chromium...\n');

    this.browser = await puppeteer.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer'
      ]
    });

    console.log('✅ Chromium launched successfully!\n');
  }

  async testDevice(device) {
    console.log(`${'='.repeat(60)}`);
    console.log(`📱 Testing on ${device.name}`);
    console.log(`${'='.repeat(60)}\n`);

    const page = await this.browser.newPage();
    const issues = [];

    try {
      // Set viewport and user agent
      await page.setViewport(device.viewport);
      await page.setUserAgent(device.userAgent);

      // Navigate to app
      console.log(`🌐 Loading ${APP_URL}...`);
      await page.goto(APP_URL, {
        waitUntil: 'networkidle0',
        timeout: 15000
      });

      console.log('✅ Page loaded\n');

      // Get page title
      const title = await page.title();
      console.log(`📄 Title: ${title}`);

      // Check 1: Touch target sizes
      console.log('\n🎯 Checking touch targets...');
      const smallTargets = await page.evaluate(() => {
        const MIN_SIZE = 44; // iOS minimum
        const interactiveElements = document.querySelectorAll('button, a, input, select, [role="button"]');
        const tooSmall = [];

        interactiveElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && (rect.width < MIN_SIZE || rect.height < MIN_SIZE)) {
            tooSmall.push({
              tag: el.tagName,
              class: el.className,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: el.textContent?.substring(0, 30)
            });
          }
        });

        return tooSmall;
      });

      if (smallTargets.length > 0) {
        console.log(`⚠️  Found ${smallTargets.length} elements below 44px:`);
        smallTargets.slice(0, 5).forEach(t => {
          console.log(`   - ${t.tag}.${t.class}: ${t.width}x${t.height}px`);
        });
        issues.push(`${smallTargets.length} touch targets below 44px`);
      } else {
        console.log('✅ All touch targets meet iOS guidelines');
      }

      // Check 2: Font sizes
      console.log('\n📝 Checking font sizes...');
      const smallFonts = await page.evaluate(() => {
        const MIN_FONT = 12; // Practical minimum
        const allElements = document.querySelectorAll('*');
        const tooSmall = [];

        allElements.forEach((el) => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const text = el.textContent?.trim();

          if (text && text.length > 0 && fontSize > 0 && fontSize < MIN_FONT) {
            tooSmall.push({
              tag: el.tagName,
              fontSize: Math.round(fontSize),
              text: text.substring(0, 30)
            });
          }
        });

        return tooSmall.slice(0, 10);
      });

      if (smallFonts.length > 0) {
        console.log(`⚠️  Found elements with fonts < 12px:`);
        smallFonts.slice(0, 5).forEach(f => {
          console.log(`   - ${f.tag}: ${f.fontSize}px`);
        });
        issues.push(`${smallFonts.length}+ elements with small fonts`);
      } else {
        console.log('✅ All fonts meet readability standards');
      }

      // Check 3: Horizontal overflow
      console.log('\n📏 Checking for horizontal overflow...');
      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      if (hasOverflow) {
        const overflow = await page.evaluate(() => {
          return document.body.scrollWidth - window.innerWidth;
        });
        console.log(`⚠️  Horizontal overflow detected: +${overflow}px`);
        issues.push(`Horizontal overflow: ${overflow}px`);
      } else {
        console.log('✅ No horizontal overflow');
      }

      // Check 4: Console errors
      console.log('\n🐛 Checking for console errors...');
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Reload to capture console
      await page.reload({ waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (consoleErrors.length > 0) {
        console.log(`⚠️  Found ${consoleErrors.length} console errors:`);
        consoleErrors.slice(0, 3).forEach(err => {
          console.log(`   - ${err.substring(0, 80)}`);
        });
        issues.push(`${consoleErrors.length} console errors`);
      } else {
        console.log('✅ No console errors');
      }

      // Check 5: Interactive elements
      console.log('\n🔘 Checking interactive elements...');
      const interactiveCount = await page.evaluate(() => {
        return {
          buttons: document.querySelectorAll('button').length,
          links: document.querySelectorAll('a').length,
          inputs: document.querySelectorAll('input, select, textarea').length
        };
      });

      console.log(`   Buttons: ${interactiveCount.buttons}`);
      console.log(`   Links: ${interactiveCount.links}`);
      console.log(`   Inputs: ${interactiveCount.inputs}`);

      // Save results
      this.results.push({
        device: device.name,
        viewport: `${device.viewport.width}x${device.viewport.height}`,
        issues: issues,
        passed: issues.length === 0
      });

    } catch (error) {
      console.error(`\n❌ Error testing ${device.name}:`, error.message);
      issues.push(`Fatal error: ${error.message}`);
      this.results.push({
        device: device.name,
        viewport: `${device.viewport.width}x${device.viewport.height}`,
        issues: issues,
        passed: false
      });
    } finally {
      await page.close();
    }

    console.log(`\n${issues.length === 0 ? '✅' : '⚠️ '} ${device.name} testing complete`);
    console.log('');
  }

  async runAllTests() {
    await this.initialize();

    for (const device of DEVICES) {
      await this.testDevice(device);
    }

    await this.browser.close();
    console.log('✅ Browser closed\n');

    this.printSummary();
  }

  printSummary() {
    console.log('='.repeat(60));
    console.log('📊 TESTING SUMMARY');
    console.log('='.repeat(60));
    console.log('');

    let totalIssues = 0;

    this.results.forEach(result => {
      const status = result.passed ? '✅' : '⚠️ ';
      console.log(`${status} ${result.device} (${result.viewport}): ${result.issues.length} issue(s)`);

      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   - ${issue}`);
          totalIssues++;
        });
      }
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(`Total issues found: ${totalIssues}`);
    console.log(`Devices passed: ${this.results.filter(r => r.passed).length}/${this.results.length}`);
    console.log('='.repeat(60));

    // Save JSON report
    const reportPath = path.join(SCREENSHOTS_DIR, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Run tests
const tester = new MobileDeviceTester();
tester.runAllTests().catch(console.error);
