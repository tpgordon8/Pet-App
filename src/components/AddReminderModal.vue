<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="modal-content glass-strong rounded-2xl max-w-md w-full p-6 shadow-glass-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Add Reminder
            </h2>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Reminder Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reminder Type *
              </label>
              <select
                v-model="form.type"
                class="input"
                required
              >
                <option value="vaccination">💉 Vaccination</option>
                <option value="medication">💊 Medication</option>
                <option value="vet-appointment">🏥 Vet Appointment</option>
                <option value="custom">🔔 Custom Reminder</option>
              </select>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                v-model="form.title"
                type="text"
                :placeholder="getTitlePlaceholder()"
                class="input"
                required
                maxlength="50"
              >
            </div>

            <!-- Pet Selection -->
            <div v-if="pets.length > 0">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pet *
              </label>
              <select
                v-model="form.petId"
                class="input"
                required
              >
                <option value="">Select a pet</option>
                <option v-for="pet in pets" :key="pet.id" :value="pet.id">
                  {{ pet.emoji }} {{ pet.name }}
                </option>
              </select>
            </div>

            <!-- Due Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date *
              </label>
              <input
                v-model="form.dueDate"
                type="datetime-local"
                class="input"
                required
                :min="today"
              >
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                v-model="form.notes"
                class="input"
                rows="3"
                maxlength="200"
                placeholder="Additional details..."
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ form.notes.length }}/200 characters
              </p>
            </div>

            <!-- Recurrence (Future Feature) -->
            <!--
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repeat (optional)
              </label>
              <select
                v-model="form.recurrence"
                class="input"
              >
                <option value="">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            -->

            <!-- Error Message -->
            <div
              v-if="error"
              class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
            >
              {{ error }}
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="close"
                class="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary flex-1"
                :disabled="loading"
              >
                {{ loading ? 'Adding...' : 'Add Reminder' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRemindersStore } from '@/stores/reminders'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  pets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const remindersStore = useRemindersStore()

const form = ref({
  type: 'vaccination',
  title: '',
  petId: '',
  dueDate: '',
  notes: '',
  recurrence: ''
})

const loading = ref(false)
const error = ref('')

// Today's date for min constraint
const today = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Set default due date to tomorrow at 9am
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset())

    form.value = {
      type: 'vaccination',
      title: '',
      petId: props.pets.length > 0 ? props.pets[0].id : '',
      dueDate: tomorrow.toISOString().slice(0, 16),
      notes: '',
      recurrence: ''
    }
    error.value = ''
  }

  // Lock/unlock body scroll
  if (newVal) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

function getTitlePlaceholder() {
  const placeholders = {
    'vaccination': 'e.g., Rabies booster',
    'medication': 'e.g., Flea & tick medication',
    'vet-appointment': 'e.g., Annual checkup',
    'custom': 'e.g., Grooming appointment'
  }
  return placeholders[form.value.type] || 'Enter reminder title'
}

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    // Convert datetime-local to Unix timestamp
    const dueDate = new Date(form.value.dueDate).getTime()

    const success = await remindersStore.addReminder({
      type: form.value.type,
      title: form.value.title.trim(),
      dueDate,
      petId: form.value.petId,
      notes: form.value.notes.trim(),
      recurrence: form.value.recurrence || null
    })

    if (success) {
      close()
    }
  } catch (err) {
    error.value = err.message || 'Failed to add reminder'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
/* Modal backdrop with smooth animations */
.modal-backdrop {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content {
  will-change: transform, opacity;
}

/* Smooth modal entrance/exit animations */
.modal-enter-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
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

/* Mobile optimizations */
@media (max-width: 640px) {
  .modal-enter-from .modal-content {
    transform: translateY(100%);
  }

  .modal-leave-to .modal-content {
    transform: translateY(100%);
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content {
    transition: none;
  }
}
</style>
