<template>
  <div v-if="data" class="flex items-center gap-2 text-sm">
    <span class="text-xl leading-none">{{ data.icon }}</span>
    <span class="font-semibold text-white">{{ data.tempC }}°C</span>
    <span class="text-white/50">{{ data.description }}</span>
  </div>
  <div v-else class="flex items-center gap-2 text-sm text-white/30">
    <div class="w-5 h-5 rounded-full bg-white/10 animate-pulse"></div>
    <span>Loading weather…</span>
  </div>
</template>

<script setup>
defineProps({ data: Object })
</script>
