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

        <!-- Events summary section -->
        <v-row class="mt-3 mt-sm-4">
          <v-col cols="12" lg="6">
            <v-card elevation="2">
              <v-card-title class="d-flex align-center pa-3 pa-sm-4">
                <v-icon class="me-2" color="primary" :size="$vuetify.display.xs ? 'small' : 'default'">mdi-calendar-check</v-icon>
                <span class="text-h6 text-sm-h5">Event Statistics</span>
              </v-card-title>
              <v-card-text class="pa-2 pa-sm-3">
                <v-row>
                  <v-col cols="6" sm="3" lg="6" xl="3">
                    <v-sheet class="pa-2 pa-sm-3 text-center" color="primary" variant="tonal" rounded>
                      <div class="text-h5 text-sm-h4 primary--text">{{ events.length }}</div>
                      <div class="text-caption text-sm-body-2">Total Events</div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="6" sm="3" lg="6" xl="3">
                    <v-sheet class="pa-2 pa-sm-3 text-center" color="success" variant="tonal" rounded>
                      <div class="text-h5 text-sm-h4 success--text">{{ events.filter(e => e.type === 'mass').length }}</div>
                      <div class="text-caption text-sm-body-2">Masses</div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="6" sm="3" lg="6" xl="3">
                    <v-sheet class="pa-2 pa-sm-3 text-center" color="pink" variant="tonal" rounded>
                      <div class="text-h5 text-sm-h4 pink--text">{{ events.filter(e => e.type === 'wedding').length }}</div>
                      <div class="text-caption text-sm-body-2">Weddings</div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="6" sm="3" lg="6" xl="3">
                    <v-sheet class="pa-2 pa-sm-3 text-center" color="blue" variant="tonal" rounded>
                      <div class="text-h5 text-sm-h4 blue--text">{{ events.filter(e => e.type === 'baptism').length }}</div>
                      <div class="text-caption text-sm-body-2">Baptisms</div>
                    </v-sheet>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card elevation="2">
              <v-card-title class="d-flex align-center pa-3 pa-sm-4">
                <v-icon class="me-2" color="info" :size="$vuetify.display.xs ? 'small' : 'default'">mdi-information</v-icon>
                <span class="text-h6 text-sm-h5">Selected Date Info</span>
              </v-card-title>
              <v-card-text class="pa-2 pa-sm-3">
                <div v-if="selectedDate">
                  <v-alert type="info" variant="tonal" class="mb-3" density="compact">
                    <strong>Selected:</strong> 
                    <span class="d-block d-sm-inline mt-1 mt-sm-0">
                      {{ new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: $vuetify.display.xs ? 'short' : 'long', 
                        year: 'numeric', 
                        month: $vuetify.display.xs ? 'short' : 'long', 
                        day: 'numeric' 
                      }) }}
                    </span>
                  </v-alert>
                  
                  <!-- Events para sa selected date -->
                  <div v-if="events.filter(e => e.date === selectedDate.toISOString().split('T')[0]).length > 0">
                    <h4 class="text-body-1 text-sm-h6 mb-2">Events on this date:</h4>
                    <v-chip
                      v-for="event in events.filter(e => e.date === selectedDate.toISOString().split('T')[0])"
                      :key="event.id"
                      :color="event.color"
                      class="ma-1"
                      :size="$vuetify.display.xs ? 'x-small' : 'small'"
                    >
                      {{ event.title }}
                    </v-chip>
                  </div>
                  <v-alert v-else type="warning" variant="tonal" density="compact">
                    No events scheduled for this date
                  </v-alert>
                </div>
                <v-alert v-else type="default" variant="tonal" density="compact">
                  Select a date from the calendar to view event details
                </v-alert>
              </v-card-text>
            </v-card>
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
