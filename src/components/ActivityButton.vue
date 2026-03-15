<template>
  <button
    @click="handleClick"
    class="activity-button glass rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200 hover:shadow-glass-lg hover:-translate-y-1 active:translate-y-0"
    :class="customClass"
    :disabled="disabled"
  >
    <span class="text-5xl" :style="{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }">
      {{ emoji }}
    </span>
    <span class="text-lg font-semibold text-gray-800 dark:text-gray-100">
      {{ label }}
    </span>
    <span v-if="count !== undefined" class="text-sm text-gray-600 dark:text-gray-400">
      {{ count }} today
    </span>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  emoji: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: undefined
  },
  customClass: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.activity-button {
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 140px;
}

.activity-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.activity-button:not(:disabled):hover {
  transform: translateY(-4px);
}

.activity-button:not(:disabled):active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .activity-button {
    min-height: 120px;
    padding: 1rem;
  }

  .activity-button span:first-child {
    font-size: 2.5rem;
  }

  .activity-button span:nth-child(2) {
    font-size: 1rem;
  }
}
</style>
