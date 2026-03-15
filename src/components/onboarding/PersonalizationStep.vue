<template>
  <StepContainer
    title="What brings you here?"
    subtitle="Help us personalize your experience"
    :stepKey="3"
  >
    <div class="personalization-content">
      <div class="use-case-cards">
        <button
          v-for="useCase in useCases"
          :key="useCase.value"
          @click="selectUseCase(useCase.value)"
          class="use-case-card"
          :class="{ selected: selectedUseCase === useCase.value }"
          :data-test="`use-case-${useCase.value}`"
        >
          <span class="use-case-icon">{{ useCase.icon }}</span>
          <div class="use-case-content">
            <h3 class="use-case-title">{{ useCase.title }}</h3>
            <p class="use-case-description">{{ useCase.description }}</p>
          </div>
          <div class="check-indicator">
            <span v-if="selectedUseCase === useCase.value" class="checkmark">✓</span>
          </div>
        </button>
      </div>

      <div class="action-buttons">
        <button
          @click="handleContinue"
          class="btn btn-primary w-full py-3"
          :disabled="!selectedUseCase"
          data-test="continue"
        >
          Continue
        </button>
        <button
          @click="$emit('skip')"
          class="skip-button"
        >
          Skip this step
        </button>
      </div>
    </div>
  </StepContainer>
</template>

<script setup>
import { ref } from 'vue'
import StepContainer from './StepContainer.vue'

const emit = defineEmits(['submit', 'skip'])

const useCases = [
  {
    value: 'daily',
    icon: '🍖',
    title: 'Track daily activities',
    description: 'Log meals, walks, and bathroom breaks'
  },
  {
    value: 'health',
    icon: '🏥',
    title: 'Monitor health & vet visits',
    description: 'Track medications, weight, and medical records'
  },
  {
    value: 'coordinate',
    icon: '👨‍👩‍👧‍👦',
    title: 'Coordinate with others',
    description: 'Share pet care with family or caregivers'
  },
  {
    value: 'all',
    icon: '⭐',
    title: 'All of the above!',
    description: 'Complete pet care management'
  }
]

const selectedUseCase = ref('all')

function selectUseCase(value) {
  selectedUseCase.value = value
}

function handleContinue() {
  if (selectedUseCase.value) {
    emit('submit', selectedUseCase.value)
  }
}
</script>

<style scoped>
.personalization-content {
  margin-top: 1.5rem;
}

.use-case-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.use-case-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  text-align: left;
  transition: all 150ms ease-in-out;
}

.dark .use-case-card {
  background: #1f2937;
  border-color: #374151;
}

.use-case-card:hover {
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.use-case-card.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.dark .use-case-card.selected {
  background: rgba(16, 185, 129, 0.1);
}

.use-case-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.use-case-content {
  flex: 1;
}

.use-case-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.dark .use-case-title {
  color: #f9fafb;
}

.use-case-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dark .use-case-description {
  color: #9ca3af;
}

.check-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkmark {
  color: #10b981;
  font-size: 1.25rem;
  font-weight: bold;
}

.action-buttons {
  margin-top: 1.5rem;
}

.skip-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.75rem;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 150ms ease-in-out;
}

.dark .skip-button {
  color: #9ca3af;
}

.skip-button:hover {
  color: #10b981;
}
</style>
