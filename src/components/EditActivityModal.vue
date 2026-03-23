<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <div class="card max-w-md w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Activity
        </h3>
        <button
          @click="handleClose"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Activity Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Activity Type
          </label>
          <select v-model="formData.type" class="input w-full">
            <option value="Poop">💩 Poop</option>
            <option value="Pee">💧 Pee</option>
            <option value="Food">🍖 Food</option>
            <option value="Sleep">😴 Sleep</option>
            <option value="Meds">💊 Meds</option>
            <option value="Walk">🚶 Walk</option>
          </select>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Note: Medical activities (Vet Visit, Vaccination, Weight Check) cannot be edited
          </p>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            v-model="formData.date"
            type="date"
            class="input w-full"
          />
        </div>

        <!-- Time -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Time
          </label>
          <input
            v-model="formData.time"
            type="time"
            class="input w-full"
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            v-model="formData.notes"
            placeholder="Add any notes..."
            class="input w-full h-24 resize-none"
            maxlength="200"
          />
          <div class="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
            {{ formData.notes.length }}/200
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 mt-6">
        <button
          @click="handleClose"
          class="btn btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          class="btn btn-primary flex-1"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { format } from 'date-fns'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  activity: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  type: '',
  date: '',
  time: '',
  notes: ''
})

// Populate form when activity changes
watch(() => props.activity, (newActivity) => {
  if (newActivity) {
    const date = new Date(newActivity.timestamp)
    formData.value = {
      type: newActivity.type || '',
      date: format(date, 'yyyy-MM-dd'),
      time: format(date, 'HH:mm'),
      notes: newActivity.notes || ''
    }
  }
}, { immediate: true })

function handleClose() {
  emit('close')
}

function handleSave() {
  // Combine date and time into timestamp
  const dateTime = new Date(`${formData.value.date}T${formData.value.time}`)
  const timestamp = dateTime.getTime()

  // Get emoji for the selected type
  const emojiMap = {
    'Poop': '💩',
    'Pee': '💧',
    'Food': '🍖',
    'Sleep': '😴',
    'Meds': '💊',
    'Walk': '🚶'
  }

  const updates = {
    type: formData.value.type,
    emoji: emojiMap[formData.value.type],
    timestamp,
    notes: formData.value.notes
  }

  emit('save', updates)
  emit('close')
}
</script>

<style scoped>
.input {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-sage-500 dark:focus:ring-sage-400
    transition-colors;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all
    disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply bg-sage-600 hover:bg-sage-700 text-white
    dark:bg-sage-500 dark:hover:bg-sage-600;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200;
}

.card {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6;
}
</style>
