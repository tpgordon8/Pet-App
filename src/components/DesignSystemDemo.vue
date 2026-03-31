<template>
  <div class="design-system-demo min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="text-center py-12 animate-fade-in">
        <h1 class="text-display-xl gradient-text-vibrant mb-4">
          Tailr 2.0 Design System
        </h1>
        <p class="text-body-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A playful yet premium design system featuring vibrant colors, smooth animations,
          and delightful micro-interactions.
        </p>
      </div>

      <!-- Typography -->
      <section class="card-premium animate-slide-up">
        <h2 class="text-display mb-6 gradient-text">Typography</h2>
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p class="text-display-xl mb-2">Display XL - Bold & Beautiful</p>
            <code class="text-xs text-gray-500">text-display-xl</code>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p class="text-display mb-2">Display - Eye-Catching Headlines</p>
            <code class="text-xs text-gray-500">text-display</code>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p class="text-heading mb-2">Heading - Clear Hierarchy</p>
            <code class="text-xs text-gray-500">text-heading</code>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p class="text-body mb-2">Body - Readable and comfortable for long content.</p>
            <code class="text-xs text-gray-500">text-body</code>
          </div>
        </div>
      </section>

      <!-- Enhanced Stats Cards -->
      <section class="space-y-4 animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Enhanced Stats Cards</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EnhancedStatsCard
            value="142"
            label="Total Activities"
            :trend="15"
            color-scheme="vibrant"
            :chart-data="[12, 18, 15, 20, 22, 19, 25]"
            :chart-labels="['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
          >
            <template #icon>
              <AppIcon name="chart-bar" :size="32" color-class="text-accent-purple" />
            </template>
          </EnhancedStatsCard>

          <EnhancedStatsCard
            value="23"
            label="This Week"
            :trend="-5"
            color-scheme="ocean"
            :show-progress="true"
            :progress-value="75"
            progress-label="Weekly goal"
          >
            <template #icon>
              <AppIcon name="calendar" :size="32" color-class="text-accent-blue" />
            </template>
          </EnhancedStatsCard>

          <EnhancedStatsCard
            value="8"
            label="Today"
            variant="gradient"
            :chart-data="[2, 3, 1, 2]"
            :chart-labels="['Poop', 'Pee', 'Food', 'Walk']"
            color-scheme="sunset"
          >
            <template #icon>
              <AppIcon name="paw" :size="32" color-class="text-white" />
            </template>
          </EnhancedStatsCard>
        </div>
      </section>

      <!-- Progress Rings -->
      <section class="card-premium animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Progress Rings</h2>
        <div class="flex flex-wrap gap-8 justify-center">
          <ProgressRing
            :value="75"
            :size="120"
            label="Bathroom"
          />
          <ProgressRing
            :value="45"
            :size="120"
            stroke-color="#60a5fa"
            label="Food"
          />
          <ProgressRing
            :value="90"
            :size="120"
            stroke-color="#10b981"
            label="Activity"
          />
          <ProgressRing
            :value="33"
            :size="120"
            stroke-color="#f472b6"
            label="Medical"
          />
        </div>
      </section>

      <!-- Mini Charts -->
      <section class="card-premium animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Data Visualization</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-heading mb-4 text-gray-900 dark:text-white">Last 7 Days (Vibrant)</h3>
            <div style="height: 120px;">
              <MiniBarChart
                :data="[12, 18, 15, 20, 22, 19, 25]"
                :labels="['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
                :tooltip-data="['Monday: 12', 'Tuesday: 18', 'Wednesday: 15', 'Thursday: 20', 'Friday: 22', 'Saturday: 19', 'Sunday: 25']"
                color-scheme="vibrant"
                bar-height="100px"
              />
            </div>
          </div>

          <div>
            <h3 class="text-heading mb-4 text-gray-900 dark:text-white">Activity Types (Gradient)</h3>
            <div style="height: 120px;">
              <MiniBarChart
                :data="[8, 5, 6, 4]"
                :labels="['Poop', 'Pee', 'Food', 'Walk']"
                :tooltip-data="['Poop: 8', 'Pee: 5', 'Food: 6', 'Walk: 4']"
                color-scheme="gradient"
                bar-height="100px"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Empty States -->
      <section class="space-y-4 animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Delightful Empty States</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DelightfulEmptyState
            icon="🐾"
            title="No Activities Yet"
            description="Start tracking your pet's activities by tapping the buttons above!"
            action-label="Log First Activity"
            tip="Pro tip: You can also log activities with voice commands!"
            color-scheme="purple"
            @action="() => {}"
          />

          <DelightfulEmptyState
            icon="📸"
            title="No Photos"
            description="Add photos to your activities to create a beautiful timeline of memories."
            action-label="Add Photo"
            color-scheme="pink"
            :show-decorations="true"
            @action="() => {}"
          />
        </div>
      </section>

      <!-- Loading States -->
      <section class="card-premium animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Delightful Loaders</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <DelightfulLoader
            variant="paw-prints"
            text="Loading..."
            subtext="Fetching data"
          />

          <DelightfulLoader
            variant="dots"
            text="Processing"
          />

          <DelightfulLoader
            variant="pulse-ring"
            text="Syncing"
            icon="🔄"
          />

          <DelightfulLoader
            variant="progress"
            :progress="65"
            text="Uploading"
            icon="📤"
          />
        </div>
      </section>

      <!-- Buttons & Interactions -->
      <section class="card-premium animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Buttons & Interactions</h2>
        <div class="space-y-4">
          <div class="flex flex-wrap gap-4">
            <button class="btn-pill-primary">
              Primary Button
            </button>
            <button class="btn-pill-secondary">
              Secondary Button
            </button>
            <button class="btn-icon">
              <AppIcon name="settings" :size="20" />
            </button>
            <button class="btn-icon">
              <AppIcon name="filter" :size="20" />
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="badge-success">✓ Success</span>
            <span class="badge-warning">⚠ Warning</span>
            <span class="badge-danger">✕ Error</span>
            <span class="badge-info">ℹ Info</span>
          </div>

          <div class="space-y-2">
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: 75%"></div>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: 45%"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Icons -->
      <section class="card-premium animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Icon Library</h2>
        <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-6">
          <div v-for="icon in iconList" :key="icon" class="flex flex-col items-center gap-2 hover-lift cursor-pointer">
            <div class="w-16 h-16 rounded-xl bg-gradient-bg-soft flex items-center justify-center hover:bg-gradient-bg-vibrant transition-all motion-reduce:transition-none">
              <AppIcon :name="icon" :size="32" color-class="text-sage-600 dark:text-sage-400" />
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400 font-mono">{{ icon }}</span>
          </div>
        </div>
      </section>

      <!-- Gradients -->
      <section class="card-premium animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Gradient Backgrounds</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div class="h-24 rounded-xl gradient-bg-sage flex items-center justify-center text-white font-bold shadow-sage">
            Sage
          </div>
          <div class="h-24 rounded-xl gradient-bg-vibrant flex items-center justify-center text-white font-bold">
            Vibrant
          </div>
          <div class="h-24 rounded-xl gradient-bg-sunrise flex items-center justify-center text-white font-bold">
            Sunrise
          </div>
          <div class="h-24 rounded-xl gradient-bg-ocean flex items-center justify-center text-white font-bold">
            Ocean
          </div>
          <div class="h-24 rounded-xl gradient-bg-sunset flex items-center justify-center text-white font-bold">
            Sunset
          </div>
        </div>
      </section>

      <!-- Cards -->
      <section class="space-y-4 animate-slide-up">
        <h2 class="text-display gradient-text mb-6">Card Variants</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="card-premium">
            <h3 class="text-heading mb-2 text-gray-900 dark:text-white">Premium Card</h3>
            <p class="text-body text-gray-600 dark:text-gray-400">Clean and modern with subtle elevation.</p>
          </div>

          <div class="card-glass">
            <h3 class="text-heading mb-2 text-gray-900 dark:text-white">Glass Card</h3>
            <p class="text-body text-gray-600 dark:text-gray-400">Glassmorphism with backdrop blur.</p>
          </div>

          <div class="card-gradient">
            <h3 class="text-heading mb-2">Gradient Card</h3>
            <p class="text-body">Bold and vibrant with gradient background.</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="text-center py-12 text-gray-600 dark:text-gray-400 animate-fade-in">
        <p class="mb-2">✨ Tailr 2.0 Design System ✨</p>
        <p class="text-sm">Playful • Premium • Accessible</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EnhancedStatsCard from './EnhancedStatsCard.vue'
import ProgressRing from './ProgressRing.vue'
import MiniBarChart from './MiniBarChart.vue'
import DelightfulEmptyState from './DelightfulEmptyState.vue'
import DelightfulLoader from './DelightfulLoader.vue'
import AppIcon from './AppIcon.vue'

const iconList = ref([
  'paw',
  'chart-bar',
  'trend-up',
  'trend-down',
  'calendar',
  'clock',
  'heart',
  'medical',
  'food',
  'moon',
  'photo',
  'plus',
  'check',
  'close',
  'edit',
  'delete',
  'settings',
  'filter',
  'search',
  'star'
])
</script>

<style scoped>
.design-system-demo {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
