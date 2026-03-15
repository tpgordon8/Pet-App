import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, push, onValue, remove, update, set } from 'firebase/database'
import { useHouseholdStore } from './household'
import { useToast } from '@/composables/useToast'

export const useActivitiesStore = defineStore('activities', () => {
  const householdStore = useHouseholdStore()
  const toast = useToast()

  // State
  const activities = ref([])
  const loading = ref(false)
  const listener = ref(null)
  const offlineQueue = ref([])

  // Computed
  const sortedActivities = computed(() => {
    return [...activities.value].sort((a, b) => b.timestamp - a.timestamp)
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

  async function logActivity(type, emoji, notes = '') {
    if (!householdStore.householdId || !householdStore.memberName) {
      toast.error('Please sign in first')
      return false
    }

    const activity = {
      type,
      emoji,
      timestamp: Date.now(),
      user: householdStore.memberName,
      petId: 'default', // Will be updated in Week 2 with pet selector
      notes
    }

    try {
      loading.value = true

      const activitiesRef = dbRef(database, `households/${householdStore.householdId}/activities`)
      await push(activitiesRef, activity)

      toast.success(`${emoji} ${type} logged!`)
      return true
    } catch (error) {
      console.error('Error logging activity:', error)

      // Add to offline queue
      offlineQueue.value.push(activity)
      toast.warning('Saved offline. Will sync when online.')

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
