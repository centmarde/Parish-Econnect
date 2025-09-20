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

const { mobile } = useDisplay()
// const router = useRouter()

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(BOOKING_CONSTANTS.ITEMS_PER_PAGE)

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
  <v-container :class="mobile ? 'pa-2' : 'pa-4'" fluid>
    <!-- Header with title and pagination controls -->
    <div v-if="!mobile" class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-chip
          color="primary"
          variant="outlined"
          size="small"
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
          :total-visible="5"
          rounded="circle"
          color="primary"

          density="compact"
        />
      </div>
    </div>

    <!-- Mobile Header Layout -->
    <div v-if="mobile" class="mb-3">
      <!-- Title Row -->
      <div class="d-flex align-center justify-center mb-3">
        <v-chip
          color="primary"
          variant="outlined"
          size="small"
          prepend-icon="mdi-information"
        >
          MY BOOKINGS
        </v-chip>

      </div>

      <!-- Mobile Pagination Controls -->
      <div v-if="allBookings.length" class="d-flex ms-2 flex-column align-center">
        <!-- Pagination component -->
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="3"

          density="compact"
          size="small"
        />

        <!-- Page info -->
        <div class="text-caption text-medium-emphasis mt-1">
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
          mobile ? 'mb-3 pa-3' : 'mb-4 pa-4',
          isClickable(booking) ? 'cursor-pointer' : ''
        ]"
        rounded="xl"
        elevation="1"
        hover
        @click="isClickable(booking) ? handleBookingClick(booking) : null"
      >
        <template v-if="mobile">
          <div class="d-flex align-center mb-3">
            <v-avatar color="primary" class="mr-3" size="40">
              <v-icon color="white">{{ getBookingIcon(booking) }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-medium">
                {{ getBookingTitle(booking) }}
                <v-icon v-if="isBookingCompleted(booking)" color="success" size="small" class="ml-1">
                  mdi-check-circle
                </v-icon>
              </h4>
              <p class="text-caption text-medium-emphasis ma-0">{{ getBookingTypeLabel(booking) }}</p>
              <div v-if="getReferenceId(booking)" class="d-flex align-center mt-1">
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
              <p v-if="booking.comment" class="text-caption grey--text ma-0 mt-1">{{ booking.comment }}</p>
            </div>
            <v-chip
              :color="getStatusColor(booking)"
              variant="flat"
              size="small"
              rounded="pill"
            >
              {{ getStatusText(booking) }}
            </v-chip>
          </div>

          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="primary" size="small" class="mr-2">mdi-calendar</v-icon>
              <span class="text-body-2">{{ formatDate(booking) }}</span>
            </div>
            <div v-if="canDelete(booking)" class="d-flex align-center">
              <v-btn
                icon
                size="small"
                color="error"
                variant="text"
                @click.stop="showDeleteDialog(booking)"
              >
                <v-icon size="small">mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
        </template>

        <template v-else>
          <v-row class="align-center">
            <v-col cols="6">
              <div class="d-flex align-center">
                <v-avatar color="primary" class="mr-3" size="48">
                  <v-icon color="white" size="24">{{ getBookingIcon(booking) }}</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-medium d-flex align-center">
                    {{ getBookingTitle(booking) }} {{ booking.bookingType === 'wedding' ? 'Wedding' : booking.bookingType === 'funeral' ? 'Funeral' : booking.bookingType === 'baptism' ? 'Baptism' : 'Thanksgiving' }}
                    <v-icon v-if="isBookingCompleted(booking)" color="success" size="small" class="ml-2">
                      mdi-check-circle
                    </v-icon>
                  </h3>
                  <p class="text-body-2 text-medium-emphasis ma-0">
                    {{ getBookingSubtitle(booking) }}
                  </p>
                  <div v-if="getReferenceId(booking)" class="mt-1">
                    <v-chip
                      color="success"
                      variant="tonal"
                      size="small"
                      prepend-icon="mdi-identifier"
                    >
                      {{ getReferenceId(booking) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="3">
              <div class="d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-calendar</v-icon>
                <span class="text-body-1">{{ formatDate(booking) }}</span>
              </div>
            </v-col>

            <v-col cols="3" class="text-right">
              <div class="d-flex align-center justify-end mb-2">
                <v-chip :color="getStatusColor(booking)" variant="flat" rounded="pill" class="mr-2">
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
              <div v-if="booking.comment" class="text-caption grey--text">{{ booking.comment }}</div>
            </v-col>
          </v-row>
        </template>
      </v-card>
    </div>

    <!-- Fallback card when no data -->
    <v-card
      v-else
      :class="mobile ? 'pa-6' : 'pa-8'"
      class="text-center mt-4"
      rounded="xl"
      elevation="0"
    >
      <v-icon :size="mobile ? 80 : 96" color="primary" class="mb-3"> mdi-information-outline </v-icon>
      <h3 :class="mobile ? 'text-h6 mb-2' : 'text-h5 mb-3'">No data available</h3>
      <p :class="mobile ? 'text-body-2 mb-4' : 'text-body-1 mb-4'" class="text-medium-emphasis">
        Please check back later for updates or contact support if you have any concerns.
      </p>
      <v-btn
        color="primary"
        :size="mobile ? 'default' : 'large'"
        prepend-icon="mdi-refresh"
        rounded="pill"
        class="px-6"
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
/* minimal styling; rely on Vuetify utilities */
.cursor-pointer {
  cursor: pointer;
}

.pagination-custom :deep(.v-pagination__item) {
  margin: 0 2px;
  min-height: 36px;
  min-width: 36px;
}

.pagination-custom :deep(.v-pagination__item--is-active) {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

/* Mobile-specific pagination styles */
@media (max-width: 600px) {
  .pagination-custom :deep(.v-pagination__item) {
    margin: 0 1px;
    min-height: 40px;
    min-width: 40px;
    font-size: 14px;
  }

  .pagination-custom :deep(.v-pagination__prev),
  .pagination-custom :deep(.v-pagination__next) {
    min-height: 40px;
    min-width: 40px;
  }
}

/* Ensure proper spacing for mobile controls */
@media (max-width: 960px) {
  .mobile-pagination-container {
    gap: 8px;
  }
}
</style>
