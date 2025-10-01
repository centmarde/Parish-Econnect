<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

import NavBar2 from '@/components/layout/NavBar2.vue'
import AppBar from '@/components/layout/AppBar.vue'

const theme = useTheme()
const router = useRouter()
const goBack = () => {
  router.push('/book-event')
}
function continueToNext() {
  // try named route first, fallback to path
    router.push('/thanksgiving-mass-continue-2')
}

// Key para sa localStorage
const LOCAL_PDF_KEY = 'thanksgiving_selected_pdf'

// Track selected PDF title (show previous selection if available)
const selectedPdf = ref(
  typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_PDF_KEY) || '' : '',
)

// Loading state para sa downloads
const downloadingPdf = ref('')
const showFormatDialog = ref(false)
const selectedDocument = ref(null)

// Format selection dialog functions
const openFormatDialog = (pdf) => {
  selectedDocument.value = pdf
  showFormatDialog.value = true
}

// Download function with format selection
const downloadDocument = async (format) => {
  if (!selectedDocument.value) return

  const pdf = selectedDocument.value
  const filename = format === 'pdf'
    ? pdf.filename
    : pdf.filename.replace('.pdf', '.docx')

  downloadingPdf.value = pdf.filename

  // Save ang chosen document title for future reference
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCAL_PDF_KEY, pdf.name)
    }
    selectedPdf.value = pdf.name
  } catch (e) {
    // ignore localStorage errors (private mode, quota, etc.)
    console.warn('Could not save selected document to localStorage', e)
  }

  // Close dialog
  showFormatDialog.value = false

  // Simulate download delay para sa better UX
  setTimeout(() => {
    const link = document.createElement('a')
    link.href = format === 'pdf' ? `/pdf/${filename}` : `/docx/${filename}`
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    downloadingPdf.value = ''
  }, 300)
}

// Available PDFs para sa thanksgiving with enhanced data
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

// Computed para sa theme-aware styling
const cardVariant = computed(() => theme.global.current.value.dark ? 'tonal' : 'elevated')
const headerGradient = computed(() =>
  theme.global.current.value.dark
    ? 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)'
    : 'linear-gradient(135deg, #424242 0%, #616161 100%)'
)
</script>

<template>


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
              Thanksgiving Documents
            </h1>
            <p class="text-h6 text-white opacity-90 mb-0">
              Download and fill out ang required forms para sa inyong thanksgiving appointment
            </p>
          </v-card-text>
        </v-card>

        <!-- Info Alert -->
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6"
          prepend-icon="mdi-information-outline"
        >
          <v-alert-title class="text-h6 mb-2">Important Reminder</v-alert-title>
          Please download and complete all required forms before your thanksgiving appointment.
          All documents must be properly filled out and submitted.
        </v-alert>

        <!-- Document Grid -->
        <v-row>
          <v-col
            v-for="pdf in thanksgivingPDFs"
            :key="pdf.filename"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card
              :variant="cardVariant"
              :color="downloadingPdf === pdf.filename ? pdf.color : undefined"
              class="document-card h-100"
              :class="{ 'downloading': downloadingPdf === pdf.filename }"
              hover
              link
              @click="openFormatDialog(pdf)"
            >
              <v-card-text class="text-center pa-6">
                <!-- Document Icon -->
                <v-avatar
                  size="64"
                  :color="downloadingPdf === pdf.filename ? 'white' : pdf.color"
                  class="mb-4"
                >
                  <v-icon
                    size="32"
                    :color="downloadingPdf === pdf.filename ? pdf.color : 'white'"
                  >
                    {{ pdf.icon }}
                  </v-icon>
                </v-avatar>

                <h3 class="text-h6 mb-2">{{ pdf.name }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  {{ pdf.description }}
                </p>

                <!-- Category Badge -->
                <v-chip
                  size="small"
                  :color="pdf.color"
                  variant="tonal"
                  class="mb-2"
                >
                  {{ pdf.category }}
                </v-chip>

                <!-- Loading Indicator -->
                <v-expand-transition>
                  <div v-if="downloadingPdf === pdf.filename" class="mt-3">
                    <v-progress-circular indeterminate size="24" width="3" />
                    <p class="text-caption mt-2">Preparing download...</p>
                  </div>
                </v-expand-transition>
              </v-card-text>

              <!-- Ripple effect overlay -->
              <v-overlay
                :model-value="downloadingPdf === pdf.filename"
                contained
                scrim="false"
              />
            </v-card>
          </v-col>
        </v-row>

        <!-- Selected Document Status -->
        <v-expand-transition>
          <v-card
            v-if="selectedPdf"
            variant="tonal"
            color="success"
            class="mt-6"
          >
            <v-card-text class="d-flex align-center">
              <v-icon class="me-3">mdi-check-circle</v-icon>
              <div>
                <div class="font-weight-medium">Document Downloaded</div>
                <div class="text-body-2 text-medium-emphasis">{{ selectedPdf }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Format Selection Dialog -->
        <v-dialog v-model="showFormatDialog" max-width="500" persistent>
          <v-card>
            <v-card-title class="text-h5 pa-6 pb-4">
              <v-icon class="me-2">mdi-download</v-icon>
              Choose Document Format
            </v-card-title>

            <v-card-text class="pa-6 pt-0">
              <p class="text-body-1 mb-4">
                Select your preferred format para sa <strong>{{ selectedDocument?.name }}</strong>:
              </p>

              <v-row class="ga-4">
                <v-col cols="6">
                  <v-card
                    variant="outlined"
                    class="format-card pa-4 text-center"
                    hover
                    @click="downloadDocument('pdf')"
                  >
                    <v-icon size="48" color="red" class="mb-2">mdi-file-pdf-box</v-icon>
                    <div class="text-h6 mb-1">PDF</div>
                    <div class="text-body-2 text-medium-emphasis">
                      For viewing and printing
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card
                    variant="outlined"
                    class="format-card pa-4 text-center"
                    hover
                    @click="downloadDocument('docx')"
                  >
                    <v-icon size="48" color="blue" class="mb-2">mdi-file-word-box</v-icon>
                    <div class="text-h6 mb-1">DOCX</div>
                    <div class="text-body-2 text-medium-emphasis">
                      For editing and filling
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="pa-6 pt-0">
              <v-spacer />
              <v-btn
                variant="text"
                @click="showFormatDialog = false"
              >
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Additional Help Section -->
        <v-card variant="outlined" class="mt-6">
          <v-card-text class="text-center pa-6">
              <div class="d-flex flex-grid flex-sm-row gap-3 justify-center align-center">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                @click="goBack"
              >
                Back
              </v-btn>

              <v-btn
                color="primary"
                prepend-icon="mdi-arrow-right"
                class="mx-2"
                @click="continueToNext"
              >
                Continue
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-container>

      <AppBar />
    </template>
  </NavBar2>
</template>

<style scoped>
/* Minimal scoped styles that work with both light and dark themes */
.document-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.document-card:hover {
  transform: translateY(-4px);
}

.document-card.downloading {
  transform: scale(0.98);
}

/* Format card hover effects */
.format-card {
  transition: all 0.2s ease-in-out;
}

.format-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Theme-aware animation */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ensure proper spacing on mobile */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }
}
</style>
