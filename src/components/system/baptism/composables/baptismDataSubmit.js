import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBaptismStore } from '@/stores/baptismBookingData.js'

export function useBaptismForm() {
  // Router for navigation
  const router = useRouter()

  // Form interaction tracking
  const formTouched = ref(false)

  // Form validation rules
  const nameRules = [(v) => !!v || 'This field is required']
  const dateRules = [(v) => !!v || 'Date is required']
  const timeRules = [(v) => !!v || 'Time is required']

  // Form data state
  const formData = ref({
    child_firstname: '',
    child_lastname: '',
    baptism_date: '',
    starting_time: '',
    ending_time: '',
  })

  // Store references
  const baptismStore = useBaptismStore()
  const formAction = baptismStore.formAction

  // Form validation computed
  const isFormValid = computed(() => {
    return formData.value.child_firstname &&
           formData.value.child_lastname &&
           formData.value.baptism_date &&
           formData.value.starting_time &&
           formData.value.ending_time
  })

  // Show validation warnings based on touch interaction
  const showValidationWarning = computed(() => {
    return formTouched.value && !isFormValid.value
  })

  // Reset form state
  const resetForm = () => {
    formData.value = {
      child_firstname: '',
      child_lastname: '',
      baptism_date: '',
      starting_time: '',
      ending_time: '',
    }
    formTouched.value = false
  }

  // Submit baptism booking function
  const submitBaptismBooking = async (refVform) => {
    // Mark form as touched para ma-show ang validation
    formTouched.value = true

    // Validate na naka-complete na ang form
    if (!isFormValid.value) {
      return false
    }

    const payload = {
      child_firstname: formData.value.child_firstname,
      child_lastname: formData.value.child_lastname,
      baptism_date: formData.value.baptism_date,
      starting_time: formData.value.starting_time,
      ending_time: formData.value.ending_time,
    }

    // Insert the baptism booking
    const insertSuccess = await baptismStore.createBaptism(payload)
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
    timeRules,

    // Computed
    isFormValid,
    showValidationWarning,

    // Functions
    resetForm,
    submitBaptismBooking,
  }
}
