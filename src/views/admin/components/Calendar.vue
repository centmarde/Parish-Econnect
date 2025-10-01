<script setup>
import { ref, computed, onMounted, defineOptions, watch } from 'vue'
import CalendarDialog from '../dialogs/CalendarDialog.vue'
import ViewEventDialog from '../dialogs/ViewEventDialog.vue'
import { useCalendarFetch } from '../composables/calendarFetch'
import { useActionQuery } from '../composables/actionQuery'
import { useConflictDetection } from '../composables/conflict'
import { EVENT_LEGEND } from '../utils/constants'
import { CalendarView } from 'vue-simple-calendar'
import 'vue-simple-calendar/dist/vue-simple-calendar.css'
import '../styles/calendar-theme.css'

// Component name for ESLint multi-word rule
defineOptions({
  name: 'EventCalendar'
})

// Calendar composable
const { loading, error, allEvents, fetchAllEvents } = useCalendarFetch()

// Approval composable para sa booking actions (using new actionQuery)
const { approveEvent, denyEvent, deleteEvent} = useActionQuery()

// Conflict detection composable
const { detectConflicts, hasConflicts, getConflictSeverity, conflictsCount } = useConflictDetection()

// DEBUG: Call this function sa console to troubleshoot localStorage data
// debugLocalStorage()

// Calendar state
const calendarRef = ref(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showDateDialog = ref(false)
const showEventDialog = ref(false)
const selectedEvent = ref(null)
const eventsForSelectedDate = ref([])
const displayPeriodUom = ref('month')
const displayPeriodCount = ref(1)
const startingDayOfWeek = ref(0) // Sunday = 0
const currentPeriodStart = ref(new Date())

// Calendar view options
const calendarViews = [
  { title: 'Month', value: 'month', icon: 'mdi-calendar-month' },
  { title: 'Week', value: 'week', icon: 'mdi-calendar-week' },
  { title: 'Day', value: 'day', icon: 'mdi-calendar-today' }
]

const currentView = ref('month')

// Computed properties
const calendarEvents = computed(() => {
  const events = allEvents.value.map(event => ({
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
    originalEvent: event,
    // Add conflict data
    category: event.category,
    status: event.status,
    time: event.time
  }))

  // Detect conflicts whenever events change
  detectConflicts(events)

  // Add conflict indicators to events
  return events.map(event => {
    const hasConflict = hasConflicts(event.id)
    const conflictSeverity = getConflictSeverity(event.id)

    if (hasConflict) {
      // Add conflict styling
      const conflictColor = conflictSeverity === 'error' ? '#f44336' : '#ff9800'
      return {
        ...event,
        hasConflict,
        conflictSeverity,
        classes: [...(event.classes || []), `conflict-${conflictSeverity}`],
        style: {
          ...event.style,
          border: `2px solid ${conflictColor}`,
          boxShadow: `0 0 8px ${conflictColor}40`
        }
      }
    }

    return event
  })
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
  } else if (currentView.value === 'day') {
    return start.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
const handleDateClick = (clickedDate) => {
  // Fix timezone issue: use local date formatting instead of ISO string
  const year = clickedDate.getFullYear()
  const month = String(clickedDate.getMonth() + 1).padStart(2, '0')
  const day = String(clickedDate.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  selectedDate.value = dateStr

  // Get events for the clicked date - fix comparison with Date objects
  eventsForSelectedDate.value = allEvents.value.filter(event => {
    // Compare using the eventDate string property or format the startDate
    if (event.eventDate) {
      return event.eventDate === dateStr
    }
    // Fallback: format the startDate to compare
    if (event.startDate) {
      const eventYear = event.startDate.getFullYear()
      const eventMonth = String(event.startDate.getMonth() + 1).padStart(2, '0')
      const eventDay = String(event.startDate.getDate()).padStart(2, '0')
      const eventDateStr = `${eventYear}-${eventMonth}-${eventDay}`
      return eventDateStr === dateStr
    }
    return false
  })

  showDateDialog.value = true
}

const handleEventClick = (event) => {
  // Handle event click - show detailed event dialog
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
    case 'day':
      displayPeriodUom.value = 'day'
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
    case 'day':
      current.setDate(current.getDate() - 1)
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
    case 'day':
      current.setDate(current.getDate() + 1)
      break
  }

  currentPeriodStart.value = current
}

const handleEditEvent = (event) => {
  console.log('Edit event:', event)
  // Implement edit event functionality
  // You might want to emit an event to parent or show an edit dialog
}

const handleAddEvent = async () => {
  // Refresh calendar events after new event is added
  await fetchAllEvents()
  showDateDialog.value = false
}

const handleEditEventFromDialog = (event) => {
  console.log('Edit event from dialog:', event)
  // Implement edit event functionality
  // You might want to redirect to edit form or show edit dialog
  showEventDialog.value = false
}

const handleDeleteEventFromDialog = async (event) => {
  console.log('Delete event from dialog:', event)
  await deleteEvent(event)
  showEventDialog.value = false
  // Refresh calendar events after deletion
  await fetchAllEvents()
}

// New handlers para sa approve/deny events
const handleApproveEventFromDialog = async (event) => {
  console.log('Approve event from dialog:', event)
  await approveEvent(event)
  showEventDialog.value = false
  // Refresh calendar events after approval
  await fetchAllEvents()
}

const handleDenyEventFromDialog = async (event, comment) => {
  console.log('Deny event from dialog:', event, 'with comment:', comment)
  await denyEvent(event, comment)
  showEventDialog.value = false
  // Refresh calendar events after denial
  await fetchAllEvents()
}

// Lifecycle
onMounted(async () => {
  await fetchAllEvents()
})

// Watch for changes in allEvents and re-detect conflicts
watch(allEvents, () => {
  const events = allEvents.value.map(event => ({
    id: event.id,
    title: event.title,
    startDate: new Date(event.startDate),
    endDate: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
    category: event.category,
    status: event.status,
    time: event.time
  }))
  detectConflicts(events)
}, { deep: true })
</script>

<template>
  <v-card class="calendar-container" elevation="2" rounded="lg">
    <!-- Calendar Header -->
    <v-card-title class="d-flex align-center justify-space-between pa-6 bg-primary text-white">
      <div class="d-flex align-center">
        <v-icon size="32" class="me-3">mdi-calendar-multiple</v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold mb-1">Parish Event Calendar</h2>
          <p class="text-body-2 mb-0 opacity-90">Manage and view all parish events</p>
        </div>
      </div>
    </v-card-title>

    <v-divider></v-divider>

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
            v-model="currentView"
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
            variant="tonal"
            class="me-2 mb-1"
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
          @click="fetchAllEvents"
        >
          Retry
        </v-btn>
      </template>
    </v-alert>

    <!-- Calendar View -->
    <div v-else class="calendar-wrapper pa-6 pt-0">
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
        @click-date="handleDateClick"
        @click-item="handleEventClick"

      >

      </CalendarView>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && !error && calendarEvents.length === 0"
      class="text-center pa-8"
    >
      <v-icon color="grey-lighten-1" size="64" class="mb-4">
        mdi-calendar-blank
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">No Events Found</h3>
      <p class="text-body-2 text-grey mb-4">
        No events are currently scheduled. Events from approved bookings will appear here.
      </p>
      <v-btn color="primary" variant="elevated" @click="fetchAllEvents">
        Refresh Calendar
      </v-btn>
    </div>
  </v-card>

  <!-- Date Details Dialog -->
  <CalendarDialog
    v-model="showDateDialog"
    :selected-date="selectedDate"
    :events-for-date="eventsForSelectedDate"
    @edit-event="handleEditEvent"
    @add-event="handleAddEvent"
  />

  <!-- Event Details Dialog -->
  <ViewEventDialog
    v-model="showEventDialog"
    :event="selectedEvent"
    @edit-event="handleEditEventFromDialog"
    @approve-event="handleApproveEventFromDialog"
    @deny-event="handleDenyEventFromDialog"
    @delete-event="handleDeleteEventFromDialog"
  />
</template>

<style scoped>
.calendar-wrapper {
  min-height: 600px;
  height: 100%;
}

.calendar-large {
  min-height: 600px;
  height: 100%;
}

:deep(.cv-wrapper) {
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

:deep(.cv-weeks) {
  flex: 1;
  min-height: 0; /* Allow flexbox shrinking */
}

:deep(.cv-week) {
  flex: 1;
  display: flex;
  flex-direction: row;
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

.calendar-event {
  border-radius: 6px;
  padding: 4px 8px;
  margin: 1px 0;
  font-size: 0.75rem;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.calendar-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
}

.event-title {
  font-size: 0.75rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  font-size: 0.625rem;
  opacity: 0.9;
  margin-top: 2px;
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
</style>
