<template>
  <StepContainer
    title="Let's add your pet! 🐕"
    subtitle="Create a profile for your furry friend"
    :stepKey="2"
  >
    <form @submit.prevent="handleSubmit" class="add-pet-form">
      <!-- Emoji Picker -->
      <div class="form-group">
        <label class="form-label">Pet Icon</label>
        <div class="emoji-picker-button" @click="showEmojiPicker = !showEmojiPicker">
          <span class="selected-emoji">{{ form.emoji || '🐾' }}</span>
          <span class="picker-label">Tap to choose</span>
        </div>
        <div v-if="showEmojiPicker" class="emoji-grid">
          <button
            v-for="emoji in petEmojis"
            :key="emoji"
            type="button"
            @click="selectEmoji(emoji)"
            class="emoji-option"
            :class="{ selected: form.emoji === emoji }"
          >
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- Pet Name -->
      <div class="form-group">
        <label for="pet-name" class="form-label required">Pet's Name</label>
        <input
          id="pet-name"
          v-model="form.name"
          type="text"
          placeholder="e.g., Luna"
          class="input"
          required
          maxlength="20"
          data-test="pet-name"
        >
      </div>

      <!-- Pet Type -->
      <div class="form-group">
        <label class="form-label required">What type of pet?</label>
        <div class="pet-type-buttons">
          <button
            v-for="type in petTypes"
            :key="type.value"
            type="button"
            @click="selectPetType(type)"
            class="pet-type-button"
            :class="{ selected: form.species === type.value }"
            :data-test="`pet-type-${type.value.toLowerCase()}`"
          >
            <span class="type-emoji">{{ type.emoji }}</span>
            <span class="type-label">{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- Optional Fields (collapsed by default) -->
      <div class="optional-section">
        <button
          type="button"
          @click="showOptional = !showOptional"
          class="optional-toggle"
        >
          <span>{{ showOptional ? 'Hide' : 'Show' }} optional details</span>
          <span class="toggle-icon">{{ showOptional ? '▲' : '▼' }}</span>
        </button>

        <transition name="expand">
          <div v-if="showOptional" class="optional-fields">
            <div class="form-group">
              <label for="pet-breed" class="form-label">Breed (Optional)</label>
              <input
                id="pet-breed"
                v-model="form.breed"
                type="text"
                placeholder="e.g., Golden Retriever"
                class="input"
                maxlength="30"
              >
            </div>
          </div>
        </transition>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          type="submit"
          class="btn btn-primary w-full py-3"
          :disabled="!isFormValid"
          data-test="continue"
        >
          Continue
        </button>
        <button
          type="button"
          @click="$emit('skip')"
          class="skip-button"
        >
          Skip for now
        </button>
      </div>
    </form>
  </StepContainer>
</template>

<script setup>
import { ref, computed } from 'vue'
import StepContainer from './StepContainer.vue'

const emit = defineEmits(['submit', 'skip'])

const petEmojis = ['🐕', '🐈', '🐦', '🐠', '🐰', '🐹', '🐢', '🦎', '🐍', '🐴', '🐷', '🐮']
const petTypes = [
  { value: 'Dog', emoji: '🐕', label: 'Dog' },
  { value: 'Cat', emoji: '🐈', label: 'Cat' },
  { value: 'Bird', emoji: '🐦', label: 'Bird' },
  { value: 'Fish', emoji: '🐠', label: 'Fish' },
  { value: 'Other', emoji: '🐾', label: 'Other' }
]

const form = ref({
  emoji: '🐕',
  name: '',
  species: 'Dog',
  breed: ''
})

const showEmojiPicker = ref(false)
const showOptional = ref(false)

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0 && form.value.emoji && form.value.species
})

function selectEmoji(emoji) {
  form.value.emoji = emoji
  showEmojiPicker.value = false
}

function selectPetType(type) {
  form.value.species = type.value
  form.value.emoji = type.emoji
}

function handleSubmit() {
  if (isFormValid.value) {
    emit('submit', {
      name: form.value.name.trim(),
      emoji: form.value.emoji,
      species: form.value.species,
      breed: form.value.breed.trim()
    })
  }
}
</script>

<style scoped>
.add-pet-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .form-label {
  color: #d1d5db;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.emoji-picker-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.dark .emoji-picker-button {
  background: #1f2937;
  border-color: #374151;
}

.emoji-picker-button:hover {
  border-color: #10b981;
}

.selected-emoji {
  font-size: 2.5rem;
}

.picker-label {
  font-size: 0.95rem;
  color: #6b7280;
}

.dark .picker-label {
  color: #9ca3af;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.dark .emoji-grid {
  background: #111827;
}

.emoji-option {
  font-size: 1.75rem;
  padding: 0.5rem;
  background: white;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.dark .emoji-option {
  background: #1f2937;
}

.emoji-option:hover {
  transform: scale(1.1);
  border-color: #10b981;
}

.emoji-option.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.pet-type-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 480px) {
  .pet-type-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}

.pet-type-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.dark .pet-type-button {
  background: #1f2937;
  border-color: #374151;
}

.pet-type-button:hover {
  border-color: #10b981;
  transform: translateY(-2px);
}

.pet-type-button.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.type-emoji {
  font-size: 2rem;
}

.type-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.dark .type-label {
  color: #d1d5db;
}

.optional-section {
  margin-bottom: 1.5rem;
}

.optional-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 150ms ease-in-out;
}

.optional-toggle:hover {
  opacity: 0.8;
}

.toggle-icon {
  font-size: 0.75rem;
}

.optional-fields {
  margin-top: 0.75rem;
  overflow: hidden;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 300ms ease-in-out;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.action-buttons {
  margin-top: 2rem;
}

.skip-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.75rem;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 150ms ease-in-out;
}

.dark .skip-button {
  color: #9ca3af;
}

.skip-button:hover {
  color: #10b981;
}
</style>
