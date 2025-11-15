<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  nameRules: {
    type: Array,
    required: true
  },
  dateRules: {
    type: Array,
    required: true
  },
  timeRules: {
    type: Array,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Computed para sa two-way binding
const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Get today's date in YYYY-MM-DD format
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})
</script>

<template>
  <v-card class="pa-6 mb-4" rounded="lg" elevation="2">
    <v-card-title class="text-h5 text-primary mb-4">
      <v-icon start>mdi-calendar-blank</v-icon>
      Other Event Information
    </v-card-title>

    <!-- Event Details -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="grey-darken-1" variant="outlined">
        <v-icon start>mdi-information</v-icon>
        Event Details
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12">
        <v-text-field
          v-model="formData.title"
          :rules="nameRules"
          label="Event Title"
          prepend-inner-icon="mdi-format-title"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="formData.description"
          :rules="nameRules"
          label="Event Description"
          prepend-inner-icon="mdi-text"
          variant="outlined"
          rows="3"
          required
        />
      </v-col>
    </v-row>

    <!-- Event Date & Time -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="purple" variant="outlined">
        <v-icon start>mdi-calendar-clock</v-icon>
        Event Date & Time
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.date"
          :rules="dateRules"
          :min="today"
          type="date"
          label="Select date for the event"
          prepend-inner-icon="mdi-calendar"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.starting_time"
          :rules="timeRules"
          type="time"
          label="Starting Time"
          prepend-inner-icon="mdi-clock-start"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.ending_time"
          :rules="timeRules"
          type="time"
          label="Ending Time"
          prepend-inner-icon="mdi-clock-end"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
/* Optional styles */
</style>
