<template>
  <!-- System toasts: top-right -->
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="list">
      <div
        v-for="t in toast.toasts.value"
        :key="t.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium shadow-glass-lg backdrop-blur-xl border animate-bounce-in"
        :class="{
          'bg-emerald-500/80 border-emerald-400/30 text-white': t.type === 'success',
          'bg-red-500/80 border-red-400/30 text-white': t.type === 'error',
          'bg-white/20 border-white/20 text-white': t.type === 'info',
        }"
      >
        <span>{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ' }}</span>
        <span>{{ t.message }}</span>
        <button class="ml-1 opacity-60 hover:opacity-100" @click="toast.dismiss(t.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>

  <!-- Ping toasts: bottom-center -->
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-3 items-center pointer-events-none">
    <TransitionGroup name="list">
      <div
        v-for="p in toast.pingToasts.value"
        :key="p.id"
        class="pointer-events-auto bg-white/15 backdrop-blur-2xl border border-white/25 rounded-3xl px-6 py-4 shadow-glass-lg animate-bounce-in flex items-center gap-4 min-w-64"
      >
        <span class="text-3xl animate-heartbeat">💌</span>
        <div>
          <div class="text-xs text-white/60 font-medium tracking-wide uppercase">{{ p.from }}</div>
          <div class="text-white font-semibold text-sm mt-0.5">{{ p.message }}</div>
        </div>
        <button class="ml-auto text-white/40 hover:text-white/80 transition-colors" @click="toast.dismissPing(p.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const toast = useToast()
</script>
