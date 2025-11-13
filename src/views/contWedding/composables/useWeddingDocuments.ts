import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCameraWeddingUpload } from './cameraSent'

/**
 * Composable for managing wedding document uploads
 * Handles document state, validation, and submission
 */
export function useWeddingDocuments() {
  const router = useRouter()
  const { updateWeddingBookingWithImages } = useCameraWeddingUpload()

  // Loading and error states
  const isSubmitting = ref(false)
  const submissionError = ref('')
  const showAdditionalDocuments = ref(false)
  const showOptionalDocuments = ref(false)

  // Reactive state for document images
  const documentImages = ref({
    marriage_interview: [],
    marriage_banns: [],
    jurisdiction_for_marriage: [],
    baptismal_certificate: [],
    confirmation_certificate: [],
    certification_recommendation: [],
    birth_certificate_psa: [],
    cenomar: [],
    marriage_license: [],
    pre_cana_seminar: [],
    marriage_banns_publication: [],
    jurisdiction_permit: []
  })

  /**
   * Convert filename to reactive key format
   */
  const getDocumentKey = (filename: string): string => {
    return filename.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '_')
  }

  /**
   * Check if a specific document has uploaded images
   */
  const hasDocumentImages = (filename: string): boolean => {
    const key = getDocumentKey(filename)
    return documentImages.value[key] && documentImages.value[key].length > 0
  }

  /**
   * Get the count of images for a specific document
   */
  const getDocumentImageCount = (filename: string): number => {
    const key = getDocumentKey(filename)
    return documentImages.value[key] ? documentImages.value[key].length : 0
  }

  /**
   * Count total uploaded images across all documents
   */
  const totalUploadedImages = computed(() => {
    return Object.values(documentImages.value).reduce(
      (total, images) => total + images.length,
      0
    )
  })

  /**
   * Check if all required documents have images
   */
  const allDocumentsHaveImages = computed(() => {
    // Import document lists to check against
    // This will be passed as parameter to avoid circular dependency
    return false // Will be overridden when used
  })

  /**
   * Submit documents to backend
   */
  const submitDocuments = async () => {
    if (isSubmitting.value) return

    try {
      isSubmitting.value = true
      submissionError.value = ''

      console.log('Submitting wedding documents...', documentImages.value)
      const result = await updateWeddingBookingWithImages(documentImages.value)

      if (result.error) {
        submissionError.value = result.error
        console.error('Document submission error:', result.error)
        return { success: false, error: result.error }
      }

      console.log('Documents submitted successfully:', result.data)

      if (result.referenceNumber) {
        console.log('Reference number generated:', result.referenceNumber)
      }

      return { success: true, data: result.data }
    } catch (error) {
      console.error('Submission error:', error)
      submissionError.value = 'Failed to submit documents. Please try again.'
      return { success: false, error: submissionError.value }
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Navigate to previous page
   */
  const goBack = () => {
    router.back()
  }

  /**
   * Navigate to success page
   */
  const goToSuccessPage = () => {
    router.push('/finnish')
  }

  return {
    // State
    documentImages,
    isSubmitting,
    submissionError,
    showAdditionalDocuments,
    showOptionalDocuments,

    // Computed
    totalUploadedImages,
    allDocumentsHaveImages,

    // Methods
    getDocumentKey,
    hasDocumentImages,
    getDocumentImageCount,
    submitDocuments,
    goBack,
    goToSuccessPage,
  }
}
