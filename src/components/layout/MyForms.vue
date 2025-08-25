<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
// import { useRouter } from 'vue-router'
import { useWeddingHeader } from './weddingHeaderLayout/weddingHeader'
import { useFuneralHeader } from './funeralHeaderLayout/funeralHeader'

const { mobile } = useDisplay()
// const router = useRouter()

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
  
  // Sort by date (most recent first)
  return combined.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
})

// Helper functions for merged bookings
const formatDate = (booking) => {
  if (booking.bookingType === 'wedding') {
    return formatWeddingDate(booking.wedding_date)
  } else {
    return formatFuneralDate(booking.funeral_date)
  }
}

const getStatusColor = (booking) => {
  if (booking.bookingType === 'wedding') {
    return getWeddingStatusColor(booking)
  } else {
    return getFuneralStatusColor(booking)
  }
}

const getStatusText = (booking) => {
  if (booking.bookingType === 'wedding') {
    return getWeddingStatusText(booking)
  } else {
    return getFuneralStatusText(booking)
  }
}

const handleBookingClick = (booking) => {
  if (booking.bookingType === 'wedding') {
    handleWeddingClick(booking)
  } else {
    handleFuneralClick(booking)
  }
}

const isClickable = (booking) => {
  if (booking.bookingType === 'wedding') {
    return isWeddingClickable(booking)
  } else {
    return isFuneralClickable(booking)
  }
}

const getBookingTitle = (booking) => {
  if (booking.bookingType === 'wedding') {
    return `${booking.bride_firstname} & ${booking.groom_firstname}`
  } else {
    return `${booking.deceased_firstname} ${booking.deceased_lastname}`
  }
}

const getBookingSubtitle = (booking) => {
  if (booking.bookingType === 'wedding') {
    return `${booking.bride_firstname} ${booking.bride_lastname} - ${booking.groom_firstname} ${booking.groom_lastname}`
  } else {
    return 'Funeral Mass Booking'
  }
}

const getBookingIcon = (booking) => {
  return booking.bookingType === 'wedding' ? 'mdi-heart' : 'mdi-cross'
}

const getBookingTypeLabel = (booking) => {
  return booking.bookingType === 'wedding' ? 'Wedding Booking' : 'Funeral Booking'
}

const getReferenceId = (booking) => {
  if (booking.bookingType === 'wedding' && booking.ref_number) {
    return `Ref: ${booking.ref_number}`
  } 
  return null
}
</script>

<template>
  <v-container :class="mobile ? 'pa-2' : 'pa-4'" fluid>
    <div class="text-center">
      <v-chip
        color="primary"
        variant="outlined"
        size="small"
        class="mb-3"
        prepend-icon="mdi-information"
      >
        MY BOOKINGS
      </v-chip>
    </div>

    <div v-if="allBookings.length" class="booking-list">
      <v-card
        v-for="booking in allBookings"
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
              <p v-if="booking.comments" class="text-caption grey--text ma-0">{{ booking.comments }}</p>
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
                    {{ getBookingTitle(booking) }} {{ booking.bookingType === 'wedding' ? 'Wedding' : 'Funeral' }}
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
              <div v-if="booking.comments" class="text-caption grey--text mt-1">{{ booking.comments }}</div>
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
</style>
