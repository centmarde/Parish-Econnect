<script setup lang="ts">
import { ref } from 'vue'
import CalendarDialog from './CalendarDialog.vue'

// Dialog state
const showCalendarDialog = ref(false)

// Handle calendar icon click
const handleCalendarClick = () => {
  showCalendarDialog.value = true
}
</script>

<template>
  <!-- Fixed Calendar Floating Action Button -->
  <v-fab
    color="primary"
    size="large"
    icon="mdi-calendar-month"
    location="bottom end"
    app
    elevation="8"
    @click="handleCalendarClick"
  />

  <!-- Calendar Dialog Component -->
  <CalendarDialog v-model="showCalendarDialog" />
</template>
