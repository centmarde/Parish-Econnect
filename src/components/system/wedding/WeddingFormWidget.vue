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
      <v-icon start>mdi-heart</v-icon>
      Step 1: Bride & Groom Information
    </v-card-title>

    <!-- Bride's Information -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="pink" variant="outlined">
        <v-icon start>mdi-account-heart</v-icon>
        Bride's Information
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.bride_firstname"
          :rules="nameRules"
          label="Bride First name"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.bride_lastname"
          :rules="nameRules"
          label="Bride Last name"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>

    <!-- Groom's Information -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="blue" variant="outlined">
        <v-icon start>mdi-account-tie</v-icon>
        Groom's Information
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.groom_firstname"
          :rules="nameRules"
          label="Groom First name"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="formData.groom_lastname"
          :rules="nameRules"
          label="Groom Last name"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>

    <!-- Wedding Date & Time -->
    <v-divider thickness="2" class="my-4">
      <v-chip color="purple" variant="outlined">
        <v-icon start>mdi-calendar-heart</v-icon>
        Wedding Date & Time
      </v-chip>
    </v-divider>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.wedding_date"
          :rules="dateRules"
          type="date"
          label="Select date for the wedding"
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
          label="Wedding start time"
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
          label="Wedding end time"
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
