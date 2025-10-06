<script setup>
import { ref, computed, onMounted, defineOptions } from 'vue'
import { useDisplay } from 'vuetify'
import ViewEventDialog from './ViewEventDialog.vue'
import { useCalendarFetch } from '@/views/admin/composables/calendarFetch'
import { EVENT_LEGEND } from '@/views/admin/utils/constants'
import { CalendarView } from 'vue-simple-calendar'
import 'vue-simple-calendar/dist/vue-simple-calendar.css'
import '@/views/admin/styles/calendar-theme.css'

// Component name for ESLint multi-word rule
defineOptions({
  name: 'CalendarWidget'
})

// Vuetify responsive composable
const { xs, sm, mdAndUp, mobile } = useDisplay()

// Calendar composable
const { loading, error, allEvents, fetchAllEvents } = useCalendarFetch()

// Calendar state
const calendarRef = ref(null)
const showEventDialog = ref(false)
const selectedEvent = ref(null)
const displayPeriodUom = ref('month')
const displayPeriodCount = ref(1)
const startingDayOfWeek = ref(0) // Sunday = 0
const currentPeriodStart = ref(new Date())

// Calendar view options
const calendarViews = [
  { title: 'Month', value: 'month', icon: 'mdi-calendar-month' },
  { title: 'Week', value: 'week', icon: 'mdi-calendar-week' }
]

const currentView = ref('month')

// Responsive computed properties using Vuetify's useDisplay
const cardPadding = computed(() => {
  if (xs.value) return 'pa-3'
  if (sm.value) return 'pa-4'
  return 'pa-6'
})

const headerPadding = computed(() => {
  if (xs.value) return 'pa-4'
  if (sm.value) return 'pa-5'
  return 'pa-6'
})

const iconSize = computed(() => {
  if (xs.value) return '24'
  if (sm.value) return '28'
  return '32'
})

const showViewLabels = computed(() => mdAndUp.value)

const buttonSize = computed(() => {
  if (mobile.value) return 'small'
  return 'default'
})

const chipSize = computed(() => {
  if (xs.value) return 'x-small'
  if (sm.value) return 'small'
  return 'small'
})

const headerTextClass = computed(() => {
  if (xs.value) return 'text-h6'
  if (sm.value) return 'text-h5'
  return 'text-h5'
})

const subtitleClass = computed(() => {
  if (xs.value) return 'text-caption'
  return 'text-body-2'
})

// Computed properties
const calendarEvents = computed(() => {
  // Only show approved events for public view
  return allEvents.value
    .filter(event => event.status === 'approved')
    .map(event => ({
      id: event.id,
      title: event.title,
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
      classes: event.classes || [`event-${event.category}`],
      style: {
        backgroundColor: event.color,
        color: getContrastYIQ(event.color)
      },
      // Keep original event data for dialog
      originalEvent: event
    }))
})

const displayPeriodLabel = computed(() => {
  if (!currentPeriodStart.value) return ''

  const start = currentPeriodStart.value
  const options = {
    year: 'numeric',
    month: 'long'
  }

  if (currentView.value === 'week') {
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return start.toLocaleDateString('en-US', options)
})

// Helper function to determine text color based on background
const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return '#000000'

  const r = parseInt(hexcolor.substr(1,2),16)
  const g = parseInt(hexcolor.substr(3,2),16)
  const b = parseInt(hexcolor.substr(5,2),16)
  const yiq = ((r*299)+(g*587)+(b*114))/1000
  return (yiq >= 128) ? '#000000' : '#FFFFFF'
}

// Methods
const handleEventClick = (event) => {
  // Handle event click - show event details in view-only mode
  console.log('Event clicked:', event)

  // Save clicked event data to localStorage for ViewEventDialog access
  const clickedEventData = {
    clickedEvent: event,
    originalEvent: event?.originalEvent,
    timestamp: new Date().toISOString()
  }

  try {
    localStorage.setItem('clicked_event_data', JSON.stringify(clickedEventData))
    console.log('Saved clicked event data to localStorage:', clickedEventData)
  } catch (error) {
    console.warn('Failed to save clicked event data to localStorage:', error)
  }

  selectedEvent.value = event
  showEventDialog.value = true
}

const changeView = (view) => {
  currentView.value = view

  switch (view) {
    case 'month':
      displayPeriodUom.value = 'month'
      displayPeriodCount.value = 1
      break
    case 'week':
      displayPeriodUom.value = 'week'
      displayPeriodCount.value = 1
      break
  }
}

const goToToday = () => {
  currentPeriodStart.value = new Date()
}

const goToPreviousPeriod = () => {
  const current = new Date(currentPeriodStart.value)

  switch (currentView.value) {
    case 'month':
      current.setMonth(current.getMonth() - 1)
      break
    case 'week':
      current.setDate(current.getDate() - 7)
      break
  }

  currentPeriodStart.value = current
}

const goToNextPeriod = () => {
  const current = new Date(currentPeriodStart.value)

  switch (currentView.value) {
    case 'month':
      current.setMonth(current.getMonth() + 1)
      break
    case 'week':
      current.setDate(current.getDate() + 7)
      break
  }

  currentPeriodStart.value = current
}

// Lifecycle
onMounted(async () => {
  await fetchAllEvents()
})
</script>

<template>
  <v-card class="calendar-container" elevation="2" rounded="lg">
    <!-- Calendar Header -->
    <v-card-title :class="['d-flex align-center justify-space-between bg-primary text-white', headerPadding]">
      <div class="d-flex align-center">
        <v-icon :size="iconSize" :class="xs ? 'me-2' : 'me-3'">mdi-calendar-multiple</v-icon>
        <div>
          <h2 :class="[headerTextClass, 'font-weight-bold mb-1']">Parish Events Calendar</h2>
          <p :class="[subtitleClass, 'mb-0 opacity-90']">View upcoming parish events</p>
        </div>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Calendar Controls -->
    <v-card-text :class="[cardPadding, 'pb-0']">
      <div :class="['d-flex align-center justify-space-between', mobile ? 'flex-column gap-3' : 'flex-row gap-4', xs ? 'mb-4' : 'mb-6']">
        <!-- Navigation Controls -->
        <div :class="['d-flex align-center', xs ? 'gap-1' : 'gap-2']">
          <v-btn
            icon="mdi-chevron-left"
            variant="outlined"
            :size="buttonSize"
            @click="goToPreviousPeriod"
          ></v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            :size="buttonSize"
            :class="xs ? 'mx-1' : 'mx-2'"
            @click="goToToday"
          >
            Today
          </v-btn>

          <v-btn
            icon="mdi-chevron-right"
            variant="outlined"
            :size="buttonSize"
            @click="goToNextPeriod"
          ></v-btn>

          <div :class="xs ? 'ms-2' : 'ms-4'">
            <h3 :class="xs ? 'text-subtitle-1' : 'text-h6'" class="font-weight-medium">
              {{ displayPeriodLabel }}
            </h3>
          </div>
        </div>

        <!-- View Toggle (Month/Week only for widget) -->
        <div class="d-flex align-center gap-2">
          <v-btn-toggle
            v-model="currentView"
            color="primary"
            variant="outlined"
            divided
            mandatory
            :density="xs ? 'compact' : 'default'"
          >
            <v-btn
              v-for="view in calendarViews"
              :key="view.value"
              :value="view.value"
              :size="buttonSize"
              @click="changeView(view.value)"
            >
              <v-icon :icon="view.icon" :class="xs ? '' : 'me-1'" :size="xs ? '18' : '20'"></v-icon>
              <span v-if="showViewLabels">{{ view.title }}</span>
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- Event Legend -->
      <div :class="xs ? 'mb-4' : 'mb-6'">
        <div class="d-flex flex-wrap align-center gap-2">
          <span :class="[xs ? 'text-caption' : 'text-subtitle-2', 'font-weight-medium', xs ? 'me-1' : 'me-2']">
            Event Types:
          </span>
          <v-chip
            v-for="legend in EVENT_LEGEND"
            :key="legend.label"
            :color="legend.color"
            :size="chipSize"
            variant="tonal"
            :class="xs ? 'me-1 mb-1' : 'me-2 mb-1'"
          >
            <v-icon :icon="legend.icon" :class="xs ? 'me-1' : 'me-1'" :size="xs ? '14' : '16'"></v-icon>
            <span :class="xs ? 'text-caption' : ''">{{ legend.label }}</span>
          </v-chip>
        </div>
      </div>
    </v-card-text>

    <!-- Loading State -->
    <div v-if="loading" :class="['d-flex justify-center align-center', xs ? 'pa-6' : 'pa-8']">
      <v-progress-circular
        indeterminate
        color="primary"
        :size="xs ? '40' : '48'"
      ></v-progress-circular>
      <span :class="['ms-3', xs ? 'text-body-2' : 'text-subtitle-1']">
        Loading calendar events...
      </span>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      :class="xs ? 'ma-4' : 'ma-6'"
    >
      {{ error }}
      <template #append>
        <v-btn
          color="error"
          variant="text"
          :size="buttonSize"
          @click="fetchAllEvents"
        >
          Retry
        </v-btn>
      </template>
    </v-alert>

    <!-- Calendar View -->
    <div v-else :class="['calendar-wrapper pt-0', cardPadding]">
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
        @click-item="handleEventClick"
      >
      </CalendarView>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && !error && calendarEvents.length === 0"
      :class="['text-center', xs ? 'pa-6' : 'pa-8']"
    >
      <v-icon color="grey-lighten-1" :size="xs ? '48' : '64'" :class="xs ? 'mb-3' : 'mb-4'">
        mdi-calendar-blank
      </v-icon>
      <h3 :class="[xs ? 'text-subtitle-1' : 'text-h6', 'text-grey-darken-1 mb-2']">
        No Events Scheduled
      </h3>
      <p :class="[xs ? 'text-caption' : 'text-body-2', 'text-grey mb-4']">
        No approved events are currently scheduled. Check back later for updates.
      </p>
      <v-btn
        color="primary"
        variant="elevated"
        :size="buttonSize"
        @click="fetchAllEvents"
      >
        Refresh Calendar
      </v-btn>
    </div>
  </v-card>

  <!-- Event Details Dialog (View-Only) -->
  <ViewEventDialog
    v-model="showEventDialog"
    :event="selectedEvent"
    view-only
  />
</template>

<style scoped>
.calendar-wrapper {
  height: 100%;
}

.calendar-large {
  height: 100%;
}

:deep(.cv-wrapper) {
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

:deep(.cv-weeks) {
  flex: 1;
  min-height: 0;
}

:deep(.cv-week) {
  flex: 1;
  display: flex;
  flex-direction: row;
}

:deep(.cv-day) {
  flex: 1;
  min-height: 80px;
  padding: 4px;
}

:deep(.cv-header-day) {
  background-color: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  padding: 0.75rem 0;
  min-height: 40px;
}

/* Responsive calendar adjustments */
@media (min-width: 600px) {
  .calendar-wrapper {
    min-height: 500px;
  }

  :deep(.cv-wrapper) {
    min-height: 500px;
  }

  :deep(.cv-day) {
    min-height: 100px;
    padding: 6px;
  }

  :deep(.cv-header-day) {
    font-size: 0.9375rem;
    padding: 0.875rem 0;
    min-height: 45px;
  }
}

@media (min-width: 960px) {
  .calendar-wrapper {
    min-height: 600px;
  }

  :deep(.cv-wrapper) {
    min-height: 600px;
  }

  :deep(.cv-day) {
    min-height: 120px;
    padding: 8px;
  }

  :deep(.cv-header-day) {
    font-size: 1rem;
    padding: 1rem 0;
    min-height: 50px;
  }
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
  font-size: 0.875rem;
  padding: 2px 4px;
}

@media (min-width: 600px) {
  :deep(.cv-day-number) {
    font-size: 1rem;
    padding: 3px 6px;
  }
}

@media (min-width: 960px) {
  :deep(.cv-day-number) {
    font-size: 1.1rem;
    padding: 4px 8px;
  }
}

:deep(.cv-day.outsideOfMonth .cv-day-number) {
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.6;
}

.calendar-event {
  border-radius: 4px;
  padding: 2px 4px;
  margin: 1px 0;
  font-size: 0.625rem;
  line-height: 1.1;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (min-width: 600px) {
  .calendar-event {
    border-radius: 5px;
    padding: 3px 6px;
    font-size: 0.6875rem;
    line-height: 1.15;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.11);
  }
}

@media (min-width: 960px) {
  .calendar-event {
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 0.75rem;
    line-height: 1.2;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }
}

.calendar-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
}

.event-title {
  font-size: inherit;
  line-height: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  font-size: 0.5625rem;
  opacity: 0.9;
  margin-top: 1px;
}

@media (min-width: 600px) {
  .event-time {
    font-size: 0.5938rem;
    margin-top: 2px;
  }
}

@media (min-width: 960px) {
  .event-time {
    font-size: 0.625rem;
  }
}
</style>
