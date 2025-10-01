<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import FormCamera from '@/components/common/FormCamera.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import NavBar2 from '@/components/layout/NavBar2.vue'

import { useCameraWeddingUpload } from '@/views/contWedding/composables/cameraSent.ts'

const theme = useTheme()
const router = useRouter()
const { updateWeddingBookingWithImages } = useCameraWeddingUpload()

// Loading state para sa submission
const isSubmitting = ref(false)
const submissionError = ref('')

// Wedding PDF documents data na same sa ContWeddingView
const weddingPDFs = [
  {
    name: 'Marriage Interview',
    filename: 'marriage_interview.pdf',
    description: 'Interview form para sa mag-asawa',
    icon: 'mdi-account-heart',
    color: 'primary',
    category: 'Interview',
  },
  {
    name: 'Marriage Banns',
    filename: 'marriage_banns.pdf',
    description: 'Banns announcement form',
    icon: 'mdi-bullhorn',
    color: 'secondary',
    category: 'Announcement',
  },
  {
    name: 'Jurisdiction for Marriage',
    filename: 'jurisdiction_for_marriage.pdf',
    description: 'Jurisdiction requirements',
    icon: 'mdi-gavel',
    color: 'success',
    category: 'Legal',
  },
]

// Additional required wedding documents
const additionalWeddingPDFs = [
  {
    name: 'Marriage Certificate',
    filename: 'marriage_certificate.pdf',
    description: 'Official marriage certificate',
    icon: 'mdi-certificate',
    color: 'info',
    category: 'Certificate',
  },
  {
    name: 'Baptismal Certificate',
    filename: 'baptismal_certificate.pdf',
    description: 'Baptismal certificate ng mag-asawa',
    icon: 'mdi-water',
    color: 'cyan',
    category: 'Certificate',
  },
  {
    name: 'Confirmation Certificate',
    filename: 'confirmation_certificate.pdf',
    description: 'Confirmation certificate ng mag-asawa',
    icon: 'mdi-cross',
    color: 'purple',
    category: 'Certificate',
  },
]

// Reactive state para sa each PDF document images
const documentImages = ref({
  marriage_interview: [],
  marriage_banns: [],
  jurisdiction_for_marriage: [],
  marriage_certificate: [],
  baptismal_certificate: [],
  confirmation_certificate: []
})

// Convert filename to reactive key
const getDocumentKey = (filename) => {
  return filename.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '_')
}

// Check if all required documents have images
const allDocumentsHaveImages = computed(() => {
  const allPDFs = [...weddingPDFs, ...additionalWeddingPDFs]
  return allPDFs.every(pdf => {
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
    : 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)'
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

    // Submit wedding documents to storage and update database
    console.log('Submitting wedding documents...', documentImages.value)
    const result = await updateWeddingBookingWithImages(documentImages.value)

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
              <v-icon size="48" color="primary">mdi-camera-plus</v-icon>
            </v-avatar>

            <h1 class="text-h4 font-weight-bold text-white mb-2">
              Document Photos
            </h1>
            <p class="text-h6 text-white opacity-90 mb-0">
              Upload photos ng filled-out wedding documents
            </p>
          </v-card-text>
        </v-card>

             <!-- Tips Card -->
        <v-card variant="outlined" class="mt-4">
          <v-list density="compact">
            <v-list-subheader class="text-primary text-caption font-weight-medium">
              Photo Tips para sa Best Quality
            </v-list-subheader>

            <v-list-item
              prepend-icon="mdi-lightbulb-on"
              title="Good Lighting"
              subtitle="Use natural light or bright indoor lighting"
              class="text-caption"
            />

            <v-list-item
              prepend-icon="mdi-focus-field"
              title="Clear Focus"
              subtitle="Make sure all text is readable and in focus"
              class="text-caption"
            />

            <v-list-item
              prepend-icon="mdi-crop-square"
              title="Full Document"
              subtitle="Include the entire document in the frame"
              class="text-caption"
            />

            <v-list-item
              prepend-icon="mdi-rotate-right"
              title="Correct Orientation"
              subtitle="Ensure document is right-side up"
              class="text-caption"
            />

            <v-list-item
              prepend-icon="mdi-file-image"
              title="Auto PNG Conversion"
              subtitle="Images will be automatically converted to PNG format"
              class="text-caption"
            />
          </v-list>
        </v-card>

        <!-- Progress Indicator -->
        <v-card variant="outlined" class="mb-6">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="text-subtitle-1 font-weight-medium">
                Upload Progress
              </div>
              <v-chip
                :color="allDocumentsHaveImages ? 'success' : 'primary'"
                variant="tonal"
                size="small"
              >
                {{ totalUploadedImages }} images uploaded
              </v-chip>
            </div>

            <v-progress-linear
              :model-value="(totalUploadedImages / (weddingPDFs.length + additionalWeddingPDFs.length)) * 100"
              :color="allDocumentsHaveImages ? 'success' : 'primary'"
              height="8"
              rounded
              class="mb-2"
            />

            <div class="text-caption text-medium-emphasis">
              {{ allDocumentsHaveImages ? 'All documents uploaded!' : `${(weddingPDFs.length + additionalWeddingPDFs.length) - Object.values(documentImages).filter(imgs => imgs.length > 0).length} documents remaining` }}
            </div>
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
          Please take clear photos of your completed wedding documents. Each document should be uploaded separately and clearly visible. All 6 documents are required before you can proceed. All images will be automatically converted to PNG format for consistent storage.
        </v-alert>

        <!-- Document Upload Sections -->
        <div class="document-sections">
          <!-- Primary Documents (3 columns) -->
          <v-row class="mb-6">
            <v-col
              v-for="(pdf) in weddingPDFs"
              :key="pdf.filename"
              cols="12"
              md="4"
              sm="6"
            >
              <v-card
                :variant="cardVariant"
                class="h-100"
                :class="{ 'border-success': hasDocumentImages(pdf.filename) }"
              >
                <!-- Document Header -->
                <v-card-title class="pa-4 d-flex align-center">
                  <v-avatar
                    :color="pdf.color"
                    size="40"
                    variant="tonal"
                    class="mr-3"
                  >
                    <v-icon :color="pdf.color" size="20">{{ pdf.icon }}</v-icon>
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ pdf.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ pdf.description }}
                    </div>
                  </div>

                  <!-- Status indicator -->
                  <div class="text-right">
                    <v-chip
                      v-if="hasDocumentImages(pdf.filename)"
                      color="success"
                      variant="tonal"
                      size="x-small"
                      prepend-icon="mdi-check"
                    >
                      ✓
                    </v-chip>
                    <v-chip
                      v-else
                      color="grey"
                      variant="outlined"
                      size="x-small"
                      prepend-icon="mdi-upload"
                    >
                      -
                    </v-chip>
                  </div>
                </v-card-title>

                <v-divider />

                <!-- Camera Upload Component -->
                <v-card-text class="pa-4">
                  <FormCamera
                    v-model="documentImages[getDocumentKey(pdf.filename)]"
                    :label="`${pdf.name} Images`"
                    :max-images="5"
                    :required="true"
                  />

                  <div v-if="hasDocumentImages(pdf.filename)" class="text-caption text-medium-emphasis mt-2">
                    {{ getDocumentImageCount(pdf.filename) }} image{{ getDocumentImageCount(pdf.filename) !== 1 ? 's' : '' }} uploaded
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Additional Documents (3 columns) -->
          <v-row class="mb-6">
            <v-col
              v-for="(pdf) in additionalWeddingPDFs"
              :key="pdf.filename"
              cols="12"
              md="4"
              sm="6"
            >
              <v-card
                :variant="cardVariant"
                class="h-100"
                :class="{ 'border-success': hasDocumentImages(pdf.filename) }"
              >
                <!-- Document Header -->
                <v-card-title class="pa-4 d-flex align-center">
                  <v-avatar
                    :color="pdf.color"
                    size="40"
                    variant="tonal"
                    class="mr-3"
                  >
                    <v-icon :color="pdf.color" size="20">{{ pdf.icon }}</v-icon>
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ pdf.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ pdf.description }}
                    </div>
                  </div>

                  <!-- Status indicator -->
                  <div class="text-right">
                    <v-chip
                      v-if="hasDocumentImages(pdf.filename)"
                      color="success"
                      variant="tonal"
                      size="x-small"
                      prepend-icon="mdi-check"
                    >
                      ✓
                    </v-chip>
                    <v-chip
                      v-else
                      color="grey"
                      variant="outlined"
                      size="x-small"
                      prepend-icon="mdi-upload"
                    >
                      -
                    </v-chip>
                  </div>
                </v-card-title>

                <v-divider />

                <!-- Camera Upload Component -->
                <v-card-text class="pa-4">
                  <FormCamera
                    v-model="documentImages[getDocumentKey(pdf.filename)]"
                    :label="`${pdf.name} Images`"
                    :max-images="5"
                    :required="true"
                  />

                  <div v-if="hasDocumentImages(pdf.filename)" class="text-caption text-medium-emphasis mt-2">
                    {{ getDocumentImageCount(pdf.filename) }} image{{ getDocumentImageCount(pdf.filename) !== 1 ? 's' : '' }} uploaded
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Submission Error Alert -->
        <v-expand-transition>
          <v-alert
            v-if="submissionError"
            type="error"
            variant="tonal"
            class="mb-6"
            prepend-icon="mdi-alert-circle-outline"
            closable
            @click:close="submissionError = ''"
          >
            <v-alert-title class="text-h6 mb-2">Submission Error</v-alert-title>
            {{ submissionError }}
          </v-alert>
        </v-expand-transition>

        <!-- Validation Summary -->
        <v-expand-transition>
          <v-alert
            v-if="!allDocumentsHaveImages"
            type="warning"
            variant="tonal"
            class="mb-6"
            prepend-icon="mdi-alert-outline"
          >
            <v-alert-title class="text-h6 mb-2">Upload Required</v-alert-title>
            Please upload images for all {{ weddingPDFs.length + additionalWeddingPDFs.length }} wedding documents before proceeding.

            <v-row class="mt-3">
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 mb-2 text-primary">Primary Documents</div>
                <v-list density="compact" class="bg-transparent">
                  <v-list-item
                    v-for="pdf in weddingPDFs.filter(p => !hasDocumentImages(p.filename))"
                    :key="pdf.filename"
                    prepend-icon="mdi-circle-small"
                    :title="pdf.name"
                    class="text-body-2 pl-0"
                  />
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 mb-2 text-primary">Additional Documents</div>
                <v-list density="compact" class="bg-transparent">
                  <v-list-item
                    v-for="pdf in additionalWeddingPDFs.filter(p => !hasDocumentImages(p.filename))"
                    :key="pdf.filename"
                    prepend-icon="mdi-circle-small"
                    :title="pdf.name"
                    class="text-body-2 pl-0"
                  />
                </v-list>
              </v-col>
            </v-row>
          </v-alert>
        </v-expand-transition>

        <!-- Success Summary -->
        <v-expand-transition>
          <v-alert
            v-if="allDocumentsHaveImages"
            type="success"
            variant="tonal"
            class="mb-6"
            prepend-icon="mdi-check-circle-outline"
          >
            <v-alert-title class="text-h6 mb-2">All Documents Uploaded!</v-alert-title>
            Great! You've uploaded images for all 6 required wedding documents. You can now proceed to the next step.
          </v-alert>
        </v-expand-transition>

        <!-- Navigation Actions -->
        <v-card variant="outlined" class="mt-6">
          <v-card-text class="text-center pa-6">
            <div class="d-flex flex-grid flex-sm-row gap-3 justify-center align-center">
              <v-btn
                color="grey"
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                size="large"
                @click="goBack"
              >
                Back
              </v-btn>

              <v-btn
                color="primary"
                variant="flat"
                :prepend-icon="isSubmitting ? 'mdi-loading' : 'mdi-arrow-right-circle'"
                size="large"
                :disabled="!allDocumentsHaveImages || isSubmitting"
                :loading="isSubmitting"
                @click="continueToNext"
              >
                {{ isSubmitting ? 'Submitting...' : 'Continue' }}
                <v-tooltip
                  v-if="!allDocumentsHaveImages && !isSubmitting"
                  activator="parent"
                  location="top"
                >
                  Upload all document images to continue
                </v-tooltip>
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

  /* Make document cards stack on mobile */
  .document-sections .v-col {
    margin-bottom: 16px;
  }
}

/* Ensure equal height cards */
.h-100 {
  height: 100%;
}

/* Grid layout improvements */
.document-sections .v-row {
  margin-bottom: 0;
}

.document-sections .v-col {
  display: flex;
  flex-direction: column;
}

/* Card hover effects for grid layout */
.document-sections .v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
}

.document-sections .v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
