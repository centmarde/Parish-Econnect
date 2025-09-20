<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import FormCamera from '@/components/common/FormCamera.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import NavBar2 from '@/components/layout/NavBar2.vue'

import { useCameraThanksGivingUpload } from '@/views/contThanksGiving/composables/cameraSent'

const theme = useTheme()
const router = useRouter()
const { updateThanksGivingBookingWithImages } = useCameraThanksGivingUpload()

// Loading state para sa submission
const isSubmitting = ref(false)
const submissionError = ref('')

// ThanksGiving PDF documents data na same sa ContThanksGivingView
const thanksgivingPDFs = [
  {
    name: 'Certificate of Confirmation',
    filename: 'certificate_of_confirmation.pdf',
    description: 'Certificate form para sa confirmation service',
    icon: 'mdi-certificate',
    color: 'primary',
    category: 'Certificate',
  },
]

// Reactive state para sa each PDF document images
const documentImages = ref({
  certificate_of_confirmation: []
})

// Convert filename to reactive key
const getDocumentKey = (filename) => {
  return filename.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '_')
}

// Check if all required documents have images
const allDocumentsHaveImages = computed(() => {
  return thanksgivingPDFs.every(pdf => {
    const key = getDocumentKey(pdf.filename)
    return documentImages.value[key] && documentImages.value[key].length > 0
  })
})

// Count total uploaded images
const totalUploadedImages = computed(() => {
  return Object.values(documentImages.value).reduce((total, images) => total + images.length, 0)
})

// Computed para sa theme-aware styling
const cardVariant = computed(() => theme.global.current.value.dark ? 'tonal' : 'elevated')
const headerGradient = computed(() =>
  theme.global.current.value.dark
    ? 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)'
    : 'linear-gradient(135deg, #424242 0%, #616161 100%)'
)

// Navigation functions
const goBack = () => {
  router.back()
}

const continueToNext = async () => {
  if (!allDocumentsHaveImages.value || isSubmitting.value) {
    return
  }

  try {
    isSubmitting.value = true
    submissionError.value = ''

    // Submit thanksgiving documents to storage and update database
    console.log('Submitting thanksgiving documents...', documentImages.value)
    const result = await updateThanksGivingBookingWithImages(documentImages.value)

    if (result.error) {
      submissionError.value = result.error
      console.error('Document submission error:', result.error)
      return
    }

    console.log('Documents submitted successfully:', result.data)

    // Log reference number if generated
    if (result.referenceNumber) {
      console.log('Reference number generated:', result.referenceNumber)
    }

    // Navigate to Finnish page where reference number will be displayed
    router.push('/finnish')
  } catch (error) {
    console.error('Submission error:', error)
    submissionError.value = 'Failed to submit documents. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Check if specific document has images
const hasDocumentImages = (filename) => {
  const key = getDocumentKey(filename)
  return documentImages.value[key] && documentImages.value[key].length > 0
}

// Get image count for specific document
const getDocumentImageCount = (filename) => {
  const key = getDocumentKey(filename)
  return documentImages.value[key] ? documentImages.value[key].length : 0
}
</script>

<template>
  <PreloaderView />

  <NavBar2>
    <template #content>
      <v-container class="pa-4" fluid>
        <!-- Header Section with gradient background -->
        <v-card
          :variant="cardVariant"
          class="mb-6 overflow-hidden"
          :style="{ background: headerGradient }"
        >
          <v-card-text class="text-center pa-8">
            <v-avatar
              size="80"
              color="white"
              class="mb-4 elevation-4"
            >
              <v-icon size="48" color="grey-darken-2">mdi-certificate</v-icon>
            </v-avatar>

            <h1 class="text-h4 font-weight-bold text-white mb-2">
              Upload Thanksgiving Documents
            </h1>
            <p class="text-h6 text-white opacity-90 mb-0">
              Take photos ng inyong completed forms
            </p>
          </v-card-text>
        </v-card>

             <!-- Tips Card -->
        <v-card variant="outlined" class="mt-4">
          <v-list density="compact">
            <v-list-subheader class="text-primary font-weight-medium">
              📸 Photo Tips
            </v-list-subheader>
            <v-list-item
              prepend-icon="mdi-lightbulb-outline"
              title="Good lighting"
              subtitle="Use natural light or bright indoor lighting"
              density="compact"
            />
            <v-list-item
              prepend-icon="mdi-focus-field"
              title="Clear focus"
              subtitle="Make sure all text is readable"
              density="compact"
            />
            <v-list-item
              prepend-icon="mdi-crop-square"
              title="Full document"
              subtitle="Include the entire document in the frame"
              density="compact"
            />
          </v-list>
        </v-card>

        <!-- Progress Indicator -->
        <v-card variant="outlined" class="mb-6">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-between mb-2">
              <span class="text-subtitle-1 font-weight-medium">Upload Progress</span>
              <span class="text-body-2 text-medium-emphasis">
                {{ totalUploadedImages }} / {{ thanksgivingPDFs.length }} documents
              </span>
            </div>
            <v-progress-linear
              :model-value="(totalUploadedImages / thanksgivingPDFs.length) * 100"
              color="primary"
              height="8"
              rounded
            />
          </v-card-text>
        </v-card>

        <!-- Info Alert -->
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6"
          prepend-icon="mdi-information-outline"
        >
          <v-alert-title class="text-h6 mb-2">Instructions</v-alert-title>
          Kuhain ang mga document na na-download ninyo at na-fill out na.
          Make sure na clear ug readable ang mga text sa documents.
        </v-alert>

        <!-- Document Upload Sections -->
        <div class="document-sections">
          <v-card
            v-for="pdf in thanksgivingPDFs"
            :key="pdf.filename"
            :variant="cardVariant"
            class="mb-6"
            :class="{ 'border-success': hasDocumentImages(pdf.filename) }"
          >
            <v-card-title class="d-flex align-center pa-4">
              <v-avatar
                size="40"
                :color="pdf.color"
                class="me-3"
              >
                <v-icon :icon="pdf.icon" color="white" />
              </v-avatar>
              <div class="flex-grow-1">
                <h3 class="text-h6 mb-1">{{ pdf.name }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-0">{{ pdf.description }}</p>
              </div>
              <v-chip
                v-if="hasDocumentImages(pdf.filename)"
                color="success"
                variant="tonal"
                size="small"
              >
                <v-icon start>mdi-check</v-icon>
                {{ getDocumentImageCount(pdf.filename) }} photo{{ getDocumentImageCount(pdf.filename) > 1 ? 's' : '' }}
              </v-chip>
            </v-card-title>

            <v-card-text class="pa-4 pt-0">
              <FormCamera
                v-model="documentImages[getDocumentKey(pdf.filename)]"
                :label="`Upload ${pdf.name}`"
                :hint="`Take clear photos of your completed ${pdf.name.toLowerCase()}`"
                multiple
                required
              />
            </v-card-text>
          </v-card>
        </div>

        <!-- Submission Error Alert -->
        <v-expand-transition>
          <v-alert
            v-if="submissionError"
            type="error"
            variant="tonal"
            class="mb-6"
            dismissible
            @click:close="submissionError = ''"
          >
            <v-alert-title>Submission Error</v-alert-title>
            {{ submissionError }}
          </v-alert>
        </v-expand-transition>

        <!-- Validation Summary -->
        <v-expand-transition>
          <v-card
            v-if="!allDocumentsHaveImages && totalUploadedImages > 0"
            variant="outlined"
            color="warning"
            class="mb-6"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="warning">mdi-alert-outline</v-icon>
                <div>
                  <div class="font-weight-medium">Incomplete Upload</div>
                  <div class="text-body-2">
                    Please upload photos for all required documents before continuing.
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Success Summary -->
        <v-expand-transition>
          <v-card
            v-if="allDocumentsHaveImages"
            variant="tonal"
            color="success"
            class="mb-6"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="success">mdi-check-circle</v-icon>
                <div>
                  <div class="font-weight-medium">All Documents Uploaded!</div>
                  <div class="text-body-2">
                    Ready to submit your thanksgiving mass application.
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Navigation Actions -->
        <v-card variant="outlined" class="mt-6">
          <v-card-text class="pa-6">
            <div class="d-flex flex-column flex-sm-row gap-3 justify-space-between align-center">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                @click="goBack"
                :disabled="isSubmitting"
              >
                Back
              </v-btn>

              <div class="text-center flex-shrink-0">
                <div v-if="!allDocumentsHaveImages" class="text-body-2 text-medium-emphasis mb-2">
                  Upload all documents to continue
                </div>
                <div v-else class="text-body-2 text-success mb-2">
                  Ready to submit
                </div>
              </div>

              <v-btn
                color="primary"
                prepend-icon="mdi-check"
                :disabled="!allDocumentsHaveImages || isSubmitting"
                :loading="isSubmitting"
                @click="continueToNext"
              >
                {{ isSubmitting ? 'Submitting...' : 'Submit Documents' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>


      </v-container>


    </template>
  </NavBar2>
</template>

<style scoped>
/* Theme-aware styles following Vuetify patterns */
.document-sections {
  position: relative;
}

.border-success {
  border: 2px solid rgb(var(--v-theme-success)) !important;
}

/* Card hover effects */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  transform: translateY(-2px);
}

/* Progress styling enhancements */
.v-progress-linear {
  transition: all 0.3s ease;
}

/* Responsive adjustments para sa mobile */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }

  .gap-3 {
    gap: 12px !important;
  }
}

/* Ensure proper button spacing */
.gap-3 {
  gap: 16px;
}

/* Subtle animation for status changes */
.v-chip {
  transition: all 0.3s ease;
}

/* Ensure consistent card spacing */
.v-card + .v-card {
  margin-top: 24px;
}
</style>
