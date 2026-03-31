<template>
  <div class="circular-progress" :style="{ width: sizePx, height: sizePx }">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="circular-progress-svg"
    >
      <!-- Background circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        class="circular-progress-track"
        :stroke-width="strokeWidth"
        fill="none"
      />

      <!-- Progress circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        class="circular-progress-fill"
        :class="colorClass"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :stroke-linecap="rounded ? 'round' : 'butt'"
        fill="none"
        :style="{ transition: animated ? 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }"
      />

      <!-- Glow effect (optional) -->
      <circle
        v-if="showGlow"
        :cx="center"
        :cy="center"
        :r="radius"
        class="circular-progress-glow"
        :class="colorClass"
        :stroke-width="strokeWidth + 2"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :stroke-linecap="rounded ? 'round' : 'butt'"
        fill="none"
        :style="{ transition: animated ? 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }"
      />
    </svg>

    <!-- Center content -->
    <div class="circular-progress-content">
      <slot>
        <div class="circular-progress-value">
          <span class="circular-progress-number">{{ displayValue }}</span>
          <span v-if="!customValue" class="circular-progress-unit">%</span>
        </div>
        <div v-if="label" class="circular-progress-label">{{ label }}</div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  // Current value (0-100)
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100
  },
  // Size in pixels
  size: {
    type: Number,
    default: 120
  },
  // Stroke width in pixels
  strokeWidth: {
    type: Number,
    default: 8
  },
  // Color theme
  color: {
    type: String,
    default: 'primary'
  },
  // Label text
  label: {
    type: String,
    default: ''
  },
  // Custom value display
  customValue: {
    type: String,
    default: ''
  },
  // Rounded line caps
  rounded: {
    type: Boolean,
    default: true
  },
  // Animate progress
  animated: {
    type: Boolean,
    default: true
  },
  // Show glow effect
  showGlow: {
    type: Boolean,
    default: false
  }
})

const animatedValue = ref(0)

onMounted(() => {
  if (props.animated) {
    const duration = 800
    const steps = 60
    const increment = props.value / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      animatedValue.value = Math.min(currentStep * increment, props.value)
      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, stepDuration)
  } else {
    animatedValue.value = props.value
  }
})

watch(() => props.value, (newValue) => {
  if (props.animated) {
    const duration = 300
    const start = animatedValue.value
    const change = newValue - start
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = easeOutCubic(progress)
      animatedValue.value = start + change * easeProgress

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  } else {
    animatedValue.value = newValue
  }
})

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

const dashOffset = computed(() => {
  const progress = animatedValue.value / 100
  return circumference.value * (1 - progress)
})

const displayValue = computed(() => {
  if (props.customValue) return props.customValue
  return Math.round(animatedValue.value)
})

const sizePx = computed(() => `${props.size}px`)

const colorClass = computed(() => {
  return `progress-color-${props.color}`
})
</script>

<style scoped>
.circular-progress {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.circular-progress-svg {
  transform: rotate(-90deg);
}

.circular-progress-track {
  stroke: var(--gray-200);
}

.dark .circular-progress-track {
  stroke: var(--gray-700);
}

.circular-progress-fill {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.circular-progress-glow {
  opacity: 0.3;
  filter: blur(4px);
}

/* Color themes */
.progress-color-primary {
  stroke: var(--sage-500);
}

.progress-color-success {
  stroke: var(--success-500);
}

.progress-color-warning {
  stroke: var(--warning-500);
}

.progress-color-danger {
  stroke: var(--danger-500);
}

.progress-color-purple {
  stroke: var(--purple-500);
}

.progress-color-pink {
  stroke: var(--pink-500);
}

.progress-color-teal {
  stroke: var(--teal-500);
}

.progress-color-blue {
  stroke: var(--blue-500);
}

/* Center content */
.circular-progress-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.circular-progress-value {
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
}

.circular-progress-number {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--gray-900);
}

.dark .circular-progress-number {
  color: var(--gray-100);
}

.circular-progress-unit {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-600);
}

.dark .circular-progress-unit {
  color: var(--gray-400);
}

.circular-progress-label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-600);
}

.dark .circular-progress-label {
  color: var(--gray-400);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .circular-progress-fill,
  .circular-progress-glow {
    transition: none !important;
  }
}
</style>
