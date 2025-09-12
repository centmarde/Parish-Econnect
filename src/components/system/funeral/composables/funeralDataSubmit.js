import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFuneralStore } from '@/stores/funeralBookingData.js'

export function useFuneralForm() {
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
    deceased_firstname: '',
    deceased_lastname: '',
    funeral_date: '',
    starting_time: '',
    ending_time: '',
  })

  // Store references
  const funeralStore = useFuneralStore()
  const formAction = funeralStore.formAction

  // Form validation computed
  const isFormValid = computed(() => {
    return formData.value.deceased_firstname &&
           formData.value.deceased_lastname &&
           formData.value.funeral_date &&
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
      deceased_firstname: '',
      deceased_lastname: '',
      funeral_date: '',
      starting_time: '',
      ending_time: '',
    }
    formTouched.value = false
  }

  // Submit funeral booking function
  const submitFuneralBooking = async (refVform) => {
    // Mark form as touched para ma-show ang validation
    formTouched.value = true

    // Validate na naka-complete na ang form
    if (!isFormValid.value) {
      return false
    }

    const payload = {
      deceased_firstname: formData.value.deceased_firstname,
      deceased_lastname: formData.value.deceased_lastname,
      funeral_date: formData.value.funeral_date,
      starting_time: formData.value.starting_time,
      ending_time: formData.value.ending_time,
    }

    // Insert the funeral booking
    const insertSuccess = await funeralStore.createFuneral(payload)
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
    submitFuneralBooking,
  }
}
