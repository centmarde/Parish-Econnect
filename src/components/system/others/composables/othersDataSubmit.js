import { ref, computed } from 'vue'
import { useOtherStore } from '@/stores/otherData'

export function useOthersForm() {
  // Form interaction tracking
  const formTouched = ref(false)

  // Form validation rules
  const nameRules = [(v) => !!v || 'This field is required']
  const dateRules = [(v) => !!v || 'Date is required']
  const timeRules = [(v) => !!v || 'Time is required']

  // Form data state
  const formData = ref({
    title: '',
    description: '',
    date: '',
    starting_time: '',
    ending_time: '',
  })

  // Store references
  const otherStore = useOtherStore()
  const formAction = ref({
    formProcess: false,
    formSuccessMessage: '',
    formErrorMessage: '',
  })

  // Form validation computed
  const isFormValid = computed(() => {
    return formData.value.title &&
           formData.value.description &&
           formData.value.date &&
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
      title: '',
      description: '',
      date: '',
      starting_time: '',
      ending_time: '',
    }
    formTouched.value = false
  }

  // Submit others booking function
  const submitOthersBooking = async (refVform) => {
    // Mark form as touched para ma-show ang validation
    formTouched.value = true

    // Validate na naka-complete na ang form
    if (!isFormValid.value) {
      return false
    }

    formAction.value.formProcess = true
    formAction.value.formErrorMessage = ''

    const payload = {
      title: formData.value.title,
      description: formData.value.description,
      date: formData.value.date,
      starting_time: formData.value.starting_time,
      ending_time: formData.value.ending_time,
      is_approved: false,
      is_denied: false,
    }

    try {
      // Insert the booking
      await otherStore.create(payload)

      formAction.value.formSuccessMessage = 'Your booking request has been submitted successfully!'

      // Reset form after successful submission
      refVform?.value?.reset()
      resetForm()

      formAction.value.formProcess = false
      return true
    } catch (error) {
      formAction.value.formErrorMessage = error.message || 'Failed to submit booking request'
      formAction.value.formProcess = false
      return false
    }
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
    submitOthersBooking,
    resetForm,
  }
}
