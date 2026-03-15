<template>
  <div class="pet-selector">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Select Pet
      </h3>
      <button
        @click="$emit('add-pet')"
        class="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium"
      >
        + Add Pet
      </button>
    </div>

    <!-- No Pets State -->
    <div
      v-if="!hasPets"
      class="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
    >
      <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
        No pets yet. Add your first pet!
      </p>
      <button
        @click="$emit('add-pet')"
        class="btn btn-primary text-sm"
      >
        🐾 Add Your First Pet
      </button>
    </div>

    <!-- Pet Chips -->
    <div v-else class="flex flex-wrap gap-2">
      <!-- All Pets -->
      <button
        @click="selectPet('all')"
        class="pet-chip"
        :class="selectedPetId === 'all' ? 'active' : ''"
      >
        <span class="text-lg">🐾</span>
        <span class="text-sm font-medium">All Pets</span>
        <span v-if="selectedPetId === 'all'" class="checkmark">✓</span>
      </button>

      <!-- Individual Pets -->
      <button
        v-for="pet in pets"
        :key="pet.id"
        @click="selectPet(pet.id)"
        class="pet-chip"
        :class="selectedPetId === pet.id ? 'active' : ''"
      >
        <span class="text-lg">{{ pet.emoji }}</span>
        <span class="text-sm font-medium">{{ pet.name }}</span>
        <span v-if="selectedPetId === pet.id" class="checkmark">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  pets: {
    type: Array,
    required: true
  },
  selectedPetId: {
    type: String,
    required: true
  },
  hasPets: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['select', 'add-pet'])

function selectPet(petId) {
  emit('select', petId)
}
</script>

<style scoped>
.pet-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.dark .pet-chip {
  background: rgba(31, 41, 55, 0.5);
  border-color: rgba(75, 85, 99, 0.5);
}

.pet-chip:hover {
  border-color: #8B9A7D;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pet-chip.active {
  background: linear-gradient(135deg, #8B9A7D 0%, #6d7e60 100%);
  border-color: #8B9A7D;
  color: white;
}

.dark .pet-chip.active {
  background: linear-gradient(135deg, #8B9A7D 0%, #6d7e60 100%);
}

.checkmark {
  font-size: 0.875rem;
  font-weight: bold;
  margin-left: 0.25rem;
}

@media (max-width: 640px) {
  .pet-chip {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .pet-chip span:first-child {
    font-size: 1.25rem;
  }
}
</style>
