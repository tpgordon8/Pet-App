import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, push, onValue, remove, update } from 'firebase/database'
import { useHouseholdStore } from './household'
import { useToast } from '@/composables/useToast'

export const useRemindersStore = defineStore('reminders', () => {
  const householdStore = useHouseholdStore()
  const toast = useToast()

  // State
  const reminders = ref([])
  const listener = ref(null)
  const notificationsEnabled = ref(false)
  const notificationsPermission = ref(Notification?.permission || 'default')

  // Computed
  const upcomingReminders = computed(() => {
    const now = Date.now()
    const threeDaysFromNow = now + (3 * 24 * 60 * 60 * 1000)

    return reminders.value
      .filter(r => r.dueDate >= now && r.dueDate <= threeDaysFromNow && !r.completed)
      .sort((a, b) => a.dueDate - b.dueDate)
  })

  const overdueReminders = computed(() => {
    const now = Date.now()
    return reminders.value
      .filter(r => r.dueDate < now && !r.completed)
      .sort((a, b) => a.dueDate - b.dueDate)
  })

  const activeReminders = computed(() => {
    return reminders.value.filter(r => !r.completed)
  })

  // Actions
  function startListener() {
    if (!householdStore.householdId) {
      console.error('Cannot start listener: No household ID')
      return
    }

    const remindersRef = dbRef(database, `households/${householdStore.householdId}/reminders`)

    listener.value = onValue(remindersRef, (snapshot) => {
      const data = snapshot.val()

      if (data) {
        reminders.value = Object.entries(data).map(([id, reminder]) => ({
          id,
          ...reminder
        }))
      } else {
        reminders.value = []
      }

      // Check for notifications to send
      checkAndNotify()
    }, (error) => {
      console.error('Firebase listener error:', error)
      toast.error('Failed to sync reminders')
    })
  }

  function stopListener() {
    if (listener.value) {
      listener.value()
      listener.value = null
    }
  }

  async function addReminder({ type, title, dueDate, petId, notes, recurrence }) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    const reminder = {
      type, // 'vaccination', 'medication', 'vet-appointment', 'custom'
      title,
      dueDate, // Unix timestamp
      petId,
      notes: notes || '',
      recurrence: recurrence || null, // { interval: 'daily' | 'weekly' | 'monthly', count: number }
      completed: false,
      createdAt: Date.now(),
      createdBy: householdStore.memberName
    }

    try {
      const remindersRef = dbRef(database, `households/${householdStore.householdId}/reminders`)
      const newReminderRef = await push(remindersRef, reminder)

      toast.success('Reminder added')
      return newReminderRef.key
    } catch (error) {
      console.error('Error adding reminder:', error)
      toast.error('Failed to add reminder')
      return false
    }
  }

  async function updateReminder(reminderId, updates) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    try {
      const reminderRef = dbRef(database, `households/${householdStore.householdId}/reminders/${reminderId}`)
      await update(reminderRef, updates)
      toast.success('Reminder updated')
      return true
    } catch (error) {
      console.error('Error updating reminder:', error)
      toast.error('Failed to update reminder')
      return false
    }
  }

  async function completeReminder(reminderId) {
    return updateReminder(reminderId, {
      completed: true,
      completedAt: Date.now(),
      completedBy: householdStore.memberName
    })
  }

  async function deleteReminder(reminderId) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    try {
      const reminderRef = dbRef(database, `households/${householdStore.householdId}/reminders/${reminderId}`)
      await remove(reminderRef)
      toast.success('Reminder deleted')
      return true
    } catch (error) {
      console.error('Error deleting reminder:', error)
      toast.error('Failed to delete reminder')
      return false
    }
  }

  // Web Notifications API
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      notificationsPermission.value = permission

      if (permission === 'granted') {
        notificationsEnabled.value = true
        localStorage.setItem('notifications_enabled', 'true')
        toast.success('Notifications enabled')
        return true
      } else {
        notificationsEnabled.value = false
        localStorage.setItem('notifications_enabled', 'false')
        toast.error('Notification permission denied')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Failed to enable notifications')
      return false
    }
  }

  function sendNotification(title, options = {}) {
    if (!notificationsEnabled.value || notificationsPermission.value !== 'granted') {
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000)

      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  function checkAndNotify() {
    if (!notificationsEnabled.value) return

    const now = Date.now()
    const oneDayFromNow = now + (24 * 60 * 60 * 1000)

    // Notify for reminders due in the next 24 hours
    upcomingReminders.value.forEach(reminder => {
      const notifiedKey = `notified_${reminder.id}`

      // Check if we've already notified for this reminder
      if (localStorage.getItem(notifiedKey)) return

      // Only notify if due within 24 hours
      if (reminder.dueDate <= oneDayFromNow) {
        const dueIn = Math.floor((reminder.dueDate - now) / (60 * 60 * 1000)) // hours
        const dueText = dueIn < 1 ? 'soon' : `in ${dueIn} hour${dueIn !== 1 ? 's' : ''}`

        sendNotification(`Reminder: ${reminder.title}`, {
          body: `Due ${dueText}${reminder.notes ? ` • ${reminder.notes}` : ''}`,
          tag: reminder.id,
          requireInteraction: false
        })

        // Mark as notified
        localStorage.setItem(notifiedKey, Date.now().toString())
      }
    })
  }

  // Calculate vaccination due dates based on common schedules
  function calculateVaccinationDueDate(vaccineName, petBirthday, lastVaccinationDate) {
    if (!petBirthday && !lastVaccinationDate) {
      return null
    }

    // Common vaccination schedules (in months)
    const schedules = {
      // Dog vaccines
      'Rabies': { initial: 16, booster: 36 }, // 16 weeks initial, 3 years booster
      'DHPP': { initial: 16, booster: 12 }, // 16 weeks initial, annual booster
      'Bordetella': { initial: 12, booster: 6 }, // 12 weeks initial, 6 month booster
      'Lyme': { initial: 12, booster: 12 },

      // Cat vaccines
      'FVRCP': { initial: 16, booster: 12 },
      'FeLV': { initial: 16, booster: 12 },

      // Generic fallback
      'Other': { initial: 16, booster: 12 }
    }

    const schedule = schedules[vaccineName] || schedules['Other']

    // If last vaccination date exists, calculate next booster
    if (lastVaccinationDate) {
      const lastDate = new Date(lastVaccinationDate)
      lastDate.setMonth(lastDate.getMonth() + schedule.booster)
      return lastDate.getTime()
    }

    // Otherwise calculate initial vaccination based on birthday
    if (petBirthday) {
      const birthDate = new Date(petBirthday)
      birthDate.setMonth(birthDate.getMonth() + Math.ceil(schedule.initial / 4)) // Convert weeks to months
      return birthDate.getTime()
    }

    return null
  }

  // Auto-create reminders from vaccinations
  async function createReminderFromVaccination(vaccineName, petId, petBirthday, vaccinationDate) {
    const dueDate = calculateVaccinationDueDate(vaccineName, petBirthday, vaccinationDate)

    if (!dueDate) return false

    return await addReminder({
      type: 'vaccination',
      title: `${vaccineName} vaccination due`,
      dueDate,
      petId,
      notes: `Next ${vaccineName} booster`,
      recurrence: null
    })
  }

  // Initialize from localStorage
  function initialize() {
    const enabled = localStorage.getItem('notifications_enabled')
    if (enabled === 'true' && Notification?.permission === 'granted') {
      notificationsEnabled.value = true
      notificationsPermission.value = 'granted'
    }
  }

  return {
    // State
    reminders,
    notificationsEnabled,
    notificationsPermission,

    // Computed
    upcomingReminders,
    overdueReminders,
    activeReminders,

    // Actions
    startListener,
    stopListener,
    addReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
    requestNotificationPermission,
    sendNotification,
    checkAndNotify,
    calculateVaccinationDueDate,
    createReminderFromVaccination,
    initialize
  }
})
