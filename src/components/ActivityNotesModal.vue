<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="modal-backdrop"
      @click.self="$emit('close')"
    >
      <div class="card max-w-md w-full space-y-4 modal-content">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ emoji }} {{ activityType }}
        </h3>
        <button
          @click="$emit('close')"
          class="modal-close-btn"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      <!-- Backdate picker -->
      <div class="backdate-row">
        <button class="backdate-toggle" @click="showDatePicker = !showDatePicker">
          <span class="text-sm">🕐</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ showDatePicker ? 'Logging for:' : (isBackdated ? backdateLabel : 'Logging now') }}
          </span>
          <span class="backdate-caret" :class="{ open: showDatePicker }">▾</span>
        </button>
        <button
          v-if="isBackdated && !showDatePicker"
          class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1"
          @click="resetDate"
          aria-label="Reset to now"
        >✕</button>
      </div>
      <div v-if="showDatePicker" class="pl-1 pb-1">
        <input
          v-model="customDateStr"
          type="datetime-local"
          :max="maxDateStr"
          :min="minDateStr"
          class="input w-full"
          style="font-size:16px"
        />
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Up to 30 days in the past</p>
      </div>

      <!-- Notes input (optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (optional)
        </label>
        <textarea
          v-model="notes"
          class="input w-full resize-none"
          rows="3"
          placeholder="Add any details..."
          maxlength="200"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {{ notes.length }}/200
        </p>
      </div>

      <!-- Dose timer (Meds only) -->
      <div v-if="activityType === 'Meds'" class="timer-section">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          💊 Next-dose reminder? <span class="text-gray-400 font-normal">(optional)</span>
        </p>
        <div class="timer-pills">
          <button
            v-for="h in DURATION_OPTIONS"
            :key="h"
            class="timer-pill"
            :class="{ selected: selectedDuration === h }"
            @click="selectedDuration = selectedDuration === h ? null : h"
          >
            {{ h }}h
          </button>
          <button
            class="timer-pill"
            :class="{ selected: selectedDuration === null }"
            @click="selectedDuration = null"
          >
            None
          </button>
        </div>
        <p v-if="selectedDuration" class="text-xs text-sage-600 dark:text-sage-400 mt-1">
          Reminder set for {{ nextDoseLabel }}
        </p>
      </div>

      <!-- Photo upload (optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Photo (optional)
        </label>

        <!-- Photo preview -->
        <div v-if="photoPreview" class="relative mb-2">
          <img
            :src="photoPreview"
            alt="Preview"
            class="w-full h-48 object-cover rounded-lg"
          />
          <button
            @click="removePhoto"
            class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>

        <!-- Upload button -->
        <label
          v-else
          class="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-sage-500 dark:hover:border-sage-400 transition-colors motion-reduce:transition-none"
        >
          <div class="text-center">
            <span class="text-4xl block mb-2">📸</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Tap to add photo
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            class="hidden"
            @change="handlePhotoSelect"
          />
        </label>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="handleSkip"
          class="btn btn-secondary flex-1"
        >
          Skip
        </button>
        <button
          @click="handleSave"
          class="btn btn-primary flex-1"
        >
          Log Activity
        </button>
      </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

const DURATION_OPTIONS = [4, 6, 8, 12, 24]

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  activityType: {
    type: String,
    default: ''
  },
  emoji: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const notes = ref('')
const photoFile = ref(null)
const photoPreview = ref(null)
const selectedDuration = ref(null)
const showDatePicker = ref(false)
const customDateStr = ref('')
const maxDateStr = ref('')
const minDateStr = ref('')

function toDatetimeLocal(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Reset when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    notes.value = ''
    photoFile.value = null
    photoPreview.value = null
    selectedDuration.value = null
    showDatePicker.value = false
    const now = Date.now()
    maxDateStr.value = toDatetimeLocal(now)
    minDateStr.value = toDatetimeLocal(now - 30 * 24 * 3600 * 1000)
    customDateStr.value = maxDateStr.value
  }
})

function resetDate() {
  customDateStr.value = maxDateStr.value
  showDatePicker.value = false
}

const isBackdated = computed(() => {
  if (!customDateStr.value || !maxDateStr.value) return false
  return customDateStr.value < maxDateStr.value
})

const backdateLabel = computed(() => {
  if (!customDateStr.value) return ''
  const d = new Date(customDateStr.value)
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
})

const resolvedTimestamp = computed(() => {
  if (!customDateStr.value) return null
  const ts = new Date(customDateStr.value).getTime()
  return isNaN(ts) ? null : ts
})

const nextDoseLabel = computed(() => {
  if (!selectedDuration.value) return ''
  const base = resolvedTimestamp.value ?? Date.now()
  const d = new Date(base + selectedDuration.value * 3600 * 1000)
  return d.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })
})

function handlePhotoSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error')
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('Photo must be less than 5MB', 'error')
    event.target.value = ''
    return
  }

  photoFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.onerror = () => {
    showToast('Failed to read image file', 'error')
    photoFile.value = null
    event.target.value = ''
  }
  reader.readAsDataURL(file)
}

function removePhoto(event) {
  photoFile.value = null
  photoPreview.value = null

  const fileInput = event.target.closest('.card').querySelector('input[type="file"]')
  if (fileInput) {
    fileInput.value = ''
  }
}

function buildPayload(includeNotes) {
  const ts = resolvedTimestamp.value
  const timerData = selectedDuration.value
    ? {
        nextDoseAt: (ts ?? Date.now()) + selectedDuration.value * 3600 * 1000,
        nextDoseDurationHours: selectedDuration.value
      }
    : null

  return {
    notes: includeNotes ? notes.value.trim() : '',
    photo: includeNotes ? photoFile.value : null,
    timerData,
    timestamp: ts
  }
}

function handleSkip() {
  emit('save', buildPayload(false))
  emit('close')
}

function handleSave() {
  emit('save', buildPayload(true))
  emit('close')
}
</script>

<style scoped>
.backdate-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.backdate-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s;
}

.backdate-toggle:hover {
  background: rgba(0,0,0,0.05);
}

:is(.dark) .backdate-toggle:hover {
  background: rgba(255,255,255,0.07);
}

.backdate-caret {
  font-size: 10px;
  color: #9ca3af;
  transition: transform 0.2s;
}
.backdate-caret.open {
  transform: rotate(180deg);
}

.timer-section {
  border-top: 1px solid rgba(0,0,0,0.06);
  padding-top: 12px;
}

:is(.dark) .timer-section {
  border-top-color: rgba(255,255,255,0.08);
}

.timer-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.timer-pill {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 36px;
  touch-action: manipulation;
}

:is(.dark) .timer-pill {
  border-color: #4b5563;
  background: #1f2937;
  color: #d1d5db;
}

.timer-pill.selected {
  border-color: #16a34a;
  background: #dcfce7;
  color: #15803d;
}

:is(.dark) .timer-pill.selected {
  border-color: #4ade80;
  background: rgba(74,222,128,0.15);
  color: #4ade80;
}

.timer-pill:hover:not(.selected) {
  border-color: #9ca3af;
  background: #f9fafb;
}

:is(.dark) .timer-pill:hover:not(.selected) {
  background: #374151;
}

/* Modal backdrop with smooth animations */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  will-change: transform, opacity;
}

.modal-enter-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.25s ease;
}

.modal-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-leave-active .modal-content {
  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1),
              opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 640px) {
  .modal-backdrop {
    padding: 0;
    align-items: flex-end;
  }

  .modal-content {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-enter-from .modal-content {
    transform: translateY(100%);
  }

  .modal-leave-to .modal-content {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content {
    transition: none;
  }
}
</style>
