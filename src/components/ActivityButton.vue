<template>
  <button
    @click="handleClick"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    class="activity-btn-modern hover-lift active-press flex flex-col items-center gap-3 relative overflow-hidden"
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

    <!-- Icon (Lucide SVG) -->
    <span class="icon-container" :style="{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }">
      <component :is="iconComponent" :size="iconSize" :stroke-width="2.5" class="activity-icon" />
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
import { ref, computed } from 'vue'
import { useHaptic } from '@/composables/useHaptic'
import { useAnimations } from '@/composables/useAnimations'
import {
  Droplet,
  Droplets,
  UtensilsCrossed,
  Moon,
  Pill,
  Footprints,
  Stethoscope,
  Syringe,
  Scale,
  Paw
} from 'lucide-vue-next'

const props = defineProps({
  icon: {
    type: String,
    required: true,
    validator: (value) => [
      'poop',
      'pee',
      'food',
      'sleep',
      'meds',
      'walk',
      'vet',
      'vaccination',
      'weight'
    ].includes(value)
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
const { celebrateSuccess } = useAnimations()

const isPressed = ref(false)
const showRipple = ref(false)
const rippleStyle = ref({})

// Icon mapping
const iconMap = {
  poop: Droplet,
  pee: Droplets,
  food: UtensilsCrossed,
  sleep: Moon,
  meds: Pill,
  walk: Footprints,
  vet: Stethoscope,
  vaccination: Syringe,
  weight: Scale,
  default: Paw
}

const iconComponent = computed(() => iconMap[props.icon] || iconMap.default)
const iconSize = computed(() => window.innerWidth <= 640 ? 32 : 40)

function handleClick(event) {
  if (!props.disabled) {
    haptic.light()

    // Add celebration animation on click
    if (event.currentTarget) {
      celebrateSuccess(event.currentTarget, {
        duration: 300,
        scale: 1.05,
        confetti: false
      })
    }

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
/* Using design system classes with minor customizations */
.activity-btn-modern {
  min-height: 100px;
  min-width: 44px;
}

.activity-btn-modern:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.activity-btn-modern.button-has-count {
  border-color: rgba(139, 154, 125, 0.3);
  box-shadow: 0 4px 12px rgba(139, 154, 125, 0.15);
}

/* Medical button compact variant */
.activity-btn-modern.medical-button-compact {
  min-width: 140px;
  flex-shrink: 0;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-center;
}

.activity-icon {
  color: #6d7e60;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dark .activity-icon {
  color: #8B9A7D;
}

.activity-btn-modern:hover .activity-icon {
  transform: scale(1.15) rotate(-5deg);
  color: #8B9A7D;
}

.dark .activity-btn-modern:hover .activity-icon {
  color: #a0b28f;
}

.button-label {
  @apply text-base font-semibold leading-normal;
  @apply text-gray-900 dark:text-white;
  transition: color 0.2s;
}

.count-badge {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5;
  @apply rounded-full text-xs font-semibold;
  @apply bg-gradient-to-r from-sage-100 to-sage-50;
  @apply dark:from-sage-900/30 dark:to-sage-800/20;
  @apply text-sage-700 dark:text-sage-300;
  transition: all 0.2s;
}

.count-badge.count-active {
  @apply bg-green-100 text-green-700;
  @apply dark:bg-green-900/20 dark:text-green-300;
}

/* Activity indicator dot */
.activity-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
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
  .activity-btn-modern {
    min-height: 85px;
    padding: 0.75rem;
  }

  .button-label {
    font-size: 0.875rem;
  }

  .count-badge {
    font-size: 0.75rem;
  }

  /* Medical compact variant on mobile */
  .activity-btn-modern.medical-button-compact {
    min-width: 120px;
  }
}

/* Very small screens (3-4 column grid) */
@media (max-width: 390px) {
  .activity-btn-modern {
    min-height: 80px;
    padding: 0.625rem;
  }

  .button-label {
    font-size: 0.75rem;
  }
}
</style>
