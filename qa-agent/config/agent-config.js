/**
 * Configuration for autonomous QA agent
 */
export const CONFIG = {
  // Base URL of deployed application
  baseUrl: 'https://pet-app-five-chi.vercel.app',

  // Maximum exploration steps
  maxSteps: 20,

  // Device emulation (iPhone 12)
  device: {
    name: 'iPhone 12',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  },

  // Timeout values (milliseconds)
  timeouts: {
    action: 5000,           // Max time per action
    navigation: 10000,      // Page navigation
    networkIdle: 2000,      // Wait for Firebase sync
    elementWait: 3000       // Wait for element to appear
  },

  // Test household credentials
  testHousehold: {
    prefix: 'QA',
    passcode: '123456',
    memberName: 'QA-Agent',
    petName: 'TestPet',
    petSpecies: 'Dog',
    petEmoji: '🐕'
  },

  // Adversarial input templates
  adversarialInputs: {
    empty: '',
    whitespace: '   ',
    xss: '<script>alert(1)</script>',
    xssImg: '<img src=x onerror=alert(1)>',
    longString: 'A'.repeat(1000),
    emojiSpam: '😀'.repeat(100),
    specialChars: '\n\r\t\0\\\'\"',
    sqlInjection: '\' OR 1=1 --',
    nullByte: 'test\0test',
    unicode: '🔥💩🚀✨🎉',
    negativeNumber: '-1',
    largeNumber: '999999999999',
    invalidChars: '<>{}[]|\\^`',
    htmlEntities: '&lt;&gt;&amp;',
    pathTraversal: '../../../etc/passwd'
  },

  // Activity types to test
  activityTypes: [
    { type: 'Poop', emoji: '💩' },
    { type: 'Pee', emoji: '💧' },
    { type: 'Food', emoji: '🍖' },
    { type: 'Sleep', emoji: '😴' },
    { type: 'Meds', emoji: '💊' },
    { type: 'Walk', emoji: '🚶' }
  ],

  // Medical activity types
  medicalTypes: [
    { type: 'Vet Visit', emoji: '🏥' },
    { type: 'Vaccination', emoji: '💉' },
    { type: 'Weight Check', emoji: '⚖️' }
  ],

  // Bug detection thresholds
  bugThresholds: {
    minTapTargetSize: 44,       // Minimum button size (px)
    maxPageLoadTime: 5000,      // Max load time (ms)
    maxConsoleErrors: 0,        // Allowed console errors
    maxLayoutShift: 0.1         // CLS threshold
  },

  // Known validation error keywords (NOT bugs)
  validationKeywords: [
    'required',
    'invalid',
    'must be',
    'cannot be',
    'should be',
    'please enter',
    'please provide',
    'choose',
    'select',
    'fill in'
  ],

  // Console warnings to ignore (not bugs)
  ignoredWarnings: [
    'Download the Vue Devtools',
    'DevTools',
    '[Vue warn]',
    'Deprecation warning',
    'Feature flag'
  ],

  // Headless mode
  headless: process.env.HEADLESS !== 'false'
};

export default CONFIG;
