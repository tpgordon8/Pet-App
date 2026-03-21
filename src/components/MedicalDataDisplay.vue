<template>
  <div class="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
    <!-- Vet Visit -->
    <template v-if="activityType === 'Vet Visit'">
      <p v-if="medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
        <strong>Notes:</strong> {{ medicalData.notes }}
      </p>
      <p v-if="medicalData.cost" class="text-sm text-gray-700 dark:text-gray-300">
        <strong>Cost:</strong> ${{ medicalData.cost.toFixed(2) }}
      </p>
    </template>

    <!-- Vaccination -->
    <template v-if="activityType === 'Vaccination'">
      <p class="text-sm text-gray-700 dark:text-gray-300">
        <strong>Vaccine:</strong> {{ medicalData.vaccineName }}
      </p>
      <p v-if="medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
        <strong>Notes:</strong> {{ medicalData.notes }}
      </p>
    </template>

    <!-- Weight Check -->
    <template v-if="activityType === 'Weight Check'">
      <p class="text-sm text-gray-700 dark:text-gray-300">
        <strong>Weight:</strong> {{ medicalData.weight }} {{ medicalData.unit }}
      </p>
      <p v-if="medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
        <strong>Notes:</strong> {{ medicalData.notes }}
      </p>
    </template>
  </div>
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
