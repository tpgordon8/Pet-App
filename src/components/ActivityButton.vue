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
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
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
const { width: windowWidth } = useWindowSize()

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

function onTouchStart() {
  if (props.disabled) return
  isPressed.value = true
}

function onTouchEnd() {
  isPressed.value = false
}

</script>

<style scoped>
/* Activity button — flat, solid, calm */
.activity-btn-premium:focus-visible {
  outline: 2px solid var(--activity-color-primary, #6d7e60);
  outline-offset: 2px;
}

.activity-btn-premium {
  min-height: 100px;
  min-width: 44px;
  padding: 1rem 0.75rem;
  border-radius: 1rem;

  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;

  cursor: pointer;
  user-select: none;
}

/* Dark mode */
.dark .activity-btn-premium {
  background: #1f2937;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Hover state — subtle lift */
.activity-btn-premium:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: var(--activity-color-primary, rgba(0, 0, 0, 0.15));
}

.dark .activity-btn-premium:hover:not(:disabled) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* Press state */
.activity-btn-premium.button-pressed {
  transform: scale(0.97);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* Active state (count > 0) — solid tint, no gradient */
.activity-btn-premium.button-active {
  background: var(--activity-color-light, #f0f4ed);
  border-color: var(--activity-color-primary, rgba(139, 154, 125, 0.4));
  box-shadow: 0 1px 3px var(--activity-color-shadow, rgba(139, 154, 125, 0.15));
}

.dark .activity-btn-premium.button-active {
  background: color-mix(in srgb, var(--activity-color-primary, #6d7e60) 15%, #1f2937);
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
  transition: transform 0.15s ease;
}

.activity-btn-premium:hover:not(:disabled) .activity-icon {
  transform: scale(1.08);
}

@media (prefers-reduced-motion: reduce) {
  .activity-btn-premium:hover:not(:disabled) .activity-icon {
    transform: none;
  }
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
  background: var(--activity-color-primary, #6d7e60);
  border-radius: 50%;
  animation: pulse-indicator 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .activity-indicator {
    animation: none;
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
