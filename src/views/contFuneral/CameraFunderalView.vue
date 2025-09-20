<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import FormCamera from '@/components/common/FormCamera.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import NavBar2 from '@/components/layout/NavBar2.vue'

import { useCameraFuneralUpload } from '@/views/contFuneral/composables/cameraSent'

const theme = useTheme()
const router = useRouter()
const { updateFuneralBookingWithImages } = useCameraFuneralUpload()

// Loading state para sa submission
const isSubmitting = ref(false)
const submissionError = ref('')

// Funeral PDF documents data na same sa ContFuneralView
const funeralPDFs = [
  {
    name: 'Permission of Funeral',
    filename: 'permission_of_funeral.pdf',
    description: 'Permission form para sa funeral service',
    icon: 'mdi-church',
    color: 'primary',
    category: 'Permission',
  },
]

// Reactive state para sa each PDF document images
const documentImages = ref({
  permission_of_funeral: []
})

// Convert filename to reactive key
const getDocumentKey = (filename) => {
  return filename.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '_')
}

// Check if all required documents have images
const allDocumentsHaveImages = computed(() => {
  return funeralPDFs.every(pdf => {
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

    // Submit funeral documents to storage and update database
    console.log('Submitting funeral documents...', documentImages.value)
    const result = await updateFuneralBookingWithImages(documentImages.value)

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
              <v-icon size="48" color="grey-darken-2">mdi-camera</v-icon>
            </v-avatar>

            <h1 class="text-h4 font-weight-bold text-white mb-2">
              Upload Funeral Documents
            </h1>
            <p class="text-h6 text-white opacity-90 mb-0">
              Kuhain ang mga filled-out forms gamit ang inyong camera
            </p>
          </v-card-text>
        </v-card>

             <!-- Tips Card -->
        <v-card variant="outlined" class="mt-4">
          <v-list density="compact">
            <v-list-subheader class="text-primary font-weight-medium">
              <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
              Photography Tips
            </v-list-subheader>
            <v-list-item
              v-for="tip in ['Make sure documents are well-lit', 'Keep documents flat and straight', 'Capture entire document in frame', 'Avoid shadows and glare']"
              :key="tip"
              class="text-body-2"
              density="compact"
            >
              <template #prepend>
                <v-icon size="16" color="success">mdi-check</v-icon>
              </template>
              <v-list-item-title>{{ tip }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Progress Indicator -->
        <v-card variant="outlined" class="mb-6">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2 font-weight-medium">Upload Progress</span>
              <span class="text-body-2 text-medium-emphasis">{{ totalUploadedImages }} / {{ funeralPDFs.length }} documents</span>
            </div>

            <v-progress-linear
              :model-value="(totalUploadedImages / funeralPDFs.length) * 100"
              color="primary"
              height="8"
              rounded
              striped
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
            v-for="pdf in funeralPDFs"
            :key="pdf.filename"
            :variant="hasDocumentImages(pdf.filename) ? 'tonal' : 'outlined'"
            :color="hasDocumentImages(pdf.filename) ? 'success' : undefined"
            class="mb-4"
            :class="{ 'border-success': hasDocumentImages(pdf.filename) }"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <v-avatar
                  :color="hasDocumentImages(pdf.filename) ? 'success' : pdf.color"
                  class="mr-4"
                  size="56"
                >
                  <v-icon
                    :icon="hasDocumentImages(pdf.filename) ? 'mdi-check' : pdf.icon"
                    size="28"
                    color="white"
                  />
                </v-avatar>

                <div class="flex-grow-1">
                  <h3 class="text-h6 font-weight-medium mb-1">
                    {{ pdf.name }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ pdf.description }}
                  </p>

                  <!-- Status chip -->
                  <v-chip
                    :color="hasDocumentImages(pdf.filename) ? 'success' : 'grey'"
                    :variant="hasDocumentImages(pdf.filename) ? 'tonal' : 'outlined'"
                    size="small"
                    class="mt-2"
                  >
                    <v-icon
                      :icon="hasDocumentImages(pdf.filename) ? 'mdi-check-circle' : 'mdi-clock-outline'"
                      size="16"
                      start
                    />
                    {{ hasDocumentImages(pdf.filename)
                      ? `${getDocumentImageCount(pdf.filename)} image${getDocumentImageCount(pdf.filename) > 1 ? 's' : ''} uploaded`
                      : 'Pending upload'
                    }}
                  </v-chip>
                </div>
              </div>

              <!-- Camera component para sa document -->
              <FormCamera
                :label="pdf.name"
                :multiple="false"
                v-model="documentImages[getDocumentKey(pdf.filename)]"
                class="mt-4"
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
            closable
            @click:close="submissionError = ''"
          >
            <v-alert-title class="mb-2">Upload Failed</v-alert-title>
            {{ submissionError }}
          </v-alert>
        </v-expand-transition>

        <!-- Validation Summary -->
        <v-expand-transition>
          <v-card
            v-if="!allDocumentsHaveImages && totalUploadedImages > 0"
            variant="tonal"
            color="warning"
            class="mb-6"
          >
            <v-card-text class="d-flex align-center">
              <v-icon color="warning" class="mr-3">mdi-alert-circle-outline</v-icon>
              <div>
                <div class="font-weight-medium">Incomplete Upload</div>
                <div class="text-body-2">Please upload images for all required documents to continue</div>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Success Summary -->
        <v-expand-transition>
          <v-card
            v-if="allDocumentsHaveImages && !isSubmitting"
            variant="tonal"
            color="success"
            class="mb-6"
          >
            <v-card-text class="d-flex align-center">
              <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
              <div>
                <div class="font-weight-medium">Ready to Submit</div>
                <div class="text-body-2">All required documents have been uploaded ({{ totalUploadedImages }} images)</div>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Navigation Actions -->
        <v-card variant="outlined" class="mt-6">
          <v-card-text class="pa-6">
            <div class="d-flex flex-column flex-sm-row gap-3 justify-center">
              <v-btn
                color="grey"
                variant="outlined"
                @click="goBack"
                :disabled="isSubmitting"
                size="large"
              >
                <v-icon start>mdi-arrow-left</v-icon>
                Back
              </v-btn>

              <v-btn
                color="primary"
                variant="flat"
                @click="continueToNext"
                :disabled="!allDocumentsHaveImages"
                :loading="isSubmitting"
                size="large"
              >
                <v-icon start>mdi-upload</v-icon>
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
