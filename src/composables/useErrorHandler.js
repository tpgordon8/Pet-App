/**
 * Error Handling Composable
 * Centralized error handling with user-friendly messages
 */

import { useToast } from './useToast'

/**
 * Error messages for different error types
 */
const ERROR_MESSAGES = {
  // Network errors
  'Failed to fetch': 'Network error. Please check your connection.',
  'NetworkError': 'Network error. Please check your connection.',
  'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',

  // Firebase errors
  'PERMISSION_DENIED': 'Permission denied. Please sign in again.',
  'permission-denied': 'Permission denied. Please sign in again.',
  'auth/user-not-found': 'User not found. Please sign in.',
  'auth/invalid-credential': 'Invalid credentials. Please try again.',

  // Upload errors
  'storage/unauthorized': 'Not authorized to upload files.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  'storage/object-not-found': 'File not found.',
  'FILE_TOO_LARGE': 'File size exceeds 5MB limit.',
  'INVALID_FILE_TYPE': 'Invalid file type. Please upload an image.',

  // Validation errors
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'MISSING_REQUIRED_FIELD': 'Please fill in all required fields.',
  'INVALID_INPUT': 'Invalid input. Please check your data.',

  // Activity errors
  'NO_PET_SELECTED': 'Please select a specific pet first.',
  'NO_MEMBER_SELECTED': 'Please select who is logging this activity.',
  'NOT_SIGNED_IN': 'Please sign in first.',

  // Default
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
}

/**
 * Get user-friendly error message
 * @param {Error|string} error - Error object or error message
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  // Handle string errors
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message

    // Check for known error patterns
    for (const [pattern, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
      if (message.includes(pattern)) {
        return friendlyMessage
      }
    }

    // Check for Firebase error codes
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code]
    }

    // Return original message if it's user-friendly
    if (message && message.length < 100 && !message.includes('Error:')) {
      return message
    }
  }

  // Default fallback
  return ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Handle async operation with error handling and toast notifications
 * @param {Function} operation - Async operation to execute
 * @param {Object} options - Options for error handling
 * @returns {Promise<{success: boolean, data?: any, error?: Error}>}
 */
export async function handleAsyncOperation(operation, options = {}) {
  const {
    successMessage = null,
    errorMessage = null,
    showSuccessToast = true,
    showErrorToast = true,
    onSuccess = null,
    onError = null
  } = options

  const toast = useToast()

  try {
    const result = await operation()

    if (showSuccessToast && successMessage) {
      toast.success(successMessage)
    }

    if (onSuccess) {
      onSuccess(result)
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Operation failed:', error)

    const friendlyMessage = errorMessage || getErrorMessage(error)

    if (showErrorToast) {
      toast.error(friendlyMessage)
    }

    if (onError) {
      onError(error)
    }

    return { success: false, error }
  }
}

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @throws {Error} Validation error
 */
export function validateFileUpload(file, options = {}) {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options

  if (!file) {
    throw new Error('MISSING_REQUIRED_FIELD')
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    throw new Error('FILE_TOO_LARGE')
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error('INVALID_FILE_TYPE')
  }

  return true
}

/**
 * Validate form input
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @throws {Error} Validation error with details
 */
export function validateFormInput(data, rules) {
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]

    // Required field check
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      throw new Error(`${rule.label || field} is required`)
    }

    // Min length check
    if (rule.minLength && value && value.length < rule.minLength) {
      throw new Error(`${rule.label || field} must be at least ${rule.minLength} characters`)
    }

    // Max length check
    if (rule.maxLength && value && value.length > rule.maxLength) {
      throw new Error(`${rule.label || field} must not exceed ${rule.maxLength} characters`)
    }

    // Min value check (for numbers)
    if (rule.min !== undefined && value < rule.min) {
      throw new Error(`${rule.label || field} must be at least ${rule.min}`)
    }

    // Max value check (for numbers)
    if (rule.max !== undefined && value > rule.max) {
      throw new Error(`${rule.label || field} must not exceed ${rule.max}`)
    }

    // Custom validation function
    if (rule.validate && !rule.validate(value)) {
      throw new Error(rule.message || `Invalid ${rule.label || field}`)
    }
  }

  return true
}

/**
 * Use error handler composable
 * @returns {Object} Error handling utilities
 */
export function useErrorHandler() {
  return {
    getErrorMessage,
    handleAsyncOperation,
    validateFileUpload,
    validateFormInput
  }
}
