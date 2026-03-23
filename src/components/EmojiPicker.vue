<template>
  <div class="emoji-picker">
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
    </label>
    <div class="grid grid-cols-6 gap-2">
      <button
        v-for="emoji in emojis"
        :key="emoji"
        type="button"
        @click="$emit('select', emoji)"
        class="emoji-button p-3 text-3xl rounded-lg transition-all duration-200 hover:scale-110"
        :class="selectedEmoji === emoji
          ? 'bg-sage-100 dark:bg-sage-900/30 ring-2 ring-sage-400 scale-110'
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script setup>
// defineProps and defineEmits are compiler macros in Vue 3 - no import needed

const props = defineProps({
  selectedEmoji: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  emojis: {
    type: Array,
    default: () => [
      '🐕', '🐈', '🐇', '🐹', '🐦', '🐠',
      '🐢', '🦎', '🐍', '🦜', '🦆', '🐖',
      '🐎', '🐄', '🐑', '🐐', '🦙', '🐘',
      '🦔', '🦘', '🐿️', '🦨', '🦡', '🦦'
    ]
  }
})

defineEmits(['select'])
</script>

<style scoped>
.emoji-button {
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .emoji-button {
    font-size: 1.5rem;
    padding: 0.5rem;
  }

  .emoji-picker .grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }
}
</style>
