<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { EVENT_CATEGORIES } from '../utils/constants'
import { useAddEvents } from '../composables/addEvents'
import { formatDate } from '../utils/helpers'

// Component name for ESLint multi-word rule
defineOptions({
  name: 'CalendarDialog'
})

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedDate: {
    type: String,
    required: true
  },
  eventsForDate: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'edit-event', 'add-event'])

// Add Events composable
const { loading, error, success, addEvent, clearMessages } = useAddEvents()

// Form data
const showAddEventForm = ref(false)
const eventForm = ref({
  title: '',
  description: '',
  starting_time: '',
  ending_time: ''
})

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formattedDate = computed(() => {
  try {
    return format(new Date(props.selectedDate), 'MMMM dd, yyyy')
  } catch {
    return props.selectedDate
  }
})

const dayOfWeek = computed(() => {
  try {
    return format(new Date(props.selectedDate), 'EEEE')
  } catch {
    return ''
  }
})

// Methods
const getCategoryInfo = (category) => {
  return EVENT_CATEGORIES[category?.toUpperCase()] || EVENT_CATEGORIES.OTHERS
}

const toggleAddEventForm = () => {
  showAddEventForm.value = !showAddEventForm.value
  if (showAddEventForm.value) {
    clearMessages()
    // Reset form
    eventForm.value = {
      title: '',
      description: '',
      starting_time: '',
      ending_time: ''
    }
  }
}

const handleSubmitEvent = async () => {
  if (!eventForm.value.title.trim()) {
    return
  }

  const result = await addEvent({
    title: eventForm.value.title.trim(),
    description: eventForm.value.description.trim(),
    starting_time: eventForm.value.starting_time || null,
    ending_time: eventForm.value.ending_time || null,
    eventDate: props.selectedDate // Pass the selected date from calendar
  })

  if (result.success) {
    // Reset form and close
    eventForm.value = {
      title: '',
      description: '',
      starting_time: '',
      ending_time: ''
    }
    showAddEventForm.value = false
    // Emit add-event to refresh calendar
    emit('add-event', props.selectedDate)
  }
}

const cancelAddEvent = () => {
  showAddEventForm.value = false
  clearMessages()
  eventForm.value = {
    title: '',
    description: '',
    starting_time: '',
    ending_time: ''
  }
}





const getStatusColor = (booking) => {
  // Check boolean fields first
  if (booking.is_approved) return 'success'
  if (booking.is_denied) return 'error'

  // Fallback to status string
  const status = booking.status || 'pending'
  switch (status.toLowerCase()) {
    case 'approved': return 'success'
    case 'denied':
    case 'rejected': return 'error'
    case 'pending': return 'warning'
    default: return 'info'
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
  >
    <v-card class="rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between bg-primary text-white pa-4">
        <div>
          <h3 class="text-h6 font-weight-bold mb-1">{{ dayOfWeek }}</h3>
          <p class="text-body-2 mb-0 opacity-90">{{ formattedDate }}</p>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="isOpen = false"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Content -->
      <v-card-text class="pa-0">
        <!-- No events message -->
        <div v-if="eventsForDate.length === 0" class="text-center pa-8">
          <v-icon color="primary" size="64" class="mb-4">
            mdi-calendar-plus
          </v-icon>
          <h4 class="text-h6 text-primary mb-2">Add Events in This Day</h4>
          <p class="text-body-2 text-grey">
            Start scheduling events for {{ formattedDate }}. Click the button below to create your first event.
          </p>

        </div>

        <!-- Events list -->
        <div v-else class="pa-4">
          <h4 class="text-subtitle-1 font-weight-bold mb-4 text-grey-darken-2">
            {{ eventsForDate.length }} Event{{ eventsForDate.length > 1 ? 's' : '' }} Scheduled
          </h4>

          <v-list class="pa-0">
            <v-list-item
              v-for="(event, index) in eventsForDate"
              :key="event.id"
              class="px-0 py-3"
              :class="{ 'border-t': index > 0 }"
            >
              <template #prepend>
                <v-avatar :color="event.color || '#607D8B'" size="40" class="me-4">
                  <v-icon :icon="getCategoryInfo(event.category).icon" color="white"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold text-body-1 mb-1">
                {{ event.title || event.name || 'Event' }}
              </v-list-item-title>

              <v-list-item-subtitle class="mb-2">
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip
                    :color="event.color || '#607D8B'"
                    size="small"
                    variant="tonal"
                    class="me-2"
                  >
                    {{ getCategoryInfo(event.category).name }}
                  </v-chip>

                  <div class="d-flex align-center text-caption text-grey-darken-1">
                    <v-icon icon="mdi-clock" size="16" class="me-1"></v-icon>
                    <span v-if="event.time">
                      {{ event.time }}
                      <span v-if="event.eventEndTime || event.ending_time || event.endTime">
                        - {{ event.eventEndTime || event.ending_time || event.endTime }}
                      </span>
                    </span>
                    <span v-else>All Day</span>
                  </div>

                  <v-chip
                    v-if="event.booking"
                    :color="getStatusColor(event.booking)"
                    size="small"
                    variant="tonal"
                  >
                    {{ event.booking.status || 'Pending' }}
                  </v-chip>
                </div>

                <!-- Denial Comment Display -->
                <div
                  v-if="event.booking?.comment && event.booking?.is_denied"
                  class="mt-2 pa-2 rounded bg-error-lighten-5 border border-error"
                >
                  <div class="d-flex align-center mb-1">
                    <v-icon icon="mdi-message-alert" size="16" color="error" class="me-1"></v-icon>
                    <small class="text-error font-weight-bold">Denial Reason:</small>
                  </div>
                  <p class="text-caption text-error ma-0" style="white-space: pre-wrap;">
                    {{ event.booking.comment }}
                  </p>
                  <small
                    v-if="event.booking.denied_at"
                    class="text-error-darken-1 text-caption"
                  >
                    Denied on {{ formatDate(event.booking.denied_at) }}
                  </small>
                </div>

                <!-- Time Conflict Indicator -->
                <div
                  v-if="event.hasConflict"
                  class="mt-2 pa-2 rounded border"
                  :class="event.conflictSeverity === 'error'
                    ? 'bg-error-lighten-5 border-error'
                    : 'bg-warning-lighten-5 border-warning'"
                >
                  <div class="d-flex align-center mb-1">
                    <v-icon
                      :icon="event.conflictSeverity === 'error' ? 'mdi-alert-octagon' : 'mdi-alert-circle'"
                      size="16"
                      :color="event.conflictSeverity === 'error' ? 'error' : 'warning'"
                      class="me-1"
                    ></v-icon>
                    <small
                      :class="event.conflictSeverity === 'error' ? 'text-error font-weight-bold' : 'text-warning font-weight-bold'"
                    >
                      {{ event.conflictSeverity === 'error' ? 'Schedule Conflict' : 'Potential Conflict' }}
                    </small>
                  </div>
                  <p
                    class="text-caption ma-0"
                    :class="event.conflictSeverity === 'error' ? 'text-error' : 'text-warning'"
                  >
                    Time conflict with other events on this date
                  </p>
                </div>
              </v-list-item-subtitle>


            </v-list-item>
          </v-list>
        </div>

        <!-- Add Event Form -->
        <v-expand-transition>
          <div v-if="showAddEventForm">
            <v-divider></v-divider>
            <div class="pa-6">
              <h4 class="text-h6 font-weight-bold mb-4 text-primary">
                <v-icon icon="mdi-plus-circle" class="me-2"></v-icon>
                Add New Event
              </h4>

              <!-- Error/Success Messages -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                dismissible
                @click:close="clearMessages"
              >
                {{ error }}
              </v-alert>

              <v-alert
                v-if="success"
                type="success"
                variant="tonal"
                class="mb-4"
                dismissible
                @click:close="clearMessages"
              >
                {{ success }}
              </v-alert>

              <v-form @submit.prevent="handleSubmitEvent">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="eventForm.title"
                      label="Event Title"
                      placeholder="Enter event title"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'Title is required']"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="eventForm.description"
                      label="Description (Optional)"
                      placeholder="Enter event description"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      no-resize
                    ></v-textarea>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="eventForm.starting_time"
                      label="Start Time (Optional)"
                      type="time"
                      hint="Leave empty for all-day event"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-clock-outline"
                      clearable
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="eventForm.ending_time"
                      label="End Time (Optional)"
                      type="time"
                      hint="Leave empty to default to 1 hour duration"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-clock-outline"
                      clearable
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- Form Actions -->
                <div class="d-flex justify-end gap-2 mt-4">
                  <v-btn
                    variant="text"
                    color="grey"
                    @click="cancelAddEvent"
                    :disabled="loading"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="elevated"
                    :loading="loading"
                    :disabled="!eventForm.title.trim()"
                  >
                    Add Event
                  </v-btn>
                </div>
              </v-form>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="grey"
          @click="isOpen = false"
        >
          Close
        </v-btn>
        <v-btn
          v-if="!showAddEventForm"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="toggleAddEventForm"
        >
          Add Event
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
