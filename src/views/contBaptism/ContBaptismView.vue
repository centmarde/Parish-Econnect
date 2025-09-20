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
              <v-icon size="48" color="grey-darken-2">mdi-church</v-icon>
            </v-avatar>

            <h1 class="text-h4 font-weight-bold text-white mb-2">
              Baptism Documents
            </h1>
            <p class="text-h6 text-white opacity-90 mb-0">
              Download and fill out ang required forms para sa inyong baptism appointment
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
          Please download and complete all required forms before your baptism appointment.
          All documents must be properly filled out and submitted.
        </v-alert>

        <!-- Document Grid -->
        <v-row>
          <v-col
            v-for="pdf in baptismPDFs"
            :key="pdf.filename"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card
              :variant="cardVariant"
              :color="downloadingPdf === pdf.filename ? pdf.color : undefined"
              @click="openFormatDialog(pdf)"
              class="document-card h-100"
              elevation="2"
            >
              <v-card-title class="text-center py-6">
                <v-icon
                  :color="downloadingPdf === pdf.filename ? 'white' : pdf.color"
                  class="mb-2"
                  size="48"
                >
                  {{ pdf.icon }}
                </v-icon>
                <div
                  class="text-h6 font-weight-bold"
                  :class="{ 'text-white': downloadingPdf === pdf.filename }"
                >
                  {{ pdf.name }}
                </div>
              </v-card-title>
              <v-card-text class="text-center pa-4">
                <p
                  class="text-body-2 mb-4"
                  :class="{ 'text-white': downloadingPdf === pdf.filename }"
                >
                  {{ pdf.description }}
                </p>
                <v-chip
                  :color="pdf.color"
                  variant="outlined"
                  size="small"
                  class="mb-2"
                >
                  {{ pdf.category }}
                </v-chip>
                <div class="mt-2">
                  <v-progress-circular
                    v-if="downloadingPdf === pdf.filename"
                    indeterminate
                    color="white"
                    size="24"
                  ></v-progress-circular>
                  <span
                    v-else
                    class="text-body-2"
                    :class="{ 'text-white': downloadingPdf === pdf.filename }"
                  >
                    Click to download
                  </span>
                </div>
              </v-card-text>
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
              <v-icon color="success" class="me-3">mdi-check-circle</v-icon>
              <div>
                <div class="font-weight-bold">Document Downloaded</div>
                <div class="text-body-2">{{ selectedPdf }} has been downloaded successfully</div>
              </div>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Format Selection Dialog -->
        <v-dialog v-model="showFormatDialog" max-width="500" persistent>
          <v-card>
            <v-card-title class="text-h5 pa-6 pb-4">
              <v-icon color="primary" class="me-3">mdi-file-download</v-icon>
              Choose Format
            </v-card-title>

            <v-card-text class="pa-6 pt-0">
              <p class="mb-4">
                Select the format you prefer for
                <strong>{{ selectedDocument?.name }}</strong>:
              </p>

              <div class="d-flex gap-3">
                <v-card
                  class="format-card flex-1"
                  variant="outlined"
                  @click="downloadDocument('pdf')"
                  :ripple="true"
                >
                  <v-card-text class="text-center pa-4">
                    <v-icon color="red" size="32" class="mb-2">
                      mdi-file-pdf-box
                    </v-icon>
                    <div class="font-weight-bold">PDF Format</div>
                    <div class="text-body-2 text-grey-darken-1">
                      Best for viewing and printing
                    </div>
                  </v-card-text>
                </v-card>

                <v-card
                  class="format-card flex-1"
                  variant="outlined"
                  @click="downloadDocument('docx')"
                  :ripple="true"
                >
                  <v-card-text class="text-center pa-4">
                    <v-icon color="blue" size="32" class="mb-2">
                      mdi-file-word-box
                    </v-icon>
                    <div class="font-weight-bold">Word Document</div>
                    <div class="text-body-2 text-grey-darken-1">
                      Best for editing and filling
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>

            <v-card-actions class="pa-6 pt-0">
              <v-spacer></v-spacer>
              <v-btn
                color="grey-darken-1"
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
            <div class="d-flex flex-column flex-sm-row gap-3 justify-center align-center">
              <v-btn
                @click="goBack"
                color="grey-darken-1"
                variant="outlined"
                size="large"
                class="px-8"
                prepend-icon="mdi-arrow-left"
              >
                Back
              </v-btn>

              <v-btn
                @click="continueToNext"
                color="primary"
                size="large"
                class="px-8 mx-2"
                prepend-icon="mdi-arrow-right"
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
  router.push('/baptism-mass-continue-2')
}

// Key para sa localStorage
const LOCAL_PDF_KEY = 'baptism_selected_pdf'

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

// Available PDFs para sa baptism with enhanced data
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

// Computed para sa theme-aware styling
const cardVariant = computed(() => theme.global.current.value.dark ? 'tonal' : 'elevated')
const headerGradient = computed(() =>
  theme.global.current.value.dark
    ? 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)'
    : 'linear-gradient(135deg, #424242 0%, #616161 100%)'
)
</script>

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
