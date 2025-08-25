import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWeddingStore } from '@/stores/weddingBookingData.js'

export function useWeddingForm() {
  // Router for navigation
  const router = useRouter()
  
  // Form interaction tracking
  const formTouched = ref(false)

  // Form validation rules
  const nameRules = [(v) => !!v || 'This field is required']
  const dateRules = [(v) => !!v || 'Date is required']

  // Form data state
  const formData = ref({
    bride_firstname: '',
    bride_lastname: '',
    groom_firstname: '',
    groom_lastname: '',
    wedding_date: '',
    starting_time: '',
  })

  // Store references
  const weddingStore = useWeddingStore()
  const formAction = weddingStore.formAction

  // Form validation computed
  const isFormValid = computed(() => {
    return formData.value.bride_firstname && 
           formData.value.bride_lastname && 
           formData.value.groom_firstname && 
           formData.value.groom_lastname && 
           formData.value.wedding_date && 
           formData.value.starting_time
  })

  // Show validation warnings based on touch interaction
  const showValidationWarning = computed(() => {
    return formTouched.value && !isFormValid.value
  })

  // Reset form state
  const resetForm = () => {
    formData.value = {
      bride_firstname: '',
      bride_lastname: '',
      groom_firstname: '',
      groom_lastname: '',
      wedding_date: '',
      starting_time: '',
    }
    formTouched.value = false
  }

  // Submit wedding booking function
  const submitWeddingBooking = async (refVform) => {
    // Mark form as touched para ma-show ang validation
    formTouched.value = true
    
    // Validate na naka-complete na ang form
    if (!isFormValid.value) {
      return false
    }

    const payload = {
      bride_firstname: formData.value.bride_firstname,
      bride_lastname: formData.value.bride_lastname,
      groom_firstname: formData.value.groom_firstname,
      groom_lastname: formData.value.groom_lastname,
      wedding_date: formData.value.wedding_date,
      starting_time: formData.value.starting_time,
    }

    // Insert the wedding booking
    const insertSuccess = await weddingStore.createWedding(payload)
    if (insertSuccess) {
      // Reset form after successful submission
      refVform?.value?.reset()
      resetForm()
      
      // Redirect to pending page
      router.push('/pending')
      return true
    }
    return false
  }

  return {
    // State
    formData,
    formAction,
    nameRules,
    dateRules,
    
    // Computed
    isFormValid,
    showValidationWarning,
    
    // Functions
    resetForm,
    submitWeddingBooking,
  }
}
