<template>
  <button
    @click="handleClick"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    class="activity-button glass rounded-2xl p-6 flex flex-col items-center gap-3 relative overflow-hidden"
    :class="[customClass, { 'button-pressed': isPressed, 'button-has-count': count > 0 }]"
    :disabled="disabled"
    :aria-label="`Log ${label} activity. ${count !== undefined ? count + ' logged today' : ''}`"
    role="button"
    tabindex="0"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Ripple effect -->
    <span
      v-if="showRipple"
      class="ripple-effect"
      :style="rippleStyle"
    ></span>

    <span class="emoji-icon" :style="{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }">
      {{ emoji }}
    </span>
    <span class="button-label">
      {{ label }}
    </span>
    <span v-if="count !== undefined" class="count-badge" :class="{ 'count-active': count > 0 }">
      {{ count }} today
    </span>

    <!-- Activity indicator -->
    <div v-if="count > 0" class="activity-indicator"></div>
  </button>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useHaptic } from '@/composables/useHaptic'

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
const haptic = useHaptic()

const isPressed = ref(false)
const showRipple = ref(false)
const rippleStyle = ref({})

function handleClick() {
  if (!props.disabled) {
    haptic.light()
    emit('click')
  }
}

function onTouchStart(event) {
  if (props.disabled) return

  isPressed.value = true

  // Create ripple effect
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  const touch = event.touches[0]
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  rippleStyle.value = {
    left: `${x}px`,
    top: `${y}px`,
  }

  showRipple.value = true

  setTimeout(() => {
    showRipple.value = false
  }, 600)
}

function onTouchEnd() {
  isPressed.value = false
}
</script>

<style scoped>
.activity-button {
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 140px;
  min-width: 44px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.activity-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.activity-button:not(:disabled):hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(139, 154, 125, 0.2);
  border-color: rgba(139, 154, 125, 0.3);
}

.activity-button:not(:disabled):active,
.activity-button.button-pressed {
  transform: translateY(-2px) scale(0.98);
}

.activity-button.button-has-count {
  border-color: rgba(139, 154, 125, 0.2);
}

.emoji-icon {
  font-size: 3rem;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.activity-button:hover .emoji-icon {
  transform: scale(1.1) rotate(-5deg);
}

.button-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  transition: color 0.2s;
}

.dark .button-label {
  color: #d1d5db;
}

.count-badge {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.dark .count-badge {
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.05);
}

.count-badge.count-active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  color: #059669;
  font-weight: 600;
}

.dark .count-badge.count-active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%);
  color: #10b981;
}

/* Activity indicator dot */
.activity-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  animation: pulse-indicator 2s ease-in-out infinite;
}

/* Ripple effect */
.ripple-effect {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(139, 154, 125, 0.5);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

@keyframes pulse-indicator {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}

@media (max-width: 640px) {
  .activity-button {
    min-height: 120px;
    padding: 1rem;
  }

  .emoji-icon {
    font-size: 2.5rem;
  }

  .button-label {
    font-size: 1rem;
  }
}
</style>
