<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { EVENT_CATEGORIES } from '../utils/constants'
import { useAddEvents } from '../composables/addEvents'
import { useAuthUserStore } from '@/stores/authUser'
import {
  formatDate,
  formatTime,
  formatTimeString,
  getStatusColor,
  loadTransformationData as loadTransformationDataHelper,
  loadClickedEventData as loadClickedEventDataHelper,
  getEventStatus
} from '../utils/helpers'
import { extractNumericIdFromCalendarEvent } from '../composables/helpers'
import DenialCommentDialog from './DenialCommentDialog.vue'

// Component name for ESLint multi-word rule
defineOptions({
  name: 'ViewEventDialog'
})

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  event: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'approve-event', 'deny-event', 'delete-event'])

// Add Events composable for handling other_events deletion
const { deleteEvent: deleteOtherEvent } = useAddEvents()

// Auth store for getting user emails
const authStore = useAuthUserStore()

// Denial comment dialog state
const showDenialDialog = ref(false)
const denialLoading = ref(false)

// Image dialog state
const showImageDialog = ref(false)
const selectedImageUrl = ref('')

// Reactive data for localStorage
const transformationData = ref(null)
const clickedEventData = ref(null)

// Booking owner email cache
const bookingOwnerEmail = ref('')

// Functions to read from localStorage (using imported helpers)
const loadTransformationData = () => {
  transformationData.value = loadTransformationDataHelper(props.event)
}

const loadClickedEventData = () => {
  clickedEventData.value = loadClickedEventDataHelper()
}

// Load data when component mounts and when event prop changes
const loadStorageData = () => {
  loadTransformationData()
  loadClickedEventData()
  fetchBookingOwnerEmail()
}

// Fetch booking owner email using admin function
const fetchBookingOwnerEmail = async () => {
  const booking = transformationData.value?.booking || eventData.value?.booking

  if (booking?.user_id) {
    try {
      const result = await authStore.getUserEmailById(booking.user_id)
      if (!result.error && result.data?.email) {
        bookingOwnerEmail.value = result.data.email
      } else {
        // Fallback to existing email if available
        bookingOwnerEmail.value = booking.email || ''
      }
    } catch (error) {
      console.error('Error fetching booking owner email:', error)
      // Fallback to existing email if available
      bookingOwnerEmail.value = booking.email || ''
    }
  } else if (booking?.email) {
    // Use existing email if no user_id
    bookingOwnerEmail.value = booking.email
  } else {
    bookingOwnerEmail.value = ''
  }
}

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Get the actual event data (handle both direct event and calendar transformed event)
const eventData = computed(() => {
  if (!props.event) return null

  // Check if it's a transformed calendar event (has originalEvent) - this is most common case
  if (props.event?.originalEvent) {
    return props.event.originalEvent
  }

  // Check if it's from vue-simple-calendar (has originalItems)
  if (props.event?.originalItems && props.event.originalItems.length > 0) {
    return props.event.originalItems[0].originalEvent || props.event.originalItems[0]
  }

  // Direct event data (fallback)
  return props.event
})

const eventDetails = computed(() => {
  if (!props.event) return null

  // Primary data source: localStorage transformationData
  const storageData = transformationData.value
  const fallbackEventData = eventData.value

  // Helper function to get field values prioritizing localStorage
  const getFieldValue = (storageKey, fallbackValue, formatter = null) => {
    const value = storageData?.[storageKey] || fallbackValue
    return formatter ? formatter(value) : value
  }

  // Get status from localStorage first, then fallback (using imported helper)
  let eventStatus = getEventStatus(storageData, fallbackEventData)

  // Check if booking has ref_number and override status to "Complete"
  const booking = storageData?.booking || fallbackEventData?.booking
  if (booking?.ref_number) {
    eventStatus = 'Complete'
  }

  // Get category and determine event configuration
  const category = getFieldValue('category', fallbackEventData?.category || 'unknown')

  // Console log the JSON data for debugging
  console.log('ViewEventDialog JSON Data:', {
    storageData,
    fallbackEventData,
    eventStatus,
    category,
    originalEvent: props.event?.originalEvent,
    fullEventData: eventData.value,
    propsEvent: props.event,
    eventEndTimeFromOriginalItem: props.event?.originalItem?.originalEvent?.eventEndTime,
    eventEndTimeFromFallback: fallbackEventData?.eventEndTime
  })

  // Get status color based on value (using imported helper)
  const statusColor = getStatusColor(eventStatus)

  // Determine event type configuration based on category from localStorage
  const getEventConfig = () => {
    const categoryUpper = category.toUpperCase()

    if (EVENT_CATEGORIES[categoryUpper]) {
      return {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Mass Details`,
        icon: EVENT_CATEGORIES[categoryUpper].icon,
        color: EVENT_CATEGORIES[categoryUpper].color
      }
    }

    // Fallback for unknown categories
    return {
      title: 'Event Details',
      icon: 'mdi-calendar-check',
      color: '#4CAF50'
    }
  }

  const config = getEventConfig()

  // Build fields array using localStorage data prioritized
  const fields = [
    {
      label: 'Event Title',
      value: getFieldValue('eventName', fallbackEventData?.title || 'N/A'),
      source: storageData?.eventName ? 'localStorage' : 'fallback'
    },
    {
      label: 'Booking Owner',
      value: (() => {
        // Check if this is an "others" category event
        if (category.toLowerCase() === 'others' || category.toLowerCase() === 'other') {
          return 'San Isidro Labrador Parish'
        }

        const booking = storageData?.booking || fallbackEventData?.booking

        // Prioritize the fetched email from admin function
        if (bookingOwnerEmail.value) {
          return bookingOwnerEmail.value
        }

        // Fallback to name if email not available
        if (booking?.fname && booking?.lname) {
          return `${booking.fname} ${booking.lname}`
        } else if (booking?.email) {
          return booking.email
        }
        return 'N/A'
      })(),
      source: (category.toLowerCase() === 'others' || category.toLowerCase() === 'other')
        ? 'parish-default'
        : (bookingOwnerEmail.value ? 'admin-lookup' : (storageData?.booking ? 'localStorage' : 'fallback'))
    },
    {
      label: 'Date',
      value: getFieldValue('eventDate', fallbackEventData?.startDate, (date) => {
        if (!date) return 'N/A'
        return formatDate(date)
      }),
      source: storageData?.eventDate ? 'localStorage' : 'fallback'
    },
    {
      label: 'Start Time',
      value: getFieldValue('eventTime', fallbackEventData?.time || formatTime(fallbackEventData?.startDate) || 'All day', (time) => {
        if (!time || time === 'All day') return time
        // If time is in HH:MM:SS format, format it to AM/PM
        if (typeof time === 'string' && time.includes(':')) {
          return formatTimeString(time)
        }
        return time
      }),
      source: storageData?.eventTime ? 'localStorage' : 'fallback'
    },
    {
      label: 'End Time',
      value: getFieldValue('eventEndTime',
        fallbackEventData?.eventEndTime ||
        props.event?.originalItem?.originalEvent?.eventEndTime ||
        props.event?.originalEvent?.eventEndTime ||
        props.event?.eventEndTime ||
        formatTime(fallbackEventData?.endDate) ||
        'N/A',
        (time) => {
          if (!time || time === 'N/A') return 'N/A'
          // If time is in HH:MM:SS format, format it to AM/PM
          if (typeof time === 'string' && time.includes(':')) {
            return formatTimeString(time)
          }
          return time
        }
      ),
      source: storageData?.eventEndTime ? 'localStorage' : 'fallback'
    },
    // Only show description for "others" category events
    ...(category.toLowerCase() === 'others' || category.toLowerCase() === 'other' ? [{
      label: 'Description',
      value: getFieldValue('description',
        fallbackEventData?.description ||
        eventData.value?.description ||
        eventData.value?.originalEvent?.description ||
        props.event?.originalItem?.originalEvent?.description ||
        props.event?.clickedEvent?.originalItem?.originalEvent?.description ||
        props.event?.description ||
        'No description provided'
      ),
      source: storageData?.description ? 'localStorage' : 'fallback',
      isDescription: true
    }] : []),
    {
      label: 'Status',
      value: eventStatus,
      source: storageData?.status || storageData?.booking ? 'localStorage' : 'fallback',
      isStatus: true,
      statusColor: statusColor
    }
  ]



  return {
    ...config,
    fields,
    // Additional metadata
    dataSource: storageData ? 'localStorage' : 'fallback',
    hasLocalStorageData: !!storageData,
    storageDataKeys: storageData ? Object.keys(storageData) : []
  }
})

// Check if actions should be disabled (approved or denied)
const areActionsDisabled = computed(() => {
  if (!eventDetails.value) return false

  const statusField = eventDetails.value.fields.find(field => field.isStatus)
  const status = statusField?.value?.toLowerCase() || ''

  return status.includes('denied') || status.includes('approved') || status.includes('complete')
})

// Get attached images when booking has ref_number
const attachedImages = computed(() => {
  const booking = transformationData.value?.booking || eventData.value?.booking

  // Only show images if booking has ref_number
  if (!booking?.ref_number) return []

  const images = []

  // Check each attached image and add to array if it exists
  if (booking.attached_images_1) {
    images.push({
      url: booking.attached_images_1,
      label: 'Attachment 1'
    })
  }

  if (booking.attached_images_2) {
    images.push({
      url: booking.attached_images_2,
      label: 'Attachment 2'
    })
  }

  if (booking.attached_images_3) {
    images.push({
      url: booking.attached_images_3,
      label: 'Attachment 3'
    })
  }

  return images
})

// Event handlers

const handleApprove = () => {
  emit('approve-event', eventData.value)
  dialog.value = false
}

const handleDeny = () => {
  // Show denial comment dialog instead of directly denying
  showDenialDialog.value = true
}

const handleDenyWithComment = (comment) => {
  denialLoading.value = true
  emit('deny-event', eventData.value, comment)
  showDenialDialog.value = false
  dialog.value = false
  denialLoading.value = false
}

const handleDenialCancel = () => {
  showDenialDialog.value = false
}

const openImageDialog = (imageUrl) => {
  selectedImageUrl.value = imageUrl
  showImageDialog.value = true
}

const handleDelete = async () => {
  try {
    // Check if this is an "others" category event that should use other_events table
    const eventCategory = eventData.value?.category?.toLowerCase()

    if (eventCategory === 'others' || eventCategory === 'other') {
      // Get the event ID from multiple possible locations
      const eventId = eventData.value?.originalEvent?.id ||
                     eventData.value?.bookingData?.id ||
                     eventData.value?.bookingId ||
                     eventData.value?.id

      console.log('Attempting to delete other event with ID:', eventId, 'Event data:', eventData.value)

      if (eventId) {
        // Extract numeric ID from calendar event ID (e.g., "other_1" -> 1)
        const numericId = extractNumericIdFromCalendarEvent(eventId)

        console.log('Extracted numeric ID for deletion:', numericId, 'from original ID:', eventId)

        // Use the addEvents composable to delete from other_events table
        const result = await deleteOtherEvent(numericId)

        if (result.success) {
          console.log('Successfully deleted other event from database')
          dialog.value = false
          emit('delete-event', eventData.value) // Emit to refresh calendar
          return
        } else {
          console.error('Failed to delete other event from database:', result.error)
        }
      } else {
        console.error('Could not find event ID for other event deletion')
      }
    }

    // For all other event types (wedding, baptism, funeral, thanksgiving)
    // or if the other_events deletion failed, use the original delete handler
    emit('delete-event', eventData.value)
    dialog.value = false

  } catch (error) {
    console.error('Error in handleDelete:', error)
    // Fallback to original delete handler
    emit('delete-event', eventData.value)
    dialog.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  loadStorageData()
})

// Watch for event prop changes and reload data
watch(() => props.event, () => {
  if (props.event) {
    loadStorageData()
  }
}, { immediate: true })
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    persistent
  >
    <v-card v-if="eventDetails" class="event-details-dialog">
      <!-- Header -->
      <v-card-title class="d-flex align-center pa-6" :style="{ backgroundColor: eventDetails.color }">
        <v-icon :icon="eventDetails.icon" size="32" class="me-3 text-white"></v-icon>
        <div class="text-white">
          <h2 class="text-h5 font-weight-bold mb-1">{{ eventDetails.title }}</h2>
          <p class="text-body-2 mb-0 opacity-90">{{ eventData?.title }}</p>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="dialog = false"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Event Details -->
      <v-card-text class="pa-6">


        <v-row>
          <v-col
            v-for="field in eventDetails.fields"
            :key="field.label"
            :cols="field.isDescription ? '12' : '12'"
            :sm="field.isDescription ? '12' : '6'"
            class="py-2"
          >
            <div class="mb-3" :class="field.isStatus ? `status-field status-${field.statusColor}` : ''">
              <p class="text-subtitle-2 font-weight-medium mb-1 text-grey-darken-1">
                {{ field.label }}
                <v-icon
                  v-if="field.isStatus"
                  icon="mdi-star"
                  size="14"
                  color="primary"
                  class="ms-1"
                ></v-icon>
                <v-icon
                  v-if="field.isDescription"
                  icon="mdi-text"
                  size="14"
                  color="info"
                  class="ms-1"
                ></v-icon>
              </p>
              <p
                v-if="field.isDescription"
                class="text-body-2 mb-0 text-grey-darken-2"
                style="white-space: pre-wrap; word-break: break-word;"
              >
                {{ field.value }}
              </p>
              <p
                v-else
                class="text-body-1 mb-0"
                :class="field.isStatus ? `font-weight-bold text-${field.statusColor}` : ''"
              >
                {{ field.value }}
              </p>
            </div>
          </v-col>
        </v-row>

        <!-- Denial Comment Section -->
        <v-alert
          v-if="(eventData?.booking?.comment && eventData?.booking?.is_denied) ||
                (transformationData?.booking?.comment && transformationData?.booking?.is_denied)"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          <v-icon icon="mdi-message-alert" class="me-2"></v-icon>
          <div>
            <strong>Denial Reason:</strong>
            <p class="mb-0 mt-1" style="white-space: pre-wrap;">
              {{ transformationData?.booking?.comment || eventData?.booking?.comment }}
            </p>
            <small
              v-if="transformationData?.booking?.denied_at || eventData?.booking?.denied_at"
              class="text-grey-darken-1"
            >
              Denied on {{ formatDate(transformationData?.booking?.denied_at || eventData?.booking?.denied_at) }}
            </small>
          </div>
        </v-alert>

        <!-- Time Conflict Warning -->
        <v-alert
          v-if="props.event?.hasConflict"
          :type="props.event?.conflictSeverity === 'error' ? 'error' : 'warning'"
          variant="tonal"
          class="mb-4"
        >
          <div class="d-flex align-center">
            <v-icon
              :icon="props.event?.conflictSeverity === 'error' ? 'mdi-alert-octagon' : 'mdi-alert-circle'"
              class="me-2"
            ></v-icon>
            <div>
              <strong>
                {{ props.event?.conflictSeverity === 'error' ? 'Schedule Conflict' : 'Potential Conflict' }}
              </strong>
              <p class="mb-0 mt-1">
                This event has a time conflict with other scheduled events on the same date.
                Please review the schedule to ensure proper coordination.
              </p>
              <small class="text-grey-darken-1">
                {{ props.event?.conflictSeverity === 'error'
                   ? 'This conflict must be resolved before approval.'
                   : 'Consider adjusting the schedule if possible.' }}
              </small>
            </div>
          </div>
        </v-alert>

        <!-- Additional event info -->
        <v-divider class="my-4"></v-divider>

        <div class="d-flex flex-wrap align-center gap-2 mb-4">
          <v-chip
            :color="eventDetails.color"
            size="small"
            variant="tonal"
          >
            <v-icon :icon="eventDetails.icon" size="16" class="me-1"></v-icon>
            {{ eventData?.category?.toUpperCase() }}
          </v-chip>

          <v-chip
            v-if="eventData?.allDay"
            color="primary"
            size="small"
            variant="outlined"
          >
            All Day Event
          </v-chip>


        </div>

        <!-- Booking Reference -->
        <v-alert
          v-if="eventData?.booking?.ref_number || eventData?.booking?.id"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <v-icon icon="mdi-bookmark" class="me-2"></v-icon>
          <strong>Booking Reference:</strong>
          {{ eventData?.booking?.ref_number || `#${eventData?.booking?.id}` }}
        </v-alert>

        <!-- Attached Images -->
        <div v-if="attachedImages.length > 0" class="mb-4">
          <v-divider class="mb-4"></v-divider>

          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-paperclip" color="primary" class="me-2"></v-icon>
            <h3 class="text-h6 mb-0">Attached Images</h3>
          </div>

          <v-row>
            <v-col
              v-for="(image, index) in attachedImages"
              :key="index"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card class="image-card" elevation="2">
                <v-img
                  :src="image.url"
                  :alt="image.label"
                  aspect-ratio="1"
                  cover
                  class="cursor-pointer"
                  @click="openImageDialog(image.url)"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </div>
                  </template>
                  <template v-slot:error>
                    <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
                      <v-icon icon="mdi-image-broken" size="48" color="grey"></v-icon>
                    </div>
                  </template>
                </v-img>
                <v-card-subtitle class="text-center py-2">
                  {{ image.label }}
                </v-card-subtitle>
              </v-card>
            </v-col>
          </v-row>
        </div>


      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <!-- Disabled actions alert -->


        <v-spacer></v-spacer>

        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="dialog = false"
        >
          Close
        </v-btn>

        <!-- Show delete button when actions are disabled -->
        <v-btn
          v-if="areActionsDisabled"
          color="error"
          variant="elevated"
          prepend-icon="mdi-delete"
          @click="handleDelete"
        >
          Delete
        </v-btn>

        <!-- Show approve/deny buttons when actions are enabled -->
        <template v-else>
          <v-btn
            color="success"
            variant="outlined"
            prepend-icon="mdi-check"
            @click="handleApprove"
          >
            Approve
          </v-btn>

          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-close"
            @click="handleDeny"
          >
            Deny
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Denial Comment Dialog -->
  <DenialCommentDialog
    v-model="showDenialDialog"
    :event-title="eventDetails?.eventName || eventDetails?.title || 'Event'"
    :loading="denialLoading"
    @deny-with-comment="handleDenyWithComment"
    @cancel="handleDenialCancel"
  />

  <!-- Image View Dialog -->
  <v-dialog v-model="showImageDialog" max-width="800">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Image Preview</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="showImageDialog = false"
        ></v-btn>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-img
          :src="selectedImageUrl"
          max-height="600"
          contain
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
          </template>
          <template v-slot:error>
            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2" style="min-height: 300px;">
              <div class="text-center">
                <v-icon icon="mdi-image-broken" size="64" color="grey"></v-icon>
                <p class="text-body-1 mt-2 mb-0">Failed to load image</p>
              </div>
            </div>
          </template>
        </v-img>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.event-details-dialog {
  border-radius: 12px;
  overflow: hidden;
}

/* Status field highlighting */
.status-field {
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

/* Status color variations */
.status-success {
  border: 2px solid rgba(var(--v-theme-success), 0.3);
  background-color: rgba(var(--v-theme-success), 0.05);
}

.status-success:hover {
  border-color: rgba(var(--v-theme-success), 0.6);
  background-color: rgba(var(--v-theme-success), 0.1);
}

.status-error {
  border: 2px solid rgba(var(--v-theme-error), 0.3);
  background-color: rgba(var(--v-theme-error), 0.05);
}

.status-error:hover {
  border-color: rgba(var(--v-theme-error), 0.6);
  background-color: rgba(var(--v-theme-error), 0.1);
}

.status-warning {
  border: 2px solid rgba(var(--v-theme-warning), 0.3);
  background-color: rgba(var(--v-theme-warning), 0.05);
}

.status-warning:hover {
  border-color: rgba(var(--v-theme-warning), 0.6);
  background-color: rgba(var(--v-theme-warning), 0.1);
}

.status-primary {
  border: 2px solid rgba(var(--v-theme-primary), 0.3);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.status-primary:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* Image card styles */
.image-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}

/* Mobile responsive adjustments */
@media (max-width: 600px) {
  .event-details-dialog {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .status-field {
    padding: 8px;
  }
}
</style>
