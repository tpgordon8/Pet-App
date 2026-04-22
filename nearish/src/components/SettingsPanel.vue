<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div v-if="open" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" @click="$emit('close')"></div>
  </Transition>

  <!-- Panel -->
  <Transition name="slide-right">
    <div
      v-if="open"
      class="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white/10 backdrop-blur-2xl border-l border-white/20 z-50 p-6 flex flex-col gap-6 overflow-y-auto"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-white font-bold text-xl">Settings</h2>
        <button class="glass-btn px-3 py-2 text-sm" @click="$emit('close')">✕ Close</button>
      </div>

      <!-- Who am I -->
      <div class="space-y-3">
        <div class="section-label">Who are you?</div>
        <div class="flex gap-2">
          <button
            v-for="name in ['Tara', 'Meag']"
            :key="name"
            @click="$emit('set-identity', name)"
            class="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all"
            :class="identity === name
              ? (name === 'Tara' ? 'bg-france-500/40 border-2 border-france-400/60 text-france-300' : 'bg-philly-500/40 border-2 border-philly-400/60 text-philly-300')
              : 'glass-btn'"
          >
            {{ name === 'Tara' ? '🇫🇷' : '🇺🇸' }} {{ name }}
          </button>
        </div>
        <p class="text-white/40 text-xs">This controls who you appear as when sending pings and notes.</p>
      </div>

      <!-- Reunion date -->
      <div class="space-y-3">
        <div class="section-label">Reunion date</div>
        <input
          :value="reunionDate"
          type="date"
          class="glass-input"
          @change="$emit('save-reunion', $event.target.value)"
        />
        <p class="text-white/40 text-xs">When you'll be together again — drives the countdown timer.</p>
      </div>

      <!-- Trip info -->
      <div class="space-y-3">
        <div class="section-label">Tara's trip</div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-sm">
          <div class="text-white font-medium">🏨 Grand-Hôtel du Cap-Ferrat</div>
          <div class="text-white/60">Cap-Ferrat, French Riviera</div>
          <div class="text-white/60">April 26–30, 2026</div>
          <div class="text-white/40 text-xs mt-2">Schedule is built in — no calendar setup needed.</div>
        </div>
      </div>

      <!-- Timezone reference -->
      <div class="space-y-3">
        <div class="section-label">Timezones</div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1 text-sm text-white/60">
          <div>🇫🇷 Nice, France — <span class="text-white/80">Europe/Paris (CEST, UTC+2)</span></div>
          <div>🇺🇸 Philadelphia — <span class="text-white/80">America/New_York (EDT, UTC-4)</span></div>
          <div class="text-france-400/80 text-xs mt-2">France is 6 hours ahead</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  open: Boolean,
  identity: String,
  reunionDate: String,
})

defineEmits(['close', 'set-identity', 'save-reunion'])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
</style>
