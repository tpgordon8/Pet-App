<template>
  <div class="pet-timeline">
    <!-- Empty state -->
    <div v-if="timelineEvents.length === 0" class="empty-state">
      <span class="empty-emoji">📅</span>
      <p class="empty-text">No timeline events yet</p>
      <p class="empty-subtext">Log activities to see your pet's life timeline</p>
    </div>

    <!-- Timeline -->
    <div v-else class="timeline-container">
      <div
        v-for="(event, index) in timelineEvents"
        :key="event.id"
        class="timeline-event"
        :class="`event-${event.category}`"
      >
        <!-- Timeline dot and line -->
        <div class="timeline-marker">
          <div class="timeline-dot" :class="`dot-${event.category}`">
            <span class="text-lg">{{ event.emoji }}</span>
          </div>
          <div v-if="index < timelineEvents.length - 1" class="timeline-line"></div>
        </div>

        <!-- Event content -->
        <div class="timeline-content card-premium">
          <div class="timeline-header">
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-gray-900 dark:text-white">
                {{ event.title }}
              </h4>
              <span
                v-if="event.isMilestone"
                class="milestone-badge"
                title="Major milestone"
              >
                ⭐
              </span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatTimelineDate(event.timestamp) }}
            </span>
          </div>

          <p v-if="event.description" class="timeline-description">
            {{ event.description }}
          </p>

          <!-- Photo preview -->
          <img
            v-if="event.photoUrl"
            :src="event.photoUrl"
            :alt="event.title"
            class="timeline-photo"
            @click="emit('open-photo', event)"
          />

          <!-- Medical data -->
          <div v-if="event.medicalData" class="timeline-medical">
            <div v-if="event.type === 'Weight Check'" class="flex items-center gap-2">
              <span class="text-sm font-semibold">
                {{ event.medicalData.weight }} {{ event.medicalData.unit }}
              </span>
              <span v-if="event.weightChange" class="text-xs" :class="event.weightChange.class">
                {{ event.weightChange.text }}
              </span>
            </div>
            <div v-if="event.type === 'Vaccination'" class="text-sm">
              <span class="font-semibold">Vaccine:</span> {{ event.medicalData.vaccineName }}
            </div>
          </div>

          <!-- Age at time -->
          <div v-if="event.ageAtTime" class="timeline-age">
            {{ event.ageAtTime }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, formatDistanceToNow, differenceInMonths, differenceInDays } from 'date-fns'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  },
  pet: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['open-photo'])

// Determine if event is a milestone
function isMilestoneEvent(activity) {
  const milestoneTypes = [
    'Vet Visit',
    'Vaccination',
    'Weight Check'
  ]
  return milestoneTypes.includes(activity.type)
}

// Categorize events for styling
function categorizeEvent(activity) {
  const categories = {
    'Vet Visit': 'medical',
    'Vaccination': 'medical',
    'Weight Check': 'medical',
    'Meds': 'medical',
    'Food': 'routine',
    'Sleep': 'routine',
    'Walk': 'activity',
    'Poop': 'routine',
    'Pee': 'routine'
  }
  return categories[activity.type] || 'routine'
}

// Calculate weight change from previous weight check
function calculateWeightChange(currentActivity, previousWeightActivity) {
  if (!currentActivity.medicalData?.weight || !previousWeightActivity?.medicalData?.weight) {
    return null
  }

  const currentWeight = currentActivity.medicalData.weight
  const previousWeight = previousWeightActivity.medicalData.weight
  const diff = currentWeight - previousWeight

  if (diff === 0) return null

  const sign = diff > 0 ? '+' : ''
  const className = diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'

  return {
    text: `${sign}${diff.toFixed(1)} ${currentActivity.medicalData.unit}`,
    class: className
  }
}

// Calculate age at time of event
function calculateAgeAtTime(petBirthday, eventTimestamp) {
  if (!petBirthday) return null

  const birthday = new Date(petBirthday)
  const eventDate = new Date(eventTimestamp)

  const months = differenceInMonths(eventDate, birthday)
  const days = differenceInDays(eventDate, birthday)

  if (months === 0) {
    return `${days} day${days === 1 ? '' : 's'} old`
  } else if (months < 24) {
    return `${months} month${months === 1 ? '' : 's'} old`
  } else {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) {
      return `${years} year${years === 1 ? '' : 's'} old`
    }
    return `${years}y ${remainingMonths}m old`
  }
}

// Transform activities into timeline events
const timelineEvents = computed(() => {
  const events = props.activities
    .filter(a => {
      // Include milestones + activities with photos + notes
      return isMilestoneEvent(a) || a.photoUrl || a.notes
    })
    .map((activity, index, filteredArray) => {
      const category = categorizeEvent(activity)
      const isMilestone = isMilestoneEvent(activity)

      let weightChange = null
      if (activity.type === 'Weight Check' && activity.medicalData?.weight) {
        // Find previous weight check
        const previousWeights = filteredArray
          .filter((a, i) => i > index && a.type === 'Weight Check' && a.medicalData?.weight)
        if (previousWeights.length > 0) {
          weightChange = calculateWeightChange(activity, previousWeights[0])
        }
      }

      let ageAtTime = null
      if (props.pet?.birthday) {
        ageAtTime = calculateAgeAtTime(props.pet.birthday, activity.timestamp)
      }

      return {
        id: activity.id,
        title: activity.type,
        description: activity.notes || null,
        emoji: activity.emoji,
        timestamp: activity.timestamp,
        type: activity.type,
        category,
        isMilestone,
        photoUrl: activity.photoUrl || null,
        medicalData: activity.medicalData || null,
        weightChange,
        ageAtTime
      }
    })
    .sort((a, b) => b.timestamp - a.timestamp)

  return events
})

function formatTimelineDate(timestamp) {
  const date = new Date(timestamp)
  const relative = formatDistanceToNow(date, { addSuffix: true })
  const absolute = format(date, 'MMM d, yyyy • h:mm a')
  return `${absolute} (${relative})`
}
</script>

<style scoped>
.pet-timeline {
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

/* Timeline container */
.timeline-container {
  position: relative;
  padding: 1rem 0;
}

/* Timeline event */
.timeline-event {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.timeline-event:last-child {
  margin-bottom: 0;
}

/* Timeline marker */
.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.timeline-dot {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dot-medical {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.dot-activity {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.dot-routine {
  background: linear-gradient(135deg, #10b981, #059669);
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 2rem;
  background: linear-gradient(
    to bottom,
    rgba(107, 114, 128, 0.3),
    rgba(107, 114, 128, 0.1)
  );
  margin-top: 0.5rem;
}

.dark .timeline-line {
  background: linear-gradient(
    to bottom,
    rgba(156, 163, 175, 0.3),
    rgba(156, 163, 175, 0.1)
  );
}

/* Timeline content */
.timeline-content {
  flex: 1;
  padding: 1.25rem;
  animation: slideInRight 0.4s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-1rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.milestone-badge {
  display: inline-flex;
  font-size: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.timeline-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.dark .timeline-description {
  color: #9ca3af;
}

.timeline-photo {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-photo:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.timeline-medical {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
  border-radius: 0.375rem;
}

.dark .timeline-medical {
  background: rgba(59, 130, 246, 0.15);
}

.timeline-age {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.dark .timeline-age {
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 640px) {
  .timeline-event {
    gap: 1rem;
  }

  .timeline-dot {
    width: 2.5rem;
    height: 2.5rem;
  }

  .timeline-content {
    padding: 1rem;
  }

  .timeline-photo {
    max-width: 100%;
  }
}
</style>
