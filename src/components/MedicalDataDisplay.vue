<template>
  <dl class="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
    <!-- Vet Visit -->
    <template v-if="activityType === 'Vet Visit'">
      <div v-if="medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
        <dt class="inline font-semibold">Notes:</dt>
        <dd class="inline ml-1">{{ medicalData.notes }}</dd>
      </div>
      <div v-if="medicalData.cost" class="text-sm text-gray-700 dark:text-gray-300">
        <dt class="inline font-semibold">Cost:</dt>
        <dd class="inline ml-1">${{ medicalData.cost.toFixed(2) }}</dd>
      </div>
    </template>

    <!-- Vaccination -->
    <template v-if="activityType === 'Vaccination'">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        <dt class="inline font-semibold">Vaccine:</dt>
        <dd class="inline ml-1">{{ medicalData.vaccineName }}</dd>
      </div>
      <div v-if="medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
        <dt class="inline font-semibold">Notes:</dt>
        <dd class="inline ml-1">{{ medicalData.notes }}</dd>
      </div>
    </template>

    <!-- Weight Check -->
    <template v-if="activityType === 'Weight Check'">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        <dt class="inline font-semibold">Weight:</dt>
        <dd class="inline ml-1">{{ medicalData.weight }} {{ medicalData.unit }}</dd>
      </div>
      <div v-if="medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
        <dt class="inline font-semibold">Notes:</dt>
        <dd class="inline ml-1">{{ medicalData.notes }}</dd>
      </div>
    </template>
  </dl>
</template>

<script setup>
defineProps({
  activityType: {
    type: String,
    required: true
  },
  medicalData: {
    type: Object,
    required: true
  }
})
</script>
