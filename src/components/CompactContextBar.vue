<template>
  <div class="compact-context-bar">
    <!-- Pet Selector Dropdown (No Label) -->
    <select
      id="pet-select"
      v-model="localSelectedPetId"
      class="context-select-compact"
      :disabled="!hasPets"
      @change="handlePetChange"
      title="Select pet"
      aria-label="Select pet to view and log activities"
    >
      <option value="all">🐾 All Pets</option>
      <option
        v-for="pet in pets"
        :key="pet.id"
        :value="pet.id"
      >
        {{ pet.emoji }} {{ pet.name }}
      </option>
    </select>

    <!-- Member Selector Dropdown (No Label) -->
    <select
      id="member-select"
      v-model="localCurrentMember"
      class="context-select-compact"
      :disabled="!hasMembers"
      @change="handleMemberChange"
      title="Select who is logging activities"
      aria-label="Select household member logging activities"
    >
      <option
        v-for="member in members"
        :key="member"
        :value="member"
      >
        👤 {{ member }}
      </option>
    </select>

    <!-- Add Pet Button (Icon Only) -->
    <button
      v-if="hasPets"
      @click="$emit('add-pet')"
      class="add-pet-btn-compact"
      title="Add another pet"
      aria-label="Add a new pet to household"
    >
      <span class="text-base">+</span>
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
  gap: 0.375rem;
  flex-wrap: nowrap;
}

/* Ultra-Compact Select Dropdowns */
.context-select-compact {
  padding: 0.625rem 1.5rem 0.625rem 0.5rem;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem; /* 14px - better readability */
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.25rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  min-width: 85px;
  min-height: 44px;  /* iOS minimum touch target - applied globally */
  max-width: 110px;
}

.dark .context-select-compact {
  background: #374151;
  border-color: #4b5563;
  color: #f3f4f6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
}

.context-select-compact:hover:not(:disabled) {
  border-color: #8B9A7D;
}

.context-select-compact:focus {
  outline: none;
  border-color: #8B9A7D;
  box-shadow: 0 0 0 2px rgba(139, 154, 125, 0.1);
}

.context-select-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Ultra-Compact Add Pet Button */
.add-pet-btn-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem;
  background: #f3f4f6;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 44px;   /* iOS minimum touch target */
  min-height: 44px;  /* iOS minimum touch target */
}

.dark .add-pet-btn-compact {
  background: #374151;
  border-color: #4b5563;
  color: #9ca3af;
}

.add-pet-btn-compact:hover {
  background: #8B9A7D;
  border-color: #8B9A7D;
  color: white;
  transform: translateY(-1px);
}

/* Mobile: Prevent iOS auto-zoom and optimize spacing */
@media (max-width: 640px) {
  .compact-context-bar {
    gap: 0.25rem;
  }

  .context-select-compact {
    min-width: 80px;
    max-width: 100px;
    font-size: 1rem; /* 16px - CRITICAL: prevents iOS auto-zoom */
  }
}

/* Very small screens */
@media (max-width: 390px) {
  .context-select-compact {
    min-width: 75px;
    max-width: 90px;
  }
}
</style>
