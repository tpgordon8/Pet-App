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
              {{ editPet ? 'Edit Pet' : 'Add New Pet' }}
            </h2>
            <button
              @click="close"
              class="modal-close-btn"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Pet Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pet Name *
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g., Luna"
                class="input"
                required
                maxlength="20"
                autofocus
              >
            </div>

            <!-- Pet Species (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Species (optional)
              </label>
              <input
                v-model="form.species"
                type="text"
                placeholder="e.g., Dog, Cat, Rabbit"
                class="input"
                maxlength="20"
              >
            </div>

            <!-- Emoji Picker -->
            <EmojiPicker
              label="Choose an emoji *"
              :selected-emoji="form.emoji"
              @select="form.emoji = $event"
            />

            <!-- Birthday (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Birthday (optional)
              </label>
              <input
                v-model="form.birthday"
                type="date"
                class="input"
                :max="today"
              >
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used for age calculation and birthday reminders
              </p>
            </div>

            <!-- Theme Color Picker -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme Color
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Choose a color that represents {{ form.name || 'your pet' }}
              </p>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="color in themeColors"
                  :key="color.key"
                  type="button"
                  @click="form.themeColor = color.key"
                  class="theme-color-button"
                  :class="{ 'selected': form.themeColor === color.key }"
                  :style="{ backgroundColor: color.primary }"
                  :title="color.name"
                  :aria-label="`Select ${color.name} theme`"
                >
                  <span
                    v-if="form.themeColor === color.key"
                    class="checkmark"
                  >✓</span>
                </button>
              </div>
            </div>

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
                :disabled="loading || !form.name || !form.emoji"
              >
                <template v-if="editPet">
                  {{ loading ? 'Saving...' : 'Save Changes' }}
                </template>
                <template v-else>
                  {{ loading ? 'Adding...' : 'Add Pet' }}
                </template>
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
import { usePetsStore } from '@/stores/pets'
import { useTheme } from '@/composables/useTheme'
import EmojiPicker from './EmojiPicker.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  editPet: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const petsStore = usePetsStore()
const { getThemeColors } = useTheme()

const form = ref({
  name: '',
  emoji: '',
  species: '',
  birthday: '',
  themeColor: 'sage'
})

const loading = ref(false)
const error = ref('')

// Get all available theme colors
const themeColors = getThemeColors()

// Today's date for max birthday constraint
const today = computed(() => new Date().toISOString().split('T')[0])

// Reset or populate form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.editPet) {
      // Edit mode: populate with existing data
      form.value = {
        name: props.editPet.name || '',
        emoji: props.editPet.emoji || '',
        species: props.editPet.species || '',
        birthday: props.editPet.birthday || '',
        themeColor: props.editPet.themeColor || 'sage'
      }
    } else {
      // Add mode: reset form
      form.value = {
        name: '',
        emoji: '',
        species: '',
        birthday: '',
        themeColor: 'sage'
      }
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

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    let success

    if (props.editPet) {
      // Update existing pet
      success = await petsStore.updatePet(props.editPet.id, {
        name: form.value.name.trim(),
        emoji: form.value.emoji,
        species: form.value.species.trim(),
        birthday: form.value.birthday || null,
        themeColor: form.value.themeColor || 'sage'
      })
    } else {
      // Add new pet
      success = await petsStore.addPet(
        form.value.name,
        form.value.emoji,
        form.value.species,
        form.value.birthday,
        form.value.themeColor
      )
    }

    if (success) {
      close()
    }
  } catch (err) {
    error.value = err.message || `Failed to ${props.editPet ? 'update' : 'add'} pet`
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

/* Theme Color Picker Styles */
.theme-color-button {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-color-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-color-button:active {
  transform: scale(0.95);
}

.theme-color-button.selected {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1),
              0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.theme-color-button .checkmark {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Dark mode adjustments */
.dark .theme-color-button {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark .theme-color-button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark .theme-color-button.selected {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2),
              0 4px 12px rgba(0, 0, 0, 0.4);
}
</style>
