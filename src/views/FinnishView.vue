<script setup>
import { ref, onMounted } from 'vue'
import NavBar2 from '@/components/layout/NavBar2.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import AppBar from '@/components/layout/AppBar.vue'
import { useWeddingStore } from '@/stores/weddingBookingData.js'
import { generateReferenceNumber } from '@/views/contWedding/composables/refInsert'

const weddingStore = useWeddingStore()

// Reference number para sa user
const referenceNumber = ref('')
const isLoading = ref(true)
const error = ref('')

// Get reference number from recent booking o generate fallback
const loadReferenceNumber = async () => {
  try {
    isLoading.value = true
    
    // Try to get reference number from recent booking
    const dbRefNumber = await weddingStore.getRecentBookingReferenceNumber()
    
    if (dbRefNumber) {
      referenceNumber.value = dbRefNumber
      console.log('Using database reference number:', dbRefNumber)
    } else {
      // Fallback: generate new reference number if wala sa database
      referenceNumber.value = generateReferenceNumber()
      console.log('Using generated fallback reference number:', referenceNumber.value)
    }
  } catch (err) {
    console.error('Error loading reference number:', err)
    error.value = 'Failed to load reference number'
    // Generate fallback reference number
    referenceNumber.value = generateReferenceNumber()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadReferenceNumber()
})
</script>

<template>
  <PreloaderView></PreloaderView>
  <NavBar2>
    <template #content>
      <v-container class="d-flex justify-center align-center min-vh-100">
        <v-row justify="center">
          <v-col cols="12" sm="10" md="8" lg="6" xl="5">
            <div class="pa-8 text-center">
              <!-- Success Icon -->
              <v-icon icon="mdi-check-circle" size="80" color="success" class="mb-4" />

              <!-- Main Title -->
              <v-card-title class="text-h4 text-success font-weight-bold mb-4">
                Congratulations!
              </v-card-title>

              <!-- Subtitle -->
              <v-card-subtitle class="text-h6 text-grey-darken-1 mb-6">
                Nalang nakompleto ang inyong form submission
              </v-card-subtitle>

              <!-- Success Message -->
              <v-card-text class="text-body-1 text-grey-darken-2 mb-6">
                <p class="mb-4">
                  Salamat sa pag-submit sa inyong application! Ang inyong request kay na-receive na
                  ug gi-process na karon.
                </p>
                <p class="mb-4">
                  Makatanggap mo ug notification email o text message kung ready na ang inyong
                  appointment o kung naa pay additional requirements.
                </p>
                <p class="text-primary font-weight-medium">
                  Palihug i-check ang inyong email regularly para sa updates.
                </p>
              </v-card-text>

              <!-- Reference Number -->
              <v-card class="ma-4 pa-4 " rounded="lg" flat>
                <v-card-text class="text-center">
                  <div class="text-caption text-grey-darken-1 mb-1">Reference Number</div>
                  
                  <!-- Loading state -->
                  <div v-if="isLoading" class="d-flex justify-center align-center py-2">
                    <v-progress-circular 
                      indeterminate 
                      size="24" 
                      color="primary"
                      class="me-2"
                    />
                    <span class="text-body-2 text-grey-darken-1">Loading reference number...</span>
                  </div>
                  
                  <!-- Reference number display -->
                  <div v-else-if="referenceNumber && !error" class="text-h6 font-weight-bold text-primary">
                    {{ referenceNumber }}
                  </div>
                  
                  <!-- Error state -->
                  <div v-else-if="error" class="text-body-2 text-error">
                    {{ error }}
                  </div>
                  
                  <!-- Fallback -->
                  <div v-else class="text-body-2 text-grey-darken-1">
                    Reference number not available
                  </div>
                  
                  <div class="text-caption text-grey-darken-1 mt-1">
                    I-save ni nga reference number para sa future reference
                  </div>
                </v-card-text>
              </v-card>

              <!-- Action Buttons -->
              <v-card-actions class="justify-center mt-6">
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-home"
                  class="ma-2"
                  to="/"
                >
                  Balik sa Home
                </v-btn>

                <v-btn
                  color="success"
                  variant="outlined"
                  size="large"
                  prepend-icon="mdi-calendar-check"
                  class="ma-2"
                  to="/appointments"
                >
                  View Appointments
                </v-btn>
              </v-card-actions>

              <!-- Additional Info -->
              <v-divider class="my-6" />

              <v-card-text class="text-center">
                <v-icon icon="mdi-information" size="small" class="me-2" color="info" />
                <span class="text-caption text-grey-darken-1">
                  For questions o concerns, contact us at the parish office o through our hotline
                </span>
              </v-card-text>
            </div>
          </v-col>
        </v-row>
        <AppBar />
      </v-container>
    </template>
  </NavBar2>
</template>
