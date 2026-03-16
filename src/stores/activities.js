import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database, storage } from '@/firebase/config'
import { ref as dbRef, push, onValue, remove, update, set } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useHouseholdStore } from './household'
import { usePetsStore } from './pets'
import { useToast } from '@/composables/useToast'
import { useAnalytics } from '@/composables/useAnalytics'

export const useActivitiesStore = defineStore('activities', () => {
  const householdStore = useHouseholdStore()
  const toast = useToast()
  const { trackActivityLogged, trackMedicalActivity } = useAnalytics()

  // State
  const activities = ref([])
  const loading = ref(false)
  const listener = ref(null)
  const offlineQueue = ref([])

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
      poop: today.filter(a => a.type === 'Poop').length,
      pee: today.filter(a => a.type === 'Pee').length,
      food: today.filter(a => a.type === 'Food').length,
      sleep: today.filter(a => a.type === 'Sleep').length,
      meds: today.filter(a => a.type === 'Meds').length,
      walk: today.filter(a => a.type === 'Walk').length,
      vetVisit: today.filter(a => a.type === 'Vet Visit').length,
      vaccination: today.filter(a => a.type === 'Vaccination').length,
      weightCheck: today.filter(a => a.type === 'Weight Check').length,
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

  async function uploadPhoto(file, activityType) {
    try {
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`
      const photoRef = storageRef(storage, `households/${householdStore.householdId}/activities/${filename}`)

      await uploadBytes(photoRef, file)
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

      const activity = {
        type,
        emoji,
        timestamp: Date.now(),
        user: householdStore.currentMember,
        petId: petsStore.selectedPetId === 'all' ? 'default' : petsStore.selectedPetId,
        notes
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

  async function deleteActivity(activityId) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    try {
      const activityRef = dbRef(database, `households/${householdStore.householdId}/activities/${activityId}`)
      await remove(activityRef)
      toast.success('Activity deleted')
      return true
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Failed to delete activity')
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

  // Load offline queue from localStorage
  function loadOfflineQueue() {
    const saved = localStorage.getItem('offlineQueue')
    if (saved) {
      try {
        offlineQueue.value = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load offline queue:', error)
      }
    }
  }

  // Save offline queue to localStorage
  function saveOfflineQueue() {
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue.value))
  }

  return {
    // State
    activities,
    loading,
    offlineQueue,

    // Computed
    sortedActivities,
    todayActivities,
    stats,

    // Actions
    startListener,
    stopListener,
    logActivity,
    deleteActivity,
    updateActivity,
    syncOfflineQueue,
    loadOfflineQueue,
    saveOfflineQueue
  }
})
