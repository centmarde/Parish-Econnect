<script setup>
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
// import { useRouter } from 'vue-router'
import { useWeddingHeader } from './weddingHeaderLayout/weddingHeader'
import { useFuneralHeader } from './funeralHeaderLayout/funeralHeader'
import { useThanksGivingHeader } from './thanksGivingLayout/thanksGiving'
import { useBaptismHeader } from './baptism/baptismHeader'

const { mobile } = useDisplay()
// const router = useRouter()

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(5)

const {
  userBookings: weddingBookings,
  formatDate: formatWeddingDate,
  getStatusColor: getWeddingStatusColor,
  getStatusText: getWeddingStatusText,
  handleBookingClick: handleWeddingClick,
  isClickable: isWeddingClickable
} = useWeddingHeader()

const {
  userBookings: funeralBookings,
  formatDate: formatFuneralDate,
  getStatusColor: getFuneralStatusColor,
  getStatusText: getFuneralStatusText,
  handleBookingClick: handleFuneralClick,
  isClickable: isFuneralClickable
} = useFuneralHeader()

const {
  userBookings: thanksGivingBookings,
  formatDate: formatThanksGivingDate,
  getStatusColor: getThanksGivingStatusColor,
  getStatusText: getThanksGivingStatusText,
  handleBookingClick: handleThanksGivingClick,
  isClickable: isThanksGivingClickable
} = useThanksGivingHeader()

const {
  userBookings: baptismBookings,
  formatDate: formatBaptismDate,
  getStatusColor: getBaptismStatusColor,
  getStatusText: getBaptismStatusText,
  handleBookingClick: handleBaptismClick,
  isClickable: isBaptismClickable
} = useBaptismHeader()

// Merge all bookings into one array with type indicators
const allBookings = computed(() => {
  const combined = []

  // Add wedding bookings with type indicator
  weddingBookings.value.forEach(booking => {
    combined.push({
      ...booking,
      bookingType: 'wedding',
      sortDate: booking.wedding_date || booking.created_at
    })
  })

  // Add funeral bookings with type indicator
  funeralBookings.value.forEach(booking => {
    combined.push({
      ...booking,
      bookingType: 'funeral',
      sortDate: booking.funeral_date || booking.created_at
    })
  })

  // Add thanksgiving bookings with type indicator
  thanksGivingBookings.value.forEach(booking => {
    combined.push({
      ...booking,
      bookingType: 'thanksgiving',
      sortDate: booking.thanksgiving_date || booking.created_at
    })
  })

  // Add baptism bookings with type indicator
  baptismBookings.value.forEach(booking => {
    combined.push({
      ...booking,
      bookingType: 'baptism',
      sortDate: booking.baptism_date || booking.created_at
    })
  })

  // Sort by date (most recent first)
  return combined.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
})

// Pagination logic
const totalPages = computed(() => Math.ceil(allBookings.value.length / itemsPerPage.value))

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return allBookings.value.slice(start, end)
})

// Remove showPagination - pagination will always be visible

// Helper functions for merged bookings
const formatDate = (booking) => {
  if (booking.bookingType === 'wedding') {
    return formatWeddingDate(booking.wedding_date)
  } else if (booking.bookingType === 'funeral') {
    return formatFuneralDate(booking.funeral_date)
  } else if (booking.bookingType === 'baptism') {
    return formatBaptismDate(booking.baptism_date)
  } else {
    return formatThanksGivingDate(booking.thanksgiving_date)
  }
}

const getStatusColor = (booking) => {
  if (booking.bookingType === 'wedding') {
    return getWeddingStatusColor(booking)
  } else if (booking.bookingType === 'funeral') {
    return getFuneralStatusColor(booking)
  } else if (booking.bookingType === 'baptism') {
    return getBaptismStatusColor(booking)
  } else {
    return getThanksGivingStatusColor(booking)
  }
}

const getStatusText = (booking) => {
  if (booking.bookingType === 'wedding') {
    return getWeddingStatusText(booking)
  } else if (booking.bookingType === 'funeral') {
    return getFuneralStatusText(booking)
  } else if (booking.bookingType === 'baptism') {
    return getBaptismStatusText(booking)
  } else {
    return getThanksGivingStatusText(booking)
  }
}

const handleBookingClick = (booking) => {
  if (booking.bookingType === 'wedding') {
    handleWeddingClick(booking)
  } else if (booking.bookingType === 'funeral') {
    handleFuneralClick(booking)
  } else if (booking.bookingType === 'baptism') {
    handleBaptismClick(booking)
  } else {
    handleThanksGivingClick(booking)
  }
}

const isClickable = (booking) => {
  if (booking.bookingType === 'wedding') {
    return isWeddingClickable(booking)
  } else if (booking.bookingType === 'funeral') {
    return isFuneralClickable(booking)
  } else if (booking.bookingType === 'baptism') {
    return isBaptismClickable(booking)
  } else {
    return isThanksGivingClickable(booking)
  }
}

const getBookingTitle = (booking) => {
  if (booking.bookingType === 'wedding') {
    return `${booking.bride_firstname} & ${booking.groom_firstname}`
  } else if (booking.bookingType === 'funeral') {
    return `${booking.deceased_firstname} ${booking.deceased_lastname}`
  } else if (booking.bookingType === 'baptism') {
    return `${booking.child_firstname} ${booking.child_lastname}`
  } else {
    return booking.title || `${booking.participant_firstname} ${booking.participant_lastname}`
  }
}

const getBookingSubtitle = (booking) => {
  if (booking.bookingType === 'wedding') {
    return `${booking.bride_firstname} ${booking.bride_lastname} - ${booking.groom_firstname} ${booking.groom_lastname}`
  } else if (booking.bookingType === 'funeral') {
    return 'Funeral Mass Booking'
  } else if (booking.bookingType === 'baptism') {
    return 'Baptism Mass Booking'
  } else {
    return 'Thanksgiving Mass Booking'
  }
}

const getBookingIcon = (booking) => {
  if (booking.bookingType === 'wedding') {
    return 'mdi-heart'
  } else if (booking.bookingType === 'funeral') {
    return 'mdi-cross'
  } else if (booking.bookingType === 'baptism') {
    return 'mdi-water'
  } else {
    return 'mdi-bird'
  }
}

const getBookingTypeLabel = (booking) => {
  if (booking.bookingType === 'wedding') {
    return 'Wedding Booking'
  } else if (booking.bookingType === 'funeral') {
    return 'Funeral Booking'
  } else if (booking.bookingType === 'baptism') {
    return 'Baptism Booking'
  } else {
    return 'Thanksgiving Booking'
  }
}

const getReferenceId = (booking) => {
  if ((booking.bookingType === 'wedding' || booking.bookingType === 'baptism') && booking.ref_number) {
    return `Ref: ${booking.ref_number}`
  }
  return null
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
          class="pagination-custom"
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
          rounded="circle"
          color="primary"
          class="pagination-custom"
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
        @click="handleBookingClick(booking)"
        :disabled="!isClickable(booking)"
      >
        <template v-if="mobile">
          <div class="d-flex align-center mb-3">
            <v-avatar color="primary" class="mr-3" size="40">
              <v-icon color="white">{{ getBookingIcon(booking) }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-medium">
                {{ getBookingTitle(booking) }}
              </h4>
              <p class="text-caption text-medium-emphasis ma-0">{{ getBookingTypeLabel(booking) }}</p>
              <p v-if="getReferenceId(booking)" class="text-caption primary--text ma-0">{{ getReferenceId(booking) }}</p>
              <p v-if="booking.comment" class="text-caption grey--text ma-0">{{ booking.comment }}</p>
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
                  <h3 class="text-h6 font-weight-medium">
                    {{ getBookingTitle(booking) }} {{ booking.bookingType === 'wedding' ? 'Wedding' : booking.bookingType === 'funeral' ? 'Funeral' : booking.bookingType === 'baptism' ? 'Baptism' : 'Thanksgiving' }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis ma-0">
                    {{ getBookingSubtitle(booking) }}
                  </p>
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
              <v-chip :color="getStatusColor(booking)" variant="flat" rounded="pill">
                {{ getStatusText(booking) }}
              </v-chip>
              <div v-if="getReferenceId(booking)" class="text-caption mt-2">{{ getReferenceId(booking) }}</div>
              <div v-if="booking.comment" class="text-caption grey--text mt-1">{{ booking.comment }}</div>
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
