<template>
  <div class="activity-feed space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Recent Activity
      </h3>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        <template v-if="searchQuery">
          Showing {{ filteredActivities.length }} of {{ activities.length }}
        </template>
        <template v-else>
          {{ activities.length }} total
        </template>
      </span>
    </div>

    <!-- Empty state -->
    <EmptyState
      v-if="filteredActivities.length === 0"
      :icon="searchQuery ? '🔍' : '🐾'"
      :title="searchQuery ? 'No matches found' : 'No activities yet'"
      :description="searchQuery ? `No activities match '${searchQuery}'. Try a different search term.` : 'Start tracking your pet\'s activities using the quick log buttons above!'"
      :show-decorations="!searchQuery"
      :pulse="!searchQuery"
    />

    <!-- Activity list -->
    <div v-else class="space-y-3">
      <!-- Group by date -->
      <div
        v-for="group in groupedActivities"
        :key="group.date"
        class="space-y-2"
      >
        <!-- Date header -->
        <div class="sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          <h4 class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {{ group.label }}
          </h4>
        </div>

        <!-- Activities for this date -->
        <div
          v-for="activity in group.activities"
          :key="activity.id"
          class="activity-item-wrapper"
          @touchstart="onTouchStart($event, activity.id)"
          @touchmove="onTouchMove($event, activity.id)"
          @touchend="onTouchEnd($event, activity.id)"
        >
          <!-- Swipe Delete Background (Mobile Only) -->
          <div
            class="swipe-delete-bg"
            :class="{ 'swipe-delete-visible': swipeState[activity.id]?.isRevealed }"
          >
            <div class="swipe-delete-content">
              <span class="text-2xl">🗑️</span>
              <span class="font-semibold">Delete</span>
            </div>
          </div>

          <!-- Activity Content -->
          <div
            class="activity-item glass rounded-xl p-4 flex items-start gap-4 hover:shadow-glass transition-all"
            :style="swipeState[activity.id]?.transform ? `transform: translateX(${swipeState[activity.id].transform}px)` : ''"
          >
          <!-- Emoji -->
          <span class="text-3xl">{{ activity.emoji }}</span>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 flex-wrap">
              <h4 class="font-semibold text-gray-900 dark:text-white">
                <span v-html="highlightMatch(activity.type, searchQuery)"></span>
              </h4>
              <span v-if="showPetNames && getPetName(activity.petId)" class="text-xs text-sage-600 dark:text-sage-400">
                {{ getPetEmoji(activity.petId) }}
                <span v-html="highlightMatch(getPetName(activity.petId), searchQuery)"></span>
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                by <span v-html="highlightMatch(activity.user, searchQuery)"></span>
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatTime(activity.timestamp) }}
            </p>
            <p v-if="activity.notes" class="text-sm text-gray-700 dark:text-gray-300 mt-1">
              <span v-html="highlightMatch(activity.notes, searchQuery)"></span>
            </p>

            <!-- Medical Data Display -->
            <div v-if="activity.medicalData" class="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
              <!-- Vet Visit -->
              <template v-if="activity.type === 'Vet Visit'">
                <p v-if="activity.medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Notes:</strong> {{ activity.medicalData.notes }}
                </p>
                <p v-if="activity.medicalData.cost" class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Cost:</strong> ${{ activity.medicalData.cost.toFixed(2) }}
                </p>
              </template>

              <!-- Vaccination -->
              <template v-if="activity.type === 'Vaccination'">
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Vaccine:</strong> {{ activity.medicalData.vaccineName }}
                </p>
                <p v-if="activity.medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Notes:</strong> {{ activity.medicalData.notes }}
                </p>
              </template>

              <!-- Weight Check -->
              <template v-if="activity.type === 'Weight Check'">
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Weight:</strong> {{ activity.medicalData.weight }} {{ activity.medicalData.unit }}
                </p>
                <p v-if="activity.medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Notes:</strong> {{ activity.medicalData.notes }}
                </p>
              </template>
            </div>

            <img
              v-if="activity.photoUrl"
              :src="activity.photoUrl"
              alt="Activity photo"
              class="mt-2 rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              @click="openPhoto(activity.photoUrl)"
            />
          </div>

          <!-- Actions (always visible) -->
          <div class="flex flex-col gap-2 flex-shrink-0">
            <button
              v-if="canEdit(activity)"
              @click="handleEdit(activity)"
              class="action-btn action-btn-edit"
              title="Edit activity"
              aria-label="Edit activity"
            >
              <span class="action-icon">✏️</span>
              <span class="action-label">Edit</span>
            </button>
            <button
              @click="handleDelete(activity.id)"
              class="action-btn action-btn-delete"
              title="Delete activity"
              aria-label="Delete activity"
            >
              <span class="action-icon">🗑️</span>
              <span class="action-label">Delete</span>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, defineProps, defineEmits } from 'vue'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  },
  pets: {
    type: Array,
    default: () => []
  },
  showPetNames: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['delete', 'edit'])

// Swipe state management
const swipeState = reactive({})

const SWIPE_THRESHOLD = -80 // Swipe distance to trigger delete reveal
const SWIPE_DELETE_THRESHOLD = -120 // Swipe distance to auto-delete

// Handlers
function handleEdit(activity) {
  emit('edit', activity)
}

function handleDelete(activityId) {
  emit('delete', activityId)
}

// Swipe gesture handlers
function onTouchStart(event, activityId) {
  if (window.innerWidth > 640) return // Only on mobile

  const touch = event.touches[0]
  swipeState[activityId] = {
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    transform: 0,
    isRevealed: false,
    isSwiping: false
  }
}

function onTouchMove(event, activityId) {
  if (window.innerWidth > 640 || !swipeState[activityId]) return

  const touch = event.touches[0]
  const state = swipeState[activityId]
  const deltaX = touch.clientX - state.startX
  const deltaY = touch.clientY - state.startY

  // Determine if this is a horizontal swipe
  if (!state.isSwiping && Math.abs(deltaX) > 10) {
    state.isSwiping = Math.abs(deltaX) > Math.abs(deltaY)
  }

  // Only handle left swipes (delete)
  if (state.isSwiping && deltaX < 0) {
    event.preventDefault()
    state.currentX = touch.clientX
    state.transform = Math.max(deltaX, -150) // Limit swipe distance
    state.isRevealed = deltaX < SWIPE_THRESHOLD
  }
}

function onTouchEnd(event, activityId) {
  if (window.innerWidth > 640 || !swipeState[activityId]) return

  const state = swipeState[activityId]
  const deltaX = state.currentX - state.startX

  // If swiped far enough, trigger delete
  if (deltaX < SWIPE_DELETE_THRESHOLD) {
    handleDelete(activityId)
  }
  // If revealed, keep it revealed
  else if (deltaX < SWIPE_THRESHOLD) {
    state.transform = SWIPE_THRESHOLD
    state.isRevealed = true
  }
  // Otherwise, snap back
  else {
    state.transform = 0
    state.isRevealed = false
  }
}

// Filter activities based on search query
const filteredActivities = computed(() => {
  if (!props.searchQuery || props.searchQuery.trim() === '') {
    return props.activities
  }

  const query = props.searchQuery.toLowerCase().trim()

  return props.activities.filter(activity => {
    // Search in activity type
    if (activity.type.toLowerCase().includes(query)) return true

    // Search in notes
    if (activity.notes && activity.notes.toLowerCase().includes(query)) return true

    // Search in user name
    if (activity.user && activity.user.toLowerCase().includes(query)) return true

    // Search in pet name
    const petName = getPetName(activity.petId)
    if (petName && petName.toLowerCase().includes(query)) return true

    // Search in medical data
    if (activity.medicalData) {
      // Vet Visit notes and cost
      if (activity.medicalData.notes && activity.medicalData.notes.toLowerCase().includes(query)) return true
      if (activity.medicalData.cost && activity.medicalData.cost.toString().includes(query)) return true

      // Vaccination vaccine name
      if (activity.medicalData.vaccineName && activity.medicalData.vaccineName.toLowerCase().includes(query)) return true

      // Weight Check weight and unit
      if (activity.medicalData.weight && activity.medicalData.weight.toString().includes(query)) return true
      if (activity.medicalData.unit && activity.medicalData.unit.toLowerCase().includes(query)) return true
    }

    return false
  })
})

// Group activities by date
const groupedActivities = computed(() => {
  const groups = {}

  filteredActivities.value.forEach(activity => {
    const date = new Date(activity.timestamp)
    const dateKey = format(date, 'yyyy-MM-dd')

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        label: getDateLabel(date),
        activities: []
      }
    }

    groups[dateKey].activities.push(activity)
  })

  // Convert to array and sort by date (newest first)
  return Object.values(groups).sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
})

function getDateLabel(date) {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMM d')
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const time = format(date, 'h:mm a')
  const relative = formatDistanceToNow(date, { addSuffix: true })
  return `${time} (${relative})`
}

function getPetName(petId) {
  const pet = props.pets.find(p => p.id === petId)
  return pet?.name || ''
}

function getPetEmoji(petId) {
  const pet = props.pets.find(p => p.id === petId)
  return pet?.emoji || ''
}

function openPhoto(url) {
  window.open(url, '_blank')
}

function canEdit(activity) {
  // Medical activities cannot be edited (too complex)
  const medicalTypes = ['Vet Visit', 'Vaccination', 'Weight Check']
  return !medicalTypes.includes(activity.type)
}

function highlightMatch(text, query) {
  if (!query || !text) return text

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
.activity-item-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
}

.activity-item {
  position: relative;
  background: inherit;
}

/* Swipe Delete Background */
.swipe-delete-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 150px;
  background: linear-gradient(to left, rgb(239 68 68), rgb(220 38 38));
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.swipe-delete-bg.swipe-delete-visible {
  opacity: 1;
}

.swipe-delete-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: white;
  font-size: 0.875rem;
}

/* Action Buttons - Always Visible */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
  border: 1px solid transparent;
}

.action-btn-edit {
  background-color: rgb(59 130 246 / 0.1);
  color: rgb(59 130 246);
  border-color: rgb(59 130 246 / 0.2);
}

.action-btn-edit:hover {
  background-color: rgb(59 130 246 / 0.2);
  border-color: rgb(59 130 246 / 0.3);
  transform: translateY(-1px);
}

.action-btn-edit:active {
  transform: translateY(0);
}

.action-btn-delete {
  background-color: rgb(239 68 68 / 0.1);
  color: rgb(239 68 68);
  border-color: rgb(239 68 68 / 0.2);
}

.action-btn-delete:hover {
  background-color: rgb(239 68 68 / 0.2);
  border-color: rgb(239 68 68 / 0.3);
  transform: translateY(-1px);
}

.action-btn-delete:active {
  transform: translateY(0);
}

.action-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.action-label {
  display: inline;
}

/* Dark mode support */
:deep(.dark) .action-btn-edit {
  background-color: rgb(59 130 246 / 0.15);
  color: rgb(96 165 250);
  border-color: rgb(59 130 246 / 0.25);
}

:deep(.dark) .action-btn-edit:hover {
  background-color: rgb(59 130 246 / 0.25);
  border-color: rgb(59 130 246 / 0.35);
}

:deep(.dark) .action-btn-delete {
  background-color: rgb(239 68 68 / 0.15);
  color: rgb(248 113 113);
  border-color: rgb(239 68 68 / 0.25);
}

:deep(.dark) .action-btn-delete:hover {
  background-color: rgb(239 68 68 / 0.25);
  border-color: rgb(239 68 68 / 0.35);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .activity-item {
    padding: 0.75rem;
  }

  .activity-item > span:first-child {
    font-size: 1.75rem;
  }

  /* Hide text labels on mobile, show only icons */
  .action-label {
    display: none;
  }

  .action-btn {
    padding: 0.5rem;
    min-width: 40px;
    min-height: 40px;
  }

  .action-icon {
    font-size: 1.25rem;
  }
}

/* Medium screens - compact layout */
@media (min-width: 641px) and (max-width: 1024px) {
  .action-label {
    font-size: 0.75rem;
  }

  .action-btn {
    padding: 0.375rem 0.5rem;
  }
}

/* Search highlighting */
:deep(.search-highlight) {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%);
  color: inherit;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.dark :deep(.search-highlight) {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.3) 100%);
}
</style>
