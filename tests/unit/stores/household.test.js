import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHouseholdStore } from '@/stores/household'
import { get, set } from 'firebase/database'

// Mock Firebase database functions
vi.mock('firebase/database', () => ({
  ref: vi.fn(() => ({})),
  set: vi.fn(() => Promise.resolve()),
  get: vi.fn(() => Promise.resolve({ exists: () => false, val: () => null })),
  onValue: vi.fn(() => () => {}),
  update: vi.fn(() => Promise.resolve()),
  remove: vi.fn(() => Promise.resolve()),
  off: vi.fn()
}))

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve())
}))

// Mock analytics
vi.mock('@/composables/useAnalytics', () => ({
  useAnalytics: () => ({
    trackHouseholdAction: vi.fn(),
    setAnalyticsUserId: vi.fn(),
    setAnalyticsUserProperties: vi.fn()
  })
}))

describe('Household Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('State Management', () => {
    it('initializes with default state', () => {
      const store = useHouseholdStore()

      expect(store.householdId).toBeNull()
      expect(store.householdCode).toBeNull()
      expect(store.householdName).toBe('')
      expect(store.memberName).toBe('')
      expect(store.members).toEqual([])
      expect(store.isAuthenticated).toBe(false)
    })

    it('loads state from localStorage', () => {
      localStorage.setItem('householdId', 'TEST123')
      localStorage.setItem('memberName', 'Tara')

      const store = useHouseholdStore()

      expect(store.householdId).toBe('TEST123')
      expect(store.memberName).toBe('Tara')
    })
  })

  describe('Computed Properties', () => {
    it('computes isAuthenticated correctly', () => {
      const store = useHouseholdStore()

      expect(store.isAuthenticated).toBe(false)

      store.householdId = 'TEST123'
      expect(store.isAuthenticated).toBe(false)

      store.memberName = 'Tara'
      expect(store.isAuthenticated).toBe(true)
    })

    it('computes isOwner correctly', () => {
      const store = useHouseholdStore()

      store.memberName = 'Tara'
      expect(store.isOwner).toBe(false)

      store.memberPermissions = {
        Tara: { role: 'owner' }
      }
      expect(store.isOwner).toBe(true)

      store.memberPermissions = {
        Tara: { role: 'member' }
      }
      expect(store.isOwner).toBe(false)
    })
  })

  describe('Logout', () => {
    it('clears state and localStorage on logout', () => {
      const store = useHouseholdStore()

      // Set up initial state
      store.householdId = 'TEST123'
      store.householdCode = 'TEST123'
      store.memberName = 'Tara'
      localStorage.setItem('householdId', 'TEST123')
      localStorage.setItem('memberName', 'Tara')

      // Logout
      store.logout()

      // Verify state is cleared
      expect(store.householdId).toBeNull()
      expect(store.householdCode).toBeNull()
      expect(store.memberName).toBe('')
      expect(localStorage.getItem('householdId')).toBeNull()
      expect(localStorage.getItem('memberName')).toBeNull()
    })
  })

  describe('Create Household', () => {
    it('rejects invalid household code (too short)', async () => {
      const store = useHouseholdStore()

      await expect(
        store.createHousehold('AB', '1234', 'Tara')
      ).rejects.toThrow('4-20 characters')
    })

    it('rejects invalid household code (special chars)', async () => {
      const store = useHouseholdStore()

      await expect(
        store.createHousehold('test@home', '1234', 'Tara')
      ).rejects.toThrow('letters, numbers, and hyphens')
    })

    it('rejects invalid passcode (too short)', async () => {
      const store = useHouseholdStore()

      await expect(
        store.createHousehold('TEST123', '123', 'Tara')
      ).rejects.toThrow('at least 4 characters')
    })

    it('rejects invalid member name (special chars)', async () => {
      const store = useHouseholdStore()

      await expect(
        store.createHousehold('TEST123', '1234', 'User@Home')
      ).rejects.toThrow('letters, numbers, and spaces')
    })

    it('rejects duplicate household code', async () => {
      const store = useHouseholdStore()

      // Mock household already exists
      get.mockResolvedValueOnce({ exists: () => true })

      await expect(
        store.createHousehold('TEST123', '1234', 'Tara')
      ).rejects.toThrow('already exists')
    })
  })

  describe('Member Selection', () => {
    it('allows switching between members', () => {
      const store = useHouseholdStore()

      store.members = [
        { name: 'Tara', role: 'owner' },
        { name: 'Meag', role: 'member' }
      ]

      store.selectMember('Meag')
      expect(store.currentMember).toBe('Meag')
      expect(localStorage.getItem('currentMember')).toBe('Meag')

      store.selectMember('Tara')
      expect(store.currentMember).toBe('Tara')
    })
  })
})
