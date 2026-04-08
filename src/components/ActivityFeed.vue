<template>
  <div class="activity-feed space-y-4">
    <!-- Result Count -->
    <div v-if="activities.length > 0" class="flex items-center justify-end">
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ activities.length }} {{ activities.length === 1 ? 'activity' : 'activities' }}
      </span>
    </div>

    <!-- Empty state -->
    <EmptyState
      v-if="activities.length === 0"
      :icon="searchQuery ? '🔍' : '🐾'"
      :title="searchQuery ? 'No matches found' : 'No activities yet'"
      :description="searchQuery ? `No activities match '${searchQuery}'. Try a different search term.` : 'Start tracking your pet\'s activities using the quick log buttons above!'"
      :show-decorations="!searchQuery"
      :pulse="!searchQuery"
    />

    <!-- Activity list -->
    <div v-else class="space-y-3" aria-live="polite" aria-label="Activity log">
      <!-- Group by date -->
      <div
        v-for="group in groupedActivities"
        :key="group.date"
        class="space-y-2"
      >
        <!-- Date header -->
        <ActivityGroupHeader :label="group.label" />

        <!-- Activities for this date -->
        <ActivityItem
          v-for="activity in group.activities"
          :key="activity.id"
          :activity="activity"
          :show-pet-names="showPetNames"
          :pet-name="getPetName(activity.petId)"
          :pet-emoji="getPetEmoji(activity.petId)"
          :search-query="searchQuery"
          @delete="handleDelete"
          @edit="handleEdit"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, isToday, isYesterday } from 'date-fns'
import EmptyState from './EmptyState.vue'
import ActivityGroupHeader from './ActivityGroupHeader.vue'
import ActivityItem from './ActivityItem.vue'

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

// Handlers
function handleEdit(activity) {
  emit('edit', activity)
}

function handleDelete(activityId) {
  emit('delete', activityId)
}

// Group activities by date (activities are already filtered by parent component)
const groupedActivities = computed(() => {
  const groups = {}

  props.activities.forEach(activity => {
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

function getPetName(petId) {
  const pet = props.pets.find(p => p.id === petId)
  return pet?.name || ''
}

function getPetEmoji(petId) {
  const pet = props.pets.find(p => p.id === petId)
  return pet?.emoji || ''
}
</script>
