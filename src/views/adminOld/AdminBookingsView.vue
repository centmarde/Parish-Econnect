<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import { useAuthUserStore } from '@/stores/authUser.js'
import BookingDetailsDialogs from './dialogs/BookingDetailsDialogs.vue'
import ConflictDialog from './dialogs/ConflictDialog.vue'
import DenialCommentDialog from './dialogs/DenialCommentDialog.vue'
import ImageViewerDialog from './dialogs/ImageViewerDialog.vue'
import BookingNavTabs from './components/BookingNavTabs.vue'
import {
  loadAllBookings,
  getBookingsByView,
  filterBookings,
  getStatusColor,
  getStatusText,
  getEventIcon,
  createDialogActions,
  createBookingActions,
  STATUS_FILTER_OPTIONS
} from './utils/bookingHelpers'

const authUser = useAuthUserStore()

const loading = ref(true)
const currentView = ref('all')
const selectedBooking = ref(null)
const bookingDialog = ref(false)
const bookingActionLoading = ref(false)
const bookingConflicts = ref([])
const conflictDialog = ref(false)
const pendingApprovalBooking = ref(null)
const denialDialog = ref(false)
const denialComment = ref('')
const imageViewerDialog = ref(false)
const selectedImages = ref([])
const currentImageIndex = ref(0)

// Booking data
const weddingBookings = ref([])
const baptismBookings = ref([])
const funeralBookings = ref([])
const thanksgivingBookings = ref([])
const announcements = ref([])

// Filters and search
const searchQuery = ref('')
const statusFilter = ref('all')
const dateFilter = ref('')

// Use store functions
const formatBookingDetails = authUser.formatBookingDetails
const getEventColor = authUser.getEventColor

// Create dialog actions
const dialogRefs = {
  bookingDialog,
  selectedBooking,
  bookingConflicts,
  conflictDialog,
  pendingApprovalBooking,
  denialDialog,
  denialComment,
  imageViewerDialog,
  selectedImages,
  currentImageIndex
}

const dialogActions = createDialogActions(dialogRefs)

// Load all bookings
const loadBookings = async () => {
  loading.value = true
  try {
    const bookingsData = await loadAllBookings()

    weddingBookings.value = bookingsData.weddingBookings
    baptismBookings.value = bookingsData.baptismBookings
    funeralBookings.value = bookingsData.funeralBookings
    thanksgivingBookings.value = bookingsData.thanksgivingBookings
    announcements.value = bookingsData.announcements
  } catch (error) {
    console.error('Error loading bookings:', error)
  } finally {
    loading.value = false
  }
}

// Filtered bookings based on current view
const filteredBookings = computed(() => {
  const bookingsData = {
    weddingBookings: weddingBookings.value,
    baptismBookings: baptismBookings.value,
    funeralBookings: funeralBookings.value,
    thanksgivingBookings: thanksgivingBookings.value,
    announcements: announcements.value
  }

  const viewBookings = getBookingsByView(currentView.value, bookingsData)

  return filterBookings(
    viewBookings,
    searchQuery.value,
    statusFilter.value,
    dateFilter.value,
    formatBookingDetails
  )
})

// Create booking actions
const bookingActionRefs = {
  selectedBooking,
  bookingActionLoading,
  bookingConflicts,
  pendingApprovalBooking,
  conflictDialog,
  denialDialog,
  denialComment
}

const bookingActions = createBookingActions(
  bookingActionRefs,
  authUser,
  loadBookings,
  dialogActions
)

const openBookingDetails = async (booking) => {
  selectedBooking.value = booking
  bookingDialog.value = true
  await bookingActions.openBookingDetails(booking)
}

// Image actions using dialog actions
const viewImages = (booking) => {
  dialogActions.viewImages(booking, authUser)
}

onMounted(async () => {
  await loadBookings()
})
</script>

<template>
  <AdminHeader>
    <template #content>
      <div class="animated-bg"></div>

      <v-container fluid class="pa-4 pa-md-8">
        <!-- Header Section -->
        <div class="glass-card pa-4 pa-md-6 mb-6">
          <div
            class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center ga-4"
          >
            <div>
              <h1 class="header-gradient mb-2 text-h4 text-md-h3">Booking Management</h1>
              <p class="text-subtitle-1 text-grey">Manage all parish bookings and events</p>
            </div>

            <div class="d-flex ga-2 flex-wrap">
              <v-btn color="primary" variant="outlined" @click="loadBookings" :loading="loading">
                <v-icon class="me-2">mdi-refresh</v-icon>
                Refresh
              </v-btn>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <BookingNavTabs
            v-model:currentView="currentView"
          />
        </div>

        <!-- Filters Section -->
        <div class="glass-card pa-4 mb-6">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Search bookings..."
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="statusFilter"
                :items="STATUS_FILTER_OPTIONS"
                label="Filter by Status"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="dateFilter"
                label="Filter by Date"
                type="date"
                variant="outlined"
                clearable
              />
            </v-col>
          </v-row>
        </div>

        <!-- Bookings List -->
        <div class="glass-card">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-clipboard-list</v-icon>
            {{
              currentView === 'all'
                ? 'All Bookings'
                : currentView.charAt(0).toUpperCase() + currentView.slice(1)
            }}
            <v-spacer />
            <v-chip color="primary" variant="outlined">
              {{ filteredBookings.length }} items
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-0">
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="64" />
              <p class="mt-4">Loading bookings...</p>
            </div>

            <div v-else-if="filteredBookings.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-2">mdi-calendar-blank</v-icon>
              <p class="mt-3 text-grey">No bookings found</p>
            </div>

            <div v-else>
              <v-list>
                <v-list-item
                  v-for="(booking, index) in filteredBookings"
                  :key="index"
                  @click="openBookingDetails(booking)"
                  class="booking-item"
                  :style="{ borderLeftColor: getEventColor(booking.type) }"
                >
                  <template #prepend>
                    <v-avatar :color="getEventColor(booking.type)" size="40">
                      <v-icon color="white">
                        {{ getEventIcon(booking.type) }}
                      </v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-semibold">
                    {{ formatBookingDetails(booking).title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatBookingDetails(booking).subtitle }}
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="text-right">
                      <div class="text-body-2 font-weight-medium">
                        {{ formatBookingDetails(booking).date }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ formatBookingDetails(booking).starting_time }} -
                        {{ formatBookingDetails(booking).ending_time }}
                      </div>
                      <v-chip
                        :color="getStatusColor(booking)"
                        size="small"
                        variant="tonal"
                        class="mt-1"
                      >
                        {{ getStatusText(booking) }}
                      </v-chip>
                    </div>
                    <v-icon class="ms-2">mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>

                <v-divider v-if="index < filteredBookings.length - 1" :key="`divider-${index}`" />
              </v-list>
            </div>
          </v-card-text>
        </div>
      </v-container>

      <!-- Dialog Components -->
      <BookingDetailsDialogs
        v-model:bookingDialog="bookingDialog"
        v-model:selectedBooking="selectedBooking"
        :bookingConflicts="bookingConflicts"
        :bookingActionLoading="bookingActionLoading"
        :authUser="authUser"
        :formatBookingDetails="formatBookingDetails"
        :getEventColor="getEventColor"
        :getStatusColor="getStatusColor"
        :getStatusText="getStatusText"
        @close="dialogActions.closeBookingDialog"
        @approve="bookingActions.handleApproveBooking"
        @deny="bookingActions.handleDenyBooking"
        @viewImages="viewImages"
      />

      <ConflictDialog
        v-model:conflictDialog="conflictDialog"
        :bookingConflicts="bookingConflicts"
        :bookingActionLoading="bookingActionLoading"
        :getEventColor="getEventColor"
        @cancel="dialogActions.cancelConflictDialog"
        @forceApprove="bookingActions.forceApproveBooking"
      />

      <DenialCommentDialog
        v-model:denialDialog="denialDialog"
        v-model:denialComment="denialComment"
        :selectedBooking="selectedBooking"
        :bookingActionLoading="bookingActionLoading"
        @cancel="dialogActions.cancelDenialDialog"
        @confirm="bookingActions.confirmDenyBooking"
      />

      <ImageViewerDialog
        v-model:imageViewerDialog="imageViewerDialog"
        v-model:currentImageIndex="currentImageIndex"
        :selectedImages="selectedImages"
        @close="dialogActions.closeImageViewer"
        @previous="dialogActions.previousImage"
        @next="dialogActions.nextImage"
      />
    </template>
  </AdminHeader>
</template>

