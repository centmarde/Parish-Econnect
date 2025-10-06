<script setup>
import { ref, onMounted } from 'vue'
import NavBar2 from '@/components/layout/NavBar2.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import Calendar from './components/CalendarWidget.vue'
import calendarEvents from './data/calendarData'
import AppBar from '@/components/layout/AppBar.vue'
//import MyForms from '@/components/layout/MyForms.vue'
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
       <!--   <v-row>
            <v-col cols="12">
              <MyForms />
            </v-col>
          </v-row> -->

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
/* Minimal scoped styles - Vuetify utilities handle responsiveness */
</style>
