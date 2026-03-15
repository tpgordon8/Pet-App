<template>
  <StepContainer
    title="Create Your Account"
    subtitle="Quick and secure setup"
    :stepKey="4"
  >
    <form @submit.prevent="handleSubmit" class="create-account-form">
      <!-- Your Name -->
      <div class="form-group">
        <label for="name" class="form-label required">Your Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="e.g., Tara"
          class="input"
          required
          maxlength="20"
          data-test="name"
        >
      </div>

      <!-- Household Code (simplified) -->
      <div class="form-group">
        <label for="household-code" class="form-label">
          Household Code (Optional)
        </label>
        <input
          id="household-code"
          v-model="form.householdCode"
          type="text"
          placeholder="Auto-generated if empty"
          class="input"
          maxlength="20"
        >
        <p class="helper-text">
          Leave empty to auto-generate, or choose your own
        </p>
      </div>

      <!-- Passcode -->
      <div class="form-group">
        <label for="passcode" class="form-label required">
          Create 6-Digit Passcode
        </label>
        <input
          id="passcode"
          v-model="form.passcode"
          type="password"
          placeholder="••••••"
          class="input"
          required
          pattern="[0-9]{6}"
          maxlength="6"
          data-test="passcode"
        >
        <p class="helper-text">
          Used to share with family members
        </p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary w-full py-3"
        :disabled="!isFormValid || loading"
      >
        {{ loading ? 'Creating...' : 'Continue' }}
      </button>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>
  </StepContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import StepContainer from './StepContainer.vue'

const emit = defineEmits(['submit'])

const form = ref({
  name: '',
  householdCode: '',
  passcode: ''
})

const loading = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 &&
         form.value.passcode.length === 6 &&
         /^[0-9]{6}$/.test(form.value.passcode)
})

async function handleSubmit() {
  if (!isFormValid.value) return

  error.value = ''
  loading.value = true

  try {
    // Generate household code if not provided
    const householdCode = form.value.householdCode.trim() ||
                          generateHouseholdCode(form.value.name)

    emit('submit', {
      name: form.value.name.trim(),
      householdCode: householdCode.toUpperCase(),
      passcode: form.value.passcode
    })
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function generateHouseholdCode(name) {
  // Generate a code like "TARA2026"
  const year = new Date().getFullYear()
  const cleanName = name.trim().replace(/\s+/g, '').toUpperCase().slice(0, 10)
  return `${cleanName}${year}`
}
</script>

<style scoped>
.create-account-form {
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

.helper-text {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .helper-text {
  color: #9ca3af;
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
</style>
