<script setup>
import { ref } from 'vue'
import AlertNotification from '@/components/common/AlertNotification.vue'
import OthersFormWidget from '@/components/system/others/OthersFormWidget.vue'
import { useOthersForm } from '@/components/system/others/composables/othersDataSubmit.js'

// Dialog control
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const dialog = ref(props.modelValue)

// Watch for prop changes
const updateDialog = (val) => {
  dialog.value = val
  emit('update:modelValue', val)
}

// Use others form composable
const {
  formData,
  formAction,
  nameRules,
  dateRules,
  timeRules,
  isFormValid,
  showValidationWarning,
  submitOthersBooking,
} = useOthersForm()

// Form reference
const refVform = ref()

// Handle form submission
const onFormSubmit = async () => {
  const success = await submitOthersBooking(refVform)
  if (success) {
    console.log('Others booking submitted successfully!')
    // Close dialog after successful submission
    setTimeout(() => {
      updateDialog(false)
    }, 2000)
  }
}

// Close dialog
const closeDialog = () => {
  updateDialog(false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="updateDialog"
    max-width="900px"
    persistent
    scrollable
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex justify-space-between align-center pa-4 bg-primary">
        <div class="d-flex align-center">
          <v-icon size="28" class="mr-2">mdi-calendar-blank</v-icon>
          <span class="text-h6">Other Event Booking</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDialog"
        />
      </v-card-title>

      <v-card-text class="pa-4">
        <AlertNotification
          :form-success-message="formAction.formSuccessMessage"
          :form-error-message="formAction.formErrorMessage"
        />

        <v-form ref="refVform" @submit.prevent="onFormSubmit">
          <!-- Others Form Widget -->
          <OthersFormWidget
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
                  <v-icon start>mdi-send</v-icon>
                  Submit Booking Request
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
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Responsive adjustments para sa mobile */
@media (max-width: 600px) {
  .v-card-text {
    padding: 8px !important;
  }
}
</style>
