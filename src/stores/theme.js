/**
 * Theme Store - Centralized Dark Mode Management
 * Manages theme state, persistence, and system preference detection
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const darkMode = ref(false)
  const themePreference = ref('system') // 'light', 'dark', 'system'

  // Store cleanup function for system theme watcher
  let systemThemeCleanup = null

  /**
   * Initialize theme from localStorage or system preference
   */
  function initializeTheme() {
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem('theme-preference')

    if (savedPreference) {
      themePreference.value = savedPreference
    }

    // Apply theme based on preference
    applyTheme()

    // Watch for system theme changes if using system preference
    if (themePreference.value === 'system') {
      watchSystemTheme()
    }
  }

  /**
   * Apply the current theme to the document
   */
  function applyTheme() {
    if (themePreference.value === 'system') {
      // Use system preference
      darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      // Use explicit preference
      darkMode.value = themePreference.value === 'dark'
    }

    // Update DOM
    updateDOMTheme()
  }

  /**
   * Update the DOM with the current theme
   */
  function updateDOMTheme() {
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  /**
   * Watch for system theme changes
   */
  function watchSystemTheme() {
    // Clean up existing watcher first
    if (systemThemeCleanup) {
      systemThemeCleanup()
      systemThemeCleanup = null
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e) => {
      if (themePreference.value === 'system') {
        darkMode.value = e.matches
        updateDOMTheme()
      }
    }

    mediaQuery.addEventListener('change', handler)

    // Store cleanup function
    systemThemeCleanup = () => mediaQuery.removeEventListener('change', handler)

    // Return cleanup function for backwards compatibility
    return systemThemeCleanup
  }

  /**
   * Set theme preference
   * @param {'light' | 'dark' | 'system'} preference
   */
  function setThemePreference(preference) {
    themePreference.value = preference
    localStorage.setItem('theme-preference', preference)
    applyTheme()

    // Clean up existing system theme watcher if switching away from 'system'
    if (preference !== 'system' && systemThemeCleanup) {
      systemThemeCleanup()
      systemThemeCleanup = null
    }

    // Re-watch system theme if needed
    if (preference === 'system') {
      watchSystemTheme()
    }
  }

  /**
   * Toggle dark mode (sets explicit preference)
   */
  function toggleDarkMode() {
    const newPreference = darkMode.value ? 'light' : 'dark'
    setThemePreference(newPreference)
  }

  /**
   * Check if currently using dark mode
   */
  function isDarkMode() {
    return darkMode.value
  }

  /**
   * Check if using system theme preference
   */
  function isSystemPreference() {
    return themePreference.value === 'system'
  }

  // Watch for theme changes to update DOM
  watch(darkMode, () => {
    updateDOMTheme()
  })

  return {
    // State
    darkMode,
    themePreference,

    // Actions
    initializeTheme,
    setThemePreference,
    toggleDarkMode,
    isDarkMode,
    isSystemPreference
  }
})
