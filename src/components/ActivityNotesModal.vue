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
import { ref, watch } from 'vue'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

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
const fileInputRef = ref(null)

// Reset when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    notes.value = ''
    photoFile.value = null
    photoPreview.value = null
  }
})

function handlePhotoSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error')
    event.target.value = ''
    return
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Photo must be less than 5MB', 'error')
    event.target.value = ''
    return
  }

  photoFile.value = file

  // Create preview
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

  // Reset file input so same file can be selected again
  const fileInput = event.target.closest('.card').querySelector('input[type="file"]')
  if (fileInput) {
    fileInput.value = ''
  }
}

function handleSkip() {
  emit('save', { notes: '', photo: null })
  emit('close')
}

function handleSave() {
  emit('save', {
    notes: notes.value.trim(),
    photo: photoFile.value
  })
  emit('close')
}
</script>

<style scoped>
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
