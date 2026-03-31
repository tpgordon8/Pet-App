/**
 * Icon Management Composable
 * Provides centralized icon configuration and utilities
 */

/**
 * Activity type to icon mapping
 * Maps activity types to their icon names and emojis
 */
export const activityIcons = {
  // Regular activities
  Poop: { icon: 'poop', emoji: '💩', color: 'orange' },
  Pee: { icon: 'pee', emoji: '💧', color: 'blue' },
  Food: { icon: 'food', emoji: '🍖', color: 'pink' },
  Sleep: { icon: 'sleep', emoji: '😴', color: 'purple' },
  Meds: { icon: 'meds', emoji: '💊', color: 'danger' },
  Walk: { icon: 'walk', emoji: '🚶', color: 'teal' },

  // Medical activities
  'Vet Visit': { icon: 'vet', emoji: '🏥', color: 'danger' },
  Vaccination: { icon: 'meds', emoji: '💉', color: 'warning' },
  'Weight Check': { icon: 'trending-up', emoji: '⚖️', color: 'success' }
}

/**
 * UI icon mapping
 * Common UI icons used throughout the app
 */
export const uiIcons = {
  plus: { icon: 'plus', emoji: '➕' },
  close: { icon: 'close', emoji: '✕' },
  check: { icon: 'check', emoji: '✓' },
  search: { icon: 'search', emoji: '🔍' },
  edit: { icon: 'edit', emoji: '✏️' },
  delete: { icon: 'delete', emoji: '🗑️' },
  settings: { icon: 'settings', emoji: '⚙️' },
  calendar: { icon: 'calendar', emoji: '📅' },
  photo: { icon: 'photo', emoji: '📸' },
  trendingUp: { icon: 'trending-up', emoji: '📈' },
  trendingDown: { icon: 'trending-down', emoji: '📉' },
  chevronUp: { icon: 'chevron-up', emoji: '⌃' },
  chevronDown: { icon: 'chevron-down', emoji: '⌄' },
  chevronLeft: { icon: 'chevron-left', emoji: '‹' },
  chevronRight: { icon: 'chevron-right', emoji: '›' }
}

/**
 * Pet species to icon mapping
 */
export const petIcons = {
  Dog: { emoji: '🐕', color: 'orange', theme: 'theme-dog' },
  Cat: { emoji: '🐈', color: 'purple', theme: 'theme-cat' },
  Rabbit: { emoji: '🐰', color: 'pink', theme: 'theme-rabbit' },
  Bird: { emoji: '🐦', color: 'blue', theme: 'theme-bird' },
  Fish: { emoji: '🐠', color: 'teal', theme: 'theme-fish' },
  Hamster: { emoji: '🐹', color: 'orange', theme: 'theme-default' },
  Guinea_Pig: { emoji: '🐹', color: 'orange', theme: 'theme-default' },
  Turtle: { emoji: '🐢', color: 'sage', theme: 'theme-default' },
  Snake: { emoji: '🐍', color: 'sage', theme: 'theme-default' },
  Other: { emoji: '🐾', color: 'sage', theme: 'theme-default' }
}

/**
 * Status icons for various states
 */
export const statusIcons = {
  success: { icon: 'check', emoji: '✓', color: 'success' },
  error: { icon: 'close', emoji: '✕', color: 'danger' },
  warning: { icon: 'warning', emoji: '⚠️', color: 'warning' },
  info: { icon: 'info', emoji: 'ℹ️', color: 'info' },
  loading: { emoji: '⟳', color: 'sage' }
}

/**
 * Get icon configuration for an activity type
 * @param {string} activityType - Activity type name
 * @returns {object} Icon configuration
 */
export function getActivityIcon(activityType) {
  return activityIcons[activityType] || { icon: '', emoji: '🐾', color: 'sage' }
}

/**
 * Get icon configuration for a UI element
 * @param {string} iconName - UI icon name
 * @returns {object} Icon configuration
 */
export function getUiIcon(iconName) {
  return uiIcons[iconName] || { icon: '', emoji: '•' }
}

/**
 * Get icon configuration for a pet species
 * @param {string} species - Pet species
 * @returns {object} Icon configuration
 */
export function getPetIcon(species) {
  return petIcons[species] || petIcons.Other
}

/**
 * Get icon configuration for a status
 * @param {string} status - Status type
 * @returns {object} Icon configuration
 */
export function getStatusIcon(status) {
  return statusIcons[status] || statusIcons.info
}

/**
 * Icon utilities composable
 * Main composable for working with icons
 */
export function useIcons() {
  return {
    // Icon mappings
    activityIcons,
    uiIcons,
    petIcons,
    statusIcons,

    // Helper functions
    getActivityIcon,
    getUiIcon,
    getPetIcon,
    getStatusIcon
  }
}
