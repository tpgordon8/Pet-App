<template>
  <div class="reminders-widget">
    <!-- Enable Notifications Prompt -->
    <div
      v-if="!remindersStore.notificationsEnabled && remindersStore.activeReminders.length > 0"
      class="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
    >
      <div class="flex items-start gap-2">
        <span class="text-lg">🔔</span>
        <div class="flex-1">
          <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            Enable notifications to never miss a reminder
          </p>
          <button
            @click="enableNotifications"
            class="text-xs font-medium text-yellow-700 dark:text-yellow-300 hover:underline"
          >
            Enable Now →
          </button>
        </div>
        <button
          @click="dismissPrompt"
          class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Overdue Reminders -->
    <div v-if="remindersStore.overdueReminders.length > 0" class="mb-3">
      <h4 class="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">
        Overdue ({{ remindersStore.overdueReminders.length }})
      </h4>
      <div class="space-y-2">
        <div
          v-for="reminder in remindersStore.overdueReminders"
          :key="reminder.id"
          class="reminder-card overdue"
        >
          <div class="flex items-start gap-3">
            <span class="text-xl">{{ getReminderEmoji(reminder.type) }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h5 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ reminder.title }}
                </h5>
                <span class="text-xs text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                  {{ formatDueDate(reminder.dueDate) }}
                </span>
              </div>
              <p v-if="reminder.notes" class="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                {{ reminder.notes }}
              </p>
            </div>
            <div class="flex gap-1">
              <button
                @click="completeReminder(reminder.id)"
                class="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-xs font-medium"
                title="Mark as complete"
              >
                ✓
              </button>
              <button
                @click="deleteReminder(reminder.id)"
                class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Reminders -->
    <div v-if="remindersStore.upcomingReminders.length > 0">
      <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
        Upcoming ({{ remindersStore.upcomingReminders.length }})
      </h4>
      <div class="space-y-2">
        <div
          v-for="reminder in remindersStore.upcomingReminders"
          :key="reminder.id"
          class="reminder-card"
        >
          <div class="flex items-start gap-3">
            <span class="text-xl">{{ getReminderEmoji(reminder.type) }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h5 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ reminder.title }}
                </h5>
                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ formatDueDate(reminder.dueDate) }}
                </span>
              </div>
              <p v-if="reminder.notes" class="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                {{ reminder.notes }}
              </p>
            </div>
            <div class="flex gap-1">
              <button
                @click="completeReminder(reminder.id)"
                class="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-xs font-medium"
                title="Mark as complete"
              >
                ✓
              </button>
              <button
                @click="deleteReminder(reminder.id)"
                class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-xs"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Reminders -->
    <div
      v-if="remindersStore.activeReminders.length === 0"
      class="text-center py-6 text-gray-500 dark:text-gray-400"
    >
      <span class="text-3xl mb-2 block">🔔</span>
      <p class="text-sm">No active reminders</p>
      <button
        @click="$emit('add-reminder')"
        class="text-xs text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium mt-2"
      >
        + Add Reminder
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRemindersStore } from '@/stores/reminders'
import { formatDistanceToNow } from 'date-fns'

defineEmits(['add-reminder'])

const remindersStore = useRemindersStore()

function getReminderEmoji(type) {
  const emojiMap = {
    'vaccination': '💉',
    'medication': '💊',
    'vet-appointment': '🏥',
    'custom': '🔔'
  }
  return emojiMap[type] || '🔔'
}

function formatDueDate(dueDate) {
  const now = Date.now()
  const diff = dueDate - now

  if (diff < 0) {
    // Overdue
    return formatDistanceToNow(dueDate, { addSuffix: true })
  } else {
    // Upcoming
    return formatDistanceToNow(dueDate, { addSuffix: true })
  }
}

async function completeReminder(reminderId) {
  await remindersStore.completeReminder(reminderId)
}

async function deleteReminder(reminderId) {
  if (confirm('Delete this reminder?')) {
    await remindersStore.deleteReminder(reminderId)
  }
}

async function enableNotifications() {
  await remindersStore.requestNotificationPermission()
}

function dismissPrompt() {
  localStorage.setItem('notifications_prompt_dismissed', 'true')
}
</script>

<style scoped>
.reminder-card {
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.dark .reminder-card {
  background: rgba(31, 41, 55, 0.5);
  border-color: rgba(75, 85, 99, 0.5);
}

.reminder-card:hover {
  border-color: #8B9A7D;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reminder-card.overdue {
  border-color: #ef4444;
  background: rgba(254, 226, 226, 0.3);
}

.dark .reminder-card.overdue {
  background: rgba(127, 29, 29, 0.2);
  border-color: #991b1b;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
