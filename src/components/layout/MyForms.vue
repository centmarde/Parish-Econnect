<script setup>
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
// import { useRouter } from 'vue-router'
import { useWeddingHeader } from './weddingHeaderLayout/weddingHeader'
import { useFuneralHeader } from './funeralHeaderLayout/funeralHeader'
import { useThanksGivingHeader } from './thanksGivingLayout/thanksGiving'
import { useBaptismHeader } from './baptism/baptismHeader'
import FormDialog from './dialogs/FormDialog.vue'
import {
  BOOKING_CONSTANTS,
  mergeAndSortBookings,
  formatBookingDate,
  getBookingStatusColor,
  getBookingStatusText,
  handleBookingClick as handleBookingClickHelper,
  isBookingClickable,
  getBookingTitle,
  getBookingSubtitle,
  getBookingIcon,
  getBookingTypeLabel,
  getReferenceId,
  isBookingCompleted,
  canDeleteBooking,
  deleteBookingHandler
} from './utils/helpers'

const { mobile, xs, smAndDown, mdAndUp, lgAndUp } = useDisplay()
// const router = useRouter()

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(BOOKING_CONSTANTS.ITEMS_PER_PAGE)

// Responsive computed values
const cardSpacing = computed(() => xs.value ? 'mb-2 pa-2' : smAndDown.value ? 'mb-3 pa-3' : 'mb-4 pa-4')
const avatarSize = computed(() => xs.value ? 36 : mobile.value ? 40 : 48)
const iconSize = computed(() => xs.value ? 'small' : mobile.value ? 'small' : '24')
const totalVisible = computed(() => xs.value ? 3 : smAndDown.value ? 5 : 7)
const containerPadding = computed(() => xs.value ? 'pa-1' : smAndDown.value ? 'pa-2' : 'pa-4')
const emptyStateIconSize = computed(() => xs.value ? 64 : mobile.value ? 80 : 96)

// Loading and dialog states for delete functionality
const deleting = ref(false)
const deleteDialog = ref(false)
const bookingToDelete = ref(null)

const {
  userBookings: weddingBookings,
  formatDate: formatWeddingDate,
  getStatusColor: getWeddingStatusColor,
  getStatusText: getWeddingStatusText,
  handleBookingClick: handleWeddingClick,
  isClickable: isWeddingClickable,
  deleteBooking: deleteWeddingBooking
} = useWeddingHeader()

const {
  userBookings: funeralBookings,
  formatDate: formatFuneralDate,
  getStatusColor: getFuneralStatusColor,
  getStatusText: getFuneralStatusText,
  handleBookingClick: handleFuneralClick,
  isClickable: isFuneralClickable,
  deleteBooking: deleteFuneralBooking
} = useFuneralHeader()

const {
  userBookings: thanksGivingBookings,
  formatDate: formatThanksGivingDate,
  getStatusColor: getThanksGivingStatusColor,
  getStatusText: getThanksGivingStatusText,
  handleBookingClick: handleThanksGivingClick,
  isClickable: isThanksGivingClickable,
  deleteBooking: deleteThanksGivingBooking
} = useThanksGivingHeader()

const {
  userBookings: baptismBookings,
  formatDate: formatBaptismDate,
  getStatusColor: getBaptismStatusColor,
  getStatusText: getBaptismStatusText,
  handleBookingClick: handleBaptismClick,
  isClickable: isBaptismClickable,
  deleteBooking: deleteBaptismBooking
} = useBaptismHeader()

// Create handlers object for the helper functions
const bookingHandlers = {
  wedding: {
    formatDate: formatWeddingDate,
    getStatusColor: getWeddingStatusColor,
    getStatusText: getWeddingStatusText,
    handleBookingClick: handleWeddingClick,
    isClickable: isWeddingClickable,
    deleteBooking: deleteWeddingBooking
  },
  funeral: {
    formatDate: formatFuneralDate,
    getStatusColor: getFuneralStatusColor,
    getStatusText: getFuneralStatusText,
    handleBookingClick: handleFuneralClick,
    isClickable: isFuneralClickable,
    deleteBooking: deleteFuneralBooking
  },
  thanksgiving: {
    formatDate: formatThanksGivingDate,
    getStatusColor: getThanksGivingStatusColor,
    getStatusText: getThanksGivingStatusText,
    handleBookingClick: handleThanksGivingClick,
    isClickable: isThanksGivingClickable,
    deleteBooking: deleteThanksGivingBooking
  },
  baptism: {
    formatDate: formatBaptismDate,
    getStatusColor: getBaptismStatusColor,
    getStatusText: getBaptismStatusText,
    handleBookingClick: handleBaptismClick,
    isClickable: isBaptismClickable,
    deleteBooking: deleteBaptismBooking
  }
}

// Merge all bookings into one array with type indicators using helper
const allBookings = computed(() => {
  const bookingsByType = {
    wedding: weddingBookings.value,
    funeral: funeralBookings.value,
    thanksgiving: thanksGivingBookings.value,
    baptism: baptismBookings.value
  }

  return mergeAndSortBookings(bookingsByType)
})

// Pagination logic
const totalPages = computed(() => Math.ceil(allBookings.value.length / itemsPerPage.value))

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return allBookings.value.slice(start, end)
})

// Helper functions using the imported utilities
const formatDate = (booking) => {
  return formatBookingDate(booking, bookingHandlers)
}

const getStatusColor = (booking) => {
  return getBookingStatusColor(booking, bookingHandlers)
}

const getStatusText = (booking) => {
  return getBookingStatusText(booking, bookingHandlers)
}

const handleBookingClick = (booking) => {
  handleBookingClickHelper(booking, bookingHandlers)
}

const isClickable = (booking) => {
  return isBookingClickable(booking, bookingHandlers)
}

const canDelete = (booking) => {
  return canDeleteBooking(booking)
}

const showDeleteDialog = (booking) => {
  bookingToDelete.value = booking
  deleteDialog.value = true
}

const handleDelete = async () => {
  if (!bookingToDelete.value) return

  deleting.value = true

  try {
    const result = await deleteBookingHandler(bookingToDelete.value, bookingHandlers)

    if (result && result.success) {
      // Reset pagination if current page has no items
      if (paginatedBookings.value.length === 1 && currentPage.value > 1) {
        currentPage.value = currentPage.value - 1
      }
    }
  } catch (error) {
    console.error('Error deleting booking:', error)
  } finally {
    deleting.value = false
    deleteDialog.value = false
    bookingToDelete.value = null
  }
}
</script>

<template>
  <v-container :class="containerPadding" fluid>
    <!-- Header with title and pagination controls -->
    <div v-if="mdAndUp" class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-chip
          color="primary"
          variant="outlined"
          :size="lgAndUp ? 'default' : 'small'"
          prepend-icon="mdi-information"
        >
          MY BOOKINGS
        </v-chip>
        <span v-if="allBookings.length" class="text-body-2 text-medium-emphasis ml-3">
          ({{ allBookings.length }} total)
        </span>
      </div>

      <!-- Pagination Controls - Desktop -->
      <div v-if="allBookings.length" class="d-flex align-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="totalVisible"
          rounded="circle"
          color="primary"
          density="compact"
        />
      </div>
    </div>

    <!-- Mobile/Tablet Header Layout -->
    <div v-if="smAndDown" :class="xs ? 'mb-2' : 'mb-3'">
      <!-- Title Row -->
      <div class="d-flex align-center justify-center" :class="xs ? 'mb-2' : 'mb-3'">
        <v-chip
          color="primary"
          variant="outlined"
          :size="xs ? 'x-small' : 'small'"
          prepend-icon="mdi-information"
        >
          MY BOOKINGS
        </v-chip>
      </div>

      <!-- Mobile/Tablet Pagination Controls -->
      <div v-if="allBookings.length" class="d-flex flex-column align-center">
        <!-- Pagination component -->
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="totalVisible"
          density="compact"
          :size="xs ? 'x-small' : 'small'"
        />

        <!-- Page info -->
        <div :class="xs ? 'text-caption' : 'text-body-2'" class="text-medium-emphasis mt-1">
          {{ ((currentPage - 1) * itemsPerPage + 1) }} -
          {{ Math.min(currentPage * itemsPerPage, allBookings.length) }}
          of {{ allBookings.length }}
        </div>
      </div>
    </div>

        <div v-if="allBookings.length" class="booking-list">
      <v-card
        v-for="booking in paginatedBookings"
        :key="`${booking.bookingType}-${booking.id}`"
        :class="[
          cardSpacing,
          isClickable(booking) ? 'cursor-pointer' : ''
        ]"
        rounded="xl"
        elevation="1"
        hover
        @click="isClickable(booking) ? handleBookingClick(booking) : null"
      >
        <template v-if="smAndDown">
          <div :class="xs ? 'mb-2' : 'mb-3'" class="d-flex align-center">
            <v-avatar color="primary" :class="xs ? 'mr-2' : 'mr-3'" :size="avatarSize">
              <v-icon color="white" :size="iconSize">{{ getBookingIcon(booking) }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h4 :class="xs ? 'text-body-1' : 'text-subtitle-1'" class="font-weight-medium">
                {{ getBookingTitle(booking) }}
                <v-icon v-if="isBookingCompleted(booking)" color="success" size="small" class="ml-1">
                  mdi-check-circle
                </v-icon>
              </h4>
              <p class="text-caption text-medium-emphasis ma-0">{{ getBookingTypeLabel(booking) }}</p>
              <div v-if="getReferenceId(booking)" :class="xs ? 'mt-1' : 'mt-1'" class="d-flex align-center">
                <v-chip
                  color="success"
                  variant="tonal"
                  size="x-small"
                  prepend-icon="mdi-identifier"
                  class="text-caption"
                >
                  {{ getReferenceId(booking) }}
                </v-chip>
              </div>
              <p v-if="booking.comment" class="text-caption text-medium-emphasis ma-0 mt-1">{{ booking.comment }}</p>
            </div>
            <v-chip
              :color="getStatusColor(booking)"
              variant="flat"
              :size="xs ? 'x-small' : 'small'"
              rounded="pill"
            >
              {{ getStatusText(booking) }}
            </v-chip>
          </div>

          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="primary" size="small" :class="xs ? 'mr-1' : 'mr-2'">mdi-calendar</v-icon>
              <span :class="xs ? 'text-caption' : 'text-body-2'">{{ formatDate(booking) }}</span>
            </div>
            <div v-if="canDelete(booking)" class="d-flex align-center">
              <v-btn
                icon
                :size="xs ? 'x-small' : 'small'"
                color="error"
                variant="text"
                @click.stop="showDeleteDialog(booking)"
              >
                <v-icon :size="xs ? 'x-small' : 'small'">mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
        </template>

        <template v-else>
          <v-row class="align-center">
            <v-col cols="12" md="6" lg="5">
              <div class="d-flex align-center">
                <v-avatar color="primary" :class="lgAndUp ? 'mr-4' : 'mr-3'" :size="lgAndUp ? 56 : 48">
                  <v-icon color="white" :size="lgAndUp ? 28 : 24">{{ getBookingIcon(booking) }}</v-icon>
                </v-avatar>
                <div>
                  <h3 :class="lgAndUp ? 'text-h5' : 'text-h6'" class="font-weight-medium d-flex align-center">
                    {{ getBookingTitle(booking) }} {{ booking.bookingType === 'wedding' ? 'Wedding' : booking.bookingType === 'funeral' ? 'Funeral' : booking.bookingType === 'baptism' ? 'Baptism' : 'Thanksgiving' }}
                    <v-icon v-if="isBookingCompleted(booking)" color="success" size="small" class="ml-2">
                      mdi-check-circle
                    </v-icon>
                  </h3>
                  <p :class="lgAndUp ? 'text-body-1' : 'text-body-2'" class="text-medium-emphasis ma-0">
                    {{ getBookingSubtitle(booking) }}
                  </p>
                  <div v-if="getReferenceId(booking)" :class="lgAndUp ? 'mt-2' : 'mt-1'">
                    <v-chip
                      color="success"
                      variant="tonal"
                      :size="lgAndUp ? 'default' : 'small'"
                      prepend-icon="mdi-identifier"
                    >
                      {{ getReferenceId(booking) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3" lg="3">
              <div class="d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-calendar</v-icon>
                <span :class="lgAndUp ? 'text-body-1' : 'text-body-2'">{{ formatDate(booking) }}</span>
              </div>
            </v-col>

            <v-col cols="12" md="3" lg="4" class="text-right">
              <div class="d-flex align-center justify-end mb-2">
                <v-chip
                  :color="getStatusColor(booking)"
                  variant="flat"
                  :size="lgAndUp ? 'default' : 'small'"
                  rounded="pill"
                  class="mr-2"
                >
                  {{ getStatusText(booking) }}
                </v-chip>
                <v-btn
                  v-if="canDelete(booking)"
                  icon
                  size="small"
                  color="error"
                  variant="text"
                  @click.stop="showDeleteDialog(booking)"
                >
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </div>
              <div v-if="booking.comment" class="text-caption text-medium-emphasis">{{ booking.comment }}</div>
            </v-col>
          </v-row>
        </template>
      </v-card>
    </div>

    <!-- Fallback card when no data -->
    <v-card
      v-else
      :class="xs ? 'pa-4' : smAndDown ? 'pa-6' : lgAndUp ? 'pa-10' : 'pa-8'"
      class="text-center mt-4"
      rounded="xl"
      elevation="0"
    >
      <v-icon :size="emptyStateIconSize" color="primary" class="mb-3"> mdi-information-outline </v-icon>
      <h3 :class="xs ? 'text-body-1 mb-2' : smAndDown ? 'text-h6 mb-2' : lgAndUp ? 'text-h4 mb-4' : 'text-h5 mb-3'">No data available</h3>
      <p :class="xs ? 'text-caption mb-3' : smAndDown ? 'text-body-2 mb-4' : lgAndUp ? 'text-h6 mb-5' : 'text-body-1 mb-4'" class="text-medium-emphasis">
        Please check back later for updates or contact support if you have any concerns.
      </p>
      <v-btn
        color="primary"
        :size="xs ? 'small' : smAndDown ? 'default' : 'large'"
        prepend-icon="mdi-refresh"
        rounded="pill"
        :class="xs ? 'px-4' : 'px-6'"
        @click="$router.go(0)"
      >
        Refresh
      </v-btn>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <FormDialog
      v-model="deleteDialog"
      :booking="bookingToDelete"
      :loading="deleting"
      title="Confirm Deletion"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="handleDelete"
      @cancel="bookingToDelete = null"
    />
  </v-container>
</template>

<style scoped>
/* Minimal scoped CSS - rely on Vuetify utilities for all styling */
.cursor-pointer {
  cursor: pointer;
}
</style>
