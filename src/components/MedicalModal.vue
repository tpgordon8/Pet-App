<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <div class="card max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span class="text-2xl">{{ emoji }}</span>
          Log {{ activityType }}
        </h3>
        <button
          @click="handleClose"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <!-- Vet Visit Form -->
      <div v-if="activityType === 'Vet Visit'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Visit Notes
          </label>
          <textarea
            v-model="formData.vetNotes"
            placeholder="Reason for visit, diagnosis, treatment..."
            class="input w-full h-24 resize-none"
            maxlength="500"
          />
          <div class="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
            {{ formData.vetNotes.length }}/500
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cost (optional)
          </label>
          <div class="flex items-center gap-2">
            <span class="text-gray-600 dark:text-gray-400">$</span>
            <input
              v-model.number="formData.cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="input flex-1"
            />
          </div>
        </div>
      </div>

      <!-- Vaccination Form -->
      <div v-if="activityType === 'Vaccination'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vaccine Name *
          </label>
          <input
            v-model="formData.vaccineName"
            type="text"
            placeholder="e.g., Rabies, DHPP, Bordetella"
            class="input w-full"
            maxlength="100"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            v-model="formData.vaccineNotes"
            placeholder="Batch number, veterinarian name, next due date..."
            class="input w-full h-24 resize-none"
            maxlength="300"
          />
          <div class="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
            {{ formData.vaccineNotes.length }}/300
          </div>
        </div>
      </div>

      <!-- Weight Check Form -->
      <div v-if="activityType === 'Weight Check'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight *
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="formData.weight"
              type="number"
              step="0.1"
              min="0"
              placeholder="0.0"
              class="input flex-1"
            />
            <select v-model="formData.unit" class="input w-24">
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            v-model="formData.weightNotes"
            placeholder="Body condition, compared to last weight, vet comments..."
            class="input w-full h-24 resize-none"
            maxlength="300"
          />
          <div class="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
            {{ formData.weightNotes.length }}/300
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 mt-6">
        <button
          @click="handleClose"
          class="btn btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          class="btn btn-primary flex-1"
          :disabled="!isValid"
        >
          Log {{ activityType }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  activityType: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  // Vet Visit
  vetNotes: '',
  cost: null,
  // Vaccination
  vaccineName: '',
  vaccineNotes: '',
  // Weight Check
  weight: null,
  unit: 'lbs',
  weightNotes: ''
})

const isValid = computed(() => {
  if (props.activityType === 'Vet Visit') {
    return formData.value.vetNotes.trim().length > 0
  }
  if (props.activityType === 'Vaccination') {
    return formData.value.vaccineName.trim().length > 0
  }
  if (props.activityType === 'Weight Check') {
    return formData.value.weight > 0
  }
  return false
})

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

function resetForm() {
  formData.value = {
    vetNotes: '',
    cost: null,
    vaccineName: '',
    vaccineNotes: '',
    weight: null,
    unit: 'lbs',
    weightNotes: ''
  }
}

function handleClose() {
  emit('close')
}

function handleSave() {
  if (!isValid.value) return

  let medicalData = {}

  if (props.activityType === 'Vet Visit') {
    medicalData = {
      notes: formData.value.vetNotes.trim(),
      cost: formData.value.cost || null
    }
  } else if (props.activityType === 'Vaccination') {
    medicalData = {
      vaccineName: formData.value.vaccineName.trim(),
      notes: formData.value.vaccineNotes.trim()
    }
  } else if (props.activityType === 'Weight Check') {
    medicalData = {
      weight: formData.value.weight,
      unit: formData.value.unit,
      notes: formData.value.weightNotes.trim()
    }
  }

  emit('save', medicalData)
  emit('close')
}
</script>

<style scoped>
.input {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-sage-500 dark:focus:ring-sage-400
    transition-colors;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all
    disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply bg-sage-600 hover:bg-sage-700 text-white
    dark:bg-sage-500 dark:hover:bg-sage-600;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200;
}

.card {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6;
}
</style>
