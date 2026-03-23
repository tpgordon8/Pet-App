/**
 * Activity Types and Configurations
 * Centralized constants for all activity types in Tailr
 */

// Activity type categories
export const ACTIVITY_CATEGORIES = {
  REGULAR: 'regular',
  MEDICAL: 'medical'
}

// Regular activity types
export const REGULAR_ACTIVITIES = {
  POOP: 'Poop',
  PEE: 'Pee',
  FOOD: 'Food',
  SLEEP: 'Sleep',
  MEDS: 'Meds',
  WALK: 'Walk'
}

// Medical activity types
export const MEDICAL_ACTIVITIES = {
  VET_VISIT: 'Vet Visit',
  VACCINATION: 'Vaccination',
  WEIGHT_CHECK: 'Weight Check'
}

// All activity types combined
export const ALL_ACTIVITY_TYPES = {
  ...REGULAR_ACTIVITIES,
  ...MEDICAL_ACTIVITIES
}

// Activity type to emoji mapping
export const ACTIVITY_EMOJIS = {
  [REGULAR_ACTIVITIES.POOP]: '💩',
  [REGULAR_ACTIVITIES.PEE]: '💧',
  [REGULAR_ACTIVITIES.FOOD]: '🍖',
  [REGULAR_ACTIVITIES.SLEEP]: '😴',
  [REGULAR_ACTIVITIES.MEDS]: '💊',
  [REGULAR_ACTIVITIES.WALK]: '🚶',
  [MEDICAL_ACTIVITIES.VET_VISIT]: '🏥',
  [MEDICAL_ACTIVITIES.VACCINATION]: '💉',
  [MEDICAL_ACTIVITIES.WEIGHT_CHECK]: '⚖️'
}

// Check if activity type is medical
export function isMedicalActivity(type) {
  return Object.values(MEDICAL_ACTIVITIES).includes(type)
}

// Check if activity type is editable (regular activities only)
export function isEditableActivity(type) {
  return Object.values(REGULAR_ACTIVITIES).includes(type)
}

// Get emoji for activity type
export function getActivityEmoji(type) {
  return ACTIVITY_EMOJIS[type] || '📝'
}

// Get all regular activity types as array
export function getRegularActivityTypes() {
  return Object.values(REGULAR_ACTIVITIES)
}

// Get all medical activity types as array
export function getMedicalActivityTypes() {
  return Object.values(MEDICAL_ACTIVITIES)
}

// Get all activity types as array
export function getAllActivityTypes() {
  return Object.values(ALL_ACTIVITY_TYPES)
}
