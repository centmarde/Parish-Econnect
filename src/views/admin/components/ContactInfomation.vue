<template>
  <div class="contact-info pa-4">
    <div class="contact-header">
      <h3 class="contact-title text-center mb-4">Contact Information</h3>
    </div>

    <v-row justify="center">
      <!-- Address Card -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="contact-card glass-card" elevation="0" height="180">
          <v-card-text class="pa-4 d-flex flex-column h-100">
            <div class="contact-item d-flex align-start mb-3">
              <v-icon icon="mdi-map-marker" class="contact-icon me-3" color="primary" size="large"></v-icon>
              <div class="contact-details flex-grow-1">
                <h4 class="contact-label text-h6 mb-2">Address</h4>
                <p class="contact-text text-body-2">
                  123 Parish Street<br>
                  City, Province 1234<br>
                  Philippines
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Phone Card -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="contact-card glass-card" elevation="0" height="180">
          <v-card-text class="pa-4 d-flex flex-column h-100">
            <div class="contact-item d-flex align-start mb-3">
              <v-icon icon="mdi-phone" class="contact-icon me-3" color="success" size="large"></v-icon>
              <div class="contact-details flex-grow-1">
                <h4 class="contact-label text-h6 mb-2">Phone</h4>
                <p class="contact-text text-body-2">
                  <a href="tel:+639123456789" class="contact-link text-decoration-none">+63 912 345 6789</a><br>
                  <a href="tel:+632123456789" class="contact-link text-decoration-none">+63 2 123 456 789</a>
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Email Card -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="contact-card glass-card" elevation="0" height="180">
          <v-card-text class="pa-4 d-flex flex-column h-100">
            <div class="contact-item d-flex align-start mb-3">
              <v-icon icon="mdi-email" class="contact-icon me-3" color="info" size="large"></v-icon>
              <div class="contact-details flex-grow-1">
                <h4 class="contact-label text-h6 mb-2">Email</h4>
                <p class="contact-text text-body-2">
                  <a href="mailto:info@parish.com" class="contact-link text-decoration-none">info@parish.com</a><br>
                  <a href="mailto:events@parish.com" class="contact-link text-decoration-none">events@parish.com</a>
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Office Hours Card -->
      <v-col cols="12" sm="6" md="6">
        <v-card class="contact-card glass-card" elevation="0" height="180">
          <v-card-text class="pa-4 d-flex flex-column h-100">
            <div class="contact-item d-flex align-start mb-3">
              <v-icon icon="mdi-clock-outline" class="contact-icon me-3" color="warning" size="large"></v-icon>
              <div class="contact-details flex-grow-1">
                <h4 class="contact-label text-h6 mb-2">Office Hours</h4>
                <p class="contact-text text-body-2">
                  Monday - Friday: 8:00 AM - 5:00 PM<br>
                  Saturday: 8:00 AM - 12:00 PM<br>
                  Sunday: After Mass Services
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Mass Schedule Card -->
      <v-col cols="12" sm="6" md="6">
        <v-card class="contact-card glass-card" elevation="0" height="180">
          <v-card-text class="pa-4 d-flex flex-column h-100">
            <div class="contact-item d-flex align-start mb-3">
              <v-icon icon="mdi-church" class="contact-icon me-3" color="purple" size="large"></v-icon>
              <div class="contact-details flex-grow-1">
                <h4 class="contact-label text-h6 mb-2">Mass Schedule</h4>
                <p class="contact-text text-body-2">
                  Weekdays: 6:00 AM, 6:00 PM<br>
                  Saturday: 6:00 AM, 6:00 PM<br>
                  Sunday: 6:00 AM, 8:00 AM, 10:00 AM, 6:00 PM
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
// No specific script needed for static contact information
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.45);
}

.contact-label {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.contact-text {
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.5;
}

.contact-link {
  color: inherit;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: #1976d2;
}
</style>
