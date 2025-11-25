<script setup>
import { ref, defineProps, defineEmits, onMounted, onUpdated, watch } from 'vue'
import { CalendarView } from 'vue-simple-calendar'
import 'vue-simple-calendar/dist/vue-simple-calendar.css'
import '../styles/calendar-theme.css'
import { EVENT_LEGEND } from '../utils/constants.ts'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  calendarEvents: {
    type: Array,
    default: () => []
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  displayPeriodUom: {
    type: String,
    default: 'month'
  },
  displayPeriodCount: {
    type: Number,
    default: 1
  },
  startingDayOfWeek: {
    type: Number,
    default: 0
  },
  displayPeriodLabel: {
    type: String,
    default: ''
  },
  currentView: {
    type: String,
    default: 'month'
  },
  calendarViews: {
    type: Array,
    default: () => []
  },
  conflictsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'click-date',
  'click-item',
  'previous-period',
  'next-period',
  'today',
  'change-view',
  'refresh'
])

const calendarRef = ref(null)

const goToPreviousPeriod = () => {
  emit('previous-period')
}

const goToNextPeriod = () => {
  emit('next-period')
}

const goToToday = () => {
  emit('today')
}

const changeView = (view) => {
  emit('change-view', view)
}

const handleDateClick = (date) => {
  emit('click-date', date)
}

const handleEventClick = (event) => {
  emit('click-item', event)
}

const handleRefresh = () => {
  emit('refresh')
}

// Helper function to check if a date is in the past
const isPastDate = (date) => {
  const today = new Date()
  const compareDate = new Date(date)

  // Reset time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0)
  compareDate.setHours(0, 0, 0, 0)

  return compareDate < today
}

// Override the date click handler to prevent past date interactions
const handleDateClickSafe = (date) => {
  if (isPastDate(date)) {
    console.log('Past date clicked - interaction prevented:', date)
    return false // Prevent interaction
  }
  handleDateClick(date)
}

// Function to mark past dates visually
const markPastDates = () => {
  if (!calendarRef.value) return

  // Use nextTick to ensure DOM is updated
  setTimeout(() => {
    const dayElements = document.querySelectorAll('.cv-day')
    dayElements.forEach(dayEl => {
      const dayNumber = parseInt(dayEl.querySelector('.cv-day-number')?.textContent)
      if (dayNumber && !isNaN(dayNumber)) {
        const currentMonth = props.currentPeriodStart.getMonth()
        const currentYear = props.currentPeriodStart.getFullYear()
        const dateToCheck = new Date(currentYear, currentMonth, dayNumber)

        if (isPastDate(dateToCheck) && !dayEl.classList.contains('outsideOfMonth')) {
          dayEl.classList.add('past')
        } else {
          dayEl.classList.remove('past')
        }
      }
    })
  }, 100)
}

// Watch for period changes and re-mark past dates
watch(() => props.currentPeriodStart, () => {
  markPastDates()
})

// Mark past dates after component is mounted and updated
onMounted(() => {
  markPastDates()
})

onUpdated(() => {
  markPastDates()
})
</script>

<template>
  <v-card elevation="0" class="calendar-view-container">
    <!-- Calendar Controls -->
    <v-card-text class="pa-6 pb-0">
      <div class="d-flex flex-column flex-sm-row align-center justify-space-between gap-4 mb-6">
        <!-- Navigation Controls -->
        <div class="d-flex align-center gap-2">
          <v-btn
            icon="mdi-chevron-left"
            variant="outlined"
            size="small"
            @click="goToPreviousPeriod"
          ></v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            class="mx-2"
            @click="goToToday"
          >
            Today
          </v-btn>

          <v-btn
            icon="mdi-chevron-right"
            variant="outlined"
            size="small"
            @click="goToNextPeriod"
          ></v-btn>

          <div class="ms-4">
            <h3 class="text-h6 font-weight-medium">{{ displayPeriodLabel }}</h3>
          </div>
        </div>

        <!-- View Toggle -->
        <div class="d-flex align-center gap-2">
          <v-btn-toggle
            :model-value="currentView"
            color="primary"
            variant="outlined"
            divided
            mandatory
          >
            <v-btn
              v-for="view in calendarViews"
              :key="view.value"
              :value="view.value"
              size="small"
              @click="changeView(view.value)"
            >
              <v-icon :icon="view.icon" class="me-1"></v-icon>
              <span class="d-none d-sm-inline">{{ view.title }}</span>
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- Event Legend -->
      <div class="mb-6">
        <div class="d-flex flex-wrap align-center gap-3">
          <span class="text-subtitle-2 font-weight-medium me-2">Event Types:</span>
          <v-chip
            v-for="legend in EVENT_LEGEND"
            :key="legend.label"
            :color="legend.color"
            size="small"
            variant="flat"
            class="me-2 mb-1 event-legend-chip"
          >
            <v-icon :icon="legend.icon" class="me-1" size="16"></v-icon>
            {{ legend.label }}
          </v-chip>
        </div>
      </div>

      <!-- Conflict Indicator -->
      <v-alert
        v-if="conflictsCount > 0"
        type="warning"
        variant="tonal"
        class="mb-6"
        density="compact"
      >
        <div class="d-flex align-center">
          <v-icon icon="mdi-alert-circle" class="me-2"></v-icon>
          <span class="text-subtitle-2">
            {{ conflictsCount }} time conflict{{ conflictsCount > 1 ? 's' : '' }} detected
          </span>
        </div>
        <div class="text-caption mt-1">
          Events with red borders have scheduling conflicts. Click on conflicting events for details.
        </div>
      </v-alert>
    </v-card-text>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      ></v-progress-circular>
      <span class="ms-4 text-subtitle-1">Loading calendar events...</span>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="ma-6"
    >
      {{ error }}
      <template #append>
        <v-btn
          color="error"
          variant="text"
          @click="handleRefresh"
        >
          Retry
        </v-btn>
      </template>
    </v-alert>

    <!-- Calendar View -->
    <div v-else-if="calendarEvents.length > 0" class="calendar-wrapper pa-6 pt-0">
      <CalendarView
        ref="calendarRef"
        :show-date="currentPeriodStart"
        :items="calendarEvents"
        :display-period-uom="displayPeriodUom"
        :display-period-count="displayPeriodCount"
        :starting-day-of-week="startingDayOfWeek"
        :enable-drag-drop="false"
        :show-times="false"
        :time-format-options="{ hour: 'numeric', minute: '2-digit' }"
        class="theme-calendar calendar-large"
        item-content-height="2.5rem"
        @click-date="handleDateClickSafe"
        @click-item="handleEventClick"
      >
      </CalendarView>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center pa-8">
      <v-icon color="grey-lighten-1" size="64" class="mb-4">
        mdi-calendar-blank
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">No Events Found</h3>
      <p class="text-body-2 text-grey mb-4">
        No events are currently scheduled. Events from approved bookings will appear here.
      </p>
      <v-btn color="primary" variant="elevated" @click="handleRefresh">
        Refresh Calendar
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.calendar-view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-wrapper {
  min-height: 600px;
  height: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.calendar-large {
  min-height: 600px;
  height: auto;
  flex: 1;
}

:deep(.cv-wrapper) {
  border-radius: 8px;
  overflow: hidden;
  height: auto;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

:deep(.cv-weeks) {
  flex: 1;
  min-height: 500px;
}

:deep(.cv-week) {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 120px;
}

:deep(.cv-day) {
  flex: 1;
  min-height: 120px;
  padding: 8px;
}

:deep(.cv-header-day) {
  background-color: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 600;
  text-transform: uppercase;
  font-size: 1rem;
  padding: 1rem 0;
  min-height: 50px;
}

:deep(.cv-day) {
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}

:deep(.cv-day.today) {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

:deep(.cv-day-number) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.1rem;
  padding: 4px 8px;
}

:deep(.cv-day.outsideOfMonth .cv-day-number) {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.6;
}

/* Past date styling - make them visually disabled */
:deep(.cv-day.past) {
  background-color: rgba(var(--v-theme-on-surface), 0.02) !important;
  pointer-events: none !important;
  cursor: not-allowed !important;
}

:deep(.cv-day.past .cv-day-number) {
  color: rgba(var(--v-theme-on-surface), 0.3) !important;
  text-decoration: line-through !important;
  opacity: 0.5 !important;
}

:deep(.cv-day.past .cv-item) {
  opacity: 0.4 !important;
  pointer-events: none !important;
}

/* Conflict styling */
:deep(.conflict-error) {
  border: 2px solid #f44336 !important;
  box-shadow: 0 0 8px rgba(244, 67, 54, 0.4) !important;
  animation: pulse-error 2s infinite;
}

:deep(.conflict-warning) {
  border: 2px solid #ff9800 !important;
  box-shadow: 0 0 8px rgba(255, 152, 0, 0.4) !important;
  animation: pulse-warning 2s infinite;
}

@keyframes pulse-error {
  0% {
    box-shadow: 0 0 8px rgba(244, 67, 54, 0.4);
  }
  50% {
    box-shadow: 0 0 12px rgba(244, 67, 54, 0.6);
  }
  100% {
    box-shadow: 0 0 8px rgba(244, 67, 54, 0.4);
  }
}

@keyframes pulse-warning {
  0% {
    box-shadow: 0 0 8px rgba(255, 152, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 12px rgba(255, 152, 0, 0.6);
  }
  100% {
    box-shadow: 0 0 8px rgba(255, 152, 0, 0.4);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .calendar-wrapper {
    padding: 1rem;
  }

  :deep(.cv-header-day) {
    font-size: 0.75rem;
    padding: 0.5rem 0;
  }
}

/* Event legend chip styling */
.event-legend-chip {
  border: 1px solid rgba(var(--v-border-color), 0.3) !important;
  font-weight: 500 !important;
}

.event-legend-chip .v-chip__content {
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
