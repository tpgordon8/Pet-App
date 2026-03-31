<template>
  <div class="step-container">
    <transition motion-reduce:transition-none name="slide-fade" mode="out-in">
      <div :key="stepKey" class="step-content">
        <h2 v-if="title" class="step-title">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="step-subtitle">
          {{ subtitle }}
        </p>
        <slot></slot>
      </div>
    </transition motion-reduce:transition-none>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  stepKey: {
    type: [String, Number],
    required: true
  }
})
</script>

<style scoped>
.step-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.step-content {
  padding: 1rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 0.5rem;
  text-align: center;
}

.dark .step-title {
  color: #10b981;
}

.step-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  text-align: center;
}

.dark .step-subtitle {
  color: #9ca3af;
}

/* Slide fade transition motion-reduce:transition-none */
.slide-fade-enter-active {
  transition: all 300ms ease-out;
}

.slide-fade-leave-active {
  transition: all 200ms ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Accessibility: Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
</style>
