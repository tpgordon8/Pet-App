<template>
  <!-- Dynamic gradient background -->
  <div
    id="app-bg"
    class="min-h-screen bg-gradient-to-br transition-all duration-[90000ms]"
    :class="store.backgroundGradient"
  >
    <div class="min-h-screen flex flex-col">

      <!-- Header -->
      <header class="flex items-center justify-between px-6 pt-6 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-2xl animate-float">🫶</span>
          <span class="text-white font-bold text-xl tracking-tight">nearish</span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="store.identity" class="text-white/50 text-sm">
            {{ store.identity === 'Tara' ? '🇫🇷' : '🇺🇸' }} {{ store.identity }}
          </span>
          <button
            class="glass-btn px-3 py-2 text-sm"
            @click="store.showSettings = true"
            title="Settings"
          >⚙️</button>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1 px-4 md:px-6 pb-8 space-y-4 max-w-4xl mx-auto w-full pt-2">

        <!-- Two person cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Tara — France -->
          <PersonCard
            name="Tara"
            location="Cap-Ferrat, French Riviera 🇫🇷"
            flag="🇫🇷"
            :time="store.taraTime"
            :seconds="store.taraSeconds"
            :date="store.taraDate"
            :is-tara="true"
            accent-color="#F59E0B"
          >
            <AgendaStatus
              :current="store.currentActivity"
              :next="store.nextActivity"
            />
            <template #weather>
              <WeatherWidget :data="store.weather.nice" />
            </template>
          </PersonCard>

          <!-- Meag — Philadelphia -->
          <PersonCard
            name="Meag"
            location="Philadelphia, PA 🇺🇸"
            flag="🇺🇸"
            :time="store.meagTime"
            :seconds="store.meagSeconds"
            :date="store.meagDate"
            :is-tara="false"
            accent-color="#60A5FA"
          >
            <div class="flex items-center gap-3 py-1 text-white/60 text-sm">
              <span class="text-xl">🏠</span>
              <div>
                <div class="text-white/80 font-medium">Holding it down</div>
                <div class="text-white/50 text-xs">Philadelphia, Pennsylvania</div>
              </div>
            </div>
            <template #weather>
              <WeatherWidget :data="store.weather.philly" />
            </template>
          </PersonCard>
        </div>

        <!-- Day overlap bar -->
        <div class="glass-card p-5">
          <DayOverlapBar
            :overlap-slots="store.overlapSlots"
            :connect-status="store.connectStatus"
            :current-hour="new Date().getHours()"
          />
        </div>

        <!-- Full trip agenda (collapsible) -->
        <div class="glass-card p-5">
          <div
            class="flex items-center justify-between cursor-pointer"
            @click="store.showAgenda = !store.showAgenda"
          >
            <span class="section-label mb-0">Tara's Trip Schedule</span>
            <div class="flex items-center gap-2">
              <span class="text-france-400 text-xs font-medium">
                {{ store.tripStatus === 'during' ? 'In progress' : store.tripStatus === 'before' ? 'Upcoming' : 'Complete' }}
              </span>
              <span class="text-white/40 text-sm">{{ store.showAgenda ? '▲' : '▼' }}</span>
            </div>
          </div>
          <div v-if="store.showAgenda" class="mt-4">
            <AgendaView
              :current-activity="store.currentActivity"
              :today-schedule="store.todaySchedule"
            />
          </div>
        </div>

        <!-- Quick pings -->
        <div class="glass-card p-5">
          <QuickPings
            :pings="store.pings"
            :identity="store.identity"
            :ping-presets="store.PING_PRESETS"
            @send="store.sendPing($event)"
          />
        </div>

        <!-- Reunion countdown -->
        <div class="glass-card p-6">
          <ReunionCountdown
            :countdown="store.reunionCountdown"
            :reunion-date="store.config.reunionDate"
          />
        </div>

        <!-- Shared note -->
        <div class="glass-card p-5">
          <SharedNote
            :note-content="store.noteContent"
            :last-by="store.noteLastBy"
            @update:note-content="store.noteContent = $event"
          />
        </div>

        <!-- Time converter -->
        <div class="glass-card p-5">
          <TimeConverter />
        </div>

      </main>
    </div>
  </div>

  <!-- Overlays -->
  <WhoAmI v-if="store.showWhoAmI" @pick="store.setIdentity($event)" />

  <SettingsPanel
    :open="store.showSettings"
    :identity="store.identity"
    :reunion-date="store.config.reunionDate"
    @close="store.showSettings = false"
    @set-identity="store.setIdentity($event)"
    @save-reunion="store.saveReunionDate($event)"
  />

  <ToastContainer />
</template>

<script setup>
import { useNearishStore } from '@/stores/nearish'
import PersonCard from '@/components/PersonCard.vue'
import AgendaStatus from '@/components/AgendaStatus.vue'
import AgendaView from '@/components/AgendaView.vue'
import DayOverlapBar from '@/components/DayOverlapBar.vue'
import ReunionCountdown from '@/components/ReunionCountdown.vue'
import QuickPings from '@/components/QuickPings.vue'
import WeatherWidget from '@/components/WeatherWidget.vue'
import SharedNote from '@/components/SharedNote.vue'
import TimeConverter from '@/components/TimeConverter.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import WhoAmI from '@/components/WhoAmI.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const store = useNearishStore()
</script>
