<template>
  <v-dialog
    v-model="isVisible"
    max-width="500px"
    persistent
    :disabled="loading"
  >
    <v-card class="text-center">
      <!-- Dialog Header -->
      <v-card-title class="pa-6 pb-3">
        <div class="d-flex align-center justify-center w-100">
          <v-icon
            size="64"
            color="error"
            class="mb-3"
          >
            mdi-delete-alert
          </v-icon>
        </div>
        <h2 class="text-h5 font-weight-bold text-error text-center w-100">
          Delete Announcement
        </h2>
      </v-card-title>

      <v-divider />

      <!-- Dialog Content -->
      <v-card-text class="pa-6">
        <div v-if="announcement">
          <p class="text-body-1 mb-4">
            Are you sure you want to delete this announcement?
          </p>

          <!-- Announcement Preview -->
          <v-card
            variant="outlined"
            class="ma-2 pa-4 bg-grey-lighten-5"
          >
            <div class="text-left">
              <h3 class="text-h6 font-weight-bold text-primary mb-2">
                {{ announcement.title }}
              </h3>

              <div class="d-flex align-center mb-2">
                <v-icon
                  size="small"
                  color="primary"
                  class="mr-2"
                >
                  mdi-calendar
                </v-icon>
                <span class="text-body-2">
                  {{ formatDate(announcement.date) }}
                </span>
              </div>

              <div
                v-if="announcement.starting_time || announcement.ending_time"
                class="d-flex align-center mb-2"
              >
                <v-icon
                  size="small"
                  color="primary"
                  class="mr-2"
                >
                  mdi-clock-outline
                </v-icon>
                <span class="text-body-2">
                  <span v-if="announcement.starting_time">
                    {{ formatTime(announcement.starting_time) }}
                  </span>
                  <span v-if="announcement.starting_time && announcement.ending_time">
                    -
                  </span>
                  <span v-if="announcement.ending_time">
                    {{ formatTime(announcement.ending_time) }}
                  </span>
                </span>
              </div>

              <p
                v-if="announcement.description"
                class="text-body-2 text-grey-darken-1 mb-0"
              >
                {{ announcement.description.length > 100
                  ? announcement.description.substring(0, 100) + '...'
                  : announcement.description }}
              </p>
            </div>
          </v-card>

          <p class="text-body-2 text-error font-weight-medium mt-4 mb-0">
            This action cannot be undone.
          </p>
        </div>

        <div v-else class="text-grey">
          <v-icon
            size="48"
            color="grey"
            class="mb-2"
          >
            mdi-file-question-outline
          </v-icon>
          <p class="text-body-1">
            No announcement selected for deletion.
          </p>
        </div>

        <!-- Error Message -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mt-4"
          :text="errorMessage"
        />
      </v-card-text>

      <!-- Dialog Actions -->
      <v-divider />
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          :loading="loading"
          :disabled="!announcement"
          @click="handleConfirmDelete"
        >
          <v-icon start>mdi-delete</v-icon>
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnnouncementServices } from '@/views/announcements/announcementServices'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  announcement: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'announcement-deleted'
])

// Composables
const announcementServices = useAnnouncementServices()
const { deleteAnnouncement, formatDate, formatTime } = announcementServices

// Reactive state
const loading = ref(false)
const errorMessage = ref('')

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const handleConfirmDelete = async () => {
  if (!props.announcement) return

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await deleteAnnouncement(props.announcement.id)

    if (result.success) {
      emit('announcement-deleted', props.announcement)
      isVisible.value = false
    } else {
      errorMessage.value = result.error || 'Failed to delete announcement. Please try again.'
    }
  } catch (error) {
    console.error('Error deleting announcement:', error)
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (loading.value) return
  errorMessage.value = ''
  isVisible.value = false
}
</script>
