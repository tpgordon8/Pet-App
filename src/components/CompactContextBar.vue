<template>
  <div class="compact-context-bar">
    <!-- Pet Selector Dropdown -->
    <div class="context-group">
      <label for="pet-select" class="context-label">
        🐾 Pet
      </label>
      <select
        id="pet-select"
        v-model="localSelectedPetId"
        class="context-select"
        :disabled="!hasPets"
        @change="handlePetChange"
      >
        <option value="all">All Pets</option>
        <option
          v-for="pet in pets"
          :key="pet.id"
          :value="pet.id"
        >
          {{ pet.emoji }} {{ pet.name }}
        </option>
      </select>
    </div>

    <!-- Member Selector Dropdown -->
    <div class="context-group">
      <label for="member-select" class="context-label">
        👤 Logging as
      </label>
      <select
        id="member-select"
        v-model="localCurrentMember"
        class="context-select"
        :disabled="!hasMembers"
        @change="handleMemberChange"
      >
        <option
          v-for="member in members"
          :key="member"
          :value="member"
        >
          {{ member }}
        </option>
      </select>
    </div>

    <!-- Add Pet Button (Mobile: Icon only, Desktop: Text) -->
    <button
      v-if="hasPets"
      @click="$emit('add-pet')"
      class="add-pet-btn"
      title="Add another pet"
    >
      <span class="text-lg">+</span>
      <span class="hidden md:inline ml-1">Add Pet</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

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
  },
  members: {
    type: Array,
    required: true
  },
  currentMember: {
    type: String,
    required: true
  },
  hasMembers: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['select-pet', 'select-member', 'add-pet'])

// Local state synced with props
const localSelectedPetId = ref(props.selectedPetId)
const localCurrentMember = ref(props.currentMember)

// Watch for external changes
watch(() => props.selectedPetId, (newVal) => {
  localSelectedPetId.value = newVal
})

watch(() => props.currentMember, (newVal) => {
  localCurrentMember.value = newVal
})

function handlePetChange() {
  emit('select-pet', localSelectedPetId.value)
}

function handleMemberChange() {
  emit('select-member', localCurrentMember.value)
}
</script>

<style scoped>
.compact-context-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.context-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.context-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.dark .context-label {
  color: #9ca3af;
}

.context-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.25rem;
  min-width: 120px;
  min-height: 44px; /* iOS minimum touch target */
}

.dark .context-select {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
}

.context-select:hover:not(:disabled) {
  border-color: #8B9A7D;
}

.context-select:focus {
  outline: none;
  border-color: #8B9A7D;
  box-shadow: 0 0 0 3px rgba(139, 154, 125, 0.1);
}

.context-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-pet-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark .add-pet-btn {
  background: #374151;
  border-color: #4b5563;
  color: #9ca3af;
}

.add-pet-btn:hover {
  background: #8B9A7D;
  border-color: #8B9A7D;
  color: white;
}

@media (max-width: 640px) {
  .compact-context-bar {
    gap: 0.5rem;
  }

  .context-select {
    min-width: 100px;
    font-size: 1rem; /* 16px - CRITICAL: prevents iOS auto-zoom */
    padding: 0.6875rem 1.75rem 0.6875rem 0.625rem; /* 11px vertical ensures 44px height */
    min-height: 44px; /* iOS minimum touch target */
  }

  .context-label {
    font-size: 0.8125rem; /* 13px - compressed for space */
  }

  .add-pet-btn {
    padding: 0.625rem; /* Ensures 44x44px touch target */
    min-width: 44px;
    min-height: 44px;
  }
}

/* iPhone 12 mini optimization (375px) */
@media (max-width: 390px) {
  .compact-context-bar {
    gap: 0.375rem; /* 6px - tighter spacing */
  }

  .context-select {
    min-width: 90px; /* Slightly narrower */
    font-size: 1rem; /* Keep 16px to prevent zoom */
  }
}
</style>
