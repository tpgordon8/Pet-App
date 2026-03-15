<template>
  <div class="min-h-screen p-4">
    <div class="max-w-4xl mx-auto space-y-6 py-8">
      <!-- Header -->
      <div class="card flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            🐾 Tailr
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {{ householdStore.memberName }}!
          </p>
        </div>
        <button
          @click="handleLogout"
          class="btn btn-secondary"
        >
          Logout
        </button>
      </div>

      <!-- Household Info -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Household: {{ householdStore.householdCode }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          This is your dashboard. Phase 1 will add activity logging here.
        </p>
      </div>

      <!-- Placeholder for activity buttons (Phase 1) -->
      <div class="card">
        <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <button class="btn btn-primary py-4 text-lg">
            💩 Poop
          </button>
          <button class="btn btn-primary py-4 text-lg">
            💧 Pee
          </button>
          <button class="btn btn-primary py-4 text-lg">
            🍖 Food
          </button>
          <button class="btn btn-primary py-4 text-lg">
            😴 Sleep
          </button>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Coming in Phase 1: Activity logging with real-time sync
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/household'

const router = useRouter()
const householdStore = useHouseholdStore()

function handleLogout() {
  householdStore.logout()
  router.push('/')
}
</script>
