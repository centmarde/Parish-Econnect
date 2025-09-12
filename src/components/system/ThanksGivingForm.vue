<script setup>
import { ref } from 'vue'
import AlertNotification from '@/components/common/AlertNotification.vue'
import ThanksGivingFormWidget from '@/components/system/thanksGiving/ThanksGivingFormWidget.vue'
import { useThanksGivingForm } from '@/components/system/thanksGiving/composables/thanksGivingDataSubmit.js'

// Use thanksgiving form composable
const {
  formData,
  formAction,
  titleRules,
  organizerRules,
  dateRules,
  timeRules,
  isFormValid,
  showValidationWarning,
  submitThanksGivingBooking,
} = useThanksGivingForm()

// Form reference
const refVform = ref()

// Handle form submission
const onFormSubmit = async () => {
  const success = await submitThanksGivingBooking(refVform)
  if (success) {
    console.log('Thanksgiving booking submitted successfully!')
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
      <!-- Thanksgiving Form Widget -->
      <ThanksGivingFormWidget
        v-model="formData"
        :title-rules="titleRules"
        :organizer-rules="organizerRules"
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
              <v-icon start>mdi-hands-pray</v-icon>
              Submit Thanksgiving Booking
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
