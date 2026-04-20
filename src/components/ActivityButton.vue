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

/* ===================================================
   Per-activity color coding via CSS custom properties
   These feed into all the button states above
   =================================================== */

/* Poop — warm brown */
.activity-poop {
  --activity-color-primary: #92400e;
  --activity-color-light:   #fef3c7;
  --activity-color-dark:    #78350f;
  --activity-color-shadow:  rgba(146, 64, 14, 0.22);
}
.dark .activity-poop {
  --activity-color-primary: #fbbf24;
  --activity-color-light:   rgba(251, 191, 36, 0.18);
  --activity-color-dark:    #f59e0b;
  --activity-color-shadow:  rgba(251, 191, 36, 0.25);
}

/* Pee — amber yellow */
.activity-pee {
  --activity-color-primary: #d97706;
  --activity-color-light:   #fef9c3;
  --activity-color-dark:    #b45309;
  --activity-color-shadow:  rgba(217, 119, 6, 0.22);
}
.dark .activity-pee {
  --activity-color-primary: #fcd34d;
  --activity-color-light:   rgba(252, 211, 77, 0.18);
  --activity-color-dark:    #fbbf24;
  --activity-color-shadow:  rgba(252, 211, 77, 0.25);
}

/* Food — fresh green */
.activity-food {
  --activity-color-primary: #16a34a;
  --activity-color-light:   #dcfce7;
  --activity-color-dark:    #15803d;
  --activity-color-shadow:  rgba(22, 163, 74, 0.22);
}
.dark .activity-food {
  --activity-color-primary: #4ade80;
  --activity-color-light:   rgba(74, 222, 128, 0.18);
  --activity-color-dark:    #22c55e;
  --activity-color-shadow:  rgba(74, 222, 128, 0.25);
}

/* Sleep — soft violet */
.activity-sleep {
  --activity-color-primary: #7c3aed;
  --activity-color-light:   #ede9fe;
  --activity-color-dark:    #6d28d9;
  --activity-color-shadow:  rgba(124, 58, 237, 0.22);
}
.dark .activity-sleep {
  --activity-color-primary: #a78bfa;
  --activity-color-light:   rgba(167, 139, 250, 0.18);
  --activity-color-dark:    #8b5cf6;
  --activity-color-shadow:  rgba(167, 139, 250, 0.25);
}

/* Meds — rose red */
.activity-meds {
  --activity-color-primary: #e11d48;
  --activity-color-light:   #ffe4e6;
  --activity-color-dark:    #be123c;
  --activity-color-shadow:  rgba(225, 29, 72, 0.22);
}
.dark .activity-meds {
  --activity-color-primary: #fb7185;
  --activity-color-light:   rgba(251, 113, 133, 0.18);
  --activity-color-dark:    #f43f5e;
  --activity-color-shadow:  rgba(251, 113, 133, 0.25);
}

/* Walk — ocean teal */
.activity-walk {
  --activity-color-primary: #0891b2;
  --activity-color-light:   #cffafe;
  --activity-color-dark:    #0e7490;
  --activity-color-shadow:  rgba(8, 145, 178, 0.22);
}
.dark .activity-walk {
  --activity-color-primary: #22d3ee;
  --activity-color-light:   rgba(34, 211, 238, 0.18);
  --activity-color-dark:    #06b6d4;
  --activity-color-shadow:  rgba(34, 211, 238, 0.25);
}

/* Vet — medical red */
.activity-vet {
  --activity-color-primary: #dc2626;
  --activity-color-light:   #fee2e2;
  --activity-color-dark:    #b91c1c;
  --activity-color-shadow:  rgba(220, 38, 38, 0.22);
}
.dark .activity-vet {
  --activity-color-primary: #f87171;
  --activity-color-light:   rgba(248, 113, 113, 0.18);
  --activity-color-dark:    #ef4444;
  --activity-color-shadow:  rgba(248, 113, 113, 0.25);
}

/* Vaccination — electric purple */
.activity-vaccination {
  --activity-color-primary: #9333ea;
  --activity-color-light:   #f3e8ff;
  --activity-color-dark:    #7e22ce;
  --activity-color-shadow:  rgba(147, 51, 234, 0.22);
}
.dark .activity-vaccination {
  --activity-color-primary: #c084fc;
  --activity-color-light:   rgba(192, 132, 252, 0.18);
  --activity-color-dark:    #a855f7;
  --activity-color-shadow:  rgba(192, 132, 252, 0.25);
}

/* Weight — warm orange */
.activity-weight {
  --activity-color-primary: #ea580c;
  --activity-color-light:   #ffedd5;
  --activity-color-dark:    #c2410c;
  --activity-color-shadow:  rgba(234, 88, 12, 0.22);
}
.dark .activity-weight {
  --activity-color-primary: #fb923c;
  --activity-color-light:   rgba(251, 146, 60, 0.18);
  --activity-color-dark:    #f97316;
  --activity-color-shadow:  rgba(251, 146, 60, 0.25);
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
