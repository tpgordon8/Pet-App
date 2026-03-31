<template>
  <div class="progress-bar-container" :class="{ 'progress-bar-animated': animated }">
    <div v-if="label" class="progress-bar-header">
      <span class="progress-bar-label">{{ label }}</span>
      <span class="progress-bar-value">{{ displayValue }}</span>
    </div>

    <div
      class="progress-bar-track"
      :class="[sizeClass, roundedClass]"
      :style="{ height: trackHeight }"
    >
      <div
        class="progress-bar-fill"
        :class="[colorClass, { 'progress-bar-striped': striped, 'progress-bar-pulse': pulse }]"
        :style="fillStyle"
        :aria-valuenow="percentage"
        :aria-valuemin="0"
        :aria-valuemax="100"
        role="progressbar"
        :aria-label="label || 'Progress'"
      >
        <div v-if="showGlow" class="progress-bar-glow"></div>
      </div>
    </div>

    <div v-if="helpText" class="progress-bar-help">
      {{ helpText }}
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
  // Label text
  label: {
    type: String,
    default: ''
  },
  // Help text below bar
  helpText: {
    type: String,
    default: ''
  },
  // Color theme: primary, success, warning, danger, purple, pink, gradient
  color: {
    type: String,
    default: 'primary'
  },
  // Size: xs, sm, md, lg
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  // Custom height (overrides size)
  height: {
    type: String,
    default: ''
  },
  // Show percentage value
  showValue: {
    type: Boolean,
    default: true
  },
  // Custom value display (e.g., "5/10")
  customValue: {
    type: String,
    default: ''
  },
  // Striped pattern
  striped: {
    type: Boolean,
    default: false
  },
  // Animated fill
  animated: {
    type: Boolean,
    default: true
  },
  // Pulse effect
  pulse: {
    type: Boolean,
    default: false
  },
  // Glow effect
  showGlow: {
    type: Boolean,
    default: false
  },
  // Rounded corners: none, sm, md, lg, full
  rounded: {
    type: String,
    default: 'full',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'full'].includes(value)
  }
})

const animatedValue = ref(0)

onMounted(() => {
  if (props.animated) {
    // Animate from 0 to current value
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

const percentage = computed(() => {
  return Math.max(0, Math.min(100, Math.round(animatedValue.value)))
})

const displayValue = computed(() => {
  if (props.customValue) return props.customValue
  if (props.showValue) return `${percentage.value}%`
  return ''
})

const sizeMap = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px'
}

const trackHeight = computed(() => {
  return props.height || sizeMap[props.size] || sizeMap.md
})

const sizeClass = computed(() => `progress-bar-${props.size}`)
const roundedClass = computed(() => `progress-bar-rounded-${props.rounded}`)

const colorClass = computed(() => {
  const colorMap = {
    primary: 'progress-fill-primary',
    success: 'progress-fill-success',
    warning: 'progress-fill-warning',
    danger: 'progress-fill-danger',
    purple: 'progress-fill-purple',
    pink: 'progress-fill-pink',
    teal: 'progress-fill-teal',
    gradient: 'progress-fill-gradient'
  }
  return colorMap[props.color] || colorMap.primary
})

const fillStyle = computed(() => {
  return {
    width: `${percentage.value}%`
  }
})
</script>

<style scoped>
.progress-bar-container {
  width: 100%;
}

.progress-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-bar-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}

.dark .progress-bar-label {
  color: var(--gray-300);
}

.progress-bar-value {
  font-size: 0.875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--gray-900);
}

.dark .progress-bar-value {
  color: var(--gray-100);
}

.progress-bar-track {
  position: relative;
  width: 100%;
  background: var(--gray-200);
  overflow: hidden;
}

.dark .progress-bar-track {
  background: var(--gray-700);
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.progress-bar-animated .progress-bar-fill {
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Rounded corners */
.progress-bar-rounded-none { border-radius: 0; }
.progress-bar-rounded-sm { border-radius: 2px; }
.progress-bar-rounded-sm .progress-bar-fill { border-radius: 2px; }
.progress-bar-rounded-md { border-radius: 6px; }
.progress-bar-rounded-md .progress-bar-fill { border-radius: 6px; }
.progress-bar-rounded-lg { border-radius: 12px; }
.progress-bar-rounded-lg .progress-bar-fill { border-radius: 12px; }
.progress-bar-rounded-full { border-radius: 9999px; }
.progress-bar-rounded-full .progress-bar-fill { border-radius: 9999px; }

/* Color fills */
.progress-fill-primary {
  background: linear-gradient(90deg, var(--sage-500) 0%, var(--sage-400) 100%);
}

.progress-fill-success {
  background: linear-gradient(90deg, var(--success-600) 0%, var(--success-400) 100%);
}

.progress-fill-warning {
  background: linear-gradient(90deg, var(--warning-600) 0%, var(--warning-400) 100%);
}

.progress-fill-danger {
  background: linear-gradient(90deg, var(--danger-600) 0%, var(--danger-400) 100%);
}

.progress-fill-purple {
  background: linear-gradient(90deg, var(--purple-600) 0%, var(--purple-400) 100%);
}

.progress-fill-pink {
  background: linear-gradient(90deg, var(--pink-600) 0%, var(--pink-400) 100%);
}

.progress-fill-teal {
  background: linear-gradient(90deg, var(--teal-600) 0%, var(--teal-400) 100%);
}

.progress-fill-gradient {
  background: linear-gradient(90deg, var(--purple-500) 0%, var(--pink-400) 50%, var(--orange-400) 100%);
}

/* Striped pattern */
.progress-bar-striped::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 20px 0;
  }
}

/* Pulse effect */
.progress-bar-pulse {
  animation: progress-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes progress-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Glow effect */
.progress-bar-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: progress-glow 2s ease-in-out infinite;
}

@keyframes progress-glow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-bar-help {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--gray-600);
}

.dark .progress-bar-help {
  color: var(--gray-400);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .progress-bar-fill,
  .progress-bar-striped::before,
  .progress-bar-pulse,
  .progress-bar-glow {
    animation: none !important;
    transition: none !important;
  }
}
</style>
