<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card max-w-md w-full text-center space-y-6">
      <div class="space-y-2">
        <h1 class="text-4xl font-bold text-sage-600 dark:text-sage-400">
          🐾 Tailr
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Pet Activity Logger
        </p>
      </div>

      <p class="text-gray-700 dark:text-gray-300">
        Track your pet's daily activities, medical records, and health with beautiful, real-time sync.
      </p>

      <div class="space-y-3">
        <button
          class="btn btn-primary w-full py-3"
          @click="$router.push('/onboarding')"
        >
          Get Started
        </button>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          Already have a household? Sign in during onboarding.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Simple landing page
</script>
