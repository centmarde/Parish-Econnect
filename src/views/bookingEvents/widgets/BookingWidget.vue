<script setup>
import { getEventItems, cleanEventName, isWeddingEvent, isFuneralEvent, isThanksgivingEvent, isBaptismEvent } from '../functions/helpers'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const items = getEventItems()
const isVisible = ref(false)
const router = useRouter()

onMounted(() => {
  // animate in effect para sa more engaging experience
  setTimeout(() => {
    isVisible.value = true
  }, 200)
})

// Handle booking action for each item. Route each event type to its corresponding form.
const handleBooking = (item) => {
  if (!item) return

  if (isWeddingEvent(item)) {
    // direct navigation to the wedding form
    router.push('/wedding-mass-form')
    return
  }

  if (isFuneralEvent(item)) {
    // direct navigation to the funeral mass form
    router.push('/funeral-mass')
    return
  }

  if (isThanksgivingEvent(item)) {
    // direct navigation to the thanksgiving mass form
    router.push('/thanks-giving-mass')
    return
  }

  if (isBaptismEvent(item)) {
    // direct navigation to the baptism mass form
    router.push('/baptism-mass')
    return
  }

  // Fallback behavior for any other items
  console.log('Selected booking item:', item)
}
</script>

<template>
  <v-container fluid class="pa-0">
    <!-- Header Section with enhanced styling -->
    <div class="text-center mb-6">
      <v-chip
        color="primary"
        variant="outlined"
        size="small"
        class="mb-3"
        prepend-icon="mdi-calendar-heart"
      >
        Quick Booking
      </v-chip>
      <h2 class="text-h5 font-weight-bold mb-2 text-white">
        Choose Your Event
      </h2>
      <p class="text-body-2 text-center text-white">
        Select ang event nga gusto nimo i-book para sa inyong pamilya
      </p>
    </div>

    <!-- Mobile: 2 rows x 2 columns, Desktop: 1 row x 4 columns -->
    <v-row>
      <v-col
        v-for="item in items"
        :key="item.name"
        cols="6"
        md="3"
      >
        <v-card
          class="h-100 d-flex flex-column rounded-lg"
          elevation="2"
        >
          <v-card-text class="pa-4 text-center flex-grow-1 d-flex flex-column">
            <!-- Icon with background -->
            <div class="d-flex justify-center mb-3">
              <v-avatar
                size="64"
                color="primary"
                class="elevation-2"
              >
                <v-icon
                  :icon="item.icon"
                  size="40"
                  color="white"
                />
              </v-avatar>
            </div>

            <!-- Event name with better typography -->
            <h3 class="text-subtitle-1 font-weight-bold mb-2">
              {{ cleanEventName(item.name) }}
            </h3>

            <!-- Description -->
            <p class="text-body-2 mb-4 flex-grow-1">
              {{ item.description }}
            </p>

            <!-- Book button with enhanced styling -->
            <v-btn
              color="primary"
              size="small"
              variant="elevated"
              rounded="pill"
              class="elevation-4 mt-auto"
              prepend-icon="mdi-calendar-plus"
              @click.prevent="handleBooking(item)"
            >
              Book Now
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
