/**
 * Utility functions for app navigation and exit on mobile devices
 */

/**
 * Attempts to close/exit the PWA app on mobile devices
 * Different browsers handle this differently:
 * - Some support window.close()
 * - Others need to navigate away or show instructions
 */
export const exitApp = () => {
  // Check if running as standalone PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone
    || document.referrer.includes('android-app://');

  if (isStandalone) {
    // Try to close the window (works on some browsers)
    if (window.close) {
      window.close();
    }

    // If close didn't work, navigate to about:blank (minimizes on some devices)
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 100);
  } else {
    // If running in browser, just close the tab/window
    window.close();

    // Fallback: go back if close didn't work
    setTimeout(() => {
      if (window.history.length > 1) {
        window.history.back();
      }
    }, 100);
  }
};

/**
 * Navigate to home screen by navigating to root
 */
export const goToHomeScreen = () => {
  window.location.href = '/';
};

/**
 * Minimize app (platform specific)
 */
export const minimizeApp = () => {
  // On mobile PWA, this will typically minimize the app
  if ('blur' in window) {
    window.blur();
  }
};
