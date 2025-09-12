import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThanksGivingStore } from '@/stores/thanksGivingBookingData.js'

export function useThanksGivingForm() {
  // Router for navigation
  const router = useRouter()

  // Form interaction tracking
  const formTouched = ref(false)

  // Form validation rules
  const titleRules = [(v) => !!v || 'Title is required']
  const organizerRules = [(v) => !!v || 'Organizer is required']
  const dateRules = [(v) => !!v || 'Date is required']
  const timeRules = [(v) => !!v || 'Time is required']

  // Form data state
  const formData = ref({
    title: '',
    organizer: '',
    thanksgiving_date: '',
    starting_time: '',
    ending_time: '',
  })

  // Store references
  const thanksGivingStore = useThanksGivingStore()
  const formAction = thanksGivingStore.formAction

  // Form validation computed
  const isFormValid = computed(() => {
    return formData.value.title &&
           formData.value.organizer &&
           formData.value.thanksgiving_date &&
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
      organizer: '',
      thanksgiving_date: '',
      starting_time: '',
      ending_time: '',
    }
    formTouched.value = false
  }

  // Submit thanksgiving booking function
  const submitThanksGivingBooking = async (refVform) => {
    // Mark form as touched para ma-show ang validation
    formTouched.value = true

    // Validate na naka-complete na ang form
    if (!isFormValid.value) {
      return false
    }

    const payload = {
      title: formData.value.title,
      organizer: formData.value.organizer,
      thanksgiving_date: formData.value.thanksgiving_date,
      starting_time: formData.value.starting_time,
      ending_time: formData.value.ending_time,
    }

    // Insert the thanksgiving booking
    const insertSuccess = await thanksGivingStore.createThanksGiving(payload)
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
    titleRules,
    organizerRules,
    dateRules,
    timeRules,

    // Computed
    isFormValid,
    showValidationWarning,

    // Functions
    resetForm,
    submitThanksGivingBooking,
  }
}
