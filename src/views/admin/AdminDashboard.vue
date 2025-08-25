<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/utils/supabase.js'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import { useAuthUserStore } from '@/stores/authUser.js'

const authUser = useAuthUserStore()

const loading = ref(true)
const errorMessage = ref(null)

const notificationDialog = ref(false)
const selectedDate = ref(new Date())
const currentView = ref('overview')
const eventDialog = ref(false)
const bookingDialog = ref(false)
const selectedBooking = ref(null)
const selectedDateEvents = ref([])
const bookingActionLoading = ref(false)
const bookingConflicts = ref([])
const conflictDialog = ref(false)
const pendingApprovalBooking = ref(null)

// Computed store-driven data
const stats = computed(() => authUser.stats)
const statsTrends = computed(() => authUser.statsTrends)
const recentActivities = computed(() => authUser.recentActivities)
const calendarEvents = computed(() => authUser.calendarEvents)
const pendingBookings = computed(() => authUser.pendingBookings)
const notifications = computed(() => authUser.notifications)
const unreadCount = computed(() => authUser.unreadNotificationsCount)

// Store functions
const hasEvent = authUser.hasEvent
const hasMultipleEvents = authUser.hasMultipleEvents
const getSelectedDateEvents = authUser.getSelectedDateEvents
const formatBookingDetails = authUser.formatBookingDetails
const getEventColor = authUser.getEventColor
const eventDates = authUser.eventDates // This is the getter function for date => color|false

const newEvent = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  type: 'announcement',
})

const quickActions = ref([
  { icon: 'mdi-plus', label: 'Add Event', click: () => (eventDialog.value = true) },
  { icon: 'mdi-file-document', label: 'Reports', click: () => console.log('Reports clicked') },
  { icon: 'mdi-email', label: 'Messages', click: () => console.log('Messages clicked') },
  { icon: 'mdi-cog', label: 'Settings', click: () => console.log('Settings clicked') },
])

let subscriptions = []

const updateSelectedDateEvents = () => {
  selectedDateEvents.value = getSelectedDateEvents(selectedDate.value)
}

const showNotifications = () => {
  notificationDialog.value = true
}

const handleNotificationClick = (notificationId) => {
  authUser.markNotificationAsRead(notificationId)
}

const closeBookingDialog = () => {
  bookingDialog.value = false
  selectedBooking.value = null
  bookingConflicts.value = []
}

const openBookingDetails = async (booking) => {
  selectedBooking.value = booking
  bookingDialog.value = true

  // Check for conflicts when opening booking details
  let bookingDate, bookingTime

  switch (booking.type) {
    case 'wedding':
      bookingDate = booking.wedding_date
      bookingTime = '10:00'
      break
    case 'baptism':
      bookingDate = booking.baptism_date
      bookingTime = '14:00'
      break
    case 'funeral':
      bookingDate = booking.funeral_date
      bookingTime = booking.funeral_time || '09:00'
      break
    case 'thanksgiving':
      bookingDate = booking.thanksgiving_date
      bookingTime = '16:00'
      break
  }

  if (bookingDate && bookingTime) {
    bookingConflicts.value = await authUser.checkConflicts(bookingDate, bookingTime)
  }
}
const cancelConflictDialog = () => {
  conflictDialog.value = false
  pendingApprovalBooking.value = null
  bookingConflicts.value = []
}

const handleApproveBooking = async () => {
  if (!selectedBooking.value) return

  bookingActionLoading.value = true

  try {
    const result = await authUser.approveBooking(selectedBooking.value)

    if (result.success) {
      // Show success notification
      authUser.addNotification({
        message: `${selectedBooking.value.type} booking approved successfully`,
        type: 'success',
      })

      closeBookingDialog()

      // Add success snackbar or toast here if you have one
      console.log('Booking approved successfully!')
    } else if (result.conflicts) {
      // Show conflict dialog
      bookingConflicts.value = result.conflicts
      pendingApprovalBooking.value = selectedBooking.value
      conflictDialog.value = true
      closeBookingDialog()
    } else {
      console.error('Error approving booking:', result.error)
      // Show error notification
      authUser.addNotification({
        message: `Failed to approve booking: ${result.error?.message || 'Unknown error'}`,
        type: 'error',
      })
    }
  } catch (error) {
    console.error('Error in approval process:', error)
    authUser.addNotification({
      message: 'An error occurred while approving the booking',
      type: 'error',
    })
  } finally {
    bookingActionLoading.value = false
  }
}

const handleDenyBooking = async () => {
  if (!selectedBooking.value) return

  bookingActionLoading.value = true

  try {
    const result = await authUser.denyBooking(selectedBooking.value)

    if (result.success) {
      authUser.addNotification({
        message: `${selectedBooking.value.type} booking denied`,
        type: 'info',
      })

      closeBookingDialog()
      console.log('Booking denied successfully!')
    } else {
      console.error('Error denying booking:', result.error)
      authUser.addNotification({
        message: `Failed to deny booking: ${result.error?.message || 'Unknown error'}`,
        type: 'error',
      })
    }
  } catch (error) {
    console.error('Error in denial process:', error)
    authUser.addNotification({
      message: 'An error occurred while denying the booking',
      type: 'error',
    })
  } finally {
    bookingActionLoading.value = false
  }
}

const forceApproveBooking = async () => {
  if (!pendingApprovalBooking.value) return

  bookingActionLoading.value = true

  try {
    // Use the force approve method to bypass conflict check
    const result = await authUser.forceApproveBooking(pendingApprovalBooking.value)

    if (result.success) {
      authUser.addNotification({
        message: `${pendingApprovalBooking.value.type} booking approved despite conflicts`,
        type: 'warning',
      })

      conflictDialog.value = false
      pendingApprovalBooking.value = null
      bookingConflicts.value = []
      console.log('Booking force approved successfully!')
    } else {
      console.error('Error force approving booking:', result.error)
      authUser.addNotification({
        message: 'Failed to force approve booking',
        type: 'error',
      })
    }
  } catch (error) {
    console.error('Error force approving:', error)
    authUser.addNotification({
      message: 'An error occurred while force approving the booking',
      type: 'error',
    })
  } finally {
    bookingActionLoading.value = false
  }
}

const subscribeToBookingUpdates = () => {
  const tables = [
    'wedding_bookings',
    'baptism_bookings',
    'funeral_bookings',
    'thanksgiving_bookings',
  ]
  const newSubscriptions = []

  tables.forEach((tableName) => {
    const subscription = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: tableName,
        },
        async (payload) => {
          const newBooking = payload.new

          authUser.addNotification({
            message: `New ${tableName.replace('_bookings', '')} booking from ${newBooking.first_name || newBooking.bride_firstname || 'a parishioner'}`,
            type: 'booking',
            data: newBooking,
          })

          await Promise.all([authUser.loadPendingBookings(), authUser.loadStats()])

          if (Notification.permission === 'granted') {
            new Notification('New Booking Received', {
              body: `New ${tableName.replace('_bookings', '')} booking submitted`,
              icon: '/logo.png',
            })
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIPTION_ERROR') {
          console.error(`Failed to subscribe to ${tableName}`)
          // Optionally set errorMessage.value = 'Subscription failed'
        }
      })

    newSubscriptions.push(subscription)
  })

  return newSubscriptions
}

const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    console.log('Notification permission:', permission)
  }
}

const createEvent = async () => {
  const result = await authUser.createEvent(newEvent.value)

  if (result.success) {
    eventDialog.value = false
    resetEventForm()
    // TODO: Add success feedback, e.g., snackbar
  } else {
    console.error('Error creating event:', result.error)
    // TODO: Add error feedback, e.g., snackbar
  }
}

const resetEventForm = () => {
  newEvent.value = {
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'announcement',
  }
}

const approveBooking = async (booking) => {
  const result = await authUser.approveBooking(booking)

  if (result.success) {
    bookingDialog.value = false
    // TODO: Add success feedback
  } else {
    console.error('Error approving booking:', result.error)
    // TODO: Add error feedback
  }
}

const denyBooking = async (booking) => {
  const result = await authUser.denyBooking(booking)

  if (result.success) {
    bookingDialog.value = false
    // TODO: Add success feedback
  } else {
    console.error('Error denying booking:', result.error)
    // TODO: Add error feedback
  }
}

onMounted(async () => {
  loading.value = true
  errorMessage.value = null
  try {
    await authUser.getUserInformation()
    await authUser.loadRecentActivities()
    await authUser.loadDashboardData()
    requestNotificationPermission()
    subscriptions = subscribeToBookingUpdates()
    updateSelectedDateEvents()
  } catch (error) {
    console.error('Error loading dashboard:', error)
    errorMessage.value = 'Failed to load dashboard data. Please try refreshing the page.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  subscriptions.forEach((sub) => {
    supabase.removeChannel(sub)
  })
})
</script>

<template>
  <PreloaderView v-if="loading" />
  <AdminHeader v-else>
    <template #content>
      <!-- Animated Background -->
      <div class="animated-bg"></div>
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>

      <v-container fluid class="pa-4 pa-md-8">
        <div v-if="errorMessage" class="error-message mb-4">
          <v-alert type="error" variant="tonal">
            {{ errorMessage }}
          </v-alert>
        </div>

        <div class="glass-card pa-4 pa-md-6 mb-6 mb-md-8">
          <div
            class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center ga-4 ga-md-6"
          >
            <div>
              <h1 class="header-gradient mb-2 text-h4 text-md-h3 text-lg-h2">Admin Dashboard</h1>
              <p class="text-subtitle-1 text-md-h6 text-grey">
                Parish Information Management System
              </p>
            </div>

            <div class="d-flex ga-2 ga-md-3 flex-wrap">
              <!-- Notification Button -->
              <v-btn
                color="secondary"
                variant="outlined"
                @click="showNotifications"
                :size="$vuetify.display.mobile ? 'default' : 'large'"
                class="position-relative"
              >
                <v-icon class="me-1 me-md-2">mdi-bell</v-icon>
                <span class="d-none d-sm-inline">Notifications</span>
                <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
              </v-btn>

              <!-- Create Event Button -->
              <v-btn
                color="primary"
                @click="eventDialog = true"
                :size="$vuetify.display.mobile ? 'default' : 'large'"
              >
                <v-icon class="me-1 me-md-2">mdi-calendar-plus</v-icon>
                <span class="d-none d-sm-inline">Create Event</span>
                <span class="d-sm-none">Event</span>
              </v-btn>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="d-flex ga-1 ga-md-2 mt-6 mt-md-8 overflow-x-auto">
            <v-btn
              :class="['nav-tab', currentView === 'overview' ? 'active' : '']"
              @click="currentView = 'overview'"
              variant="text"
              :size="$vuetify.display.mobile ? 'small' : 'default'"
            >
              <v-icon class="me-1 me-md-2">mdi-view-dashboard</v-icon>
              <span class="d-none d-sm-inline">Overview</span>
            </v-btn>
            <v-btn
              :class="['nav-tab', currentView === 'calendar' ? 'active' : '']"
              @click="currentView = 'calendar'"
              variant="text"
              :size="$vuetify.display.mobile ? 'small' : 'default'"
            >
              <v-icon class="me-1 me-md-2">mdi-calendar</v-icon>
              <span class="d-none d-sm-inline">Calendar</span>
            </v-btn>
            <v-btn
              :class="['nav-tab', currentView === 'bookings' ? 'active' : '']"
              @click="currentView = 'bookings'"
              variant="text"
              :size="$vuetify.display.mobile ? 'small' : 'default'"
            >
              <v-icon class="me-1 me-md-2">mdi-book-multiple</v-icon>
              <span class="d-none d-sm-inline">Bookings</span>
            </v-btn>
          </div>
        </div>

        <!-- Stats Grid -->
        <v-row class="mb-6 mb-md-8">
          <v-col
            cols="6"
            sm="6"
            md="3"
            v-for="(stat, index) in [
              {
                value: stats.totalBookings,
                label: 'Total Bookings',
                icon: 'mdi-book-multiple',
                trend: statsTrends.totalBookings,
                gradient: { start: '#667eea', end: '#764ba2' },
              },
              {
                value: stats.pendingApprovals,
                label: 'Pending Approvals',
                icon: 'mdi-clock-alert',
                trend: statsTrends.pendingApprovals,
                gradient: { start: '#f093fb', end: '#f5576c' },
              },
              {
                value: stats.upcomingEvents,
                label: 'Upcoming Events',
                icon: 'mdi-calendar-check',
                trend: statsTrends.upcomingEvents,
                gradient: { start: '#4facfe', end: '#00f2fe' },
              },
              {
                value: stats.totalMembers,
                label: 'Parish Members',
                icon: 'mdi-account-group',
                trend: statsTrends.totalMembers,
                gradient: { start: '#43e97b', end: '#38f9d7' },
              },
            ]"
            :key="index"
          >
            <v-card
              class="stat-card"
              :style="{
                '--gradient-start': stat.gradient.start,
                '--gradient-end': stat.gradient.end,
              }"
            >
              <v-card-text class="text-center pa-3 pa-md-4">
                <div class="stat-icon mb-2">
                  <v-icon color="white" :size="$vuetify.display.mobile ? 24 : 32">{{
                    stat.icon
                  }}</v-icon>
                </div>
                <h2 class="stat-value text-h5 text-md-h4 text-lg-h3 mb-1">{{ stat.value }}</h2>
                <p class="text-caption text-sm-body-2 text-grey-darken-1 mb-2">{{ stat.label }}</p>
                <div class="text-caption text-grey-darken-2">
                  <span v-if="typeof stat.trend === 'number'" class="text-green"
                    >↑ {{ stat.trend }}%</span
                  >
                  <span v-else-if="stat.trend?.urgent" class="text-orange"
                    >● {{ stat.trend.urgent }} urgent</span
                  >
                  <span v-else-if="stat.trend?.next">Next: {{ stat.trend.next }}</span>
                  <span v-else-if="stat.trend?.value" class="text-green"
                    >↑ {{ stat.trend.value }} new</span
                  >
                  <span v-else>from last month</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Main Content Area -->
        <div v-if="currentView === 'overview'">
          <v-row>
            <!-- Calendar Section -->
            <v-col cols="12" lg="8">
              <v-card elevation="3" class="mb-4">
                <v-card-title class="d-flex align-center pa-4 pa-md-6">
                  <v-icon class="me-2">mdi-calendar</v-icon>
                  <span class="text-h6 text-md-h5">Schedule Calendar</span>
                </v-card-title>
                <v-card-text class="pa-2 pa-md-4">
                  <v-date-picker
                    v-model="selectedDate"
                    @update:model-value="updateSelectedDateEvents"
                    show-adjacent-months
                    :events="hasEvent"
                    :event-color="eventDates"
                    class="calendar-picker w-100"
                    :width="$vuetify.display.mobile ? '100%' : 'auto'"
                  >
                    <template #day="{ date }">
                      <div
                        class="v-date-picker-month__day"
                        :class="{
                          'has-event': hasEvent(date),
                          'multiple-events': hasMultipleEvents(date),
                        }"
                      >
                        <div class="v-date-picker-month__day-date">
                          {{ new Date(date).getDate() }}
                        </div>
                      </div>
                    </template>
                  </v-date-picker>
                </v-card-text>
              </v-card>

              <!-- Quick Actions with responsive grid -->
              <v-row class="mt-4">
                <v-col cols="6" sm="6" md="3" v-for="action in quickActions" :key="action.label">
                  <v-card class="quick-action" @click="action.click">
                    <v-card-text class="text-center pa-3 pa-md-4">
                      <div class="quick-action-icon mb-2">
                        <v-icon :size="$vuetify.display.mobile ? 24 : 32">{{ action.icon }}</v-icon>
                      </div>
                      <div class="font-weight-semibold text-caption text-sm-body-2">
                        {{ action.label }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <!-- Sidebar -->
            <v-col cols="12" lg="4">
              <!-- Today's Schedule -->
              <v-card class="glass-card mb-4">
                <v-card-title class="d-flex align-center pa-4 pa-md-6">
                  <v-icon class="me-2 text-purple">mdi-calendar-today</v-icon>
                  <span class="text-h6 text-md-h5">Today's Schedule</span>
                </v-card-title>
                <v-card-text class="pa-4 pa-md-6">
                  <div
                    v-if="selectedDateEvents.length === 0"
                    class="text-center text-grey-darken-1 py-6 py-md-8"
                  >
                    <v-icon :size="$vuetify.display.mobile ? 48 : 64" color="grey-lighten-2"
                      >mdi-calendar-blank</v-icon
                    >
                    <p class="mt-3 text-body-2 text-md-body-1">No events scheduled</p>
                  </div>
                  <div v-else class="space-y-3">
                    <div
                      v-for="(event, index) in selectedDateEvents"
                      :key="index"
                      class="event-item pa-3"
                      :style="{ borderLeftColor: event.color }"
                    >
                      <div class="d-flex justify-space-between align-start">
                        <div>
                          <div class="font-weight-semibold">{{ event.title }}</div>
                          <div class="text-caption text-grey-darken-2">{{ event.location }}</div>
                        </div>
                        <div class="text-caption text-grey-darken-2">{{ event.time }}</div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Pending Approvals -->
              <v-card class="glass-card mb-4">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="me-2 text-orange">mdi-clipboard-list</v-icon>
                    Pending Approvals
                  </div>
                  <v-chip color="orange" variant="outlined" size="small">
                    {{ pendingBookings.length }} pending
                  </v-chip>
                </v-card-title>
                <v-card-text>
                  <div
                    v-if="pendingBookings.length === 0"
                    class="text-center text-grey-darken-1 py-8"
                  >
                    <v-icon size="64" color="grey-lighten-2">mdi-check-all</v-icon>
                    <p class="mt-3">No pending approvals</p>
                  </div>
                  <div v-else class="space-y-3">
                    <div
                      v-for="(booking, index) in pendingBookings.slice(0, 3)"
                      :key="index"
                      class="booking-card"
                      :style="{ '--booking-color': getEventColor(booking.type) }"
                      @click="openBookingDetails(booking)"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="font-weight-semibold">
                            {{ formatBookingDetails(booking).title }}
                          </div>
                          <div class="text-caption text-grey-darken-2">
                            {{ formatBookingDetails(booking).subtitle }}
                          </div>
                          <div class="text-caption text-grey-darken-3 mt-1">
                            {{ formatBookingDetails(booking).date }}
                          </div>
                        </div>
                        <v-icon>mdi-chevron-right</v-icon>
                      </div>
                    </div>

                    <v-btn
                      variant="text"
                      color="purple"
                      class="w-100 text-center"
                      @click="currentView = 'bookings'"
                    >
                      View All Approvals →
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Recent Activities Section -->
              <v-card class="glass-card mb-4">
                <v-card-title class="d-flex align-center">
                  <v-icon class="me-2 text-green">mdi-history</v-icon>
                  Recent Activity
                </v-card-title>
                <v-card-text>
                  <div class="space-y-3">
                    <div
                      v-for="(activity, index) in recentActivities"
                      :key="index"
                      class="d-flex gap-3"
                    >
                      <div class="activity-icon" :class="`bg-${activity.color}-lighten-4`">
                        <v-icon :color="activity.color">{{ activity.icon }}</v-icon>
                      </div>
                      <div class="flex-1 mx-2">
                        <div class="text-caption">{{ activity.action }}</div>
                        <div class="text-caption text-grey-darken-2">
                          {{ new Date(activity.changed_at).toLocaleString() }}
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Calendar View -->
        <div v-if="currentView === 'calendar'">
          <v-card class="glass-card">
            <v-card-title>Full Calendar View</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <v-date-picker
                    v-model="selectedDate"
                    @update:model-value="updateSelectedDateEvents"
                    show-adjacent-months
                    :events="hasEvent"
                    :event-color="eventDates"
                    class="w-100"
                  >
                    <template #day="{ date }">
                      <div
                        class="v-date-picker-month__day"
                        :class="{
                          'has-event': hasEvent(date),
                          'multiple-events': hasMultipleEvents(date),
                        }"
                      >
                        <div class="v-date-picker-month__day-date">
                          {{ new Date(date).getDate() }}
                        </div>
                      </div>
                    </template>
                  </v-date-picker>
                </v-col>
                <v-col cols="12" md="4">
                  <h3 class="mb-4">All Events</h3>
                  <v-list>
                    <v-list-item
                      v-for="(event, index) in calendarEvents.slice(0, 10)"
                      :key="index"
                      class="mb-2"
                    >
                      <template #prepend>
                        <v-chip :color="event.color" size="small" class="me-3">
                          {{ event.type }}
                        </v-chip>
                      </template>
                      <v-list-item-title>{{ event.title }}</v-list-item-title>
                      <v-list-item-subtitle
                        >{{ event.date }} - {{ event.time }}</v-list-item-subtitle
                      >
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <!-- Bookings Management View -->
        <div v-if="currentView === 'bookings'">
          <v-card class="glass-card">
            <v-card-title>Booking Management</v-card-title>
            <v-card-text>
              <v-data-table
                :items="pendingBookings"
                :headers="[
                  { title: 'Type', key: 'type' },
                  { title: 'Details', key: 'details' },
                  { title: 'Date', key: 'date' },
                  { title: 'Time', key: 'time' },
                  { title: 'Actions', key: 'actions', sortable: false },
                ]"
                class="booking-table"
              >
                <template #[`item.type`]="{ item }">
                  <v-chip :color="getEventColor(item.type)" size="small">
                    {{ item.type }}
                  </v-chip>
                </template>
                <template #[`item.details`]="{ item }">
                  {{ formatBookingDetails(item).subtitle }}
                </template>
                <template #[`item.date`]="{ item }">
                  {{ formatBookingDetails(item).date }}
                </template>
                <template #[`item.time`]="{ item }">
                  {{ formatBookingDetails(item).time }}
                </template>
                <template #[`item.actions`]="{ item }">
                  <v-btn
                    color="green"
                    size="small"
                    variant="outlined"
                    class="me-2"
                    @click="approveBooking(item)"
                  >
                    Approve
                  </v-btn>
                  <v-btn color="red" size="small" variant="outlined" @click="denyBooking(item)">
                    Deny
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </div>
      </v-container>

      <!-- Notifications Dialog -->
      <v-dialog v-model="notificationDialog" max-width="600">
        <v-card class="glass-card">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-bell</v-icon>
            Notifications
            <v-spacer />
            <v-chip color="red" size="small" v-if="unreadCount > 0">
              {{ unreadCount }} unread
            </v-chip>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list v-if="notifications.length > 0">
              <v-list-item
                v-for="notification in notifications"
                :key="notification.id"
                @click="handleNotificationClick(notification.id)"
                :class="{ 'notification-unread': !notification.read }"
                class="notification-item"
              >
                <template #prepend>
                  <v-icon :color="notification.read ? 'grey' : 'primary'" size="small" class="me-3">
                    {{ notification.type === 'booking' ? 'mdi-calendar-plus' : 'mdi-information' }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ notification.message }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ new Date(notification.timestamp).toLocaleString() }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-8 text-grey-darken-1">
              <v-icon size="64" color="grey-lighten-2">mdi-bell-outline</v-icon>
              <p class="mt-3">No notifications yet</p>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="notificationDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Event Creation Dialog -->
      <v-dialog v-model="eventDialog" max-width="500">
        <v-card class="glass-card">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-calendar-plus</v-icon>
            Create New Event
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createEvent">
              <v-text-field
                v-model="newEvent.title"
                label="Event Title"
                variant="outlined"
                class="mb-3"
                required
              />
              <v-textarea
                v-model="newEvent.description"
                label="Description"
                variant="outlined"
                rows="3"
                class="mb-3"
              />
              <v-text-field
                v-model="newEvent.date"
                label="Date"
                type="date"
                variant="outlined"
                class="mb-3"
                required
              />
              <v-text-field
                v-model="newEvent.time"
                label="Time"
                type="time"
                variant="outlined"
                class="mb-3"
                required
              />
              <v-select
                v-model="newEvent.type"
                :items="['announcement', 'mass', 'meeting', 'celebration']"
                label="Event Type"
                variant="outlined"
                class="mb-3"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="eventDialog = false">Cancel</v-btn>
            <v-btn color="primary" @click="createEvent">Create Event</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Booking Details Dialog -->
      <v-dialog v-model="bookingDialog" max-width="800" persistent>
        <v-card v-if="selectedBooking" class="glass-card">
          <v-card-title class="d-flex align-center justify-space-between pa-6">
            <div class="d-flex align-center">
              <v-icon class="me-3" :color="getEventColor(selectedBooking.type)" size="32">
                {{
                  selectedBooking.type === 'wedding'
                    ? 'mdi-ring'
                    : selectedBooking.type === 'baptism'
                      ? 'mdi-water'
                      : selectedBooking.type === 'funeral'
                        ? 'mdi-cross'
                        : 'mdi-hands-pray'
                }}
              </v-icon>
              <div>
                <h2 class="text-h5 mb-1">{{ formatBookingDetails(selectedBooking).title }}</h2>
                <v-chip
                  :color="getEventColor(selectedBooking.type)"
                  size="small"
                  class="text-capitalize"
                >
                  {{ selectedBooking.type }}
                </v-chip>
              </div>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="closeBookingDialog" />
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <v-row>
              <!-- Basic Information -->
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="me-2" color="primary">mdi-information</v-icon>
                  Basic Information
                </h3>

                <div class="mb-4">
                  <div class="text-caption text-grey-darken-1 mb-1">Event Date & Time</div>
                  <div class="text-body-1 font-weight-medium">
                    <v-icon class="me-2" size="18">mdi-calendar</v-icon>
                    {{ formatBookingDetails(selectedBooking).date }}
                    <v-icon class="me-2 ms-4" size="18">mdi-clock</v-icon>
                    {{ formatBookingDetails(selectedBooking).time }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-grey-darken-1 mb-1">Created On</div>
                  <div class="text-body-2">
                    {{ new Date(selectedBooking.created_at).toLocaleDateString() }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-grey-darken-1 mb-1">Status</div>
                  <v-chip
                    :color="
                      selectedBooking.status === 'pending'
                        ? 'orange'
                        : selectedBooking.status === 'approved'
                          ? 'green'
                          : 'red'
                    "
                    size="small"
                    variant="tonal"
                  >
                    {{ selectedBooking.status || 'pending' }}
                  </v-chip>
                </div>
              </v-col>

              <!-- Type-specific Details -->
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="me-2" color="secondary">mdi-account-details</v-icon>
                  Details
                </h3>

                <!-- Wedding Details -->
                <div v-if="selectedBooking.type === 'wedding'">
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Bride</div>
                    <div class="text-body-1">
                      {{ selectedBooking.bride_firstname }} {{ selectedBooking.bride_lastname }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Groom</div>
                    <div class="text-body-1">
                      {{ selectedBooking.groom_firstname }} {{ selectedBooking.groom_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.title" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Event Title</div>
                    <div class="text-body-1">{{ selectedBooking.title }}</div>
                  </div>
                  <div v-if="selectedBooking.comments" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Comments</div>
                    <div class="text-body-2">{{ selectedBooking.comments }}</div>
                  </div>
                </div>

                <!-- Baptism Details -->
                <div v-if="selectedBooking.type === 'baptism'">
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Child</div>
                    <div class="text-body-1">
                      {{ selectedBooking.child_firstname }} {{ selectedBooking.child_lastname }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Date of Birth</div>
                    <div class="text-body-2">
                      {{ new Date(selectedBooking.child_dob).toLocaleDateString() }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.parent_father_firstname" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Father</div>
                    <div class="text-body-2">
                      {{ selectedBooking.parent_father_firstname }}
                      {{ selectedBooking.parent_father_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.parent_mother_firstname" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Mother</div>
                    <div class="text-body-2">
                      {{ selectedBooking.parent_mother_firstname }}
                      {{ selectedBooking.parent_mother_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.godparent_firstname" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Godparent</div>
                    <div class="text-body-2">
                      {{ selectedBooking.godparent_firstname }}
                      {{ selectedBooking.godparent_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.additional_notes" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Additional Notes</div>
                    <div class="text-body-2">{{ selectedBooking.additional_notes }}</div>
                  </div>
                </div>

                <!-- Funeral Details -->
                <div v-if="selectedBooking.type === 'funeral'">
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Deceased</div>
                    <div class="text-body-1">
                      {{ selectedBooking.deceased_firstname }}
                      {{ selectedBooking.deceased_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.deceased_dob" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Date of Birth</div>
                    <div class="text-body-2">
                      {{ new Date(selectedBooking.deceased_dob).toLocaleDateString() }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Date of Death</div>
                    <div class="text-body-2">
                      {{ new Date(selectedBooking.deceased_dod).toLocaleDateString() }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Contact Person</div>
                    <div class="text-body-1">
                      {{ selectedBooking.contact_firstname }} {{ selectedBooking.contact_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.relationship_to_deceased" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Relationship</div>
                    <div class="text-body-2">{{ selectedBooking.relationship_to_deceased }}</div>
                  </div>
                  <div v-if="selectedBooking.contact_phone" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Phone</div>
                    <div class="text-body-2">{{ selectedBooking.contact_phone }}</div>
                  </div>
                  <div v-if="selectedBooking.contact_email" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Email</div>
                    <div class="text-body-2">{{ selectedBooking.contact_email }}</div>
                  </div>
                </div>

                <!-- Thanksgiving Details -->
                <div v-if="selectedBooking.type === 'thanksgiving'">
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Participant</div>
                    <div class="text-body-1">
                      {{ selectedBooking.participant_firstname }}
                      {{ selectedBooking.participant_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.type_of_thanksgiving" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Type of Thanksgiving</div>
                    <div class="text-body-2 text-capitalize">
                      {{ selectedBooking.type_of_thanksgiving }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Reason</div>
                    <div class="text-body-2">{{ selectedBooking.reason_for_thanksgiving }}</div>
                  </div>
                  <div v-if="selectedBooking.family_members_count" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Family Members Count</div>
                    <div class="text-body-2">{{ selectedBooking.family_members_count }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Conflict Warning -->
            <v-alert
              v-if="bookingConflicts && bookingConflicts.length > 0"
              type="warning"
              variant="tonal"
              class="mt-4"
              prominent
            >
              <v-alert-title class="d-flex align-center">
                <v-icon class="me-2">mdi-alert</v-icon>
                Schedule Conflict Detected!
              </v-alert-title>
              <div class="mt-2">
                <p class="mb-2">This booking conflicts with:</p>
                <div
                  v-for="conflict in bookingConflicts"
                  :key="conflict.id"
                  class="d-flex align-center mb-1"
                >
                  <v-chip :color="getEventColor(conflict.type)" size="small" class="me-2">
                    {{ conflict.type }}
                  </v-chip>
                  <span class="text-body-2"
                    >{{ conflict.name }} - {{ conflict.date }} at {{ conflict.time }}</span
                  >
                </div>
                <p class="mt-2 text-caption">
                  Please consider rescheduling or contact the conflicting party to resolve this
                  issue.
                </p>
              </div>
            </v-alert>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-6">
            <v-spacer />
            <v-btn variant="outlined" @click="closeBookingDialog" class="me-3"> Close </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              @click="handleDenyBooking"
              class="me-3"
              :disabled="bookingActionLoading"
            >
              <v-icon class="me-1">mdi-close</v-icon>
              Deny
            </v-btn>
            <v-btn color="success" @click="handleApproveBooking" :loading="bookingActionLoading">
              <v-icon class="me-1">mdi-check</v-icon>
              Approve
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="conflictDialog" max-width="600" persistent>
        <v-card class="glass-card">
          <v-card-title class="d-flex align-center text-warning">
            <v-icon class="me-2" color="warning" size="32">mdi-alert-circle</v-icon>
            Schedule Conflict Detected
          </v-card-title>

          <v-card-text class="pa-6">
            <p class="mb-4">
              The booking you're trying to approve conflicts with existing scheduled events:
            </p>

            <v-list class="mb-4">
              <v-list-item
                v-for="conflict in bookingConflicts"
                :key="conflict.id"
                class="conflict-item pa-3 mb-2"
                :style="{ borderLeft: `4px solid ${getEventColor(conflict.type)}` }"
              >
                <template #prepend>
                  <v-chip :color="getEventColor(conflict.type)" size="small" class="me-3">
                    {{ conflict.type }}
                  </v-chip>
                </template>

                <v-list-item-title class="font-weight-semibold">
                  {{ conflict.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ conflict.date }} at {{ conflict.time }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <p class="text-body-2 text-grey-darken-1">
              You can either reschedule one of the events or proceed with approval if you believe
              the conflict can be managed.
            </p>
          </v-card-text>

          <v-card-actions class="pa-6">
            <v-spacer />
            <v-btn variant="outlined" @click="cancelConflictDialog" class="me-3"> Cancel </v-btn>
            <v-btn color="warning" @click="forceApproveBooking" :loading="bookingActionLoading">
              <v-icon class="me-1">mdi-check-bold</v-icon>
              Approve Anyway
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </AdminHeader>
</template>

<style scoped>
.conflict-item {
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 8px;
  border-left-width: 4px;
  border-left-style: solid;
}

.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: -2;
  opacity: 0.05;
}

.v-theme--dark .animated-bg {
  opacity: 0.03;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.floating-shape {
  position: fixed;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  z-index: -1;
  animation: float 6s ease-in-out infinite;
}

.v-theme--dark .floating-shape {
  background: rgba(255, 255, 255, 0.03);
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Glass card effect */
.glass-card {
  background: rgba(var(--v-theme-surface), 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
}

.v-theme--dark .glass-card {
  background: rgba(var(--v-theme-surface), 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Header gradient */
.header-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Notification badge */
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* Toned down stat cards */
.stat-card {
  background: rgba(var(--v-theme-surface), 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
  opacity: 0.6;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 0.8;
}

.v-theme--dark .stat-card {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.v-theme--dark .stat-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  opacity: 0.9;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.v-theme--dark .stat-icon {
  opacity: 0.8;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  opacity: 0.9;
}

.v-theme--dark .stat-value {
  opacity: 0.95;
}

/* Navigation tabs */
.nav-tab {
  border-radius: 12px;
  transition: all 0.3s ease;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0 4px;
}

.nav-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-tab:hover:not(.active) {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}

.v-theme--dark .nav-tab:hover:not(.active) {
  background: rgba(var(--v-theme-primary), 0.12);
}

/* Quick actions */
.quick-action {
  background: rgba(var(--v-theme-surface), 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  background: rgba(var(--v-theme-primary), 0.05) !important;
}

.v-theme--dark .quick-action {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.v-theme--dark .quick-action:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

.quick-action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  transition: all 0.3s ease;
}

.quick-action:hover .quick-action-icon {
  background: rgba(var(--v-theme-primary), 0.15);
  transform: scale(1.05);
}

.v-theme--dark .quick-action-icon {
  background: rgba(var(--v-theme-primary), 0.15);
}

.v-theme--dark .quick-action:hover .quick-action-icon {
  background: rgba(var(--v-theme-primary), 0.2);
}

/* Calendar picker */
.calendar-picker {
  border-radius: 12px;
  overflow: hidden;
}

.calendar-picker :deep(.v-date-picker-month__day) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.calendar-picker :deep(.v-date-picker-month__day:hover) {
  background: rgba(var(--v-theme-primary), 0.1);
}

.calendar-picker :deep(.v-date-picker-month__day.has-event) {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 2px solid rgba(var(--v-theme-primary), 0.3);
}

.calendar-picker :deep(.v-date-picker-month__day.multiple-events) {
  background: rgba(var(--v-theme-secondary), 0.1);
  border: 2px solid rgba(var(--v-theme-secondary), 0.3);
}

/* Event items */
.event-item {
  background: rgba(var(--v-theme-surface), 0.95);
  border-radius: 12px;
  border-left: 4px solid;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.event-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.v-theme--dark .event-item {
  background: rgba(var(--v-theme-surface), 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.v-theme--dark .event-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

/* Booking cards */
.booking-card {
  background: rgba(var(--v-theme-surface), 0.95);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
}

.booking-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.8);
  transform: translateX(4px);
}

.quick-action {
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(var(--v-theme-surface), 0.8) !important;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background: rgba(var(--v-theme-primary), 0.1) !important;
}

.quick-action-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  color: white;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-item {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
  transition: background-color 0.3s ease;
}

.notification-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
}
</style>
