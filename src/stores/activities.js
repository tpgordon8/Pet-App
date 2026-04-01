import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { database, storage } from '@/firebase/config'
import { ref as dbRef, push, onValue, remove, update } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useHouseholdStore } from './household'
import { usePetsStore } from './pets'
import { useToast } from '@/composables/useToast'
import { useAnalytics } from '@/composables/useAnalytics'
import { REGULAR_ACTIVITIES, MEDICAL_ACTIVITIES } from '@/constants/activityTypes'
import { getStorageJSON, setStorageJSON } from '@/composables/useStorage'
import { processImage } from '@/utils/imageCompression'
import { sanitizeActivityNotes } from '@/utils/sanitize'
import { triggerConfetti } from '@/utils/confetti'

export const useActivitiesStore = defineStore('activities', () => {
  const householdStore = useHouseholdStore()
  const toast = useToast()
  const { trackActivityLogged, trackMedicalActivity } = useAnalytics()

  // State
  const activities = ref([])
  const loading = ref(false)
  const listener = ref(null)
  const offlineQueue = ref(getStorageJSON('offlineQueue', []))

  // Computed - filtered by selected pet
  const filteredActivities = computed(() => {
    const petsStore = usePetsStore()

    if (petsStore.selectedPetId === 'all') {
      return activities.value
    }

    return activities.value.filter(a => a.petId === petsStore.selectedPetId)
  })

  const sortedActivities = computed(() => {
    return [...filteredActivities.value].sort((a, b) => b.timestamp - a.timestamp)
  })

  const todayActivities = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    return sortedActivities.value.filter(a => a.timestamp >= todayTimestamp)
  })

  const stats = computed(() => {
    const today = todayActivities.value
    return {
      poop: today.filter(a => a.type === REGULAR_ACTIVITIES.POOP).length,
      pee: today.filter(a => a.type === REGULAR_ACTIVITIES.PEE).length,
      food: today.filter(a => a.type === REGULAR_ACTIVITIES.FOOD).length,
      sleep: today.filter(a => a.type === REGULAR_ACTIVITIES.SLEEP).length,
      meds: today.filter(a => a.type === REGULAR_ACTIVITIES.MEDS).length,
      walk: today.filter(a => a.type === REGULAR_ACTIVITIES.WALK).length,
      vetVisit: today.filter(a => a.type === MEDICAL_ACTIVITIES.VET_VISIT).length,
      vaccination: today.filter(a => a.type === MEDICAL_ACTIVITIES.VACCINATION).length,
      weightCheck: today.filter(a => a.type === MEDICAL_ACTIVITIES.WEIGHT_CHECK).length,
      total: today.length
    }
  })

  // Actions
  function startListener() {
    if (!householdStore.householdId) {
      console.error('Cannot start listener: No household ID')
      return
    }

    const activitiesRef = dbRef(database, `households/${householdStore.householdId}/activities`)

    listener.value = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val()

      if (data) {
        activities.value = Object.entries(data).map(([id, activity]) => ({
          id,
          ...activity
        }))
      } else {
        activities.value = []
      }
    }, (error) => {
      console.error('Firebase listener error:', error)
      toast.error('Failed to sync activities')
    })
  }

  function stopListener() {
    if (listener.value) {
      listener.value()
      listener.value = null
    }
  }

  async function refreshActivities() {
    // Force a manual refresh by restarting the listener
    // This triggers a fresh fetch from Firebase
    if (listener.value) {
      stopListener()
      await new Promise(resolve => setTimeout(resolve, 100))
      startListener()
    }
  }

  async function uploadPhoto(file) {
    try {
      // Compress image before upload (saves bandwidth and storage costs)
      toast.info('Compressing image...')
      const compressedFile = await processImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920
      })

      const timestamp = Date.now()
      const filename = `${timestamp}-${compressedFile.name}`
      const photoRef = storageRef(storage, `households/${householdStore.householdId}/activities/${filename}`)

      toast.info('Uploading photo...')
      await uploadBytes(photoRef, compressedFile)
      const url = await getDownloadURL(photoRef)

      return url
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  }

  async function logActivity(type, emoji, notes = '', photoFile = null, medicalData = null) {
    if (!householdStore.householdId || !householdStore.memberName) {
      toast.error('Please sign in first')
      return false
    }

    const petsStore = usePetsStore()

    // Require pet selection if pets exist
    if (petsStore.hasPets && petsStore.selectedPetId === 'all') {
      toast.warning('Please select a specific pet first')
      return false
    }

    // Require member selection
    if (!householdStore.currentMember) {
      toast.warning('Please select who is logging this activity')
      return false
    }

    try {
      loading.value = true

      // Upload photo if provided
      let photoUrl = null
      if (photoFile) {
        toast.info('Uploading photo...')
        photoUrl = await uploadPhoto(photoFile, type)
      }

      // Sanitize user input to prevent XSS
      const sanitizedNotes = notes ? sanitizeActivityNotes(notes) : ''

      const activity = {
        type,
        emoji,
        timestamp: Date.now(),
        user: householdStore.currentMember,
        petId: petsStore.selectedPetId === 'all' ? 'default' : petsStore.selectedPetId,
        notes: sanitizedNotes
      }

      // Only add photoUrl if it exists
      if (photoUrl) {
        activity.photoUrl = photoUrl
      }

      // Add medical data if provided
      if (medicalData) {
        activity.medicalData = medicalData
      }

      const activitiesRef = dbRef(database, `households/${householdStore.householdId}/activities`)
      await push(activitiesRef, activity)

      // Track analytics
      if (medicalData) {
        trackMedicalActivity(type)
      } else {
        trackActivityLogged(type, activity.petId, !!notes, !!photoUrl)
      }

      // Celebration feedback
      const isFirstOfDay = todayActivities.value.length === 1
      const isMilestone = activities.value.length > 0 && (activities.value.length % 10 === 0)

      // Trigger confetti for special moments
      if (isFirstOfDay || isMilestone) {
        // Get activity color from colors-extended.css
        const colorMap = {
          'Poop': '#8B7355',
          'Pee': '#4A9EED',
          'Food': '#E67E22',
          'Sleep': '#7B68EE',
          'Meds': '#E74C3C',
          'Walk': '#27AE60',
          'Vet Visit': '#3498DB',
          'Vaccination': '#9B59B6',
          'Weight Check': '#16A085'
        }
        triggerConfetti({ color: colorMap[type] || '#fb923c' })
      }

      toast.success(`${emoji} ${type} logged!`)
      return true
    } catch (error) {
      console.error('Error logging activity:', error)

      // Note: Don't queue activities with photos or medical data for offline sync (too complex)
      if (!photoFile && !medicalData) {
        const activity = {
          type,
          emoji,
          timestamp: Date.now(),
          user: householdStore.currentMember,
          petId: petsStore.selectedPetId === 'all' ? 'default' : petsStore.selectedPetId,
          notes
        }
        offlineQueue.value.push(activity)
        toast.warning('Saved offline. Will sync when online.')
      } else {
        toast.error('Failed to log activity. Please try again.')
      }

      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteActivity(activityId, options = {}) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    try {
      // Find the activity to delete (for undo functionality)
      const activityToDelete = activities.value.find(a => a.id === activityId)

      const activityRef = dbRef(database, `households/${householdStore.householdId}/activities/${activityId}`)
      await remove(activityRef)

      // If undo is enabled, show undo toast
      if (options.enableUndo && activityToDelete) {
        toast.undo(
          `${activityToDelete.emoji} ${activityToDelete.type} deleted`,
          async () => {
            await restoreActivity(activityId, activityToDelete)
          }
        )
      } else {
        toast.success('Activity deleted')
      }

      return true
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Failed to delete activity')
      return false
    }
  }

  async function restoreActivity(activityId, activityData) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    try {
      // Restore with the same ID
      const activityRef = dbRef(database, `households/${householdStore.householdId}/activities/${activityId}`)
      // eslint-disable-next-line no-unused-vars
      const { id, ...dataWithoutId } = activityData
      await update(activityRef, dataWithoutId)

      toast.success(`${activityData.emoji} ${activityData.type} restored`)
      return true
    } catch (error) {
      console.error('Error restoring activity:', error)
      toast.error('Failed to restore activity')
      return false
    }
  }

  async function updateActivity(activityId, updates) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    try {
      const activityRef = dbRef(database, `households/${householdStore.householdId}/activities/${activityId}`)
      await update(activityRef, updates)
      toast.success('Activity updated')
      return true
    } catch (error) {
      console.error('Error updating activity:', error)
      toast.error('Failed to update activity')
      return false
    }
  }

  async function syncOfflineQueue() {
    if (offlineQueue.value.length === 0) return

    const queue = [...offlineQueue.value]
    offlineQueue.value = []

    for (const activity of queue) {
      try {
        const activitiesRef = dbRef(database, `households/${householdStore.householdId}/activities`)
        await push(activitiesRef, activity)
      } catch (error) {
        console.error('Failed to sync offline activity:', error)
        offlineQueue.value.push(activity)
      }
    }

    if (offlineQueue.value.length === 0) {
      toast.success('All offline activities synced!')
    }
  }

  // Load offline queue from localStorage (deprecated - now loaded on init)
  function loadOfflineQueue() {
    const saved = getStorageJSON('offlineQueue', [])
    if (saved) {
      offlineQueue.value = saved
    }
  }

  // Save offline queue to localStorage (deprecated - now auto-saved via watcher)
  function saveOfflineQueue() {
    setStorageJSON('offlineQueue', offlineQueue.value)
  }

  // Auto-save offline queue to localStorage whenever it changes
  watch(offlineQueue, (newQueue) => {
    setStorageJSON('offlineQueue', newQueue)
  }, { deep: true })

  // Auto-sync offline queue when app comes back online
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      if (offlineQueue.value.length > 0) {
        toast.info('Connection restored. Syncing offline activities...')
        syncOfflineQueue()
      }
    })
  }

  return {
    // State
    activities,
    loading,
    offlineQueue,

    // Computed
    filteredActivities,
    sortedActivities,
    todayActivities,
    stats,

    // Actions
    startListener,
    stopListener,
    refreshActivities,
    logActivity,
    deleteActivity,
    restoreActivity,
    updateActivity,
    syncOfflineQueue,
    loadOfflineQueue,
    saveOfflineQueue
  }
})
