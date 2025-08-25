<!-- src/components/dialogs/PrivacyDialog.vue -->
<template>
  <v-dialog :model-value="isOpen" @update:model-value="updateIsOpen" max-width="800" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center bg-primary text-white">
        <v-icon class="me-2" color="white">mdi-shield-account</v-icon>
        Privacy Policy
      </v-card-title>

      <v-card-text class="pa-6" style="height: 500px">
        <div class="privacy-content">
          <h3 class="text-h6 mb-3 text-primary">Parish Event Booking System - Privacy Policy</h3>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">1. Information We Collect</h4>
            <p class="text-body-2">We collect the following information to provide our services:</p>
            <ul class="text-body-2 ml-4">
              <li>
                <strong>Personal Information:</strong> Name, email address, phone number, address
              </li>
              <li>
                <strong>Event Details:</strong> Service type, preferred dates, special requirements
              </li>
              <li>
                <strong>Religious Information:</strong> Baptismal records, marriage certificates
                (when applicable)
              </li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            </ul>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">2. How We Use Your Information</h4>
            <p class="text-body-2">Your information is used to:</p>
            <ul class="text-body-2 ml-4">
              <li>Process and manage your service bookings</li>
              <li>Communicate with you about your appointments</li>
              <li>Maintain parish records as required by canon law</li>
              <li>Send important updates about parish services</li>
              <li>Improve our booking system and services</li>
            </ul>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">3. Information Sharing</h4>
            <p class="text-body-2">
              We do not sell, trade, or rent your personal information to third parties. Information
              may be shared only:
            </p>
            <ul class="text-body-2 ml-4">
              <li>With parish staff directly involved in your service</li>
              <li>With diocesan authorities when required by canon law</li>
              <li>When required by law or legal process</li>
              <li>With your explicit consent</li>
            </ul>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">4. Data Security</h4>
            <p class="text-body-2">
              We implement appropriate security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. This includes
              encryption of sensitive data and secure server infrastructure.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">5. Data Retention</h4>
            <p class="text-body-2">
              Personal information is retained in accordance with canon law requirements and parish
              record-keeping policies. Sacramental records are maintained permanently as required by
              Church law.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">6. Your Rights</h4>
            <p class="text-body-2">You have the right to:</p>
            <ul class="text-body-2 ml-4">
              <li>Access your personal information</li>
              <li>Request corrections to inaccurate data</li>
              <li>Request deletion of non-essential data</li>
              <li>Opt-out of non-essential communications</li>
              <li>File a complaint with relevant authorities</li>
            </ul>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">7. Cookies and Tracking</h4>
            <p class="text-body-2">
              Our website uses essential cookies to maintain your session and improve user
              experience. We do not use tracking cookies for advertising purposes.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">8. Children's Privacy</h4>
            <p class="text-body-2">
              For services involving minors (such as baptisms), we collect only necessary
              information and require parental consent for all bookings.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">9. Contact Us</h4>
            <p class="text-body-2">
              For privacy-related questions or to exercise your rights, please contact our parish
              office. We will respond to your request within 30 days.
            </p>
          </div>

          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-2">10. Policy Updates</h4>
            <p class="text-body-2">
              This privacy policy may be updated periodically. We will notify users of significant
              changes through email or system notifications.
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
.privacy-content {
  line-height: 1.6;
}
.privacy-content h4 {
  color: #1976d2;
  margin-top: 1rem;
}
.privacy-content ul {
  margin-bottom: 1rem;
}
.privacy-content li {
  margin-bottom: 0.5rem;
}
</style>
