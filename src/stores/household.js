import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, set, get } from 'firebase/database'

export const useHouseholdStore = defineStore('household', () => {
  // State
  const householdId = ref(localStorage.getItem('householdId') || null)
  const householdCode = ref(localStorage.getItem('householdCode') || null)
  const memberName = ref(localStorage.getItem('memberName') || '')
  const members = ref([])
  const passcode = ref(null) // Not stored in localStorage for security

  // Computed
  const isAuthenticated = computed(() => !!householdId.value && !!memberName.value)

  // Actions
  async function createHousehold(code, passcodeValue, firstMemberName) {
    try {
      const newHouseholdRef = dbRef(database, `households/${code}`)

      // Check if household already exists
      const snapshot = await get(newHouseholdRef)
      if (snapshot.exists()) {
        throw new Error('Household code already exists. Please try a different code.')
      }

      // Create household
      await set(newHouseholdRef, {
        code: code,
        passcode: passcodeValue, // TODO: Hash this in production
        createdAt: Date.now(),
        members: {
          [firstMemberName]: {
            name: firstMemberName,
            joinedAt: Date.now()
          }
        }
      })

      // Save to state and localStorage
      householdId.value = code
      householdCode.value = code
      memberName.value = firstMemberName
      passcode.value = passcodeValue
      members.value = [firstMemberName]

      localStorage.setItem('householdId', code)
      localStorage.setItem('householdCode', code)
      localStorage.setItem('memberName', firstMemberName)

      return true
    } catch (error) {
      console.error('Error creating household:', error)
      throw error
    }
  }

  async function joinHousehold(code, passcodeValue, newMemberName) {
    try {
      const householdRef = dbRef(database, `households/${code}`)
      const snapshot = await get(householdRef)

      if (!snapshot.exists()) {
        throw new Error('Household not found')
      }

      const data = snapshot.val()

      if (data.passcode !== passcodeValue) {
        throw new Error('Incorrect passcode')
      }

      // Add member to household
      const memberRef = dbRef(database, `households/${code}/members/${newMemberName}`)
      await set(memberRef, {
        name: newMemberName,
        joinedAt: Date.now()
      })

      // Save to state and localStorage
      householdId.value = code
      householdCode.value = code
      memberName.value = newMemberName
      passcode.value = passcodeValue
      members.value = Object.keys(data.members || {})

      localStorage.setItem('householdId', code)
      localStorage.setItem('householdCode', code)
      localStorage.setItem('memberName', newMemberName)

      return true
    } catch (error) {
      console.error('Error joining household:', error)
      throw error
    }
  }

  function logout() {
    householdId.value = null
    householdCode.value = null
    memberName.value = ''
    passcode.value = null
    members.value = []

    localStorage.removeItem('householdId')
    localStorage.removeItem('householdCode')
    localStorage.removeItem('memberName')
  }

  return {
    // State
    householdId,
    householdCode,
    memberName,
    members,

    // Computed
    isAuthenticated,

    // Actions
    createHousehold,
    joinHousehold,
    logout
  }
})
