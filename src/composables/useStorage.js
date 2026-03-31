/**
 * Safe localStorage wrapper with error handling
 * Handles QuotaExceededError, SecurityError, and storage unavailability
 */

import { useToast } from './useToast'

const { error: showError, warning: showWarning } = useToast()

/**
 * Check if localStorage is available
 */
function isStorageAvailable() {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or error occurs
 * @returns {string|null} Value from storage or default
 */
export function getStorageItem(key, defaultValue = null) {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available')
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    return item !== null ? item : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error)
    return defaultValue
  }
}

/**
 * Safely set item in localStorage
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} Success status
 */
export function setStorageItem(key, value) {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available')
    showWarning('Local storage is disabled. Settings will not persist.')
    return false
  }

  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded')
      showError('Storage full. Please clear some data.')

      // Attempt to clear old data
      clearOldData()
    } else {
      console.error(`Error writing to localStorage (key: ${key}):`, error)
      showError('Failed to save data locally.')
    }
    return false
  }
}

/**
 * Safely remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function removeStorageItem(key) {
  if (!isStorageAvailable()) {
    return false
  }

  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error)
    return false
  }
}

/**
 * Get and parse JSON from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
export function getStorageJSON(key, defaultValue = null) {
  const item = getStorageItem(key)
  if (!item) return defaultValue

  try {
    return JSON.parse(item)
  } catch (error) {
    console.error(`Error parsing JSON from localStorage (key: ${key}):`, error)
    // Clear corrupted data
    removeStorageItem(key)
    return defaultValue
  }
}

/**
 * Set JSON in localStorage (stringifies automatically)
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON.stringified)
 * @returns {boolean} Success status
 */
export function setStorageJSON(key, value) {
  try {
    const jsonString = JSON.stringify(value)
    return setStorageItem(key, jsonString)
  } catch (error) {
    console.error(`Error stringifying JSON for localStorage (key: ${key}):`, error)
    showError('Failed to save data (serialization error).')
    return false
  }
}

/**
 * Clear old/stale data from localStorage to free up space
 * Strategy: Remove items with timestamps older than 30 days
 */
function clearOldData() {
  if (!isStorageAvailable()) return

  try {
    // Get all keys
    const keys = Object.keys(localStorage)

    // Keys that are safe to clear (non-critical)
    const clearableKeys = keys.filter(key =>
      key.startsWith('cache_') ||
      key.startsWith('temp_') ||
      key.startsWith('analytics_')
    )

    // Clear them
    clearableKeys.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        // Ignore individual failures
      }
    })

    console.log(`Cleared ${clearableKeys.length} old items from localStorage`)
  } catch (error) {
    console.error('Error clearing old data from localStorage:', error)
  }
}

/**
 * Get storage usage stats (approximation)
 * @returns {Object} Storage stats
 */
export function getStorageStats() {
  if (!isStorageAvailable()) {
    return { used: 0, available: 0, percentage: 0 }
  }

  try {
    let used = 0
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage[key].length + key.length
      }
    }

    // Most browsers allow ~5-10MB, we'll estimate 5MB
    const available = 5 * 1024 * 1024 // 5MB in bytes
    const percentage = (used / available) * 100

    return {
      used: Math.round(used / 1024), // KB
      available: Math.round(available / 1024), // KB
      percentage: Math.round(percentage)
    }
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return { used: 0, available: 0, percentage: 0 }
  }
}

/**
 * Vue composable for reactive storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value
 * @returns {Object} Reactive storage ref and methods
 */
export function useStorage(key, defaultValue = null) {
  const { ref, watch } = require('vue')

  const value = ref(getStorageJSON(key, defaultValue))

  // Watch for changes and sync to localStorage
  watch(value, (newValue) => {
    if (newValue === null) {
      removeStorageItem(key)
    } else {
      setStorageJSON(key, newValue)
    }
  }, { deep: true })

  return {
    value,
    remove: () => {
      removeStorageItem(key)
      value.value = defaultValue
    }
  }
}
