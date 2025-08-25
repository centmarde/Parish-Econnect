<!-- src/components/dialogs/TermsDialog.vue -->
<template>
  <v-dialog :model-value="isOpen" @update:model-value="updateIsOpen" max-width="800" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center bg-primary text-white">
        <v-icon class="me-2" color="white">mdi-file-document-outline</v-icon>
        Terms of Service
      </v-card-title>

      <v-card-text class="pa-6" style="height: 500px">
        <div class="terms-content">
          <h3 class="text-h6 mb-3 text-primary">Parish Event Booking System - Terms of Service</h3>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">1. Acceptance of Terms</h4>
            <p class="text-body-2">
              By accessing and using the Parish Event Booking System, you accept and agree to be
              bound by the terms and provision of this agreement.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">2. Service Description</h4>
            <p class="text-body-2">
              Our system provides online booking services for parish events including but not
              limited to:
            </p>
            <ul class="text-body-2 ml-4">
              <li>Wedding ceremonies</li>
              <li>Baptism services</li>
              <li>Funeral masses</li>
              <li>Thanksgiving services</li>
              <li>Other religious ceremonies</li>
            </ul>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">3. User Responsibilities</h4>
            <p class="text-body-2">Users agree to:</p>
            <ul class="text-body-2 ml-4">
              <li>Provide accurate and complete information when making bookings</li>
              <li>Respect the sacred nature of the parish and its services</li>
              <li>Arrive on time for scheduled appointments</li>
              <li>
                Notify the parish office of any changes or cancellations at least 48 hours in
                advance
              </li>
              <li>Comply with all parish guidelines and requirements</li>
            </ul>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">4. Booking Policies</h4>
            <ul class="text-body-2 ml-4">
              <li>All bookings are subject to parish approval and availability</li>
              <li>Required documents must be submitted before the scheduled date</li>
              <li>Fees and donations are as determined by parish policy</li>
              <li>
                The parish reserves the right to reschedule or cancel services due to unforeseen
                circumstances
              </li>
            </ul>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">5. Account Security</h4>
            <p class="text-body-2">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">6. Limitation of Liability</h4>
            <p class="text-body-2">
              The parish and its staff shall not be liable for any indirect, incidental, special, or
              consequential damages arising from the use of this service.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">7. Modifications</h4>
            <p class="text-body-2">
              The parish reserves the right to modify these terms at any time. Users will be
              notified of significant changes.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">8. Contact Information</h4>
            <p class="text-body-2">
              For questions regarding these terms, please contact the parish office during regular
              business hours.
            </p>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" @click="updateIsOpen(false)">I Understand</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['update:isOpen'])

const updateIsOpen = (value) => {
  emit('update:isOpen', value)
}
</script>

<style scoped>
.terms-content {
  line-height: 1.6;
}
.terms-content h4 {
  color: #1976d2;
  margin-top: 1rem;
}
.terms-content ul {
  margin-bottom: 1rem;
}
.terms-content li {
  margin-bottom: 0.5rem;
}
</style>
