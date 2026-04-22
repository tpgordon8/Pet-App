<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="section-label">Today's note</span>
      <span v-if="lastBy" class="text-xs text-white/30">
        Last edited by <span class="text-white/50">{{ lastBy }}</span>
      </span>
    </div>
    <textarea
      :value="noteContent"
      @input="$emit('update:noteContent', $event.target.value)"
      placeholder="Write something to each other today…"
      rows="4"
      class="glass-input resize-none text-sm leading-relaxed"
    ></textarea>
    <div class="text-xs text-white/25 text-right">Auto-saves · syncs live</div>
  </div>
</template>

<script setup>
defineProps({
  noteContent: String,
  lastBy: String,
})

defineEmits(['update:noteContent'])
</script>
