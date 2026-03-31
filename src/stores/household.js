import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database, getFirestoreInstance } from '@/firebase/config'
import { ref as dbRef, set, get, onValue } from 'firebase/database'
import { useAnalytics } from '@/composables/useAnalytics'

export const useHouseholdStore = defineStore('household', () => {
  const { trackHouseholdAction, setAnalyticsUserId, setAnalyticsUserProperties } = useAnalytics()

  // Validation functions
  function validateHouseholdCode(code) {
    const codeRegex = /^[a-zA-Z0-9-]{4,20}$/
    if (!code) {
      throw new Error('Household code is required')
    }
    if (!codeRegex.test(code)) {
      throw new Error('Household code must be 4-20 characters long and contain only letters, numbers, and hyphens')
    }
    return true
  }

  function validateMemberName(name) {
    const nameRegex = /^[a-zA-Z0-9\s]{1,50}$/
    if (!name) {
      throw new Error('Member name is required')
    }
    if (!nameRegex.test(name)) {
      throw new Error('Member name must be 1-50 characters long and contain only letters, numbers, and spaces')
    }
    if (name.trim() !== name) {
      throw new Error('Member name cannot start or end with spaces')
    }
    return true
  }

  function validatePasscode(passcodeValue) {
    if (!passcodeValue) {
      throw new Error('Passcode is required')
    }
    if (passcodeValue.length < 4) {
      throw new Error('Passcode must be at least 4 characters long')
    }
    if (passcodeValue.length > 50) {
      throw new Error('Passcode must be less than 50 characters')
    }
    return true
  }

  // State
  const householdId = ref(localStorage.getItem('householdId') || null)
  const householdCode = ref(localStorage.getItem('householdCode') || null)
  const householdName = ref(localStorage.getItem('householdName') || '')
  const memberName = ref(localStorage.getItem('memberName') || '')
  const members = ref([])
  const memberPermissions = ref({}) // Map of member names to their permissions
  const passcode = ref(null) // Not stored in localStorage for security

  // Current member logging activities (can be different from logged-in member)
  const currentMember = ref(localStorage.getItem('currentMember') || localStorage.getItem('memberName') || '')

  // Computed
  const isAuthenticated = computed(() => !!householdId.value && !!memberName.value)
  const isOwner = computed(() => {
    const myPerms = memberPermissions.value[memberName.value]
    return myPerms?.role === 'owner'
  })
  const myPermissions = computed(() => {
    return memberPermissions.value[memberName.value] || {}
  })

  // Actions
  async function createHousehold(code, passcodeValue, firstMemberName) {
    try {
      // Validate inputs
      validateHouseholdCode(code)
      validatePasscode(passcodeValue)
      validateMemberName(firstMemberName)

      const newHouseholdRef = dbRef(database, `households/${code}`)

      // Check if household already exists
      const snapshot = await get(newHouseholdRef)
      if (snapshot.exists()) {
        throw new Error('Household code already exists. Please try a different code.')
      }

      // Auto-generate household name (iOS group chat style)
      const generatedName = `${firstMemberName}'s Household`

      // Create household with new schema
      await set(newHouseholdRef, {
        code: code,
        name: generatedName,
        passcode: passcodeValue, // TODO: Hash this in production
        createdAt: Date.now(),
        createdBy: firstMemberName,
        members: {
          [firstMemberName]: {
            name: firstMemberName,
            role: 'owner',
            permissions: {
              canEditPets: true,
              canDeleteActivities: true,
              canInviteMembers: true,
              canManageBilling: true,
              canEditHousehold: true
            },
            joinedAt: Date.now()
          }
        }
      })

      // Save to state and localStorage
      householdId.value = code
      householdCode.value = code
      householdName.value = generatedName
      memberName.value = firstMemberName
      passcode.value = passcodeValue
      members.value = [firstMemberName]
      currentMember.value = firstMemberName
      memberPermissions.value = {
        [firstMemberName]: {
          role: 'owner',
          permissions: {
            canEditPets: true,
            canDeleteActivities: true,
            canInviteMembers: true,
            canManageBilling: true,
            canEditHousehold: true
          }
        }
      }

      localStorage.setItem('householdId', code)
      localStorage.setItem('householdCode', code)
      localStorage.setItem('householdName', generatedName)
      localStorage.setItem('memberName', firstMemberName)
      localStorage.setItem('currentMember', firstMemberName)

      // Start listening for household and member updates
      startHouseholdListener()
      startMembersListener()

      // Track analytics
      setAnalyticsUserId(code)
      setAnalyticsUserProperties({ role: 'owner', household_id: code })
      trackHouseholdAction('created', { household_name: generatedName })

      return true
    } catch (error) {
      console.error('Error creating household:', error)
      throw error
    }
  }

  async function joinHousehold(code, passcodeValue, newMemberName) {
    try {
      // Validate inputs
      validateHouseholdCode(code)
      validatePasscode(passcodeValue)
      validateMemberName(newMemberName)

      const householdRef = dbRef(database, `households/${code}`)
      const snapshot = await get(householdRef)

      if (!snapshot.exists()) {
        throw new Error('Household not found')
      }

      const data = snapshot.val()

      if (data.passcode !== passcodeValue) {
        throw new Error('Incorrect passcode')
      }

      // Add member to household (as regular member, not owner)
      const memberRef = dbRef(database, `households/${code}/members/${newMemberName}`)
      await set(memberRef, {
        name: newMemberName,
        role: 'member',
        permissions: {
          canEditPets: true,
          canDeleteActivities: true,
          canInviteMembers: false, // Only owner can invite
          canManageBilling: false,
          canEditHousehold: false
        },
        joinedAt: Date.now()
      })

      // Save to state and localStorage
      householdId.value = code
      householdCode.value = code
      householdName.value = data.name || `${data.createdBy || 'Pet'}'s Household`
      memberName.value = newMemberName
      passcode.value = passcodeValue
      members.value = Object.keys(data.members || {})
      currentMember.value = newMemberName

      localStorage.setItem('householdId', code)
      localStorage.setItem('householdCode', code)
      localStorage.setItem('householdName', householdName.value)
      localStorage.setItem('memberName', newMemberName)
      localStorage.setItem('currentMember', newMemberName)

      // Start listening for household and member updates
      startHouseholdListener()
      startMembersListener()

      // Track analytics
      setAnalyticsUserId(code)
      setAnalyticsUserProperties({ role: 'member', household_id: code })
      trackHouseholdAction('joined', { household_name: householdName.value })

      return true
    } catch (error) {
      console.error('Error joining household:', error)
      throw error
    }
  }

  function logout() {
    stopHouseholdListener()
    stopMembersListener()

    householdId.value = null
    householdCode.value = null
    householdName.value = ''
    memberName.value = ''
    passcode.value = null
    members.value = []
    memberPermissions.value = {}
    currentMember.value = ''

    localStorage.removeItem('householdId')
    localStorage.removeItem('householdCode')
    localStorage.removeItem('householdName')
    localStorage.removeItem('memberName')
    localStorage.removeItem('currentMember')
  }

  // Update household name (owner only)
  async function updateHouseholdName(newName) {
    if (!isOwner.value) {
      throw new Error('Only the household owner can change the name')
    }

    try {
      const nameRef = dbRef(database, `households/${householdId.value}/name`)
      await set(nameRef, newName)

      householdName.value = newName
      localStorage.setItem('householdName', newName)

      // Track analytics
      trackHouseholdAction('name_updated', { new_name: newName })

      return true
    } catch (error) {
      console.error('Error updating household name:', error)
      throw error
    }
  }

  // Generate invite link (owner/members with permission)
  async function generateInviteLink() {
    if (!myPermissions.value.canInviteMembers && !isOwner.value) {
      throw new Error('You do not have permission to invite members')
    }

    // For now, return a simple invite link with household code
    // In production, this would create a unique invite token
    const baseUrl = window.location.origin
    return {
      link: `${baseUrl}/join?code=${householdCode.value}`,
      code: householdCode.value,
      householdName: householdName.value
    }
  }

  // Send email invitation (requires Firebase Extensions setup)
  async function sendEmailInvite(recipientEmail, recipientName) {
    if (!myPermissions.value.canInviteMembers && !isOwner.value) {
      throw new Error('You do not have permission to invite members')
    }

    try {
      const inviteLink = `${window.location.origin}/join?code=${householdCode.value}`

      // Lazy-load Firestore (only needed for email invitations)
      const firestore = await getFirestoreInstance()
      const { collection, addDoc } = await import('firebase/firestore')

      // Write to Firestore /mail collection (Firebase Extension listens here)
      const mailCollection = collection(firestore, 'mail')
      const docRef = await addDoc(mailCollection, {
        to: recipientEmail,
        template: {
          name: 'household-invite',
          data: {
            inviterName: memberName.value,
            recipientName: recipientName || 'there',
            householdName: householdName.value,
            inviteLink: inviteLink,
            householdCode: householdCode.value
          }
        }
      })

      return { success: true, inviteId: docRef.id }
    } catch (error) {
      console.error('Error sending email invite:', error)
      throw error
    }
  }

  // Select which member is currently logging activities
  function selectMember(name) {
    currentMember.value = name
    localStorage.setItem('currentMember', name)
  }

  // Listen for real-time household updates (name changes)
  let householdUnsubscribe = null
  function startHouseholdListener() {
    if (!householdId.value) return

    const householdRef = dbRef(database, `households/${householdId.value}`)

    householdUnsubscribe = onValue(householdRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        if (data.name && data.name !== householdName.value) {
          householdName.value = data.name
          localStorage.setItem('householdName', data.name)
        }
      }
    })
  }

  function stopHouseholdListener() {
    if (householdUnsubscribe) {
      householdUnsubscribe()
      householdUnsubscribe = null
    }
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

        // Build permissions map
        const permsMap = {}
        Object.entries(membersData).forEach(([name, data]) => {
          permsMap[name] = {
            role: data.role || 'member',
            permissions: data.permissions || {
              canEditPets: true,
              canDeleteActivities: true,
              canInviteMembers: false,
              canManageBilling: false,
              canEditHousehold: false
            }
          }
        })
        memberPermissions.value = permsMap

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

  // Initialize listeners if already authenticated
  if (householdId.value) {
    startHouseholdListener()
    startMembersListener()
  }

  return {
    // State
    householdId,
    householdCode,
    householdName,
    memberName,
    members,
    memberPermissions,
    currentMember,

    // Computed
    isAuthenticated,
    isOwner,
    myPermissions,

    // Actions
    createHousehold,
    joinHousehold,
    logout,
    selectMember,
    updateHouseholdName,
    generateInviteLink,
    sendEmailInvite,
    startHouseholdListener,
    stopHouseholdListener,
    startMembersListener,
    stopMembersListener
  }
})
