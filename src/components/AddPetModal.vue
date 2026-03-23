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
              Add New Pet
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
                {{ loading ? 'Adding...' : 'Add Pet' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePetsStore } from '@/stores/pets'
import EmojiPicker from './EmojiPicker.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const petsStore = usePetsStore()

const form = ref({
  name: '',
  emoji: '',
  species: ''
})

const loading = ref(false)
const error = ref('')

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value = {
      name: '',
      emoji: '',
      species: ''
    }
    error.value = ''
  } else {
    // Lock/unlock body scroll
    if (newVal) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
  }
})

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    const success = await petsStore.addPet(
      form.value.name,
      form.value.emoji,
      form.value.species
    )

    if (success) {
      close()
    }
  } catch (err) {
    error.value = err.message || 'Failed to add pet'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
