/**
 * UI Constants
 * Centralized constants for UI behavior, thresholds, and timing
 */

// Swipe gesture thresholds (px)
export const SWIPE_THRESHOLDS = {
  REVEAL: -80,     // Distance to reveal action buttons
  DELETE: -120,    // Distance to trigger auto-delete
  VERTICAL_CANCEL: 10  // Vertical movement to cancel swipe
}

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MAX_FILE_SIZE_MB: 5,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}

// Form input limits
export const INPUT_LIMITS = {
  NOTES_MAX_LENGTH: 200,
  MEDICAL_NOTES_MAX_LENGTH: 500,
  VET_NOTES_MAX_LENGTH: 500,
  VACCINATION_NOTES_MAX_LENGTH: 300,
  PET_NAME_MAX_LENGTH: 50,
  MEMBER_NAME_MAX_LENGTH: 50
}

// Toast notification durations (ms)
export const TOAST_DURATIONS = {
  SUCCESS: 4000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
  DEFAULT: 4000
}

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  TOAST_ENTER: 300,
  TOAST_EXIT: 200,
  MODAL_ENTER: 200,
  MODAL_EXIT: 150,
  SWIPE: 200,
  RIPPLE: 600
}

// Lazy loading timeouts (ms)
export const LAZY_LOAD_TIMEOUT = 10000

// Spacing constants (Tailwind classes)
export const SPACING = {
  CARD_PADDING: 'p-6',
  CARD_PADDING_MOBILE: 'p-4',
  SECTION_GAP: 'gap-4',
  BUTTON_GAP: 'gap-2',
  GRID_GAP: 'gap-3'
}

// Validation rules
export const VALIDATION = {
  MIN_WEIGHT: 0.1,
  MAX_WEIGHT: 999.9,
  MIN_COST: 0,
  MAX_COST: 99999.99
}
