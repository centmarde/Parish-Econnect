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
</script>

<template>
  <v-card class="pa-6 mb-4" rounded="lg" elevation="2">
    <v-card-title class="text-h5 text-primary mb-4">
      <v-icon start>mdi-cross</v-icon>
      Step 1: Deceased Information
    </v-card-title>

    <!-- Deceased's Information -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="grey-darken-1" variant="outlined">
        <v-icon start>mdi-account-off</v-icon>
        Deceased's Information
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.deceased_firstname"
          :rules="nameRules"
          label="Deceased First name"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.deceased_lastname"
          :rules="nameRules"
          label="Deceased Last name"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>

    <!-- Funeral Date & Time -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="purple" variant="outlined">
        <v-icon start>mdi-calendar-clock</v-icon>
        Funeral Date & Time
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.funeral_date"
          :rules="dateRules"
          type="date"
          label="Select date for the funeral"
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
          label="Funeral start time"
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
          label="Funeral end time"
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
