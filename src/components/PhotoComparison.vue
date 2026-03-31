<template>
  <div class="photo-comparison">
    <!-- Empty state -->
    <div v-if="photoActivities.length < 2" class="empty-state">
      <span class="empty-emoji">📸📸</span>
      <p class="empty-text">Not enough photos for comparison</p>
      <p class="empty-subtext">Add at least 2 photos to see before/after comparisons</p>
    </div>

    <!-- Comparison selector -->
    <div v-else class="comparison-container">
      <!-- Photo selection -->
      <div class="comparison-selectors">
        <div class="selector-group">
          <label class="selector-label">Before Photo</label>
          <select
            v-model="selectedBeforeId"
            class="photo-select"
            @change="updateComparison"
          >
            <option value="">Select a photo...</option>
            <option
              v-for="activity in photoActivities"
              :key="activity.id"
              :value="activity.id"
              :disabled="activity.id === selectedAfterId"
            >
              {{ formatPhotoOption(activity) }}
            </option>
          </select>
        </div>

        <div class="selector-arrow">
          →
        </div>

        <div class="selector-group">
          <label class="selector-label">After Photo</label>
          <select
            v-model="selectedAfterId"
            class="photo-select"
            @change="updateComparison"
          >
            <option value="">Select a photo...</option>
            <option
              v-for="activity in photoActivities"
              :key="activity.id"
              :value="activity.id"
              :disabled="activity.id === selectedBeforeId"
            >
              {{ formatPhotoOption(activity) }}
            </option>
          </select>
        </div>
      </div>

      <!-- Comparison view -->
      <div v-if="beforePhoto && afterPhoto" class="comparison-view">
        <!-- View mode toggle -->
        <div class="view-mode-toggle">
          <button
            v-for="mode in viewModes"
            :key="mode.value"
            @click="viewMode = mode.value"
            class="view-mode-btn"
            :class="{ active: viewMode === mode.value }"
          >
            {{ mode.icon }} {{ mode.label }}
          </button>
        </div>

        <!-- Side by side view -->
        <div v-if="viewMode === 'side-by-side'" class="side-by-side-view">
          <div class="photo-panel">
            <div class="photo-header">
              <span class="photo-badge badge-before">Before</span>
              <span class="photo-date">{{ formatDate(beforePhoto.timestamp) }}</span>
            </div>
            <img
              :src="beforePhoto.photoUrl"
              :alt="beforePhoto.type"
              class="comparison-photo"
              @click="emit('open-photo', beforePhoto)"
            />
            <div class="photo-info">
              <span class="photo-emoji">{{ beforePhoto.emoji }}</span>
              <span class="photo-type">{{ beforePhoto.type }}</span>
            </div>
          </div>

          <div class="photo-panel">
            <div class="photo-header">
              <span class="photo-badge badge-after">After</span>
              <span class="photo-date">{{ formatDate(afterPhoto.timestamp) }}</span>
            </div>
            <img
              :src="afterPhoto.photoUrl"
              :alt="afterPhoto.type"
              class="comparison-photo"
              @click="emit('open-photo', afterPhoto)"
            />
            <div class="photo-info">
              <span class="photo-emoji">{{ afterPhoto.emoji }}</span>
              <span class="photo-type">{{ afterPhoto.type }}</span>
            </div>
          </div>
        </div>

        <!-- Slider view -->
        <div v-else-if="viewMode === 'slider'" class="slider-view">
          <div class="slider-container">
            <div class="slider-image-wrapper">
              <img
                :src="beforePhoto.photoUrl"
                :alt="`Before - ${beforePhoto.type}`"
                class="slider-image slider-image-before"
              />
              <div
                class="slider-image-after-wrapper"
                :style="{ width: `${sliderPosition}%` }"
              >
                <img
                  :src="afterPhoto.photoUrl"
                  :alt="`After - ${afterPhoto.type}`"
                  class="slider-image slider-image-after"
                />
              </div>
              <div
                class="slider-handle"
                :style="{ left: `${sliderPosition}%` }"
                @mousedown="startDrag"
                @touchstart="startDrag"
              >
                <div class="slider-handle-line"></div>
                <div class="slider-handle-button">⟷</div>
              </div>
            </div>
            <div class="slider-labels">
              <span class="slider-label">Before</span>
              <span class="slider-label">After</span>
            </div>
          </div>
        </div>

        <!-- Stacked view -->
        <div v-else-if="viewMode === 'stacked'" class="stacked-view">
          <div class="stacked-photo">
            <span class="photo-badge badge-before">Before</span>
            <img
              :src="beforePhoto.photoUrl"
              :alt="beforePhoto.type"
              class="comparison-photo"
              @click="emit('open-photo', beforePhoto)"
            />
            <span class="photo-date">{{ formatDate(beforePhoto.timestamp) }}</span>
          </div>
          <div class="stacked-arrow">↓</div>
          <div class="stacked-photo">
            <span class="photo-badge badge-after">After</span>
            <img
              :src="afterPhoto.photoUrl"
              :alt="afterPhoto.type"
              class="comparison-photo"
              @click="emit('open-photo', afterPhoto)"
            />
            <span class="photo-date">{{ formatDate(afterPhoto.timestamp) }}</span>
          </div>
        </div>

        <!-- Time difference -->
        <div class="time-difference">
          <span class="time-icon">⏱️</span>
          Time between photos: {{ timeDifference }}
        </div>

        <!-- Weight difference (if applicable) -->
        <div
          v-if="weightDifference"
          class="weight-difference"
          :class="weightDifference.class"
        >
          <span class="weight-icon">⚖️</span>
          Weight change: {{ weightDifference.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format, formatDistanceStrict } from 'date-fns'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['open-photo'])

const selectedBeforeId = ref('')
const selectedAfterId = ref('')
const viewMode = ref('side-by-side')
const sliderPosition = ref(50)

const viewModes = [
  { value: 'side-by-side', label: 'Side by Side', icon: '◧' },
  { value: 'slider', label: 'Slider', icon: '⟷' },
  { value: 'stacked', label: 'Stacked', icon: '⬍' }
]

// Filter activities with photos
const photoActivities = computed(() => {
  return props.activities
    .filter(a => a.photoUrl)
    .sort((a, b) => b.timestamp - a.timestamp)
})

// Get selected photos
const beforePhoto = computed(() => {
  return photoActivities.value.find(a => a.id === selectedBeforeId.value)
})

const afterPhoto = computed(() => {
  return photoActivities.value.find(a => a.id === selectedAfterId.value)
})

// Calculate time difference
const timeDifference = computed(() => {
  if (!beforePhoto.value || !afterPhoto.value) return null

  const before = new Date(beforePhoto.value.timestamp)
  const after = new Date(afterPhoto.value.timestamp)

  return formatDistanceStrict(after, before)
})

// Calculate weight difference
const weightDifference = computed(() => {
  if (!beforePhoto.value?.medicalData?.weight || !afterPhoto.value?.medicalData?.weight) {
    return null
  }

  const beforeWeight = beforePhoto.value.medicalData.weight
  const afterWeight = afterPhoto.value.medicalData.weight
  const diff = afterWeight - beforeWeight

  if (diff === 0) return null

  const sign = diff > 0 ? '+' : ''
  const unit = afterPhoto.value.medicalData.unit || 'lbs'
  const className = diff > 0 ? 'weight-gain' : 'weight-loss'

  return {
    text: `${sign}${diff.toFixed(1)} ${unit}`,
    class: className
  }
})

function formatPhotoOption(activity) {
  const date = format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')
  return `${activity.emoji} ${activity.type} - ${date}`
}

function formatDate(timestamp) {
  return format(new Date(timestamp), 'MMM d, yyyy')
}

function updateComparison() {
  // Auto-select second photo if only one is selected
  if (selectedBeforeId.value && !selectedAfterId.value && photoActivities.value.length >= 2) {
    const beforeIndex = photoActivities.value.findIndex(a => a.id === selectedBeforeId.value)
    const nextPhoto = photoActivities.value.find((a, i) => i !== beforeIndex)
    if (nextPhoto) {
      selectedAfterId.value = nextPhoto.id
    }
  }
}

// Slider drag functionality
let isDragging = false

function startDrag(e) {
  isDragging = true
  updateSliderPosition(e)

  const moveHandler = (e) => {
    if (isDragging) {
      updateSliderPosition(e)
    }
  }

  const endHandler = () => {
    isDragging = false
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', endHandler)
    document.removeEventListener('touchmove', moveHandler)
    document.removeEventListener('touchend', endHandler)
  }

  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', endHandler)
  document.addEventListener('touchmove', moveHandler)
  document.addEventListener('touchend', endHandler)
}

function updateSliderPosition(e) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const container = e.target.closest('.slider-container')
  if (!container) return

  const rect = container.getBoundingClientRect()
  const x = clientX - rect.left
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
  sliderPosition.value = percentage
}

// Auto-select first two photos on mount
if (photoActivities.value.length >= 2) {
  selectedBeforeId.value = photoActivities.value[1].id // Older photo
  selectedAfterId.value = photoActivities.value[0].id // Newer photo
}
</script>

<style scoped>
.photo-comparison {
  min-height: 300px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-emoji {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.dark .empty-text {
  color: #9ca3af;
}

.empty-subtext {
  font-size: 0.875rem;
  color: #9ca3af;
}

.dark .empty-subtext {
  color: #6b7280;
}

/* Comparison container */
.comparison-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Selectors */
.comparison-selectors {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.selector-group {
  flex: 1;
  min-width: 200px;
}

.selector-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .selector-label {
  color: #d1d5db;
}

.photo-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s;
}

.dark .photo-select {
  background: #374151;
  color: #f3f4f6;
  border-color: #4b5563;
}

.photo-select:hover {
  border-color: #10b981;
}

.photo-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.selector-arrow {
  font-size: 1.5rem;
  color: #10b981;
  font-weight: bold;
}

/* View mode toggle */
.view-mode-toggle {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 0.75rem;
  width: fit-content;
}

.dark .view-mode-toggle {
  background: #374151;
}

.view-mode-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.view-mode-btn:hover {
  color: #10b981;
}

.view-mode-btn.active {
  background: white;
  color: #10b981;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .view-mode-btn.active {
  background: #1f2937;
}

/* Side by side view */
.side-by-side-view {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.photo-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.photo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-before {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.badge-after {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.photo-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .photo-date {
  color: #9ca3af;
}

.comparison-photo {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comparison-photo:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.dark .photo-info {
  color: #9ca3af;
}

.photo-emoji {
  font-size: 1.25rem;
}

/* Slider view */
.slider-view {
  width: 100%;
}

.slider-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.slider-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.slider-image {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
}

.slider-image-before {
  position: relative;
}

.slider-image-after-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
}

.slider-image-after {
  display: block;
  height: 100%;
  width: auto;
}

.slider-handle {
  position: absolute;
  top: 0;
  height: 100%;
  width: 4px;
  cursor: ew-resize;
  transform: translateX(-50%);
  z-index: 10;
}

.slider-handle-line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.slider-handle-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: white;
  color: #10b981;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.dark .slider-labels {
  color: #9ca3af;
}

/* Stacked view */
.stacked-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.stacked-photo {
  position: relative;
  width: 100%;
}

.stacked-photo .photo-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
}

.stacked-photo .photo-date {
  display: block;
  text-align: center;
  margin-top: 0.5rem;
}

.stacked-arrow {
  font-size: 2rem;
  color: #10b981;
}

/* Time and weight difference */
.time-difference,
.weight-difference {
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-difference {
  background: rgba(59, 130, 246, 0.1);
  border-left: 4px solid #3b82f6;
  color: #1e40af;
}

.dark .time-difference {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.weight-difference {
  border-left: 4px solid;
}

.weight-difference.weight-gain {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  color: #047857;
}

.dark .weight-difference.weight-gain {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
}

.weight-difference.weight-loss {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #b91c1c;
}

.dark .weight-difference.weight-loss {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.time-icon,
.weight-icon {
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 640px) {
  .comparison-selectors {
    flex-direction: column;
  }

  .selector-arrow {
    transform: rotate(90deg);
  }

  .side-by-side-view {
    grid-template-columns: 1fr;
  }

  .view-mode-toggle {
    width: 100%;
    justify-content: center;
  }

  .view-mode-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
