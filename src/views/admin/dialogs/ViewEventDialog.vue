<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { EVENT_CATEGORIES } from '../utils/constants'
import {
  formatDate,
  formatTime,
  formatTimeString,
  getStatusColor,
  loadTransformationData as loadTransformationDataHelper,
  loadClickedEventData as loadClickedEventDataHelper,
  getEventStatus
} from '../utils/helpers'

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

// Reactive data for localStorage
const transformationData = ref(null)
const clickedEventData = ref(null)

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
  const eventStatus = getEventStatus(storageData, fallbackEventData)

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

  return status.includes('denied') || status.includes('approved')
})

// Event handlers

const handleApprove = () => {
  emit('approve-event', eventData.value)
  dialog.value = false
}

const handleDeny = () => {
  emit('deny-event', eventData.value)
  dialog.value = false
}

const handleDelete = () => {
  emit('delete-event', eventData.value)
  dialog.value = false
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
            cols="12"
            sm="6"
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
              </p>
              <p
                class="text-body-1 mb-0"
                :class="field.isStatus ? `font-weight-bold text-${field.statusColor}` : ''"
              >
                {{ field.value }}
              </p>
            </div>
          </v-col>
        </v-row>

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
