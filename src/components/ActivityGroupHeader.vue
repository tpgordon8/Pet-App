<template>
  <div class="sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-lg">
    <h4 class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
      {{ label }}
    </h4>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  }
})
</script>
