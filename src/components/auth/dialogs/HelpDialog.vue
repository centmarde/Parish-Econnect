<template>
  <v-dialog :model-value="isOpen" @update:model-value="updateIsOpen" max-width="800" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center bg-primary text-white">
        <v-icon class="me-2" color="white">mdi-help-circle</v-icon>
        Registration Help & Support
      </v-card-title>

      <v-card-text class="pa-6" style="height: 500px">
        <div class="help-content">
          <h3 class="text-h6 mb-4 text-primary">
            <v-icon class="me-2" color="primary">mdi-account-plus</v-icon>
            How to Register for Parish Services
          </h3>

          <v-expansion-panels variant="accordion" class="mb-4">
            <!-- Getting Started -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon class="me-2" color="primary">mdi-rocket-launch</v-icon>
                Getting Started
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="pa-2">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">Step-by-Step Registration:</h4>
                  <ol class="text-body-2">
                    <li class="mb-2">
                      <strong>Fill Personal Information:</strong> Enter your complete name, phone
                      number, email, and address accurately.
                    </li>
                    <li class="mb-2">
                      <strong>Create Secure Password:</strong> Use at least 8 characters with a mix
                      of letters, numbers, and symbols.
                    </li>
                    <li class="mb-2">
                      <strong>Verify Information:</strong> Double-check all details before
                      submitting.
                    </li>
                    <li class="mb-2">
                      <strong>Accept Terms:</strong> Read and accept our Terms of Service and
                      Privacy Policy.
                    </li>
                    <li class="mb-2">
                      <strong>Submit Registration:</strong> Click "Create My Account" to complete
                      registration.
                    </li>
                  </ol>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Account Requirements -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon class="me-2" color="orange">mdi-account-check</v-icon>
                Account Requirements
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="pa-2">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">Required Information:</h4>
                  <v-list dense>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="green" size="small">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2"
                        >Complete legal name (First & Last)</v-list-item-title
                      >
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="green" size="small">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">Valid email address</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="green" size="small">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">Active phone number</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="green" size="small">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">Complete address</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="green" size="small">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">Gender selection</v-list-item-title>
                    </v-list-item>
                  </v-list>

                  <h4 class="text-subtitle-1 font-weight-bold mb-2 mt-4">Password Requirements:</h4>
                  <v-list dense>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="blue" size="small">mdi-shield-check</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2"
                        >Minimum 8 characters long</v-list-item-title
                      >
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="blue" size="small">mdi-shield-check</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2"
                        >Include uppercase letters (A-Z)</v-list-item-title
                      >
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="blue" size="small">mdi-shield-check</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2"
                        >Include lowercase letters (a-z)</v-list-item-title
                      >
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="blue" size="small">mdi-shield-check</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2"
                        >Add at least one number (0-9)</v-list-item-title
                      >
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="blue" size="small">mdi-shield-check</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2"
                        >Include special characters (!@#$%^&*)</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Available Services -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon class="me-2" color="purple">mdi-church</v-icon>
                Available Services
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="pa-2">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">
                    Parish Services You Can Book:
                  </h4>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card variant="tonal" color="primary" class="mb-2">
                        <v-card-text class="pa-3">
                          <div class="d-flex align-center">
                            <v-icon color="primary" class="me-2">mdi-baby-face</v-icon>
                            <div>
                              <div class="font-weight-bold">Baptism</div>
                              <div class="text-caption">Infant & Adult Baptism Services</div>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-card variant="tonal" color="pink" class="mb-2">
                        <v-card-text class="pa-3">
                          <div class="d-flex align-center">
                            <v-icon color="pink" class="me-2">mdi-heart</v-icon>
                            <div>
                              <div class="font-weight-bold">Wedding</div>
                              <div class="text-caption">Marriage Ceremonies</div>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-card variant="tonal" color="orange" class="mb-2">
                        <v-card-text class="pa-3">
                          <div class="d-flex align-center">
                            <v-icon color="orange" class="me-2">mdi-candle</v-icon>
                            <div>
                              <div class="font-weight-bold">Funeral</div>
                              <div class="text-caption">Memorial Services</div>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-card variant="tonal" color="green" class="mb-2">
                        <v-card-text class="pa-3">
                          <div class="d-flex align-center">
                            <v-icon color="green" class="me-2">mdi-hands-pray</v-icon>
                            <div>
                              <div class="font-weight-bold">Thanksgiving</div>
                              <div class="text-caption">Special Thanksgiving Mass</div>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Common Issues -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon class="me-2" color="red">mdi-alert-circle</v-icon>
                Common Issues & Solutions
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="pa-2">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">Troubleshooting:</h4>

                  <v-alert type="warning" variant="tonal" class="mb-3">
                    <v-alert-title>Email Already Exists</v-alert-title>
                    <div class="text-body-2">
                      If you see this error, you may already have an account. Try logging in instead
                      or use the "Forgot Password" option.
                    </div>
                  </v-alert>

                  <v-alert type="error" variant="tonal" class="mb-3">
                    <v-alert-title>Password Too Weak</v-alert-title>
                    <div class="text-body-2">
                      Make sure your password meets all requirements listed above. Use a combination
                      of letters, numbers, and symbols.
                    </div>
                  </v-alert>

                  <v-alert type="info" variant="tonal" class="mb-3">
                    <v-alert-title>Form Validation Errors</v-alert-title>
                    <div class="text-body-2">
                      Check that all required fields are filled correctly. Red text indicates what
                      needs to be fixed.
                    </div>
                  </v-alert>
                  <v-alert type="success" variant="tonal" class="mb-3">
                    <v-alert-title>Registration Successful</v-alert-title>
                    <div class="text-body-2">
                      After successful registration, you'll be redirected to the login page. Use
                      your email and password to sign in.
                    </div>
                  </v-alert>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Contact Support -->
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon class="me-2" color="teal">mdi-phone</v-icon>
                Contact Support
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="pa-2">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">Need Additional Help?</h4>
                  <p class="text-body-2 mb-3">
                    If you're still having trouble with registration, our parish staff is here to
                    help you.
                  </p>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="mb-2">
                        <v-card-text class="pa-3">
                          <div class="d-flex align-center mb-2">
                            <v-icon color="teal" class="me-2">mdi-phone</v-icon>
                            <div class="font-weight-bold">Phone Support</div>
                          </div>
                          <div class="text-body-2">
                            Call us during office hours:<br />
                            <strong>(123) 456-7890</strong><br />
                            Mon-Fri: 9:00 AM - 5:00 PM<br />
                            Sat: 9:00 AM - 12:00 PM
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="mb-2">
                        <v-card-text class="pa-3">
                          <div class="d-flex align-center mb-2">
                            <v-icon color="teal" class="me-2">mdi-email</v-icon>
                            <div class="font-weight-bold">Email Support</div>
                          </div>
                          <div class="text-body-2">
                            Send us an email:<br />
                            <strong>support@parish.org</strong><br />
                            We respond within 24 hours<br />
                            during business days
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>

                  <v-card variant="tonal" color="blue" class="mt-3">
                    <v-card-text class="pa-3">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="blue" class="me-2">mdi-map-marker</v-icon>
                        <div class="font-weight-bold">Visit Us In Person</div>
                      </div>
                      <div class="text-body-2">
                        Parish Office<br />
                        123 Church Street<br />
                        Your City, State 12345<br />
                        <strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Quick Tips -->
          <v-card variant="tonal" color="indigo" class="mt-4">
            <v-card-text class="pa-4">
              <h4 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
                <v-icon color="indigo" class="me-2">mdi-lightbulb</v-icon>
                Quick Tips for Success
              </h4>
              <v-list dense>
                <v-list-item class="pa-1">
                  <template #prepend>
                    <v-icon color="indigo" size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2"
                    >Use a valid email address you check regularly</v-list-item-title
                  >
                </v-list-item>
                <v-list-item class="pa-1">
                  <template #prepend>
                    <v-icon color="indigo" size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2"
                    >Write down your password in a safe place</v-list-item-title
                  >
                </v-list-item>
                <v-list-item class="pa-1">
                  <template #prepend>
                    <v-icon color="indigo" size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2"
                    >Double-check your phone number for appointment confirmations</v-list-item-title
                  >
                </v-list-item>
                <v-list-item class="pa-1">
                  <template #prepend>
                    <v-icon color="indigo" size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2"
                    >Keep your contact information updated</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" @click="updateIsOpen(false)">
          <v-icon class="me-2">mdi-check</v-icon>
          Got It, Thanks!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineEmits } from 'vue'

defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['update:isOpen'])

const updateIsOpen = (value) => {
  emit('update:isOpen', value)
}
</script>

<style scoped>
.help-content {
  line-height: 1.6;
}
</style>
