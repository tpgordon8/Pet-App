/**
 * Password Hashing Utility
 * Uses bcrypt for secure password hashing
 *
 * IMPORTANT: This is client-side hashing for household passcodes.
 * For production authentication, use Firebase Auth or similar.
 */

import bcrypt from 'bcryptjs'

// Salt rounds for bcrypt (10 = ~100ms, good balance of security and performance)
const SALT_ROUNDS = 10

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  if (!password) {
    throw new Error('Password is required')
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hash = await bcrypt.hash(password, salt)
    return hash
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) {
    return false
  }

  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Check if a string is a bcrypt hash
 * @param {string} str - String to check
 * @returns {boolean} True if string looks like a bcrypt hash
 */
export function isBcryptHash(str) {
  // Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(str)
}

/**
 * Migrate plain text password to hashed password
 * Use this for gradual migration of existing passcodes
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function migrateToHash(password) {
  // If already hashed, return as-is
  if (isBcryptHash(password)) {
    return password
  }

  // Otherwise, hash it
  return await hashPassword(password)
}
