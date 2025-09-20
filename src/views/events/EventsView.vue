<script setup>
import { ref, onMounted } from 'vue'
import NavBar2 from '@/components/layout/NavBar2.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import Calendar from './components/CalendarWidget.vue'
import calendarEvents from './data/calendarData'
import AppBar from '@/components/layout/AppBar.vue'
import MyForms from '@/components/layout/MyForms.vue'
// Use the shared calendar data (exported array)
const events = ref(calendarEvents)

const selectedDate = ref(null)

// Methods para sa calendar interactions
const handleDateSelected = (date) => {
  selectedDate.value = date
  console.log('Selected date:', date)
  // pwede mag filter sa events based sa selected date
}

const handleEventClicked = (event) => {
  console.log('Event clicked:', event)
  // pwede mag navigate sa specific event details
}

// Fetch events on component mount
onMounted(() => {
  // TODO: fetch real events from Pinia store or API
  console.log('Events view mounted, events loaded:', events.value.length)
})
</script>

<template>
  <PreloaderView />
  <NavBar2>
    <template #content>
      <v-container fluid class="pa-2 pa-sm-4">
        <!-- Page header -->
         <v-row>
            <v-col cols="12">
              <MyForms />
            </v-col>
          </v-row>

        <!-- Notice about date conflicts -->
        <v-row>
          <v-col cols="12">
            <v-alert
              type="info"
              variant="tonal"
              color="primary"
              icon="mdi-information-outline"
              class="mb-4"
            >
              <v-alert-title class="text-body-1 font-weight-medium">
                Important Notice
              </v-alert-title>
              <div class="text-body-2 mt-2">
                Please pay attention to the dates below for avoiding conflicts with existing events and church activities.
              </div>
            </v-alert>
          </v-col>
        </v-row>

        <!-- Calendar component -->
        <v-row>
          <v-col cols="12">
            <Calendar
              :events="events"
              @date-selected="handleDateSelected"
              @event-clicked="handleEventClicked"
            />
          </v-col>
        </v-row>


      </v-container>
      <AppBar />
    </template>
  </NavBar2>
</template>

<style scoped>
/* Mobile-first responsive enhancements */
@media (max-width: 599px) {
  /* Smaller padding and margins on mobile */
  :deep(.v-card-title) {
    font-size: 1.1rem !important;
    line-height: 1.3;
  }

  :deep(.v-card-text) {
    padding: 8px 12px !important;
  }

  /* Ensure button groups wrap properly on very small screens */
  :deep(.v-btn-toggle) {
    flex-wrap: wrap;
  }

  /* Touch-friendly button sizing */
  :deep(.v-btn--size-x-small) {
    min-height: 32px;
    padding: 4px 8px;
  }
}

@media (max-width: 479px) {
  /* Extra small screens - more compact layout */
  :deep(.v-container) {
    padding: 8px !important;
  }

  :deep(.v-card) {
    margin-bottom: 12px;
  }

  /* Smaller statistics numbers on very small screens */
  :deep(.text-h5) {
    font-size: 1.25rem !important;
  }
}

/* Landscape orientation on mobile devices */
@media (max-width: 959px) and (orientation: landscape) {
  :deep(.v-row) {
    margin-bottom: 8px;
  }

  /* Make better use of horizontal space in landscape */
  :deep(.v-col) {
    padding: 4px 8px;
  }
}

/* Touch device enhancements */
@media (pointer: coarse) {
  /* Ensure all interactive elements are touch-friendly */
  :deep(.v-btn),
  :deep(.v-chip) {
    min-height: 44px;
    min-width: 44px;
  }

  :deep(.v-chip) {
    padding: 8px 12px;
    margin: 4px;
  }

  /* Larger tap targets for expansion panels */
  :deep(.v-expansion-panel-title) {
    min-height: 48px;
    padding: 12px 16px;
  }
}

/* High DPI screen adjustments */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  :deep(.v-icon) {
    /* Ensure icons render crispy on high DPI screens */
    transform: translateZ(0);
  }
}
</style>
