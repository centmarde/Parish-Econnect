<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  titleRules: {
    type: Array,
    required: true
  },
  organizerRules: {
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
</script>

<template>
  <v-card class="pa-6 mb-4" rounded="lg" elevation="2">
    <v-card-title class="text-h5 text-primary mb-4">
      <v-icon start>mdi-hands-pray</v-icon>
      Step 1: Thanksgiving Event Information
    </v-card-title>

    <!-- Event Information -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="orange-lighten-2" variant="outlined">
        <v-icon start>mdi-celebration</v-icon>
        Event Details
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.title"
          :rules="titleRules"
          label="Event Title"
          prepend-inner-icon="mdi-format-title"
          variant="outlined"
          required
          placeholder="e.g., Family Thanksgiving Mass"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.organizer"
          :rules="organizerRules"
          label="Organizer Name"
          prepend-inner-icon="mdi-account-supervisor"
          variant="outlined"
          required
          placeholder="e.g., Juan Dela Cruz"
        />
      </v-col>
    </v-row>

    <!-- Thanksgiving Date & Time -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="amber" variant="outlined">
        <v-icon start>mdi-calendar-heart</v-icon>
        Thanksgiving Date & Time
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.thanksgiving_date"
          :rules="dateRules"
          type="date"
          label="Select date for thanksgiving"
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
          label="Event start time"
          prepend-inner-icon="mdi-clock-outline"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.ending_time"
          :rules="timeRules"
          type="time"
          label="Event end time"
          prepend-inner-icon="mdi-clock-end"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
/* Responsive adjustments para sa mobile */
@media (max-width: 600px) {
  .v-card {
    margin: 0 !important;
  }
}
</style>
