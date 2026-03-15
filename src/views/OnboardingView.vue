<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card max-w-md w-full space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-sage-600 dark:text-sage-400">
          Welcome to Tailr 🐾
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Create or join a household
        </p>
      </div>

      <!-- Tab selector -->
      <div class="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          @click="mode = 'create'"
          class="flex-1 py-2 px-4 rounded-md font-medium transition-all"
          :class="mode === 'create'
            ? 'bg-white dark:bg-gray-700 text-sage-600 dark:text-sage-400 shadow'
            : 'text-gray-600 dark:text-gray-400'"
        >
          Create New
        </button>
        <button
          @click="mode = 'join'"
          class="flex-1 py-2 px-4 rounded-md font-medium transition-all"
          :class="mode === 'join'
            ? 'bg-white dark:bg-gray-700 text-sage-600 dark:text-sage-400 shadow'
            : 'text-gray-600 dark:text-gray-400'"
        >
          Join Existing
        </button>
      </div>

      <!-- Error message -->
      <div
        v-if="error"
        class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
      >
        {{ error }}
      </div>

      <!-- Create household form -->
      <form v-if="mode === 'create'" @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Household Code
          </label>
          <input
            v-model="form.code"
            type="text"
            placeholder="e.g., FLUFFY2024"
            class="input"
            required
            maxlength="20"
          >
          <p class="text-xs text-gray-500 mt-1">
            Choose a unique code for your household
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Passcode (6 digits)
          </label>
          <input
            v-model="form.passcode"
            type="password"
            placeholder="••••••"
            class="input"
            required
            pattern="[0-9]{6}"
            maxlength="6"
          >
          <p class="text-xs text-gray-500 mt-1">
            Used to add new members later
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Name
          </label>
          <input
            v-model="form.memberName"
            type="text"
            placeholder="e.g., Tara"
            class="input"
            required
            maxlength="20"
          >
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full py-3"
          :disabled="loading"
        >
          {{ loading ? 'Creating...' : 'Create Household' }}
        </button>
      </form>

      <!-- Join household form -->
      <form v-if="mode === 'join'" @submit.prevent="handleJoin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Household Code
          </label>
          <input
            v-model="form.code"
            type="text"
            placeholder="e.g., FLUFFY2024"
            class="input"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Passcode
          </label>
          <input
            v-model="form.passcode"
            type="password"
            placeholder="••••••"
            class="input"
            required
            pattern="[0-9]{6}"
            maxlength="6"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Name
          </label>
          <input
            v-model="form.memberName"
            type="text"
            placeholder="e.g., Meag"
            class="input"
            required
            maxlength="20"
          >
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full py-3"
          :disabled="loading"
        >
          {{ loading ? 'Joining...' : 'Join Household' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/household'

const router = useRouter()
const householdStore = useHouseholdStore()

const mode = ref('create')
const loading = ref(false)
const error = ref('')

const form = ref({
  code: '',
  passcode: '',
  memberName: ''
})

async function handleCreate() {
  error.value = ''
  loading.value = true

  try {
    await householdStore.createHousehold(
      form.value.code,
      form.value.passcode,
      form.value.memberName
    )
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleJoin() {
  error.value = ''
  loading.value = true

  try {
    await householdStore.joinHousehold(
      form.value.code,
      form.value.passcode,
      form.value.memberName
    )
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
