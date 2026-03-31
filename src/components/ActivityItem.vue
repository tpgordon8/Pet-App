<template>
  <div
    class="activity-item-wrapper"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Swipe Delete Background (Mobile Only) -->
    <div
      class="swipe-delete-bg"
      :class="{ 'swipe-delete-visible': swipeState.isRevealed }"
    >
      <div class="swipe-delete-content">
        <span class="text-2xl">🗑️</span>
        <span class="font-semibold">Delete</span>
      </div>
    </div>

    <!-- Activity Content -->
    <div
      class="activity-item glass rounded-xl p-4 flex items-start gap-4 hover:shadow-glass transition-all motion-reduce:transition-none"
      :style="swipeState.transform ? `transform: translateX(${swipeState.transform}px)` : ''"
    >
      <!-- Emoji -->
      <span class="text-3xl">{{ activity.emoji }}</span>

      <!-- Details -->
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2 flex-wrap">
          <h4 class="font-semibold text-gray-900 dark:text-white">
            <span v-html="highlightMatch(activity.type, searchQuery)"></span>
          </h4>
          <span v-if="showPetNames && petName" class="text-xs text-sage-600 dark:text-sage-400">
            {{ petEmoji }}
            <span v-html="highlightMatch(petName, searchQuery)"></span>
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            by <span v-html="highlightMatch(activity.user, searchQuery)"></span>
          </span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ formattedTime }}
        </p>
        <p v-if="activity.notes" class="text-sm text-gray-700 dark:text-gray-300 mt-1">
          <span v-html="highlightMatch(activity.notes, searchQuery)"></span>
        </p>

        <!-- Medical Data Display -->
        <MedicalDataDisplay
          v-if="activity.medicalData"
          :activity-type="activity.type"
          :medical-data="activity.medicalData"
        />

        <img
          v-if="activity.photoUrl"
          :src="activity.photoUrl"
          alt="Activity photo"
          class="mt-2 rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity motion-reduce:transition-none"
          @click="openPhoto(activity.photoUrl)"
        />
      </div>

      <!-- Actions (always visible) -->
      <div class="flex flex-col gap-2 flex-shrink-0">
        <button
          v-if="canEdit"
          @click="emit('edit', activity)"
          class="action-btn action-btn-edit"
          title="Edit activity"
          aria-label="Edit activity"
        >
          <span class="action-icon">✏️</span>
          <span class="action-label">Edit</span>
        </button>
        <button
          @click="emit('delete', activity.id)"
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
</template>

<script setup>
import { reactive, computed } from 'vue'
import { format, formatDistanceToNow } from 'date-fns'
import { useHaptic } from '@/composables/useHaptic'
import MedicalDataDisplay from './MedicalDataDisplay.vue'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  },
  showPetNames: {
    type: Boolean,
    default: false
  },
  petName: {
    type: String,
    default: ''
  },
  petEmoji: {
    type: String,
    default: ''
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['delete', 'edit'])

// Haptic feedback
const haptic = useHaptic()

// Swipe state management
const swipeState = reactive({
  startX: 0,
  startY: 0,
  currentX: 0,
  transform: 0,
  isRevealed: false,
  isSwiping: false
})

const SWIPE_THRESHOLD = -80
const SWIPE_DELETE_THRESHOLD = -120

// Computed properties
const canEdit = computed(() => {
  const medicalTypes = ['Vet Visit', 'Vaccination', 'Weight Check']
  return !medicalTypes.includes(props.activity.type)
})

const formattedTime = computed(() => {
  const date = new Date(props.activity.timestamp)
  const time = format(date, 'h:mm a')
  const relative = formatDistanceToNow(date, { addSuffix: true })
  return `${time} (${relative})`
})

// Swipe gesture handlers
function onTouchStart(event) {
  if (window.innerWidth > 640) return

  const touch = event.touches[0]
  swipeState.startX = touch.clientX
  swipeState.startY = touch.clientY
  swipeState.currentX = touch.clientX
  swipeState.transform = 0
  swipeState.isRevealed = false
  swipeState.isSwiping = false
}

function onTouchMove(event) {
  if (window.innerWidth > 640) return

  const touch = event.touches[0]
  const deltaX = touch.clientX - swipeState.startX
  const deltaY = touch.clientY - swipeState.startY

  if (!swipeState.isSwiping && Math.abs(deltaX) > 10) {
    swipeState.isSwiping = Math.abs(deltaX) > Math.abs(deltaY)
  }

  if (swipeState.isSwiping && deltaX < 0) {
    event.preventDefault()
    swipeState.currentX = touch.clientX
    swipeState.transform = Math.max(deltaX, -150)

    // Trigger light haptic when delete action is revealed
    const wasRevealed = swipeState.isRevealed
    swipeState.isRevealed = deltaX < SWIPE_THRESHOLD
    if (!wasRevealed && swipeState.isRevealed) {
      haptic.light()
    }
  }
}

function onTouchEnd() {
  if (window.innerWidth > 640) return

  const deltaX = swipeState.currentX - swipeState.startX

  if (deltaX < SWIPE_DELETE_THRESHOLD) {
    // Heavy haptic feedback for delete action
    haptic.heavy()
    emit('delete', props.activity.id)
  } else if (deltaX < SWIPE_THRESHOLD) {
    swipeState.transform = SWIPE_THRESHOLD
    swipeState.isRevealed = true
  } else {
    swipeState.transform = 0
    swipeState.isRevealed = false
  }
}

function openPhoto(url) {
  if (!url) {
    console.error('Cannot open photo: URL is missing')
    return
  }

  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (!newWindow) {
      console.error('Failed to open photo in new window. Pop-up may be blocked.')
      // Fallback: try to navigate in the same tab
      window.location.href = url
    }
  } catch (error) {
    console.error('Error opening photo:', error)
  }
}

function highlightMatch(text, query) {
  if (!query || !text) return text

  try {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  } catch (error) {
    console.error('Error highlighting search match:', error)
    return text
  }
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

@media (max-width: 640px) {
  .activity-item {
    padding: 0.75rem;
  }

  .activity-item > span:first-child {
    font-size: 1.75rem;
  }

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

@media (min-width: 641px) and (max-width: 1024px) {
  .action-label {
    font-size: 0.75rem;
  }

  .action-btn {
    padding: 0.375rem 0.5rem;
  }
}

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

/* Accessibility: Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .swipe-delete-bg,
  .action-btn {
    transition: none;
  }

  .action-btn-edit:hover,
  .action-btn-edit:active,
  .action-btn-delete:hover,
  .action-btn-delete:active {
    transform: none;
  }
}
</style>
