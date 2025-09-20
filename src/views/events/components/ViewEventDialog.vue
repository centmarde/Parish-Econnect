<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { EVENT_CATEGORIES } from '@/views/admin/utils/constants'
import {
  formatDate,
  formatTime,
  formatTimeString,
  getStatusColor,
  loadTransformationData as loadTransformationDataHelper,
  loadClickedEventData as loadClickedEventDataHelper,
  getEventStatus
} from '@/views/admin/utils/helpers'

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
  },
  viewOnly: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

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
    propsEvent: props.event
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

// Lifecycle hooks
onMounted(() => {
  loadStorageData()
})

// Watch for event prop changes and reload data
watch(() => props.event, () => {
  if (props.event) {
    loadStorageData()
  }
}, { deep: true })

// Watch dialog changes to refresh data when opened
watch(dialog, (newValue) => {
  if (newValue && props.event) {
    loadStorageData()
  }
})
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card v-if="eventDetails" elevation="8" rounded="lg">
      <!-- Header -->
      <v-card-title class="pa-0">
        <v-toolbar
          :color="eventDetails.color"
          dark
          flat
        >
          <v-icon size="28" class="mx-3">{{ eventDetails.icon }}</v-icon>
          <v-toolbar-title class="text-h6 font-weight-bold">
            {{ eventDetails.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialog = false"
          ></v-btn>
        </v-toolbar>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Content -->
      <v-card-text class="pa-6">
        <v-row>
          <v-col
            v-for="field in eventDetails.fields"
            :key="field.label"
            cols="12"
            :md="field.isDescription ? 12 : 6"
          >
            <div class="field-container">
              <div class="d-flex align-center mb-2">
                <v-icon
                  :color="field.isStatus ? field.statusColor : 'grey-darken-1'"
                  size="20"
                  class="me-2"
                >
                  {{
                    field.label === 'Event Title' ? 'mdi-calendar-text' :
                    field.label === 'Date' ? 'mdi-calendar' :
                    field.label === 'Start Time' ? 'mdi-clock-start' :
                    field.label === 'End Time' ? 'mdi-clock-end' :
                    field.label === 'Description' ? 'mdi-text' :
                    field.label === 'Status' ? 'mdi-information' :
                    'mdi-help-circle'
                  }}
                </v-icon>
                <span class="text-subtitle-2 font-weight-medium text-grey-darken-2">
                  {{ field.label }}
                </span>
              </div>

              <!-- Status field with chip -->
              <v-chip
                v-if="field.isStatus"
                :color="field.statusColor"
                size="small"
                variant="tonal"
                class="text-capitalize"
              >
                <v-icon
                  start
                  size="16"
                  :icon="
                    field.value?.toLowerCase().includes('approved') ? 'mdi-check-circle' :
                    field.value?.toLowerCase().includes('denied') ? 'mdi-close-circle' :
                    field.value?.toLowerCase().includes('pending') ? 'mdi-clock-outline' :
                    'mdi-help-circle'
                  "
                ></v-icon>
                {{ field.value }}
              </v-chip>

              <!-- Description field with proper formatting -->
              <div
                v-else-if="field.isDescription"
                class="description-field"
              >
                <div class="text-body-1 text-grey-darken-1">
                  {{ field.value }}
                </div>
              </div>

              <!-- Regular field -->
              <div
                v-else
                class="text-body-1 font-weight-medium"
                :class="field.value === 'N/A' ? 'text-grey' : 'text-grey-darken-2'"
              >
                {{ field.value }}
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Debug info (only in development) -->
        <v-expansion-panels
          v-if="$env?.NODE_ENV === 'development'"
          class="mt-4"
          variant="accordion"
        >
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="me-2">mdi-bug</v-icon>
              Debug Information
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <pre class="text-caption">{{ JSON.stringify({
                dataSource: eventDetails.dataSource,
                hasLocalStorageData: eventDetails.hasLocalStorageData,
                storageDataKeys: eventDetails.storageDataKeys,
                eventData: eventData,
                transformationData: transformationData,
                clickedEventData: clickedEventData
              }, null, 2) }}</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Footer -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="dialog = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Loading state -->
    <v-card v-else elevation="8" rounded="lg" class="pa-6">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
        ></v-progress-circular>
        <div class="text-subtitle-1 mt-4">Loading event details...</div>
      </div>
    </v-card>
  </v-dialog>
</template>

