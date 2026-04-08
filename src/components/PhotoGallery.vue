<template>
  <div class="photo-gallery">
    <!-- Empty state -->
    <div v-if="photoActivities.length === 0" class="empty-state">
      <span class="empty-emoji">📸</span>
      <p class="empty-text">No photos yet</p>
      <p class="empty-subtext">Attach photos to activities to see them here</p>
    </div>

    <!-- Photo Grid -->
    <div v-else class="photo-grid">
      <div
        v-for="activity in photoActivities"
        :key="activity.id"
        class="photo-card"
        @click="openLightbox(activity)"
      >
        <img
          :src="activity.photoUrl"
          :alt="`${activity.type} photo`"
          class="photo-image"
          loading="lazy"
        />
        <div class="photo-overlay">
          <span class="photo-emoji">{{ activity.emoji }}</span>
          <span class="photo-date">{{ formatDate(activity.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxActivity"
          class="lightbox"
          @click.self="closeLightbox"
        >
          <button
            @click="closeLightbox"
            class="lightbox-close"
            aria-label="Close lightbox"
          >
            ✕
          </button>

          <div class="lightbox-content">
            <img
              :src="lightboxActivity.photoUrl"
              :alt="`${lightboxActivity.type} photo`"
              class="lightbox-image"
            />

            <div class="lightbox-info">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-3xl">{{ lightboxActivity.emoji }}</span>
                <h3 class="text-xl font-bold text-white">
                  {{ lightboxActivity.type }}
                </h3>
              </div>

              <p class="text-sm text-gray-300 mb-2">
                {{ formatDateTime(lightboxActivity.timestamp) }}
              </p>

              <p v-if="lightboxActivity.notes" class="text-sm text-gray-200">
                {{ lightboxActivity.notes }}
              </p>

              <div v-if="petName" class="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                <span>{{ petEmoji }}</span>
                <span class="text-sm text-white font-medium">{{ petName }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  },
  pets: {
    type: Array,
    default: () => []
  }
})

const lightboxActivity = ref(null)

// Filter activities with photos
const photoActivities = computed(() => {
  return props.activities
    .filter(a => a.photoUrl)
    .sort((a, b) => b.timestamp - a.timestamp)
})

// Get pet info for lightbox
const petName = computed(() => {
  if (!lightboxActivity.value || !lightboxActivity.value.petId) return null
  const pet = props.pets.find(p => p.id === lightboxActivity.value.petId)
  return pet?.name || null
})

const petEmoji = computed(() => {
  if (!lightboxActivity.value || !lightboxActivity.value.petId) return null
  const pet = props.pets.find(p => p.id === lightboxActivity.value.petId)
  return pet?.emoji || null
})

function formatDate(timestamp) {
  return format(new Date(timestamp), 'MMM d, yyyy')
}

function formatDateTime(timestamp) {
  return format(new Date(timestamp), 'MMMM d, yyyy • h:mm a')
}

function openLightbox(activity) {
  lightboxActivity.value = activity
  document.body.classList.add('modal-open')
}

function closeLightbox() {
  lightboxActivity.value = null
  document.body.classList.remove('modal-open')
}
</script>

<style scoped>
.photo-gallery {
  min-height: 200px;
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

/* Photo Grid */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}

/* Photo Cards */
.photo-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-emoji {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.photo-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.lightbox-close {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10001;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 0.75rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.lightbox-info {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  min-width: 300px;
  max-width: 500px;
}

/* Lightbox transitions */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active .lightbox-content,
.lightbox-leave-active .lightbox-content {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.lightbox-enter-from .lightbox-content {
  transform: scale(0.8);
}

.lightbox-leave-to .lightbox-content {
  transform: scale(0.9);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .lightbox-info {
    min-width: 0;
    width: 100%;
  }

  .lightbox-content {
    gap: 1rem;
  }

  .lightbox-image {
    max-height: 60vh;
  }
}
</style>
