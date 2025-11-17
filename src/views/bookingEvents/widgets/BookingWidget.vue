<script setup>
import { getEventItems, cleanEventName, isWeddingEvent, isFuneralEvent, isThanksgivingEvent, isBaptismEvent, isOthersEvent } from '../functions/helpers'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OthersDialog from '../others/OthersDialog.vue'

const items = getEventItems()
const isVisible = ref(false)
const router = useRouter()
const showOthersDialog = ref(false)

// Event colors matching calendar-theme.css
const getEventColor = (item) => {
  if (isWeddingEvent(item)) return '#E91E63' // Pink
  if (isBaptismEvent(item)) return '#2196F3' // Blue
  if (isFuneralEvent(item)) return '#795548' // Brown
  if (isThanksgivingEvent(item)) return '#9C27B0' // Purple
  if (isOthersEvent(item)) return '#607D8B' // Blue Grey
  return '#607D8B' // Default
}

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

  if (isOthersEvent(item)) {
    // show dialog for other events
    showOthersDialog.value = true
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

    <!-- Responsive Grid: Mobile 2 cols, Tablet 3 cols, Desktop 5 cols -->
    <v-row justify="center">
      <v-col
        v-for="item in items"
        :key="item.name"
        cols="6"
        sm="4"
        lg="2"
      >
        <v-card
          class="h-100 d-flex flex-column rounded-lg"
          elevation="2"
        >
          <v-card-text class="pa-4 text-center grow d-flex flex-column">
            <!-- Icon with background -->
            <div class="d-flex justify-center mb-3">
              <v-avatar
                size="64"
                :color="getEventColor(item)"
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
            <p class="text-body-2 mb-4 grow">
              {{ item.description }}
            </p>

            <!-- Book button with enhanced styling -->
            <v-btn
              :color="getEventColor(item)"
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

    <!-- Others Dialog -->
    <OthersDialog v-model="showOthersDialog" />
  </v-container>
</template>
