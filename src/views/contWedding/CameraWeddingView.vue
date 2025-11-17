<script setup lang="ts">
import { computed } from 'vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import NavBar2 from '@/components/layout/NavBar2.vue'

// Composables and data
import { useWeddingDocuments } from './composables/useWeddingDocuments'
import {
  requiredWeddingDocuments,
  optionalWeddingDocuments,
  allWeddingDocuments
} from './data/weddingDocuments'

// Components
import PageHeader from './components/PageHeader.vue'
import DocumentUploadCard from './components/DocumentUploadCard.vue'
import PhotoTipsCard from './components/PhotoTipsCard.vue'
import UploadProgressCard from './components/UploadProgressCard.vue'
import ValidationAlert from './components/ValidationAlert.vue'

// Use wedding documents composable
const {
  documentImages,
  isSubmitting,
  submissionError,
  showOptionalDocuments,
  totalUploadedImages,
  getDocumentKey,
  hasDocumentImages,
  getDocumentImageCount,
  submitDocuments,
  goBack,
  goToSuccessPage,
} = useWeddingDocuments()

// Document lists from centralized data
const requiredDocs = requiredWeddingDocuments.value
const optionalDocs = optionalWeddingDocuments.value

// All documents combined
const allPDFs = allWeddingDocuments

// Check if all REQUIRED documents have images (not optional)
const allDocumentsHaveImages = computed(() => {
  return requiredDocs.every(pdf => {
    const key = getDocumentKey(pdf.filename)
    return documentImages.value[key] && documentImages.value[key].length > 0
  })
})

// Count uploaded documents
const uploadedDocumentsCount = computed(() => {
  return Object.values(documentImages.value).filter(imgs => imgs.length > 0).length
})

// Get missing documents for validation alert
const missingRequiredDocs = computed(() =>
  requiredDocs.filter(pdf => !hasDocumentImages(pdf.filename))
)

const missingOptionalDocs = computed(() =>
  optionalDocs.filter(pdf => !hasDocumentImages(pdf.filename))
)

// Handle submission and navigation
const continueToNext = async () => {
  if (!allDocumentsHaveImages.value || isSubmitting.value) {
    return
  }

  const result = await submitDocuments()

  if (result.success) {
    goToSuccessPage()
  }
}
</script>

<template>
  <PreloaderView />

  <NavBar2>
    <template #content>
      <v-container class="pa-4" fluid>
        <!-- Header Section -->
        <PageHeader />

        <!-- Tips Card Component -->
        <PhotoTipsCard />

        <!-- Progress Indicator Component -->
        <UploadProgressCard
          :total-images="totalUploadedImages"
          :total-documents="allPDFs.length"
          :uploaded-documents-count="uploadedDocumentsCount"
          :all-complete="allDocumentsHaveImages"
        />

        <!-- Info Alert -->
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6"
          prepend-icon="mdi-information-outline"
        >
          <v-alert-title class="text-h6 mb-2">Instructions</v-alert-title>
          Please take clear photos of your completed wedding documents. Each document should be uploaded separately and clearly visible. All {{ requiredDocs.length }} required documents must be uploaded before you can proceed. All images will be automatically converted to PNG format for consistent storage.
        </v-alert>

        <!-- Document Upload Sections -->
        <div class="document-sections">
          <!-- Required Documents Section -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="pa-4 d-flex align-center">
              <v-icon color="error" size="28" class="mr-3">mdi-file-document-check</v-icon>
              <div>
                <div class="text-h6 font-weight-medium">Required Documents</div>
                <div class="text-caption text-medium-emphasis">
                  {{ requiredDocs.length }} documents required for wedding booking
                </div>
              </div>
            </v-card-title>
          </v-card>

          <!-- Required Documents Grid -->
          <v-row class="mb-6">
            <v-col
              v-for="(pdf) in requiredDocs"
              :key="pdf.filename"
              cols="12"
              md="4"
              sm="6"
            >
              <DocumentUploadCard
                :document="pdf"
                v-model="documentImages[getDocumentKey(pdf.filename)]"
                :has-images="hasDocumentImages(pdf.filename)"
                :image-count="getDocumentImageCount(pdf.filename)"
              />
            </v-col>
          </v-row>

          <!-- Optional Documents Section Header (Collapsible) -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="pa-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="grey" size="28" class="mr-3">mdi-folder-multiple-outline</v-icon>
                <div>
                  <div class="text-h6 font-weight-medium">Optional Documents</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ optionalDocs.length }} optional documents (if applicable)
                  </div>
                </div>
              </div>

              <v-btn
                :color="showOptionalDocuments ? 'primary' : 'grey'"
                variant="tonal"
                :prepend-icon="showOptionalDocuments ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                @click="showOptionalDocuments = !showOptionalDocuments"
              >
                {{ showOptionalDocuments ? 'Hide' : 'Show' }}
              </v-btn>
            </v-card-title>
          </v-card>

          <!-- Optional Documents Grid (Collapsible) -->
          <v-expand-transition>
            <v-row v-show="showOptionalDocuments" class="mb-6">
              <v-col
                v-for="(pdf) in optionalDocs"
                :key="pdf.filename"
                cols="12"
                md="4"
                sm="6"
              >
                <DocumentUploadCard
                  :document="pdf"
                  v-model="documentImages[getDocumentKey(pdf.filename)]"
                  :has-images="hasDocumentImages(pdf.filename)"
                  :image-count="getDocumentImageCount(pdf.filename)"
                />
              </v-col>
            </v-row>
          </v-expand-transition>
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

        <!-- Validation Summary Component -->
        <ValidationAlert
          :missing-primary-docs="missingRequiredDocs"
          :missing-additional-docs="missingOptionalDocs"
          :total-documents="requiredDocs.length"
        />

        <!-- Success Summary -->
        <v-expand-transition>
          <v-alert
            v-if="allDocumentsHaveImages"
            type="success"
            variant="tonal"
            class="mb-6"
            prepend-icon="mdi-check-circle-outline"
          >
            <v-alert-title class="text-h6 mb-2">All Required Documents Uploaded!</v-alert-title>
            Great! You've uploaded images for all {{ requiredDocs.length }} required wedding documents. You can now proceed to the next step.
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
