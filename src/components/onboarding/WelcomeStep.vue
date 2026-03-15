<template>
  <StepContainer
    title="Welcome to Tailr 🐾"
    subtitle="Track your pet's daily activities and health in real-time"
    :stepKey="1"
  >
    <div class="welcome-content">
      <!-- Value propositions -->
      <div class="value-props">
        <div class="value-prop">
          <span class="value-icon">🍖</span>
          <span class="value-text">Log meals, walks, bathroom breaks</span>
        </div>
        <div class="value-prop">
          <span class="value-icon">🏥</span>
          <span class="value-text">Track vet visits & medications</span>
        </div>
        <div class="value-prop">
          <span class="value-icon">👨‍👩‍👧‍👦</span>
          <span class="value-text">Share with family members</span>
        </div>
      </div>

      <!-- Primary CTA -->
      <button
        @click="$emit('create')"
        class="btn btn-primary w-full py-3 mb-3"
        data-test="get-started"
      >
        Get Started
      </button>

      <!-- Secondary CTA -->
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Already have an account?
        </p>
        <button
          @click="$emit('join')"
          class="btn btn-outline w-full py-2"
          data-test="join-household"
        >
          Join Household
        </button>
      </div>
    </div>
  </StepContainer>
</template>

<script setup>
import StepContainer from './StepContainer.vue'

defineEmits(['create', 'join'])
</script>

<style scoped>
.welcome-content {
  margin-top: 2rem;
}

.value-props {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.value-prop {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 0.75rem;
  transition: transform 150ms ease-in-out;
}

.dark .value-prop {
  background: rgba(16, 185, 129, 0.1);
}

.value-prop:hover {
  transform: translateX(4px);
}

.value-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.value-text {
  font-size: 0.95rem;
  color: #374151;
}

.dark .value-text {
  color: #d1d5db;
}

.btn-outline {
  background: transparent;
  border: 1.5px solid #d1d5db;
  color: #374151;
}

.dark .btn-outline {
  border-color: #4b5563;
  color: #d1d5db;
}

.btn-outline:hover {
  border-color: #10b981;
  color: #10b981;
}
</style>
