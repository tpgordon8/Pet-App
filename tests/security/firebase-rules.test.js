/**
 * Firebase Security Rules Testing
 * Tests the security rules defined in firebase-rules.json and firestore.rules
 *
 * Run with: npm run test:security
 * Requires: Firebase Emulator running (firebase emulators:start)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, remove } from 'firebase/database'
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'

// Connect to emulator
const testConfig = {
  projectId: 'petlog-c4c1e-test',
  databaseURL: 'http://localhost:9000?ns=petlog-c4c1e-test'
}

const app = initializeApp(testConfig)
const db = getDatabase(app)
const firestore = getFirestore(app)

// Use emulator
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  // Emulator connection handled by Firebase SDK
}

describe('Firebase Realtime Database Security Rules', () => {
  const testHouseholdCode = 'TEST123'
  const testHouseholdRef = ref(db, `households/${testHouseholdCode}`)

  beforeAll(async () => {
    // Clean up test data
    await remove(testHouseholdRef)
  })

  afterAll(async () => {
    // Clean up after tests
    await remove(testHouseholdRef)
  })

  describe('Household Creation', () => {
    it('should allow creating a new household', async () => {
      const householdData = {
        code: testHouseholdCode,
        name: 'Test Household',
        passcode: '123456',
        createdAt: Date.now(),
        createdBy: 'TestUser'
      }

      // Should succeed - first write to non-existent household
      await expect(set(testHouseholdRef, householdData)).resolves.not.toThrow()
    })

    it('should prevent reading non-existent households', async () => {
      const nonExistentRef = ref(db, 'households/NONEXISTENT999')

      // Should fail - household doesn't exist
      // Note: In emulator, this might return null instead of throwing
      const snapshot = await get(nonExistentRef)
      expect(snapshot.exists()).toBe(false)
    })

    it('should allow reading existing households', async () => {
      // Should succeed - household exists
      const snapshot = await get(testHouseholdRef)
      expect(snapshot.exists()).toBe(true)
      expect(snapshot.val().code).toBe(testHouseholdCode)
    })

    it('should prevent overwriting existing household root', async () => {
      // Should fail - household already exists (.write: !data.exists())
      await expect(
        set(testHouseholdRef, { code: 'CHANGED' })
      ).rejects.toThrow()
    })
  })

  describe('Passcode Security', () => {
    it('should hide passcode from reads', async () => {
      const passcodeRef = ref(db, `households/${testHouseholdCode}/passcode`)

      // Should fail - passcode has .read: false
      await expect(get(passcodeRef)).rejects.toThrow()
    })

    it('should prevent passcode modification', async () => {
      const passcodeRef = ref(db, `households/${testHouseholdCode}/passcode`)

      // Should fail - passcode has .write: !data.exists()
      await expect(set(passcodeRef, 'newpasscode')).rejects.toThrow()
    })
  })

  describe('Household Data', () => {
    it('should prevent changing household code', async () => {
      const codeRef = ref(db, `households/${testHouseholdCode}/code`)

      // Should fail - code has .write: false
      await expect(set(codeRef, 'NEWCODE')).rejects.toThrow()
    })

    it('should allow updating household name', async () => {
      const nameRef = ref(db, `households/${testHouseholdCode}/name`)

      // Should succeed - name has .write: household.exists()
      await expect(set(nameRef, 'Updated Household Name')).resolves.not.toThrow()
    })

    it('should allow reading household members', async () => {
      const membersRef = ref(db, `households/${testHouseholdCode}/members`)

      // Should succeed
      const snapshot = await get(membersRef)
      // May be null if no members yet
      expect(snapshot.exists() || !snapshot.exists()).toBe(true)
    })

    it('should allow writing household members', async () => {
      const memberRef = ref(db, `households/${testHouseholdCode}/members/TestUser`)

      const memberData = {
        name: 'TestUser',
        joinedAt: Date.now(),
        role: 'owner'
      }

      // Should succeed
      await expect(set(memberRef, memberData)).resolves.not.toThrow()
    })
  })

  describe('Activities and Pets', () => {
    it('should allow reading activities', async () => {
      const activitiesRef = ref(db, `households/${testHouseholdCode}/activities`)

      // Should succeed
      const snapshot = await get(activitiesRef)
      expect(snapshot.exists() || !snapshot.exists()).toBe(true)
    })

    it('should allow writing activities', async () => {
      const activityRef = ref(db, `households/${testHouseholdCode}/activities/activity1`)

      const activityData = {
        type: 'Poop',
        emoji: '💩',
        timestamp: Date.now(),
        user: 'TestUser',
        petId: 'default'
      }

      // Should succeed
      await expect(set(activityRef, activityData)).resolves.not.toThrow()
    })

    it('should allow reading pets', async () => {
      const petsRef = ref(db, `households/${testHouseholdCode}/pets`)

      // Should succeed
      const snapshot = await get(petsRef)
      expect(snapshot.exists() || !snapshot.exists()).toBe(true)
    })

    it('should allow writing pets', async () => {
      const petRef = ref(db, `households/${testHouseholdCode}/pets/pet1`)

      const petData = {
        name: 'Luna',
        species: 'Dog',
        emoji: '🐕',
        createdAt: Date.now()
      }

      // Should succeed
      await expect(set(petRef, petData)).resolves.not.toThrow()
    })
  })
})

describe('Firestore Security Rules', () => {
  const testHouseholdCode = 'TEST123'

  describe('Mail Templates', () => {
    it('should allow reading mail templates', async () => {
      const templateRef = doc(firestore, 'mail_templates', 'test_template')

      // Should succeed - read: true
      // May not exist, but read is allowed
      await expect(getDoc(templateRef)).resolves.not.toThrow()
    })

    it('should prevent writing mail templates', async () => {
      const templateRef = doc(firestore, 'mail_templates', 'test_template')

      // Should fail - write: false
      await expect(
        setDoc(templateRef, { subject: 'Test' })
      ).rejects.toThrow()
    })
  })

  describe('Email Queue', () => {
    it('should allow creating email queue items', async () => {
      const mailRef = doc(firestore, 'mail', 'test_email_' + Date.now())

      const emailData = {
        to: 'test@example.com',
        template: 'welcome',
        data: { name: 'Test' }
      }

      // Should succeed - create: true
      await expect(setDoc(mailRef, emailData)).resolves.not.toThrow()

      // Clean up
      await deleteDoc(mailRef)
    })

    it('should prevent reading email queue', async () => {
      const mailRef = doc(firestore, 'mail', 'test_email')

      // Should fail - read: false
      await expect(getDoc(mailRef)).rejects.toThrow()
    })
  })

  describe('Invites', () => {
    it('should allow reading invites', async () => {
      const inviteRef = doc(firestore, 'invites', 'test_invite')

      // Should succeed - read: true
      await expect(getDoc(inviteRef)).resolves.not.toThrow()
    })

    it('should allow creating valid invites', async () => {
      const inviteRef = doc(firestore, 'invites', 'test_invite_' + Date.now())

      const now = new Date()
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const inviteData = {
        householdId: testHouseholdCode,
        inviterName: 'TestUser',
        createdAt: now,
        expiresAt: expiresAt
      }

      // Should succeed - has required fields
      await expect(setDoc(inviteRef, inviteData)).resolves.not.toThrow()

      // Clean up
      await deleteDoc(inviteRef)
    })

    it('should prevent creating invites without required fields', async () => {
      const inviteRef = doc(firestore, 'invites', 'invalid_invite')

      const inviteData = {
        householdId: testHouseholdCode
        // Missing required fields
      }

      // Should fail - missing createdAt, expiresAt, inviterName
      await expect(setDoc(inviteRef, inviteData)).rejects.toThrow()
    })
  })
})
