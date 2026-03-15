import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, set, get, onValue } from 'firebase/database'

export const useHouseholdStore = defineStore('household', () => {
  // State
  const householdId = ref(localStorage.getItem('householdId') || null)
  const householdCode = ref(localStorage.getItem('householdCode') || null)
  const memberName = ref(localStorage.getItem('memberName') || '')
  const members = ref([])
  const passcode = ref(null) // Not stored in localStorage for security

  // Current member logging activities (can be different from logged-in member)
  const currentMember = ref(localStorage.getItem('currentMember') || localStorage.getItem('memberName') || '')

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
      currentMember.value = firstMemberName

      localStorage.setItem('householdId', code)
      localStorage.setItem('householdCode', code)
      localStorage.setItem('memberName', firstMemberName)
      localStorage.setItem('currentMember', firstMemberName)

      // Start listening for member updates
      startMembersListener()

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
      currentMember.value = newMemberName

      localStorage.setItem('householdId', code)
      localStorage.setItem('householdCode', code)
      localStorage.setItem('memberName', newMemberName)
      localStorage.setItem('currentMember', newMemberName)

      // Start listening for member updates
      startMembersListener()

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
    currentMember.value = ''

    localStorage.removeItem('householdId')
    localStorage.removeItem('householdCode')
    localStorage.removeItem('memberName')
    localStorage.removeItem('currentMember')
  }

  // Select which member is currently logging activities
  function selectMember(name) {
    currentMember.value = name
    localStorage.setItem('currentMember', name)
  }

  // Listen for real-time member updates
  let membersUnsubscribe = null
  function startMembersListener() {
    if (!householdId.value) return

    const membersRef = dbRef(database, `households/${householdId.value}/members`)

    membersUnsubscribe = onValue(membersRef, (snapshot) => {
      if (snapshot.exists()) {
        const membersData = snapshot.val()
        members.value = Object.keys(membersData).sort()

        // If current member not in list, select first available
        if (members.value.length > 0 && !members.value.includes(currentMember.value)) {
          selectMember(members.value[0])
        }
      }
    })
  }

  function stopMembersListener() {
    if (membersUnsubscribe) {
      membersUnsubscribe()
      membersUnsubscribe = null
    }
  }

  // Initialize listener if already authenticated
  if (householdId.value) {
    startMembersListener()
  }

  return {
    // State
    householdId,
    householdCode,
    memberName,
    members,
    currentMember,

    // Computed
    isAuthenticated,

    // Actions
    createHousehold,
    joinHousehold,
    logout,
    selectMember,
    startMembersListener,
    stopMembersListener
  }
})
