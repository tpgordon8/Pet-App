<template>
  <StepContainer
    title="Join a Household"
    subtitle="Enter the code shared with you"
    :stepKey="1"
  >
    <form @submit.prevent="handleSubmit" class="join-household-form">
      <!-- Your Name -->
      <div class="form-group">
        <label for="name" class="form-label required">Your Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="e.g., Meag"
          class="input"
          required
          maxlength="20"
        >
      </div>

      <!-- Household Code -->
      <div class="form-group">
        <label for="household-code" class="form-label required">
          Household Code
        </label>
        <input
          id="household-code"
          v-model="form.householdCode"
          type="text"
          placeholder="e.g., LUNA2024"
          class="input"
          required
          maxlength="20"
        >
      </div>

      <!-- Passcode -->
      <div class="form-group">
        <label for="passcode" class="form-label required">Passcode</label>
        <input
          id="passcode"
          v-model="form.passcode"
          type="password"
          placeholder="••••••"
          class="input"
          required
          pattern="[0-9]{6}"
          maxlength="6"
        >
      </div>

      <!-- Helper Text -->
      <div class="helper-box">
        <p class="helper-text">
          💡 The person who created the household will share a code like "LUNA2024" and a 6-digit passcode
        </p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary w-full py-3"
        :disabled="!isFormValid || loading"
      >
        {{ loading ? 'Joining...' : 'Join Household' }}
      </button>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Switch to Create -->
      <div class="switch-mode">
        <button
          type="button"
          @click="$emit('switch-to-create')"
          class="switch-button"
        >
          Don't have a code? Create New Household
        </button>
      </div>
    </form>
  </StepContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import StepContainer from './StepContainer.vue'

const emit = defineEmits(['submit', 'switch-to-create'])

const form = ref({
  name: '',
  householdCode: '',
  passcode: ''
})

const loading = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 &&
         form.value.householdCode.trim().length > 0 &&
         form.value.passcode.length === 6 &&
         /^[0-9]{6}$/.test(form.value.passcode)
})

async function handleSubmit() {
  if (!isFormValid.value) return

  error.value = ''
  loading.value = true

  try {
    emit('submit', {
      name: form.value.name.trim(),
      householdCode: form.value.householdCode.trim().toUpperCase(),
      passcode: form.value.passcode
    })
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}
</script>

<style scoped>
.join-household-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .form-label {
  color: #d1d5db;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.helper-box {
  padding: 1rem;
  background: rgba(16, 185, 129, 0.05);
  border-left: 3px solid #10b981;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.dark .helper-box {
  background: rgba(16, 185, 129, 0.1);
}

.helper-text {
  font-size: 0.875rem;
  color: #374151;
  margin: 0;
}

.dark .helper-text {
  color: #d1d5db;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
}

.dark .error-message {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.3);
  color: #fca5a5;
}

.switch-mode {
  margin-top: 1.5rem;
  text-align: center;
}

.switch-button {
  background: transparent;
  border: none;
  color: #10b981;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  transition: opacity 150ms ease-in-out;
}

.switch-button:hover {
  opacity: 0.8;
}
</style>
