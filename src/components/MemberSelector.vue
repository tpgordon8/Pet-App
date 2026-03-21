<template>
  <div class="member-selector">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Who's Logging?
      </h3>
    </div>

    <!-- No Members State (shouldn't happen, but handle gracefully) -->
    <div
      v-if="!hasMembers"
      class="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
    >
      <p class="text-gray-600 dark:text-gray-400 text-sm">
        No household members found
      </p>
    </div>

    <!-- Member Chips -->
    <div v-else class="flex flex-wrap gap-2">
      <button
        v-for="member in members"
        :key="member"
        @click="selectMember(member)"
        class="member-chip"
        :class="currentMember === member ? 'active' : ''"
        :aria-pressed="currentMember === member"
        :aria-label="`Log activities as ${member}`"
      >
        <span class="text-lg">{{ getMemberEmoji(member) }}</span>
        <span class="text-sm font-medium">{{ member }}</span>
        <span v-if="currentMember === member" class="checkmark">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  members: {
    type: Array,
    required: true,
    default: () => []
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

const emit = defineEmits(['select'])

function selectMember(memberName) {
  emit('select', memberName)
}

// Simple emoji assignment based on member name or position
function getMemberEmoji(memberName) {
  const emojis = ['👤', '👥', '🙂', '😊', '👨', '👩', '🧑', '👦', '👧']
  // Hash member name to get consistent emoji
  const hash = memberName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return emojis[hash % emojis.length]
}
</script>

<style scoped>
.member-chip {
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

.dark .member-chip {
  background: rgba(31, 41, 55, 0.5);
  border-color: rgba(75, 85, 99, 0.5);
}

.member-chip:hover {
  border-color: #8B9A7D;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.member-chip.active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-color: #6366f1;
  color: white;
}

.dark .member-chip.active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.checkmark {
  font-size: 0.875rem;
  font-weight: bold;
  margin-left: 0.25rem;
}

@media (max-width: 640px) {
  .member-chip {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .member-chip span:first-child {
    font-size: 1.25rem;
  }
}
</style>
