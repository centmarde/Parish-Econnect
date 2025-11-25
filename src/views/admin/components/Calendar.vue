<script setup>
import { ref, computed, onMounted, defineOptions, watch } from 'vue'
import CalendarDialog from '../dialogs/CalendarDialog.vue'
import ViewEventDialog from '../dialogs/ViewEventDialog.vue'
import CalendarView from './CalendarView.vue'
import CalendarTableView from './CalendarTableView.vue'
import { useCalendarFetch } from '../composables/calendarFetch'
import { useActionQuery } from '../composables/actionQuery'
import { useConflictDetection } from '../composables/conflict'
import { useCalendarTabManager } from '../composables/calendarTabManager'

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

// Tab manager composable
const { activeTab, tabs } = useCalendarTabManager()

// DEBUG: Call this function sa console to troubleshoot localStorage data
// debugLocalStorage()

// Calendar state
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

// Helper function to check if a date is in the past
const isPastDate = (date) => {
  const today = new Date()
  const compareDate = new Date(date)

  // Reset time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0)
  compareDate.setHours(0, 0, 0, 0)

  return compareDate < today
}

// Methods
const handleDateClick = (clickedDate) => {
  // Check if the clicked date is in the past
  if (isPastDate(clickedDate)) {
    console.log('Cannot interact with past dates:', clickedDate)
    return // Prevent any action on past dates
  }

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

// Table view event handlers
const handleTableViewEvent = (event) => {
  handleEventClick(event)
}

const handleTableEditEvent = (event) => {
  console.log('Edit event from table:', event)
  // Implement edit event functionality
}

const handleTableApproveEvent = async (event) => {
  await approveEvent(event)
  await fetchAllEvents()
}

const handleTableDenyEvent = async (event, comment) => {
  await denyEvent(event, comment)
  await fetchAllEvents()
}

const handleTableDeleteEvent = async (event) => {
  await deleteEvent(event)
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
  <div class="calendar-manager">
    <!-- Header Card -->
    <v-card elevation="2" rounded="lg" class="mb-0">
      <!-- Calendar Header with Tabs -->
      <v-card-title class="d-flex align-center justify-space-between pa-6 bg-primary text-white">
        <div class="d-flex align-center">
          <v-icon size="32" class="me-3">mdi-calendar-multiple</v-icon>
          <div>
            <h2 class="text-h5 font-weight-bold mb-1">Parish Event Calendar</h2>
            <p class="text-body-2 mb-0 opacity-90">Manage and view all parish events</p>
          </div>
        </div>
      </v-card-title>

      <!-- Tab Navigation -->
      <v-tabs
        v-model="activeTab"
        class="bg-primary"
        color="white"
        slider-color="white"
        density="compact"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          class="text-white"
        >
          <v-icon :icon="tab.icon" class="me-2"></v-icon>
          {{ tab.title }}
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Calendar View Card (Conditionally Rendered) -->
    <v-card
      v-if="activeTab === 'calendar'"
      elevation="2"
      rounded="lg"
      class="mt-0 calendar-view-card"
    >
      <CalendarView
        :loading="loading"
        :error="error"
        :calendar-events="calendarEvents"
        :current-period-start="currentPeriodStart"
        :display-period-uom="displayPeriodUom"
        :display-period-count="displayPeriodCount"
        :starting-day-of-week="startingDayOfWeek"
        :display-period-label="displayPeriodLabel"
        :current-view="currentView"
        :calendar-views="calendarViews"
        :conflicts-count="conflictsCount"
        @click-date="handleDateClick"
        @click-item="handleEventClick"
        @previous-period="goToPreviousPeriod"
        @next-period="goToNextPeriod"
        @today="goToToday"
        @change-view="changeView"
        @refresh="fetchAllEvents"
      />
    </v-card>

    <!-- Table View Card (Conditionally Rendered) -->
    <v-card
      v-if="activeTab === 'table'"
      elevation="2"
      rounded="lg"
      class="mt-0 table-view-card"
    >
      <CalendarTableView
        :events="allEvents"
        :loading="loading"
        @view-event="handleTableViewEvent"
        @edit-event="handleTableEditEvent"
        @approve-event="handleTableApproveEvent"
        @deny-event="handleTableDenyEvent"
        @delete-event="handleTableDeleteEvent"
      />
    </v-card>
  </div>

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
.calendar-manager {
  width: 100%;
  height: 100%;
}

.calendar-view-card,
.table-view-card {
  min-height: calc(100vh - 200px);
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

/* Tab styling */
:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
}

:deep(.v-tab--selected) {
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .calendar-view-card,
  .table-view-card {
    min-height: calc(100vh - 180px);
  }
}
</style>
