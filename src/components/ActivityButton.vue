<template>
  <button
    @click="handleClick"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    class="activity-btn-premium flex flex-col items-center gap-2.5 relative overflow-hidden"
    :class="[
      customClass,
      activityClass,
      {
        'button-pressed': isPressed,
        'button-active': count > 0
      }
    ]"
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
    <span class="icon-container">
      <component
        :is="iconComponent"
        :size="iconSize"
        :stroke-width="strokeWidth"
        class="activity-icon"
      />
    </span>

    <span class="button-label">
      {{ label }}
    </span>

    <span v-if="count !== undefined" class="count-badge" :class="{ 'has-count': count > 0 }">
      {{ count }} today
    </span>

    <!-- Activity indicator dot -->
    <div v-if="count > 0" class="activity-indicator"></div>
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  PawPrint
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
const windowWidth = ref(window.innerWidth)

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
  default: PawPrint
}

// Activity class for color coding
const activityClass = computed(() => `activity-${props.icon}`)

// Icon component
const iconComponent = computed(() => iconMap[props.icon] || iconMap.default)

// Responsive icon sizing
const iconSize = computed(() => {
  if (windowWidth.value < 375) return 26 // iPhone SE and smaller
  if (windowWidth.value < 640) return 28 // Mobile
  if (windowWidth.value < 1024) return 32 // Tablet
  return 36 // Desktop
})

// Responsive stroke width
const strokeWidth = computed(() => {
  if (windowWidth.value < 640) return 2.0  // Mobile - thinner
  return 2.25  // Desktop - slightly thicker
})

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

// Handle window resize for responsive icon sizing
function handleResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Premium activity button with color-coded design */
.activity-btn-premium {
  /* Base styling */
  min-height: 100px;
  min-width: 44px;
  padding: 1rem 0.75rem;
  border-radius: 1rem;

  /* Enhanced gradient background */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.92) 100%
  );

  /* Stronger border */
  border: 1.5px solid rgba(0, 0, 0, 0.10);

  /* Multi-layer shadow for depth */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 8px 20px rgba(0, 0, 0, 0.02);

  /* Smooth transitions */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Remove default button styling */
  cursor: pointer;
  user-select: none;
}

/* Dark mode */
.dark .activity-btn-premium {
  background: linear-gradient(
    135deg,
    rgba(55, 65, 81, 0.95) 0%,
    rgba(31, 41, 55, 0.9) 100%
  );

  border-color: rgba(255, 255, 255, 0.12);

  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.25),
    0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Hover state */
.activity-btn-premium:hover:not(:disabled) {
  transform: translateY(-3px);

  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 12px 28px var(--activity-color-shadow, rgba(0, 0, 0, 0.04));

  border-color: var(--activity-color-primary, rgba(0, 0, 0, 0.15));
}

.dark .activity-btn-premium:hover:not(:disabled) {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 4px 12px var(--activity-color-shadow, rgba(0, 0, 0, 0.3)),
    0 12px 28px var(--activity-color-shadow, rgba(0, 0, 0, 0.25));
}

/* Active state (has count > 0) */
.activity-btn-premium.button-active {
  background: linear-gradient(
    135deg,
    var(--activity-color-light, #f0f4ed) 0%,
    rgba(255, 255, 255, 0.95) 100%
  );

  border-color: var(--activity-color-primary, rgba(139, 154, 125, 0.3));
  border-width: 2px;

  box-shadow:
    0 2px 4px var(--activity-color-shadow, rgba(139, 154, 125, 0.1)),
    0 4px 12px var(--activity-color-shadow, rgba(139, 154, 125, 0.08)),
    0 8px 24px var(--activity-color-shadow, rgba(139, 154, 125, 0.06));
}

.dark .activity-btn-premium.button-active {
  background: linear-gradient(
    135deg,
    var(--activity-color-light, rgba(139, 154, 125, 0.2)) 0%,
    rgba(55, 65, 81, 0.95) 100%
  );

  border-color: var(--activity-color-primary, rgba(139, 154, 125, 0.4));
}

/* Disabled state */
.activity-btn-premium:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Medical button compact variant */
.activity-btn-premium.medical-button-compact {
  min-width: 140px;
  flex-shrink: 0;
}

/* Icon container */
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Activity icon */
.activity-icon {
  color: var(--activity-color-primary, #6d7e60);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.dark .activity-icon {
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
}

.activity-btn-premium:hover:not(:disabled) .activity-icon {
  transform: scale(1.15) rotate(-5deg);
}

/* Button label */
.button-label {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.9375rem;  /* 15px */
  font-weight: 600;
  line-height: 1.3;
  color: #1f2937;
  transition: color 0.2s;
}

.dark .button-label {
  color: #f3f4f6;
}

/* Count badge - premium design */
.count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 100px;

  /* Neutral state */
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.5);
  border: 1px solid transparent;

  /* Typography - label-small */
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.75rem;  /* 12px */
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  transition: all 0.2s;
}

.dark .count-badge {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

/* Count badge active (count > 0) - Phase 9: Premium pill design */
.count-badge.has-count {
  background: var(--activity-color-light, #e8f6ef);
  color: var(--activity-color-dark, #1a7c43);
  border-color: var(--activity-color-primary, #27ae60);
  font-weight: 800;
  /* Enhanced shadow for depth */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08),
              0 0 0 1px var(--activity-color-primary, #27ae60);
}

.dark .count-badge.has-count {
  background: var(--activity-color-primary, #27ae60);
  color: white;
  font-weight: 800;
  /* Stronger shadow in dark mode */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3),
              0 0 8px var(--activity-color-shadow, rgba(39, 174, 96, 0.4));
}

/* Activity indicator dot */
.activity-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 6px;
  height: 6px;
  background: var(--activity-color-primary, #10b981);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--activity-color-shadow, rgba(16, 185, 129, 0.5));
  animation: pulse-indicator 2s ease-in-out infinite;
}

/* Ripple effect */
.ripple-effect {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--activity-color-primary, rgba(139, 154, 125, 0.4));
  opacity: 0.5;
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.6;
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
    opacity: 0.6;
    transform: scale(1.3);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .activity-btn-premium {
    min-height: 90px;
    padding: 0.875rem 0.625rem;
    gap: 0.5rem;
  }

  .button-label {
    font-size: 0.875rem;  /* 14px */
  }

  .count-badge {
    font-size: 0.625rem;  /* 10px */
    padding: 0.1875rem 0.5rem;
  }

  .activity-btn-premium.medical-button-compact {
    min-width: 120px;
  }
}

/* Very small screens */
@media (max-width: 374px) {
  .activity-btn-premium {
    min-height: 85px;
    padding: 0.75rem 0.5rem;
  }

  .button-label {
    font-size: 0.8125rem;  /* 13px */
  }
}
</style>
