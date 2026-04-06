import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, isBcryptHash, migrateToHash } from './passwordHash'

describe('passwordHash.js', () => {
  // ─── isBcryptHash (sync, fast) ────────────────────────────────────────────────

  describe('isBcryptHash', () => {
    it('returns true for a valid $2a$ hash', () => {
      // Pre-computed hash for testing — never use real passwords in tests
      const validHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      expect(isBcryptHash(validHash)).toBe(true)
    })

    it('returns true for $2b$ hash', () => {
      const hash2b = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      expect(isBcryptHash(hash2b)).toBe(true)
    })

    it('returns true for $2y$ hash', () => {
      const hash2y = '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      expect(isBcryptHash(hash2y)).toBe(true)
    })

    it('returns false for plain text', () => {
      expect(isBcryptHash('mysecretpassword')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isBcryptHash('')).toBe(false)
    })

    it('returns false for null', () => {
      expect(isBcryptHash(null)).toBe(false)
    })

    it('returns false for too-short string starting with $2a$', () => {
      expect(isBcryptHash('$2a$10$short')).toBe(false)
    })

    it('returns false for MD5-style hash', () => {
      expect(isBcryptHash('d41d8cd98f00b204e9800998ecf8427e')).toBe(false)
    })
  })

  // ─── hashPassword ─────────────────────────────────────────────────────────────

  describe('hashPassword', () => {
    it('returns a bcrypt hash for a valid password', async () => {
      const hash = await hashPassword('test-password-123')
      expect(isBcryptHash(hash)).toBe(true)
    }, 15000)

    it('produces different hashes for the same password (salting)', async () => {
      const [hash1, hash2] = await Promise.all([
        hashPassword('same-password'),
        hashPassword('same-password')
      ])
      expect(hash1).not.toBe(hash2)
    }, 15000)

    it('throws when password is empty string', async () => {
      await expect(hashPassword('')).rejects.toThrow()
    })

    it('throws when password is null/undefined', async () => {
      await expect(hashPassword(null)).rejects.toThrow()
      await expect(hashPassword(undefined)).rejects.toThrow()
    })
  })

  // ─── verifyPassword ───────────────────────────────────────────────────────────

  describe('verifyPassword', () => {
    it('returns true when password matches hash', async () => {
      const password = 'correct-horse-battery'
      const hash = await hashPassword(password)
      expect(await verifyPassword(password, hash)).toBe(true)
    }, 15000)

    it('returns false when password does not match hash', async () => {
      const hash = await hashPassword('correct-password')
      expect(await verifyPassword('wrong-password', hash)).toBe(false)
    }, 15000)

    it('returns false when password is null', async () => {
      const hash = await hashPassword('some-password')
      expect(await verifyPassword(null, hash)).toBe(false)
    }, 15000)

    it('returns false when hash is null', async () => {
      expect(await verifyPassword('password', null)).toBe(false)
    })

    it('returns false when both are null', async () => {
      expect(await verifyPassword(null, null)).toBe(false)
    })
  })

  // ─── migrateToHash ────────────────────────────────────────────────────────────

  describe('migrateToHash', () => {
    it('hashes plain text password', async () => {
      const result = await migrateToHash('plain-text-password')
      expect(isBcryptHash(result)).toBe(true)
    }, 15000)

    it('returns already-hashed password unchanged', async () => {
      const original = await hashPassword('already-hashed')
      const result = await migrateToHash(original)
      expect(result).toBe(original)
    }, 15000)

    it('does not double-hash a bcrypt hash', async () => {
      const hash = await hashPassword('password')
      const migrated = await migrateToHash(hash)
      // Should still verify against original password (not re-hashed)
      expect(await verifyPassword('password', migrated)).toBe(true)
    }, 15000)
  })
})
