<script setup>
// Props para sa filtered events count
defineProps({
  filteredEvents: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
 <!-- Header Section -->
        <div class="glass-card pa-6 mb-8">
          <div
            class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center ga-4"
          >
            <div>
              <h1 class="header-gradient mb-2 text-h4 text-md-h3">Events Management</h1>
              <p class="text-subtitle-1 text-grey">
                Manage all parish events, announcements, and approved bookings
              </p>
            </div>

            <div class="d-flex align-center ga-2">
              <v-chip color="primary" variant="tonal">
                <v-icon start>mdi-calendar-multiple</v-icon>
                {{ filteredEvents.length }} Events
              </v-chip>
            </div>
          </div>
        </div>
</template>
