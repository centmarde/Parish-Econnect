<script setup lang="ts">
import { useFuneralHeader } from './funeralHeader'

const {
  funeralStore,
  mobile,
  userBookings,
  formatDate,
  getStatusColor,
  getStatusText,
  handleBookingClick,
  isClickable
} = useFuneralHeader()
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

    <v-alert v-if="funeralStore.error" type="error" class="mb-4" closable>
      Error: {{ funeralStore.error }}
    </v-alert>

    <div v-if="userBookings.length" class="booking-list">
      <v-card
        v-for="booking in userBookings"
        :key="booking.id"
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
              <v-icon color="white">mdi-cross</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-medium">
                {{ booking.deceased_firstname }} {{ booking.deceased_lastname }}
              </h4>
              <p class="text-caption text-medium-emphasis ma-0">Funeral Booking</p>
              <p v-if="booking.ref_number" class="text-caption primary--text ma-0">REF: {{ booking.ref_number }}</p>
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
              <span class="text-body-2">{{ formatDate(booking.funeral_date) }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <v-row class="align-center">
            <v-col cols="6">
              <div class="d-flex align-center">
                <v-avatar color="primary" class="mr-3" size="48">
                  <v-icon color="white" size="24">mdi-cross</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-medium">
                    {{ booking.deceased_firstname }} {{ booking.deceased_lastname }} Funeral
                  </h3>
                  <p class="text-body-2 text-medium-emphasis ma-0">
                    Funeral Mass Booking
                  </p>
                </div>
              </div>
            </v-col>

            <v-col cols="3">
              <div class="d-flex align-center">
                <v-icon color="primary" size="small" class="mr-2">mdi-calendar</v-icon>
                <span class="text-body-1">{{ formatDate(booking.funeral_date) }}</span>
              </div>
            </v-col>

            <v-col cols="3" class="text-right">
              <v-chip :color="getStatusColor(booking)" variant="flat" rounded="pill">
                {{ getStatusText(booking) }}
              </v-chip>
              <div v-if="booking.ref_number" class="text-caption mt-2">REF: {{ booking.ref_number }}</div>
              <div v-if="booking.comment" class="text-caption grey--text mt-1">{{ booking.comment }}</div>
            </v-col>
          </v-row>
        </template>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
/* minimal styling; rely on Vuetify utilities */
.cursor-pointer {
  cursor: pointer;
}
</style>
