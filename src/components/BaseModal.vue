<template>
  <!-- Modal Overlay -->
  <Transition name="modal-fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="handleOverlayClick"
    >
      <!-- Modal Card -->
      <Transition name="modal-slide">
        <div
          v-if="modelValue"
          class="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
          :class="cardClass"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ title }}
            </h2>
            <button
              v-if="showClose"
              type="button"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              :aria-label="`Close ${title} modal`"
              @click="handleClose"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content Slot -->
          <div class="modal-content">
            <slot />
          </div>

          <!-- Footer/Actions Slot -->
          <div v-if="$slots.actions" class="flex gap-3 mt-6">
            <slot name="actions" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
// defineProps and defineEmits are compiler macros in Vue 3 - no import needed

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  cardClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    handleClose()
  }
}
</script>

<style scoped>
/* Modal transitions with improved animations */
.modal-fade-enter-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.25s ease;
  will-change: transform, opacity;
}

.modal-slide-leave-active {
  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1),
              opacity 0.2s ease;
  will-change: transform, opacity;
}

.modal-slide-enter-from {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}

.modal-slide-leave-to {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Smooth scrolling for modal content */
.modal-content {
  scroll-behavior: smooth;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .modal-slide-enter-from {
    transform: translateY(100%);
  }

  .modal-slide-leave-to {
    transform: translateY(100%);
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active,
  .modal-fade-leave-active,
  .modal-slide-enter-active,
  .modal-slide-leave-active {
    transition: none;
  }
}
</style>
