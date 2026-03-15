<template>
  <div class="progress-indicator">
    <div class="flex items-center justify-center gap-2">
      <div
        v-for="step in totalSteps"
        :key="step"
        class="progress-dot"
        :class="{
          'active': step <= currentStep,
          'current': step === currentStep
        }"
        :aria-label="`Step ${step} of ${totalSteps}`"
        :aria-current="step === currentStep ? 'step' : undefined"
      >
        <div class="dot-inner"></div>
      </div>
    </div>
    <p class="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
      Step {{ currentStep }} of {{ totalSteps }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true,
    validator: (value) => value >= 1
  },
  totalSteps: {
    type: Number,
    required: true,
    validator: (value) => value >= 1
  }
})
</script>

<style scoped>
.progress-indicator {
  margin-bottom: 2rem;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: all 300ms ease-in-out;
  position: relative;
}

.dark .progress-dot {
  background: #374151;
}

.progress-dot.active {
  background: #10b981;
}

.dark .progress-dot.active {
  background: #10b981;
}

.progress-dot.current {
  width: 14px;
  height: 14px;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.progress-dot .dot-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  opacity: 0;
  transition: opacity 300ms ease-in-out;
}

.progress-dot.current .dot-inner {
  opacity: 1;
}
</style>
