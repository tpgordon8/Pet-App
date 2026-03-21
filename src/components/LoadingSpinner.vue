<template>
  <div class="loading-spinner" :class="{ 'loading-spinner-small': small }">
    <div class="spinner"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  small: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.loading-spinner-small {
  min-height: 100px;
  padding: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #8b9a7f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner-small .spinner {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.loading-message {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-color-scheme: dark) {
  .spinner {
    border-color: #374151;
    border-top-color: #8b9a7f;
  }
}
</style>
