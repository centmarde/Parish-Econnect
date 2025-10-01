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

    router.push('/wedding-mass-continue-2')
}

// Key para sa localStorage
const LOCAL_PDF_KEY = 'wedding_selected_pdf'

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

// Available PDFs para sa wedding with enhanced data
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

// Computed para sa theme-aware styling
const cardVariant = computed(() => theme.global.current.value.dark ? 'tonal' : 'elevated')
const headerGradient = computed(() =>
  theme.global.current.value.dark
    ? 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)'
    : 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)'
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
              <v-icon size="48" color="primary">mdi-heart</v-icon>
            </v-avatar>

            <h1 class="text-h4 font-weight-bold text-white mb-2">
              Wedding Documents
            </h1>
            <p class="text-h6 text-white opacity-90 mb-0">
              Download and fill out ang required forms para sa inyong wedding appointment
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
          Please download and complete all required forms before your wedding appointment.
          All documents must be properly filled out and submitted.
        </v-alert>

        <!-- Document Grid -->
        <v-row>
          <v-col
            v-for="pdf in weddingPDFs"
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
                <!-- Category chip -->
                <v-chip
                  :color="pdf.color"
                  variant="tonal"
                  size="small"
                  class="mb-4"
                >
                  {{ pdf.category }}
                </v-chip>

                <!-- Icon -->
                <v-avatar
                  :color="pdf.color"
                  size="64"
                  class="mb-4"
                  variant="tonal"
                >
                  <v-icon size="32" :color="pdf.color">{{ pdf.icon }}</v-icon>
                </v-avatar>

                <!-- Title -->
                <h3 class="text-h6 font-weight-medium mb-2">
                  {{ pdf.name }}
                </h3>

                <!-- Description -->
                <p class="text-body-2 text-medium-emphasis mb-4">
                  {{ pdf.description }}
                </p>

                <!-- Download indicator -->
                <div class="d-flex align-center justify-center">
                  <v-progress-circular
                    v-if="downloadingPdf === pdf.filename"
                    :color="pdf.color"
                    indeterminate
                    size="24"
                    width="3"
                  />
                  <v-icon
                    v-else
                    :color="pdf.color"
                    size="24"
                  >
                    mdi-download
                  </v-icon>
                  <span class="ml-2 text-caption font-weight-medium">
                    {{ downloadingPdf === pdf.filename ? 'Downloading...' : 'Choose Format' }}
                  </span>
                </div>
              </v-card-text>

              <!-- Ripple effect overlay -->
              <v-overlay
                v-if="downloadingPdf === pdf.filename"
                :model-value="true"
                contained
                opacity="0.1"
                :color="pdf.color"
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
              <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
              <div>
                <div class="text-subtitle-1 font-weight-medium">
                  Document Downloaded
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ selectedPdf }} has been downloaded successfully
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Format Selection Dialog -->
        <v-dialog v-model="showFormatDialog" max-width="500" persistent>
          <v-card>
            <v-card-title class="text-h5 pa-6 pb-4">
              <v-icon class="mr-3" color="primary">mdi-file-download</v-icon>
              Choose Document Format
            </v-card-title>

            <v-card-text class="pa-6 pt-0">
              <p class="text-body-1 mb-4">
                Select ang preferred format para sa document:
                <strong>{{ selectedDocument?.name }}</strong>
              </p>

              <v-row class="mt-4">
                <v-col cols="6">
                  <v-card
                    variant="outlined"
                    hover
                    link
                    @click="downloadDocument('pdf')"
                    class="text-center pa-4 format-card"
                  >
                    <v-avatar size="48" color="red" class="mb-3">
                      <v-icon color="white" size="24">mdi-file-pdf-box</v-icon>
                    </v-avatar>
                    <h4 class="text-h6 font-weight-medium mb-2">PDF</h4>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      Portable Document Format
                    </p>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card
                    variant="outlined"
                    hover
                    link
                    @click="downloadDocument('docx')"
                    class="text-center pa-4 format-card"
                  >
                    <v-avatar size="48" color="blue" class="mb-3">
                      <v-icon color="white" size="24">mdi-file-word-box</v-icon>
                    </v-avatar>
                    <h4 class="text-h6 font-weight-medium mb-2">DOCX</h4>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      Microsoft Word Document
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="pa-6 pt-0">
              <v-spacer></v-spacer>
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
                color="grey"
                variant="outlined"
                prepend-icon="mdi-arrow-left"
                size="large"
                @click="goBack"
                class="mx-2"
              >
                Back
              </v-btn>

              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-arrow-right-circle"
                size="large"

                @click="continueToNext"
              >
                Continue
                <v-tooltip

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
