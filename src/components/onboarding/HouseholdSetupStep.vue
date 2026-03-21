<template>
  <StepContainer
    title="Share with Others?"
    :subtitle="`Would you like to share ${petName} with family or caregivers?`"
    :stepKey="5"
  >
    <div class="household-setup-content">
      <!-- Choice Cards -->
      <div class="choice-cards">
        <button
          @click="handleChoice(true)"
          class="choice-card"
          data-test="yes-sharing"
        >
          <span class="choice-icon">👨‍👩‍👧‍👦</span>
          <h3 class="choice-title">Yes, Set Up Sharing</h3>
          <p class="choice-description">
            Coordinate pet care with family members
          </p>
        </button>

        <button
          @click="handleChoice(false)"
          class="choice-card"
          data-test="just-me"
        >
          <span class="choice-icon">👤</span>
          <h3 class="choice-title">No, Just Me For Now</h3>
          <p class="choice-description">
            Track your pet solo (you can add others later)
          </p>
        </button>
      </div>

      <!-- Info Message -->
      <div class="info-message">
        <span class="info-icon">ℹ️</span>
        <p>You can change this later in settings</p>
      </div>

      <!-- Household Info (if created) -->
      <div v-if="showHouseholdInfo" class="household-info">
        <h3 class="info-title">Your Household Code</h3>
        <div class="code-display">
          <span class="code-text">{{ householdCode }}</span>
          <div class="code-actions">
            <button @click="copyCode" class="code-action-button">
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
        <p class="info-description">
          Share this code with family members so they can join your household
        </p>
        <button
          @click="$emit('done')"
          class="btn btn-primary w-full py-3 mt-4"
        >
          Done!
        </button>
      </div>
    </div>
  </StepContainer>
</template>

<script setup>
import { ref } from 'vue'
import StepContainer from './StepContainer.vue'

const props = defineProps({
  petName: {
    type: String,
    default: 'your pet'
  },
  householdCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['choose-sharing', 'choose-solo', 'done'])

const showHouseholdInfo = ref(false)
const copied = ref(false)

function handleChoice(wantSharing) {
  if (wantSharing) {
    showHouseholdInfo.value = true
    emit('choose-sharing')
  } else {
    emit('choose-solo')
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.householdCode)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    // Note: useToast not imported in this component, error is silently handled
    // This is acceptable for onboarding flow where clipboard is optional
  }
}
</script>

<style scoped>
.household-setup-content {
  margin-top: 1.5rem;
}

.choice-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.choice-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.dark .choice-card {
  background: #1f2937;
  border-color: #374151;
}

.choice-card:hover {
  border-color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.choice-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.choice-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.dark .choice-title {
  color: #f9fafb;
}

.choice-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dark .choice-description {
  color: #9ca3af;
}

.info-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .info-message {
  background: rgba(16, 185, 129, 0.1);
  color: #9ca3af;
}

.info-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.household-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.75rem;
}

.dark .household-info {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 1rem;
  text-align: center;
}

.code-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
}

.dark .code-display {
  background: #1f2937;
}

.code-text {
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #10b981;
  letter-spacing: 2px;
}

.code-actions {
  display: flex;
  gap: 0.5rem;
}

.code-action-button {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease-in-out;
}

.code-action-button:hover {
  background: #059669;
}

.info-description {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

.dark .info-description {
  color: #9ca3af;
}
</style>
