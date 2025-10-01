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
              Upload Baptism Documents
            </h1>
            <p class="text-h6 text-white opacity-90 mb-0">
              Take photos ng mga na-fill out na forms
            </p>
          </v-card-text>
        </v-card>

        <!-- Tips Card -->
        <v-card variant="outlined" class="mt-4">
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-lightbulb-outline"
              title="Tips for Better Photos"
              subtitle="Ipa-good lighting, steady hands, clear visibility ng text"
            />
            <v-list-item
              prepend-icon="mdi-check"
              title="Requirements Complete"
              subtitle="Make sure lahat ng forms na na-download kay filled-out na"
            />
          </v-list>
        </v-card>

        <!-- Progress Indicator -->
        <v-card variant="outlined" class="mb-6">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-progress-linear
                :model-value="(totalUploadedImages / baptismPDFs.length) * 100"
                color="primary"
                height="8"
                rounded
                class="mb-3"
              ></v-progress-linear>
              <p class="text-body-1 font-weight-medium mb-1">
                {{ totalUploadedImages }} of {{ baptismPDFs.length }} documents uploaded
              </p>
              <p class="text-body-2 text-grey-darken-1 mb-0">
                Upload all required documents to continue
              </p>
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
          Kuhain ang mga document na na-download ninyo at na-fill out na.
          Make sure na clear ug readable ang mga text sa documents.
        </v-alert>

        <!-- Document Upload Sections -->
        <div class="document-sections">
          <v-card
            v-for="pdf in baptismPDFs"
            :key="pdf.filename"
            class="mb-4"
            :class="{ 'border-success': hasDocumentImages(pdf.filename) }"
            :variant="cardVariant"
          >
            <v-card-title class="d-flex align-center pa-4">
              <v-icon :color="pdf.color" class="me-3" size="32">
                {{ pdf.icon }}
              </v-icon>
              <div class="flex-grow-1">
                <div class="text-h6 font-weight-bold">{{ pdf.name }}</div>
                <div class="text-body-2 text-grey-darken-1">{{ pdf.description }}</div>
              </div>
              <v-chip
                :color="hasDocumentImages(pdf.filename) ? 'success' : 'grey'"
                :variant="hasDocumentImages(pdf.filename) ? 'flat' : 'outlined'"
                size="small"
              >
                <v-icon left size="16">
                  {{ hasDocumentImages(pdf.filename) ? 'mdi-check' : 'mdi-camera' }}
                </v-icon>
                {{ hasDocumentImages(pdf.filename) ?
                  `${getDocumentImageCount(pdf.filename)} image(s)` :
                  'No images'
                }}
              </v-chip>
            </v-card-title>

            <v-card-text class="pa-4 pt-0">
              <FormCamera
                :modelValue="documentImages[getDocumentKey(pdf.filename)]"
                @update:modelValue="documentImages[getDocumentKey(pdf.filename)] = $event"
                :label="`Upload ${pdf.name}`"
                :required="true"
                :maxImages="5"
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
            <v-alert-title>Upload Error</v-alert-title>
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
              <v-icon color="warning" class="me-3">mdi-alert-outline</v-icon>
              <div>
                <div class="font-weight-bold">Missing Documents</div>
                <div class="text-body-2">Please upload images for all required documents to continue</div>
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
            <v-card-text class="d-flex align-center">
              <v-icon color="success" class="me-3">mdi-check-circle-outline</v-icon>
              <div>
                <div class="font-weight-bold">All Documents Ready</div>
                <div class="text-body-2">{{ totalUploadedImages }} document images are ready for submission</div>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Navigation Actions -->
        <v-card variant="outlined" class="mt-6">
          <v-card-text class="pa-6">
            <div class="d-flex flex-column flex-sm-row gap-3 justify-center align-center">
              <v-btn
                @click="goBack"
                color="grey-darken-1"
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                :disabled="isSubmitting"
              >
                Back
              </v-btn>

              <v-btn
                @click="continueToNext"
                color="primary"
                size="large"
                class="px-6"
                prepend-icon="mdi-cloud-upload"
                :disabled="!allDocumentsHaveImages || isSubmitting"
                :loading="isSubmitting"
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

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import FormCamera from '@/components/common/FormCamera.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import NavBar2 from '@/components/layout/NavBar2.vue'

import { useCameraBaptismUpload } from '@/views/contBaptism/composables/cameraSent'

const theme = useTheme()
const router = useRouter()
const { updateBaptismBookingWithImages } = useCameraBaptismUpload()

// Loading state para sa submission
const isSubmitting = ref(false)
const submissionError = ref('')

// Baptism PDF documents data na same sa ContBaptismView
const baptismPDFs = [
  {
    name: 'Permission of Baptism',
    filename: 'permission_of_baptism.pdf',
    description: 'Permission form para sa baptism service',
    icon: 'mdi-certificate',
    color: 'primary',
    category: 'Permission',
  },
  {
    name: 'Application for Baptism',
    filename: 'application_for_baptism.pdf',
    description: 'Complete application form with personal details',
    icon: 'mdi-file-document-edit',
    color: 'secondary',
    category: 'Application',
  },
  {
    name: 'Application for Confirmation',
    filename: 'application_for_confirmation.pdf',
    description: 'Confirmation application form for sacrament preparation',
    icon: 'mdi-file-check',
    color: 'success',
    category: 'Confirmation',
  },
]

// Reactive state para sa each PDF document images
const documentImages = ref({
  permission_of_baptism: [],
  application_for_baptism: [],
  application_for_confirmation: []
})

// Convert filename to reactive key
const getDocumentKey = (filename) => {
  return filename.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '_')
}

// Check if all required documents have images
const allDocumentsHaveImages = computed(() => {
  return baptismPDFs.every(pdf => {
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

    // Submit baptism documents to storage and update database
    console.log('Submitting baptism documents...', documentImages.value)
    const result = await updateBaptismBookingWithImages(documentImages.value)

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
