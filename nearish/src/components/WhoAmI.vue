<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
    <div class="glass-card p-8 max-w-sm w-full text-center space-y-6 animate-bounce-in">
      <div class="text-5xl animate-float">🫶</div>
      <div>
        <h1 class="text-white font-bold text-2xl">Welcome to Nearish</h1>
        <p class="text-white/60 text-sm mt-2">Who's opening the app?</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="$emit('pick', 'Tara')"
          class="flex-1 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 bg-france-500/30 border-2 border-france-400/50 text-france-300 hover:bg-france-500/40"
        >
          🇫🇷<br />
          <span class="text-sm font-semibold">Tara</span>
        </button>
        <button
          @click="$emit('pick', 'Meag')"
          class="flex-1 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 bg-philly-500/30 border-2 border-philly-400/50 text-philly-300 hover:bg-philly-500/40"
        >
          🇺🇸<br />
          <span class="text-sm font-semibold">Meag</span>
        </button>
      </div>
      <p class="text-white/30 text-xs">You can always change this in ⚙️ Settings</p>
    </div>
  </div>
</template>

<script setup>
defineEmits(['pick'])
</script>
