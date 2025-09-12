<script setup>
import { ref } from 'vue'
import AlertNotification from '@/components/common/AlertNotification.vue'
import BaptismFormWidget from '@/components/system/baptism/BaptismFormWidget.vue'
import { useBaptismForm } from '@/components/system/baptism/composables/baptismDataSubmit.js'

// Use baptism form composable
const {
  formData,
  formAction,
  nameRules,
  dateRules,
  timeRules,
  isFormValid,
  showValidationWarning,
  submitBaptismBooking,
} = useBaptismForm()

// Form reference
const refVform = ref()

// Handle form submission
const onFormSubmit = async () => {
  const success = await submitBaptismBooking(refVform)
  if (success) {
    console.log('Baptism booking submitted successfully!')
  }
}
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
  />

  <v-container class="pa-4">
    <v-form ref="refVform" @submit.prevent="onFormSubmit">
      <!-- Baptism Form Widget -->
      <BaptismFormWidget
        v-model="formData"
        :name-rules="nameRules"
        :date-rules="dateRules"
        :time-rules="timeRules"
      />

      <!-- Submit Button -->
      <v-card class="pa-4 mt-4" rounded="lg" elevation="2">
        <v-row class="justify-center">
          <v-col cols="12" md="6">
            <v-btn
              type="submit"
              :loading="formAction.formProcess"
              :disabled="formAction.formProcess || !isFormValid"
              color="primary"
              size="large"
              block
              rounded="lg"
              class="text-none py-3"
            >
              <v-icon start>mdi-baby-face</v-icon>
              Submit Baptism Booking
            </v-btn>
          </v-col>
        </v-row>

        <!-- Validation warning -->
        <v-row v-if="showValidationWarning" class="justify-center mt-2">
          <v-col cols="12" md="6">
            <v-alert
              type="warning"
              variant="tonal"
              density="compact"
              class="text-center"
            >
              Please fill in all required fields
            </v-alert>
          </v-col>
        </v-row>
      </v-card>
    </v-form>
  </v-container>
</template>

<style scoped>
/* Responsive adjustments para sa mobile */
@media (max-width: 600px) {
  .v-container {
    padding: 8px !important;
  }
}
</style>
